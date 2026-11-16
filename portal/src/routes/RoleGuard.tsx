import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePortal, usePermissions, useGetSidebarNavigationQuery, Icon } from '../features/shared';
import { useLanguage } from '../features/shared/i18n';
import { tokenStorage } from '../utils/tokenStorage';
import type { RoleKey } from '../types/portal.types';
import styles from './roleGuard.module.css';
import { PageLoadingState } from '../features/shared';

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
  const { t } = useLanguage();
  return (
    <div className={styles.accessDeniedPanel}>
      <div className={styles.shieldIconWrapper}>
        <Icon name="shield" size={36} />
      </div>
      <h2 className={styles.title}>Access Restricted</h2>
      <p className={styles.description}>
        Your role ({portal.authUser?.role?.name || portal.role}) does not have permission to access
        this page, or this administrative module has been restricted.
      </p>
      <button
        type="button"
        className="button primary"
        onClick={() => portal.signOut()}
      >
        {t('nav.signOut', 'Sign out')}
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

  if (isSuperAdmin) {
    return children;
  }

  const currentPathKey =
    pageKey ||
    location.pathname.replace(/^\/admin\/?/, '').replace(/^\//, '').split('/')[0].toLowerCase() ||
    'overview';

  const fallbackPath = getFirstAuthorizedPath(apiNavResponse?.data, hasPermission);

  const denyAccess = () => {
    if (fallbackPath && fallbackPath !== `/${currentPathKey}`) {
      return <Navigate to={fallbackPath} replace />;
    }
    return <AccessDeniedScreen />;
  };

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return denyAccess();
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return denyAccess();
  }

  if (requiredScope && !canManageScope(requiredScope)) {
    return denyAccess();
  }

  if (!isSuperAdmin && hasToken && isNavLoading && !apiNavResponse) {
    return (
      <PageLoadingState
        compact
        title="Verifying page access..."
        subtitle="Checking your permissions and navigation access."
      />
    );
  }

  if (apiNavResponse?.data && Array.isArray(apiNavResponse.data)) {
    const authorizedKeys = new Set<string>();
    (apiNavResponse.data as any[]).forEach((item: any) => {
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
