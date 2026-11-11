# Government Citizen Engagement Platform (CivicLink) — Architecture Specification

## 1. System Overview

The **Government Citizen Engagement Platform (CivicLink)** is a centralized, modular backend service built with **Laravel 13** and **PostgreSQL** serving Ethiopian Government entities (Sub-Cities, Woredas, Bureaus) and citizens.

The platform provides citizen transparency, public service catalog discovery, room-by-room physical routing, official announcements, citizen feedback submission, and hierarchy-aware administrative operations.

---

## 2. Technology Stack & Runtime

- **Framework**: Laravel 13 (`laravel/framework: v13.38.0`)
- **PHP Runtime**: PHP 8.5+ (64-bit)
- **Database**: PostgreSQL (`pgsql` driver via PDO)
- **Authentication**: Laravel Sanctum (`laravel/sanctum: v4.3.3`) supporting both stateful SPA session cookie authentication and Bearer API tokens
- **API Architecture**: Versioned RESTful API (`/api/v1`)
- **Code Quality**: Laravel Pint (`laravel/pint`), PHPUnit 12

---

## 3. High-Level Modular Monolith Architecture

The application adopts a **domain-oriented modular architecture** embedded within Laravel's standard directory structure:

```
app/
├── Domains/
│   ├── AuditLogs/          # Immutable audit logging with full JSON diagnostics
│   ├── Authentication/     # Session state, login rate limiting, password reset
│   ├── Authorization/      # Scoped RBAC, role hierarchy & granular CRUD flags
│   ├── Cms/                # Super Admin Landing Page CMS (8 sections & hero slides)
│   ├── Dashboard/          # Role and organization-scoped reporting queries
│   ├── Documents/          # Required document definitions and service mappings
│   ├── Events/             # Civic community events with multi-image photo gallery
│   ├── Feedback/           # Citizen complaints, suggestions, satisfaction feedback
│   ├── Navigation/         # Dynamic database-driven sidebar navigation items
│   ├── News/               # Official press releases & news management
│   ├── Organizations/      # Statutory organization hierarchy (Sub-City, Woreda, Bureau)
│   ├── QrCodes/            # Desk/office QR poster tokens & public citizen scan tracking
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

## 4. Key Architectural Pillars

### 4.1. Dynamic Database-Driven Sidebar Navigation
Rather than hardcoding sidebar navigation inside frontend code or relying on complex recursive database queries, navigation is managed dynamically via `navigation_items` and `role_navigation_items`:
- **Flat Schema:** Navigation items have no `parent_id` column, eliminating recursive CTE queries and tree-to-JSON serialization overhead.
- **Role-Aware Delivery:** Authenticated users query `GET /api/v1/navigation/sidebar` on login. The backend delivers only items authorized for their role, ordered by `display_order`.
- **RBAC Alignment:**
  - *Super Admin (8 items):* Overview, Sub-cities, Accounts, Feedback, Services, Routes, QR Poster, CMS.
  * *Sub-City Admin (7 items):* All items except CMS.
  * *Woreda / Bureau Admin (6 items):* Overview, Accounts, Feedback, Services, Routes, QR Poster.
  * *Staff (4 items):* Overview, Feedback, Services, Routes.

### 4.2. Statutory Organizational Hierarchy (No Allowed Parents Pivot)
In Ethiopian public administration, government tiers are statutory and immutable:
$$\text{Level 1 (Sub-City)} \longrightarrow \text{Level 2 (Woreda)} \longrightarrow \text{Level 3 (Bureau)}$$
- The structural tree is modeled by a self-referencing foreign key: `organizations.parent_organization_id`.
- Boundary rules (e.g. a Woreda must choose a parent Sub-City, a Sub-City cannot report to a Woreda) are enforced cleanly in application business logic via `OrganizationType::isAllowedParentType()` (`$parentType->level < $this->level`) and Laravel Form Requests (`CreateOrganizationRequest`, `UpdateOrganizationRequest`).
- This eliminates unnecessary database junction table maintenance while guaranteeing data integrity.

### 4.3. Multi-Tier Administrative Scoping & Privilege Escalation Protection
- System roles carry an explicit `scope_level`: `global`, `sub_city`, `woreda`, `bureau`.
- `OrganizationScopeService` restricts database queries so that Sub-City Administrators can only access or modify records within their own Sub-City hierarchy.
- Privileges are strictly bounded: an administrator cannot assign or edit accounts with an administrative scope level higher than their own rank (`$actorRole->canManageScope($targetRole->scope_level)`), preventing privilege escalation.

### 4.4. Forensic Audit Logging with JSON Payloads
The `audit_logs` table provides complete forensic accountability for critical administrative operations:
- **Execution Outcome:** Tracks `status` (`'success'` vs `'failed'`) and integer HTTP `status_code` (e.g., 200, 201, 403, 422, 500).
- **Request Payload (`request_payload` JSONB):** Automatically captures the incoming HTTP request body and parameters with sensitive keys (`password`, `secret`, `token`) stripped or masked.
- **Response Payload (`response_payload` JSONB):** Records the returned JSON response or the detailed exception stack trace on operational failure.
- **Entity Snapshots:** Records `old_values` and `new_values` for full before-and-after change diffs.

---

## 5. API Standardization & Response Envelope

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

### Error Envelope
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "field_name": [
      "The field_name is required."
    ]
  }
}
```
