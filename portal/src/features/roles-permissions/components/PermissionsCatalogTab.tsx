import React from 'react';
import { Icon, useLanguage, getLocalizedText } from '../../shared';
import { DOMAIN_GROUPS } from '../constants';
import type { PermissionItem } from '../api/rolesApi';

export interface PermissionsCatalogTabProps {
  allPermissions: PermissionItem[];
  filteredPermissions: PermissionItem[];
  effectivePermissionIds: number[];
  visibleDomainGroups: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDomainFilter: string;
  setSelectedDomainFilter: (domain: string) => void;
  statusFilter: 'all' | 'granted' | 'revoked';
  setStatusFilter: (status: 'all' | 'granted' | 'revoked') => void;
  isSuperAdmin: boolean;
  canManageRoles: boolean;
  isSavingPermissions: boolean;
  isLoadingRoleDetail: boolean;
  handleBulkToggleFiltered: (grant: boolean) => void;
  handleToggleDomainAll: (domainId: string, grant: boolean) => void;
  handleToggleDomainPermission: (permissionId: number) => void;
}

export const PermissionsCatalogTab: React.FC<PermissionsCatalogTabProps> = ({
  allPermissions,
  filteredPermissions,
  effectivePermissionIds,
  visibleDomainGroups,
  searchQuery,
  setSearchQuery,
  selectedDomainFilter,
  setSelectedDomainFilter,
  statusFilter,
  setStatusFilter,
  isSuperAdmin,
  canManageRoles,
  isSavingPermissions,
  isLoadingRoleDetail,
  handleBulkToggleFiltered,
  handleToggleDomainAll,
  handleToggleDomainPermission,
}) => {
  const { language } = useLanguage();
  const hasActivePermFilters =
    searchQuery.trim().length > 0 || selectedDomainFilter !== 'all' || statusFilter !== 'all';

  return (
    <div>
      {/* Search & Filter Toolbar */}
      <div
        style={{
          padding: '1rem 1.5rem',
          background: '#ffffff',
          borderBottom: '1px solid #edf1ed',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search Box */}
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
              minWidth: '260px',
              maxWidth: '440px',
            }}
          >
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Search permissions by name, key (e.g. services.create), or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: '#1e293b',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#94a3b8',
                }}
                title="Clear search"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          {/* Filters & Bulk Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Domain Selector */}
            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              style={{
                minHeight: '34px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '12.5px',
                color: '#334155',
              }}
            >
              <option value="all">All Domains ({DOMAIN_GROUPS.length})</option>
              {DOMAIN_GROUPS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div
              style={{
                display: 'inline-flex',
                background: '#f1f5f9',
                padding: '2px',
                borderRadius: '6px',
              }}
            >
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                style={{
                  border: 'none',
                  background: statusFilter === 'all' ? '#fff' : 'transparent',
                  color: statusFilter === 'all' ? '#00485a' : '#64748b',
                  fontWeight: statusFilter === 'all' ? 700 : 500,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  boxShadow: statusFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                }}
              >
                All ({allPermissions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('granted')}
                style={{
                  border: 'none',
                  background: statusFilter === 'granted' ? '#fff' : 'transparent',
                  color: statusFilter === 'granted' ? '#047857' : '#64748b',
                  fontWeight: statusFilter === 'granted' ? 700 : 500,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  boxShadow: statusFilter === 'granted' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Granted ({effectivePermissionIds.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('revoked')}
                style={{
                  border: 'none',
                  background: statusFilter === 'revoked' ? '#fff' : 'transparent',
                  color: statusFilter === 'revoked' ? '#dc2626' : '#64748b',
                  fontWeight: statusFilter === 'revoked' ? 700 : 500,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  boxShadow: statusFilter === 'revoked' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Revoked ({allPermissions.length - effectivePermissionIds.length})
              </button>
            </div>

            {/* Bulk Actions for Filtered Results */}
            {!isSuperAdmin && canManageRoles && filteredPermissions.length > 0 && (
              <div style={{ display: 'inline-flex', gap: '6px' }}>
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  onClick={() => handleBulkToggleFiltered(true)}
                  disabled={isSavingPermissions}
                  title="Grant all permissions currently displayed"
                >
                  Grant shown
                </button>
                <button
                  type="button"
                  className="button secondary small-button"
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  onClick={() => handleBulkToggleFiltered(false)}
                  disabled={isSavingPermissions}
                  title="Revoke all permissions currently displayed"
                >
                  Revoke shown
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar & Match Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
          <span>
            Showing <b>{filteredPermissions.length}</b> of <b>{allPermissions.length}</b> permissions
            {hasActivePermFilters && (
              <>
                {' '}· Filter active ({searchQuery ? `"${searchQuery}", ` : ''}
                {selectedDomainFilter !== 'all' ? `domain: ${selectedDomainFilter}, ` : ''}
                {statusFilter !== 'all' ? `status: ${statusFilter}` : ''})
              </>
            )}
          </span>
          {hasActivePermFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDomainFilter('all');
                setStatusFilter('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#00485a',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '12px',
                padding: 0,
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Domain Permissions Grid */}
      <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
        {isLoadingRoleDetail ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div className="loading-spinner" />
            <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading role permissions...</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Connecting to RBAC schema</p>
          </div>
        ) : visibleDomainGroups.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '3rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', marginBottom: '12px' }}>
              <Icon name="search" size={24} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#1e293b' }}>
              No permissions match current filters
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              No permissions match query &quot;{searchQuery}&quot; under the active filter selection.
            </p>
            <button
              type="button"
              className="button secondary small-button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDomainFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {visibleDomainGroups.map((domain) => {
              const isAllDomainGranted = domain.grantedInDomain === domain.totalInDomain;
              const isNoneDomainGranted = domain.grantedInDomain === 0;

              return (
                <div
                  key={domain.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Domain Header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      background: '#fcfdfc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#e8f2ed',
                          color: '#00485a',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name={domain.icon || 'shield'} size={16} />
                      </span>
                      <div>
                        <b style={{ color: '#0f172a', fontSize: '13.5px', display: 'block' }}>
                          {domain.label}
                        </b>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {domain.desc}
                        </span>
                      </div>
                    </div>

                    {/* Badge & Quick Grant/Revoke All in Domain */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: isAllDomainGranted
                            ? '#dcfce7'
                            : isNoneDomainGranted
                              ? '#f1f5f9'
                              : '#e0f2fe',
                          color: isAllDomainGranted
                            ? '#15803d'
                            : isNoneDomainGranted
                              ? '#64748b'
                              : '#0369a1',
                        }}
                      >
                        {isAllDomainGranted
                          ? `✓ All ${domain.totalInDomain}`
                          : `${domain.grantedInDomain}/${domain.totalInDomain}`}
                      </span>

                      {!isSuperAdmin && canManageRoles && (
                        <button
                          type="button"
                          onClick={() => handleToggleDomainAll(domain.id, !isAllDomainGranted)}
                          disabled={isSavingPermissions}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#00485a',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '2px 4px',
                          }}
                          title={
                            isAllDomainGranted
                              ? `Revoke all in ${domain.label}`
                              : `Grant all in ${domain.label}`
                          }
                        >
                          {isAllDomainGranted ? 'Revoke all' : 'Grant all'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Permissions List */}
                  <div
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      flex: 1,
                    }}
                  >
                    {domain.perms.map((perm: any) => {
                      const isGranted = effectivePermissionIds.includes(perm.id);

                      return (
                        <div
                          key={perm.id}
                          onClick={() => !isSuperAdmin && canManageRoles && handleToggleDomainPermission(perm.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: isGranted ? '#f0fdf4' : '#ffffff',
                            border: `1px solid ${isGranted ? '#bbf7d0' : '#f1f5f9'}`,
                            cursor: isSuperAdmin || !canManageRoles ? 'default' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ paddingTop: '2px' }}>
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={isSuperAdmin || !canManageRoles}
                              onChange={() => handleToggleDomainPermission(perm.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                cursor: isSuperAdmin || !canManageRoles ? 'default' : 'pointer',
                                accentColor: '#00485a',
                                width: '15px',
                                height: '15px',
                              }}
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '12.5px',
                                  fontWeight: 600,
                                  color: isGranted ? '#14532d' : '#1e293b',
                                }}
                              >
                                {getLocalizedText(perm.name, language) || (typeof perm.name === 'string' ? perm.name : perm.key)}
                              </span>
                              <code
                                style={{
                                  fontSize: '10.5px',
                                  background: isGranted ? '#dcfce7' : '#f1f5f9',
                                  color: isGranted ? '#166534' : '#64748b',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                }}
                              >
                                {perm.key}
                              </code>
                            </div>
                            <p
                              style={{
                                margin: '2px 0 0',
                                fontSize: '11px',
                                color: '#64748b',
                                lineHeight: 1.4,
                              }}
                            >
                              {getLocalizedText(perm.description, language) || (typeof perm.description === 'string' ? perm.description : '')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsCatalogTab;

