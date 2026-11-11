# Organization Type Localization (English / Amharic / Oromigna)

Mirrors the news-content localization already shipped: new columns + fillable + validation + persistence + nested response shape.

## Decisions (confirmed with user)

- Localized fields: **`name` and `description`** (both).
- Response shape: nested objects everywhere:
  `"name": {"eng": ..., "amh": ..., "oro": ...}` and `"description": {"eng": ..., "amh": ..., "oro": ...}`.
- Column types: `name_amh`, `name_oro` => `NOT NULL DEFAULT ''`; `description_amh`, `description_oro` => `nullable()` (mirrors nullable English `description`).
- Nest the type `name` in **all three** resources that embed it, so one fact has one shape.
- Scope: **backend only**. Portal/client breakage is recorded as follow-up risk, not fixed here.

## Affected files (complete list)

Backend:
- `backend/database/migrations/*_add_localization_to_organization_types.php` (new, via `php artisan make:migration`)
- `backend/app/Domains/Models/OrganizationType.php` — `$fillable`
- `backend/app/Http/Controllers/Api/V1/Organizations/OrganizationTypeController.php` — `store()` + `update()` validation and null→`''` handling
- `backend/app/Http/Resources/Api/V1/OrganizationTypeResource.php` — `name`, `description`, and `allowed_parent_types[].name`
- `backend/app/Http/Resources/Api/V1/OrganizationResource.php:35` — `type.name`
- `backend/app/Http/Resources/Api/V1/UserResource.php:34` — `organization.type.name`
- `backend/tests/Feature/Api/V1/Organizations/OrganizationManagementTest.php` — extend + new tests
- `backend/docs/api.md` (§5 `GET /organization-types` sample) and `backend/docs/database-design.md` (`organization_types` column list)

Test-suite prerequisite:
- `backend/database/seeders/OrganizationTypeSeeder.php`, `PermissionSeeder.php`, `RoleSeeder.php` (restore verbatim from `backend22/`)
- `backend/phpunit.xml` DB env alignment

Deferred (documented risk, user chose backend-only): `portal/src/services/organizationsApi.ts`, `portal/src/pages/LevelsPage.tsx`, `portal/src/components/levels/LevelModal.tsx`, `portal/src/pages/OfficesPage.tsx:241`, `portal/src/components/offices/OfficeHierarchyTree.tsx:177`, `portal/src/components/modals/QRDialog.tsx:264`.

## Tasks

### Task 0 — Make the test suite runnable (prerequisite)

Today `php artisan test` fails twice over, independent of this change:
1. `phpunit.xml` sets `DB_PORT=5432`, `DB_USERNAME=postgres`, `DB_DATABASE=government_db_test`; `.env` uses `5433` / `government` / `government_db` and no `DB_PASSWORD` is set in phpunit, so it inherits `.env`'s password against the wrong user/port.
2. `backend/database/seeders/` has no `OrganizationTypeSeeder` / `PermissionSeeder` / `RoleSeeder`, yet essentially every test seeds them (they exist only under `backend22/`).

Steps:
1. Copy the three seeder files verbatim from `backend22/database/seeders/` into `backend/database/seeders/` (no edits — `git diff --stat` should show pure additions).
2. Edit `backend/phpunit.xml`: set `DB_PORT=5433` and `DB_USERNAME=government` to match `.env`. Keep `DB_DATABASE=government_db_test` (the `RefreshDatabase` suite wipes its DB — never point it at `government_db`). **Do not commit a password**; leave `DB_PASSWORD` out of phpunit so it comes from the local `.env`.
3. Create the test DB on the dev instance if it does not exist: `createdb`/`psql -h 127.0.0.1 -p 5433 -U government -c "CREATE DATABASE government_db_test;"` (adjust if Postgres runs in Docker).
4. Gate: `php artisan test --compact tests/Feature/Api/V1/Organizations/OrganizationManagementTest.php` must pass **before** touching localization code.

### Task 1 — Migration

`php artisan make:migration add_localization_to_organization_types --table=organization_types --no-interaction`, then in `up()`:
```php
$table->string('name_amh')->default('');      // NOT NULL, mirrors 'name'
$table->string('name_oro')->default('');
$table->text('description_amh')->nullable();
$table->text('description_oro')->nullable();
```
`down()`: `dropColumn(['name_amh','name_oro','description_amh','description_oro'])`.
`NOT NULL DEFAULT ''` fills existing rows immediately (cheap on PG11+). English `name` keeps its `unique` constraint; localized names are **not** unique.

### Task 2 — Model

`OrganizationType::$fillable`: add `'name_amh', 'name_oro', 'description_amh', 'description_oro'`. No casts needed (plain strings).

### Task 3 — Controller validation + persistence

In `store()` and `update()` rules (mirroring `name`/`description`):
```php
'name_amh'        => ['sometimes', 'string', 'max:255'],
'name_oro'        => ['sometimes', 'string', 'max:255'],
'description_amh' => ['nullable', 'string', 'max:1000'],
'description_oro' => ['nullable', 'string', 'max:1000'],
```
Before the create/update call, coalesce so an explicit `null` never hits the `NOT NULL` columns:
```php
foreach (['name_amh', 'name_oro'] as $k) {
    if (array_key_exists($k, $validated)) {
        $validated[$k] = $validated[$k] ?? '';
    }
}
```
(`description_*` stay untouched: `null` is legal there.) `update()` already does `$organizationType->update($validated)`, so absent keys leave old values alone.

### Task 4 — Responses (nested everywhere)

Helper shape — write it inline at each site (no new abstraction):
```php
'name' => ['eng' => $this->name, 'amh' => $this->name_amh, 'oro' => $this->name_oro],
'description' => ['eng' => $this->description, 'amh' => $this->description_amh, 'oro' => $this->description_oro],
```
Apply to:
1. `OrganizationTypeResource` — replace flat `name`/`description`; also nest `name` inside the `allowed_parent_types` map (it emits id/name/code only — leave it at name-only, no description).
2. `OrganizationResource::type` block — nest `name` only (`description` is not emitted there; do not add it).
3. `UserResource::organization.type` block — nest `name` only.

`code`, `level`, `is_active`, `can_be_root` untouched.

### Task 5 — Tests (`OrganizationManagementTest`)

1. Extend `test_can_list_organization_types`: assert `data.*.name` and `data.*.description` have `eng/amh/oro`.
2. New `test_can_create_organization_type_with_localized_fields`: super admin POSTs `name`/`name_amh`/`name_oro`/`description_amh`/`description_oro`, asserts 201, `assertDatabaseHas('organization_types', [...])`, and response nests them.
3. New `test_localized_fields_default_when_omitted`: POST without the localized keys, assert `name_amh === ''`, `description_amh === null` (proves the `?? ''` coalesce vs nullable description split).
Run: `php artisan test --compact tests/Feature/Api/V1/Organizations/OrganizationManagementTest.php`.

### Task 6 — Docs + format

- `docs/api.md` §5 GET sample: `name`/`description` become the nested objects.
- `docs/database-design.md` `organization_types` column list: add the four columns.
- `vendor/bin/pint --dirty --format agent`.

## Risks / follow-ups

- **Portal renders `[object Object]`** for type names until the deferred TS work lands (`LevelsPage`, `OfficesPage:241`, `OfficeHierarchyTree:177`, `QRDialog:264`, `organizationsApi.ts` types). Same breakage already exists for news content (`NewsPage`, `NewsDetailPage`, `NewsModal`, `client/.../newsEventsService.js` read flat `.content`) — unrelated to this change, owned by the speaker.
- Existing seeded types have no translations: responses will show `"amh": ""` / `"description": {"amh": null}` until staff enter values (there are no portal inputs yet — full portal input is explicitly out of scope).
- `name` uniqueness applies only to English; two types may share an Amharic name (accepted).
- No test asserts `type.name` scalar today, so no existing assertion breaks; e2e suite only checks status codes for `/organization-types`.
- `backend22/` and `backend/` are parallel copies — touch **only** `backend/`.