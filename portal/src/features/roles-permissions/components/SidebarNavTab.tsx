import React from 'react';
import { Icon, Brand, useLanguage, getLocalizedText } from '../../shared';
import type { RoleItem } from '../../../types/portal.types';
import type { RoleNavItemDisplay } from '../constants';

export interface SidebarNavTabProps {
  activeRole: RoleItem;
  isSuperAdmin: boolean;
  canManageRoles: boolean;
  isSavingNavItems: boolean;
  allNavigationItems: RoleNavItemDisplay[];
  effectiveNavIds: number[];
  grantedNavItems: RoleNavItemDisplay[];
  filteredNavItems: RoleNavItemDisplay[];
  navSearchQuery: string;
  setNavSearchQuery: (query: string) => void;
  navStatusFilter: 'all' | 'granted' | 'revoked';
  setNavStatusFilter: (status: 'all' | 'granted' | 'revoked') => void;
  handleGrantNavItem: (id: number) => void;
  handleRevokeNavItem: (id: number) => void;
  handleGrantAllNavItems: () => void;
  handleRevokeAllNavItems: () => void;
  handleResetNavScopeDefaults: () => void;
}

export const SidebarNavTab: React.FC<SidebarNavTabProps> = ({
  activeRole,
  isSuperAdmin,
  canManageRoles,
  isSavingNavItems,
  allNavigationItems,
  effectiveNavIds,
  grantedNavItems,
  filteredNavItems,
  navSearchQuery,
  setNavSearchQuery,
  navStatusFilter,
  setNavStatusFilter,
  handleGrantNavItem,
  handleRevokeNavItem,
  handleGrantAllNavItems,
  handleRevokeAllNavItems,
  handleResetNavScopeDefaults,
}) => {
  const { language } = useLanguage();
  const roleName = getLocalizedText(activeRole.name, language) || (typeof activeRole.name === 'string' ? activeRole.name : 'Role');
  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* 1. Left Column: Interactive Authentic Portal Sidebar Preview */}
        <div
          style={{
            width: '280px',
            flexShrink: 0,
            borderRadius: '12px',
            background: 'linear-gradient(165deg, #003946 0%, #00485a 100%)',
            color: '#ffffff',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(0, 42, 51, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Top Live Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#a7f3d0' }}>
                LIVE PREVIEW
              </span>
            </div>
            <span
              style={{
                fontSize: '10.5px',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 7px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              Portal Sidebar
            </span>
          </div>

          {/* Brand Row */}
          <div style={{ padding: '2px 0 6px' }}>
            <Brand compact={false} />
          </div>

          {/* Sidebar Items Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 700,
            }}
          >
            <span>VISIBLE MODULES</span>
            <span style={{ color: '#e2c37c' }}>{grantedNavItems.length} ACTIVE</span>
          </div>

          {/* Scrollable list of simulated portal navigation links */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minHeight: '260px',
              maxHeight: '440px',
              overflowY: 'auto',
            }}
          >
            {grantedNavItems.length === 0 ? (
              <div
                style={{
                  padding: '30px 14px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(255,255,255,0.2)',
                }}
              >
                <div style={{ display: 'inline-flex', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                  <Icon name="layers" size={24} />
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: '#ffffff' }}>
                  No Modules Active
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                  Turn on modules on the right to grant sidebar access to this role.
                </p>
              </div>
            ) : (
              grantedNavItems.map((item, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: isPrimary ? 'rgba(255,255,255,0.13)' : 'transparent',
                      border: isPrimary ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                      color: isPrimary ? '#ffffff' : 'rgba(255,255,255,0.8)',
                      fontSize: '13px',
                      fontWeight: isPrimary ? 600 : 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ color: isPrimary ? '#e2c37c' : 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                      <Icon name={item.icon || 'layers'} size={16} />
                    </span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '10px', opacity: 0.5, fontFamily: 'monospace' }}>
                      {item.route.replace(/^\/admin\//, '')}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Simulated Profile Footer */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#e2c37c',
                color: '#003946',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {roleName.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ display: 'block', fontSize: '12px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {roleName}
              </b>
              <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.65)' }}>
                {activeRole.scope}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Right Column: Sidebar Module Manager & Toggles */}
        <div
          style={{
            flex: '1',
            minWidth: '320px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Console Header */}
          <div
            style={{
              padding: '16px 20px',
              background: '#fcfdfc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Sidebar Navigation Modules
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Toggle modules below to configure what users holding <strong>{roleName}</strong> will see in their portal sidebar.
              </p>
            </div>

            {/* Bulk Actions */}
            {!isSuperAdmin && canManageRoles && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ fontSize: '12px', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  onClick={handleGrantAllNavItems}
                  disabled={isSavingNavItems || grantedNavItems.length === allNavigationItems.length}
                  title="Grant all 12 navigation modules to this role"
                >
                  <Icon name="check" size={13} /> Enable all
                </button>
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ fontSize: '12px', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  onClick={handleRevokeAllNavItems}
                  disabled={isSavingNavItems || grantedNavItems.length === 0}
                  title="Hide all navigation modules from this role"
                >
                  <Icon name="close" size={13} /> Disable all
                </button>
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ fontSize: '12px', padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  onClick={handleResetNavScopeDefaults}
                  disabled={isSavingNavItems}
                  title="Reset navigation items to scope-level recommended defaults"
                >
                  <Icon name="refresh" size={13} /> Reset defaults
                </button>
              </div>
            )}
          </div>

          {/* Filter Toolbar */}
          <div
            style={{
              padding: '12px 20px',
              background: '#ffffff',
              borderBottom: '1px solid #edf1ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '5px 12px',
                gap: '8px',
                flex: '1',
                minWidth: '220px',
                maxWidth: '380px',
              }}
            >
              <Icon name="search" size={15} />
              <input
                type="text"
                placeholder="Search modules by name, route, or permission..."
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  width: '100%',
                  color: '#1e293b',
                }}
              />
              {navSearchQuery && (
                <button
                  type="button"
                  onClick={() => setNavSearchQuery('')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#94a3b8',
                  }}
                  title="Clear search"
                >
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  background: '#f1f5f9',
                  padding: '3px',
                  borderRadius: '6px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setNavStatusFilter('all')}
                  style={{
                    border: 'none',
                    background: navStatusFilter === 'all' ? '#ffffff' : 'transparent',
                    color: navStatusFilter === 'all' ? '#00485a' : '#64748b',
                    fontWeight: navStatusFilter === 'all' ? 700 : 500,
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    boxShadow: navStatusFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  All ({allNavigationItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNavStatusFilter('granted')}
                  style={{
                    border: 'none',
                    background: navStatusFilter === 'granted' ? '#ffffff' : 'transparent',
                    color: navStatusFilter === 'granted' ? '#047857' : '#64748b',
                    fontWeight: navStatusFilter === 'granted' ? 700 : 500,
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    boxShadow: navStatusFilter === 'granted' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Active ({grantedNavItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNavStatusFilter('revoked')}
                  style={{
                    border: 'none',
                    background: navStatusFilter === 'revoked' ? '#ffffff' : 'transparent',
                    color: navStatusFilter === 'revoked' ? '#b45309' : '#64748b',
                    fontWeight: navStatusFilter === 'revoked' ? 700 : 500,
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    boxShadow: navStatusFilter === 'revoked' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Hidden ({allNavigationItems.length - grantedNavItems.length})
                </button>
              </div>

              {isSavingNavItems && (
                <span style={{ fontSize: '12px', color: '#00485a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="loading-spinner" style={{ width: '13px', height: '13px' }} /> Syncing sidebar...
                </span>
              )}
            </div>
          </div>

          {/* Modules List */}
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredNavItems.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
                <Icon name="search" size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                  No navigation modules match current filter
                </p>
                <small style={{ color: '#94a3b8' }}>Try adjusting your search query or filter options.</small>
              </div>
            ) : (
              filteredNavItems.map((item) => {
                const isGranted = effectiveNavIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isGranted ? '#fcfdfc' : '#ffffff',
                      border: `1px solid ${isGranted ? '#bbf7d0' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      gap: '16px',
                      transition: 'all 0.15s ease',
                      boxShadow: isGranted ? '0 1px 2px rgba(16,185,129,0.04)' : 'none',
                    }}
                  >
                    {/* Left: Icon & Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: isGranted ? '#e8f2ed' : '#f1f5f9',
                          color: isGranted ? '#00485a' : '#64748b',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name={item.icon || 'layers'} size={18} />
                      </span>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <b style={{ fontSize: '13.5px', color: isGranted ? '#0f172a' : '#475569' }}>
                            {item.label}
                          </b>
                          <code
                            style={{
                              fontSize: '11px',
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.route}
                          </code>
                          {item.required_permission && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                              title={`Requires permission: ${item.required_permission}`}
                            >
                              req: {item.required_permission}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Modern iOS-Style Toggle Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: isGranted ? '#15803d' : '#64748b',
                          background: isGranted ? '#dcfce7' : '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}
                      >
                        {isGranted ? 'Active' : 'Hidden'}
                      </span>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isGranted}
                        onClick={() => (isGranted ? handleRevokeNavItem(item.id) : handleGrantNavItem(item.id))}
                        disabled={isSuperAdmin || !canManageRoles || isSavingNavItems}
                        style={{
                          position: 'relative',
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          border: 'none',
                          background: isGranted ? '#00485a' : '#cbd5e1',
                          cursor: isSuperAdmin || !canManageRoles || isSavingNavItems ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s ease',
                          padding: '2px',
                          flexShrink: 0,
                          outline: 'none',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                        }}
                        title={
                          isSuperAdmin
                            ? 'Super Admin navigation is immutable'
                            : !canManageRoles
                              ? 'Permission roles.manage required'
                              : isGranted
                                ? `Click to hide "${item.label}" from sidebar`
                                : `Click to show "${item.label}" in sidebar`
                        }
                      >
                        <span
                          style={{
                            display: 'block',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            transform: isGranted ? 'translateX(20px)' : 'translateX(0)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavTab;

