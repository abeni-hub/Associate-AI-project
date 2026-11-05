import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

export interface PermissionGateProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders children if the authenticated user possesses the required permission.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAllPermissions } = usePermissions();

  const isAuthorized = Array.isArray(permission) && requireAll
    ? hasAllPermissions(permission)
    : hasPermission(permission);

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;

