import React, { useState } from 'react';
import { usePortal } from '../../context';
import { ROLE } from '../../data/portalConstants';
import { Icon } from '../shared/Icon';

export const Topbar: React.FC = () => {
  const { role, signOut, setMobileOpen, authUser } = usePortal();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Icon name="menu" />
        </button>
        <div className="breadcrumb">
          <span>{displayOrg.split(' · ')[0]}</span>
          <Icon name="chevron" size={13} />
          <b>Admin portal</b>
        </div>
      </div>
      <div className="topbar-tools">
        <span className="sample-badge">
          <span style={authUser ? { background: '#2c7a51' } : undefined} />
          {authUser ? 'Live connected' : 'Demo data'}
        </span>
        <button
          className={`icon-button notification-button${notificationsOpen ? ' pressed' : ''}`}
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setProfileOpen(false);
          }}
          aria-label="Notifications"
        >
          <Icon name="bell" size={18} />
          <i />
        </button>
        {notificationsOpen && (
          <div className="popover notification-popover">
            <div className="popover-heading">
              <b>Notifications</b>
              <span>2 new</span>
            </div>
            <div className="notification-item">
              <span className="notif-dot gold-bg" />
              <span>
                <b>Feedback needs attention</b>
                <small>Two complaints were received today</small>
              </span>
            </div>
            <div className="notification-item">
              <span className="notif-dot sage-bg" />
              <span>
                <b>Service guide updated</b>
                <small>Business renewal · 1 hour ago</small>
              </span>
            </div>
            <button className="popover-link" onClick={() => setNotificationsOpen(false)}>
              You're all caught up
            </button>
          </div>
        )}
        <span className="topbar-divider" />
        <div className="profile-anchor">
          <button
            className="top-profile"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            <span className="avatar small-avatar">{initials}</span>
            <span>
              <b>{displayName}</b>
              <small>{displayRole}</small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          {profileOpen && (
            <div className="popover profile-popover">
              <div className="profile-popover-heading">
                <span className="avatar">{initials}</span>
                <span>
                  <b>{displayName}</b>
                  <small>{displayOrg}</small>
                </span>
              </div>
              <button className="popover-link" onClick={signOut}>
                <Icon name="logout" size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
