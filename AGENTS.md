# AGENTS.md

## Project overview

Privacy-preserving encrypted search system. Django REST backend (`securematch`) + React/Vite frontend. Implements SSE (Symmetric Searchable Encryption) for internal analysts and a PEKS-like flow for external auditor verification.

## Repository layout

- `backend/securematch/` — Django project. **CWD for all backend commands is `backend/securematch/`, not `backend/`.**
  - `documents/` — main app: models, views, serializers, compliance views
  - `crypto_engine/` — SSE (`sse.py`), PEKS (`peks.py`), key derivation (`key_manager.py`)
  - `accounts/` — custom User model, JWT auth, RBAC permissions
  - `securematch/settings.py` — loads `.env` from `backend/.env` (one directory up from settings)
- `frontend/` — React + Vite + Tailwind CSS v4 SPA
  - `src/services/api.js` — Axios base; auto-selects local (`:8000`) vs prod (`safe-search-e9jp.onrender.com`) by hostname
  - `src/services/` — one file per backend domain (upload, search, auditor, auth, etc.)

## Commands

### Backend (from `backend/securematch/`)

```bash
python manage.py test              # runs all apps; uses SQLite in-memory (not PostgreSQL)
python manage.py test documents    # single app
python manage.py test documents.tests.TestClassName   # single test class
python manage.py runserver         # starts dev server on :8000
python manage.py migrate           # apply migrations (uses PostgreSQL from .env outside test)
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # Vite dev server on :5173
npm run build   # production build
npm run lint    # ESLint
```

## Key gotchas

- **Database in tests**: `settings.py` switches to SQLite in-memory when `"test"` is in `sys.argv`. PostgreSQL is only used outside tests. Do not assume Postgres features in test code.
- **`.env` path**: Settings loads from `backend/.env` (parent of `securematch/`). The `.env` contains real credentials — never commit or log these values.
- **`MASTER_KEY` env var**: Required at runtime for crypto operations. Must be a base64 string decoding to 32 bytes. Only needed for live server, not for unit tests (crypto_engine tests mock it).
- **Vite 8 beta**: `package.json` pins `vite@^8.0.0-beta.13` with an `overrides` block. Do not upgrade Vite without checking plugin compatibility.
- **Tailwind CSS v4**: Uses `@tailwindcss/vite` plugin (not PostCSS). Config is in `vite.config.js`, not a tailwind config file.
- **`test` file at repo root**: This is a PEM private key for testing auditor signatures — it is not a test directory.
- **CORS**: Allows `localhost:5173`, `127.0.0.1:5173`, and `*.vercel.app` by default. New origins go in `settings.py` `DEFAULT_CORS_ALLOWED_ORIGINS`.

## Architecture notes

- Auth: JWT via `djangorestframework-simplejwt`. Access tokens live 15 min, refresh tokens 7 days with rotation.
- RBAC: Custom permissions in `accounts/permissions.py`. Roles defined in frontend `src/constants/roles.js`.
- Compliance & Governance: `SystemAuditLog` auto-retains 3 pages worth of data (45 records max, 15 items per page) with FIFO auto-pruning via model `post_save` signals and `prune_old_audit_logs()`. Audit logs load all 3 pages upfront for instant client-side pagination.
- Two parallel auditor URL patterns exist: legacy `/api/auditor/...` and RESTful `/api/auditors/...`. Both are active.
- Rate limiting is scoped: search (10/min), upload (200/min), login (5/min).
- Frontend auto-refreshes expired JWTs via Axios interceptor in `api.js` with a request queue.

## Project Documentation Index (Root Directory)

- `README.md` — Main project overview, architecture, quickstart, and deployment guide.
- `AGENTS.md` — Developer and agent instructions, gotchas, testing, and repository notes.
- `API_DOCUMENTATION.md` — Complete REST API reference for Auth, Documents, Auditors, and Compliance endpoints.
- `CURRENT_STATUS.md` — Phase-by-phase feature implementation matrix and capability status.
- `authentication.md` — Deep dive into JWT auth, PEKS RSA signature verification, and RBAC permissions.
- `filestructure.md` — Detailed file structure layout and directory mappings.
- `presentation.md` — Comprehensive executive summary, system architecture deck, and business presentation.
- `summary.md` — Architectural overview and system design summary.

## Deployment

- **Backend**: Render (Docker). Config in `render.yaml`. Entrypoint runs `migrate` then `gunicorn`.
- **Frontend**: Vercel. Config in `frontend/vercel.json`.
- **No CI/CD pipelines** or pre-commit hooks in the repo.

## Testing notes

- Uses Django's built-in test runner (`manage.py test`), not pytest.
- Tests exist in `documents/tests.py`, `documents/test_compliance.py`, `crypto_engine/tests.py`, `accounts/tests.py`.
- Run compliance tests via: `python manage.py test documents.test_compliance`.
- No test fixtures directory — tests create data inline.

