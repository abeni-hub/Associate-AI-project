import React, { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import RoleModal from '../components/roles/RoleModal';
import { usePermissions } from '../hooks/usePermissions';
import type { RoleItem } from '../types/portal.types';
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
  type NavigationItemData,
} from '../services/rolesApi';
/**
 * Domain groupings with metadata & icon mappings.
 */
export const DOMAIN_GROUPS: { id: string; label: string; desc: string; icon: string }[] = [
  { id: 'organizations', label: 'Organizations & Offices', desc: 'Jurisdictional structures, sub-cities, and bureaus.', icon: 'building' },
  { id: 'users', label: 'User Accounts & Access', desc: 'Administrative staff provisioning and authentication.', icon: 'users' },
  { id: 'roles', label: 'Roles & Governance', desc: 'Access control policies and administrative role definitions.', icon: 'shield' },
  { id: 'services', label: 'Public Services Catalog', desc: 'Government service criteria, subservices, and citizen guides.', icon: 'layers' },
  { id: 'documents', label: 'Required Documents', desc: 'Citizen document prerequisites and checklists.', icon: 'layers' },
  { id: 'service_steps', label: 'Room Navigation Routes', desc: 'Physical room sequence directions for office visitors.', icon: 'route' },
  { id: 'news', label: 'News & Announcements', desc: 'Citizen news items and public notices.', icon: 'news' },
  { id: 'events', label: 'Calendar Events', desc: 'Government community events and schedules.', icon: 'calendar' },
  { id: 'feedback', label: 'Citizen Voice & Feedback', desc: 'Complaints, compliments, and citizen resolution.', icon: 'message' },
  { id: 'qr_codes', label: 'Office QR Codes', desc: 'Physical desk QR tokens for direct feedback routing.', icon: 'qr' },
  { id: 'dashboard', label: 'Dashboard & Metrics', desc: 'Role-aware operational insights and analytics.', icon: 'activity' },
  { id: 'audit_logs', label: 'Security Audit Logs', desc: 'Immutable administrative system activity logs.', icon: 'lock' },
  { id: 'cms', label: 'Citizen Landing Page CMS', desc: 'Manage citizen portal landing page, announcement banner, and footer.', icon: 'palette' },
];

/**
 * Standard portal navigation modules metadata
 */
interface RoleNavItemDisplay {
  id: number;
  key: string;
  label: string;
  route: string;
  icon: string;
  desc: string;
  required_permission: string | null;
  display_order: number;
}

const CANONICAL_NAVIGATION_ITEMS: RoleNavItemDisplay[] = [
  { id: 1, key: 'overview', label: 'Overview', route: '/admin/overview', icon: 'overview', desc: 'KPI metrics, service volume charts, and recent activity feed', required_permission: 'dashboard.view', display_order: 1 },
  { id: 2, key: 'offices', label: 'Offices & Directory', route: '/admin/subcities', icon: 'building', desc: 'Jurisdictional hierarchy, sub-cities, woredas, and bureaus directory', required_permission: 'organizations.view', display_order: 2 },
  { id: 3, key: 'levels', label: 'Organization Levels', route: '/admin/levels', icon: 'layers', desc: 'Configure municipal tier levels, hierarchy rank depth, and status', required_permission: 'organizations.view', display_order: 3 },
  { id: 4, key: 'accounts', label: 'Accounts & Staff', route: '/admin/accounts', icon: 'users', desc: 'Manage administrative staff accounts and roles', required_permission: 'users.view', display_order: 4 },
  { id: 5, key: 'roles', label: 'Roles & Permissions', route: '/admin/roles', icon: 'shield', desc: 'Access control policies, security roles, and permission matrix', required_permission: 'roles.view', display_order: 5 },
  { id: 6, key: 'services', label: 'Services & Standards', route: '/admin/services', icon: 'file', desc: 'Public service catalog, requirements, and completion tracking', required_permission: 'services.view', display_order: 6 },
  { id: 7, key: 'routes', label: 'Room Routes & Steps', route: '/admin/routes', icon: 'route', desc: 'Physical room-by-room citizen navigation guides and floor steps', required_permission: 'service_steps.view', display_order: 7 },
  { id: 8, key: 'feedback', label: 'Citizen Feedback', route: '/admin/feedback', icon: 'message', desc: 'Citizen complaints, ratings, and feedback resolution inbox', required_permission: 'feedback.view_own', display_order: 8 },
  { id: 9, key: 'qr', label: 'Feedback QR Codes', route: '/admin/qr', icon: 'qr', desc: 'Printable service QR posters and counter rating placards', required_permission: 'qr_codes.view', display_order: 9 },
  { id: 10, key: 'news', label: 'News & Announcements', route: '/admin/news', icon: 'news', desc: 'Publish public notices, press releases, and municipal events', required_permission: 'news.view', display_order: 10 },
  { id: 11, key: 'cms', label: 'Landing Page CMS', route: '/admin/cms', icon: 'palette', desc: 'Configure citizen portal spotlight, hero banner, and FAQs', required_permission: 'cms.manage', display_order: 11 },
  { id: 12, key: 'activity', label: 'Activity Log', route: '/admin/activity', icon: 'activity', desc: 'Audit trails and historical administrative event logs', required_permission: 'audit_logs.view', display_order: 12 },
];

/**
 * Returns recommended default navigation item IDs for a given scope level.
 */
const getScopeDefaultNavIds = (scopeLevel?: string): number[] => {
  const s = (scopeLevel || '').toLowerCase();
  if (s === 'platform' || s === 'global' || s === 'super_admin') {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  if (s.includes('subcity') || s.includes('sub_city') || s.includes('sub-city')) {
    return [1, 2, 4, 6, 7, 8, 9, 10, 12];
  }
  if (s.includes('woreda')) {
    return [1, 4, 6, 7, 8, 9, 10];
  }
  if (s.includes('bureau')) {
    return [1, 4, 6, 7, 8, 9];
  }
  return [1, 6, 7, 8];
};

/**
 * Mapping navigation item routes to relevant backend permission keys
 */
const NAV_ITEM_TO_PERM_KEYS: Record<string, string[]> = {
  overview: ['dashboard.view'],
  offices: ['organizations.view', 'organizations.create', 'organizations.update'],
  levels: ['organizations.view'],
  accounts: ['users.view', 'users.create', 'users.update'],
  roles: ['roles.view'],
  services: ['services.view', 'services.create', 'services.update'],
  documents: ['documents.view', 'documents.manage'],
  routes: ['service_steps.view', 'service_steps.manage'],
  feedback: ['feedback.view_own', 'feedback.update_status'],
  qr: ['qr_codes.view', 'qr_codes.manage'],
  news: ['news.view', 'news.create', 'news.update', 'news.publish', 'events.view', 'events.create', 'events.update', 'events.publish'],
  cms: ['cms.manage'],
  activity: ['audit_logs.view'],
};

export interface RolesPermissionsPageProps {
  roles?: RoleItem[];
  onCreateRole?: (role: RoleItem) => void;
  onUpdateRole?: (role: RoleItem) => void;
  onDeleteRole?: (roleId: string) => void;
}

export const RolesPermissionsPage: React.FC<RolesPermissionsPageProps> = ({
  roles: propRoles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}) => {
  // 1. GET /api/v1/roles (list with permissions_count)
  const { data: apiRoles, isLoading: loadingRoles, refetch: refetchRoles } = useGetRolesQuery();

  // 2. GET /api/v1/permissions (grouped domain catalog)
  const { data: apiPermissions, isLoading: loadingPermissions } = useGetPermissionsQuery();

  // 3. GET /api/v1/navigation/items (all active navigation items)
  const { data: apiNavItems, isLoading: loadingNavItems, refetch: refetchNavItems } = useGetNavigationItemsQuery();

  // 4. PUT mutations
  const [updateRolePermissionsTrigger, { isLoading: isSavingPermissions }] =
    useUpdateRolePermissionsMutation();
  const [updateRoleNavigationItemsTrigger, { isLoading: isSavingNavItems }] =
    useUpdateRoleNavigationItemsMutation();
  const [createRoleTrigger, { isLoading: isCreatingRole }] = useCreateRoleMutation();
  const [updateRoleTrigger, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();
  const [deleteRoleTrigger, { isLoading: isDeletingRole }] = useDeleteRoleMutation();

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Search and Filter States for Domain Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'granted' | 'revoked'>('all');

  // Search and Filter States for Navigation Items (Granted vs Revoked)
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [navTabFilter, setNavTabFilter] = useState<'all' | 'granted' | 'revoked'>('all');
  const [isNavSectionCollapsed, setIsNavSectionCollapsed] = useState(false);

  const { hasPermission } = usePermissions();
  const canManageRoles = hasPermission('roles.manage');

  // Active permissions catalog strictly from backend GET /api/v1/permissions (no mock fallbacks)
  const allPermissions = useMemo<PermissionItem[]>(() => {
    if (apiPermissions?.data && Array.isArray(apiPermissions.data)) {
      return apiPermissions.data;
    }
    return [];
  }, [apiPermissions]);

  // Active platform roles strictly from backend GET /api/v1/roles (no mock fallbacks)
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
          name: r.name,
          description: r.description || '',
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
  }, [propRoles, apiRoles]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  // Locate active role by id or slug
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

  // Query live permissions for active role via GET /api/v1/roles/{id}
  const activeRoleQueryId = activeRole && !isNaN(Number(activeRole.id)) ? Number(activeRole.id) : '';
  const { data: activeRoleDetail, isLoading: isLoadingRoleDetail } = useGetRoleByIdQuery(activeRoleQueryId, {
    skip: !activeRoleQueryId,
  });

  const isSuperAdmin =
    activeRole?.slug === 'super_admin' ||
    activeRole?.id === 'super_admin' ||
    activeRole?.id === 'super';

  // Effective permission IDs for currently active role
  const effectivePermissionIds = useMemo<number[]>(() => {
    if (!activeRole) return [];

    // Super Admin receives all platform permissions
    if (isSuperAdmin) {
      return allPermissions.map((p) => p.id);
    }

    // 1. From live GET /api/v1/roles/{id} response
    const detailData: any = activeRoleDetail?.data?.data || activeRoleDetail?.data;
    if (detailData?.permissions && Array.isArray(detailData.permissions) && detailData.permissions.length > 0) {
      return detailData.permissions.map((p: any) => (typeof p === 'number' ? p : p.id));
    }
    if (detailData?.permission_ids && Array.isArray(detailData.permission_ids) && detailData.permission_ids.length > 0) {
      return detailData.permission_ids;
    }

    // 2. From role's stored permissionIds
    if (activeRole.permissionIds && activeRole.permissionIds.length > 0) {
      return activeRole.permissionIds;
    }

    return [];
  }, [activeRole, activeRoleDetail, allPermissions, isSuperAdmin]);

  // Display count of active permissions
  const activePermissionsCount = isSuperAdmin
    ? allPermissions.length
    : (effectivePermissionIds.length || activeRole?.permissionsCount || 0);

  // Unified list of all 12 platform navigation items merging backend with canonical metadata
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

  // Effective navigation item IDs granted to active role
  const effectiveNavIds = useMemo<number[]>(() => {
    if (!activeRole) return [];
    if (isSuperAdmin) {
      return allNavigationItems.map((n) => n.id);
    }
    const detailData: any = activeRoleDetail?.data?.data || activeRoleDetail?.data;
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

  // Granted navigation items for active role
  const grantedNavItems = useMemo(() => {
    return allNavigationItems.filter((item) => effectiveNavIds.includes(item.id));
  }, [allNavigationItems, effectiveNavIds]);

  // Revoked navigation items (available to add) for active role
  const revokedNavItems = useMemo(() => {
    return allNavigationItems.filter((item) => !effectiveNavIds.includes(item.id));
  }, [allNavigationItems, effectiveNavIds]);

  // Filtered navigation items based on search query
  const filteredGrantedNavItems = useMemo(() => {
    if (!navSearchQuery.trim()) return grantedNavItems;
    const q = navSearchQuery.toLowerCase().trim();
    return grantedNavItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.route.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        (item.required_permission && item.required_permission.toLowerCase().includes(q))
    );
  }, [grantedNavItems, navSearchQuery]);

  const filteredRevokedNavItems = useMemo(() => {
    if (!navSearchQuery.trim()) return revokedNavItems;
    const q = navSearchQuery.toLowerCase().trim();
    return revokedNavItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.route.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        (item.required_permission && item.required_permission.toLowerCase().includes(q))
    );
  }, [revokedNavItems, navSearchQuery]);

  /**
   * Synchronizes navigation items to backend for active role.
   */
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

      // If a navigation item was granted and its required permission is not yet active, auto-grant it
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

      if (action === 'granted') {
        setSaveStatus(`Navigation item "${itemName}" granted to role "${activeRole.name}".`);
      } else if (action === 'revoked') {
        setSaveStatus(`Navigation item "${itemName}" revoked from role "${activeRole.name}".`);
      } else if (action === 'all_granted') {
        setSaveStatus(`All ${newNavIds.length} navigation modules granted to role "${activeRole.name}".`);
      } else if (action === 'all_revoked') {
        setSaveStatus(`All navigation modules revoked from role "${activeRole.name}".`);
      } else if (action === 'reset') {
        setSaveStatus(`Navigation items reset to ${activeRole.scope} defaults (${newNavIds.length} granted).`);
      } else {
        setSaveStatus(result.message || 'Navigation items updated successfully.');
      }
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      console.error('Backend updateRoleNavigationItems error:', err);
      const msg = err?.data?.message || err?.message || 'Failed to update navigation items on backend.';
      setErrorStatus(msg);
      setTimeout(() => setErrorStatus(null), 4500);
    }
  };

  /**
   * Grant a single revoked navigation item to active role.
   */
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

  /**
   * Revoke a single granted navigation item from active role.
   */
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

  /**
   * Grant all 12 navigation items to active role.
   */
  const handleGrantAllNavItems = async () => {
    if (!canManageRoles || isSuperAdmin) return;
    const allIds = allNavigationItems.map((n) => n.id);
    await syncNavItemsToBackend(allIds, undefined, 'all_granted');
  };

  /**
   * Revoke all navigation items from active role.
   */
  const handleRevokeAllNavItems = async () => {
    if (!canManageRoles || isSuperAdmin) return;
    await syncNavItemsToBackend([], undefined, 'all_revoked');
  };

  /**
   * Reset navigation items to scope-level recommended defaults.
   */
  const handleResetNavScopeDefaults = async () => {
    if (!canManageRoles || isSuperAdmin || !activeRole) return;
    const defaultIds = getScopeDefaultNavIds(activeRole.scope_level);
    await syncNavItemsToBackend(defaultIds, undefined, 'reset');
  };

  /**
   * Dispatches PUT /api/v1/roles/{id}/permissions to synchronize permission IDs.
   */
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

  /**
   * Toggles individual permission in Domain Catalog.
   */
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

  /**
   * Bulk toggle all permissions in a specific domain.
   */
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

  /**
   * Bulk toggle all permissions matching current filter.
   */
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

  const handleSaveRole = async (saved: any) => {
    setErrorStatus(null);
    setSaveStatus(null);

    // Map navigation items or permissions to valid backend IDs
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
            permission_ids: resolvedPermissionIds.length > 0 ? resolvedPermissionIds : undefined,
            navigation_items: navItems,
          }).unwrap();

          await refetchRoles();
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
          `Custom role "${res.data?.name || saved.name}" successfully created on backend with ${resolvedPermissionIds.length} permissions.`
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

  // Filtered Permissions based on Search Query, Domain Filter, and Status Filter
  const filteredPermissions = useMemo(() => {
    return allPermissions.filter((perm) => {
      // 1. Domain filter
      if (selectedDomainFilter !== 'all' && perm.group !== selectedDomainFilter) {
        return false;
      }

      // 2. Status filter
      const isGranted = effectivePermissionIds.includes(perm.id);
      if (statusFilter === 'granted' && !isGranted) return false;
      if (statusFilter === 'revoked' && isGranted) return false;

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const domain = DOMAIN_GROUPS.find((d) => d.id === perm.group);
        const matchName = perm.name.toLowerCase().includes(q);
        const matchKey = perm.key.toLowerCase().includes(q);
        const matchDesc = perm.description.toLowerCase().includes(q);
        const matchDomain = domain ? domain.label.toLowerCase().includes(q) : false;
        return matchName || matchKey || matchDesc || matchDomain;
      }

      return true;
    });
  }, [allPermissions, selectedDomainFilter, statusFilter, searchQuery, effectivePermissionIds]);

  // Group filtered permissions by Domain Group
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

    return groupsMeta.map((domain) => {
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
    }).filter((g) => g.perms.length > 0);
  }, [filteredPermissions, allPermissions, effectivePermissionIds]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedDomainFilter !== 'all' || statusFilter !== 'all';

  return (
    <>
      <PageHeading
        eyebrow="ACCESS CONTROL & GOVERNANCE"
        title="Roles & permissions"
        subtitle="Configure role-based access control (RBAC), security policies, and domain permissions."
        action={canManageRoles ? "+ New role" : undefined}
        onAction={
          canManageRoles
            ? () => {
                setEditingRole(null);
                setModalOpen(true);
              }
            : undefined
        }
      />

      {/* Role Management Card & Header */}
      {loadingRoles && !apiRoles ? (
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: '14px', margin: '20px 0' }}>
          <div className="loading-spinner" />
          <h3 style={{ margin: 0, color: '#00485a', fontSize: '17px', fontWeight: 600 }}>Loading security roles & permissions...</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Connecting to role-based access control policies</p>
        </section>
      ) : !activeRole ? (
        <section className="panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p>No roles available.</p>
        </section>
      ) : (
        <section className="panel permissions-catalog-panel" style={{ marginBottom: '2rem' }}>
          {/* Top Role Header Banner */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #edf1ed',
              background: '#fcfdfc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isSuperAdmin ? '#ecfdf5' : '#eff6ff',
                    color: isSuperAdmin ? '#047857' : '#1d4ed8',
                  }}
                >
                  <Icon name={isSuperAdmin ? 'shield' : 'users'} size={18} />
                </span>
                <h2 style={{ fontSize: '18px', margin: 0, color: '#164a54' }}>
                  {activeRole.name}
                </h2>
                <code
                  style={{
                    fontSize: '11.5px',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  {activeRole.slug || activeRole.id}
                </code>
                <span
                  style={{
                    background: isSuperAdmin ? '#ecfdf5' : '#e0f2fe',
                    color: isSuperAdmin ? '#047857' : '#0369a1',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {activePermissionsCount} / {allPermissions.length} active
                </span>
                {activeRole.isSystem ? (
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    System role
                  </span>
                ) : (
                  <span
                    style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    Custom role
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                {activeRole.description}
              </p>
            </div>

            {/* Role Selector and Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                <span>Role:</span>
                <select
                  value={String(activeRole.id)}
                  onChange={(event) => setSelectedRoleId(event.target.value)}
                  style={{
                    minHeight: '34px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontSize: '13px',
                    color: '#1e293b',
                    fontWeight: 600,
                  }}
                >
                  {roles.map((roleItem: RoleItem) => (
                    <option key={roleItem.id} value={roleItem.id}>
                      {roleItem.name} {roleItem.isSystem ? '(System)' : '(Custom)'}
                    </option>
                  ))}
                </select>
              </label>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  background: '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  color: '#475569',
                }}
              >
                <Icon name="shield" size={13} /> Scope: <b>{activeRole.scope}</b>
              </span>

              {!activeRole.isSystem && canManageRoles && (
                <div style={{ display: 'inline-flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="button secondary small-button"
                    onClick={() => {
                      const detailData: any = activeRoleDetail?.data?.data || activeRoleDetail?.data;
                      const fullRole = {
                        ...activeRole,
                        navigation_item_ids: detailData?.navigation_item_ids || [],
                        permission_ids: effectivePermissionIds,
                        permissions: detailData?.permissions || [],
                      };
                      setEditingRole(fullRole as any);
                      setModalOpen(true);
                    }}
                  >
                    Edit details
                  </button>
                  <button
                    type="button"
                    className="button secondary small-button"
                    style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                    onClick={() => handleDeleteRole(activeRole)}
                  >
                    Delete role
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Notice Banners */}
          {saveStatus && (
            <div
              className="tip-banner inline-tip"
              style={{ margin: '0.75rem 1.5rem', borderColor: '#00485a', background: '#f0fdf4' }}
            >
              <span className="tip-icon" style={{ color: '#16a34a' }}>
                <Icon name="check" size={16} />
              </span>
              <span>
                <b>Policy Synchronized</b>
                <small>{saveStatus}</small>
              </span>
            </div>
          )}

          {errorStatus && (
            <div
              className="tip-banner inline-tip"
              style={{ margin: '0.75rem 1.5rem', borderColor: '#dc2626', background: '#fef2f2' }}
            >
              <span className="tip-icon" style={{ color: '#dc2626' }}>
                <Icon name="close" size={16} />
              </span>
              <span>
                <b>Action Restricted</b>
                <small>{errorStatus}</small>
              </span>
            </div>
          )}

          {isSuperAdmin ? (
            <div className="tip-banner inline-tip" style={{ margin: '0.75rem 1.5rem' }}>
              <span className="tip-icon">
                <Icon name="lock" size={16} />
              </span>
              <span>
                <b>Root Platform Authority (Inherently Granted)</b>
                <small>
                  Super Admin possesses all 37 platform authorities across all domains.
                  Permissions are immutable for this role. To configure a specialized policy,
                  select a municipal tier (e.g. Sub-City, Woreda, Bureau) or create a custom role.
                </small>
              </span>
            </div>
          ) : (
            <div
              className="tip-banner inline-tip"
              style={{ margin: '0.75rem 1.5rem', background: '#f8fafc', borderColor: '#cbd5e1' }}
            >
              <span className="tip-icon">
                <Icon name="shield" size={16} />
              </span>
              <span>
                <b>Granular Role Permissions Catalog</b>
                <small>
                  Toggle individual permissions below to define what administrative actions
                  users holding the <strong>{activeRole.name}</strong> role can perform. Changes
                  synchronize immediately.
                </small>
              </span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* Sidebar Navigation Items: Granted vs Revoked Access Card */}
          {/* ========================================================================= */}
          <div
            style={{
              margin: '0.75rem 1.5rem 1.5rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            {/* Navigation Card Header */}
            <div
              style={{
                padding: '12px 18px',
                background: '#f8fafc',
                borderBottom: isNavSectionCollapsed ? 'none' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#e8f2ed',
                    color: '#00485a',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="layers" size={18} />
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      Sidebar Navigation Access
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      {grantedNavItems.length} Granted
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: revokedNavItems.length > 0 ? '#fef3c7' : '#f1f5f9',
                        color: revokedNavItems.length > 0 ? '#92400e' : '#64748b',
                      }}
                    >
                      {revokedNavItems.length} Revoked
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Manage navigation items granted to or revoked from{' '}
                    <strong style={{ color: '#1e293b' }}>{activeRole.name}</strong>. Granted items appear in the portal sidebar.
                  </p>
                </div>
              </div>

              {/* Navigation Card Actions & Collapse Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {!isSuperAdmin && canManageRoles && (
                  <>
                    <button
                      type="button"
                      className="button secondary small-button"
                      style={{ fontSize: '11.5px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={handleGrantAllNavItems}
                      disabled={isSavingNavItems || revokedNavItems.length === 0}
                      title="Grant all 12 navigation modules to this role"
                    >
                      <Icon name="check" size={13} /> Grant all
                    </button>
                    <button
                      type="button"
                      className="button secondary small-button"
                      style={{ fontSize: '11.5px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={handleRevokeAllNavItems}
                      disabled={isSavingNavItems || grantedNavItems.length === 0}
                      title="Revoke all navigation modules from this role"
                    >
                      <Icon name="close" size={13} /> Revoke all
                    </button>
                    <button
                      type="button"
                      className="button secondary small-button"
                      style={{ fontSize: '11.5px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={handleResetNavScopeDefaults}
                      disabled={isSavingNavItems}
                      title="Reset navigation items to scope-level recommended defaults"
                    >
                      <Icon name="refresh" size={13} /> Reset defaults
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsNavSectionCollapsed((prev) => !prev)}
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    borderRadius: '6px',
                    padding: '5px 9px',
                    cursor: 'pointer',
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  title={isNavSectionCollapsed ? 'Expand navigation items' : 'Collapse navigation items'}
                >
                  <span>{isNavSectionCollapsed ? 'Show items' : 'Hide items'}</span>
                  <span
                    style={{
                      transform: isNavSectionCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                      transition: 'transform 0.2s ease',
                      display: 'inline-flex',
                    }}
                  >
                    <Icon name="chevron" size={14} />
                  </span>
                </button>
              </div>
            </div>

            {/* Navigation Body (when expanded) */}
            {!isNavSectionCollapsed && (
              <>
                {/* Search & Filter Tabs Toolbar */}
                <div
                  style={{
                    padding: '10px 18px',
                    borderBottom: '1px solid #edf1ed',
                    background: '#ffffff',
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
                      padding: '4px 10px',
                      gap: '8px',
                      flex: '1',
                      minWidth: '220px',
                      maxWidth: '380px',
                    }}
                  >
                    <Icon name="search" size={14} />
                    <input
                      type="text"
                      placeholder="Search navigation items by title, route, or permission..."
                      value={navSearchQuery}
                      onChange={(e) => setNavSearchQuery(e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '12.5px',
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

                  {/* Filter View Tabs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                        onClick={() => setNavTabFilter('all')}
                        style={{
                          border: 'none',
                          background: navTabFilter === 'all' ? '#ffffff' : 'transparent',
                          color: navTabFilter === 'all' ? '#00485a' : '#64748b',
                          fontWeight: navTabFilter === 'all' ? 700 : 500,
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          boxShadow: navTabFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        All Modules ({allNavigationItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNavTabFilter('granted')}
                        style={{
                          border: 'none',
                          background: navTabFilter === 'granted' ? '#ffffff' : 'transparent',
                          color: navTabFilter === 'granted' ? '#047857' : '#64748b',
                          fontWeight: navTabFilter === 'granted' ? 700 : 500,
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          boxShadow: navTabFilter === 'granted' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Granted ({grantedNavItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNavTabFilter('revoked')}
                        style={{
                          border: 'none',
                          background: navTabFilter === 'revoked' ? '#ffffff' : 'transparent',
                          color: navTabFilter === 'revoked' ? '#b45309' : '#64748b',
                          fontWeight: navTabFilter === 'revoked' ? 700 : 500,
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          boxShadow: navTabFilter === 'revoked' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Revoked / Add ({revokedNavItems.length})
                      </button>
                    </div>

                    {isSavingNavItems && (
                      <span style={{ fontSize: '12px', color: '#00485a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className="loading-spinner" style={{ width: '12px', height: '12px' }} /> Syncing sidebar...
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation Items Content */}
                <div style={{ padding: '16px 18px', background: '#fcfdfc' }}>
                  {isSuperAdmin ? (
                    <div
                      style={{
                        padding: '16px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '8px',
                        color: '#065f46',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span style={{ display: 'inline-flex', padding: '6px', borderRadius: '50%', background: '#d1fae5' }}>
                        <Icon name="shield" size={20} />
                      </span>
                      <div>
                        <b style={{ fontSize: '13.5px', display: 'block' }}>Root Platform Navigation Authority</b>
                        <span style={{ fontSize: '12px' }}>
                          Super Admin has inherently granted access to all 12 platform navigation modules. Navigation items are immutable for this role.
                        </span>
                      </div>
                    </div>
                  ) : navTabFilter === 'all' ? (
                    /* Two-Column Split: Granted on Left, Revoked on Right */
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                        gap: '20px',
                        alignItems: 'start',
                      }}
                    >
                      {/* Left Column: GRANTED ITEMS */}
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 14px',
                            background: '#f0fdf4',
                            borderBottom: '1px solid #dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#16a34a',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              ✓
                            </span>
                            <b style={{ color: '#166534', fontSize: '13px' }}>
                              Granted Navigation Items ({filteredGrantedNavItems.length})
                            </b>
                          </div>
                          <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                            Active in Sidebar
                          </span>
                        </div>

                        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px' }}>
                          {filteredGrantedNavItems.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                              <p style={{ margin: 0, fontSize: '13px' }}>No granted navigation items match current search.</p>
                              <small style={{ color: '#94a3b8' }}>Users holding this role cannot view any sidebar sections.</small>
                            </div>
                          ) : (
                            filteredGrantedNavItems.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  background: '#fafffa',
                                  border: '1px solid #dcfce7',
                                  borderRadius: '6px',
                                  gap: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      background: '#dcfce7',
                                      color: '#166534',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Icon name={item.icon || 'layers'} size={15} />
                                  </span>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                      <b style={{ fontSize: '13px', color: '#14532d' }}>{item.label}</b>
                                      <code
                                        style={{
                                          fontSize: '10.5px',
                                          background: '#f1f5f9',
                                          color: '#475569',
                                          padding: '1px 5px',
                                          borderRadius: '4px',
                                        }}
                                      >
                                        {item.route}
                                      </code>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</span>
                                      {item.required_permission && (
                                        <span
                                          style={{
                                            fontSize: '10px',
                                            background: '#e0f2fe',
                                            color: '#0369a1',
                                            padding: '1px 5px',
                                            borderRadius: '4px',
                                            fontWeight: 600,
                                          }}
                                          title={`Requires permission: ${item.required_permission}`}
                                        >
                                          req: {item.required_permission}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ flexShrink: 0 }}>
                                  {canManageRoles ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeNavItem(item.id)}
                                      disabled={isSavingNavItems}
                                      style={{
                                        border: '1px solid #fca5a5',
                                        background: '#ffffff',
                                        color: '#b91c1c',
                                        borderRadius: '5px',
                                        padding: '4px 9px',
                                        fontSize: '11.5px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                      title={`Revoke "${item.label}" from ${activeRole.name}`}
                                    >
                                      <Icon name="close" size={12} /> Revoke
                                    </button>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#15803d',
                                        background: '#dcfce7',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                      }}
                                    >
                                      Granted
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Right Column: REVOKED ITEMS (Available to Add) */}
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 14px',
                            background: '#f8fafc',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#f1f5f9',
                                color: '#64748b',
                                fontSize: '12px',
                                fontWeight: 700,
                              }}
                            >
                              +
                            </span>
                            <b style={{ color: '#334155', fontSize: '13px' }}>
                              Revoked Items · Available to Add ({filteredRevokedNavItems.length})
                            </b>
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            Hidden from Sidebar
                          </span>
                        </div>

                        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px' }}>
                          {filteredRevokedNavItems.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                              <p style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                                ✓ All navigation modules are granted to this role!
                              </p>
                              <small style={{ color: '#64748b' }}>No revoked items remain to add.</small>
                            </div>
                          ) : (
                            filteredRevokedNavItems.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  background: '#ffffff',
                                  border: '1px dashed #e2e8f0',
                                  borderRadius: '6px',
                                  gap: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      background: '#f1f5f9',
                                      color: '#64748b',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Icon name={item.icon || 'layers'} size={15} />
                                  </span>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                      <b style={{ fontSize: '13px', color: '#334155' }}>{item.label}</b>
                                      <code
                                        style={{
                                          fontSize: '10.5px',
                                          background: '#f8fafc',
                                          color: '#64748b',
                                          padding: '1px 5px',
                                          borderRadius: '4px',
                                        }}
                                      >
                                        {item.route}
                                      </code>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</span>
                                      {item.required_permission && (
                                        <span
                                          style={{
                                            fontSize: '10px',
                                            background: '#f1f5f9',
                                            color: '#64748b',
                                            padding: '1px 5px',
                                            borderRadius: '4px',
                                            fontWeight: 600,
                                          }}
                                          title={`Requires permission: ${item.required_permission}`}
                                        >
                                          req: {item.required_permission}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ flexShrink: 0 }}>
                                  {canManageRoles ? (
                                    <button
                                      type="button"
                                      onClick={() => handleGrantNavItem(item.id)}
                                      disabled={isSavingNavItems}
                                      style={{
                                        border: 'none',
                                        background: '#00485a',
                                        color: '#ffffff',
                                        borderRadius: '5px',
                                        padding: '4px 11px',
                                        fontSize: '11.5px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 1px 2px rgba(0,72,90,0.15)',
                                      }}
                                      title={`Grant "${item.label}" to ${activeRole.name}`}
                                    >
                                      <Icon name="plus" size={12} /> Add to role
                                    </button>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#64748b',
                                        background: '#f1f5f9',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                      }}
                                    >
                                      Revoked
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : navTabFilter === 'granted' ? (
                    /* Only Granted Items Grid */
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '12px',
                      }}
                    >
                      {filteredGrantedNavItems.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
                          <p style={{ margin: 0, fontSize: '14px' }}>No granted navigation items match filter.</p>
                        </div>
                      ) : (
                        filteredGrantedNavItems.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #bbf7d0',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  background: '#dcfce7',
                                  color: '#166534',
                                  flexShrink: 0,
                                }}
                              >
                                <Icon name={item.icon || 'layers'} size={16} />
                              </span>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <b style={{ fontSize: '13.5px', color: '#14532d' }}>{item.label}</b>
                                  <code
                                    style={{
                                      fontSize: '11px',
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {item.route}
                                  </code>
                                </div>
                                <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                                  {item.desc}
                                </p>
                                {item.required_permission && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '4px',
                                      fontSize: '10.5px',
                                      background: '#e0f2fe',
                                      color: '#0369a1',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    req: {item.required_permission}
                                  </span>
                                )}
                              </div>
                            </div>

                            {canManageRoles && (
                              <button
                                type="button"
                                onClick={() => handleRevokeNavItem(item.id)}
                                disabled={isSavingNavItems}
                                style={{
                                  border: '1px solid #fca5a5',
                                  background: '#ffffff',
                                  color: '#b91c1c',
                                  borderRadius: '5px',
                                  padding: '4px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  flexShrink: 0,
                                }}
                                title={`Revoke "${item.label}" from ${activeRole.name}`}
                              >
                                <Icon name="close" size={12} /> Revoke
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Only Revoked Items Grid */
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '12px',
                      }}
                    >
                      {filteredRevokedNavItems.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1', color: '#166534' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>✓ All navigation items are granted to this role!</p>
                          <small style={{ color: '#64748b' }}>None are currently revoked.</small>
                        </div>
                      ) : (
                        filteredRevokedNavItems.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: '#ffffff',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '10px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  background: '#f1f5f9',
                                  color: '#64748b',
                                  flexShrink: 0,
                                }}
                              >
                                <Icon name={item.icon || 'layers'} size={16} />
                              </span>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <b style={{ fontSize: '13.5px', color: '#334155' }}>{item.label}</b>
                                  <code
                                    style={{
                                      fontSize: '11px',
                                      background: '#f8fafc',
                                      color: '#64748b',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {item.route}
                                  </code>
                                </div>
                                <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                                  {item.desc}
                                </p>
                                {item.required_permission && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '4px',
                                      fontSize: '10.5px',
                                      background: '#f1f5f9',
                                      color: '#64748b',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    req: {item.required_permission}
                                  </span>
                                )}
                              </div>
                            </div>

                            {canManageRoles && (
                              <button
                                type="button"
                                onClick={() => handleGrantNavItem(item.id)}
                                disabled={isSavingNavItems}
                                style={{
                                  border: 'none',
                                  background: '#00485a',
                                  color: '#ffffff',
                                  borderRadius: '5px',
                                  padding: '5px 12px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 1px 2px rgba(0,72,90,0.15)',
                                  flexShrink: 0,
                                }}
                                title={`Grant "${item.label}" to ${activeRole.name}`}
                              >
                                <Icon name="plus" size={12} /> Add to role
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
                  padding: '4px 10px',
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

              {/* Filters */}
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
                      title="Grant all permissions currently displayed"
                    >
                      Grant shown
                    </button>
                    <button
                      type="button"
                      className="button secondary small-button"
                      style={{ padding: '4px 10px', fontSize: '11.5px' }}
                      onClick={() => handleBulkToggleFiltered(false)}
                      title="Revoke all permissions currently displayed"
                    >
                      Revoke shown
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status bar & match counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
              <span>
                Showing <b>{filteredPermissions.length}</b> of <b>{allPermissions.length}</b> permissions
                {hasActiveFilters && (
                  <>
                    {' '}· Filter active ({searchQuery ? `"${searchQuery}", ` : ''}
                    {selectedDomainFilter !== 'all' ? `domain: ${selectedDomainFilter}, ` : ''}
                    {statusFilter !== 'all' ? `status: ${statusFilter}` : ''})
                  </>
                )}
              </span>
              {hasActiveFilters && (
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

          {/* Enhanced Domain Permissions Catalog Grid */}
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
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
                  No permissions found
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                  No system permissions match the search query &quot;{searchQuery}&quot; and current filters.
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
                      {/* Domain Card Header */}
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

                        {/* Grant badge & Quick Select All Toggle */}
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

                      {/* Permissions List for this Domain */}
                      <div
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          flex: 1,
                        }}
                      >
                        {domain.perms.map((perm) => {
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
                                cursor: (isSuperAdmin || !canManageRoles) ? 'default' : 'pointer',
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
                                    cursor: (isSuperAdmin || !canManageRoles) ? 'default' : 'pointer',
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
                                    {perm.name}
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
                                  {perm.description}
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

          {/* Footer Policy Info */}
          <div
            style={{
              padding: '10px 1.5rem',
              background: '#fcfdfc',
              borderTop: '1px solid #edf1ed',
              fontSize: '12px',
              color: '#64748b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              Policy Target: <b>{activeRole.name}</b> · Governed by Least Privilege Access Standard
            </span>
            <span>
              {isSavingPermissions ? (
                <span style={{ color: '#00485a', fontWeight: 600 }}>Syncing changes to server...</span>
              ) : (
                <span>All changes persist live to backend RBAC schema.</span>
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
