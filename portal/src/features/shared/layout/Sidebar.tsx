import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Brand } from '../components/Brand';
import { usePortal } from '../hooks/usePortal';
import { usePermissions } from '../hooks/usePermissions';
import { useLanguage } from '../i18n';
import type { RoleKey } from '../../../types/portal.types';
import { useGetSidebarNavigationQuery } from '../api/navigationApi';
import { tokenStorage } from '../../../utils/tokenStorage';

const NAV_ITEM_PERMISSION_MAP: Record<string, string> = {
  overview: 'dashboard.view',
  offices: 'organizations.view',
  subcities: 'organizations.view',
  bureaus: 'organizations.view',
  accounts: 'users.view',
  roles: 'roles.view',
  cms: 'cms.manage',
  activity: 'audit_logs.view',
  news: 'news.view',
  services: 'services.view',
  documents: 'documents.view',
  qr: 'qr_codes.view',
  office: 'services.view',
  feedback: 'feedback.view_own',
  levels: 'organizations.view',
};

const DEFAULT_NAV = [
  { id: 'overview', route: '/overview', label: 'Overview', icon: 'chart', perm: 'dashboard.view' },
  { id: 'services', route: '/services', label: 'Services', icon: 'layers', perm: 'services.view' },
  { id: 'documents', route: '/documents', label: 'Required documents', icon: 'file', perm: 'documents.view' },
  { id: 'offices', route: '/offices', label: 'Offices & directory', icon: 'building', perm: 'organizations.view' },
  { id: 'feedback', route: '/feedback', label: 'Citizen feedback', icon: 'message', perm: 'feedback.view_own' },
  { id: 'qr', route: '/qr', label: 'Feedback QR codes', icon: 'qr', perm: 'qr_codes.view' },
  { id: 'news', route: '/news', label: 'News & events', icon: 'news', perm: 'news.view' },
  { id: 'accounts', route: '/accounts', label: 'Accounts & access', icon: 'users', perm: 'users.view' },
  { id: 'roles', route: '/roles', label: 'Roles & permissions', icon: 'shield', perm: 'roles.view' },
  { id: 'levels', route: '/levels', label: 'Organization levels', icon: 'layers', perm: 'organizations.view' },
  { id: 'cms', route: '/cms', label: 'Landing page CMS', icon: 'palette', perm: 'cms.manage' },
  { id: 'activity', route: '/activity', label: 'Activity log', icon: 'activity', perm: 'audit_logs.view' },
];

export interface SidebarProps {
  role?: RoleKey;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onNavigate?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role: propRole,
  mobileOpen: propMobileOpen,
  onCloseMobile,
  onNavigate: propOnNavigate,
  onLogout: propOnLogout,
}) => {
  const portal = usePortal();
  const { hasPermission } = usePermissions();
  const { t } = useLanguage();

  const role = (propRole || portal.role || 'super') as RoleKey;
  const mobileOpen = propMobileOpen !== undefined ? propMobileOpen : portal.mobileOpen;
  const setMobileOpen = (open: boolean) => {
    if (onCloseMobile && !open) {
      onCloseMobile();
    }
    portal.setMobileOpen(open);
  };

  const onNavigate =
    propOnNavigate ||
    (() => {
      if (portal.search || portal.typeFilter !== 'All types' || portal.statusFilter !== 'All statuses') {
        portal.resetSearch();
      }
    });
  const onLogout = propOnLogout || portal.signOut;

  const { data: apiNavResponse } = useGetSidebarNavigationQuery(undefined, {
    skip: !portal.session?.user && !portal.authUser && !tokenStorage.hasToken(),
    refetchOnMountOrArgChange: true,
  });

  const navGroups = React.useMemo(() => {
    if (apiNavResponse?.data && apiNavResponse.data.length > 0) {
      const items = (apiNavResponse.data as Array<{ route: string; label: string; required_permission?: string | null }>)
        .map((item) => {
          let pathId = item.route
            .replace(/^\/admin\/?/, '')
            .replace(/^\/portal\/?/, '')
            .replace(/^\//, '') || 'overview';

          if (pathId === 'organizations') pathId = 'subcities';
          if (pathId === 'users') pathId = 'accounts';
          if (pathId === 'dashboard') pathId = 'overview';

          let iconName = 'layers';
          const labelLower = item.label.toLowerCase();
          const routeLower = item.route.toLowerCase();

          if (labelLower.includes('overview') || routeLower.includes('overview')) iconName = 'chart';
          else if (labelLower.includes('sub-cit') || labelLower.includes('organization') || labelLower.includes('office') || routeLower.includes('subcit')) iconName = 'building';
          else if (labelLower.includes('user') || labelLower.includes('account') || routeLower.includes('account')) iconName = 'users';
          else if (labelLower.includes('service') || routeLower.includes('services')) iconName = 'layers';
          else if (labelLower.includes('route') || routeLower.includes('routes')) iconName = 'route';
          else if (labelLower.includes('document') || routeLower.includes('documents')) iconName = 'file';
          else if (labelLower.includes('feedback') || routeLower.includes('feedback')) iconName = 'message';
          else if (labelLower.includes('news') || routeLower.includes('news')) iconName = 'news';
          else if (labelLower.includes('role') || routeLower.includes('roles')) iconName = 'shield';
          else if (labelLower.includes('qr') || routeLower.includes('qr')) iconName = 'qr';
          else if (labelLower.includes('cms') || routeLower.includes('cms')) iconName = 'palette';
          else if (labelLower.includes('activity') || routeLower.includes('activity')) iconName = 'activity';

          return {
            id: pathId,
            text: t(`nav.${pathId}`, item.label),
            icon: iconName,
            required_permission: item.required_permission || NAV_ITEM_PERMISSION_MAP[pathId],
          };
        })
        .filter((item) => !item.required_permission || hasPermission(item.required_permission));

      return [{ label: '', items }];
    }

    const defaultItems = DEFAULT_NAV
      .filter((item) => !item.perm || hasPermission(item.perm))
      .map((item) => ({
        id: item.id,
        text: t(`nav.${item.id}`, item.label),
        icon: item.icon,
        required_permission: item.perm,
      }));

    return [{ label: '', items: defaultItems }];
  }, [apiNavResponse, hasPermission, t]);

  const user = portal.session?.user || portal.authUser;
  const displayName = user?.name || 'Administrator';
  const displayRole = React.useMemo(() => {
    const rawRole =
      user?.role?.name ||
      (role === 'super' ? 'Super Admin' : role === 'subcity' ? 'Sub-City Admin' : 'Bureau Admin');
    const lower = String(rawRole).toLowerCase();
    if (lower.includes('super')) return t('roles.superAdmin', 'Super Admin');
    if (lower.includes('subcity') || lower.includes('sub-city')) return t('roles.subcityAdmin', 'Sub-city Admin');
    if (lower.includes('bureau')) return t('roles.bureauAdmin', 'Bureau Admin');
    return rawRole;
  }, [user, role, t]);

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  const getDestination = (itemId: string) => `/${itemId}`;

  return (
    <>
      <div
        className={`sidebar-backdrop${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-brand-row">
          <Brand />
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="side-nav" aria-label="Admin navigation">
          <div className="side-nav-groups">
            {navGroups.map((group, gIdx) => (
              <div className="nav-group" key={group.items[0]?.id ?? gIdx}>
                {group.label && <span className="nav-group-label">{group.label}</span>}
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={getDestination(item.id)}
                    end
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    onClick={() => {
                      onNavigate();
                      setMobileOpen(false);
                    }}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.text}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-profile">
            <span className="avatar">{initials}</span>
            <span className="profile-copy">
              <b>{displayName}</b>
              <small>{displayRole}</small>
            </span>
            <button
              className="logout-button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              type="button"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
