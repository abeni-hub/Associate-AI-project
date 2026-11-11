# End-to-End & Integration Testing Guide

This directory contains the automated end-to-end (E2E) and integration test suites for **Civic Link**, covering the unified Laravel REST API (`/api/v1`), Citizen Web Application, and Government Admin Portal.

---

## 1. Architecture & Design Principles

The testing harness employs a hybrid strategy designed for maximum coverage, deterministic execution, and security isolation:

1. **Jest API Integration Suite (`tests/api/`)**:
   - Directly exercises Laravel API endpoints (`/api/v1`).
   - Asserts response envelopes, status codes, input validations, and error payloads.
   - Tests role-based access control (RBAC) across all 5 predefined roles (`super_admin`, `sub_city_admin`, `woreda_admin`, `bureau_admin`, `staff`).
   - Validates multi-tenant organizational data isolation and hierarchy scoping.
   - Executes non-destructive reads and validation errors by default; full CRUD mutations are gated by an explicit safeguard flag.

2. **Playwright Browser E2E Suite (`tests/browser/`)**:
   - Exercises real user journeys in Chromium using accessible labels and visible text.
   - Separate projects for **Citizen App** (`citizen-journeys.spec.cjs`) and **Portal** (`portal-*.spec.cjs`).
   - Validates login workflows, role-based route guards, session handling, and controlled failure states (500 errors, network disconnection, recovery).

3. **Deterministic Isolation & Safety**:
   - **Production Target Rejection**: Built-in config validation blocks execution against production or live domains. Local/test runs are strictly restricted to loopback interfaces (`127.0.0.1` or `localhost`).
   - **Mutation Safeguards**: State-altering operations (creating/updating/deleting records) are disabled unless `E2E_ALLOW_MUTATIONS=true`.
   - **Guaranteed Cleanup**: Test fixtures use unique run-prefixed identifiers (`e2e_<timestamp>_<hash>`) and clean up records in reverse dependency order (service steps -> feedback -> news -> users -> services -> documents -> organizations) inside `afterAll`.
   - **Rate Limit Safeguards**: Throttling tests run only when `E2E_RUN_RATE_LIMIT_TESTS=true` and use bounded attempts to avoid indefinite lockouts.

---

## 2. Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Playwright Chromium**: installed via `npx playwright install chromium`
- Dedicated non-production backend, citizen app, and admin portal instances.

---

## 3. Environment Configuration

1. Copy `.env.e2e.example` to `.env.e2e.local` (which is git-ignored):
   ```bash
   cp .env.e2e.example .env.e2e.local
   ```

2. Fill in the required parameters in `.env.e2e.local`:

```ini
# Environment target: 'local', 'test', or 'staging'
E2E_ENV=local

# Base URLs (Origin URLs only, without trailing paths)
E2E_API_URL=http://127.0.0.1:8000
E2E_CITIZEN_URL=http://127.0.0.1:5173
E2E_PORTAL_URL=http://127.0.0.1:5174

# Staging only (ignored in local/test): comma-separated allowed HTTPS hostnames
E2E_ALLOWED_HOSTS=

# Safety Flags (Defaults to false)
E2E_ALLOW_MUTATIONS=false
E2E_RUN_RATE_LIMIT_TESTS=false

# Dedicated Test Personas (Provisioned via backend seeders)
E2E_SUPER_ADMIN_USERNAME=e2e.superadmin
E2E_SUPER_ADMIN_PASSWORD=SeededPassword123!
E2E_SUB_CITY_ADMIN_USERNAME=e2e.subcity
E2E_SUB_CITY_ADMIN_PASSWORD=SeededPassword123!
E2E_WOREDA_ADMIN_USERNAME=e2e.woreda
E2E_WOREDA_ADMIN_PASSWORD=SeededPassword123!
E2E_BUREAU_ADMIN_USERNAME=e2e.bureau
E2E_BUREAU_ADMIN_PASSWORD=SeededPassword123!
E2E_STAFF_USERNAME=e2e.staff
E2E_STAFF_PASSWORD=SeededPassword123!

# Seeded Organization Hierarchy Fixture IDs
E2E_SUB_CITY_ORG_ID=1
E2E_WOREDA_ORG_ID=2
E2E_BUREAU_ORG_ID=3
E2E_SIBLING_WOREDA_ORG_ID=4
E2E_SIBLING_BUREAU_ORG_ID=5
E2E_OTHER_SUB_CITY_ORG_ID=6
```

---

## 4. Running the Tests

### Fast Support / Harness Verification (Offline)
Runs unit checks on the config parser, URL guards, and API client request wrapper without network access or active servers:
```bash
npm run test:e2e:support
```

### API Integration Suite
Runs direct HTTP tests against the configured `/api/v1` backend:
```bash
npm run test:e2e:api
```
To run a specific API test file:
```bash
npx jest --config jest.config.cjs tests/api/auth.test.cjs
```

### Browser E2E Suite
Runs Playwright browser tests across the Citizen and Admin portals:
```bash
npm run test:e2e:browser
```
To run Playwright in headed or debug mode:
```bash
npx playwright test --config=playwright.config.cjs --headed
```

### Full Test Suite
Runs the support tests, API suite, and browser tests sequentially:
```bash
npm run test:e2e
```

---

## 5. Test Suite Inventory

| File | Type | Description |
|---|---|---|
| `tests/support/config.test.cjs` | Unit | Tests URL validation, loopback restriction, staging hostname checks, and persona lookups. |
| `tests/api/health.test.cjs` | API | Checks `/health` status, database connection envelope, and unexpected path rejections. |
| `tests/api/public-discovery.test.cjs` | API | Public service catalog, search/filter boundaries, ordering of steps, and 404 error envelopes. |
| `tests/api/public-content.test.cjs` | API | Documents catalog, news listing, and public feedback input validation without credentials. |
| `tests/api/auth.test.cjs` | API | Login validation, bad credentials, token revocation on logout, `/auth/me`, password change, and anti-enumeration forgot-password. |
| `tests/api/authorization.test.cjs` | API | Table-driven RBAC matrix asserting allowed vs 403 forbidden responses across all 5 roles. |
| `tests/api/organization-scope.test.cjs` | API | Multi-tenant isolation asserting roles cannot query or modify sibling/parent data outside their jurisdiction. |
| `tests/api/dashboard.test.cjs` | API | Tests `/dashboard/overview`, `/stats`, `/recent-activity`, and report metrics with invalid filter safety. |
| `tests/api/organizations.test.cjs` | CRUD / Integrity | Organization lifecycle, unique code guard, and child/user deletion protection. |
| `tests/api/users.test.cjs` | CRUD / Integrity | User lifecycle, duplicate guard, self-deletion guard, and last Super Admin deletion guard. |
| `tests/api/services.test.cjs` | CRUD / Integrity | Master & subservice lifecycle, document syncing, and active subservice deletion guard. |
| `tests/api/documents.test.cjs` | CRUD / Integrity | Document requirements create, update, detail, and delete. |
| `tests/api/service-steps.test.cjs` | CRUD / Integrity | Step creation, ordering, updating room numbers, and step reordering. |
| `tests/api/news.test.cjs` | CRUD / Integrity | News articles lifecycle, status transitions (draft to published), and scoped deletion. |
| `tests/api/feedback.test.cjs` | CRUD / Integrity | Public complaint submission with tracking number, scoped review, admin response, and cleanup. |
| `tests/browser/citizen-journeys.spec.cjs` | Browser | Citizen homepage, language toggle, news-events hash routing, and feedback submission form. |
| `tests/browser/portal-auth.spec.cjs` | Browser | Admin login validation, invalid password alert, demo workspace switching, and live login redirect. |
| `tests/browser/portal-role-access.spec.cjs` | Browser | Client-side RoleGuard blocking unauthorized portal routes per role. |
| `tests/browser/portal-failures.spec.cjs` | Browser | Controlled 500 error interception, network abort handling, and seamless service restoration. |

---

## 6. Review & Audit Checklist

- [x] Strict adherence to `backend/docs/api.md` unified response contracts (`{ success, message, data, errors }`).
- [x] Fail-closed target URL policy rejecting production hostnames.
- [x] Dedicated persona credential separation with zero hardcoded credentials in test files.
- [x] Graceful cleanup of disposable test fixtures via `FixtureTracker`.
- [x] Traceable status reporting in `tests/e2e/SCENARIOS.md`.
