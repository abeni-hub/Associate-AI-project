import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePortal } from '../features/shared';
import { tokenStorage } from '../utils/tokenStorage';

export interface PublicRouteProps {
  children?: React.ReactNode;
}

/**
 * For guest-only routes such as /login.
 * If user is already authenticated, redirects them back to destination or home.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { session } = usePortal();
  const location = useLocation();
  const hasToken = tokenStorage.hasToken();

  if (hasToken && session) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

