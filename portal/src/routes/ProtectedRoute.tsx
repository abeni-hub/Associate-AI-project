import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePortal } from '../features/shared';
import { tokenStorage } from '../utils/tokenStorage';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Ensures user is authenticated with a valid session and tokenStorage.
 * Redirects unauthenticated users to /login preserving destination path.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session } = usePortal();
  const location = useLocation();
  const hasToken = tokenStorage.hasToken();

  if (!hasToken || !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

