import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import type { RoleKey } from '../types/portal.types';

export interface RoleGuardProps {
  allowedRoles?: RoleKey[];
  requiredPermission?: string | string[];
  requiredScope?: string;
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requiredPermission,
  requiredScope,
  children,
}) => {
  const { role } = usePortal();
  const { isSuperAdmin, hasPermission, canManageScope } = usePermissions();

  // Super Admin has full platform authority across all administrative pages
  if (isSuperAdmin) {
    return children;
  }

  // 1. Check required permission: If specified, permission is the primary authorization check
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return <Navigate to="/overview" replace />;
    }
  } else if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // 2. Only check role restriction if no specific permission was required
    return <Navigate to="/overview" replace />;
  }

  // 3. Check required scope level rank if configured
  if (requiredScope && !canManageScope(requiredScope)) {
    return <Navigate to="/overview" replace />;
  }

  return children;
};

export default RoleGuard;
