# Integrated System Testing Design

## Intent

Provide repeatable, professional end-to-end coverage for Civic Link after its public client and admin portal are integrated with the Laravel API. The suite should reveal regressions in normal user journeys, authorization boundaries, invalid input handling, and failure responses.

## Goals

- Use Jest for black-box API tests against a running, non-production backend.
- Use Playwright Test for browser journeys through the citizen client and admin portal against the real API.
- Cover documented API behavior for health, public service, document and news discovery, feedback submission and administration, authentication, authorization, organization and user management, services, documents, service steps, and dashboards.
- Exercise unauthenticated, invalid-credential, invalid-input, insufficient-role, out-of-scope, missing-resource, and server/network failure cases.
- Make test accounts and base URLs configurable through environment variables; never embed credentials.
- Use isolated test data and clean up records created by mutation scenarios.
- Cover the currently documented News, Feedback, and Dashboard API routes. Events remain out of scope because the current API has no Events endpoints.

## Non-goals

- Claim to test every possible input or prove security in place of a security review.
- Change application behavior or implement the missing API integrations.
- Run against production data or depend on demo/local state as evidence of backend behavior.

## Approaches

1. **Hybrid API and browser suite (selected):** Jest probes the documented REST API directly, while Playwright Test checks real user-visible browser flows. This covers detailed API edge cases and verifies that both frontend applications work with the backend.
2. **Jest API suite only:** direct HTTP tests are simpler and stable, but cannot catch frontend routing, form, session, or rendering failures.
3. **Browser suite only:** user journeys exercise the full stack, but are slower and less precise for exhaustive validation and authorization matrices.

## Test scope

- The authoritative contract is `backend/docs/api.md`, REST API version `/api/v1`. API checks assert its response envelope and expected status codes. Negative requests verify that malformed or hostile inputs fail safely and do not produce unhandled server errors.
- Authentication checks cover required fields, invalid credentials, inactive or unauthorized sessions where fixtures support them, profile access, logout, and password-operation validation without changing shared credentials.
- Authorization checks cover anonymous requests, role-specific permissions, and organization hierarchy boundaries: Super Admin is platform-wide; Sub-City Admin is scoped to its sub-city and descendants; Woreda Admin is scoped to its woreda and descendant bureaus; Bureau Admin and Staff are scoped to their own bureau.
- Browser role journeys cover the portal's supported `super`, `subcity`, and `bureau` roles. API authorization remains authoritative for all five backend roles, including Woreda Admin and Staff.
- CRUD scenarios use uniquely named test records and remove them after each test. Tests requiring destructive or irreversible actions must run only against a dedicated test environment.
- Browser checks cover citizen service, document, and news discovery, feedback submission, admin sign-in and sign-out, session restoration, permitted pages, and redirects for disallowed roles. Selectors should use accessible labels and roles.
- Mark a browser journey integration-blocked when the frontend is still backed by local/demo data or calls a route absent from the API contract. Do not use mocked-success responses as a substitute for an integrated journey.

## Scenario discovery and coverage

- Track coverage as a matrix of API endpoint × caller role × expected outcome, plus one row per user-visible browser journey. Mark each row covered after an executed assertion, implemented/unverified while integration is pending, blocked by missing integration, or intentionally out of scope.
- For every request field, use equivalence classes (valid, missing, null, wrong type, malformed, hostile) and boundary values (empty, minimum, maximum, just outside limits, and unusually long input) where the contract defines a limit.
- Use decision tables for permission and organization-scope rules, and state-transition sequences for login, active/deactivated accounts, create/update/delete, and logout/revoked-token behavior.
- Use pairwise combinations for independent filters and browser conditions. Keep adversarial inputs bounded and deterministic against live environments; do not run unrestricted fuzzing against a shared backend.
- Keep a reviewable scenario inventory so an uncovered or integration-blocked case is visible. A green run means the listed scenarios passed, not that every mathematically possible input was tried.

## Constraints and implementation calls

- The root currently has no Jest setup. The client and portal are separate Vite apps; the client currently relies on local catalog data and requests some news/events routes absent from the API contract. The portal has live authentication but much of its content remains local demo state.
- The current backend contract includes News, Feedback, and Dashboard APIs, but no Events API. Feedback detail/update/respond/delete routes exist in `backend/routes/api.php`, but their request/response contracts are incomplete in `backend/docs/api.md`; assert their documented permission behavior and record the contract gaps rather than inventing response shapes.
- Tests target explicitly configured, running local or staging URLs rather than booting Laravel or creating/resetting a database implicitly. The suite does not add CI wiring.
- A dedicated, non-production test environment must provide test accounts for all five backend roles and the hierarchy fixture needed for cross-organization checks. Required configuration is validated up front; missing required fixtures fail setup with a direct message instead of silently skipping security coverage.
- Test-created records use unique run identifiers and are deleted in cleanup. Inactive-account cases use a dedicated disposable account and must not change shared credentials.
- Network and server-error UI paths are induced with controlled browser request aborts or test responses; normal end-to-end journeys use the real configured API.
- Playwright's JavaScript runner is used for browser tests because it provides browser-focused isolation, reporting, and debugging. Jest remains the API test runner.
- The suite must not call public or production endpoints by default; required test URLs are explicit configuration.

## Builder decisions

- Choose stable, user-visible controls and test IDs only where accessible selectors are insufficient.
- Group tests by API domain and user journey, with scenario names describing expected behavior.
- Prefer independent tests; serialize only flows that must share a newly created record.
