import React from 'react';
import {
  useAccounts,
  AccountsHeading,
  AccountsMetricsGrid,
  AccountsToolbar,
  AccountsTable,
  AccountsEmptyState,
  AccountsLoadingState,
  AccountFormModal,
  type AccountsPageProps,
} from './index';
import styles from './styles/accounts.module.css';

export const AccountsPage: React.FC<AccountsPageProps> = (props) => {
  const {
    filtered,
    search,
    roleFilter,
    activeCount,
    inactiveCount,
    items,
    isLoading,
    isSavingUser,
    isAccountModalOpen,
    selectedAccountForEdit,
    canCreate,
    canUpdate,
    canDelete,
    isSuperAdmin,
    canManageScope,
    onOpenAdd,
    onOpenEdit,
    onCloseModal,
    onSaveAccount,
    onDeleteAccount,
    onSearchChange,
    onRoleFilterChange,
    onExportList,
  } = useAccounts(props);

  return (
    <div className={styles.container}>
      <AccountsHeading
        canCreate={canCreate}
        onAdd={onOpenAdd}
        onExport={onExportList}
      />

      <AccountsMetricsGrid
        total={isLoading ? '...' : items.length}
        active={isLoading ? '...' : activeCount}
        inactive={isLoading ? '...' : inactiveCount}
      />

      <section className={styles.tablePanel}>
        <AccountsToolbar
          search={search}
          roleFilter={roleFilter}
          onSearchChange={onSearchChange}
          onRoleFilterChange={onRoleFilterChange}
        />

        {isLoading ? (
          <AccountsLoadingState />
        ) : (
          <>
            <AccountsTable
              items={filtered}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isSuperAdmin={isSuperAdmin}
              canManageScope={canManageScope}
              onEdit={onOpenEdit}
              onDelete={onDeleteAccount}
            />

            {!filtered.length && <AccountsEmptyState />}
          </>
        )}
      </section>

      <AccountFormModal
        isOpen={isAccountModalOpen}
        account={selectedAccountForEdit}
        onClose={onCloseModal}
        onSave={onSaveAccount}
        isLoading={isSavingUser}
      />
    </div>
  );
};

export default AccountsPage;

