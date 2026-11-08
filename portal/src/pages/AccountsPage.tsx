import React, { useMemo, useState } from 'react';
import { usePortal } from '../context';
import { usePermissions } from '../hooks/usePermissions';
import { PageHeading } from '../components/shared/PageHeading';
import { SearchBox } from '../components/shared/SearchBox';
import { MetricCard } from '../components/shared/MetricCard';
import { StatusPill } from '../components/shared/StatusPill';
import { AccountModal } from '../components/accounts/AccountModal';
import type { AccountItem } from '../types/portal.types';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../services/usersApi';

export interface AccountsPageProps {
  items?: AccountItem[];
  onAdd?: () => void;
  onEdit?: (item: AccountItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  items: propItems,
  onAdd: propOnAdd,
  onEdit: propOnEdit,
  search: propSearch,
  setSearch: propSetSearch,
}) => {
  const portal = usePortal();
  const [roleFilter, setRoleFilter] = useState('All roles');

  const search = propSearch !== undefined ? propSearch : portal.search;
  const setSearch = propSetSearch || portal.setSearch;

  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery(undefined, { refetchOnMountOrArgChange: true });
  const [createUserTrigger, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUserTrigger, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUserTrigger] = useDeleteUserMutation();
  const isSavingUser = isCreatingUser || isUpdatingUser;

  const items: AccountItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;

    if (usersResponse?.data) {
      return usersResponse.data.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role?.name || 'Staff',
        role_id: u.role?.id,
        roleId: u.role?.id,
        organization: u.organization?.name || (u.role?.slug === 'super_admin' ? 'Global Platform' : 'Unassigned'),
        organization_id: u.organization?.id,
        status: u.status === 'active' ? 'Active' : 'Inactive',
        lastActive: u.last_login_at
          ? new Date(u.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Never',
      }));
    }

    return [];
  }, [propItems, usersResponse]);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AccountItem | null>(null);

  const handleOpenAdd = () => {
    if (propOnAdd) {
      propOnAdd();
    } else {
      setSelectedAccountForEdit(null);
      setIsAccountModalOpen(true);
    }
  };

  const handleOpenEdit = (item: AccountItem) => {
    if (propOnEdit) {
      propOnEdit(item);
    } else {
      setSelectedAccountForEdit(item);
      setIsAccountModalOpen(true);
    }
  };

  const handleSaveAccount = async (payload: any) => {
    try {
      if (payload.id) {
        await updateUserTrigger(payload).unwrap();
      } else {
        await createUserTrigger(payload).unwrap();
      }
      setIsAccountModalOpen(false);
      setSelectedAccountForEdit(null);
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || 'Failed to save account.');
    }
  };

  const handleDeleteUser = async (user: AccountItem) => {
    if (window.confirm(`Are you sure you want to delete administrator account "${user.name}" (@${user.username})?`)) {
      try {
        await deleteUserTrigger(user.id).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete account.');
      }
    }
  };

  const filtered = items.filter(
    (item) =>
      (roleFilter === 'All roles' || (item.role || '').toLowerCase().includes(roleFilter.toLowerCase())) &&
      `${item.name || ''} ${item.username || ''} ${item.role || ''} ${item.organization || ''}`
        .toLowerCase()
        .includes((search || '').toLowerCase())
  );

  const activeCount = items.filter((i) => i.status === 'Active').length;
  const inactiveCount = items.filter((i) => i.status !== 'Active').length;

  const { hasPermission, canManageScope, isSuperAdmin } = usePermissions();
  const canCreate = hasPermission('users.create');
  const canUpdate = hasPermission('users.update');
  const canDelete = hasPermission('users.delete');

  return (
    <>
      <PageHeading
        eyebrow="ACCESS & PERMISSIONS"
        title="Accounts"
        subtitle="Manage administrator access and credentials across every connected organization."
        action={canCreate ? 'Create account' : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
        secondary="Export list"
        onSecondary={() => window.alert('Account list export is ready.')}
      />
      <div className="metric-grid compact-metrics">
        <MetricCard
          icon="users"
          label="Total accounts"
          value={isLoading && !usersResponse ? '...' : items.length}
          note="Across administrative hierarchy"
          tone="teal"
        />
        <MetricCard
          icon="check"
          label="Active accounts"
          value={isLoading && !usersResponse ? '...' : activeCount}
          note="Access confirmed"
          tone="sage"
        />
        <MetricCard
          icon="clock"
          label="Inactive accounts"
          value={isLoading && !usersResponse ? '...' : inactiveCount}
          note="Access suspended"
          tone="gold"
        />
        <MetricCard
          icon="shield"
          label="Security audits"
          value="Synchronized"
          note="Connected to Laravel Sanctum"
          tone="blue"
        />
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h2>Administrator accounts</h2>
            <p>Role and organization determine what each admin can see and manage.</p>
          </div>
          <div className="toolbar-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search accounts" />
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by admin role"
            >
              <option>All roles</option>
              <option>Super Admin</option>
              <option>Sub-City Admin</option>
              <option>Woreda Admin</option>
              <option>Bureau Admin</option>
              <option>Staff</option>
            </select>
          </div>
        </div>
        {isLoading && !usersResponse ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
            <div className="loading-spinner" />
            <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading administrator accounts...</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Fetching roles and credentials</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ACCOUNT</th>
                <th>ROLE</th>
                <th>ORGANIZATION</th>
                <th>STATUS</th>
                <th>LAST ACTIVE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="table-person">
                      <span className="mini-avatar">
                        {(item.name || 'User')
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      <span>
                        <b>{item.name}</b>
                        <small>@{item.username}</small>
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="badge role-badge">{item.role}</span>
                  </td>
                  <td>{item.organization}</td>
                  <td>
                    <StatusPill>{item.status}</StatusPill>
                  </td>
                  <td>{item.lastActive}</td>
                  <td className="table-action-cell" style={{ display: 'flex', gap: '6px' }}>
                    {(() => {
                      const targetScope = item.role?.scope_level || (item.roleLabel?.toLowerCase().includes('super') ? 'global' : 'sub_city');
                      const canManageThisAccount = isSuperAdmin || canManageScope(targetScope);
                      return (
                        <>
                          {canUpdate && canManageThisAccount && (
                            <button
                              className="button secondary small-button"
                              onClick={() => handleOpenEdit(item)}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && canManageThisAccount && (
                            <button
                              className="button secondary small-button"
                              style={{ color: '#e53e3e', borderColor: '#feb2b2' }}
                              onClick={() => handleDeleteUser(item)}
                              title="Delete account"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && !isLoading && (
            <div className="panel empty-state">
              <b>No accounts found</b>
              <p>Try adjusting your search filters or create an account.</p>
            </div>
          )}
        </div>
        )}
      </section>

      <AccountModal
        isOpen={isAccountModalOpen}
        account={selectedAccountForEdit}
        onClose={() => {
          setIsAccountModalOpen(false);
          setSelectedAccountForEdit(null);
        }}
        onSave={handleSaveAccount}
        isLoading={isSavingUser}
      />
    </>
  );
};

export default AccountsPage;
