import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle

from crypto_engine.sse import (
    encrypt_document,
    generate_token,
    generate_trapdoor,
    decrypt_document
)

from .models import EncryptedDocument, SearchTokenIndex
from .constants import SEARCHABLE_FIELDS


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

            # 1️⃣ Encrypt entire record
            encrypted_blob = encrypt_document(data)

            doc = EncryptedDocument.objects.create(
                encrypted_blob=encrypted_blob
            )

            # 2️⃣ Controlled field tokenization
            for field in SEARCHABLE_FIELDS:
                if field in data and data[field] is not None:

                    value = str(data[field]).strip()
                    if not value:
                        continue

                    token = generate_token(field, value)

                    SearchTokenIndex.objects.create(
                        token=token,
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

            # 1️⃣ Generate trapdoors + intersect IDs
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

            # 2️⃣ Apply hard cap
            MAX_RESULTS = 50

            total_matches = len(matching_doc_ids)
            truncated = total_matches > MAX_RESULTS

            limited_ids = list(matching_doc_ids)[:MAX_RESULTS]

            encrypted_docs = EncryptedDocument.objects.filter(
                id__in=limited_ids
            )

            # 3️⃣ Decrypt only limited results
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