import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import type { RoleKey } from '../types/portal.types';

export interface RoleGuardProps {
  allowedRoles?: RoleKey[];
  requiredPermission?: string | string[];
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requiredPermission,
  children,
}) => {
  const { role } = usePortal();
  const { isSuperAdmin, hasPermission } = usePermissions();

  // Super Admin has full platform authority across all administrative pages
  if (isSuperAdmin) {
    return children;
  }

  // Check required permission if configured
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/overview" replace />;
  }

  // Check role restriction if configured
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/overview" replace />;
  }

  return children;
};

export default RoleGuard;
