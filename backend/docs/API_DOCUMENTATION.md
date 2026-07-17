# SecureMatch API Documentation

Generated from the Django REST Framework source in `securematch/`.

## Scope and Source Files

First-party files inspected:

- `securematch/securematch/urls.py`
- `securematch/accounts/urls.py`
- `securematch/accounts/views.py`
- `securematch/accounts/serializers.py`
- `securematch/accounts/models.py`
- `securematch/accounts/permissions.py`
- `securematch/documents/urls.py`
- `securematch/documents/views.py`
- `securematch/documents/serializers.py`
- `securematch/documents/models.py`
- `securematch/crypto_engine/views.py`
- `securematch/crypto_engine/models.py`

No first-party `viewsets.py`, `authentication.py`, or `filters.py` files are present. The project uses DRF `APIView` classes, Simple JWT authentication, and manual query filtering in views.

## Project Architecture Overview

SecureMatch is a Django project with three first-party apps:

- `accounts`: custom user model, JWT login/logout/current-user/password APIs, user administration, role helpers, and permission classes.
- `documents`: encrypted document ingestion, internal search, external auditor search, auditor management, metrics, credential PDFs, and audit-log PDFs.
- `crypto_engine`: cryptographic helpers for AES-GCM encryption, HMAC search tokens, RSA key generation, keyword hashing, and signature verification. Its Django `models.py` and `views.py` are stubs and expose no endpoints.

Top-level URL routing:

- `/api/auth/` includes `accounts.urls`
- `/api/users/` and `/api/users/<int:pk>/` map directly to account administration views
- `/api/` includes `documents.urls`
- `/admin/` is Django admin, not documented as a REST API endpoint

## Authentication Flow

The API uses `rest_framework_simplejwt.authentication.JWTAuthentication` as the default authentication class.

1. Client calls `POST /api/auth/login/` with `username` and `password`.
2. Server authenticates with Django `authenticate`.
3. Server returns `access`, `refresh`, and serialized user details.
4. Client sends protected requests with:

```http
Authorization: Bearer <access_token>
```

5. Access tokens expire after 15 minutes.
6. Refresh tokens expire after 7 days.
7. `POST /api/auth/refresh/` rotates refresh tokens because `ROTATE_REFRESH_TOKENS=True`.
8. `POST /api/auth/logout/` blacklists a refresh token.

Default protected-endpoint errors are formatted by `accounts.exception_handler.custom_exception_handler`:

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication credentials were not provided or are invalid.",
    "details": {}
  }
}
```

## Response Envelope

Most custom views use:

```json
{
  "status": "success",
  "data": {},
  "meta": {}
}
```

Errors generally use:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

`InternalMetricsView` and `ExternalMetricsView` return a simpler `{"data": ...}` response rather than the standard envelope.

## Roles

Roles are derived from the user's primary Django group. Superusers resolve to `Administrator`.

- `Administrator`
- `Internal Analyst`
- `Compliance Officer`
- `External Auditor`
- `Read Only Analyst`
- `No Role Assigned`

## Endpoint Summary Table

| Method | URL | View | Auth | Roles / Permissions |
|---|---|---|---|---|
| GET | `/api/health/` | `HealthCheckView` | No | Public |
| POST | `/api/auth/login/` | `LoginView` | No | Public |
| POST | `/api/auth/logout/` | `LogoutView` | Yes | Authenticated |
| POST | `/api/auth/refresh/` | Simple JWT `TokenRefreshView` | No | Public refresh-token endpoint |
| GET | `/api/auth/me/` | `CurrentUserView` | Yes | Authenticated |
| POST | `/api/auth/change-password/` | `ChangePasswordView` | Yes | Authenticated |
| GET | `/api/users/` | `UserManagementView` | Yes | Administrator |
| POST | `/api/users/` | `UserManagementView` | Yes | Administrator |
| GET | `/api/users/<pk>/` | `UserDetailView` | Yes | Administrator |
| PATCH | `/api/users/<pk>/` | `UserDetailView` | Yes | Administrator |
| DELETE | `/api/users/<pk>/` | `UserDetailView` | Yes | Administrator |
| POST | `/api/upload/` | `UploadDocumentView` | Yes | Administrator or Internal Analyst |
| POST | `/api/search/internal/` | `InternalSearchView` | Yes | Internal user or Read Only Analyst |
| POST | `/api/search/external/` | `ExternalSearchView` | Yes | External Auditor or Administrator |
| POST | `/api/auditor/verify/` | `VerifyAuditorCredentialsView` | Yes | External Auditor or Administrator |
| POST | `/api/auditor/rotate-key/` | `RotateAuditorKeyView` | Yes | Administrator |
| GET | `/api/auditor/<auditor_id>/logs/` | `AuditorLogsView` | Yes | Administrator or Compliance Officer |
| GET | `/api/auditor/<auditor_id>/logs/download/` | `DownloadAuditorLogsPdfView` | Yes | Administrator or Compliance Officer |
| GET | `/api/metrics/internal/` | `InternalMetricsView` | Yes | Administrator or Compliance Officer |
| HEAD | `/api/metrics/internal/` | `InternalMetricsView` | Yes | Administrator or Compliance Officer |
| GET | `/api/metrics/external/` | `ExternalMetricsView` | Yes | Authenticated |
| POST | `/api/auditor/create/` | `CreateAuditorView` | Yes | Administrator |
| DELETE | `/api/auditor/<auditor_id>/delete/` | `DeleteAuditorView` | Yes | Administrator |
| GET | `/api/auditor/<auditor_id>/download/` | `DownloadAuditorCredentialsView` | Yes | Administrator or External Auditor |
| POST | `/api/auditor/<auditor_id>/download/` | `DownloadAuditorCredentialsView` | Yes | Administrator or External Auditor |
| GET | `/api/auditor/<id>/` | `AuditorProfileRetrieveView` | Yes | Administrator or Compliance Officer |
| PATCH | `/api/auditor/<id>/update/` | `AuditorProfileUpdateView` | Yes | Administrator |
| PUT | `/api/auditor/<id>/update/` | `AuditorProfileUpdateView` | Yes | Administrator |
| PATCH | `/api/auditor/<id>/status/` | `AuditorStatusUpdateView` | Yes | Administrator |
| GET | `/api/auditors/` | `AuditorListCreateView` | Yes | Administrator or Compliance Officer |
| POST | `/api/auditors/` | `AuditorListCreateView` | Yes | Administrator |
| GET | `/api/auditors/<id>/` | `AuditorDetailView` | Yes | Administrator or Compliance Officer |
| PATCH | `/api/auditors/<id>/` | `AuditorDetailView` | Yes | Administrator |
| PUT | `/api/auditors/<id>/` | `AuditorDetailView` | Yes | Administrator |
| DELETE | `/api/auditors/<id>/` | `AuditorDetailView` | Yes | Administrator |
| POST | `/api/auditors/<id>/rotate-key/` | `AuditorRotateKeyPathView` | Yes | Administrator |
| GET | `/api/auditors/<id>/credentials/` | `AuditorCredentialsPathView` | Yes | Administrator |

## Endpoint Details

### GET `/api/health/`

- Method: `GET`
- Description: Verifies API and database health with `SELECT 1`.
- Permissions: `AllowAny`
- JWT Authentication: Not required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: None.
- Serializer Fields: None.
- Success Response: `200`, standard success envelope with `status` and `database`.
- Error Responses: `503 DATABASE_UNAVAILABLE`.

Example request:

```http
GET /api/health/
```

Example response:

```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "database": "up"
  },
  "meta": {}
}
```

### POST `/api/auth/login/`

- Method: `POST`
- Description: Authenticates a user and returns JWT tokens plus user information.
- Permissions: Public.
- JWT Authentication: Not required. `authentication_classes=()`.
- Request Body: `LoginSerializer`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `username` and `password` are required; invalid credentials return a generic error; disabled users are rejected.
- Serializer Fields: `username` string required; `password` string required, write-only.
- Success Response: `200`, `access`, `refresh`, and `UserSerializer` data.
- Error Responses: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `403 USER_DISABLED`, `429 TOO_MANY_REQUESTS`.
- Throttle Scope: `login`, configured as `5/minute`.

Example request:

```json
{
  "username": "admin",
  "password": "secret-password"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "access": "eyJ...",
    "refresh": "eyJ...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "Administrator",
      "first_name": "",
      "last_name": "",
      "email": "admin@example.com",
      "date_joined": "2026-07-16T00:00:00Z",
      "is_staff": true,
      "is_superuser": true
    }
  },
  "meta": {}
}
```

### POST `/api/auth/logout/`

- Method: `POST`
- Description: Blacklists a refresh token.
- Permissions: `IsAuthenticated`
- JWT Authentication: Required.
- Request Body: JSON object with `refresh`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `refresh` is required and must be a valid Simple JWT refresh token.
- Serializer Fields: No custom serializer.
- Success Response: `200`, message.
- Error Responses: `400 MISSING_FIELD`, `400 INVALID_TOKEN`, `401 UNAUTHORIZED`.

Example request:

```json
{
  "refresh": "eyJ..."
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "message": "Successfully logged out."
  },
  "meta": {}
}
```

### POST `/api/auth/refresh/`

- Method: `POST`
- Description: Simple JWT token refresh endpoint.
- Permissions: Public endpoint from `rest_framework_simplejwt.views.TokenRefreshView`.
- JWT Authentication: Access token not required; refresh token is required in body.
- Request Body: `{"refresh": "<refresh_token>"}`
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: Refresh token must be valid, unexpired, and not blacklisted.
- Serializer Fields: Simple JWT `TokenRefreshSerializer`: `refresh`; returns `access`, and because refresh rotation is enabled, also a new `refresh`.
- Success Response: `200`.
- Error Responses: `401` for invalid/expired/blacklisted token.

Example request:

```json
{
  "refresh": "eyJ..."
}
```

Example response:

```json
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

### GET `/api/auth/me/`

- Method: `GET`
- Description: Returns the authenticated user's profile.
- Permissions: `IsAuthenticated`
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: Valid access token required.
- Serializer Fields: `UserSerializer`.
- Success Response: `200`, serialized user.
- Error Responses: `401 UNAUTHORIZED`.

Example request:

```http
GET /api/auth/me/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "Administrator",
    "first_name": "",
    "last_name": "",
    "email": "admin@example.com",
    "date_joined": "2026-07-16T00:00:00Z",
    "is_staff": true,
    "is_superuser": true
  },
  "meta": {}
}
```

### POST `/api/auth/change-password/`

- Method: `POST`
- Description: Changes the authenticated user's password after validating the old password and Django password validators.
- Permissions: `IsAuthenticated`
- JWT Authentication: Required.
- Request Body: `ChangePasswordSerializer`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `old_password` and `new_password` required; old password must match; new password cannot equal old password; new password must satisfy Django password validators.
- Serializer Fields: `old_password` write-only string; `new_password` write-only string.
- Success Response: `200`, message.
- Error Responses: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`.

Example request:

```json
{
  "old_password": "old-secret",
  "new_password": "new-strong-secret"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "message": "Password has been changed successfully."
  },
  "meta": {}
}
```

### GET `/api/users/`

- Method: `GET`
- Description: Lists all users ordered by newest `created_at`.
- Permissions: `IsAuthenticated` plus custom administrator check.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: User must have `Administrator` primary role.
- Serializer Fields: Manual response fields: `id`, `username`, `fullName`, `first_name`, `last_name`, `email`, `role`, `status`, `lastLogin`, `created`.
- Success Response: `200`, array of users.
- Error Responses: `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`.

Example request:

```http
GET /api/users/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": [
    {
      "id": 2,
      "username": "analyst1",
      "fullName": "Analyst One",
      "first_name": "Analyst",
      "last_name": "One",
      "email": "analyst@example.com",
      "role": "Internal Analyst",
      "status": "Active",
      "lastLogin": "Never",
      "created": "2026-07-16"
    }
  ],
  "meta": {}
}
```

### POST `/api/users/`

- Method: `POST`
- Description: Creates a non-administrator Django user and assigns a role group.
- Permissions: `IsAuthenticated` plus custom administrator check.
- JWT Authentication: Required.
- Request Body: JSON object.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `username`, `password`, and `role` required; username must be unique; `role` cannot be `Administrator`; `fullName` is split into first and last name.
- Serializer Fields: No custom serializer.
- Success Response: `201`, created user summary.
- Error Responses: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`.

Example request:

```json
{
  "username": "readonly1",
  "fullName": "Read Only",
  "email": "readonly@example.com",
  "password": "TemporarySecret123",
  "role": "Read Only Analyst"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "username": "readonly1",
    "fullName": "Read Only",
    "email": "readonly@example.com",
    "role": "Read Only Analyst",
    "status": "Active",
    "lastLogin": "Never",
    "created": "2026-07-16"
  },
  "meta": {}
}
```

### GET `/api/users/<pk>/`

- Method: `GET`
- Description: Retrieves one user by primary key.
- Permissions: `IsAuthenticated` plus custom administrator check.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `pk` integer user ID.
- Validation Rules: User must exist.
- Serializer Fields: Manual response fields: `id`, `username`, `fullName`, `email`, `role`, `status`, `lastLogin`, `created`.
- Success Response: `200`.
- Error Responses: `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`, `404 NOT_FOUND`.

Example request:

```http
GET /api/users/3/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "username": "readonly1",
    "fullName": "Read Only",
    "email": "readonly@example.com",
    "role": "Read Only Analyst",
    "status": "Active",
    "lastLogin": "Never",
    "created": "2026-07-16"
  },
  "meta": {}
}
```

### PATCH `/api/users/<pk>/`

- Method: `PATCH`
- Description: Updates user profile fields, active status, role, and optionally password.
- Permissions: `IsAuthenticated` plus custom administrator check.
- JWT Authentication: Required.
- Request Body: Optional fields `fullName`, `email`, `status`, `role`, `password`.
- Query Parameters: None.
- Path Parameters: `pk` integer user ID.
- Validation Rules: User must exist; administrator users cannot be modified; role cannot be changed to `Administrator`; `status` value `"Active"` maps to active, any other provided value maps to disabled.
- Serializer Fields: No custom serializer.
- Success Response: `200`, updated user summary.
- Error Responses: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`, `404 NOT_FOUND`.

Example request:

```json
{
  "fullName": "Read Analyst",
  "status": "Disabled",
  "role": "Read Only Analyst"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "username": "readonly1",
    "fullName": "Read Analyst",
    "email": "readonly@example.com",
    "role": "Read Only Analyst",
    "status": "Disabled",
    "lastLogin": "Never",
    "created": "2026-07-16"
  },
  "meta": {}
}
```

### DELETE `/api/users/<pk>/`

- Method: `DELETE`
- Description: Deletes a non-administrator user.
- Permissions: `IsAuthenticated` plus custom administrator check.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `pk` integer user ID.
- Validation Rules: User must exist; administrator users cannot be deleted.
- Serializer Fields: None.
- Success Response: `200`, message.
- Error Responses: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`, `404 NOT_FOUND`.

Example request:

```http
DELETE /api/users/3/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "message": "User deleted successfully."
  },
  "meta": {}
}
```

### POST `/api/upload/`

- Method: `POST`
- Description: Encrypts a JSON document and indexes configured searchable fields.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsInternalAnalyst`.
- JWT Authentication: Required.
- Request Body: JSON object containing arbitrary document fields.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: Body must be a JSON object; searchable fields are `pan`, `compliance_flag`, `name`, `customer_id`, `aadhaar`; empty searchable values are skipped.
- Serializer Fields: No serializer.
- Success Response: `201`, message.
- Error Responses: `400 INVALID_JSON`, `400 UPLOAD_FAILED`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`, `429 TOO_MANY_REQUESTS`.
- Throttle Scope: `upload`, configured as `200/minute`.

Example request:

```json
{
  "customer_id": "CUST-1001",
  "name": "Asha Rao",
  "pan": "ABCDE1234F",
  "aadhaar": "123456789012",
  "compliance_flag": "LOW"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "message": "Document encrypted and indexed"
  },
  "meta": {}
}
```

### POST `/api/search/internal/`

- Method: `POST`
- Description: Performs internal secure search by generating field-bound HMAC trapdoors for each submitted field and decrypting matched documents.
- Permissions: `IsAuthenticated` and `IsInternalUser | IsReadOnlyAnalyst`.
- JWT Authentication: Required.
- Request Body: Non-empty JSON object of field/value pairs.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: Body must be a non-empty JSON object; matching is intersection-based across all submitted fields; maximum returned results is 50.
- Serializer Fields: No serializer.
- Success Response: `200`, decrypted `results` plus match metadata.
- Error Responses: `400 INVALID_QUERY`, `400 INTERNAL_SEARCH_FAILED`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`, `429 TOO_MANY_REQUESTS`.
- Throttle Scope: `search`, configured as `10/minute`.

Example request:

```json
{
  "pan": "ABCDE1234F",
  "compliance_flag": "LOW"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "customer_id": "CUST-1001",
        "name": "Asha Rao",
        "pan": "ABCDE1234F",
        "compliance_flag": "LOW"
      }
    ]
  },
  "meta": {
    "total_matches": 1,
    "returned_count": 1,
    "truncated": false,
    "execution_time_ms": 4.25
  }
}
```

### POST `/api/search/external/`

- Method: `POST`
- Description: Performs public-key verified external search using a keyword hash and RSA-PSS signature. Results are encrypted blobs and padded to 50 entries.
- Permissions: `IsAuthenticated` and `IsExternalAuditor | IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: `auditor_id`, `keyword_hash`, `signature`, optional `key_version`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `auditor_id`, `keyword_hash`, and `signature` required; auditor must exist; provided `key_version` must match current auditor key version; signature must verify against auditor public key; maximum real returned matches is 50.
- Serializer Fields: No serializer.
- Success Response: `200`, encrypted `results` and metadata including audit log ID.
- Error Responses: `400 MISSING_FIELDS`, `403 KEY_VERSION_MISMATCH`, `403 INVALID_SIGNATURE`, `404 AUDITOR_NOT_FOUND`, `401 UNAUTHORIZED`.

Example request:

```json
{
  "auditor_id": 1,
  "key_version": 1,
  "keyword_hash": "b8f1d1baccf3f8d81a...",
  "signature": "7af9..."
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "nonce": "aabbccddeeff001122334455",
        "ciphertext": "001122..."
      },
      {
        "nonce": "000000000000000000000000",
        "ciphertext": "0000000000000000000000000000000000000000000000000000000000000000",
        "padded": true
      }
    ]
  },
  "meta": {
    "total_matches": 1,
    "returned_count": 1,
    "truncated": false,
    "execution_time_ms": 6.32,
    "signature_verification_ms": 1.08,
    "audit_log_id": 12,
    "searches_last_hour": 3,
    "key_version_used": 1,
    "response_padded": true
  }
}
```

### POST `/api/auditor/verify/`

- Method: `POST`
- Description: Verifies that a signature corresponds to the selected auditor's public key using a fixed probe hash.
- Permissions: `IsAuthenticated` and `IsExternalAuditor | IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: `auditor_id`, `signature`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: Required fields must be present; auditor must exist; signature must verify over `sha256("auditor-probe:<auditor.id>")`.
- Serializer Fields: No serializer.
- Success Response: `200`, auditor identity and active key version.
- Error Responses: `400 MISSING_FIELDS`, `403 INVALID_SIGNATURE`, `404 AUDITOR_NOT_FOUND`.

Example request:

```json
{
  "auditor_id": 1,
  "signature": "7af9..."
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "auditor_id": 1,
    "name": "SBI Auditor",
    "active_key_version": 1,
    "created_at": "2026-07-16T00:00:00+00:00"
  },
  "meta": {}
}
```

### POST `/api/auditor/rotate-key/`

- Method: `POST`
- Description: Legacy body-based key rotation endpoint. The effective class is the second `RotateAuditorKeyView` definition in `documents.views`; it generates a new RSA key pair and increments key version.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: `auditor_id`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `auditor_id` required; auditor must exist.
- Serializer Fields: No serializer.
- Success Response: `200`, new private key, new public key, and new key version.
- Error Responses: `400 MISSING_AUDITOR_ID`, `404 AUDITOR_NOT_FOUND`, `500 KEY_ROTATION_FAILED`.

Example request:

```json
{
  "auditor_id": 1
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "new_private_key": "-----BEGIN PRIVATE KEY-----...",
    "new_public_key": "-----BEGIN PUBLIC KEY-----...",
    "new_key_version": 2
  },
  "meta": {}
}
```

### GET `/api/auditor/<auditor_id>/logs/`

- Method: `GET`
- Description: Returns up to 100 external search audit logs for an auditor.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsComplianceOfficer`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `auditor_id` integer.
- Validation Rules: Auditor must exist.
- Serializer Fields: Manual log fields: `id`, `keyword_hash`, `success`, `total_matches`, `returned_count`, `execution_time_ms`, `created_at`, `key_version`.
- Success Response: `200`, logs array.
- Error Responses: `404 AUDITOR_NOT_FOUND`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`.

Example request:

```http
GET /api/auditor/1/logs/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": 12,
        "keyword_hash": "b8f1d1...",
        "success": true,
        "total_matches": 1,
        "returned_count": 1,
        "execution_time_ms": 6.32,
        "created_at": "2026-07-16T00:00:00Z",
        "key_version": 1
      }
    ]
  },
  "meta": {}
}
```

### GET `/api/auditor/<auditor_id>/logs/download/`

- Method: `GET`
- Description: Downloads up to 100 external search audit logs as a PDF.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsComplianceOfficer`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `auditor_id` integer.
- Validation Rules: Auditor must exist.
- Serializer Fields: None.
- Success Response: `200 application/pdf` with `Content-Disposition: attachment; filename="auditor_<id>_logs.pdf"`.
- Error Responses: `404 AUDITOR_NOT_FOUND`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`.

Example request:

```http
GET /api/auditor/1/logs/download/
Authorization: Bearer <access>
```

Example response:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="auditor_1_logs.pdf"
```

### GET `/api/metrics/internal/`

- Method: `GET`
- Description: Returns internal system metrics and auditor public key summaries.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsComplianceOfficer`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: None beyond permissions.
- Serializer Fields: No serializer.
- Success Response: `200`, raw `data` object.
- Error Responses: `500 {"error": "<message>"}`, plus auth/permission errors.

Example request:

```http
GET /api/metrics/internal/
Authorization: Bearer <access>
```

Example response:

```json
{
  "data": {
    "system_metrics": {
      "total_documents": 10,
      "total_tokens": 50,
      "external_tokens": 50,
      "avg_external_search_ms": 8.4,
      "external_searches_last_24h": 5,
      "failed_external_searches_last_24h": 1,
      "last_index_update": "2026-07-16T00:00:00+00:00"
    },
    "auditors": [
      {
        "auditor_id": 1,
        "name": "SBI Auditor",
        "public_key": "-----BEGIN PUBLIC KEY-----...",
        "active_key_version": 1,
        "created_at": "2026-07-16T00:00:00+00:00"
      }
    ]
  }
}
```

### HEAD `/api/metrics/internal/`

- Method: `HEAD`
- Description: Uptime-friendly head check on the internal metrics endpoint.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsComplianceOfficer`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: None beyond permissions.
- Serializer Fields: None.
- Success Response: `200` with no body.
- Error Responses: `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`.

Example request:

```http
HEAD /api/metrics/internal/
Authorization: Bearer <access>
```

### GET `/api/metrics/external/`

- Method: `GET`
- Description: Returns minimal external metrics.
- Permissions: `IsAuthenticated`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: Valid access token required.
- Serializer Fields: No serializer.
- Success Response: `200`, raw `data.total_documents`.
- Error Responses: `500 {"error": "Failed to fetch metrics"}`, `401 UNAUTHORIZED`.

Example request:

```http
GET /api/metrics/external/
Authorization: Bearer <access>
```

Example response:

```json
{
  "data": {
    "total_documents": 10
  }
}
```

### POST `/api/auditor/create/`

- Method: `POST`
- Description: Legacy auditor creation endpoint. Creates an auditor identity from name only and returns generated RSA keys.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: `name`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `name` required.
- Serializer Fields: No serializer.
- Success Response: `201`, auditor ID, name, public key, private key, key version.
- Error Responses: `400 MISSING_NAME`, `500 AUDITOR_CREATION_FAILED`.

Example request:

```json
{
  "name": "SBI Auditor"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "auditor_id": 1,
    "name": "SBI Auditor",
    "public_key": "-----BEGIN PUBLIC KEY-----...",
    "private_key": "-----BEGIN PRIVATE KEY-----...",
    "key_version": 1
  },
  "meta": {}
}
```

### DELETE `/api/auditor/<auditor_id>/delete/`

- Method: `DELETE`
- Description: Legacy auditor delete endpoint. Deletes the auditor and matching generated user account by email or auditor username prefix.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `auditor_id` integer.
- Validation Rules: Auditor must exist.
- Serializer Fields: None.
- Success Response: `200`, message.
- Error Responses: `404 AUDITOR_NOT_FOUND`, `500 AUDITOR_DELETE_FAILED`.

Example request:

```http
DELETE /api/auditor/1/delete/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "message": "Auditor deleted successfully"
  },
  "meta": {}
}
```

### GET `/api/auditor/<auditor_id>/download/`

- Method: `GET`
- Description: Downloads auditor credential PDF with public credentials and redacted private key.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsExternalAuditor`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `auditor_id` integer.
- Validation Rules: Auditor must exist.
- Serializer Fields: None.
- Success Response: `200 application/pdf` with `Content-Disposition: attachment; filename="auditor_<id>_credentials.pdf"`.
- Error Responses: `404 AUDITOR_NOT_FOUND`.

Example request:

```http
GET /api/auditor/1/download/
Authorization: Bearer <access>
```

Example response:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="auditor_1_credentials.pdf"
```

### POST `/api/auditor/<auditor_id>/download/`

- Method: `POST`
- Description: Downloads auditor credential PDF and can include a provided private key in the PDF.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsExternalAuditor`.
- JWT Authentication: Required.
- Request Body: Optional `private_key`.
- Query Parameters: None.
- Path Parameters: `auditor_id` integer.
- Validation Rules: Auditor must exist; body is optional but, if present, should be a JSON object.
- Serializer Fields: None.
- Success Response: `200 application/pdf`.
- Error Responses: `404 AUDITOR_NOT_FOUND`.

Example request:

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----..."
}
```

Example response:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="auditor_1_credentials.pdf"
```

### GET `/api/auditor/<id>/`

- Method: `GET`
- Description: Legacy auditor profile retrieve endpoint.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator | IsComplianceOfficer`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist.
- Serializer Fields: `AuditorRetrieveSerializer`.
- Success Response: `200`, auditor profile.
- Error Responses: `404 AUDITOR_NOT_FOUND`, `500 AUDITOR_PROFILE_RETRIEVE_FAILED`.

Example request:

```http
GET /api/auditor/1/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "SBI Auditor",
    "email": "sbi@example.com",
    "phone": "+919876543210",
    "designation": "Senior Auditor",
    "public_key": "-----BEGIN PUBLIC KEY-----...",
    "key_version": 1,
    "status": "ACTIVE",
    "created_at": "2026-07-16T00:00:00Z",
    "updated_at": "2026-07-16T00:00:00Z"
  },
  "meta": {}
}
```

### PATCH `/api/auditor/<id>/update/`

- Method: `PATCH`
- Description: Legacy partial auditor profile update.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: One or more editable fields from `AuditorUpdateSerializer`.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist; at least one editable field required; `name` min length 3, max length 255, non-blank, unique case-insensitive; `email` valid and unique case-insensitive; `phone` must match `^\+?1?\d{9,15}$`; `designation` max length 255.
- Serializer Fields: Editable `name`, `email`, `phone`, `designation`; read-only fields are ignored because they are not serializer fields.
- Success Response: `200`, `AuditorRetrieveSerializer`.
- Error Responses: `400 VALIDATION_ERROR`, `404 AUDITOR_NOT_FOUND`, `500 AUDITOR_PROFILE_UPDATE_FAILED`.

Example request:

```json
{
  "phone": "+919876543210",
  "designation": "Senior Auditor"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "SBI Auditor",
    "email": "sbi@example.com",
    "phone": "+919876543210",
    "designation": "Senior Auditor",
    "public_key": "-----BEGIN PUBLIC KEY-----...",
    "key_version": 1,
    "status": "ACTIVE",
    "created_at": "2026-07-16T00:00:00Z",
    "updated_at": "2026-07-16T00:00:00Z"
  },
  "meta": {}
}
```

### PUT `/api/auditor/<id>/update/`

- Method: `PUT`
- Description: Legacy full auditor profile update using `AuditorUpdateSerializer` with `partial=False`.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: Editable auditor fields.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Same as PATCH. Because serializer fields are declared `required=False`, a PUT still accepts any subset but the custom validator requires at least one editable field.
- Serializer Fields: `name`, `email`, `phone`, `designation`.
- Success Response: `200`, `AuditorRetrieveSerializer`.
- Error Responses: `400 VALIDATION_ERROR`, `404 AUDITOR_NOT_FOUND`, `500 AUDITOR_PROFILE_UPDATE_FAILED`.

Example request:

```json
{
  "name": "SBI Auditor",
  "email": "sbi@example.com",
  "phone": "+919876543210",
  "designation": "Senior Auditor"
}
```

Example response: same shape as PATCH `/api/auditor/<id>/update/`.

### PATCH `/api/auditor/<id>/status/`

- Method: `PATCH`
- Description: Updates auditor status.
- Permissions: `IsAuthenticated` and `IsSuperAdministrator`.
- JWT Authentication: Required.
- Request Body: `AuditorStatusSerializer`.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist; `status` is required and must be `ACTIVE` or `DISABLED`.
- Serializer Fields: `status`.
- Success Response: `200`, auditor ID and status.
- Error Responses: `400 VALIDATION_ERROR`, `404 AUDITOR_NOT_FOUND`, `500 AUDITOR_STATUS_UPDATE_FAILED`.

Example request:

```json
{
  "status": "DISABLED"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "auditor_id": 1,
    "status": "DISABLED"
  },
  "meta": {}
}
```

### GET `/api/auditors/`

- Method: `GET`
- Description: REST-style auditor list endpoint with optional search and status filters.
- Permissions: Dynamic: `IsAuthenticated` and `IsAdministrator | IsComplianceOfficer`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: `search` optional; `status` optional.
- Path Parameters: None.
- Validation Rules: `search` filters `name`, `email`, `designation`, and `phone` case-insensitively; `status` is passed directly to `status` filter.
- Serializer Fields: `AuditorRetrieveSerializer` many.
- Success Response: `200`, list of auditors.
- Error Responses: `500 AUDITOR_LIST_FAILED`, `401 UNAUTHORIZED`, `403 PERMISSION_DENIED`.

Example request:

```http
GET /api/auditors/?search=sbi&status=ACTIVE
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "SBI Auditor",
      "email": "sbi@example.com",
      "phone": "+919876543210",
      "designation": "Senior Auditor",
      "public_key": "-----BEGIN PUBLIC KEY-----...",
      "key_version": 1,
      "status": "ACTIVE",
      "created_at": "2026-07-16T00:00:00Z",
      "updated_at": "2026-07-16T00:00:00Z"
    }
  ],
  "meta": {}
}
```

### POST `/api/auditors/`

- Method: `POST`
- Description: REST-style auditor creation endpoint. Creates an auditor, generated Django user, assigns `External Auditor`, generates key pair, and returns one-time credentials.
- Permissions: Dynamic: `IsAuthenticated` and `IsAdministrator`.
- JWT Authentication: Required.
- Request Body: `name`, optional `email`, `phone`, `designation`, `status`.
- Query Parameters: None.
- Path Parameters: None.
- Validation Rules: `name` required; `email` unique case-insensitive if provided; `name` unique case-insensitive; `status` defaults to `ACTIVE`; service creates active user only when status is `ACTIVE`.
- Serializer Fields: No request serializer.
- Success Response: `201`, auditor profile, keys, username, temporary password.
- Error Responses: `400 MISSING_NAME`, `400 VALIDATION_ERROR`, `500 AUDITOR_CREATION_FAILED`.

Example request:

```json
{
  "name": "SBI Auditor",
  "email": "sbi@example.com",
  "phone": "+919876543210",
  "designation": "Senior Auditor",
  "status": "ACTIVE"
}
```

Example response:

```json
{
  "status": "success",
  "data": {
    "auditor_id": 1,
    "name": "SBI Auditor",
    "email": "sbi@example.com",
    "phone": "+919876543210",
    "designation": "Senior Auditor",
    "public_key": "-----BEGIN PUBLIC KEY-----...",
    "private_key": "-----BEGIN PRIVATE KEY-----...",
    "key_version": 1,
    "temporary_password": "Abc123!@#...",
    "username": "auditor_sbiauditor",
    "status": "ACTIVE"
  },
  "meta": {}
}
```

### GET `/api/auditors/<id>/`

- Method: `GET`
- Description: REST-style retrieve endpoint for an auditor.
- Permissions: Dynamic: `IsAuthenticated` and `IsAdministrator | IsComplianceOfficer`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist.
- Serializer Fields: `AuditorRetrieveSerializer`.
- Success Response: `200`, auditor profile.
- Error Responses: `404 AUDITOR_NOT_FOUND`.

Example request:

```http
GET /api/auditors/1/
Authorization: Bearer <access>
```

Example response: same shape as GET `/api/auditor/<id>/`.

### PATCH `/api/auditors/<id>/`

- Method: `PATCH`
- Description: REST-style partial auditor update. Supports status updates plus profile fields.
- Permissions: Dynamic: `IsAuthenticated` and `IsAdministrator`.
- JWT Authentication: Required.
- Request Body: `status` optional plus `AuditorUpdateSerializer` fields.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist; if `status` provided it is validated by `update_auditor_status`; then profile data is validated by `AuditorUpdateSerializer`, which requires at least one editable profile field. Because `status` is not in `AuditorUpdateSerializer`, sending only `status` will update status and then fail serializer validation.
- Serializer Fields: `name`, `email`, `phone`, `designation`.
- Success Response: `200`, `AuditorRetrieveSerializer`.
- Error Responses: `400 AUDITOR_STATUS_UPDATE_FAILED`, `400 VALIDATION_ERROR`, `404 AUDITOR_NOT_FOUND`.

Example request:

```json
{
  "name": "SBI External Auditor",
  "status": "ACTIVE"
}
```

Example response: same shape as GET `/api/auditor/<id>/`.

### PUT `/api/auditors/<id>/`

- Method: `PUT`
- Description: REST-style update endpoint; implementation delegates to PATCH.
- Permissions: Dynamic: `IsAuthenticated` and `IsAdministrator`.
- JWT Authentication: Required.
- Request Body: Same as PATCH.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Same as PATCH.
- Serializer Fields: `name`, `email`, `phone`, `designation`.
- Success Response: `200`, `AuditorRetrieveSerializer`.
- Error Responses: Same as PATCH.

Example request:

```json
{
  "name": "SBI External Auditor",
  "email": "sbi@example.com",
  "phone": "+919876543210",
  "designation": "Lead Auditor"
}
```

Example response: same shape as GET `/api/auditor/<id>/`.

### DELETE `/api/auditors/<id>/`

- Method: `DELETE`
- Description: REST-style auditor delete endpoint. Deletes the auditor and matching generated user account.
- Permissions: Dynamic: `IsAuthenticated` and `IsAdministrator`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist.
- Serializer Fields: None.
- Success Response: `200`, message.
- Error Responses: `404 AUDITOR_NOT_FOUND`, `500 AUDITOR_DELETE_FAILED`.

Example request:

```http
DELETE /api/auditors/1/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "message": "Auditor deleted successfully"
  },
  "meta": {}
}
```

### POST `/api/auditors/<id>/rotate-key/`

- Method: `POST`
- Description: REST-style path-based auditor key rotation.
- Permissions: `IsAuthenticated` and `IsAdministrator`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist.
- Serializer Fields: None.
- Success Response: `200`, new private key, public key, and version.
- Error Responses: `404 AUDITOR_NOT_FOUND`, `500 KEY_ROTATION_FAILED`.

Example request:

```http
POST /api/auditors/1/rotate-key/
Authorization: Bearer <access>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "new_private_key": "-----BEGIN PRIVATE KEY-----...",
    "new_public_key": "-----BEGIN PUBLIC KEY-----...",
    "new_key_version": 2
  },
  "meta": {}
}
```

### GET `/api/auditors/<id>/credentials/`

- Method: `GET`
- Description: REST-style auditor credential PDF download endpoint.
- Permissions: `IsAuthenticated` and `IsAdministrator`.
- JWT Authentication: Required.
- Request Body: None.
- Query Parameters: None.
- Path Parameters: `id` integer auditor ID.
- Validation Rules: Auditor must exist.
- Serializer Fields: None.
- Success Response: `200 application/pdf` with `Content-Disposition: attachment; filename="SecureMatch_Auditor_Credentials.pdf"`.
- Error Responses: `404 AUDITOR_NOT_FOUND`, `500 CREDENTIAL_GENERATION_FAILED`.

Example request:

```http
GET /api/auditors/1/credentials/
Authorization: Bearer <access>
```

Example response:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="SecureMatch_Auditor_Credentials.pdf"
```

## Database Model Documentation

### `accounts.User`

Extends Django `AbstractUser`.

| Field | Type | Notes |
|---|---|---|
| inherited auth fields | Django auth fields | Includes `username`, `password`, `first_name`, `last_name`, `is_active`, `is_staff`, `is_superuser`, `last_login`, `date_joined`, groups, permissions |
| `email` | `EmailField(blank=True, null=True)` | Overrides inherited email to allow null |
| `created_at` | `DateTimeField(auto_now_add=True)` | Creation timestamp |
| `updated_at` | `DateTimeField(auto_now=True)` | Update timestamp |

Authentication settings:

- `USERNAME_FIELD = "username"`
- `REQUIRED_FIELDS = []`

### `documents.EncryptedDocument`

Stores encrypted JSON documents.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | Implicit primary key |
| `encrypted_blob` | `JSONField` | Contains `nonce` and `ciphertext` |
| `created_at` | `DateTimeField(auto_now_add=True)` | Creation timestamp |

Meta:

- Ordering: `-created_at`

### `documents.SearchTokenIndex`

Stores searchable deterministic indexes for encrypted documents.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | Implicit primary key |
| `token` | `CharField(max_length=64, db_index=True)` | Internal HMAC-SHA256 field-bound token |
| `external_token` | `CharField(max_length=64, null=True, blank=True, db_index=True)` | External SHA-256 keyword hash |
| `document` | `ForeignKey(EncryptedDocument, CASCADE, related_name="tokens")` | Parent encrypted document |

Indexes:

- `token`
- `external_token`

### `documents.Auditor`

Stores external auditor profile and active public key.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | Implicit primary key |
| `name` | `CharField(max_length=255)` | Auditor name |
| `email` | `EmailField(unique=True, null=True, blank=True)` | Optional unique email |
| `phone` | `CharField(max_length=20, null=True, blank=True)` | Optional phone |
| `designation` | `CharField(max_length=255, null=True, blank=True)` | Optional designation |
| `status` | `CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")` | `ACTIVE` or `DISABLED` |
| `public_key` | `TextField` | PEM public key |
| `key_version` | `IntegerField(default=1)` | Incremented on rotation |
| `created_at` | `DateTimeField(auto_now_add=True)` | Creation timestamp |
| `updated_at` | `DateTimeField(auto_now=True)` | Update timestamp |

Meta:

- Ordering: `id`

### `documents.ExternalSearchAudit`

Audit log for external searches.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | Implicit primary key |
| `auditor` | `ForeignKey(Auditor, CASCADE, related_name="external_search_logs")` | Auditor |
| `keyword_hash` | `CharField(max_length=64, db_index=True)` | Searched keyword hash |
| `total_matches` | `IntegerField(default=0)` | Total matching rows |
| `returned_count` | `IntegerField(default=0)` | Returned real results, max 50 |
| `truncated` | `BooleanField(default=False)` | Whether results exceeded cap |
| `execution_time_ms` | `FloatField` | Total search time |
| `success` | `BooleanField(default=True)` | Search success |
| `failure_reason` | `CharField(max_length=100, null=True, blank=True)` | Failure code |
| `key_version` | `IntegerField(default=1)` | Auditor key version used |
| `ip_address` | `GenericIPAddressField(null=True, blank=True)` | Present on model but not populated by current view code |
| `created_at` | `DateTimeField(auto_now_add=True)` | Audit timestamp |

Meta:

- Ordering: `-created_at`
- Indexes: `auditor`, `created_at`, `success`, `keyword_hash`

## Serializer Documentation

### `accounts.UserSerializer`

Model: `accounts.User`

| Field | Direction | Notes |
|---|---|---|
| `id` | read | User ID |
| `username` | read/write by serializer, used read-only in current views | Username |
| `role` | read | `SerializerMethodField`, derived by `get_primary_role` |
| `first_name` | read/write by serializer | First name |
| `last_name` | read/write by serializer | Last name |
| `email` | read/write by serializer | Email |
| `date_joined` | read | Django inherited field |
| `is_staff` | read/write by serializer | Staff flag |
| `is_superuser` | read/write by serializer | Superuser flag |

### `accounts.LoginSerializer`

| Field | Required | Direction | Validation |
|---|---|---|---|
| `username` | Yes | input | String |
| `password` | Yes | input write-only | String |

### `accounts.ChangePasswordSerializer`

| Field | Required | Direction | Validation |
|---|---|---|---|
| `old_password` | Yes | input write-only | Must match current password |
| `new_password` | Yes | input write-only | Django password validators; cannot equal old password |

### `documents.AuditorRetrieveSerializer`

Model: `documents.Auditor`

| Field | Direction |
|---|---|
| `id` | read |
| `name` | read |
| `email` | read |
| `phone` | read |
| `designation` | read |
| `public_key` | read |
| `key_version` | read |
| `status` | read |
| `created_at` | read |
| `updated_at` | read |

### `documents.AuditorUpdateSerializer`

Model: `documents.Auditor`

| Field | Required | Validation |
|---|---|---|
| `name` | No | Min length 3, max length 255, non-blank, unique case-insensitive |
| `email` | No | Valid email; nullable/blank; unique case-insensitive when non-empty |
| `phone` | No | Nullable/blank; regex `^\+?1?\d{9,15}$` |
| `designation` | No | Nullable/blank; max length 255 |

Object-level validation:

- At least one editable field must be submitted.
- Explicit blank `name` is rejected.

### `documents.AuditorStatusSerializer`

| Field | Required | Validation |
|---|---|---|
| `status` | Yes | Choice: `ACTIVE`, `DISABLED` |

## Permission Matrix

| Permission Class | Allows |
|---|---|
| `IsSuperAdministrator` | Authenticated users whose primary role is `Administrator` |
| `IsAdministrator` | Same as `IsSuperAdministrator` |
| `IsInternalAnalyst` | Primary role `Internal Analyst` |
| `IsComplianceOfficer` | Primary role `Compliance Officer` |
| `IsExternalAuditor` | Primary role `External Auditor` |
| `IsReadOnlyAnalyst` | Primary role `Read Only Analyst` |
| `IsInternalUser` | `Internal Analyst`, `Compliance Officer`, `Read Only Analyst`, or `Administrator` |
| `IsAuthenticated` | Any authenticated user |
| `AllowAny` | Public |

## Role-Based Access Matrix

| Endpoint Area | Administrator | Internal Analyst | Compliance Officer | External Auditor | Read Only Analyst | Public |
|---|---:|---:|---:|---:|---:|---:|
| Health check | Yes | Yes | Yes | Yes | Yes | Yes |
| Login / token refresh | Yes | Yes | Yes | Yes | Yes | Yes |
| Logout / me / change password | Yes | Yes | Yes | Yes | Yes | No |
| User administration | Yes | No | No | No | No | No |
| Upload documents | Yes | Yes | No | No | No | No |
| Internal search | Yes | Yes | Yes | No | Yes | No |
| External search | Yes | No | No | Yes | No | No |
| Auditor credential verify | Yes | No | No | Yes | No | No |
| Auditor key rotation | Yes | No | No | No | No | No |
| Auditor log viewing/PDF | Yes | No | Yes | No | No | No |
| Internal metrics | Yes | No | Yes | No | No | No |
| External metrics | Yes | Yes | Yes | Yes | Yes | No |
| Legacy auditor create/delete/profile update/status | Yes | No | Profile read only | No | No | No |
| REST auditor list/retrieve | Yes | No | Yes | No | No | No |
| REST auditor create/update/delete/rotate/credentials | Yes | No | No | No | No | No |

## Notes and Edge Cases

- `documents.views.RotateAuditorKeyView` is defined twice. Python keeps the second definition, so `/api/auditor/rotate-key/` requires only `auditor_id` and returns generated private/public keys.
- `AuditorDetailView.patch` updates `status` before running `AuditorUpdateSerializer`. Sending only `{"status": "ACTIVE"}` will update status and then fail serializer validation because no editable profile field was submitted.
- `InternalMetricsView` and `ExternalMetricsView` do not use the standard success envelope.
- `ExternalSearchAudit.ip_address` exists on the model but current endpoint code does not populate it.
- No DRF routers or viewsets are used.
