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
  scope_level?: 'global' | 'sub_city' | 'woreda' | 'bureau' | 'staff' | string;
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
  session_timeout: number | null;
  effective_session_timeout: number;
  two_factor_enabled?: boolean;
  two_factor_required?: boolean;
  two_factor_setup_required?: boolean;
  absolute_session_lifetime?: number;
  session_expires_at?: string | null;
  organization: UserOrganization | null;
  role: UserRole | null;
  permissions?: string[];
  accessible_organization_ids?: number[] | null;
  created_at?: string;
}

/**
 * Payload for POST /api/v1/auth/login.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Data payload returned upon successful login.
 */
export interface LoginResponseData extends AuthUser {
  token: string;
  token_type: 'Bearer' | string;
}

export interface TwoFactorChallengeData {
  two_factor_required: true;
  challenge_token: string;
}

export interface TwoFactorSetupData {
  secret: string;
  otpauth_url: string;
}

export interface TwoFactorRecoveryCodes {
  recovery_codes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  required: boolean;
}

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

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

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
  user: AuthUser | null;
  role: 'super' | 'subcity' | 'bureau';
}

export function mapBackendRoleToPortalRole(
  roleSlug?: string | null
): 'super' | 'subcity' | 'bureau' {
  if (!roleSlug) return 'bureau';
  const slug = roleSlug.toLowerCase().trim();
  if (slug === 'super_admin' || slug === 'super') return 'super';
  if (slug === 'sub_city_admin' || slug === 'subcity' || slug === 'sub_city') return 'subcity';
  return 'bureau';
}

/* =========================================================================
 * Component Prop Contracts
 * ========================================================================= */

export interface LoginFormProps {
  username: string;
  password: string;
  showPassword: boolean;
  error: string;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  twoFactorChallenge?: boolean;
  useRecoveryCode?: boolean;
  twoFactorCode?: string;
  recoveryCode?: string;
  onToggleRecoveryCode?: () => void;
  onTwoFactorCodeChange?: (value: string) => void;
  onRecoveryCodeChange?: (value: string) => void;
  lockoutSeconds?: number;
  remainingAttempts?: number | null;
  labels?: Record<string, string>;
}

export interface LoginStoryProps {
  className?: string;
}

export interface LoginSecurityNoticeProps {
  className?: string;
}

export interface LoginPanelHeaderProps {
  className?: string;
}
