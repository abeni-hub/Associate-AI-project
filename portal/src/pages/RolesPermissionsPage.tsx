import React, { useMemo, useState } from 'react';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import RoleModal from '../components/roles/RoleModal';
import type { RoleItem } from '../types/portal.types';
import {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
  type PermissionItem,
} from '../services/rolesApi';
import { INITIAL_ROLES } from '../data/portalData';

export interface ModuleDefinition {
  id: string;
  name: string;
  desc: string;
  actions: string[];
}

export interface ActionColumn {
  id: string;
  label: string;
  width: string;
}

const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'offices',
    name: 'Offices & administrative tree',
    desc: 'Manage sub-cities, bureaus, branches and organizational hierarchy',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'accounts',
    name: 'User accounts & authentication',
    desc: 'Create administrators, manage temporary credentials and passwords',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'services',
    name: 'Service standards & guides',
    desc: 'Define citizen prerequisites, required documents and expectations',
    actions: ['view', 'create', 'edit', 'delete', 'publish'],
  },
  {
    id: 'routes',
    name: 'Room routes & office navigation',
    desc: 'Configure room sequence directions for citizens during office visits',
    actions: ['view', 'edit'],
  },
  {
    id: 'feedback',
    name: 'Citizen feedback & voice',
    desc: 'Review complaints, suggestions, satisfaction ratings and update statuses',
    actions: ['view', 'status_update'],
  },
  {
    id: 'news',
    name: 'News, events & public notices',
    desc: 'Draft community announcements and publish to citizen portal',
    actions: ['view', 'create', 'edit', 'delete', 'publish'],
  },
  {
    id: 'cms',
    name: 'Landing page CMS studio',
    desc: 'Edit homepage announcement banners, hero slides, and journey steps',
    actions: ['view', 'edit', 'publish'],
  },
  {
    id: 'roles',
    name: 'Roles & security permissions',
    desc: 'Configure access control policies and create custom administrative roles',
    actions: ['view', 'create', 'edit'],
  },
];

const ACTION_COLUMNS: ActionColumn[] = [
  { id: 'view', label: 'View', width: '8%' },
  { id: 'create', label: 'Create', width: '8%' },
  { id: 'edit', label: 'Edit', width: '8%' },
  { id: 'delete', label: 'Delete', width: '8%' },
  { id: 'publish', label: 'Publish', width: '12%' },
  { id: 'status_update', label: 'Update status', width: '20%' },
];

/**
 * Standardized system permissions catalog matching backend PermissionSeeder & GET /api/v1/permissions.
 */
export const SYSTEM_PERMISSIONS_CATALOG: PermissionItem[] = [
  // Organizations
  { id: 1, key: 'organizations.view', name: 'View Organizations', group: 'organizations', description: 'View organization profiles and hierarchy.' },
  { id: 2, key: 'organizations.create', name: 'Create Organizations', group: 'organizations', description: 'Create new government organizations.' },
  { id: 3, key: 'organizations.update', name: 'Update Organizations', group: 'organizations', description: 'Edit organization details.' },
  { id: 4, key: 'organizations.delete', name: 'Delete Organizations', group: 'organizations', description: 'Deactivate or soft-delete organizations.' },

  // Users
  { id: 5, key: 'users.view', name: 'View Users', group: 'users', description: 'View user lists and profiles.' },
  { id: 6, key: 'users.create', name: 'Create Users', group: 'users', description: 'Create staff or administrative users.' },
  { id: 7, key: 'users.update', name: 'Update Users', group: 'users', description: 'Modify user details and account status.' },
  { id: 8, key: 'users.delete', name: 'Delete Users', group: 'users', description: 'Deactivate or remove user accounts.' },
  { id: 9, key: 'users.reset_password', name: 'Reset User Password', group: 'users', description: 'Initiate administrative password resets.' },

  // Roles & Permissions
  { id: 10, key: 'roles.view', name: 'View Roles', group: 'roles', description: 'View roles and permission matrices.' },
  { id: 11, key: 'roles.manage', name: 'Manage Roles', group: 'roles', description: 'Create and modify roles and assigned permissions.' },

  // Services & Subservices
  { id: 12, key: 'services.view', name: 'View Services', group: 'services', description: 'View government services and subservices.' },
  { id: 13, key: 'services.create', name: 'Create Services', group: 'services', description: 'Add new services or subservices to catalog.' },
  { id: 14, key: 'services.update', name: 'Update Services', group: 'services', description: 'Update service catalog information.' },
  { id: 15, key: 'services.delete', name: 'Delete Services', group: 'services', description: 'Deactivate or archive services.' },
  { id: 16, key: 'services.manage', name: 'Manage Service Access', group: 'services', description: 'Configure organizational service access levels.' },

  // Required Documents
  { id: 17, key: 'documents.view', name: 'View Required Documents', group: 'documents', description: 'View required document templates and criteria.' },
  { id: 18, key: 'documents.manage', name: 'Manage Required Documents', group: 'documents', description: 'Create, edit, and link documents to services.' },

  // Service Steps (Room-by-Room Instructions)
  { id: 19, key: 'service_steps.view', name: 'View Service Steps', group: 'service_steps', description: 'View physical room-by-room navigation steps.' },
  { id: 20, key: 'service_steps.manage', name: 'Manage Service Steps', group: 'service_steps', description: 'Create and reorder room instructions.' },

  // News Management
  { id: 21, key: 'news.view', name: 'View News', group: 'news', description: 'View internal and public news articles.' },
  { id: 22, key: 'news.create', name: 'Create News', group: 'news', description: 'Draft news announcements.' },
  { id: 23, key: 'news.update', name: 'Update News', group: 'news', description: 'Edit news drafts and published items.' },
  { id: 24, key: 'news.publish', name: 'Publish News', group: 'news', description: 'Publish or archive news announcements.' },
  { id: 25, key: 'news.delete', name: 'Delete News', group: 'news', description: 'Delete news items.' },

  // Events Management
  { id: 26, key: 'events.view', name: 'View Events', group: 'events', description: 'View scheduled government events.' },
  { id: 27, key: 'events.create', name: 'Create Events', group: 'events', description: 'Create calendar event entries.' },
  { id: 28, key: 'events.update', name: 'Update Events', group: 'events', description: 'Update event times and details.' },
  { id: 29, key: 'events.publish', name: 'Publish Events', group: 'events', description: 'Publish or cancel events.' },
  { id: 30, key: 'events.delete', name: 'Delete Events', group: 'events', description: 'Delete event records.' },

  // Citizen Feedback
  { id: 31, key: 'feedback.view_own', name: 'View Own Feedback', group: 'feedback', description: 'View feedback submitted to own organization.' },
  { id: 32, key: 'feedback.view_descendants', name: 'View Descendant Feedback', group: 'feedback', description: 'Read-only visibility into feedback submitted to descendant organizations.' },
  { id: 33, key: 'feedback.update_status', name: 'Update Feedback Status', group: 'feedback', description: 'Change status of feedback (e.g., under_review, resolved, closed).' },

  // QR Codes
  { id: 34, key: 'qr_codes.view', name: 'View QR Codes', group: 'qr_codes', description: 'View generated QR code tokens and routing.' },
  { id: 35, key: 'qr_codes.manage', name: 'Manage QR Codes', group: 'qr_codes', description: 'Generate, activate, and deactivate QR codes.' },

  // Dashboards & Audit Logs
  { id: 36, key: 'dashboard.view', name: 'View Dashboard', group: 'dashboard', description: 'Access role-aware and organization-scoped metrics.' },
  { id: 37, key: 'audit_logs.view', name: 'View Audit Logs', group: 'audit_logs', description: 'Inspect administrative audit trails.' },
];

/**
 * Domain groupings friendly labels.
 */
export const DOMAIN_GROUPS: { id: string; label: string; desc: string }[] = [
  { id: 'organizations', label: 'Organizations & Offices', desc: 'Jurisdictional structures, sub-cities, and bureaus.' },
  { id: 'users', label: 'User Accounts & Access', desc: 'Administrative staff provisioning and authentication.' },
  { id: 'roles', label: 'Roles & Governance', desc: 'Access control matrices and policy governance.' },
  { id: 'services', label: 'Public Services Catalog', desc: 'Government service criteria and citizen requirements.' },
  { id: 'documents', label: 'Required Documents', desc: 'Citizen document prerequisites and checklists.' },
  { id: 'service_steps', label: 'Room Navigation Routes', desc: 'Physical room sequence directions for office visitors.' },
  { id: 'news', label: 'News & Announcements', desc: 'Citizen news items and public notices.' },
  { id: 'events', label: 'Calendar Events', desc: 'Government community events and schedules.' },
  { id: 'feedback', label: 'Citizen Voice & Feedback', desc: 'Complaints, compliments, and citizen resolution.' },
  { id: 'qr_codes', label: 'Office QR Codes', desc: 'Physical desk QR tokens for direct feedback routing.' },
  { id: 'dashboard', label: 'Dashboard & Metrics', desc: 'Role-aware operational insights and analytics.' },
  { id: 'audit_logs', label: 'Security Audit Logs', desc: 'Immutable administrative system activity logs.' },
];

/**
 * Maps an array of PermissionItems into the UI matrix format.
 */
function mapPermissionsListToUiMatrix(permissions: PermissionItem[]): Record<string, string[]> {
  const perms: Record<string, string[]> = {
    offices: [],
    accounts: [],
    services: [],
    routes: [],
    feedback: [],
    news: [],
    cms: [],
    roles: [],
  };

  const grant = (mod: string, act: string) => {
    if (perms[mod] && !perms[mod].includes(act)) {
      perms[mod].push(act);
    }
  };

  permissions.forEach((p) => {
    const key = p.key;

    // Organizations -> offices
    if (key === 'organizations.view') grant('offices', 'view');
    if (key === 'organizations.create') grant('offices', 'create');
    if (key === 'organizations.update') grant('offices', 'edit');
    if (key === 'organizations.delete') grant('offices', 'delete');

    // Users -> accounts
    if (key === 'users.view') grant('accounts', 'view');
    if (key === 'users.create') grant('accounts', 'create');
    if (key === 'users.update' || key === 'users.reset_password') grant('accounts', 'edit');
    if (key === 'users.delete') grant('accounts', 'delete');

    // Services & Documents -> services
    if (key === 'services.view' || key === 'documents.view') grant('services', 'view');
    if (key === 'services.create') grant('services', 'create');
    if (key === 'services.update' || key === 'documents.manage') grant('services', 'edit');
    if (key === 'services.delete') grant('services', 'delete');
    if (key === 'services.manage') grant('services', 'publish');

    // Physical navigation -> routes
    if (key === 'service_steps.view') grant('routes', 'view');
    if (key === 'service_steps.manage') grant('routes', 'edit');

    // Feedback & QR codes -> feedback
    if (key === 'feedback.view_own' || key === 'feedback.view_descendants' || key === 'qr_codes.view') {
      grant('feedback', 'view');
    }
    if (key === 'feedback.update_status' || key === 'qr_codes.manage') {
      grant('feedback', 'status_update');
    }

    // News & Events -> news
    if (key === 'news.view' || key === 'events.view') grant('news', 'view');
    if (key === 'news.create' || key === 'events.create') grant('news', 'create');
    if (key === 'news.update' || key === 'events.update') grant('news', 'edit');
    if (key === 'news.publish' || key === 'events.publish') grant('news', 'publish');
    if (key === 'news.delete' || key === 'events.delete') grant('news', 'delete');

    // Security & Roles -> roles
    if (key === 'roles.view' || key === 'audit_logs.view') grant('roles', 'view');
    if (key === 'roles.manage') {
      grant('roles', 'create');
      grant('roles', 'edit');
    }
  });

  return perms;
}

/**
 * Maps the UI module-action map into permission IDs based on the catalog.
 */
function mapUiMatrixToPermissionIds(uiPerms: Record<string, string[]>, catalog: PermissionItem[]): number[] {
  const keys = new Set<string>();
  let hasAnyView = false;

  Object.entries(uiPerms).forEach(([mod, acts]) => {
    if (acts.includes('view')) hasAnyView = true;

    if (mod === 'offices') {
      if (acts.includes('view')) keys.add('organizations.view');
      if (acts.includes('create')) keys.add('organizations.create');
      if (acts.includes('edit')) keys.add('organizations.update');
      if (acts.includes('delete')) keys.add('organizations.delete');
    }

    if (mod === 'accounts') {
      if (acts.includes('view')) keys.add('users.view');
      if (acts.includes('create')) keys.add('users.create');
      if (acts.includes('edit')) {
        keys.add('users.update');
        keys.add('users.reset_password');
      }
      if (acts.includes('delete')) keys.add('users.delete');
    }

    if (mod === 'services') {
      if (acts.includes('view')) {
        keys.add('services.view');
        keys.add('documents.view');
      }
      if (acts.includes('create')) keys.add('services.create');
      if (acts.includes('edit')) {
        keys.add('services.update');
        keys.add('documents.manage');
      }
      if (acts.includes('delete')) keys.add('services.delete');
      if (acts.includes('publish')) keys.add('services.manage');
    }

    if (mod === 'routes') {
      if (acts.includes('view')) keys.add('service_steps.view');
      if (acts.includes('edit')) keys.add('service_steps.manage');
    }

    if (mod === 'feedback') {
      if (acts.includes('view')) {
        keys.add('feedback.view_own');
        keys.add('feedback.view_descendants');
        keys.add('qr_codes.view');
      }
      if (acts.includes('status_update')) {
        keys.add('feedback.update_status');
        keys.add('qr_codes.manage');
      }
    }

    if (mod === 'news') {
      if (acts.includes('view')) {
        keys.add('news.view');
        keys.add('events.view');
      }
      if (acts.includes('create')) {
        keys.add('news.create');
        keys.add('events.create');
      }
      if (acts.includes('edit')) {
        keys.add('news.update');
        keys.add('events.update');
      }
      if (acts.includes('publish')) {
        keys.add('news.publish');
        keys.add('events.publish');
      }
      if (acts.includes('delete')) {
        keys.add('news.delete');
        keys.add('events.delete');
      }
    }

    if (mod === 'roles') {
      if (acts.includes('view')) {
        keys.add('roles.view');
        keys.add('audit_logs.view');
      }
      if (acts.includes('create') || acts.includes('edit')) {
        keys.add('roles.manage');
      }
    }
  });

  if (hasAnyView) {
    keys.add('dashboard.view');
  }

  return catalog.filter((p) => keys.has(p.key)).map((p) => p.id);
}

export interface RolesPermissionsPageProps {
  roles?: RoleItem[];
  onUpdateRolePermissions?: (roleId: string, moduleId: string, actions: string[]) => void;
  onCreateRole?: (role: RoleItem) => void;
  onUpdateRole?: (role: RoleItem) => void;
  onDeleteRole?: (roleId: string) => void;
}

export const RolesPermissionsPage: React.FC<RolesPermissionsPageProps> = ({
  roles: propRoles,
  onUpdateRolePermissions,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}) => {
  // 1. GET /api/v1/roles (list with permissions_count)
  const { data: apiRoles, isLoading: loadingRoles } = useGetRolesQuery();

  // 2. GET /api/v1/permissions (grouped domain catalog)
  const { data: apiPermissions } = useGetPermissionsQuery();

  // 3. PUT /api/v1/roles/{id}/permissions (sync permission IDs)
  const [updateRolePermissionsTrigger] = useUpdateRolePermissionsMutation();

  const [viewMode, setViewMode] = useState<'matrix' | 'domain'>('matrix');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [internalRoles, setInternalRoles] = useState<RoleItem[]>(
    () => propRoles || (INITIAL_ROLES as RoleItem[])
  );

  // Active permissions catalog (backend if available, otherwise complete standardized catalog)
  const allPermissions = useMemo<PermissionItem[]>(() => {
    if (apiPermissions?.data && apiPermissions.data.length > 0) {
      return apiPermissions.data;
    }
    return SYSTEM_PERMISSIONS_CATALOG;
  }, [apiPermissions]);

  // Combine live backend API roles with local custom roles
  const roles = useMemo<RoleItem[]>(() => {
    if (propRoles && propRoles.length > 0) return propRoles;
    if (apiRoles?.data && apiRoles.data.length > 0) {
      const mappedApiRoles: RoleItem[] = apiRoles.data.map((r) => {
        const fallback = internalRoles.find(
          (ir) => ir.slug === r.slug || ir.id === r.slug || ir.name.toLowerCase() === r.name.toLowerCase()
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
          permissions: fallback?.permissions || {
            offices: ['view'],
            services: ['view'],
            feedback: ['view'],
          },
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

  // Locate active role by id, slug, or legacy aliases
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
  const { data: activeRoleDetail } = useGetRoleByIdQuery(activeRoleQueryId, {
    skip: !activeRoleQueryId,
  });

  const isSuperAdmin =
    activeRole?.slug === 'super_admin' ||
    activeRole?.id === 'super_admin' ||
    activeRole?.id === 'super';

  // Effective permission IDs for currently active role
  const effectivePermissionIds = useMemo<number[]>(() => {
    if (!activeRole) return [];

    // Super Admin receives all 37 platform permissions
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

    // 3. Fallback: derived from role's module permissions
    if (activeRole.permissions) {
      return mapUiMatrixToPermissionIds(activeRole.permissions, allPermissions);
    }

    return [];
  }, [activeRole, activeRoleDetail, allPermissions, isSuperAdmin]);

  // Effective UI permissions matrix
  const rolePermissions = useMemo<Record<string, string[]>>(() => {
    if (!activeRole) return {};

    if (isSuperAdmin) {
      const all: Record<string, string[]> = {};
      MODULE_DEFINITIONS.forEach((m) => {
        all[m.id] = [...m.actions];
      });
      return all;
    }

    // If active role permissions are loaded from backend
    if (activeRoleDetail?.data?.permissions && activeRoleDetail.data.permissions.length > 0) {
      return mapPermissionsListToUiMatrix(activeRoleDetail.data.permissions);
    }

    // Fallback: map effective IDs or role's permissions
    if (effectivePermissionIds.length > 0) {
      const permsList = allPermissions.filter((p) => effectivePermissionIds.includes(p.id));
      return mapPermissionsListToUiMatrix(permsList);
    }

    return activeRole.permissions || {};
  }, [activeRole, activeRoleDetail, allPermissions, effectivePermissionIds, isSuperAdmin]);

  // Display count of active permissions
  const activePermissionsCount = isSuperAdmin
    ? allPermissions.length
    : activeRole?.permissionsCount ?? effectivePermissionIds.length;

  /**
   * Dispatches PUT /api/v1/roles/{id}/permissions to synchronize permission IDs.
   */
  const syncPermissionsToBackend = async (newPermissionIds: number[], updatedMatrix: Record<string, string[]>) => {
    if (!activeRole) return;

    // Super Admin protection rule (HTTP 422: Super Admin permissions cannot be modified.)
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
              permissions: updatedMatrix,
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
          setSaveStatus(`Role permissions updated successfully (${newPermissionIds.length} permissions active).`);
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

    setSaveStatus(`Security policy updated locally for ${activeRole.name} (${newPermissionIds.length} permissions active).`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  /**
   * Toggles permission in Matrix View.
   */
  const handleToggleMatrixAction = async (moduleId: string, action: string) => {
    if (!activeRole || isSuperAdmin) {
      if (isSuperAdmin) {
        setErrorStatus('Super Admin permissions cannot be modified.');
        setTimeout(() => setErrorStatus(null), 3500);
      }
      return;
    }

    const currentActions = rolePermissions[moduleId] || [];
    const hasAction = currentActions.includes(action);
    const newActions = hasAction
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];

    const updatedPermissionsMap = {
      ...rolePermissions,
      [moduleId]: newActions,
    };

    if (onUpdateRolePermissions) {
      onUpdateRolePermissions(String(activeRole.id), moduleId, newActions);
    }

    const newPermissionIds = mapUiMatrixToPermissionIds(updatedPermissionsMap, allPermissions);
    await syncPermissionsToBackend(newPermissionIds, updatedPermissionsMap);
  };

  /**
   * Toggles individual permission in Domain Catalog View.
   */
  const handleToggleDomainPermission = async (permissionId: number) => {
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

    const permsList = allPermissions.filter((p) => newPermissionIds.includes(p.id));
    const updatedMatrix = mapPermissionsListToUiMatrix(permsList);

    await syncPermissionsToBackend(newPermissionIds, updatedMatrix);
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
      const initialPermIds = saved.permissionIds || mapUiMatrixToPermissionIds(saved.permissions || {}, allPermissions);
      const newRole: RoleItem = {
        ...saved,
        permissionIds: initialPermIds,
        permissionsCount: initialPermIds.length,
      };
      setInternalRoles((prev) => [...prev, newRole]);
      setSelectedRoleId(String(saved.id));
      setSaveStatus(`Custom role "${saved.name}" created with ${initialPermIds.length} permissions.`);
    }
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleDeleteRole = (roleToDelete: RoleItem) => {
    if (roleToDelete.isSystem) return;
    if (window.confirm(`Are you sure you want to delete the "${roleToDelete.name}" custom role?`)) {
      if (onDeleteRole) {
        onDeleteRole(String(roleToDelete.id));
      }
      setInternalRoles((prev) => prev.filter((r) => String(r.id) !== String(roleToDelete.id)));
      setSelectedRoleId(roles[0]?.id || 'super_admin');
      setSaveStatus(`Role "${roleToDelete.name}" deleted.`);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleVerifyPolicy = () => {
    if (!activeRole) return;
    const msg = isSuperAdmin
      ? `Verified: Root platform authority granted across all modules (${allPermissions.length} permissions active).`
      : `Verified: ${activeRole.name} has ${activePermissionsCount} active permissions out of ${allPermissions.length} total platform permissions. Governed by Least Privilege Access standard.`;
    window.alert(msg);
  };

  const handleExportAudit = () => {
    if (!activeRole) return;
    const activePermList = allPermissions.filter((p) => effectivePermissionIds.includes(p.id));
    const auditData = {
      exported_at: new Date().toISOString(),
      role: {
        id: activeRole.id,
        name: activeRole.name,
        slug: activeRole.slug,
        description: activeRole.description,
        is_system: activeRole.isSystem,
        is_active: true,
        permissions_count: activePermissionsCount,
      },
      permission_ids: effectivePermissionIds,
      permissions: activePermList,
      matrix: rolePermissions,
      standard: 'CivicLink Role-Based Access Governance (RBAC)',
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `role-permissions-${activeRole.slug || activeRole.id}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeading
        eyebrow="SECURITY & ACCESS GOVERNANCE"
        title="Roles & permissions"
        subtitle="Manage platform roles, customize permission assignments, and configure domain policies."
        action="Create custom role"
        onAction={() => {
          setEditingRole(null);
          setModalOpen(true);
        }}
        secondary="Export audit log"
        onSecondary={handleExportAudit}
      />

      {/* Permissions Matrix Panel */}
      {!activeRole ? (
        <section className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>{loadingRoles ? 'Loading security roles from /api/v1/roles...' : 'No role selected.'}</p>
        </section>
      ) : (
        <section className="panel table-panel permissions-matrix-panel">
          <div className="table-toolbar">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2>Permissions matrix: {activeRole.name}</h2>
                <code
                  style={{
                    background: '#eef5f1',
                    color: '#164a54',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {activeRole.slug || activeRole.id}
                </code>
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {activePermissionsCount} / {allPermissions.length} permissions active
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
              <p style={{ marginTop: '4px' }}>{activeRole.description}</p>
            </div>

            <div className="toolbar-tools permissions-toolbar-tools">
              {/* Dual View Mode Switcher */}
              <div
                style={{
                  display: 'inline-flex',
                  background: '#f1f5f9',
                  padding: '3px',
                  borderRadius: '6px',
                  marginRight: '8px',
                }}
                role="tablist"
                aria-label="View mode"
              >
                <button
                  type="button"
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    background: viewMode === 'matrix' ? '#ffffff' : 'transparent',
                    color: viewMode === 'matrix' ? '#164a54' : '#64748b',
                    boxShadow: viewMode === 'matrix' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setViewMode('matrix')}
                >
                  Matrix view
                </button>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    background: viewMode === 'domain' ? '#ffffff' : 'transparent',
                    color: viewMode === 'domain' ? '#164a54' : '#64748b',
                    boxShadow: viewMode === 'domain' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => setViewMode('domain')}
                >
                  Domain catalog
                </button>
              </div>

              <label className="role-picker-control">
                <span>Role</span>
                <select
                  value={String(activeRole.id)}
                  onChange={(event) => setSelectedRoleId(event.target.value)}
                >
                  {roles.map((roleItem: RoleItem) => (
                    <option key={roleItem.id} value={roleItem.id}>
                      {roleItem.name} {roleItem.isSystem ? '(System)' : '(Custom)'}
                    </option>
                  ))}
                </select>
              </label>

              <span className="role-scope-indicator">
                <Icon name="shield" size={14} /> Scope: <strong>{activeRole.scope}</strong>
              </span>

              <button
                type="button"
                className="button primary small-button"
                style={{ padding: '6px 12px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                onClick={() => {
                  setEditingRole(null);
                  setModalOpen(true);
                }}
              >
                + New role
              </button>

              {!activeRole.isSystem && (
                <div style={{ display: 'inline-flex', gap: '8px' }}>
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

          {/* Success Banner */}
          {saveStatus && (
            <div
              className="tip-banner inline-tip"
              style={{ margin: '0.75rem 1.25rem', borderColor: '#00485a', background: '#f0fdf4' }}
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

          {/* Error Banner (e.g. 422 Super Admin protection) */}
          {errorStatus && (
            <div
              className="tip-banner inline-tip"
              style={{ margin: '0.75rem 1.25rem', borderColor: '#dc2626', background: '#fef2f2' }}
            >
              <span className="tip-icon" style={{ color: '#dc2626' }}>
                <Icon name="close" size={16} />
              </span>
              <span>
                <b>Action Restricted (HTTP 422)</b>
                <small>{errorStatus}</small>
              </span>
            </div>
          )}

          {/* Policy Information Notice */}
          {isSuperAdmin ? (
            <div className="tip-banner inline-tip" style={{ margin: '0.75rem 1.25rem' }}>
              <span className="tip-icon">
                <Icon name="lock" size={16} />
              </span>
              <span>
                <b>Root platform authority (Protected)</b>
                <small>
                  Super Admin permissions cannot be modified. Super Admin holds all platform
                  authorities across all 37 permissions. Select another role or create a custom role
                  to configure tailored policies.
                </small>
              </span>
            </div>
          ) : (
            <div
              className="tip-banner inline-tip"
              style={{ margin: '0.75rem 1.25rem', background: '#f8fafc', borderColor: '#cbd5e1' }}
            >
              <span className="tip-icon">
                <Icon name="key" size={16} />
              </span>
              <span>
                <b>Configurable Access Policy ({activeRole.slug?.replace('_', ' ') || activeRole.id}/permissions)</b>
                <small>
                  Click any checkbox below to synchronize permissions for this role.
                  Governed by the Least Privilege Access standard.
                </small>
              </span>
            </div>
          )}

          {/* VIEW MODE 1: MATRIX VIEW */}
          {viewMode === 'matrix' ? (
            <div className="table-scroll">
              <table className="data-table permissions-table">
                <colgroup>
                  <col style={{ width: '36%' }} />
                  {ACTION_COLUMNS.map((column) => (
                    <col key={column.id} style={{ width: column.width }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="permission-group-head">
                    <th rowSpan={2} scope="col">
                      Platform module
                    </th>
                    <th colSpan={1} scope="colgroup">
                      Access
                    </th>
                    <th colSpan={3} scope="colgroup">
                      Manage
                    </th>
                    <th colSpan={2} scope="colgroup">
                      Publish & respond
                    </th>
                  </tr>
                  <tr className="permission-action-head">
                    {ACTION_COLUMNS.map((col) => (
                      <th key={col.id} scope="col">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULE_DEFINITIONS.map((module) => {
                    const roleActions = rolePermissions[module.id] || [];

                    return (
                      <tr key={module.id}>
                        <td>
                          <div className="module-info-cell">
                            <b>{module.name}</b>
                            <p>{module.desc}</p>
                          </div>
                        </td>
                        {ACTION_COLUMNS.map((col) => {
                          const isApplicable = module.actions.includes(col.id);
                          const isGranted = roleActions.includes(col.id);

                          if (!isApplicable) {
                            return (
                              <td
                                key={col.id}
                                className="permission-not-applicable"
                                title="Not applicable to this module"
                                aria-label={`${module.name}: ${col.label} not applicable`}
                              >
                                —
                              </td>
                            );
                          }

                          if (isSuperAdmin) {
                            return (
                              <td key={col.id} style={{ textAlign: 'center' }}>
                                <span
                                  className="perm-status-icon granted"
                                  role="img"
                                  aria-label="Granted"
                                  title="Root permission granted"
                                >
                                  <Icon name="check" size={15} />
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={col.id} style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className={`perm-toggle-btn${isGranted ? ' granted' : ''}`}
                                onClick={() => handleToggleMatrixAction(module.id, col.id)}
                                aria-pressed={isGranted}
                                title={
                                  isGranted
                                    ? `${col.label} granted (click to revoke)`
                                    : `${col.label} not granted (click to grant)`
                                }
                                aria-label={`Toggle ${col.label} for ${module.name}`}
                              >
                                <Icon name={isGranted ? 'check' : 'close'} size={14} />
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW MODE 2: DOMAIN PERMISSIONS CATALOG VIEW */
            <div style={{ padding: '1rem 1.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {DOMAIN_GROUPS.map((domain) => {
                  const domainPerms = allPermissions.filter((p) => p.group === domain.id);
                  if (domainPerms.length === 0) return null;

                  const domainGrantedCount = domainPerms.filter((p) =>
                    effectivePermissionIds.includes(p.id)
                  ).length;

                  return (
                    <div
                      key={domain.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '8px',
                          marginBottom: '10px',
                        }}
                      >
                        <div>
                          <b style={{ color: '#164a54', fontSize: '13.5px' }}>{domain.label}</b>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                            {domain.desc}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background:
                              domainGrantedCount === domainPerms.length
                                ? '#dcfce7'
                                : domainGrantedCount > 0
                                  ? '#e0f2fe'
                                  : '#f1f5f9',
                            color:
                              domainGrantedCount === domainPerms.length
                                ? '#15803d'
                                : domainGrantedCount > 0
                                  ? '#0369a1'
                                  : '#64748b',
                          }}
                        >
                          {domainGrantedCount} / {domainPerms.length}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {domainPerms.map((perm) => {
                          const isGranted = effectivePermissionIds.includes(perm.id);

                          return (
                            <label
                              key={perm.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                background: isGranted ? '#f8fafc' : '#ffffff',
                                border: `1px solid ${isGranted ? '#cbd5e1' : '#f1f5f9'}`,
                                cursor: isSuperAdmin ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isGranted}
                                disabled={isSuperAdmin}
                                onChange={() => handleToggleDomainPermission(perm.id)}
                                style={{ marginTop: '3px', cursor: isSuperAdmin ? 'not-allowed' : 'pointer' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                                    {perm.name}
                                  </span>
                                  <code style={{ fontSize: '10.5px', color: '#64748b', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>
                                    {perm.key}
                                  </code>
                                </div>
                                {perm.description && (
                                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="table-footer">
            <span>
              Policy: <strong>{activeRole.name}</strong> · Governed by Least Privilege Access standard ·{' '}
              <code>{activePermissionsCount}</code> permissions assigned
            </span>
            <button
              type="button"
              className="button secondary small-button"
              onClick={handleVerifyPolicy}
            >
              Verify policy
            </button>
          </div>
        </section>
      )}

      <RoleModal
        role={editingRole}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSaveRole}
      />
    </>
  );
};

export default RolesPermissionsPage;
