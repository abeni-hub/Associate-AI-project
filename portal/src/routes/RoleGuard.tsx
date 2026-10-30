import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePortal } from '../context';
import type { RoleKey } from '../types/portal.types';

export interface RoleGuardProps {
  allowedRoles: RoleKey[];
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { role } = usePortal();

  // Super Admin has full platform authority across all administrative pages
  if (role === 'super' || allowedRoles.includes(role)) {
    return children;
  }

  return <Navigate to="/overview" replace />;
};
