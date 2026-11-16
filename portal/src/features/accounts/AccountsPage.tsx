import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Pencil,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react';
import { usePermissions } from '../shared/hooks/usePermissions';
import { useLanguage, getLocalizedText } from '../shared/i18n';
import { AccountModal } from './components/AccountFormModal';
import { AccountsMetricsGrid } from './components/AccountsMetricsGrid';
import { AccountsToolbar } from './components/AccountsToolbar';
import { PageHeading, PageLoadingState, StatusPill } from '../shared';
import type { AccountItem } from '../../types/portal.types';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserTwoFactorMutation,
} from './api/accountsApi';

export const AccountsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canCreate = isSuperAdmin || hasPermission('users.create') || hasPermission('users.view');
  const canUpdate = isSuperAdmin || hasPermission('users.update') || hasPermission('users.view');
  const canDelete = isSuperAdmin || hasPermission('users.delete');
  const canResetTwoFactor = isSuperAdmin || hasPermission('users.reset_password');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AccountItem | null>(null);

  const { data: usersResponse, isLoading, isError, error, refetch } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const isTwoFactorSetupRequired =
    isError
    && typeof error === 'object'
    && error !== null
    && 'data' in error
    && typeof error.data === 'object'
    && error.data !== null
    && 'errors' in error.data
    && typeof error.data.errors === 'object'
    && error.data.errors !== null
    && 'reason' in error.data.errors
    && error.data.errors.reason === 'two_factor_setup_required';
  const [createUserTrigger, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUserTrigger, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUserTrigger] = useDeleteUserMutation();
  const [resetTwoFactorTrigger] = useResetUserTwoFactorMutation();
  const isSavingUser = isCreatingUser || isUpdatingUser;

  const items: AccountItem[] = useMemo(() => {
    if (usersResponse?.data) {
      return (usersResponse.data as any[]).map((u) => ({
        id: u.id,
        name: getLocalizedText(u.name as any, language) || (typeof u.name === 'string' ? u.name : 'User'),
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: getLocalizedText(u.role?.name as any, language) || (typeof u.role?.name === 'string' ? u.role.name : 'Staff'),
        role_id: u.role?.id,
        roleId: u.role?.id,
        organization: getLocalizedText(u.organization?.name as any, language) || (typeof u.organization?.name === 'string' ? u.organization.name : (u.role?.slug === 'super_admin' ? 'Global Platform' : 'Unassigned')),
        organization_id: u.organization?.id,
        session_timeout: u.session_timeout ?? null,
        two_factor_enabled: Boolean(u.two_factor_enabled),
        status: u.status === 'active' ? 'Active' : 'Inactive',
        lastActive: u.last_login_at
          ? new Date(u.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Never',
      }));
    }
    return [];
  }, [usersResponse, language]);

  const rolesList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.role) set.add(i.role);
    });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.organization && item.organization.toLowerCase().includes(q));

      const matchRole = roleFilter === 'All' || item.role === roleFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [items, search, roleFilter, statusFilter]);

  const activeCount = items.filter((i) => i.status === 'Active').length;
  const adminCount = items.filter((i) => (i.role || '').toLowerCase().includes('admin')).length;
  const uniqueOrgs = new Set(items.map((i) => i.organization_id).filter(Boolean)).size;

  const handleOpenAdd = () => {
    setSelectedAccountForEdit(null);
    setIsAccountModalOpen(true);
  };

  const handleResetTwoFactor = async (userId: number) => {
    if (!canResetTwoFactor || !window.confirm(t('twoFactor.adminResetConfirm'))) return;
    try {
      await resetTwoFactorTrigger(userId).unwrap();
      setIsAccountModalOpen(false);
      setSelectedAccountForEdit(null);
      await refetch();
    } catch (err: any) {
      window.alert(err?.data?.message || t('twoFactor.adminReset'));
    }
  };

  const handleOpenEdit = (item: AccountItem) => {
    setSelectedAccountForEdit(item);
    setIsAccountModalOpen(true);
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

  const handleDeleteAccount = async (item: AccountItem) => {
    if (window.confirm(`Are you sure you want to deactivate or remove user account "${item.name}"?`)) {
      try {
        await deleteUserTrigger(item.id).unwrap();
        await refetch();
      } catch (err: any) {
        window.alert(err?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleExportAccounts = () => {
    const headers = ['ID', 'Name', 'Username', 'Email', 'Role', 'Status'];
    const rows = items.map((a) => [
      a.id,
      `"${a.name || ''}"`,
      `"${a.username || ''}"`,
      `"${a.email || ''}"`,
      `"${a.role || ''}"`,
      `"${a.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accounts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow={t('accounts.eyebrow', 'Staff directory')}
        title={t('accounts.title', 'Accounts & staff')}
        subtitle={t('accounts.subtitle', 'Manage administrator access, office assignments, and account activity across the platform.')}
        secondary={t('common.export', 'Export list')}
        onSecondary={handleExportAccounts}
        action={canCreate ? t('accounts.addAccount', 'Add account') : undefined}
        onAction={canCreate ? handleOpenAdd : undefined}
        actionIcon="plus"
        secondaryIcon="download"
      />

      {/* KPI Stats Grid */}
      {!isError && (
        <AccountsMetricsGrid
          total={items.length}
          active={activeCount}
          admins={adminCount}
          offices={uniqueOrgs}
        />
      )}

      {/* Main Catalog Card */}
      <div className="panel table-panel accounts-panel">
        <div className="table-toolbar">
          <div>
            <h2>{t('accounts.directoryTitle', 'Staff Directory')}</h2>
            {!isError && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filtered.length} {t('common.users', 'users')}
              </span>
            )}
          </div>
          </div>

          <div className="toolbar-tools">
            <AccountsToolbar
              search={search}
              roleFilter={roleFilter}
              roleOptions={rolesList}
              onSearchChange={setSearch}
              onRoleFilterChange={setRoleFilter}
            />

            <div className="segmented-control" role="tablist" aria-label="Filter by account status">
              {(['All', 'Active', 'Inactive'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === st}
                  onClick={() => setStatusFilter(st)}
                  className={`segmented-button ${statusFilter === st ? 'active' : ''}`}
                >
                  {st === 'All' ? t('accounts.allAccounts', 'All accounts') : st === 'Active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5">
          {isError ? (
            <div className="py-12 text-center" role="alert">
              <p className="text-sm font-semibold text-slate-800">
                {isTwoFactorSetupRequired
                  ? t('twoFactor.required')
                  : t('accounts.loadError')}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                {isTwoFactorSetupRequired && (
                  <Link to="/security" className="primary-button">
                    {t('twoFactor.beginSetup', 'Set up authenticator')}
                  </Link>
                )}
                <button type="button" className="button secondary" onClick={() => void refetch()}>
                  {t('accounts.retry')}
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <PageLoadingState
              title={t('common.loading', 'Loading staff accounts...')}
              subtitle="Fetching staff directory, roles, and office assignments."
              compact
            />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <Users size={36} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">{t('accounts.emptyNotice', 'No staff accounts found')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search ? `No accounts match "${search}".` : t('accounts.emptyNotice', 'No staff accounts found')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {filtered.map((account) => {
                const initials = account.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const isSuper = account.role.toLowerCase().includes('super');

                return (
                  <div
                    key={account.id}
                    className="border border-slate-200/80 rounded-xl p-3 sm:p-3.5 bg-white hover:border-teal-200 hover:shadow-sm transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-[#064552] text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug truncate">
                              {account.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isSuper
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                  : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                              }`}>
                                {account.role}
                              </span>
                              <StatusPill status={account.status.toLowerCase()}>
                                {account.status === 'Active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                              </StatusPill>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(account)}
                              className="p-1.5 text-slate-400 hover:text-[#064552] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(account)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{account.organization}</span>
                        </div>
                        {(account.email || account.phone) && (
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                            {account.email && (
                              <div className="flex items-center gap-1 min-w-0">
                                <Mail size={11} className="text-slate-400 flex-shrink-0" />
                                <span className="truncate">{account.email}</span>
                              </div>
                            )}
                            {account.phone && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Phone size={11} className="text-slate-400 flex-shrink-0" />
                                <span>{account.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isAccountModalOpen && (
        <AccountModal
          isOpen={isAccountModalOpen}
          account={selectedAccountForEdit}
          onClose={() => {
            setIsAccountModalOpen(false);
            setSelectedAccountForEdit(null);
          }}
          onSave={handleSaveAccount}
          canResetTwoFactor={canResetTwoFactor}
          onResetTwoFactor={handleResetTwoFactor}
          isLoading={isSavingUser}
        />
      )}
    </div>
  );
};

export default AccountsPage;
