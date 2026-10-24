# Government Citizen Engagement Platform — Laravel 13 Backend

A centralized, secure, and extensible RESTful backend for the Ethiopian Government Citizen Engagement Platform.

The platform provides citizen services discovery, room-by-room physical instructions, required document management, verified government news and events, public feedback submission, and hierarchical parent-read feedback tracking across Sub-Cities, Woredas, and Bureaus.

---

## Technical Specifications

- **Backend Framework**: Laravel 13 (`v13.38.0`)
- **Language**: PHP 8.5.11
- **Database**: PostgreSQL 18+ (`pdo_pgsql`)
- **API Versioning**: `/api/v1`
- **Frontend Target**: React SPA (First-party, cookie-based session authentication via Laravel Sanctum)
- **Code Style**: Laravel Pint (`./vendor/bin/pint`)
- **Test Runner**: PHPUnit 12 (`php artisan test`)

---

## Project Structure

```
Government/
├── app/
│   ├── Domains/               # Domain-driven business modules
│   │   ├── AuditLogs/
│   │   ├── Authentication/
│   │   ├── Authorization/
│   │   ├── Dashboard/
│   │   ├── Documents/
│   │   ├── Events/
│   │   ├── Feedback/
│   │   ├── News/
│   │   ├── Organizations/
│   │   ├── QrCodes/
│   │   ├── Services/
│   │   ├── ServiceSteps/
│   │   └── Users/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           └── V1/        # V1 API Controllers
│   └── Support/
│       └── ApiResponse.php    # Standard JSON response helper
├── config/
│   ├── cors.php               # SPA CORS with credentials configuration
│   └── sanctum.php            # Stateful SPA authentication configuration
├── docs/
│   ├── architecture.md        # Architecture specification
│   └── implementation-progress.md # Phase-by-phase implementation progress
├── routes/
│   └── api.php                # /api/v1 routes
└── tests/
    └── Feature/
        └── Api/
            └── V1/            # Automated API tests
```

---

## Installation & Setup

### 1. Requirements
- PHP >= 8.3 (tested with PHP 8.5.11)
- Composer 2.x
- PostgreSQL 14+ or 18+
- PHP Extensions: `pdo_pgsql`, `pgsql`, `mbstring`, `openssl`, `curl`, `xml`, `zip`

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
php artisan key:generate
```

Configure PostgreSQL credentials in `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=government_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 3. Running the Server
```bash
php artisan serve
```

### 4. Running Quality Checks and Tests
```bash
# Code style verification
./vendor/bin/pint --test

# Automated test suite
php artisan test
```

---

## API Response Format

All `/api/v1` endpoints return standardized JSON:

### Success
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "errors": null
}
```

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "field": ["Field error message"]
  }
}
```

### Error (404, 401, 403, 405, 500)
```json
{
  "success": false,
  "message": "Error description.",
  "data": null,
  "errors": null
}
```

---

## Phase-by-Phase Roadmap

Refer to [docs/implementation-progress.md](docs/implementation-progress.md) for current implementation status and phase completion gates.
