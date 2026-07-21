# safe-search

Short summary
-------------

`safe-search` is a reference implementation of a privacy-preserving encrypted search system.
It demonstrates two complementary search approaches:

- SSE (Symmetric Searchable Encryption) for internal authenticated analysts (AES-256-GCM + HMAC-based tokens).
- A PEKS-like external auditor flow using RSA signatures for auditor verification and padded encrypted result sets.

Repository layout
-----------------

- `backend/` — Django REST API (project: `securematch`) implementing storage, indexing, SSE search, PEKS external search, and Compliance Officer portal APIs.
  - Models: `EncryptedDocument`, `SearchTokenIndex`, `Auditor`, `ExternalSearchAudit`, `SystemAuditLog` (`backend/securematch/documents/models.py`).
  - Views / API endpoints: mounted under `/api/` via `backend/securematch/securematch/urls.py`, `documents/urls.py`, `accounts/urls.py`.
  - Crypto helpers (SSE & PEKS-like): `backend/securematch/crypto_engine/` (`sse.py`, `peks.py`, `key_manager.py`).
- `frontend/` — React + Vite single-page app with role-based dashboards (Administrator, Internal Analyst, Compliance Officer, External Auditor).
- Documentation `.md` files — All project documentation files (`README.md`, `API_DOCUMENTATION.md`, `CURRENT_STATUS.md`, `authentication.md`, `filestructure.md`, `presentation.md`, `summary.md`, `AGENTS.md`) are placed at the repository root.

Key backend API endpoints (path -> HTTP method)
----------------------------------------------
All endpoints are mounted under the `/api/` prefix.

- `auth/login/` -> POST : JWT authentication returning access & refresh tokens.
- `upload/` -> POST : upload and AES-GCM encrypt a document and index searchable tokens.
- `search/internal/` -> POST : internal SSE search (trapdoor/HMAC tokens) — returns decrypted results.
- `search/external/` -> POST : external auditor search — verifies RSA signature, returns padded encrypted results.
- `auditors/` -> GET / POST : list/create external auditor identities.
- `auditors/<auditor_id>/rotate-key/` -> POST : rotate/generate a new keypair for an auditor.
- `auditors/<auditor_id>/logs/` -> GET : list recent external search audit entries for an auditor.
- `compliance/dashboard/` -> GET : compliance officer overview stats and recent event streams.
- `compliance/audit-logs/` -> GET : system audit logs (auto-retains 3 pages / 45 items max; loads all 3 pages upfront for instant local pagination).
- `compliance/export-logs/` -> GET : export compliance audit logs in CSV, Excel, or PDF format.
- `metrics/internal/` -> GET : internal system metrics + auditor list.

Compliance Audit Logs & Auto-Retention Policy
---------------------------------------------
- **Model**: `SystemAuditLog` records all system activities, compliance actions, authentication events, and governance checks.
- **3-Page Capacity Limit**: The backend strictly caps audit log storage to 3 pages worth of data (45 records max, 15 items per page).
- **Automated FIFO Deletion**: A Django `post_save` signal and helper `prune_old_audit_logs()` automatically delete the oldest records as soon as total logs exceed 45.
- **Upfront Loading**: `GET /api/compliance/audit-logs/` returns all 3 pages worth of data (45 items) in the initial response payload (`all_results`), allowing instant 0ms client-side page switching ("Next" / "Previous").

Database models
---------------
- `EncryptedDocument` — stores encrypted blob (nonce + ciphertext + AES-GCM metadata).
- `SearchTokenIndex` — stores internal HMAC tokens and external deterministic hashes mapping to documents.
- `Auditor` — stores auditor metadata, public key, and active key version.
- `ExternalSearchAudit` — records each external search request outcome, timings, and RSA signature verification results.
- `SystemAuditLog` — records system activity, user/IP metadata, endpoint, execution status, and severity (auto-pruned to 45 records).

Frontend integration
--------------------
- The frontend uses `frontend/src/services/api.js` to centralize the backend base URL.
- Role-based views exist for **Administrator**, **Internal Analyst**, **Compliance Officer**, and **External Auditor**.
- To run the frontend locally:

  ```bash
  cd frontend
  npm install
  npm run dev
  ```

Running the backend (local)
--------------------------
1. Create and activate a Python venv and install requirements:

	```bash
	cd backend
	python -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt
	```

2. Provide a `MASTER_KEY` env var (base64 -> 32 bytes). Example (generate and export locally):

	```bash
	python - <<'PY'
	import os, base64
	print(base64.b64encode(os.urandom(32)).decode())
	PY
	export MASTER_KEY="<paste-the-generated-value>"
	```

3. Apply migrations and run dev server / test suite:

	```bash
	cd backend/securematch
	python manage.py migrate
	python manage.py test documents.test_compliance
	python manage.py runserver
	```

Root Documentation Files
------------------------
- `README.md` — Main project overview, architecture, quickstart, and deployment guide.
- `AGENTS.md` — Developer/agent instructions, testing gotchas, and repository layout.
- `API_DOCUMENTATION.md` — Full API reference for Auth, Documents, Auditors, and Compliance endpoints.
- `CURRENT_STATUS.md` — Phase-by-phase implementation matrix and system readiness status.
- `authentication.md` — Deep dive into JWT authentication, RBAC, and PEKS RSA signature verification.
- `filestructure.md` — Comprehensive directory structure and file layout documentation.
- `presentation.md` — Executive presentation document, slide breakdown, and architecture notes.
- `summary.md` — Complete system design overview and technical summary.

