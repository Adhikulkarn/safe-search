import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle

from crypto_engine.peks import hash_keyword, verify_signature
from crypto_engine.sse import (
    encrypt_document,
    generate_token,
    generate_trapdoor,
    decrypt_document
)

from documents.models import (
    Auditor,
    EncryptedDocument,
    SearchTokenIndex,
    ExternalSearchAudit
)

from .constants import SEARCHABLE_FIELDS


MAX_EXTERNAL_RESULTS = 50


# ---------------------------------------------------
# 📂 PHASE 2 — Upload & Index
# ---------------------------------------------------

class UploadDocumentView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "upload"

    def post(self, request):
        try:
            data = request.data

            if not isinstance(data, dict):
                return Response(
                    {"error": "Invalid JSON object"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            encrypted_blob = encrypt_document(data)

            doc = EncryptedDocument.objects.create(
                encrypted_blob=encrypted_blob
            )

            for field in SEARCHABLE_FIELDS:
                if field in data and data[field] is not None:

                    value = str(data[field]).strip()
                    if not value:
                        continue

                    token = generate_token(field, value)
                    external_token = hash_keyword(value)

                    SearchTokenIndex.objects.create(
                        token=token,
                        external_token=external_token,
                        document=doc
                    )

            return Response(
                {"message": "Document encrypted and indexed"},
                status=status.HTTP_201_CREATED
            )

        except Exception:
            return Response(
                {"error": "Upload failed"},
                status=status.HTTP_400_BAD_REQUEST
            )


# ---------------------------------------------------
# 🔎 PHASE 3 — Internal Secure Search (SSE)
# ---------------------------------------------------

class InternalSearchView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "search"

    def post(self, request):
        try:
            query_data = request.data

            if not isinstance(query_data, dict) or not query_data:
                return Response(
                    {"error": "Invalid search query"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            start_time = time.time()
            matching_doc_ids = None

            for field, value in query_data.items():
                trapdoor = generate_trapdoor(field, str(value))

                token_matches = SearchTokenIndex.objects.filter(
                    token=trapdoor
                ).values_list("document_id", flat=True)

                token_doc_ids = set(token_matches)

                if matching_doc_ids is None:
                    matching_doc_ids = token_doc_ids
                else:
                    matching_doc_ids = matching_doc_ids.intersection(token_doc_ids)

            if not matching_doc_ids:
                execution_time = round((time.time() - start_time) * 1000, 2)
                return Response(
                    {
                        "results": [],
                        "total_matches": 0,
                        "returned_count": 0,
                        "truncated": False,
                        "execution_time_ms": execution_time
                    },
                    status=status.HTTP_200_OK
                )

            MAX_RESULTS = 50
            total_matches = len(matching_doc_ids)
            truncated = total_matches > MAX_RESULTS

            limited_ids = list(matching_doc_ids)[:MAX_RESULTS]

            encrypted_docs = EncryptedDocument.objects.filter(
                id__in=limited_ids
            )

            results = [
                decrypt_document(doc.encrypted_blob)
                for doc in encrypted_docs
            ]

            execution_time = round((time.time() - start_time) * 1000, 2)

            return Response(
                {
                    "results": results,
                    "total_matches": total_matches,
                    "returned_count": len(results),
                    "truncated": truncated,
                    "execution_time_ms": execution_time
                },
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                {"error": "Search failed"},
                status=status.HTTP_400_BAD_REQUEST
            )


# ---------------------------------------------------
# 🔑 PHASE 4 — External Public-Key Search
# ---------------------------------------------------

class ExternalSearchView(APIView):

    def post(self, request):
        total_start = time.perf_counter()

        auditor_id = request.data.get("auditor_id")
        keyword_hash = request.data.get("keyword_hash")
        signature = request.data.get("signature")

        if not auditor_id or not keyword_hash or not signature:
            return Response(
                {"error": "Missing required fields"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                {"error": "Auditor not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔐 Signature verification
        verify_start = time.perf_counter()
        is_valid = verify_signature(
            keyword_hash,
            signature,
            auditor.public_key
        )
        verify_time = (time.perf_counter() - verify_start) * 1000

        if not is_valid:
            # 🔎 Log failed attempt
            ExternalSearchAudit.objects.create(
                auditor=auditor,
                keyword_hash=keyword_hash,
                total_matches=0,
                returned_count=0,
                truncated=False,
                execution_time_ms=round(
                    (time.perf_counter() - total_start) * 1000, 2
                ),
                success=False
            )

            return Response(
                {"error": "Invalid signature"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 🗄 Fetch matches
        matches = SearchTokenIndex.objects.filter(
            external_token=keyword_hash
        ).select_related("document")

        total_matches = matches.count()
        limited_matches = matches[:MAX_EXTERNAL_RESULTS]

        encrypted_results = [
            {
                "nonce": m.document.encrypted_blob["nonce"],
                "ciphertext": m.document.encrypted_blob["ciphertext"]
            }
            for m in limited_matches
        ]

        total_time = (time.perf_counter() - total_start) * 1000

        # 📜 Log successful search
        audit_entry = ExternalSearchAudit.objects.create(
            auditor=auditor,
            keyword_hash=keyword_hash,
            total_matches=total_matches,
            returned_count=len(encrypted_results),
            truncated=total_matches > MAX_EXTERNAL_RESULTS,
            execution_time_ms=round(total_time, 2),
            success=True
        )

        return Response({
            "results": encrypted_results,
            "total_matches": total_matches,
            "returned_count": len(encrypted_results),
            "truncated": total_matches > MAX_EXTERNAL_RESULTS,
            "performance": {
                "signature_verification_ms": round(verify_time, 2),
                "total_execution_ms": round(total_time, 2)
            },
            "audit": {
                "log_id": audit_entry.id,
                "timestamp": audit_entry.created_at,
                "success": audit_entry.success
            }
        })