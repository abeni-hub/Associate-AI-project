# Civic Link — Frontend Integration Guide

This guide is designed for frontend developers building the **Citizen Portal (`client`)** and the **Government Administration Portal (`portal`)**. It explains how to communicate with the Laravel backend API (`/api/v1`).

---

## 1. Quick Start & Environment Configuration

### Base URL
- **Local Backend**: `http://localhost:8000/api/v1`
- **Citizen Client (`client/.env`)**:
  ```env
  VITE_API_BASE_URL=http://localhost:8000/api/v1
  ```
- **Admin Portal (`portal/.env`)**:
  ```env
  VITE_API_BASE_URL=http://localhost:8000/api/v1
  ```

---

## 2. API Contract & Response Envelope

Every endpoint under `/api/v1` returns an identical JSON envelope:

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... } or [ ... ],
  "errors": null,
  "meta": { ... } // Optional: pagination or tokens
}
```

### Validation Error (`422 Unprocessable Content`)
Returned when Form Request validation fails. Map these errors directly to form inputs:
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Unauthorized / Deactivated / Forbidden (`401`, `403`)
- **`401 Unauthenticated`**: Missing or expired token. Redirect user to `/login`.
- **`403 Forbidden`**: User does not possess the required permission, or the user's account has been deactivated (`EnsureAccountIsActive` middleware).

---

## 3. Application Route Mapping Matrix

### Part A: Citizen Public App (`client`)

These endpoints require **NO authentication** and can be called directly by citizens:

| Feature | HTTP Method | Endpoint | Description |
|---|---|---|---|
| **Service Catalog** | `GET` | `/services` | List all government services. Supports `?search=`, `?master_only=1`, `?organization_id=`. |
| **Service Details** | `GET` | `/services/{id_or_code}` | Full profile of a service, including subservices and required documents. |
| **Room Instructions** | `GET` | `/services/{service_id}/steps` | Sequential room-by-room physical navigation checklist. |
| **Required Documents** | `GET` | `/documents` | Public catalog of document requirements and forms. |
| **Public News** | `GET` | `/news` | List official announcements ordered newest first. |
| **News Detail** | `GET` | `/news/{id}` | Read news article with structured content blocks. |
| **Submit Feedback** | `POST` | `/feedbacks` | Submit citizen feedback (`feedback`, `complaint`, `satisfaction`). Returns 10-digit `tracking_number` for complaints. |

---

### Part B: Government Administration Portal (`portal`)

These endpoints require authentication (`Authorization: Bearer <TOKEN>`) and are restricted by permissions and organizational scope:

| Feature / Page | HTTP Method | Endpoint | Required Permission | Description |
|---|---|---|---|---|
| **Login** | `POST` | `/auth/login` | *Public* | Authenticates user; returns Bearer token and user profile. |
| **Current User** | `GET` | `/auth/me` | *Authenticated* | Fetches authenticated user profile, organization, and role. |
| **Change Password** | `PUT` | `/auth/change-password` | *Authenticated* | Changes password; clears `must_change_password` flag. |
| **Logout** | `POST` | `/auth/logout` | *Authenticated* | Revokes active personal access token. |
| **Dashboard Overview** | `GET` | `/dashboard/overview` | `dashboard.view` | Summary KPI cards (scoped to user's hierarchy). Alias: `/dashboard/stats`. |
| **Feedback Reports** | `GET` | `/dashboard/reports/feedback` | `dashboard.view` | Detailed feedback analytics with `?start_date=`, `?end_date=`, `?organization_id=`. |
| **Services Report** | `GET` | `/dashboard/reports/services` | `dashboard.view` | Catalog delivery metrics, fee distribution, and duration stats. |
| **Organizations Report**| `GET` | `/dashboard/reports/organizations` | `dashboard.view` | Tier distribution (Sub-City, Woreda, Bureau) and staffing counts. |
| **Recent Activity** | `GET` | `/dashboard/recent-activity` | `dashboard.view` | Scoped audit trails (`?limit=`, `?entity_type=`, `?action=`). |
| **Organization Tree**| `GET` | `/organizations/tree` | `organizations.view` | Full hierarchical tree rooted in user's administrative scope. |
| **Organizations List**| `GET` | `/organizations` | `organizations.view` | Filterable list (`?search=`, `?type=`, `?parent_id=`). |
| **Create Organization**| `POST` | `/organizations` | `organizations.create` | Add child organization under caller's hierarchy. |
| **Update Organization**| `PUT` | `/organizations/{id}` | `organizations.update` | Update organization details. |
| **Delete Organization**| `DELETE` | `/organizations/{id}` | `organizations.delete` | Soft delete organization (must have no child units or active users). |
| **Users List** | `GET` | `/users` | `users.view` | Scoped list of users within caller's hierarchy (`?role=`, `?status=`). |
| **Create User** | `POST` | `/users` | `users.create` | Provision administrative or staff account. |
| **Update User** | `PUT` | `/users/{id}` | `users.update` | Update user status, role, or organization assignment. |
| **Delete User** | `DELETE` | `/users/{id}` | `users.delete` | Soft delete user (cannot delete self or last Super Admin). |
| **Reset Password** | `POST` | `/users/{id}/reset-password` | `users.reset_password` | Administrative password reset with forced change on next login. |
| **Roles List** | `GET` | `/roles` | `roles.view` | List all platform roles with assigned permissions count. |
| **Role Permissions** | `PUT` | `/roles/{id}/permissions` | `roles.manage` | Sync permissions for a role (Super Admin role is protected). |
| **Service Admin** | `POST` | `/services` | `services.create` | Create master service or subservice. |
| **Service Steps** | `POST` | `/services/{id}/steps` | `service_steps.manage` | Add room navigation step. |
| **Reorder Steps** | `POST` | `/services/{id}/steps/reorder` | `service_steps.manage` | Batch reorder sequential step numbers. |
| **Create News** | `POST` | `/news` | `news.create` | Publish organization-scoped news article with content blocks. |
| **Update / Delete News**| `PUT` / `DELETE`| `/news/{id}` | `news.update` / `news.delete` | Modify or delete news item. |
| **Feedback List** | `GET` | `/feedbacks` | `feedback.view_own` | Scoped citizen feedback review list. |

---

## 4. Production API Client Implementation (Axios)

Create this file in both `client/src/services/api.js` (or `.ts`) and `portal/src/services/api.js` (or `.ts`):

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for Sanctum session cookies or CSRF
});

// Request Interceptor: Injects Bearer token automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('civic_link_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Standardizes error handling and unwraps envelopes
api.interceptors.response.use(
  (response) => {
    // Unwraps the standard { success: true, message: '...', data: ... }
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401 Unauthorized: Session expired or invalid token
      if (status === 401) {
        localStorage.removeItem('civic_link_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // 403 Forbidden: Inactive account or unauthorized action
      if (status === 403) {
        console.error('Forbidden:', data?.message || 'Access Denied');
      }

      // 422 Validation Error: Handled by caller to map to form fields
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 5. TypeScript Interfaces

Add these interfaces to `src/types/api.ts` for end-to-end type safety:

```typescript
// Standard API Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
  meta?: Record<string, any>;
}

// User Entity
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  must_change_password: boolean;
  organization_id?: number | null;
  role_id: number;
  role?: Role;
  organization?: Organization;
}

// Organization Entity
export interface Organization {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  organization_type_id: number;
  parent_organization_id?: number | null;
  type?: OrganizationType;
  parent?: Organization | null;
  children?: Organization[];
}

export interface OrganizationType {
  id: number;
  name: string;
  code: 'sub_city' | 'woreda' | 'bureau';
  level: number;
  can_be_root: boolean;
}

// Role & Permission
export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_system: boolean;
  is_active: boolean;
  permissions_count?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  key: string;
  name: string;
  group: string;
  description?: string;
}

// Service & Steps
export interface Service {
  id: number;
  parent_id?: number | null;
  name: string;
  code: string;
  description?: string | null;
  eligibility_criteria?: string | null;
  fee_amount?: number | null;
  fee_currency?: string;
  estimated_duration_minutes?: number | null;
  is_active: boolean;
  subservices?: Service[];
  steps?: ServiceStep[];
  required_documents?: RequiredDocument[];
}

export interface ServiceStep {
  id: number;
  service_id: number;
  organization_id?: number | null;
  step_number: number;
  title: string;
  instruction: string;
  room_number?: string | null;
  floor?: string | null;
  building?: string | null;
  department_name?: string | null;
  responsible_title?: string | null;
  estimated_duration_minutes?: number | null;
}

export interface RequiredDocument {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  file_format?: string | null;
  max_file_size_kb?: number | null;
  pivot?: {
    is_mandatory: boolean;
    order_column?: number;
    notes?: string | null;
  };
}

// News & Feedback
export interface NewsItem {
  id: number;
  organization_id: number;
  news_title: string;
  organization?: Organization;
  contents: NewsContentBlock[];
  created_at: string;
}

export interface NewsContentBlock {
  id: number;
  content: string;
  content_type: 'text' | 'image' | 'video';
  order: number;
}

export interface FeedbackSubmission {
  id: number;
  feedback_for_organization: number;
  feedback_content: string;
  feedback_type: 'feedback' | 'complaint' | 'satisfaction';
  tracking_number?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  created_at: string;
  organization?: Organization;
}

// Dashboard Overview
export interface DashboardOverview {
  scope: {
    role: string;
    organization_id?: number | null;
    organization_name?: string | null;
    is_global: boolean;
    accessible_organizations_count: number;
  };
  organizations: {
    total: number;
    active: number;
    inactive: number;
    by_type: Record<string, number>;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    must_change_password: number;
    by_role: Record<string, number>;
  };
  services: {
    total_catalog: number;
    active_catalog: number;
    master_services: number;
    subservices: number;
    offered_services_in_scope: number;
  };
  documents: {
    total: number;
    active: number;
    mandatory_links_count: number;
  };
  feedback: {
    total: number;
    by_type: {
      feedback: number;
      complaint: number;
      satisfaction: number;
    };
    recent_last_30_days: number;
  };
  news: {
    total: number;
    recent_last_30_days: number;
  };
}
```

---

## 6. Seeded Test Credentials

When testing administrative features in the `portal`:

| Role | Username | Password | Organization | Scope |
|---|---|---|---|---|
| **Super Admin** | `admin` | `Admin123!Secure` | None (Global) | Full access across all modules |
| **Sub-City Admin** | `abebe.k` | `CorrectPassword123!` | Bole Sub-City | Bole and all child Woredas/Bureaus |
