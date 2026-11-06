import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

export interface PermissionGateProps {
  permission?: string | string[];
  targetScope?: string;
  targetOrgId?: number | null;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders children if the authenticated user possesses the required permission
 * and satisfies hierarchical scope checks.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  targetScope,
  targetOrgId,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAllPermissions, canManageScope, canAccessOrganization } = usePermissions();

  const isPermissionAuthorized = !permission || (
    Array.isArray(permission) && requireAll
      ? hasAllPermissions(permission)
      : hasPermission(permission)
  );

  const isScopeAuthorized = !targetScope || canManageScope(targetScope);
  const isOrgAuthorized = targetOrgId === undefined || canAccessOrganization(targetOrgId);

  if (!isPermissionAuthorized || !isScopeAuthorized || !isOrgAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;

