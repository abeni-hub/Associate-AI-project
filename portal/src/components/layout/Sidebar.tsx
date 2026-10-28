import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../shared/Icon';
import { Brand } from '../shared/Brand';
import { ROLE, NAV } from '../../data/portalData.js';
import { usePortal } from '../../context';
import type { RoleKey } from '../../types/portal.types';

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
  const onNavigate = propOnNavigate || portal.resetSearch;
  const onLogout = propOnLogout || portal.signOut;

  const data = ROLE[role] || ROLE.super;
  const navGroups = NAV[role] || [];

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
