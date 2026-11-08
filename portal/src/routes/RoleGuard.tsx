import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { useGetSidebarNavigationQuery } from '../services/navigationApi';
import { tokenStorage } from '../utils/tokenStorage';
import { Icon } from '../components/shared/Icon';
import type { RoleKey } from '../types/portal.types';

export interface RoleGuardProps {
  allowedRoles?: RoleKey[];
  requiredPermission?: string | string[];
  requiredScope?: string;
  pageKey?: string;
  children: React.ReactElement;
}

export const PAGE_ALIASES: Record<string, string[]> = {
  offices: ['offices', 'subcities', 'organizations', 'bureaus'],
  subcities: ['offices', 'subcities', 'organizations', 'bureaus'],
  bureaus: ['offices', 'subcities', 'organizations', 'bureaus'],
  levels: ['levels', 'organizations'],
  accounts: ['accounts', 'users'],
  roles: ['roles'],
  cms: ['cms'],
  activity: ['activity', 'audit_logs'],
  news: ['news', 'events'],
  services: ['services'],
  documents: ['documents'],
  routes: ['routes', 'service_steps'],
  qr: ['qr', 'qr_codes'],
  office: ['office', 'bureaus', 'offices', 'services'],
  feedback: ['feedback'],
  overview: ['overview', 'dashboard'],
};

/**
 * Derives the first authorized route for the current user from live navigation items.
 */
export const getFirstAuthorizedPath = (
  navData?: Array<{ route: string; required_permission?: string | null }>,
  hasPermFn?: (perm: string | string[]) => boolean
): string | null => {
  if (!navData || !Array.isArray(navData) || navData.length === 0) return null;
  for (const item of navData) {
    if (!item.required_permission || (hasPermFn && hasPermFn(item.required_permission))) {
      let path = item.route.replace(/^\/admin\/?/, '').replace(/^\//, '').split('/')[0].toLowerCase();
      if (path === 'organizations') path = 'subcities';
      if (path === 'users') path = 'accounts';
      if (path === 'dashboard') path = 'overview';
      return `/${path}`;
    }
  }
  return null;
};

/**
 * Access restricted fallback card when a user has no permitted administrative sections.
 */
export const AccessDeniedScreen: React.FC = () => {
  const portal = usePortal();
  return (
    <div className="panel" style={{ maxWidth: '540px', margin: '4rem auto', padding: '2.5rem 2rem', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: '50%', marginBottom: '1.25rem' }}>
        <Icon name="shield" size={36} />
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
        Access Restricted
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
        Your role ({portal.authUser?.role?.name || portal.role}) does not have permission to access this page, or all administrative modules have been restricted by your platform administrator.
      </p>
      <button
        type="button"
        className="button primary"
        onClick={() => portal.signOut()}
      >
        Sign out
      </button>
    </div>
  );
};

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requiredPermission,
  requiredScope,
  pageKey,
  children,
}) => {
  const { role } = usePortal();
  const { isSuperAdmin, hasPermission, canManageScope } = usePermissions();
  const location = useLocation();
  const hasToken = tokenStorage.hasToken();

  const { data: apiNavResponse, isLoading: isNavLoading } = useGetSidebarNavigationQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: true,
  });

  // Super Admin has full platform authority across all administrative pages
  if (isSuperAdmin) {
    return children;
  }

  // Determine current page key
  const currentPathKey =
    pageKey ||
    location.pathname.replace(/^\/admin\/?/, '').replace(/^\//, '').split('/')[0].toLowerCase() ||
    'overview';

  // Locate the user's first permitted route as a dynamic fallback
  const fallbackPath = getFirstAuthorizedPath(apiNavResponse?.data, hasPermission);

  // Helper to safely navigate away or display the restricted screen if no valid routes exist
  const denyAccess = () => {
    if (fallbackPath && fallbackPath !== `/${currentPathKey}`) {
      return <Navigate to={fallbackPath} replace />;
    }
    return <AccessDeniedScreen />;
  };

  // 1. Check required permission: If specified, permission is the primary authorization check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return denyAccess();
  }

  // 2. Check role restriction if explicitly specified
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return denyAccess();
  }

  // 3. Check required scope level rank if configured
  if (requiredScope && !canManageScope(requiredScope)) {
    return denyAccess();
  }

  // 4. Loading state protection: prevent unauthorized flash while navigation loads
  if (!isSuperAdmin && hasToken && isNavLoading && !apiNavResponse) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#64748b' }}>
        <span>Verifying page access…</span>
      </div>
    );
  }

  // 5. Check navigation/page authorization from live backend sidebar navigation items
  if (apiNavResponse?.data && Array.isArray(apiNavResponse.data)) {
    const authorizedKeys = new Set<string>();
    apiNavResponse.data.forEach((item) => {
      const key = item.route.replace(/^\/admin\/?/, '').replace(/^\//, '').split('/')[0].toLowerCase();
      authorizedKeys.add(key);
      if (key === 'organizations' || key === 'subcities') {
        authorizedKeys.add('subcities');
        authorizedKeys.add('offices');
        authorizedKeys.add('bureaus');
      }
      if (key === 'users') {
        authorizedKeys.add('accounts');
      }
      if (key === 'dashboard') {
        authorizedKeys.add('overview');
      }
    });

    const aliases = PAGE_ALIASES[currentPathKey] || [currentPathKey];
    const isPageAllowed = aliases.some((a) => authorizedKeys.has(a));

    if (!isPageAllowed) {
      return denyAccess();
    }
  }

  return children;
};

export default RoleGuard;
