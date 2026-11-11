# E2E Scenario Inventory

Source of API expectations: `backend/docs/api.md`, `backend/routes/api.php`, and the current `RoleSeeder`. Role names below match backend slugs. “Implemented / unverified” means a test is authored but has not run against a completed integration target.

## API access and role matrix

| API group and endpoint set | Required access | Super Admin | Sub-City Admin | Woreda Admin | Bureau Admin | Staff |
|---|---|---:|---:|---:|---:|---:|
| `GET /health`; public `GET /services`, `/services/{service}`, `/documents`, `/documents/{document}`, `/services/{service}/steps[/{step}]`, `/news`, `/news/{news}` | Public | 200/404 | 200/404 | 200/404 | 200/404 | 200/404 |
| `POST /feedbacks` | Public; validated input, then 201; bounded rate limit may return 429 | 201/422/429 | 201/422/429 | 201/422/429 | 201/422/429 | 201/422/429 |
| `POST /auth/login`, `/auth/forgot-password`, `/auth/reset-password` | Public; validation and credentials decide result | Public | Public | Public | Public | Public |
| `GET /auth/me`, `POST /auth/logout`, `PUT /auth/change-password` | Active authenticated account | 200/422 | 200/422 | 200/422 | 200/422 | 200/422 |
| `GET /roles`, `GET /roles/{role}`, `GET /permissions` | `roles.view` | 200 | 403 | 403 | 403 | 403 |
| `PUT /roles/{role}/permissions` | `roles.manage`; Super Admin role itself is protected | 200/422 | 403 | 403 | 403 | 403 |
| `GET /organization-types`, `GET /organizations[/{organization}]`, `GET /organizations/tree` | `organizations.view` | 200/404 | 200/404 | 200/404 | 200/404 | 403 |
| `POST /organizations` | `organizations.create` | 201/422 | 403 | 403 | 403 | 403 |
| `PUT /organizations/{organization}` | `organizations.update` | 200/422 | 200/422 in scope | 403 | 403 | 403 |
| `DELETE /organizations/{organization}` | `organizations.delete`; child/user guard may return 422 | 200/422 | 403 | 403 | 403 | 403 |
| `GET /users[/{user}]` | `users.view` | 200/404 | 200/404 | 200/404 | 200/404 | 403 |
| `POST /users` | `users.create` | 201/422 | 201/422 in scope | 201/422 in scope | 403 | 403 |
| `PUT /users/{user}`, `DELETE /users/{user}` | `users.update` / `users.delete`; self and last-Super-Admin guards apply | 200/422 | 200/422 in scope | 403 | 403 | 403 |
| `POST /users/{user}/reset-password` | `users.reset_password`; revokes target tokens | 200/422 | 200/422 in scope | 200/422 in scope | 403 | 403 |
| `POST /services` | `services.create` | 201/422 | 403 | 403 | 403 | 403 |
| `PUT /services/{service}`, `DELETE /services/{service}` | `services.update` / `services.delete`; active subservice guard applies | 200/422 | 403 | 403 | 403 | 403 |
| `POST /services/{service}/documents` | `documents.manage` | 200/422 | 200/422 | 403 | 403 | 403 |
| `POST /services/{service}/organizations` | `services.manage` | 200/422 | 200/422 | 403 | 403 | 403 |
| `POST /documents`, `PUT /documents/{document}`, `DELETE /documents/{document}` | `documents.manage` | 201/200/422 | 201/200/422 | 403 | 403 | 403 |
| `POST /services/{service}/steps`, `PUT/DELETE /services/{service}/steps/{step}`, `POST /services/{service}/steps/reorder` | `service_steps.manage` | 201/200/422 | 201/200/422 | 201/200/422 | 201/200/422 | 403 |
| `POST /news` | `news.create` | 201/422 | 201/422 in scope | 201/422 in scope | 201/422 in scope | 403 |
| `PUT /news/{news}` | `news.update` plus authoring-organization scope | 200/422 in scope | 200/422 in scope | 200/422 in scope | 200/422 in scope | 403 |
| `DELETE /news/{news}` | `news.delete` plus authoring-organization scope | 200/422 in scope | 200/422 in scope | 403 | 403 | 403 |
| `GET /feedbacks[/{feedback}]` | `feedback.view_own` or `feedback.view_descendants` | 200 | 200 in scope | 200 in scope | 200 in scope | 200 in own scope |
| `PUT /feedbacks/{feedback}`, `POST /feedbacks/{feedback}/respond`, `DELETE /feedbacks/{feedback}` | `feedback.update_status` plus organization scope | 200/422 | 200/422 in scope | 200/422 in scope | 200/422 in scope | 403 |
| `GET /dashboard/overview`, `/stats`, `/reports/{feedback,services,organizations}`, `/recent-activity` | `dashboard.view`; scoped to role hierarchy | 200, global | 200, sub-city + descendants | 200, woreda + bureaus | 200, own bureau | 200, own bureau |

All documented protected groups also require an active authenticated account; missing, invalid, or revoked tokens must return 401. Permission outcomes are based on `RoleSeeder` and route middleware. Positive mutation outcomes are exercised only by the disposable-data suite.

## Contract and integration gaps

| Scenario | Status | Notes |
|---|---|---|
| Events API | Integrated | Added `EventController`, `eventsApi` (Portal & Client), public & administrative event routes (`/api/v1/events`). |
| Landing Page CMS | Integrated | Added `CmsController`, `cmsApi` (Portal & Client), public & administrative CMS routes (`/api/v1/cms/landing-page`). |
| Dynamic Navigation | Integrated | Added `NavigationController`, `navigationApi`, live sidebar navigation synced to role permissions (`/api/v1/navigation/sidebar`). |
| QR Code Management | Integrated | Added `QrCodeController`, `qrCodesApi`, poster scanning & generation routes (`/api/v1/qr-codes`). |
| Feedback detail & respond payloads | Integrated | Connected `updateFeedbackStatus`, `respondToFeedback`, and official response note submission in `FeedbackDetail`. |
| Client catalog & visit guide | Integrated | Wired `useGetServicesQuery`, `useGetOrganizationsQuery`, `useGetServiceStepsQuery` into client `HomePage` & `QuickSearchSection`. |
| Client news/feedback backed by API | Integrated | Client utilizes live `/api/v1/news`, `/api/v1/events`, and `/api/v1/feedbacks` with graceful fallbacks. |
| Portal admin data pages backed by API | Integrated | All portal modules (Overview, Offices, Accounts, Roles, Services, Routes, Feedback, News, Activity, QR, CMS) wired to backend API. |

## Execution status

| Suite | Status | Details |
|---|---|---|
| Jest support helpers | Verified | `npm run test:e2e:support` (26/26 passed) |
| Jest API contract & auth cases | Implemented / unverified | `tests/api/health.test.cjs`, `public-discovery.test.cjs`, `public-content.test.cjs`, `auth.test.cjs` |
| Jest RBAC, scoping & dashboard | Implemented / unverified | `tests/api/authorization.test.cjs`, `organization-scope.test.cjs`, `dashboard.test.cjs` |
| Jest mutation & cleanup cases | Implemented / unverified | `tests/api/organizations.test.cjs`, `users.test.cjs`, `services.test.cjs`, `documents.test.cjs`, `service-steps.test.cjs`, `news.test.cjs`, `feedback.test.cjs` (gated by `E2E_ALLOW_MUTATIONS=true`) |
| Playwright browser journeys | Implemented / unverified | `tests/browser/citizen-journeys.spec.cjs`, `portal-auth.spec.cjs`, `portal-role-access.spec.cjs`, `portal-failures.spec.cjs` (15 tests registered in Playwright runner) |

The API and browser suites target explicitly configured local/test/staging systems. Each scenario is authored to exercise real endpoint contracts and error boundaries. A scenario is marked verified after running against the live integrated deployment.
