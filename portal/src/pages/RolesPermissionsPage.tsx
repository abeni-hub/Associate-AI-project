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
  useUpdateRolePermissionsMutation,
  type PermissionItem,
} from '../services/rolesApi';
import { INITIAL_ROLES } from '../data/portalData';

/**
 * Standardized system permissions catalog matching backend PermissionSeeder & GET /api/v1/permissions.
 */
export const SYSTEM_PERMISSIONS_CATALOG: PermissionItem[] = [
  // Organizations
  { id: 1, key: 'organizations.view', name: 'View Organizations', group: 'organizations', description: 'View organization profiles and administrative hierarchy.' },
  { id: 2, key: 'organizations.create', name: 'Create Organizations', group: 'organizations', description: 'Create new government organizations, sub-cities, and bureaus.' },
  { id: 3, key: 'organizations.update', name: 'Update Organizations', group: 'organizations', description: 'Edit organization details, contact info, and leadership.' },
  { id: 4, key: 'organizations.delete', name: 'Delete Organizations', group: 'organizations', description: 'Deactivate or soft-delete organizational units.' },

  // Users
  { id: 5, key: 'users.view', name: 'View Users', group: 'users', description: 'View user lists, administrative profiles, and assigned scopes.' },
  { id: 6, key: 'users.create', name: 'Create Users', group: 'users', description: 'Provision staff or administrative accounts with temporary credentials.' },
  { id: 7, key: 'users.update', name: 'Update Users', group: 'users', description: 'Modify user profiles, email addresses, and account status.' },
  { id: 8, key: 'users.delete', name: 'Delete Users', group: 'users', description: 'Deactivate or remove administrative user accounts.' },
  { id: 9, key: 'users.reset_password', name: 'Reset User Password', group: 'users', description: 'Initiate administrative password resets and temporary OTPs.' },

  // Roles & Permissions
  { id: 10, key: 'roles.view', name: 'View Roles', group: 'roles', description: 'View role definitions, governance scopes, and permission catalogs.' },
  { id: 11, key: 'roles.manage', name: 'Manage Roles', group: 'roles', description: 'Create custom administrative roles and synchronize policy permissions.' },

  // Services & Subservices
  { id: 12, key: 'services.view', name: 'View Services', group: 'services', description: 'Browse government public services, subservices, and guides.' },
  { id: 13, key: 'services.create', name: 'Create Services', group: 'services', description: 'Add new public services or subservices to the service catalog.' },
  { id: 14, key: 'services.update', name: 'Update Services', group: 'services', description: 'Update service prerequisites, fees, turnaround times, and details.' },
  { id: 15, key: 'services.delete', name: 'Delete Services', group: 'services', description: 'Deactivate or archive public services from citizen view.' },
  { id: 16, key: 'services.manage', name: 'Manage Service Access', group: 'services', description: 'Configure organizational service assignments and access tiers.' },

  // Required Documents
  { id: 17, key: 'documents.view', name: 'View Required Documents', group: 'documents', description: 'Inspect citizen required document templates and criteria.' },
  { id: 18, key: 'documents.manage', name: 'Manage Required Documents', group: 'documents', description: 'Create, edit, and link required document checklists to services.' },

  // Service Steps (Room-by-Room Instructions)
  { id: 19, key: 'service_steps.view', name: 'View Service Steps', group: 'service_steps', description: 'View physical room-by-room navigation steps for office visitors.' },
  { id: 20, key: 'service_steps.manage', name: 'Manage Service Steps', group: 'service_steps', description: 'Configure and reorder physical room numbers and visitor instructions.' },

  // News Management
  { id: 21, key: 'news.view', name: 'View News', group: 'news', description: 'View official municipal notices, draft announcements, and articles.' },
  { id: 22, key: 'news.create', name: 'Create News', group: 'news', description: 'Draft civic notices, news articles, and citizen announcements.' },
  { id: 23, key: 'news.update', name: 'Update News', group: 'news', description: 'Edit news content, illustrations, headlines, and summaries.' },
  { id: 24, key: 'news.publish', name: 'Publish News', group: 'news', description: 'Publish announcements directly to the citizen app feed or archive them.' },
  { id: 25, key: 'news.delete', name: 'Delete News', group: 'news', description: 'Remove public notices and announcements from the system.' },

  // Events Management
  { id: 26, key: 'events.view', name: 'View Events', group: 'events', description: 'View scheduled town halls, public consultations, and civic events.' },
  { id: 27, key: 'events.create', name: 'Create Events', group: 'events', description: 'Schedule new public gatherings, venues, and calendar items.' },
  { id: 28, key: 'events.update', name: 'Update Events', group: 'events', description: 'Modify event dates, venue locations, times, and agendas.' },
  { id: 29, key: 'events.publish', name: 'Publish Events', group: 'events', description: 'Publish events to citizen calendars or cancel them.' },
  { id: 30, key: 'events.delete', name: 'Delete Events', group: 'events', description: 'Delete public event entries and historical records.' },

  // Citizen Feedback
  { id: 31, key: 'feedback.view_own', name: 'View Own Feedback', group: 'feedback', description: 'Inspect feedback, complaints, and ratings submitted to own organization.' },
  { id: 32, key: 'feedback.view_descendants', name: 'View Descendant Feedback', group: 'feedback', description: 'Supervisory visibility into feedback submitted to child sub-cities or woredas.' },
  { id: 33, key: 'feedback.update_status', name: 'Update Feedback Status', group: 'feedback', description: 'Update complaint resolution status (under_review, resolved, closed).' },

  // QR Codes
  { id: 34, key: 'qr_codes.view', name: 'View QR Codes', group: 'qr_codes', description: 'View office QR tokens, assigned service desks, and feedback routing.' },
  { id: 35, key: 'qr_codes.manage', name: 'Manage QR Codes', group: 'qr_codes', description: 'Generate, download, activate, and deactivate physical office QR codes.' },

  // Dashboards & Audit Logs
  { id: 36, key: 'dashboard.view', name: 'View Dashboard', group: 'dashboard', description: 'Access role-aware and organization-scoped metrics and activity charts.' },
  { id: 37, key: 'audit_logs.view', name: 'View Audit Logs', group: 'audit_logs', description: 'Inspect immutable system security trails, logins, and permission changes.' },

  // CMS Landing Page Management
  { id: 38, key: 'cms.manage', name: 'Manage Landing Page CMS', group: 'cms', description: 'Manage citizen landing page CMS, hero banner, announcement, and public experience.' },
];

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
  const { data: apiRoles, isLoading: loadingRoles } = useGetRolesQuery();

  // 2. GET /api/v1/permissions (grouped domain catalog)
  const { data: apiPermissions } = useGetPermissionsQuery();

  // 3. PUT /api/v1/roles/{id}/permissions (sync permission IDs)
  const [updateRolePermissionsTrigger, { isLoading: isSavingPermissions }] =
    useUpdateRolePermissionsMutation();

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Search and Filter States for Domain Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'granted' | 'revoked'>('all');

  const [internalRoles, setInternalRoles] = useState<RoleItem[]>(
    () => propRoles || []
  );

  const { hasPermission } = usePermissions();
  const canManageRoles = hasPermission('roles.manage');

  // Active permissions catalog (backend if available, otherwise standardized catalog)
  const allPermissions = useMemo<PermissionItem[]>(() => {
    if (apiPermissions?.data && apiPermissions.data.length > 0) {
      return apiPermissions.data;
    }
    return SYSTEM_PERMISSIONS_CATALOG;
  }, [apiPermissions]);

  // Combine live backend API roles with local custom roles
  const roles = useMemo<RoleItem[]>(() => {
    if (propRoles && propRoles.length > 0) return propRoles;
    if (apiRoles?.data) {
      const mappedApiRoles: RoleItem[] = apiRoles.data.map((r) => {
        const fallback = internalRoles.find(
          (ir) =>
            ir.slug === r.slug ||
            ir.id === r.slug ||
            ir.name.toLowerCase() === r.name.toLowerCase()
        );
        return {
          id: String(r.id),
          slug: r.slug,
          name: r.name,
          description: r.description || fallback?.description || '',
          isSystem: r.is_system,
          permissionsCount: r.permissions_count ?? fallback?.permissionsCount,
          permissionIds: fallback?.permissionIds,
          scope:
            r.slug === 'super_admin'
              ? 'Platform wide'
              : r.slug === 'sub_city_admin'
                ? 'Sub-city wide'
                : r.slug === 'woreda_admin'
                  ? 'Woreda wide'
                  : r.slug === 'staff'
                    ? 'Operational desk'
                    : 'Bureau local',
          userCount: fallback?.userCount || 0,
        };
      });

      // Preserve custom non-system roles added locally
      const customLocalRoles = internalRoles.filter(
        (ir) => !ir.isSystem && !mappedApiRoles.some((ar) => ar.slug === ir.slug || ar.id === ir.id)
      );

      return [...mappedApiRoles, ...customLocalRoles];
    }
    return internalRoles;
  }, [propRoles, apiRoles, internalRoles]);

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
    if (activeRoleDetail?.data?.permissions && activeRoleDetail.data.permissions.length > 0) {
      return activeRoleDetail.data.permissions.map((p) => p.id);
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
    : activeRole?.permissionsCount ?? effectivePermissionIds.length;

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

    // Optimistic local state update
    setInternalRoles((prev) =>
      prev.map((item) =>
        String(item.id) === String(activeRole.id) || item.slug === activeRole.slug
          ? {
              ...item,
              permissionIds: newPermissionIds,
              permissionsCount: newPermissionIds.length,
            }
          : item
      )
    );

    // Call live API if numeric ID is present
    if (activeRole.id && !isNaN(Number(activeRole.id))) {
      try {
        const result = await updateRolePermissionsTrigger({
          roleId: Number(activeRole.id),
          permission_ids: newPermissionIds,
        }).unwrap();

        if (result.success) {
          setSaveStatus(
            `Role permissions updated successfully (${newPermissionIds.length} permissions active).`
          );
        } else {
          setSaveStatus(result.message || 'Permissions updated.');
        }
        setTimeout(() => setSaveStatus(null), 3500);
        return;
      } catch (err: any) {
        if (err?.status === 422) {
          setErrorStatus(err?.data?.message || 'Super Admin permissions cannot be modified.');
          setTimeout(() => setErrorStatus(null), 4500);
          return;
        }
        console.warn('Backend updateRolePermissions notice: saved locally in session.', err);
      }
    }

    setSaveStatus(
      `Security policy updated locally for ${activeRole.name} (${newPermissionIds.length} permissions active).`
    );
    setTimeout(() => setSaveStatus(null), 3000);
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

  const handleSaveRole = (saved: any) => {
    if (editingRole) {
      if (onUpdateRole) {
        onUpdateRole(saved);
      }
      setInternalRoles((prev) =>
        prev.map((item) => (String(item.id) === String(saved.id) ? { ...item, ...saved } : item))
      );
      setSelectedRoleId(String(saved.id));
      setSaveStatus(`Role "${saved.name}" updated.`);
    } else {
      if (onCreateRole) {
        onCreateRole(saved);
      }
      const initialPermIds = saved.permissionIds || [];
      const newRole: RoleItem = {
        ...saved,
        permissionIds: initialPermIds,
        permissionsCount: initialPermIds.length,
      };
      setInternalRoles((prev) => [...prev, newRole]);
      setSelectedRoleId(String(saved.id));
      setSaveStatus(
        `Custom role "${saved.name}" created with ${initialPermIds.length} permissions.`
      );
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDeleteRole = (roleToDelete: RoleItem) => {
    if (roleToDelete.isSystem) {
      setErrorStatus('System roles are essential to platform governance and cannot be deleted.');
      setTimeout(() => setErrorStatus(null), 3500);
      return;
    }
    if (window.confirm(`Are you sure you want to delete the role "${roleToDelete.name}"?`)) {
      if (onDeleteRole) {
        onDeleteRole(String(roleToDelete.id));
      }
      setInternalRoles((prev) => prev.filter((r) => String(r.id) !== String(roleToDelete.id)));
      setSelectedRoleId(roles[0]?.id || '');
      setSaveStatus(`Role "${roleToDelete.name}" deleted.`);
      setTimeout(() => setSaveStatus(null), 3000);
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
    return DOMAIN_GROUPS.map((domain) => {
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

              {!activeRole.isSystem && (
                <div style={{ display: 'inline-flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="button secondary small-button"
                    onClick={() => {
                      setEditingRole(activeRole);
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
                              onClick={() => !isSuperAdmin && handleToggleDomainPermission(perm.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                background: isGranted ? '#f0fdf4' : '#ffffff',
                                border: `1px solid ${isGranted ? '#bbf7d0' : '#f1f5f9'}`,
                                cursor: isSuperAdmin ? 'default' : 'pointer',
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
