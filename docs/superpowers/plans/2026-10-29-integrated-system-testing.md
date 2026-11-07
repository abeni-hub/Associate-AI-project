# Integrated System Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable API and browser test suite that finds functional, authorization, validation, and user-flow failures in Civic Link after backend integration.

**Architecture:** Add a root Jest runner for direct HTTP tests against the documented Laravel API. Add Playwright Test for browser flows through the separate citizen and admin apps, with normal journeys using the configured live API and narrowly controlled request failures for error-state checks. Keep scenario coverage in a matrix that distinguishes executable, integration-blocked, and intentionally out-of-scope cases.

**Tech Stack:** Node.js 20+, Jest, Playwright Test, dotenv, built-in `fetch`, Laravel API v1.

**Spec:** `docs/superpowers/specs/2026-10-29-integrated-e2e-testing-design.md`

## Global Constraints

- Use `backend/docs/api.md` as the authoritative `/api/v1` contract.
- Require explicit local, test, or staging URLs; reject production targets.
- Require dedicated non-production role accounts and organization fixtures for RBAC/scoping coverage.
- Use Jest for API tests and Playwright Test for browser tests.
- Use unique test data and cleanup; never change shared passwords or delete shared records.
- Keep unrestricted fuzzing off shared environments; use bounded deterministic adversarial cases.
- Mark missing UI/API integration as blocked in the scenario matrix instead of silently passing or skipping it.

## Review Focus

- Missing, malformed, and out-of-range fields return documented validation failures instead of 500s — covered in Tasks 2 and 4.
- Missing, invalid, revoked, or inactive credentials cannot access protected resources — covered in Tasks 2 and 5.
- Each role stays within its permission and organization scope, including descendant and sibling organizations — covered in Task 3.
- Duplicate, unknown, or dependent resources cannot corrupt data or bypass deletion guards — covered in Task 4.
- Login, navigation, retry, and server/network errors present recoverable user-visible states — covered in Task 5.

---

### Task 1: Establish the root test harness and scenario inventory

**Files:**
- Create: `package.json`
- Modify: `package-lock.json`
- Create: `jest.config.cjs`
- Create: `playwright.config.cjs`
- Create: `.env.e2e.example`
- Create: `tests/support/config.cjs`
- Create: `tests/support/api-client.cjs`
- Create: `tests/support/config.test.cjs`
- Create: `tests/e2e/SCENARIOS.md`

**Interfaces:**
- `loadE2EConfig(env) -> config` validates target environment and URLs without reading real secrets in unit tests.
- `request({ path, method, token, body, query, headers, timeoutMs }) -> { status, headers, data, raw }` performs one bounded HTTP request and preserves non-JSON responses for diagnostics.
- `getPersona(name)` returns a named role's username/password only when that suite needs it; missing required credentials fail with a direct setup message.

- [ ] Add a private root npm package with scripts for helper tests, API tests, browser tests, and the combined suite; add Jest, Playwright Test, and dotenv as development dependencies.
- [ ] Write `config.test.cjs` cases for missing URLs, malformed URLs, production target rejection, missing role credentials, and valid local/staging configuration; run the helper test and confirm it fails because the loader is absent.
- [ ] Implement the environment loader and API client; rerun helper tests and confirm configuration errors are actionable and requests preserve status/body on both JSON and non-JSON responses.
- [ ] Configure Jest to run API specs serially and Playwright with separate citizen/portal projects, explicit base URLs, traces on failure, and one worker for mutation safety.
- [ ] Add the blank `.env.e2e.example` contract and scenario matrix, listing each documented API group, each backend role, expected access outcome, and browser flow status as covered, blocked by integration, or out of scope.

### Task 2: Cover health, public discovery, and authentication contracts

**Files:**
- Create: `tests/api/health.test.cjs`
- Create: `tests/api/public-discovery.test.cjs`
- Create: `tests/api/public-content.test.cjs`
- Create: `tests/api/auth.test.cjs`
- Modify: `tests/e2e/SCENARIOS.md`

**Interfaces:**
- Use `request` and `getPersona` from Task 1. These tests do not create or delete shared records.

- [ ] Add failing API assertions for health status/database status, public services, documents, and news envelopes, documented filter boundaries, unknown resource IDs, and public service-step ordering.
- [ ] Check that public feedback submissions reject missing or malformed input with the documented validation envelope without credentials; successful feedback creation belongs to the mutation-gated lifecycle suite.
- [ ] Add authentication assertions for empty/whitespace fields, invalid credentials, username/email login, `/auth/me` without/with a token, logout token revocation, wrong current password, password confirmation mismatch, invalid reset token, and generic forgot-password response.
- [ ] Add a gated rate-limit scenario that runs only with `E2E_RUN_RATE_LIMIT_TESTS=true` against the dedicated isolated target; serialize it after other login scenarios and never loop indefinitely.
- [ ] Run the API suite against the configured test target and update the matrix with actual covered statuses and any contract mismatches.

### Task 3: Exercise role permissions and organization scoping

**Files:**
- Create: `tests/api/authorization.test.cjs`
- Create: `tests/api/organization-scope.test.cjs`
- Create: `tests/api/dashboard.test.cjs`
- Modify: `tests/e2e/SCENARIOS.md`

**Interfaces:**
- Role actors are configured as `super_admin`, `sub_city_admin`, `woreda_admin`, `bureau_admin`, and `staff` personas.
- Organization fixture IDs identify one Sub-City, its Woreda and Bureau descendants, a sibling organization, and a separate Sub-City.

- [ ] Add a table-driven permission matrix for all documented API groups, including News, Feedback, and Dashboard; assert public, authenticated, and permission-gated behavior for every backend role.
- [ ] Add scope assertions: Super Admin sees platform data; Sub-City Admin sees its root and descendants; Woreda Admin sees its Woreda and descendant Bureaus; Bureau Admin and Staff see only their own organization. Assert that sibling/parent data is never leaked, even if the API returns 403 or an empty scoped list.
- [ ] Assert dashboard scope metadata for each role and cover invalid/out-of-scope report filters. Record undocumented feedback detail/update/respond/delete contracts as inventory gaps rather than inventing response shapes.
- [ ] Add organization hierarchy edge cases for invalid parent types, missing IDs, sibling access, and root/descendant filters; assert that forbidden writes do not alter records.
- [ ] Run the matrix serially and record each role × endpoint outcome in `SCENARIOS.md`.

### Task 4: Cover CRUD lifecycles, input boundaries, and integrity guards

**Files:**
- Create: `tests/api/organizations.test.cjs`
- Create: `tests/api/users.test.cjs`
- Create: `tests/api/services.test.cjs`
- Create: `tests/api/documents.test.cjs`
- Create: `tests/api/service-steps.test.cjs`
- Create: `tests/api/news.test.cjs`
- Create: `tests/api/feedback.test.cjs`
- Create: `tests/support/fixtures.cjs`
- Modify: `tests/e2e/SCENARIOS.md`

**Interfaces:**
- `createRunRecord(kind, payload)` uses a unique run prefix and returns the created resource ID.
- `cleanupRunRecords(records)` deletes users first, then child organizations before parents, then services/documents/steps; cleanup errors include resource IDs and fail the run.

- [ ] Add failing lifecycle assertions for create/list/detail/update/delete on organizations, users, services, documents, service steps, and news using unique records; exercise public feedback submission, scoped review, status/response actions, and deletion.
- [ ] Add validation partitions for required, null, wrong-type, empty, boundary, overlong, malformed, duplicate, hostile string, unknown identifier, and invalid relationship inputs where the endpoint accepts those fields.
- [ ] Add documented integrity guards: organization deletion with children/users, service deletion with active subservices, self-deletion, last Super Admin deletion, forbidden permission updates, password reset token revocation, and cross-organization News/Feedback writes.
- [ ] Implement the fixture helper with guaranteed cleanup in `finally`/`afterAll`; verify a failed assertion still attempts cleanup and does not touch records without the run prefix.
- [ ] Keep write tests disabled unless `E2E_ALLOW_MUTATIONS=true` and the target is non-production; run them against a disposable seeded target and update matrix results.

### Task 5: Add browser end-to-end flows and controlled failure states

**Files:**
- Create: `tests/browser/citizen-journeys.spec.cjs`
- Create: `tests/browser/portal-auth.spec.cjs`
- Create: `tests/browser/portal-role-access.spec.cjs`
- Create: `tests/browser/portal-failures.spec.cjs`
- Modify: `playwright.config.cjs`
- Modify: `tests/e2e/SCENARIOS.md`

**Interfaces:**
- Citizen and portal projects use their configured base URLs. Portal credentials come from the same named personas as the API suite.
- Browser tests interact through accessible roles, labels, and visible text; they do not inspect React state or Redux internals.

- [ ] Add citizen journeys for public service/news discovery, service detail, required documents, ordered service steps, and feedback submission; if the client screens are not yet wired to the API, record these rows as integration-blocked and do not replace them with mocked-success tests.
- [ ] Add portal journeys for blank/invalid/valid login, role-specific allowed and disallowed routes, logout, and a fresh browser context without a prior token.
- [ ] Add controlled browser request-abort and 5xx cases to assert visible recovery/error states; normal journeys must reach the configured backend without request mocking.
- [ ] Run browser tests serially in Chromium, capture traces/screenshots for failures, and record integration-blocked coverage explicitly.

### Task 6: Document safe operation and end-to-end execution

**Files:**
- Create: `docs/e2e-testing.md`
- Modify: `package.json`
- Modify: `tests/e2e/SCENARIOS.md`

- [ ] Document Node and browser prerequisites, how to copy `.env.e2e.example` to ignored `.env.e2e.local`, how to provision the five personas and organization hierarchy, and how to start the client, portal, and API.
- [ ] Document commands `npm run test:e2e:support`, `npm run test:e2e:api`, `npm run test:e2e:browser`, and `npm run test:e2e`; explain the opt-in rate-limit and mutation safeguards.
- [ ] Run helper tests without external services; run the configured API and browser suites only when dedicated URLs/fixtures are available; report unavailable integration coverage as unverified rather than passing.
- [ ] Review the matrix against every route in `backend/docs/api.md` and every committed browser spec; correct any endpoint, role, or scenario with no traceable test.
