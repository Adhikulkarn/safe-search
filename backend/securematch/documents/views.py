import time
from datetime import timedelta
from django.utils import timezone

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
from .utils import success_response, error_response


MAX_EXTERNAL_RESULTS = 50
MAX_INTERNAL_RESULTS = 50


# ---------------------------------------------------
#  Upload & Index
# ---------------------------------------------------

class UploadDocumentView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "upload"

    def post(self, request):
        try:
            data = request.data

            if not isinstance(data, dict):
                return Response(
                    error_response("INVALID_JSON", "Invalid JSON object"),
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
                success_response(
                    data={"message": "Document encrypted and indexed"}
                ),
                status=status.HTTP_201_CREATED
            )

        except Exception:
            return Response(
                error_response("UPLOAD_FAILED", "Upload failed"),
                status=status.HTTP_400_BAD_REQUEST
            )


# ---------------------------------------------------
#  Internal Secure Search (SSE)
# ---------------------------------------------------

class InternalSearchView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "search"

    def post(self, request):
        try:
            query_data = request.data

            if not isinstance(query_data, dict) or not query_data:
                return Response(
                    error_response("INVALID_QUERY", "Invalid search query"),
                    status=status.HTTP_400_BAD_REQUEST
                )

            start_time = time.perf_counter()
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
                execution_time = round((time.perf_counter() - start_time) * 1000, 2)

                return Response(
                    success_response(
                        data={"results": []},
                        meta={
                            "total_matches": 0,
                            "returned_count": 0,
                            "truncated": False,
                            "execution_time_ms": execution_time
                        }
                    ),
                    status=status.HTTP_200_OK
                )

            total_matches = len(matching_doc_ids)
            truncated = total_matches > MAX_INTERNAL_RESULTS

            limited_ids = list(matching_doc_ids)[:MAX_INTERNAL_RESULTS]

            encrypted_docs = EncryptedDocument.objects.filter(
                id__in=limited_ids
            )

            results = [
                decrypt_document(doc.encrypted_blob)
                for doc in encrypted_docs
            ]

            execution_time = round((time.perf_counter() - start_time) * 1000, 2)

            return Response(
                success_response(
                    data={"results": results},
                    meta={
                        "total_matches": total_matches,
                        "returned_count": len(results),
                        "truncated": truncated,
                        "execution_time_ms": execution_time
                    }
                ),
                status=status.HTTP_200_OK
            )

        except Exception:
            return Response(
                error_response("INTERNAL_SEARCH_FAILED", "Search failed"),
                status=status.HTTP_400_BAD_REQUEST
            )


# ---------------------------------------------------
#  External Public-Key Search (Hardened)
# ---------------------------------------------------

class ExternalSearchView(APIView):

    def post(self, request):
        total_start = time.perf_counter()

        auditor_id = request.data.get("auditor_id")
        keyword_hash = request.data.get("keyword_hash")
        signature = request.data.get("signature")

        if not auditor_id or not keyword_hash or not signature:
            return Response(
                error_response("MISSING_FIELDS", "Required fields missing"),
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            auditor = Auditor.objects.get(id=auditor_id)
        except Auditor.DoesNotExist:
            return Response(
                error_response("AUDITOR_NOT_FOUND", "Auditor not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        # Signature Verification
        verify_start = time.perf_counter()
        is_valid = verify_signature(
            keyword_hash,
            signature,
            auditor.public_key
        )
        verify_time = (time.perf_counter() - verify_start) * 1000

        if not is_valid:
            ExternalSearchAudit.objects.create(
                auditor=auditor,
                keyword_hash=keyword_hash,
                total_matches=0,
                returned_count=0,
                truncated=False,
                execution_time_ms=round(
                    (time.perf_counter() - total_start) * 1000, 2
                ),
                success=False,
                key_version=getattr(auditor, "key_version", 1)
            )

            return Response(
                error_response("INVALID_SIGNATURE", "Signature verification failed"),
                status=status.HTTP_403_FORBIDDEN
            )

        # Fetch Matches
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

        # RESULT PADDING (Fixed Size)
        if len(encrypted_results) < MAX_EXTERNAL_RESULTS:
            padding_needed = MAX_EXTERNAL_RESULTS - len(encrypted_results)

            for _ in range(padding_needed):
                encrypted_results.append({
                    "nonce": "0" * 24,
                    "ciphertext": "0" * 64,
                    "padded": True
                })

        total_time = (time.perf_counter() - total_start) * 1000

        # Frequency Monitoring
        one_hour_ago = timezone.now() - timedelta(hours=1)

        recent_search_count = ExternalSearchAudit.objects.filter(
            auditor=auditor,
            created_at__gte=one_hour_ago
        ).count()

        # Audit Log
        audit_entry = ExternalSearchAudit.objects.create(
            auditor=auditor,
            keyword_hash=keyword_hash,
            total_matches=total_matches,
            returned_count=min(total_matches, MAX_EXTERNAL_RESULTS),
            truncated=total_matches > MAX_EXTERNAL_RESULTS,
            execution_time_ms=round(total_time, 2),
            success=True,
            key_version=getattr(auditor, "key_version", 1)
        )

        return Response(
            success_response(
                data={
                    "results": encrypted_results
                },
                meta={
                    "total_matches": total_matches,
                    "returned_count": min(total_matches, MAX_EXTERNAL_RESULTS),
                    "truncated": total_matches > MAX_EXTERNAL_RESULTS,
                    "execution_time_ms": round(total_time, 2),
                    "signature_verification_ms": round(verify_time, 2),
                    "audit_log_id": audit_entry.id,
                    "searches_last_hour": recent_search_count,
                    "key_version_used": getattr(auditor, "key_version", 1),
                    "response_padded": total_matches < MAX_EXTERNAL_RESULTS
                }
            ),
            status=status.HTTP_200_OK
        )