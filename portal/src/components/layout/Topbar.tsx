import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
import { ROLE } from '../../data/portalData.js';
import { usePortal } from '../../context';
import type { RoleKey } from '../../types/portal.types';

export interface TopbarProps {
  role?: RoleKey | string;
  onMenu?: () => void;
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  role: propRole,
  onMenu: propOnMenu,
  onLogout: propOnLogout,
}) => {
  const portal = usePortal();
  const [profileOpen, setProfileOpen] = useState(false);

  const role = (propRole || portal.role || 'super') as RoleKey;
  const onMenu = propOnMenu || (() => portal.setMobileOpen(true));
  const onLogout = propOnLogout || portal.signOut;

  const data = ROLE[role] || ROLE.super;
  const displayName = portal.authUser?.name || data.name;
  const displayOrg = portal.authUser?.organization?.name || data.organization;
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

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation">
          <Icon name="menu" />
        </button>
        <div className="breadcrumb">
          <span>{displayOrg.split(' · ')[0]}</span>
          <Icon name="chevron" size={13} />
          <b>Admin portal</b>
        </div>
      </div>
      <div className="topbar-tools">
        <div className="profile-anchor">
          <button
            className="top-profile"
            onClick={() => setProfileOpen(!profileOpen)}
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
              <button
                className="popover-link"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
              >
                <Icon name="logout" size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
