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

Authentication supports both **Bearer API Tokens** (recommended for Postman, Mobile, and API clients) and **Laravel Sanctum Stateful SPA Cookies** (for web SPAs).

#### Using Bearer Tokens (Postman / Mobile / API clients):
1. Call `POST /api/v1/auth/login`. The response includes a `token` (and `token_type: "Bearer"`).
2. For all subsequent requests, add the header:
   ```http
   Authorization: Bearer <your_token_here>
   ```

#### Using Stateful SPA Cookies:
1. Initialize CSRF protection: `GET /sanctum/csrf-cookie` (sets `XSRF-TOKEN` cookie).
2. Pass the `Referer` header matching the allowed stateful domain (e.g. `Referer: http://127.0.0.1:8000`).
3. Pass the `X-XSRF-TOKEN` header on all mutation requests (`POST`, `PUT`, `DELETE`).

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
    "created_at": "2026-10-25T00:00:00+03:00",
    "token": "1|abcdef1234567890abcdef...",
    "token_type": "Bearer"
  },
  "errors": null,
  "meta": {
    "token": "1|abcdef1234567890abcdef...",
    "token_type": "Bearer",
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

---

## 3. Authorization & Role Management

Protected endpoints for managing roles, permissions, and organization-scoped authorization.

### `GET /api/v1/roles`
List all platform roles along with their permission counts.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `roles.view` (or Super Admin)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Roles retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "slug": "super_admin",
      "description": "Platform-wide administrator with full authority across all modules.",
      "is_system": true,
      "is_active": true,
      "permissions_count": 35,
      "created_at": "2026-10-25T00:00:00+03:00"
    },
    {
      "id": 2,
      "name": "Sub-City Admin",
      "slug": "sub_city_admin",
      "description": "Sub-City level administrator managing own organization and descendant Woredas/Bureaus.",
      "is_system": true,
      "is_active": true,
      "permissions_count": 22,
      "created_at": "2026-10-25T00:00:00+03:00"
    }
  ],
  "errors": null
}
```

---

### `GET /api/v1/roles/{id}`
Retrieve full details of a specific role including its complete permissions list.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `roles.view` (or Super Admin)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Role retrieved successfully.",
  "data": {
    "id": 2,
    "name": "Sub-City Admin",
    "slug": "sub_city_admin",
    "description": "Sub-City level administrator managing own organization and descendant Woredas/Bureaus.",
    "is_system": true,
    "is_active": true,
    "permissions": [
      {
        "id": 1,
        "key": "organizations.view",
        "name": "View Organizations",
        "group": "organizations",
        "description": "View organization profiles and hierarchy."
      },
      {
        "id": 5,
        "key": "users.create",
        "name": "Create Users",
        "group": "users",
        "description": "Create staff or administrative users."
      }
    ],
    "created_at": "2026-10-25T00:00:00+03:00"
  },
  "errors": null
}
```

---

### `PUT /api/v1/roles/{id}/permissions`
Synchronize and update permissions assigned to a role.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `roles.manage` (or Super Admin)
- **Request Body**:
```json
{
  "permission_ids": [1, 2, 5, 8, 12]
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Role permissions updated successfully.",
  "data": {
    "id": 5,
    "name": "Staff",
    "slug": "staff",
    "description": "Operational government staff member.",
    "is_system": true,
    "is_active": true,
    "permissions": [
      {
        "id": 1,
        "key": "organizations.view",
        "name": "View Organizations",
        "group": "organizations",
        "description": "View organization profiles and hierarchy."
      }
    ],
    "created_at": "2026-10-25T00:00:00+03:00"
  },
  "errors": null
}
```
- **Error Response — Super Admin Protection (422)**:
```json
{
  "success": false,
  "message": "Super Admin permissions cannot be modified.",
  "data": null,
  "errors": null
}
```

---

### `GET /api/v1/permissions`
List all platform permissions grouped by domain.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `roles.view` (or Super Admin)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Permissions retrieved successfully.",
  "data": [
    {
      "id": 1,
      "key": "organizations.view",
      "name": "View Organizations",
      "group": "organizations",
      "description": "View organization profiles and hierarchy."
    },
    {
      "id": 2,
      "key": "organizations.create",
      "name": "Create Organizations",
      "group": "organizations",
      "description": "Create new government organizations."
    }
  ],
  "errors": null
}
```

---

## 4. Organization Data Scoping Architecture

The platform applies strict hierarchy-aware data scoping across all modules:

1. **Super Admin**: Platform-wide unrestricted scope (`getAllowedOrganizationIds` returns `null`).
2. **Sub-City Admin**: 
   - Scoped to own Sub-City.
   - For modules with descendant visibility (e.g. Feedback, Users, Services), scope automatically includes all descendant Woredas and Bureaus.
   - Cannot view or manage other Sub-Cities or their descendant units.
3. **Woreda Admin**:
   - Scoped to own Woreda and its descendant Bureaus.
   - Cannot view or modify parent Sub-City or sibling Woredas.
4. **Bureau Admin / Staff**:
   - Strictly isolated to own Bureau (`organization_id`).

---

## 5. Organization Management

Endpoints for managing administrative classifications, hierarchy trees, and organizational profiles.

### `GET /api/v1/organization-types`
List all government organization classification tiers.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `organizations.view`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Organization types retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Sub-City",
      "code": "sub_city",
      "description": "First-level urban administrative subdivision.",
      "level": 1,
      "can_be_root": true,
      "is_active": true,
      "allowed_parent_types": []
    },
    {
      "id": 2,
      "name": "Woreda",
      "code": "woreda",
      "description": "Second-level urban administrative subdivision.",
      "level": 2,
      "can_be_root": false,
      "is_active": true,
      "allowed_parent_types": [
        {"id": 1, "name": "Sub-City", "code": "sub_city"}
      ]
    }
  ],
  "errors": null
}
```

---

### `GET /api/v1/organizations`
List organizations filtered and scoped to the user's hierarchy.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `organizations.view`
- **Query Parameters**:
  - `search`: Filter by name or code.
  - `type`: Filter by type slug (`sub_city`, `woreda`, `bureau`).
  - `parent_id`: Filter by parent ID (or `root`).
  - `status`: `active`, `inactive`, `suspended`.
  - `per_page`: Pagination limit (default 15).
- **Response (200 OK)**: Paginated envelope.

---

### `GET /api/v1/organizations/tree`
Retrieve the complete hierarchical tree rooted in the user's scope.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `organizations.view`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Organization hierarchy tree retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Bole Sub-City",
      "code": "subcity-bole",
      "is_root": true,
      "type": {"id": 1, "name": "Sub-City", "code": "sub_city"},
      "children": [
        {
          "id": 2,
          "name": "Woreda 01",
          "code": "woreda-01-bole",
          "is_root": false,
          "type": {"id": 2, "name": "Woreda", "code": "woreda"}
        }
      ]
    }
  ],
  "errors": null
}
```

---

### `POST /api/v1/organizations`
Create a new government organization.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `organizations.create`
- **Request Body**:
```json
{
  "name": "Woreda 02",
  "code": "woreda-02-bole",
  "organization_type_id": 2,
  "parent_organization_id": 1,
  "address": "Bole Road, Near Airport",
  "phone": "+251911223344",
  "email": "woreda02@bole.gov.et",
  "status": "active"
}
```
- **Response (201 Created)**: Returns created `OrganizationResource`.

---

### `GET /api/v1/organizations/{id}`
Retrieve detailed profile of a single organization.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `organizations.view`

---

### `PUT /api/v1/organizations/{id}`
Update organization details.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `organizations.update`

---

### `DELETE /api/v1/organizations/{id}`
Soft-delete an organization.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `organizations.delete`
- **Guards**: Rejected with HTTP 422 if child organizations or assigned users exist.

---

## 6. User Management

Endpoints for provisioning and managing administrative and staff user accounts.

### `GET /api/v1/users`
List users scoped to the caller's organizational hierarchy.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `users.view`
- **Query Parameters**:
  - `search`: Filter by name, username, or email.
  - `organization_id`: Filter by organization.
  - `role_id`: Filter by role.
  - `status`: `active`, `inactive`, `suspended`.
  - `per_page`: Pagination limit (default 15).
- **Response (200 OK)**: Paginated envelope.

---

### `POST /api/v1/users`
Provision a new government user account.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `users.create`
- **Request Body**:
```json
{
  "name": "Almaz Tadesse",
  "username": "almaz.t",
  "email": "almaz@bole.gov.et",
  "password": "InitialSecurePass123!",
  "phone": "+251911334455",
  "role_id": 3,
  "organization_id": 2,
  "status": "active"
}
```
- **Response (201 Created)**: Returns created `UserResource`.

---

### `GET /api/v1/users/{id}`
Retrieve a single user's detailed profile.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `users.view`

---

### `PUT /api/v1/users/{id}`
Update user profile, status, or role.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `users.update`

---

### `DELETE /api/v1/users/{id}`
Soft-delete a user account and immediately revoke all active personal access tokens.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `users.delete`
- **Guards**: Cannot delete own account (422), cannot delete the last remaining Super Admin (422).

---

### `POST /api/v1/users/{id}/reset-password`
Administrative password reset.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `users.reset_password`
- **Request Body**:
```json
{
  "password": "NewTemporaryPassword2026!",
  "password_confirmation": "NewTemporaryPassword2026!"
}
```
- **Response (200 OK)**: Password updated, `must_change_password` set to `true`, and all tokens revoked.

---

## 7. Services & Subservices

Public endpoints for citizen discovery and authenticated endpoints for catalog administration.

### `GET /api/v1/services`
Public citizen catalog of services and subservices.
- **Authentication**: None (Public)
- **Query Parameters**:
  - `search`: Keyword search across service name, code slug, or description.
  - `parent_id`: Filter by parent service (`root` for master services only, `subservices` for subservices only, or specific parent ID).
  - `organization_id`: Filter by offering organization/bureau.
  - `fee`: `free` or `paid`.
  - `is_active`: Filter by status (defaults to `true` for public citizens).
  - `per_page`: Pagination limit (default 15).
- **Response (200 OK)**: Paginated envelope with `subservices_count`, `required_documents_count`, and `offering_organizations_count`.

---

### `GET /api/v1/services/{id_or_code}`
Public citizen service detail profile (lookup supported by numeric ID or string code slug e.g. `/services/birth-certificate`).
- **Authentication**: None (Public)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Service retrieved successfully.",
  "data": {
    "id": 2,
    "name": "Birth Certificate Issuance",
    "code": "birth-certificate",
    "description": "Official civil registration of newborn births.",
    "eligibility_criteria": "Child must be born within the sub-city jurisdiction.",
    "estimated_duration_minutes": 45,
    "fee_amount": 50,
    "fee_currency": "ETB",
    "fee_notes": "Free for infants under 90 days; 50 ETB thereafter.",
    "is_active": true,
    "is_master": false,
    "parent": {
      "id": 1,
      "name": "Vital Events Registration",
      "code": "vital-events"
    },
    "required_documents": [
      {
        "id": 1,
        "name": "Kebele Resident ID Card",
        "code": "kebele-id",
        "is_mandatory": true,
        "order_column": 1,
        "notes": "Original and one photocopy required."
      }
    ],
    "offering_organizations": [
      {
        "id": 1,
        "name": "Bole Sub-City",
        "code": "subcity-bole"
      }
    ],
    "created_at": "2026-10-25T20:45:00+00:00"
  },
  "errors": null
}
```

---

### `POST /api/v1/services`
Create a new master service or subservice.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `services.create`
- **Request Body**:
```json
{
  "name": "Marriage Certificate Registration",
  "code": "marriage-certificate",
  "parent_id": 1,
  "description": "Registration of formal marriage contracts.",
  "fee_amount": 100.00,
  "fee_currency": "ETB",
  "estimated_duration_minutes": 60,
  "is_active": true
}
```
- **Response (201 Created)**: Returns created `ServiceResource`.

---

### `PUT /api/v1/services/{id}`
Update service details.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `services.update`

---

### `DELETE /api/v1/services/{id}`
Soft-delete a service.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `services.delete`
- **Guards**: Cannot delete master service with active subservices (422).

---

### `POST /api/v1/services/{id}/documents`
Link required documents with order and mandatory criteria.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `documents.manage`
- **Request Body**:
```json
{
  "documents": [
    {
      "document_id": 1,
      "is_mandatory": true,
      "order_column": 1,
      "notes": "Original and one photocopy."
    }
  ]
}
```

---

### `POST /api/v1/services/{id}/organizations`
Assign offering organizations to the service.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `services.manage`
- **Request Body**:
```json
{
  "organizations": [
    {
      "organization_id": 1,
      "is_available": true,
      "specific_instructions": "Window 4 on 2nd Floor"
    }
  ]
}
```

---

## 8. Required Documents

### `GET /api/v1/documents`
List required documents in the central library.
- **Authentication**: None (Public)
- **Query Parameters**:
  - `search`: Keyword search by name, code, or description.
  - `is_active`: Filter by status.
  - `per_page`: Pagination limit (default 20).
- **Response (200 OK)**: Paginated envelope.

---

### `GET /api/v1/documents/{id_or_code}`
View single document details and services that require it.
- **Authentication**: None (Public)

---

### `POST /api/v1/documents`
Create a new required document definition.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `documents.manage`
- **Request Body**:
```json
{
  "name": "Hospital Birth Notification Slip",
  "code": "hospital-birth-slip",
  "description": "Signed delivery notification slip from licensed hospital or health center.",
  "sample_file_url": "https://government.et/samples/birth-notification.pdf",
  "is_active": true
}
```
- **Response (201 Created)**: Returns created `DocumentResource`.

---

### `PUT /api/v1/documents/{id}`
Update document definition.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `documents.manage`

---

### `DELETE /api/v1/documents/{id}`
Soft-delete document definition.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `documents.manage`

---

## 9. Room-by-Room Service Instructions (Service Steps)

Physical navigation guidance for citizens attending government offices in person, detailing sequence, building, floor, room number, responsible department, and expected duration.

### `GET /api/v1/services/{service_id_or_code}/steps`
Retrieve the ordered step-by-step navigation instructions for a service.
- **Authentication**: None (Public citizens view active steps; administrators view all).
- **Query Parameters**:
  - `organization_id`: Filter steps specifically tailored for an individual government office (e.g. Bole Sub-City Office).
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Service steps retrieved successfully.",
  "data": [
    {
      "id": 1,
      "service_id": 2,
      "organization_id": null,
      "step_number": 1,
      "title": "Intake & Document Verification",
      "instruction": "Present original hospital birth notification and both parents Kebele ID cards to the intake officer.",
      "room_number": "Room 102",
      "floor": "Ground Floor",
      "building": "Main Public Service Block",
      "department_name": "Civil Registration Desk",
      "responsible_title": "Intake Officer",
      "estimated_duration_minutes": 15,
      "is_active": true,
      "organization": null,
      "created_at": "2026-10-25T21:46:55+00:00"
    },
    {
      "id": 2,
      "service_id": 2,
      "organization_id": null,
      "step_number": 2,
      "title": "Service Fee Payment",
      "instruction": "Pay 50 ETB government service fee and obtain the official digital revenue receipt.",
      "room_number": "Counter 3",
      "floor": "Ground Floor",
      "building": "Main Public Service Block",
      "department_name": "Revenue & Cashier Desk",
      "responsible_title": "Cashier",
      "estimated_duration_minutes": 10,
      "is_active": true,
      "organization": null,
      "created_at": "2026-10-25T21:46:55+00:00"
    }
  ],
  "errors": null
}
```

---

### `GET /api/v1/services/{service_id_or_code}/steps/{step_id}`
Retrieve a single physical room instruction step.
- **Authentication**: None (Public)
- **Response (200 OK)**: Returns `ServiceStepResource`.

---

### `POST /api/v1/services/{service_id_or_code}/steps`
Create a new room instruction step for a service.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `service_steps.manage`
- **Request Body**:
```json
{
  "organization_id": null,
  "step_number": 1,
  "title": "Document Verification Desk",
  "instruction": "Present application form and verified identification.",
  "room_number": "Room 104",
  "floor": "Ground Floor",
  "building": "Main Administration Block",
  "department_name": "Customer Care Unit",
  "responsible_title": "Intake Specialist",
  "estimated_duration_minutes": 15,
  "is_active": true
}
```
- **Response (201 Created)**: Returns created `ServiceStepResource`.

---

### `PUT /api/v1/services/{service_id_or_code}/steps/{step_id}`
Update an existing step's room, title, duration, or instructions.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `service_steps.manage`
- **Response (200 OK)**: Returns updated `ServiceStepResource`.

---

### `DELETE /api/v1/services/{service_id_or_code}/steps/{step_id}`
Delete a room instruction step.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `service_steps.manage`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Service step deleted successfully.",
  "data": null,
  "errors": null
}
```

---

### `POST /api/v1/services/{service_id_or_code}/steps/reorder`
Reorder sequential step numbers in batch.
- **Authentication**: `auth:sanctum` + `account.active`
- **Permission Required**: `service_steps.manage`
- **Request Body**:
```json
{
  "steps": [
    { "id": 3, "step_number": 1 },
    { "id": 1, "step_number": 2 },
    { "id": 2, "step_number": 3 }
  ]
}
```
- **Response (200 OK)**: Returns reordered array of `ServiceStepResource`.




