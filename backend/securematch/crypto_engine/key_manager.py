# crypto_engine/key_manager.py

import os
import base64
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

def load_master_key():
    master_key_b64 = os.getenv("MASTER_KEY")

    if not master_key_b64:
        raise ValueError("MASTER_KEY not found in environment")

    master_key = base64.b64decode(master_key_b64)

    if len(master_key) != 32:
        raise ValueError("MASTER_KEY must decode to 32 bytes")

    return master_key


def derive_keys(master_key: bytes):
    """
    Derive two 32-byte subkeys:
    - AES key
    - HMAC key
    """

    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=64,  # 32 + 32
        salt=None,
        info=b"sse-key-derivation",
        backend=default_backend()
    )

    derived = hkdf.derive(master_key)

    aes_key = derived[:32]
    hmac_key = derived[32:]

    return aes_key, hmac_key