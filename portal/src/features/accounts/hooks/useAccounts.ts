import { useMemo } from 'react';
import { usePortal, usePermissions } from '../../shared';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { AccountItem } from '../../../types/portal.types';
import type {
  AccountsPageProps,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types/accounts.types';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../api/accountsApi';
import {
  selectAccountsSearch,
  selectAccountsRoleFilter,
  selectIsAccountModalOpen,
  selectSelectedAccountId,
  setAccountsSearch,
  setAccountsRoleFilter,
  openCreateAccountModal,
  openEditAccountModal,
  closeAccountModal,
} from '../slice/accountsSlice';

export const useAccounts = (props?: AccountsPageProps) => {
  const portal = usePortal();
  const dispatch = useAppDispatch();

  const reduxSearch = useAppSelector(selectAccountsSearch);
  const roleFilter = useAppSelector(selectAccountsRoleFilter);
  const isAccountModalOpen = useAppSelector(selectIsAccountModalOpen);
  const selectedAccountId = useAppSelector(selectSelectedAccountId);

  const search = props?.search !== undefined ? props.search : reduxSearch || portal.search || '';

  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createUserTrigger, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUserTrigger, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUserTrigger, { isLoading: isDeletingUser }] = useDeleteUserMutation();
  const isSavingUser = isCreatingUser || isUpdatingUser;

  const items: AccountItem[] = useMemo(() => {
    if (props?.items && props.items.length > 0) return props.items;

    if (usersResponse?.data) {
      return usersResponse.data.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone || undefined,
        role: u.role?.name || 'Staff',
        role_id: u.role?.id,
        roleId: u.role?.id,
        organization:
          u.organization?.name ||
          (u.role?.slug === 'super_admin' ? 'Global Platform' : 'Unassigned'),
        organization_id: u.organization?.id,
        status: u.status === 'active' ? 'Active' : 'Inactive',
        lastActive: u.last_login_at
          ? new Date(u.last_login_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : 'Never',
      }));
    }

    return [];
  }, [props?.items, usersResponse]);

  const selectedAccountForEdit = useMemo(() => {
    if (!selectedAccountId) return null;
    return items.find((i) => i.id === selectedAccountId) || null;
  }, [selectedAccountId, items]);

  const handleOpenAdd = () => {
    if (props?.onAdd) {
      props.onAdd();
    } else {
      dispatch(openCreateAccountModal());
    }
  };

  const handleOpenEdit = (item: AccountItem) => {
    if (props?.onEdit) {
      props.onEdit(item);
    } else {
      dispatch(openEditAccountModal(item.id));
    }
  };

  const handleCloseModal = () => {
    dispatch(closeAccountModal());
  };

  const handleSaveAccount = async (payload: CreateUserPayload | UpdateUserPayload) => {
    try {
      if ('id' in payload && payload.id) {
        await updateUserTrigger(payload as UpdateUserPayload).unwrap();
      } else {
        await createUserTrigger(payload as CreateUserPayload).unwrap();
      }
      handleCloseModal();
      await refetch();
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to save account.';
      window.alert(errorMsg);
    }
  };

  const handleDeleteUser = async (user: AccountItem) => {
    if (
      window.confirm(
        `Are you sure you want to delete administrator account "${user.name}" (@${user.username})?`
      )
    ) {
      try {
        await deleteUserTrigger(user.id).unwrap();
        await refetch();
      } catch (err: unknown) {
        const errorMsg =
          (err as { data?: { message?: string } })?.data?.message || 'Failed to delete account.';
        window.alert(errorMsg);
      }
    }
  };

  const handleSearchChange = (val: string) => {
    if (props?.setSearch) {
      props.setSearch(val);
    }
    dispatch(setAccountsSearch(val));
    portal.setSearch?.(val);
  };

  const handleRoleFilterChange = (val: string) => {
    dispatch(setAccountsRoleFilter(val));
  };

  const handleExportList = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const headers = ['ID', 'Name', 'Username', 'Email', 'Role', 'Organization', 'Status', 'Last Active'];
    const rows = [
      headers,
      ...items.map((i) => [
        String(i.id),
        i.name,
        i.username,
        i.email,
        i.role,
        i.organization,
        i.status,
        i.lastActive,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civiclink_accounts_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    return items.filter(
      (item) =>
        (roleFilter === 'All roles' ||
          (item.role || '').toLowerCase().includes(roleFilter.toLowerCase())) &&
        `${item.name || ''} ${item.username || ''} ${item.role || ''} ${item.organization || ''}`
          .toLowerCase()
          .includes((search || '').toLowerCase())
    );
  }, [items, roleFilter, search]);

  const activeCount = useMemo(() => items.filter((i) => i.status === 'Active').length, [items]);
  const inactiveCount = useMemo(() => items.filter((i) => i.status !== 'Active').length, [items]);

  const { hasPermission, canManageScope, isSuperAdmin } = usePermissions();
  const canCreate = hasPermission('users.create');
  const canUpdate = hasPermission('users.update');
  const canDelete = hasPermission('users.delete');

  return {
    items,
    filtered,
    search,
    roleFilter,
    activeCount,
    inactiveCount,
    isLoading: isLoading && !usersResponse,
    isSavingUser,
    isDeletingUser,
    isAccountModalOpen,
    selectedAccountForEdit,
    canCreate,
    canUpdate,
    canDelete,
    isSuperAdmin,
    canManageScope,
    onOpenAdd: handleOpenAdd,
    onOpenEdit: handleOpenEdit,
    onCloseModal: handleCloseModal,
    onSaveAccount: handleSaveAccount,
    onDeleteAccount: handleDeleteUser,
    onSearchChange: handleSearchChange,
    onRoleFilterChange: handleRoleFilterChange,
    onExportList: handleExportList,
  };
};

