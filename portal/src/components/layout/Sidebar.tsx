import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortal } from '../../context';
import { NAV, ROLE } from '../../data/portalConstants';
import { Brand } from '../shared/Brand';
import { Icon } from '../shared/Icon';

export const Sidebar: React.FC = () => {
  const { role, signOut, mobileOpen, setMobileOpen, resetSearch, authUser } = usePortal();
  const location = useLocation();
  const navigate = useNavigate();
  const data = ROLE[role];

  const displayName = authUser?.name || data.name;
  const displayOrg = authUser?.organization?.name || data.organization;
  const displayRole = authUser?.role?.name || data.label;
  const initials = authUser?.name
    ? authUser.name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : data.initials;

  const handleNav = (path: string) => {
    navigate(path);
    resetSearch();
    setMobileOpen(false);
  };

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
        <div className="sidebar-workspace">
          <span className="workspace-avatar">
            <Icon
              name={role === 'super' ? 'globe' : role === 'subcity' ? 'map' : 'building'}
              size={17}
            />
          </span>
          <span>
            <small>YOUR WORKSPACE</small>
            <b>{displayOrg.split(' · ')[0]}</b>
          </span>
          <Icon name="chevron" size={15} />
        </div>
        <nav className="side-nav" aria-label="Admin navigation">
          {NAV[role].map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    className={`nav-item${isActive ? ' active' : ''}`}
                    onClick={() => handleNav(item.path)}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.text}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-card-icon">
              <Icon name="spark" size={16} />
            </span>
            <b>Here to help</b>
            <p>Need a hand with your workspace?</p>
            <button
              onClick={() =>
                window.alert('Your system support team can help with workspace access and setup.')
              }
            >
              Contact support <Icon name="arrow" size={14} />
            </button>
          </div>
          <div className="side-profile">
            <span className="avatar">{initials}</span>
            <span className="profile-copy">
              <b>{displayName}</b>
              <small>{displayRole}</small>
            </span>
            <button
              className="logout-button"
              onClick={signOut}
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
