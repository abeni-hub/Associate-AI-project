import React, { useMemo, useState } from 'react';
import {
  Users,
  Building2,
  Search,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Download,
} from 'lucide-react';
import { usePermissions } from '../shared/hooks/usePermissions';
import { useLanguage, getLocalizedText } from '../shared/i18n';
import { AccountModal } from './components/AccountFormModal';
import { AccountsMetricsGrid } from './components/AccountsMetricsGrid';
import type { AccountItem } from '../../types/portal.types';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from './api/accountsApi';

export const AccountsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canCreate = isSuperAdmin || hasPermission('users.create') || hasPermission('users.view');
  const canUpdate = isSuperAdmin || hasPermission('users.update') || hasPermission('users.view');
  const canDelete = isSuperAdmin || hasPermission('users.delete');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AccountItem | null>(null);

  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createUserTrigger, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUserTrigger, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUserTrigger] = useDeleteUserMutation();
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
      {/* Page Heading */}
      <div className="page-heading !mb-8 sm:!mb-9">
        <div>
          <div className="eyebrow">
            <span />
            {t('accounts.eyebrow')}
          </div>
          <h1>{t('accounts.title')}</h1>
          <p>{t('accounts.subtitle')}</p>
        </div>

        <div className="heading-actions">
          <button
            type="button"
            onClick={handleExportAccounts}
            className="button secondary outline-button"
            title="Export staff directory to CSV"
          >
            <Download size={15} />
            <span>{t('common.export', 'Export list')}</span>
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="primary-button"
            >
              <Plus size={16} />
              <span>{t('accounts.addAccount')}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <AccountsMetricsGrid
        total={items.length}
        active={activeCount}
        admins={adminCount}
        offices={uniqueOrgs}
      />

      {/* Main Catalog Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {t('accounts.directoryTitle', 'Staff Directory')}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                {filtered.length} {t('common.users', 'users')}
              </span>
            </div>

            {/* Role Filter Dropdown */}
            {rolesList.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">{t('accounts.filterRole', 'Filter role:')}</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#064552]"
                >
                  <option value="All">{t('accounts.allRolesOption', 'All assigned roles')}</option>
                  {rolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('accounts.searchPlaceholder', 'Search staff by name, username, email, office...')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#064552] transition-all"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs font-semibold self-end sm:self-auto">
              {(['All', 'Active', 'Inactive'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'All' ? t('accounts.allAccounts', 'All accounts') : st === 'Active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {t('common.loading', 'Loading staff accounts...')}
            </div>
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
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                account.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {account.status === 'Active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                              </span>
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
          isLoading={isSavingUser}
        />
      )}
    </div>
  );
};

export default AccountsPage;
