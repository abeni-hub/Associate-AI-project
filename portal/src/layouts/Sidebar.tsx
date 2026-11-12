import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Folder,
  FileText,
  MapPin,
  MessageSquare,
  QrCode,
  Newspaper,
  ShieldCheck,
  Key,
  Layers,
  Palette,
  Activity,
  X,
  LogOut,
} from 'lucide-react';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { useLanguage } from '../i18n/i18nContext';
import { useGetSidebarNavigationQuery } from '../services/navigationApi';
import { tokenStorage } from '../utils/tokenStorage';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  dashboard: LayoutDashboard,
  offices: Building2,
  subcities: Building2,
  bureaus: Building2,
  services: Folder,
  documents: FileText,
  routes: MapPin,
  locations: MapPin,
  feedback: MessageSquare,
  qr: QrCode,
  news: Newspaper,
  accounts: ShieldCheck,
  users: ShieldCheck,
  roles: Key,
  levels: Layers,
  cms: Palette,
  activity: Activity,
};

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const portal = usePortal();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { t } = useLanguage();

  const hasToken = tokenStorage.hasToken();
  const { data: apiNavResponse } = useGetSidebarNavigationQuery(undefined, {
    skip: !hasToken,
    refetchOnMountOrArgChange: true,
  });

  // Canonical navigation items fallback
  const fallbackNav = [
    { id: 'overview', path: '/overview', label: t('nav.overview', 'Overview'), perm: 'dashboard.view' },
    { id: 'services', path: '/services', label: t('nav.services', 'Services'), perm: 'services.view' },
    { id: 'documents', path: '/documents', label: t('nav.documents', 'Required documents'), perm: 'documents.view' },
    // { id: 'routes', path: '/routes', label: t('nav.routes', 'Office locations'), perm: 'service_steps.view' }, /* Room & route navigation commented out */
    { id: 'offices', path: '/offices', label: t('nav.offices', 'Offices & directory'), perm: 'organizations.view' },
    { id: 'feedback', path: '/feedback', label: t('nav.feedback', 'Citizen feedback'), perm: 'feedback.view_own' },
    { id: 'qr', path: '/qr', label: t('nav.qr', 'Feedback QR codes'), perm: 'qr_codes.view' },
    { id: 'news', path: '/news', label: t('nav.news', 'News & events'), perm: 'news.view' },
    { id: 'accounts', path: '/accounts', label: t('nav.accounts', 'Accounts & access'), perm: 'users.view' },
    { id: 'roles', path: '/roles', label: t('nav.roles', 'Roles & permissions'), perm: 'roles.view' },
    { id: 'levels', path: '/levels', label: t('nav.levels', 'Organization levels'), perm: 'organizations.view' },
    { id: 'cms', path: '/cms', label: t('nav.cms', 'Landing page CMS'), perm: 'cms.manage' },
    { id: 'activity', path: '/activity', label: t('nav.activity', 'Activity log'), perm: 'audit_logs.view' },
  ];

  const navItems = React.useMemo(() => {
    if (apiNavResponse?.data && apiNavResponse.data.length > 0) {
      return apiNavResponse.data
        .map((item) => {
          let pathId = item.route
            .replace(/^\/admin\/?/, '')
            .replace(/^\/portal\/?/, '')
            .replace(/^\//, '') || 'overview';

          if (pathId === 'organizations') pathId = 'subcities';
          if (pathId === 'users') pathId = 'accounts';
          if (pathId === 'dashboard') pathId = 'overview';

          const navKey = pathId === 'subcities' ? 'offices' : pathId;
          return {
            id: pathId,
            path: `/${pathId}`,
            label: t(`nav.${navKey}`, item.label),
            perm: item.required_permission || null,
          };
        })
        .filter((item) => item.id !== 'routes' && item.path !== '/routes' && (!item.perm || hasPermission(item.perm)));
    }

    return fallbackNav.filter((item) => item.id !== 'routes' && (!item.perm || hasPermission(item.perm)));
  }, [apiNavResponse, hasPermission, t]);

  const user = portal.session?.user || portal.authUser;
  const userName = user?.name || 'Administrator';
  const userRole = React.useMemo(() => {
    const rawRole = user?.role?.name || (portal.role === 'super' ? 'Super Admin' : portal.role === 'subcity' ? 'Sub-city Admin' : 'Bureau Admin');
    const lower = String(rawRole).toLowerCase();
    if (lower.includes('super')) return t('roles.superAdmin', 'Super Admin');
    if (lower.includes('subcity') || lower.includes('sub-city')) return t('roles.subcityAdmin', 'Sub-city Admin');
    if (lower.includes('bureau')) return t('roles.bureauAdmin', 'Bureau Admin');
    return rawRole;
  }, [user, portal.role, t]);
  const userInitials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  return (
    <>
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CivicLink</strong>
            <span>ETHIOPIA · SERVICE PORTAL</span>
          </div>
          <button
            className="mobile-close"
            type="button"
            aria-label="Close menu"
            onClick={onCloseMobile}
          >
            <X />
          </button>
        </div>

        {/* Side Navigation */}
        <nav aria-label="Main navigation" className="side-nav">
          {navItems.map((item) => {
            const IconComponent = ICON_MAP[item.id] || Folder;
            const isActive = location.pathname.startsWith(item.path);
            const navKey = item.id === 'subcities' ? 'offices' : item.id;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onCloseMobile}
                className={isActive ? 'nav-current' : ''}
              >
                <IconComponent />
                <span>{t(`nav.${navKey}`, item.label)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Bottom (User profile & logout) */}
        <div className="sidebar-bottom">
          <div className="avatar">{userInitials}</div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {userName}
            </strong>
            <span>{userRole}</span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => portal.signOut()}
            style={{ padding: '6px' }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="nav-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}
    </>
  );
};

