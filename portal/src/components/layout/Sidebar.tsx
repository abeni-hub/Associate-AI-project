import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../shared/Icon';
import { Brand } from '../shared/Brand';
import { ROLE, NAV } from '../../data/portalData.js';
import { usePortal } from '../../context';
import type { RoleKey } from '../../types/portal.types';
import { useGetSidebarNavigationQuery } from '../../services/navigationApi';

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
    skip: !portal.session?.user,
  });

  const data = ROLE[role] || ROLE.super;
  const navGroups = React.useMemo(() => {
    if (apiNavResponse?.data && apiNavResponse.data.length > 0) {
      const items = apiNavResponse.data.map((item) => {
        let pathId = item.route.replace(/^\/portal\/?/, '') || 'overview';
        if (pathId === 'organizations') pathId = 'offices';
        if (pathId === 'users') pathId = 'accounts';

        let iconName = 'layers';
        const labelLower = item.label.toLowerCase();
        if (labelLower.includes('overview') || labelLower.includes('home')) iconName = 'chart';
        else if (labelLower.includes('organization') || labelLower.includes('office')) iconName = 'building';
        else if (labelLower.includes('user') || labelLower.includes('account')) iconName = 'users';
        else if (labelLower.includes('service')) iconName = 'layers';
        else if (labelLower.includes('document')) iconName = 'file';
        else if (labelLower.includes('feedback')) iconName = 'message';
        else if (labelLower.includes('news')) iconName = 'news';
        else if (labelLower.includes('role')) iconName = 'shield';
        else if (labelLower.includes('qr')) iconName = 'qr';

        return {
          id: pathId,
          text: item.label,
          icon: iconName,
        };
      });

      return [{ label: '', items }];
    }
    return NAV[role] || [];
  }, [apiNavResponse, role]);

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
