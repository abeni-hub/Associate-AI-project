# Government Citizen Engagement Platform — Architecture Specification

## 1. System Overview

The **Government Citizen Engagement Platform** is a centralized, modular backend service built with **Laravel 13** and **PostgreSQL** to serve Ethiopian Government entities (Sub-Cities, Woredas, and Bureaus) and citizens.

The platform provides citizen transparency, service discovery, required document listings, room-by-room navigation, official announcements, citizen feedback submission, and hierarchy-aware administrative dashboards.

---

## 2. Technology Stack & Runtime

- **Framework**: Laravel 13 (`laravel/framework: v13.38.0`)
- **PHP Runtime**: PHP 8.5.11 (ZTS Visual C++ 2022 x64)
- **Database**: PostgreSQL (`pgsql` driver via PDO)
- **Authentication**: Laravel Sanctum (`laravel/sanctum: v4.3.3`) with stateful SPA session cookie authentication
- **API Architecture**: Versioned RESTful API (`/api/v1`)
- **Code Quality**: Laravel Pint (`laravel/pint: v1.32.1`), PHPUnit 12

---

## 3. High-Level Modular Monolith Architecture

The application adopts a **domain-oriented modular architecture** embedded within Laravel's standard directory structure:

```
app/
├── Domains/
│   ├── AuditLogs/          # Audit logging of critical administrative operations
│   ├── Authentication/     # Session state, login rate limiting, password reset
│   ├── Authorization/      # Role-permission verification, data-scope policies
│   ├── Dashboard/          # Role and organization-scoped reporting queries
│   ├── Documents/          # Required document definitions and service mappings
│   ├── Events/             # Scheduled government events & publication state
│   ├── Feedback/           # Citizen complaints, suggestions, satisfaction feedback
│   ├── News/               # Official press releases & news management
│   ├── Organizations/      # Generic organization hierarchy (Sub-City, Woreda, Bureau)
│   ├── QrCodes/            # QR token generation, status validation & routing
│   ├── Services/           # Master service & subservice catalog, organization access
│   ├── ServiceSteps/       # Ordered room-by-room citizen step instructions
│   └── Users/              # User accounts & single-organization membership
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/         # Versioned REST API Controllers
│   ├── Requests/           # Strict Form Request validation classes
│   └── Resources/          # Eloquent API Transformation Resources
└── Support/
    └── ApiResponse.php     # Standardized JSON response envelope builder
```

---

## 4. API Standardization & Response Envelope

Every endpoint under `/api/v1` returns an identical, predictable JSON envelope:

### Success Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "errors": null
}
```

### Paginated Envelope
```json
{
  "success": true,
  "message": "Data retrieved successfully.",
  "data": [ ... ],
  "errors": null,
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75,
    "from": 1,
    "to": 15
  }
}
```

### Error Envelope
```json
{
  "success": false,
  "message": "Error description.",
  "data": null,
  "errors": null
}
```

### Validation Error Envelope (HTTP 422)
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "field_name": [
      "The field_name field is required."
    ]
  }
}
```

---

## 5. Centralized Exception Handling

Configured inside `bootstrap/app.php`:
- Handled via `Exceptions::shouldRenderJsonWhen` whenever the request path starts with `api/*` or requests JSON.
- **ValidationException** maps automatically to HTTP 422 with validation error bags.
- **NotFoundHttpException** & **ModelNotFoundException** map to HTTP 404.
- **AuthenticationException** maps to HTTP 401.
- **AccessDeniedHttpException** & **AuthorizationException** map to HTTP 403.
- **MethodNotAllowedHttpException** maps to HTTP 405.
- Unhandled **Throwables** map to HTTP 500 with sanitized messages in production.

---

## 6. Sanctum SPA Authentication Foundation

Designed to integrate seamlessly with the React frontend hosted under a common root or same-site domain:
- **Middleware**: `statefulApi()` configured in `bootstrap/app.php`.
- **CORS**: `config/cors.php` configured with `supports_credentials => true`, dynamically referencing `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS`.
- **CSRF**: Cookie-based CSRF tokens (`/sanctum/csrf-cookie`) enforced for all non-safe HTTP methods.
- **Sessions**: Secure, SameSite-compliant HTTP-only session cookies.
