# REST API Specification — Version 1 (`/api/v1`)

All endpoints in this specification return responses matching the unified API response contract:

- **Success**: `{"success": true, "message": "...", "data": ..., "errors": null}`
- **Error**: `{"success": false, "message": "...", "data": null, "errors": ...}`

---

## 1. System & Health

### `GET /api/v1/health`
Checks application health, API version, and database connectivity.
- **Authentication**: None (Public)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Government Platform API v1 is active and healthy.",
  "data": {
    "service": "Government Citizen Engagement Platform",
    "api_version": "v1",
    "environment": "local",
    "timestamp": "2026-10-24T23:55:00+03:00",
    "database": {
      "status": "connected",
      "details": {
        "driver": "pgsql",
        "database": "government_db"
      }
    }
  },
  "errors": null
}
```

---

## 2. Authentication & Session Management

Authentication uses **Laravel Sanctum's first-party stateful SPA cookie authentication**.

Before calling authenticated endpoints from a browser/SPA:
1. Initialize CSRF protection: `GET /sanctum/csrf-cookie` (sets `XSRF-TOKEN` cookie).
2. Pass the `X-XSRF-TOKEN` header on all mutation requests (`POST`, `PUT`, `DELETE`).

### `POST /api/v1/auth/login`
Authenticates user credentials and establishes a session.
- **Authentication**: None (Public)
- **Rate Limit**: 5 attempts per minute per identifier/IP.
- **Request Body**:
```json
{
  "username": "abebe.k",
  "password": "CorrectPassword123!"
}
```
*(Alternatively, `login` can be used to authenticate with either username or email address)*.

- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "id": 1,
    "name": "Abebe Kebede",
    "username": "abebe.k",
    "email": "abebe@bole.gov.et",
    "phone": "+251911234567",
    "status": "active",
    "must_change_password": false,
    "last_login_at": "2026-10-25T00:05:00+03:00",
    "organization": {
      "id": 1,
      "name": "Bole Sub-City",
      "code": "subcity-bole",
      "type": {
        "id": 1,
        "name": "Sub-City",
        "code": "sub_city"
      }
    },
    "role": {
      "id": 2,
      "name": "Sub-City Admin",
      "slug": "sub_city_admin"
    },
    "created_at": "2026-10-25T00:00:00+03:00"
  },
  "errors": null,
  "meta": {
    "must_change_password": false
  }
}
```

- **Error Response — Invalid Credentials (422)**:
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "login": [
      "These credentials do not match our records."
    ]
  }
}
```

- **Error Response — Deactivated Account (422)**:
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "login": [
      "Your account is deactivated. Please contact your organization administrator."
    ]
  }
}
```

- **Error Response — Rate Limited (429)**:
```json
{
  "success": false,
  "message": "Too many login attempts. Please try again later.",
  "data": null,
  "errors": null
}
```

---

### `GET /api/v1/auth/me`
Retrieves the profile, organization context, and role of the currently authenticated user.
- **Authentication**: `auth:sanctum` + `account.active`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authenticated user profile retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Abebe Kebede",
    "username": "abebe.k",
    "email": "abebe@bole.gov.et",
    "phone": "+251911234567",
    "status": "active",
    "must_change_password": false,
    "last_login_at": "2026-10-25T00:05:00+03:00",
    "organization": {
      "id": 1,
      "name": "Bole Sub-City",
      "code": "subcity-bole",
      "type": {
        "id": 1,
        "name": "Sub-City",
        "code": "sub_city"
      }
    },
    "role": {
      "id": 2,
      "name": "Sub-City Admin",
      "slug": "sub_city_admin"
    },
    "created_at": "2026-10-25T00:00:00+03:00"
  },
  "errors": null
}
```

- **Error Response — Unauthenticated (401)**:
```json
{
  "success": false,
  "message": "Unauthenticated.",
  "data": null,
  "errors": null
}
```

- **Error Response — Deactivated Mid-Session (403)**:
```json
{
  "success": false,
  "message": "Your account is deactivated. Please contact your organization administrator.",
  "data": null,
  "errors": null
}
```

---

### `POST /api/v1/auth/logout`
Terminates the authenticated session, invalidates session storage, and regenerates the CSRF token.
- **Authentication**: `auth:sanctum`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null,
  "errors": null
}
```

---

### `PUT /api/v1/auth/change-password`
Allows an authenticated user to change their password and clears the `must_change_password` flag.
- **Authentication**: `auth:sanctum` + `account.active`
- **Request Body**:
```json
{
  "current_password": "CorrectPassword123!",
  "new_password": "NewSecurePassword456!",
  "new_password_confirmation": "NewSecurePassword456!"
}
```

- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": null,
  "errors": null
}
```

- **Error Response — Incorrect Current Password (422)**:
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "current_password": [
      "The provided current password is incorrect."
    ]
  }
}
```

---

### `POST /api/v1/auth/forgot-password`
Initiates a password reset notification for a user account.
- **Authentication**: None (Public)
- **Rate Limit**: 5 attempts per minute.
- **Request Body**:
```json
{
  "email": "abebe@bole.gov.et"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "If your email address exists in our system, you will receive a password reset link.",
  "data": null,
  "errors": null
}
```
*(Always returns a generic message to prevent account/email enumeration).*

---

### `POST /api/v1/auth/reset-password`
Completes password reset using a secure token.
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "token": "reset-token-received-in-email",
  "email": "abebe@bole.gov.et",
  "password": "NewPassword2026!",
  "password_confirmation": "NewPassword2026!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password has been reset successfully.",
  "data": null,
  "errors": null
}
```
