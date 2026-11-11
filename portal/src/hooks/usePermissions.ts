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
    if (authUser) {
      return (
        authUser.role?.slug === 'super_admin' ||
        authUser.role?.slug === 'super' ||
        (Array.isArray(authUser.permissions) && authUser.permissions.includes('*'))
      );
    }
    return role === 'super';
  }, [role, authUser]);

  const scopeLevel = useMemo<'global' | 'sub_city' | 'woreda' | 'bureau' | 'staff'>(() => {
    if (isSuperAdmin) return 'global';
    const s = authUser?.role?.scope_level;
    if (s === 'global' || s === 'sub_city' || s === 'woreda' || s === 'bureau' || s === 'staff') {
      return s;
    }
    if (role === 'subcity') return 'sub_city';
    return 'bureau';
  }, [isSuperAdmin, authUser, role]);

  const userPermissions = useMemo<string[]>(() => {
    if (isSuperAdmin) {
      return [...ALL_SYSTEM_PERMISSIONS];
    }
    // Check if live profile has explicit permissions array
    if (authUser?.permissions && Array.isArray(authUser.permissions)) {
      if (authUser.permissions.includes('*')) {
        return [...ALL_SYSTEM_PERMISSIONS];
      }
      return authUser.permissions;
    }
    // Check role default fallback only when permissions array is undefined
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

  /**
   * Privilege escalation prevention check:
   * Returns true if caller's administrative scope rank is high enough to manage the target scope.
   */
  const canManageScope = useCallback(
    (targetScope?: string | null): boolean => {
      if (isSuperAdmin) return true;
      if (!targetScope) return true;
      const ranks: Record<string, number> = {
        global: 1,
        platform: 1,
        sub_city: 2,
        subcity: 2,
        woreda: 3,
        bureau: 4,
        office: 4,
        staff: 5,
      };
      const actorRank = ranks[scopeLevel] || 99;
      const targetRank = ranks[targetScope.toLowerCase()] || 99;
      return actorRank <= targetRank;
    },
    [isSuperAdmin, scopeLevel]
  );

  /**
   * Organization data access boundary check:
   * Returns true if target organization ID is in caller's accessible organization hierarchy.
   */
  const canAccessOrganization = useCallback(
    (orgId?: number | null): boolean => {
      if (isSuperAdmin) return true;
      if (!orgId) return false;
      if (authUser?.accessible_organization_ids) {
        return authUser.accessible_organization_ids.includes(orgId);
      }
      if (authUser?.organization?.id === orgId) return true;
      return false;
    },
    [isSuperAdmin, authUser]
  );

  return {
    isSuperAdmin,
    scopeLevel,
    permissions: userPermissions,
    accessibleOrganizationIds: authUser?.accessible_organization_ids ?? null,
    hasPermission,
    hasAllPermissions,
    canManageScope,
    canAccessOrganization,
    canManageRoles: hasPermission('roles.manage'),
  };
}

export default usePermissions;

