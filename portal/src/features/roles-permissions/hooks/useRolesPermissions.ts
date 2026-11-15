import { useMemo, useState } from 'react';
import { usePermissions, useLanguage, getLocalizedText } from '../../shared';
import type { RoleItem } from '../../../types/portal.types';
import {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useGetPermissionsQuery,
  useGetNavigationItemsQuery,
  useUpdateRolePermissionsMutation,
  useUpdateRoleNavigationItemsMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  type PermissionItem,
} from '../api/rolesApi';
import {
  CANONICAL_NAVIGATION_ITEMS,
  DOMAIN_GROUPS,
  getScopeDefaultNavIds,
  NAV_ITEM_TO_PERM_KEYS,
  type RoleNavItemDisplay,
} from '../constants';

export interface UseRolesPermissionsProps {
  roles?: RoleItem[];
  onCreateRole?: (role: RoleItem) => void;
  onUpdateRole?: (role: RoleItem) => void;
  onDeleteRole?: (roleId: string) => void;
}

export const useRolesPermissions = (props: UseRolesPermissionsProps = {}) => {
  const { roles: propRoles, onCreateRole, onUpdateRole, onDeleteRole } = props;
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'sidebar' | 'permissions'>('sidebar');

  // Backend queries
  const { data: apiRoles, isLoading: loadingRoles, refetch: refetchRoles } = useGetRolesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: apiPermissions } = useGetPermissionsQuery();
  const { data: apiNavItems, refetch: refetchNavItems } = useGetNavigationItemsQuery();

  // Mutations
  const [updateRolePermissionsTrigger, { isLoading: isSavingPermissions }] =
    useUpdateRolePermissionsMutation();
  const [updateRoleNavigationItemsTrigger, { isLoading: isSavingNavItems }] =
    useUpdateRoleNavigationItemsMutation();
  const [createRoleTrigger] = useCreateRoleMutation();
  const [updateRoleTrigger] = useUpdateRoleMutation();
  const [deleteRoleTrigger] = useDeleteRoleMutation();

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Search & Filter States
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [navStatusFilter, setNavStatusFilter] = useState<'all' | 'granted' | 'revoked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'granted' | 'revoked'>('all');

  const { hasPermission } = usePermissions();
  const canManageRoles = hasPermission('roles.manage');

  const allPermissions = useMemo<PermissionItem[]>(() => {
    if (apiPermissions?.data && Array.isArray(apiPermissions.data)) {
      return apiPermissions.data;
    }
    return [];
  }, [apiPermissions]);

  const roles = useMemo<RoleItem[]>(() => {
    if (propRoles && propRoles.length > 0) return propRoles;
    if (apiRoles?.data && Array.isArray(apiRoles.data)) {
      return apiRoles.data.map((r) => {
        const pIds = r.permission_ids || (r.permissions ? r.permissions.map((p) => p.id) : []);
        const pCount = r.permissions_count ?? pIds.length;
        const sLevel = r.scope_level || (r.slug === 'super_admin' ? 'global' : 'sub_city');
        const scopeFormatted =
          sLevel === 'global'
            ? 'Platform wide'
            : sLevel === 'sub_city'
              ? 'Sub-city wide'
              : sLevel === 'woreda'
                ? 'Woreda wide'
                : sLevel === 'bureau'
                  ? 'Bureau local'
                  : sLevel === 'staff'
                    ? 'Operational desk'
                    : `${sLevel.charAt(0).toUpperCase() + sLevel.slice(1)} level`;

        return {
          id: String(r.id),
          slug: r.slug,
          name: getLocalizedText(r.name, language) || (typeof r.name === 'string' ? r.name : r.slug),
          description: getLocalizedText(r.description, language) || (typeof r.description === 'string' ? r.description : ''),
          isSystem: Boolean(r.is_system),
          scope_level: sLevel,
          scope: scopeFormatted,
          permissionsCount: pCount,
          permissionIds: pIds,
          userCount: 0,
        };
      });
    }
    return [];
  }, [propRoles, apiRoles, language]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  const activeRole = useMemo<RoleItem | null>(() => {
    if (!roles || roles.length === 0) return null;
    if (selectedRoleId) {
      const found = roles.find(
        (r) =>
          String(r.id) === selectedRoleId ||
          r.slug === selectedRoleId ||
          (selectedRoleId === 'super' && (r.slug === 'super_admin' || r.id === 'super_admin')) ||
          (selectedRoleId === 'subcity' && (r.slug === 'sub_city_admin' || r.id === 'sub_city_admin')) ||
          (selectedRoleId === 'bureau' && (r.slug === 'bureau_admin' || r.id === 'bureau_admin'))
      );
      if (found) return found;
    }
    return roles[0] || null;
  }, [roles, selectedRoleId]);

  const activeRoleQueryId = activeRole && !isNaN(Number(activeRole.id)) ? Number(activeRole.id) : '';
  const { data: activeRoleDetail, isLoading: isLoadingRoleDetail, refetch: refetchRoleDetail } = useGetRoleByIdQuery(activeRoleQueryId, {
    skip: !activeRoleQueryId,
  });

  const isSuperAdmin =
    activeRole?.slug === 'super_admin' ||
    activeRole?.id === 'super_admin' ||
    activeRole?.id === 'super';

  const effectivePermissionIds = useMemo<number[]>(() => {
    if (!activeRole) return [];
    if (isSuperAdmin) {
      return allPermissions.map((p) => p.id);
    }
    const detailData: any = (activeRoleDetail as any)?.data?.data || (activeRoleDetail as any)?.data || activeRoleDetail;
    if (Array.isArray(detailData?.permissions)) {
      return detailData.permissions.map((p: any) => (typeof p === 'number' ? p : p.id));
    }
    if (Array.isArray(detailData?.permission_ids)) {
      return detailData.permission_ids;
    }
    if (Array.isArray(activeRole.permissionIds)) {
      return activeRole.permissionIds;
    }
    return [];
  }, [activeRole, activeRoleDetail, allPermissions, isSuperAdmin]);

  const activePermissionsCount = isSuperAdmin
    ? allPermissions.length
    : (effectivePermissionIds.length || activeRole?.permissionsCount || 0);

  const allNavigationItems = useMemo<RoleNavItemDisplay[]>(() => {
    if (apiNavItems?.data && Array.isArray(apiNavItems.data) && apiNavItems.data.length > 0) {
      return apiNavItems.data
        .map((item) => {
          const canonical = CANONICAL_NAVIGATION_ITEMS.find(
            (c) =>
              c.id === Number(item.id) ||
              c.route.toLowerCase() === (item.route || '').toLowerCase() ||
              c.label.toLowerCase() === (item.label || '').toLowerCase()
          );
          const routeKey = (item.route || '').replace(/^\/admin\//, '').replace(/^\//, '');
          return {
            id: Number(item.id),
            key: canonical?.key || routeKey || `nav_${item.id}`,
            label: item.label || canonical?.label || `Navigation ${item.id}`,
            route: item.route || canonical?.route || `/admin/${item.id}`,
            icon: canonical?.icon || 'layers',
            desc: canonical?.desc || item.description || `Access to ${item.label} portal module.`,
            required_permission: item.required_permission || canonical?.required_permission || null,
            display_order: Number(item.display_order ?? item.id),
          };
        })
        .sort((a, b) => a.display_order - b.display_order);
    }
    return CANONICAL_NAVIGATION_ITEMS;
  }, [apiNavItems]);

  const effectiveNavIds = useMemo<number[]>(() => {
    if (!activeRole) return [];
    if (isSuperAdmin) {
      return allNavigationItems.map((n) => n.id);
    }
    const detailData: any = (activeRoleDetail as any)?.data?.data || (activeRoleDetail as any)?.data || activeRoleDetail;
    if (detailData?.navigation_item_ids && Array.isArray(detailData.navigation_item_ids)) {
      return detailData.navigation_item_ids.map((id: any) => Number(id));
    }
    if (detailData?.navigation_items && Array.isArray(detailData.navigation_items)) {
      return detailData.navigation_items
        .map((item: any) => {
          if (typeof item === 'number') return item;
          if (typeof item === 'object' && item !== null && item.id) return Number(item.id);
          if (typeof item === 'string') {
            const match = allNavigationItems.find(
              (n) => n.key === item || n.route === item || n.label.toLowerCase() === item.toLowerCase()
            );
            return match ? match.id : null;
          }
          return null;
        })
        .filter((n: any): n is number => n !== null && !isNaN(n));
    }
    return [];
  }, [activeRole, isSuperAdmin, allNavigationItems, activeRoleDetail]);

  const grantedNavItems = useMemo(() => {
    return allNavigationItems.filter((item) => effectiveNavIds.includes(item.id));
  }, [allNavigationItems, effectiveNavIds]);

  const filteredNavItems = useMemo(() => {
    let list = allNavigationItems;
    if (navStatusFilter === 'granted') {
      list = list.filter((item) => effectiveNavIds.includes(item.id));
    } else if (navStatusFilter === 'revoked') {
      list = list.filter((item) => !effectiveNavIds.includes(item.id));
    }
    if (navSearchQuery.trim()) {
      const q = navSearchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.route.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          (item.required_permission && item.required_permission.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allNavigationItems, effectiveNavIds, navStatusFilter, navSearchQuery]);

  const syncNavItemsToBackend = async (
    newNavIds: number[],
    itemName?: string,
    action?: 'granted' | 'revoked' | 'all_granted' | 'all_revoked' | 'reset'
  ) => {
    if (!activeRole || !activeRole.id || isNaN(Number(activeRole.id))) return;
    if (isSuperAdmin) {
      setErrorStatus('Super Admin navigation access is root-level and cannot be modified.');
      setTimeout(() => setErrorStatus(null), 3500);
      return;
    }

    try {
      const result = await updateRoleNavigationItemsTrigger({
        roleId: Number(activeRole.id),
        navigation_items: newNavIds,
      }).unwrap();

      if (action === 'granted' && itemName) {
        const grantedItem = allNavigationItems.find((n) => n.label === itemName);
        if (grantedItem?.required_permission) {
          const permObj = allPermissions.find((p) => p.key === grantedItem.required_permission);
          if (permObj && !effectivePermissionIds.includes(permObj.id)) {
            const updatedPerms = [...effectivePermissionIds, permObj.id];
            await updateRolePermissionsTrigger({
              roleId: Number(activeRole.id),
              permission_ids: updatedPerms,
            }).unwrap();
          }
        }
      }

      await refetchRoles();
      if (refetchNavItems) {
        await refetchNavItems();
      }
      if (refetchRoleDetail) {
        await refetchRoleDetail();
      }

      if (action === 'granted') {
        setSaveStatus(`"${itemName}" enabled in sidebar for "${activeRole.name}".`);
      } else if (action === 'revoked') {
        setSaveStatus(`"${itemName}" hidden from sidebar for "${activeRole.name}".`);
      } else if (action === 'all_granted') {
        setSaveStatus(`All ${newNavIds.length} navigation modules enabled for "${activeRole.name}".`);
      } else if (action === 'all_revoked') {
        setSaveStatus(`All sidebar navigation modules hidden for "${activeRole.name}".`);
      } else if (action === 'reset') {
        setSaveStatus(`Sidebar navigation reset to ${activeRole.scope} defaults (${newNavIds.length} modules).`);
      } else {
        setSaveStatus(result.message || 'Sidebar navigation updated successfully.');
      }
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      console.error('Backend updateRoleNavigationItems error:', err);
      const msg = err?.data?.message || err?.message || 'Failed to update navigation items on backend.';
      setErrorStatus(msg);
      setTimeout(() => setErrorStatus(null), 4500);
    }
  };

  const handleGrantNavItem = async (navItemId: number) => {
    if (!canManageRoles) {
      setErrorStatus('Permission denied: roles.manage is required to modify navigation items.');
      setTimeout(() => setErrorStatus(null), 3500);
      return;
    }
    const item = allNavigationItems.find((n) => n.id === navItemId);
    const newNavIds = Array.from(new Set([...effectiveNavIds, navItemId]));
    await syncNavItemsToBackend(newNavIds, item?.label, 'granted');
  };

  const handleRevokeNavItem = async (navItemId: number) => {
    if (!canManageRoles) {
      setErrorStatus('Permission denied: roles.manage is required to modify navigation items.');
      setTimeout(() => setErrorStatus(null), 3500);
      return;
    }
    const item = allNavigationItems.find((n) => n.id === navItemId);
    const newNavIds = effectiveNavIds.filter((id) => id !== navItemId);
    await syncNavItemsToBackend(newNavIds, item?.label, 'revoked');
  };

  const handleGrantAllNavItems = async () => {
    if (!canManageRoles || isSuperAdmin) return;
    const allIds = allNavigationItems.map((n) => n.id);
    await syncNavItemsToBackend(allIds, undefined, 'all_granted');
  };

  const handleRevokeAllNavItems = async () => {
    if (!canManageRoles || isSuperAdmin) return;
    await syncNavItemsToBackend([], undefined, 'all_revoked');
  };

  const handleResetNavScopeDefaults = async () => {
    if (!canManageRoles || isSuperAdmin || !activeRole) return;
    const defaultIds = getScopeDefaultNavIds(activeRole.scope_level);
    await syncNavItemsToBackend(defaultIds, undefined, 'reset');
  };

  const syncPermissionsToBackend = async (newPermissionIds: number[]) => {
    if (!activeRole) return;
    if (isSuperAdmin) {
      setErrorStatus('Super Admin permissions cannot be modified.');
      setTimeout(() => setErrorStatus(null), 4000);
      return;
    }

    if (activeRole.id && !isNaN(Number(activeRole.id))) {
      try {
        const result = await updateRolePermissionsTrigger({
          roleId: Number(activeRole.id),
          permission_ids: newPermissionIds,
        }).unwrap();

        await refetchRoles();
        if (refetchRoleDetail) {
          await refetchRoleDetail();
        }
        if (result.success) {
          setSaveStatus(
            `Role permissions updated successfully (${newPermissionIds.length} permissions active).`
          );
        } else {
          setSaveStatus(result.message || 'Permissions updated.');
        }
        setTimeout(() => setSaveStatus(null), 3500);
      } catch (err: any) {
        console.error('Backend updateRolePermissions error:', err);
        const msg = err?.data?.message || err?.message || 'Failed to update permissions on backend.';
        setErrorStatus(msg);
        setTimeout(() => setErrorStatus(null), 4500);
      }
    }
  };

  const handleToggleDomainPermission = async (permissionId: number) => {
    if (!canManageRoles) {
      setErrorStatus('Permission denied: roles.manage is required to modify policy permissions.');
      setTimeout(() => setErrorStatus(null), 3500);
      return;
    }
    if (!activeRole || isSuperAdmin) {
      if (isSuperAdmin) {
        setErrorStatus('Super Admin permissions cannot be modified.');
        setTimeout(() => setErrorStatus(null), 3500);
      }
      return;
    }
    const hasPerm = effectivePermissionIds.includes(permissionId);
    const newPermissionIds = hasPerm
      ? effectivePermissionIds.filter((id) => id !== permissionId)
      : [...effectivePermissionIds, permissionId];
    await syncPermissionsToBackend(newPermissionIds);
  };

  const handleToggleDomainAll = async (domainId: string, grant: boolean) => {
    if (!canManageRoles || !activeRole || isSuperAdmin) return;
    const domainPermIds = allPermissions.filter((p) => p.group === domainId).map((p) => p.id);
    let newPermissionIds: number[];
    if (grant) {
      newPermissionIds = Array.from(new Set([...effectivePermissionIds, ...domainPermIds]));
    } else {
      newPermissionIds = effectivePermissionIds.filter((id) => !domainPermIds.includes(id));
    }
    await syncPermissionsToBackend(newPermissionIds);
  };

  const filteredPermissions = useMemo(() => {
    return allPermissions.filter((perm) => {
      if (selectedDomainFilter !== 'all' && perm.group !== selectedDomainFilter) {
        return false;
      }
      const isGranted = effectivePermissionIds.includes(perm.id);
      if (statusFilter === 'granted' && !isGranted) return false;
      if (statusFilter === 'revoked' && isGranted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const domain = DOMAIN_GROUPS.find((d) => d.id === perm.group);
        const matchName = (getLocalizedText(perm.name, language) || (typeof perm.name === 'string' ? perm.name : '')).toLowerCase().includes(q);
        const matchKey = (perm.key || '').toLowerCase().includes(q);
        const matchDesc = (getLocalizedText(perm.description, language) || (typeof perm.description === 'string' ? perm.description : '')).toLowerCase().includes(q);
        const matchDomain = domain ? domain.label.toLowerCase().includes(q) : false;
        return matchName || matchKey || matchDesc || matchDomain;
      }
      return true;
    });
  }, [allPermissions, selectedDomainFilter, statusFilter, searchQuery, effectivePermissionIds, language]);

  const handleBulkToggleFiltered = async (grant: boolean) => {
    if (!canManageRoles || !activeRole || isSuperAdmin) return;
    const filteredIds = filteredPermissions.map((p) => p.id);
    let newPermissionIds: number[];
    if (grant) {
      newPermissionIds = Array.from(new Set([...effectivePermissionIds, ...filteredIds]));
    } else {
      newPermissionIds = effectivePermissionIds.filter((id) => !filteredIds.includes(id));
    }
    await syncPermissionsToBackend(newPermissionIds);
  };

  const visibleDomainGroups = useMemo(() => {
    const backendGroups = Array.from(new Set(allPermissions.map((p) => p.group))).filter(Boolean);
    const groupsMeta = [...DOMAIN_GROUPS];
    backendGroups.forEach((bg) => {
      if (!groupsMeta.some((g) => g.id === bg)) {
        groupsMeta.push({
          id: bg,
          label: bg.charAt(0).toUpperCase() + bg.slice(1).replace(/_/g, ' '),
          desc: `Permissions related to ${bg.replace(/_/g, ' ')}.`,
          icon: 'shield',
        });
      }
    });

    return groupsMeta
      .map((domain) => {
        const perms = filteredPermissions.filter((p) => p.group === domain.id);
        const allDomainPerms = allPermissions.filter((p) => p.group === domain.id);
        const grantedCount = allDomainPerms.filter((p) =>
          effectivePermissionIds.includes(p.id)
        ).length;
        return {
          ...domain,
          perms,
          totalInDomain: allDomainPerms.length,
          grantedInDomain: grantedCount,
        };
      })
      .filter((g) => g.perms.length > 0);
  }, [filteredPermissions, allPermissions, effectivePermissionIds]);

  const handleSaveRole = async (saved: any) => {
    setErrorStatus(null);
    setSaveStatus(null);

    let resolvedPermissionIds: number[] = [];
    if (Array.isArray(saved.permission_ids) && saved.permission_ids.length > 0) {
      resolvedPermissionIds = saved.permission_ids;
    } else if (Array.isArray(saved.permissionIds) && saved.permissionIds.length > 0) {
      resolvedPermissionIds = saved.permissionIds;
    } else if (Array.isArray(saved.navigationItems) && saved.navigationItems.length > 0) {
      const neededKeys = new Set<string>();
      saved.navigationItems.forEach((navKey: string) => {
        (NAV_ITEM_TO_PERM_KEYS[navKey] || []).forEach((k) => neededKeys.add(k));
      });
      resolvedPermissionIds = allPermissions
        .filter((p) => neededKeys.has(p.key))
        .map((p) => p.id);
    }

    const scopeLevel = saved.scope_level || (saved.scope ? saved.scope.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'sub_city');
    const navItems = saved.navigation_items || saved.navigationItems;

    if (editingRole) {
      if (editingRole.id && !isNaN(Number(editingRole.id))) {
        try {
          const res = await updateRoleTrigger({
            id: Number(editingRole.id),
            name: saved.name,
            scope_level: scopeLevel,
            description: saved.description,
            permission_ids: resolvedPermissionIds,
            navigation_items: navItems,
          }).unwrap();

          await refetchRoles();
        if (refetchRoleDetail) {
          await refetchRoleDetail();
        }
          setSelectedRoleId(String(res.data?.id || editingRole.id));
          if (onUpdateRole && res.data) {
            onUpdateRole({
              id: String(res.data.id),
              name: res.data.name,
              slug: res.data.slug,
              description: res.data.description,
              isSystem: res.data.is_system,
              scope_level: res.data.scope_level,
            } as any);
          }
          setSaveStatus(`Role "${res.data?.name || saved.name}" updated successfully.`);
          setTimeout(() => setSaveStatus(null), 3500);
        } catch (err: any) {
          console.error('Backend updateRole error:', err);
          const is404 = err?.status === 404 || err?.status === 405;
          const msg = is404
            ? 'Backend route PUT /api/v1/roles/{id} is not implemented on the backend server yet.'
            : (err?.data?.message || err?.message || 'Failed to update role on server.');
          setErrorStatus(msg);
          setTimeout(() => setErrorStatus(null), 6000);
          throw err;
        }
      }
    } else {
      try {
        const res = await createRoleTrigger({
          name: saved.name,
          slug: saved.slug,
          scope_level: scopeLevel,
          description: saved.description,
          permission_ids: resolvedPermissionIds,
          navigation_items: navItems,
        }).unwrap();

        await refetchRoles();
        if (refetchRoleDetail) {
          await refetchRoleDetail();
        }
        if (res.data?.id) {
          setSelectedRoleId(String(res.data.id));
        }
        if (onCreateRole && res.data) {
          onCreateRole({
            id: String(res.data.id),
            name: res.data.name,
            slug: res.data.slug,
            description: res.data.description,
            isSystem: res.data.is_system,
            scope_level: res.data.scope_level,
          } as any);
        }
        setSaveStatus(
          `Custom role "${res.data?.name || saved.name}" successfully created with ${resolvedPermissionIds.length} permissions.`
        );
        setTimeout(() => setSaveStatus(null), 3500);
      } catch (err: any) {
        console.error('Backend createRole error:', err);
        const is404 = err?.status === 404 || err?.status === 405;
        const msg = is404
          ? 'Backend route POST /api/v1/roles is not implemented on the backend server yet.'
          : (err?.data?.message || err?.message || 'Failed to create role on backend.');
        setErrorStatus(msg);
        setTimeout(() => setErrorStatus(null), 6000);
        throw err;
      }
    }
  };

  const handleDeleteRole = async (roleToDelete: RoleItem) => {
    if (roleToDelete.isSystem) {
      setErrorStatus('System roles are essential to platform governance and cannot be deleted.');
      setTimeout(() => setErrorStatus(null), 3500);
      return;
    }
    if (window.confirm(`Are you sure you want to delete the role "${roleToDelete.name}"?`)) {
      if (roleToDelete.id && !isNaN(Number(roleToDelete.id))) {
        try {
          await deleteRoleTrigger(Number(roleToDelete.id)).unwrap();
          await refetchRoles();
        if (refetchRoleDetail) {
          await refetchRoleDetail();
        }
          if (onDeleteRole) {
            onDeleteRole(String(roleToDelete.id));
          }
          setSelectedRoleId(roles[0]?.id || '');
          setSaveStatus(`Role "${roleToDelete.name}" deleted successfully.`);
          setTimeout(() => setSaveStatus(null), 3000);
        } catch (err: any) {
          console.error('Backend deleteRole error:', err);
          const is404 = err?.status === 404 || err?.status === 405;
          const msg = is404
            ? 'Backend route DELETE /api/v1/roles/{id} is not implemented on the backend server yet.'
            : (err?.data?.message || err?.message || 'Failed to delete role on backend.');
          setErrorStatus(msg);
          setTimeout(() => setErrorStatus(null), 6000);
        }
      }
    }
  };

  return {
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
  };
};

export default useRolesPermissions;

