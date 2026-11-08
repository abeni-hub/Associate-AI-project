/**
 * Unified API Contract Types for Civic Link
 *
 * Matches the backend API specification defined in /backend/docs/api.md:
 * - Success envelope: { success: true, message: string, data: T, errors: null, meta?: ... }
 * - Error envelope: { success: false, message: string, data: null, errors: ValidationErrorMap | null }
 */

/**
 * Validation errors mapped by field name.
 * Example: { login: ["These credentials do not match our records."] }
 */
export type ValidationErrorMap = Record<string, string[]>;

/**
 * Standard successful API response envelope.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: ValidationErrorMap | null;
  meta?: Record<string, unknown> | null;
}

/**
 * Standard error response envelope returned by backend on 4xx/5xx responses.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  errors: ValidationErrorMap | null;
}

/**
 * Standard Laravel pagination metadata.
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Standard Laravel pagination navigation links.
 */
export interface PaginationLinks {
  first?: string;
  last?: string;
  prev?: string | null;
  next?: string | null;
}

/**
 * Paginated API response structure.
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
  errors: null;
}

/**
 * Common query parameters for collection endpoints (filtering, pagination, search).
 */
export interface PaginationQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Shared RTK Query tag types for cache invalidation across the platform.
 */
export const API_TAG_TYPES = [
  'Auth',
  'User',
  'Role',
  'Permission',
  'Organization',
  'Service',
  'ServiceStep',
  'Document',
  'Complaint',
  'Feedback',
  'Notification',
  'AuditLog',
  'Dashboard',
  'News',
  'Cms',
  'QrCode',
  'Event',
  'Navigation',
] as const;

export type ApiTagType = (typeof API_TAG_TYPES)[number];
