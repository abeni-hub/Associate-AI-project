import React from 'react';
import { Icon, PageHeading, useLanguage } from '../shared';
import RoleModal from './components/RoleModal';
import { RoleHeaderBanner } from './components/RoleHeaderBanner';
import { SidebarNavTab } from './components/SidebarNavTab';
import { PermissionsCatalogTab } from './components/PermissionsCatalogTab';
import { useRolesPermissions, type UseRolesPermissionsProps } from './hooks/useRolesPermissions';
import { DOMAIN_GROUPS } from './constants';

export { DOMAIN_GROUPS };

export interface RolesPermissionsPageProps extends UseRolesPermissionsProps {}

export const RolesPermissionsPage: React.FC<RolesPermissionsPageProps> = (props) => {
  const { t } = useLanguage();
  const {
    activeTab,
    setActiveTab,
    roles,
    activeRole,
    selectedRoleId,
    setSelectedRoleId,
    isSuperAdmin,
    canManageRoles,
    loadingRoles,
    apiRoles,
    activeRoleDetail,
    isLoadingRoleDetail,
    saveStatus,
    errorStatus,
    modalOpen,
    setModalOpen,
    editingRole,
    setEditingRole,
    // Nav items tab
    navSearchQuery,
    setNavSearchQuery,
    navStatusFilter,
    setNavStatusFilter,
    allNavigationItems,
    effectiveNavIds,
    grantedNavItems,
    filteredNavItems,
    isSavingNavItems,
    handleGrantNavItem,
    handleRevokeNavItem,
    handleGrantAllNavItems,
    handleRevokeAllNavItems,
    handleResetNavScopeDefaults,
    // Permissions catalog tab
    allPermissions,
    searchQuery,
    setSearchQuery,
    selectedDomainFilter,
    setSelectedDomainFilter,
    statusFilter,
    setStatusFilter,
    effectivePermissionIds,
    activePermissionsCount,
    filteredPermissions,
    visibleDomainGroups,
    isSavingPermissions,
    handleToggleDomainPermission,
    handleToggleDomainAll,
    handleBulkToggleFiltered,
    // Role CRUD
    handleSaveRole,
    handleDeleteRole,
  } = useRolesPermissions(props);

  return (
    <>
      <PageHeading
        eyebrow={t('roles.eyebrow', 'ACCESS CONTROL & GOVERNANCE')}
        title={t('roles.title', 'Roles & permissions')}
        subtitle={t('roles.subtitle', 'Configure role-based access control (RBAC), sidebar module visibility, and detailed security policies.')}
        action={canManageRoles ? t('roles.newRoleButton', '+ New role') : undefined}
        onAction={
          canManageRoles
            ? () => {
                setEditingRole(null);
                setModalOpen(true);
              }
            : undefined
        }
      />

      {loadingRoles && !apiRoles ? (
        <section
          className="panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            gap: '14px',
            margin: '20px 0',
          }}
        >
          <div className="loading-spinner" />
          <h3 style={{ margin: 0, color: '#00485a', fontSize: '17px', fontWeight: 600 }}>
            {t('roles.loadingRoles', 'Loading security roles & permissions...')}
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
            {t('roles.connectingRbac', 'Connecting to role-based access control policies')}
          </p>
        </section>
      ) : !activeRole ? (
        <section className="panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p>{t('roles.noRoles', 'No roles available.')}</p>
        </section>
      ) : (
        <section
          className="panel permissions-catalog-panel"
          style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}
        >
          {/* Top Role Selector & Status Banner */}
          <RoleHeaderBanner
            activeRole={activeRole}
            roles={roles}
            selectedRoleId={selectedRoleId}
            setSelectedRoleId={setSelectedRoleId}
            isSuperAdmin={isSuperAdmin}
            canManageRoles={canManageRoles}
            activeRoleDetail={activeRoleDetail}
            effectivePermissionIds={effectivePermissionIds}
            setEditingRole={setEditingRole}
            setModalOpen={setModalOpen}
            handleDeleteRole={handleDeleteRole}
            saveStatus={saveStatus}
            errorStatus={errorStatus}
          />

          {/* Main 2-Tab Navigation Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #edf1ed',
              background: '#ffffff',
              padding: '0 1.5rem',
              gap: '12px',
            }}
          >
            {/* Tab 1: Sidebar Navigation */}
            <button
              type="button"
              onClick={() => setActiveTab('sidebar')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 18px',
                border: 'none',
                borderBottom: activeTab === 'sidebar' ? '3px solid #00485a' : '3px solid transparent',
                background: 'transparent',
                color: activeTab === 'sidebar' ? '#00485a' : '#64748b',
                fontWeight: activeTab === 'sidebar' ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name="layers" size={17} />
              <span>{t('roles.sidebarNav', 'Sidebar Navigation')}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: activeTab === 'sidebar' ? '#e8f2ed' : '#f1f5f9',
                  color: activeTab === 'sidebar' ? '#00485a' : '#64748b',
                }}
              >
                {grantedNavItems.length} active
              </span>
            </button>

            {/* Tab 2: Detailed Permissions */}
            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 18px',
                border: 'none',
                borderBottom: activeTab === 'permissions' ? '3px solid #00485a' : '3px solid transparent',
                background: 'transparent',
                color: activeTab === 'permissions' ? '#00485a' : '#64748b',
                fontWeight: activeTab === 'permissions' ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name="shield" size={17} />
              <span>{t('roles.detailedPerms', 'Detailed Permissions')}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: activeTab === 'permissions' ? '#e8f2ed' : '#f1f5f9',
                  color: activeTab === 'permissions' ? '#00485a' : '#64748b',
                }}
              >
                {activePermissionsCount} / {allPermissions.length} active
              </span>
            </button>
          </div>

          {/* TAB 1: SIDEBAR NAVIGATION & VISUAL PREVIEW */}
          {activeTab === 'sidebar' && (
            <SidebarNavTab
              activeRole={activeRole}
              isSuperAdmin={isSuperAdmin}
              canManageRoles={canManageRoles}
              isSavingNavItems={isSavingNavItems}
              allNavigationItems={allNavigationItems}
              effectiveNavIds={effectiveNavIds}
              grantedNavItems={grantedNavItems}
              filteredNavItems={filteredNavItems}
              navSearchQuery={navSearchQuery}
              setNavSearchQuery={setNavSearchQuery}
              navStatusFilter={navStatusFilter}
              setNavStatusFilter={setNavStatusFilter}
              handleGrantNavItem={handleGrantNavItem}
              handleRevokeNavItem={handleRevokeNavItem}
              handleGrantAllNavItems={handleGrantAllNavItems}
              handleRevokeAllNavItems={handleRevokeAllNavItems}
              handleResetNavScopeDefaults={handleResetNavScopeDefaults}
            />
          )}

          {/* TAB 2: DETAILED PERMISSIONS MATRIX */}
          {activeTab === 'permissions' && (
            <PermissionsCatalogTab
              allPermissions={allPermissions}
              filteredPermissions={filteredPermissions}
              effectivePermissionIds={effectivePermissionIds}
              visibleDomainGroups={visibleDomainGroups}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDomainFilter={selectedDomainFilter}
              setSelectedDomainFilter={setSelectedDomainFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              isSuperAdmin={isSuperAdmin}
              canManageRoles={canManageRoles}
              isSavingPermissions={isSavingPermissions}
              isLoadingRoleDetail={isLoadingRoleDetail}
              handleBulkToggleFiltered={handleBulkToggleFiltered}
              handleToggleDomainAll={handleToggleDomainAll}
              handleToggleDomainPermission={handleToggleDomainPermission}
            />
          )}

          {/* Footer Policy Info */}
          <div
            style={{
              padding: '12px 1.5rem',
              background: '#fcfdfc',
              borderTop: '1px solid #edf1ed',
              fontSize: '12px',
              color: '#64748b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span>
              Policy Target: <b>{activeRole.name}</b> ({activeRole.scope}) · Governed by Least Privilege Access Standard
            </span>
            <span>
              {isSavingPermissions || isSavingNavItems ? (
                <span style={{ color: '#00485a', fontWeight: 600 }}>Syncing changes to server...</span>
              ) : (
                <span>All modifications synchronize live to backend RBAC schema.</span>
              )}
            </span>
          </div>
        </section>
      )}

      {/* Role Creation / Editing Modal */}
      <RoleModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRole(null);
        }}
        role={editingRole}
        onSave={handleSaveRole}
      />
    </>
  );
};

export default RolesPermissionsPage;
