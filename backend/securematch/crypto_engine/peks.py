import hashlib
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature


# --------------------------------------------------
# 🔑 Key Generation
# --------------------------------------------------

def generate_keypair():
    """
    Generate RSA 2048-bit keypair.
    Returns (private_pem, public_pem).
    """

    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    return private_pem.decode(), public_pem.decode()


# --------------------------------------------------
# 🔎 Deterministic Keyword Hash
# --------------------------------------------------

def hash_keyword(value: str) -> str:
    """
    Deterministic SHA256 hash of normalized keyword.
    """

    normalized = value.strip().lower()
    return hashlib.sha256(normalized.encode()).hexdigest()


# --------------------------------------------------
# 🔐 Generate Trapdoor (Private Key Side)
# --------------------------------------------------

def generate_trapdoor_private(value: str, private_pem: str):
    """
    Generates:
    - keyword_hash
    - signature(private_key, keyword_hash)
    """

    keyword_hash = hash_keyword(value)

    private_key = serialization.load_pem_private_key(
        private_pem.encode(),
        password=None,
        backend=default_backend()
    )

    signature = private_key.sign(
        keyword_hash.encode(),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    return keyword_hash, signature.hex()


# --------------------------------------------------
# ✅ Verify Trapdoor (Public Key Side)
# --------------------------------------------------

def verify_signature(keyword_hash: str, signature_hex: str, public_pem: str) -> bool:
    """
    Verifies trapdoor signature using auditor's public key.
    """

    try:
        public_key = serialization.load_pem_public_key(
            public_pem.encode(),
            backend=default_backend()
        )

        public_key.verify(
            bytes.fromhex(signature_hex),
            keyword_hash.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )

        return True

    except InvalidSignature:
        return False

    except Exception:
        return False