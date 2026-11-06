import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../shared/Icon';
import { Brand } from '../shared/Brand';
import { ROLE, NAV } from '../../data/portalData.js';
import { usePortal } from '../../context';
import { usePermissions } from '../../hooks/usePermissions';
import type { RoleKey } from '../../types/portal.types';
import { useGetSidebarNavigationQuery } from '../../services/navigationApi';
import { tokenStorage } from '../../utils/tokenStorage';

const NAV_ITEM_PERMISSION_MAP: Record<string, string> = {
  overview: 'dashboard.view',
  offices: 'organizations.view',
  subcities: 'organizations.view',
  bureaus: 'organizations.view',
  accounts: 'users.view',
  roles: 'roles.view',
  cms: 'cms.manage',
  news: 'news.view',
  feedback: 'feedback.view_own',
  activity: 'audit_logs.view',
  services: 'services.view',
  routes: 'service_steps.view',
  qr: 'qr_codes.view',
  office: 'services.view',
};

export interface SidebarProps {
  role?: RoleKey | string;
  onNavigate?: () => void;
  onLogout?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role: propRole,
  onNavigate: propOnNavigate,
  onLogout: propOnLogout,
  mobileOpen: propMobileOpen,
  setMobileOpen: propSetMobileOpen,
}) => {
  const portal = usePortal();
  const { hasPermission } = usePermissions();

  const role = (propRole || portal.role || 'super') as RoleKey;
  const mobileOpen = propMobileOpen !== undefined ? propMobileOpen : portal.mobileOpen;
  const setMobileOpen = propSetMobileOpen || portal.setMobileOpen;
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
  });

  const data = ROLE[role] || ROLE.super;
  const navGroups = React.useMemo(() => {
    if (apiNavResponse?.data && apiNavResponse.data.length > 0) {
      const items = apiNavResponse.data
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
            text: item.label,
            icon: iconName,
            required_permission: item.required_permission || NAV_ITEM_PERMISSION_MAP[pathId],
          };
        })
        .filter((item) => !item.required_permission || hasPermission(item.required_permission));

      // Ensure authorized portal sections are always accessible in the sidebar
      if (hasPermission('roles.view') && !items.some((i) => i.id === 'roles')) {
        items.push({
          id: 'roles',
          text: 'Roles & permissions',
          icon: 'shield',
          required_permission: 'roles.view',
        });
      }
      if (hasPermission('news.view') && !items.some((i) => i.id === 'news')) {
        items.push({
          id: 'news',
          text: 'News & events',
          icon: 'news',
          required_permission: 'news.view',
        });
      }
      if (hasPermission('audit_logs.view') && !items.some((i) => i.id === 'activity')) {
        items.push({
          id: 'activity',
          text: 'Activity log',
          icon: 'activity',
          required_permission: 'audit_logs.view',
        });
      }

      return [{ label: '', items }];
    }

    const defaultGroups = NAV[role] || [];
    return defaultGroups
      .map((group: any) => ({
        ...group,
        items: group.items.filter((item: any) => {
          const requiredPerm = NAV_ITEM_PERMISSION_MAP[item.id];
          return !requiredPerm || hasPermission(requiredPerm);
        }),
      }))
      .filter((group: any) => group.items.length > 0);
  }, [apiNavResponse, role, hasPermission]);

  const displayName = portal.authUser?.name || data.name;
  const displayRole = portal.authUser?.role?.name || data.label;
  const initials = portal.authUser?.name
    ? portal.authUser.name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : data.initials;

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
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="side-nav" aria-label="Admin navigation">
          <div className="side-nav-groups">
            {navGroups.map((group: any) => (
              <div className="nav-group" key={group.items[0]?.id ?? group.label}>
                {group.label && <span className="nav-group-label">{group.label}</span>}
                {group.items.map((item: any) => (
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
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
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
