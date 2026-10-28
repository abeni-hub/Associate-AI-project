/**
 * Authentication & User Domain Types
 *
 * Sourced directly from Laravel backend contracts:
 * - App\Http\Resources\Api\V1\UserResource
 * - App\Http\Requests\Api\V1\Auth\LoginRequest
 * - /backend/docs/api.md (Section 2: Authentication & Session Management)
 */

export interface OrganizationType {
  id: number;
  name: string;
  code: string;
}

export interface UserOrganization {
  id: number;
  name: string;
  code: string;
  type: OrganizationType | null;
}

export interface UserRole {
  id: number;
  name: string;
  slug: string;
}

/**
 * Authenticated user profile representation.
 */
export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive' | 'suspended' | string;
  must_change_password: boolean;
  last_login_at: string | null;
  organization: UserOrganization | null;
  role: UserRole | null;
  created_at?: string;
}

/**
 * Payload for POST /api/v1/auth/login.
 * Backend accepts either `username` or `login` as identifier.
 */
export interface LoginRequest {
  login?: string;
  username?: string;
  password: string;
}

/**
 * Data payload returned upon successful login.
 */
export interface LoginResponseData extends AuthUser {
  token: string;
  token_type: 'Bearer' | string;
}

/**
 * Payload for user registration.
 * Note: Government portal currently provisions users via POST /api/v1/users.
 * This contract supports self-registration / citizen onboarding if exposed.
 */
export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation?: string;
  phone?: string;
  organization_id?: number;
  role_id?: number;
}

/**
 * Payload for PUT /api/v1/auth/change-password.
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Payload for POST /api/v1/auth/forgot-password.
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Payload for POST /api/v1/auth/reset-password.
 */
export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Client-side Redux authentication state.
 * Stores minimal session status and in-memory bearer token (without persistent disk storage).
 */
export interface AuthSessionSummary {
  id: number;
  name: string;
  username: string;
  roleSlug: string | null;
  organizationName: string | null;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  userSummary: AuthSessionSummary | null;
}

/**
  * Maps a backend role slug (super_admin, sub_city_admin, woreda_admin, bureau_admin, staff)
  * to the corresponding portal RoleKey ('super' | 'subcity' | 'bureau').
  */
export function mapBackendRoleToPortalRole(roleSlug?: string | null): 'super' | 'subcity' | 'bureau' {
  if (!roleSlug) return 'bureau';
  const slug = roleSlug.toLowerCase().trim();
  if (slug === 'super_admin' || slug === 'super') return 'super';
  if (slug === 'sub_city_admin' || slug === 'subcity' || slug === 'sub_city') return 'subcity';
  return 'bureau';
}

