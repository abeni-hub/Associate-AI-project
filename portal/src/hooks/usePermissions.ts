import { useCallback, useMemo } from 'react';
import { usePortal } from '../context';

/**
 * Standard system permissions catalog matching backend PermissionSeeder.
 */
export const ALL_SYSTEM_PERMISSIONS = [
  'organizations.view',
  'organizations.create',
  'organizations.update',
  'organizations.delete',
  'users.view',
  'users.create',
  'users.update',
  'users.delete',
  'users.reset_password',
  'roles.view',
  'roles.manage',
  'services.view',
  'services.create',
  'services.update',
  'services.delete',
  'services.manage',
  'documents.view',
  'documents.manage',
  'service_steps.view',
  'service_steps.manage',
  'news.view',
  'news.create',
  'news.update',
  'news.publish',
  'news.delete',
  'events.view',
  'events.create',
  'events.update',
  'events.publish',
  'events.delete',
  'feedback.view_own',
  'feedback.view_descendants',
  'feedback.update_status',
  'qr_codes.view',
  'qr_codes.manage',
  'dashboard.view',
  'audit_logs.view',
  'cms.manage',
] as const;

export type SystemPermissionKey = typeof ALL_SYSTEM_PERMISSIONS[number];

/**
 * Default fallback permissions per role slug if backend doesn't provide explicit list.
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  super_admin: [...ALL_SYSTEM_PERMISSIONS],
  super: [...ALL_SYSTEM_PERMISSIONS],
  sub_city_admin: [
    'organizations.view',
    'organizations.create',
    'organizations.update',
    'users.view',
    'users.create',
    'users.update',
    'users.reset_password',
    'services.view',
    'services.create',
    'services.update',
    'services.manage',
    'documents.view',
    'documents.manage',
    'news.view',
    'news.create',
    'news.update',
    'news.publish',
    'events.view',
    'events.create',
    'events.update',
    'events.publish',
    'feedback.view_own',
    'feedback.view_descendants',
    'feedback.update_status',
    'qr_codes.view',
    'qr_codes.manage',
    'dashboard.view',
  ],
  subcity: [
    'organizations.view',
    'organizations.create',
    'organizations.update',
    'users.view',
    'users.create',
    'users.update',
    'users.reset_password',
    'services.view',
    'services.create',
    'services.update',
    'services.manage',
    'documents.view',
    'documents.manage',
    'news.view',
    'news.create',
    'news.update',
    'news.publish',
    'events.view',
    'events.create',
    'events.update',
    'events.publish',
    'feedback.view_own',
    'feedback.view_descendants',
    'feedback.update_status',
    'qr_codes.view',
    'qr_codes.manage',
    'dashboard.view',
  ],
  bureau_admin: [
    'services.view',
    'service_steps.view',
    'service_steps.manage',
    'feedback.view_own',
    'feedback.update_status',
    'qr_codes.view',
    'qr_codes.manage',
    'dashboard.view',
  ],
  bureau: [
    'services.view',
    'service_steps.view',
    'service_steps.manage',
    'feedback.view_own',
    'feedback.update_status',
    'qr_codes.view',
    'qr_codes.manage',
    'dashboard.view',
  ],
  woreda_admin: [
    'services.view',
    'users.view',
    'feedback.view_own',
    'feedback.update_status',
    'qr_codes.view',
    'dashboard.view',
  ],
  staff: [
    'services.view',
    'service_steps.view',
    'feedback.view_own',
    'dashboard.view',
  ],
};

/**
 * Universal permissions evaluation hook.
 * Checks against live user permissions from backend API, with fallback to system role rules.
 */
export function usePermissions() {
  const { authUser, role } = usePortal();

  const isSuperAdmin = useMemo(() => {
    return (
      role === 'super' ||
      authUser?.role?.slug === 'super_admin' ||
      authUser?.role?.slug === 'super'
    );
  }, [role, authUser]);

  const userPermissions = useMemo<string[]>(() => {
    if (isSuperAdmin) {
      return [...ALL_SYSTEM_PERMISSIONS];
    }
    // Check if live profile has explicit permissions array
    if (
      authUser?.permissions &&
      Array.isArray(authUser.permissions) &&
      authUser.permissions.length > 0
    ) {
      return authUser.permissions;
    }
    // Check role default fallback
    const roleSlug = authUser?.role?.slug || role;
    return ROLE_DEFAULT_PERMISSIONS[roleSlug] || [];
  }, [authUser, isSuperAdmin, role]);

  /**
   * Evaluates if user has permission.
   * If array is passed, checks if user has ANY of the specified permissions.
   */
  const hasPermission = useCallback(
    (required: string | string[]): boolean => {
      if (isSuperAdmin) return true;
      if (Array.isArray(required)) {
        return required.some((perm) => userPermissions.includes(perm));
      }
      return userPermissions.includes(required);
    },
    [isSuperAdmin, userPermissions]
  );

  /**
   * Evaluates if user has ALL of the specified permissions.
   */
  const hasAllPermissions = useCallback(
    (required: string[]): boolean => {
      if (isSuperAdmin) return true;
      return required.every((perm) => userPermissions.includes(perm));
    },
    [isSuperAdmin, userPermissions]
  );

  return {
    isSuperAdmin,
    permissions: userPermissions,
    hasPermission,
    hasAllPermissions,
  };
}

export default usePermissions;

