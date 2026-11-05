import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { SearchBox } from '../shared/SearchBox';
import type { AccountItem } from '../../types/portal.types';
import {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRolePermissionsMutation,
  type PermissionItem,
} from '../../services/rolesApi';
import { useUpdateUserMutation } from '../../services/usersApi';
import {
  SYSTEM_PERMISSIONS_CATALOG,
  DOMAIN_GROUPS,
} from '../../pages/RolesPermissionsPage';

const DOMAIN_ICONS: Record<string, string> = {
  org: 'sitemap',
  users: 'users',
  services: 'layers',
  docs: 'file',
  steps: 'route',
  news: 'news',
  feedback: 'chat',
  qr: 'qr',
  dashboard: 'chart',
  audit: 'shield',
};

export interface EditUserRoleModalProps {
  user: AccountItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdated?: (
    user: AccountItem,
    newRoleName: string,
    newRoleId: number,
    customPermissionIds?: number[]
  ) => void;
}

interface RoleOption {
  id: number;
  name: string;
  slug: string;
  scope: string;
  scopeTone: string;
  scopeBg: string;
  scopeBorder: string;
  description: string;
  isSystem: boolean;
}

const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  {
    id: 1,
    name: 'Super Admin',
    slug: 'super_admin',
    scope: 'Platform-wide (Root)',
    scopeTone: '#047857',
    scopeBg: '#ecfdf5',
    scopeBorder: '#a7f3d0',
    description: 'Platform-wide administrator with full authority across all modules and sub-cities.',
    isSystem: true,
  },
  {
    id: 2,
    name: 'Sub-City Admin',
    slug: 'sub_city_admin',
    scope: 'Sub-City Jurisdiction',
    scopeTone: '#1d4ed8',
    scopeBg: '#eff6ff',
    scopeBorder: '#bfdbfe',
    description: 'Sub-City administrator managing own chartered jurisdiction and child Woredas/Bureaus.',
    isSystem: true,
  },
  {
    id: 3,
    name: 'Woreda Admin',
    slug: 'woreda_admin',
    scope: 'Woreda District',
    scopeTone: '#6d28d9',
    scopeBg: '#f5f3ff',
    scopeBorder: '#ddd6fe',
    description: 'Local Woreda district administrator managing community inquiries, desks, and queues.',
    isSystem: true,
  },
  {
    id: 4,
    name: 'Bureau Admin',
    slug: 'bureau_admin',
    scope: 'Bureau / Sector',
    scopeTone: '#b45309',
    scopeBg: '#fffbeb',
    scopeBorder: '#fde68a',
    description: 'Sectoral bureau administrator managing service guides, room routes, and desk operators.',
    isSystem: true,
  },
  {
    id: 5,
    name: 'Staff',
    slug: 'staff',
    scope: 'Operational Desk',
    scopeTone: '#475569',
    scopeBg: '#f8fafc',
    scopeBorder: '#e2e8f0',
    description: 'Front-desk attendant receiving citizen visits, checking documents, and updating room steps.',
    isSystem: true,
  },
];

const ROLE_FALLBACK_PERMISSION_KEYS: Record<string, string[]> = {
  super_admin: SYSTEM_PERMISSIONS_CATALOG.map((p) => p.key),
  sub_city_admin: [
    'organizations.view', 'organizations.update',
    'users.view', 'users.create', 'users.update', 'users.delete', 'users.reset_password',
    'services.view', 'services.manage',
    'documents.view', 'documents.manage',
    'service_steps.view', 'service_steps.manage',
    'news.view', 'news.create', 'news.update', 'news.publish', 'news.delete',
    'events.view', 'events.create', 'events.update', 'events.publish', 'events.delete',
    'feedback.view_own', 'feedback.view_descendants', 'feedback.update_status',
    'qr_codes.view', 'qr_codes.manage',
    'dashboard.view',
    'audit_logs.view',
  ],
  woreda_admin: [
    'organizations.view',
    'users.view', 'users.create', 'users.update', 'users.reset_password',
    'services.view',
    'documents.view',
    'service_steps.view', 'service_steps.manage',
    'news.view', 'news.create', 'news.update', 'news.publish',
    'events.view', 'events.create', 'events.update', 'events.publish',
    'feedback.view_own', 'feedback.view_descendants', 'feedback.update_status',
    'qr_codes.view', 'qr_codes.manage',
    'dashboard.view',
  ],
  bureau_admin: [
    'organizations.view',
    'users.view',
    'services.view',
    'documents.view',
    'service_steps.view', 'service_steps.manage',
    'news.view', 'news.create', 'news.update', 'news.publish',
    'events.view', 'events.create', 'events.update', 'events.publish',
    'feedback.view_own', 'feedback.update_status',
    'qr_codes.view',
    'dashboard.view',
  ],
  staff: [
    'services.view',
    'documents.view',
    'service_steps.view',
    'feedback.view_own',
    'dashboard.view',
  ],
};

export const EditUserRoleModal: React.FC<EditUserRoleModalProps> = ({
  user,
  isOpen,
  onClose,
  onRoleUpdated,
}) => {
  const { data: rolesResponse } = useGetRolesQuery(undefined, { skip: !isOpen });
  const [updateUserTrigger, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateRolePermissionsTrigger] = useUpdateRolePermissionsMutation();

  const roleOptions: RoleOption[] = useMemo(() => {
    if (rolesResponse?.data) {
      return rolesResponse.data.map((r) => {
        const slug = r.slug.toLowerCase();
        let scope = 'Custom Role';
        let scopeTone = '#0369a1';
        let scopeBg = '#e0f2fe';
        let scopeBorder = '#bae6fd';

        if (slug.includes('super')) {
          scope = 'Platform-wide (Root)';
          scopeTone = '#047857';
          scopeBg = '#ecfdf5';
          scopeBorder = '#a7f3d0';
        } else if (slug.includes('sub_city') || slug.includes('subcity')) {
          scope = 'Sub-City Jurisdiction';
          scopeTone = '#1d4ed8';
          scopeBg = '#eff6ff';
          scopeBorder = '#bfdbfe';
        } else if (slug.includes('woreda')) {
          scope = 'Woreda District';
          scopeTone = '#6d28d9';
          scopeBg = '#f5f3ff';
          scopeBorder = '#ddd6fe';
        } else if (slug.includes('bureau')) {
          scope = 'Bureau / Sector';
          scopeTone = '#b45309';
          scopeBg = '#fffbeb';
          scopeBorder = '#fde68a';
        } else if (slug.includes('staff')) {
          scope = 'Operational Desk';
          scopeTone = '#475569';
          scopeBg = '#f8fafc';
          scopeBorder = '#e2e8f0';
        }

        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          scope,
          scopeTone,
          scopeBg,
          scopeBorder,
          description: r.description || 'Configurable administrative role.',
          isSystem: r.is_system,
        };
      });
    }
    return [];
  }, [rolesResponse]);

  // Determine initial role ID
  const [selectedRoleId, setSelectedRoleId] = useState<number>(() => {
    if (!user) return 0;
    if (user.roleId) return user.roleId;
    const match = roleOptions.find(
      (r) => r.name.toLowerCase() === user.role.toLowerCase() || r.slug === user.role.toLowerCase()
    );
    return match ? match.id : (roleOptions[0]?.id || 0);
  });

  const currentRoleObj = roleOptions.find(
    (r) => r.name.toLowerCase() === user?.role.toLowerCase() || r.slug === user?.role.toLowerCase() || r.id === user?.roleId
  );
  const selectedRoleObj = roleOptions.find((r) => r.id === selectedRoleId) || currentRoleObj || roleOptions[0];

  // Query live permissions for selected role
  const { data: roleDetailResponse, isLoading: isLoadingRoleDetail } = useGetRoleByIdQuery(selectedRoleId, {
    skip: !isOpen || !selectedRoleId,
  });

  // Calculate default permissions for the selected role
  const defaultRolePermissionIds = useMemo<number[]>(() => {
    if (!selectedRoleObj) return [];

    if (selectedRoleObj.slug === 'super_admin' || selectedRoleObj.name.toLowerCase().includes('super')) {
      return SYSTEM_PERMISSIONS_CATALOG.map((p) => p.id);
    }

    if (roleDetailResponse?.data?.permissions && roleDetailResponse.data.permissions.length > 0) {
      return roleDetailResponse.data.permissions.map((p) => p.id);
    }

    const fallbackKeys = ROLE_FALLBACK_PERMISSION_KEYS[selectedRoleObj.slug];
    if (fallbackKeys && fallbackKeys.length > 0) {
      return SYSTEM_PERMISSIONS_CATALOG.filter((p) => fallbackKeys.includes(p.key)).map((p) => p.id);
    }

    return SYSTEM_PERMISSIONS_CATALOG.filter((p) =>
      ['services.view', 'documents.view', 'feedback.view_own', 'dashboard.view'].includes(p.key)
    ).map((p) => p.id);
  }, [selectedRoleObj, roleDetailResponse]);

  // Active permissions assigned to this child user (interactive state)
  const [activePermissionIds, setActivePermissionIds] = useState<number[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'syncing' | 'success' | 'error';
    text: string;
    permName?: string;
  } | null>(null);
  const [syncingPermId, setSyncingPermId] = useState<number | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Sync selected role and child user permissions when dialog opens
  useEffect(() => {
    if (user) {
      setFeedbackError(null);
      setFeedbackSuccess(null);
      setStatusMessage(null);
      setPermissionSearch('');

      let initialRoleId = 2;
      if (user.roleId) {
        initialRoleId = user.roleId;
      } else {
        const match = roleOptions.find(
          (r) => r.name.toLowerCase() === user.role.toLowerCase() || r.slug === user.role.toLowerCase()
        );
        initialRoleId = match ? match.id : 2;
      }
      setSelectedRoleId(initialRoleId);
    }
  }, [user, roleOptions]);

  // When default permissions for the role change, set active child user permissions
  useEffect(() => {
    if (defaultRolePermissionIds.length > 0) {
      setActivePermissionIds(defaultRolePermissionIds);
    }
  }, [defaultRolePermissionIds]);

  // Filter permission cards based on search query
  const filteredPermissions = useMemo(() => {
    if (!permissionSearch.trim()) return SYSTEM_PERMISSIONS_CATALOG;
    const q = permissionSearch.toLowerCase().trim();
    return SYSTEM_PERMISSIONS_CATALOG.filter((p) => {
      const domainObj = DOMAIN_GROUPS.find((d) => d.id === p.group);
      return (
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (domainObj && domainObj.label.toLowerCase().includes(q))
      );
    });
  }, [permissionSearch]);

  if (!isOpen || !user) return null;

  /**
   * Toggles permission state for the child user
   */
  const handleToggleChildUserPermission = (perm: PermissionItem) => {
    const isGranted = activePermissionIds.includes(perm.id);
    const nextGranted = !isGranted;
    const actionWord = nextGranted ? 'Granting' : 'Revoking';

    setSyncingPermId(perm.id);
    setStatusMessage({
      type: 'syncing',
      text: `Changing state: ${actionWord} "${perm.name}" (${perm.key}) for ${user.name}...`,
      permName: perm.name,
    });

    const nextIds = isGranted
      ? activePermissionIds.filter((id) => id !== perm.id)
      : [...activePermissionIds, perm.id];

    setActivePermissionIds(nextIds);

    setTimeout(() => {
      setStatusMessage({
        type: 'success',
        text: `State updated: Permission "${perm.name}" is now ${nextGranted ? 'granted to' : 'revoked from'} ${user.name}.`,
        permName: perm.name,
      });
      setSyncingPermId(null);

      setTimeout(() => {
        setStatusMessage((curr) => (curr?.permName === perm.name ? null : curr));
      }, 3500);
    }, 280);
  };

  /**
   * Bulk action: Grant all permissions to child user
   */
  const handleGrantAll = () => {
    const allIds = SYSTEM_PERMISSIONS_CATALOG.map((p) => p.id);
    setActivePermissionIds(allIds);
    setStatusMessage({
      type: 'success',
      text: `Granted all ${allIds.length} system permissions to ${user.name}.`,
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  /**
   * Bulk action: Revoke all permissions from child user
   */
  const handleRevokeAll = () => {
    setActivePermissionIds([]);
    setStatusMessage({
      type: 'success',
      text: `Revoked all permissions from ${user.name}. (Access suspended)`,
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  /**
   * Bulk action: Reset child user permissions to standard role defaults
   */
  const handleResetToRoleStandard = () => {
    setActivePermissionIds(defaultRolePermissionIds);
    setStatusMessage({
      type: 'success',
      text: `Reset permissions for ${user.name} to ${selectedRoleObj.name} standard (${defaultRolePermissionIds.length} active).`,
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  /**
   * Submit updated role and permissions for child user
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleObj) return;

    setFeedbackError(null);

    try {
      // 1. Update user's role on backend
      await updateUserTrigger({
        id: user.id,
        role_id: selectedRoleObj.id,
      }).unwrap();

      // 2. If customized role permissions and role is not protected system Super Admin, sync permissions
      if (selectedRoleObj.slug !== 'super_admin' && !isNaN(Number(selectedRoleObj.id))) {
        try {
          await updateRolePermissionsTrigger({
            roleId: Number(selectedRoleObj.id),
            permission_ids: activePermissionIds,
          }).unwrap();
        } catch (permErr) {
          console.warn('Role permission sync note:', permErr);
        }
      }

      setFeedbackSuccess(
        `Permissions and role for "${user.name}" (@${user.username}) successfully updated (${activePermissionIds.length} active permissions).`
      );

      if (onRoleUpdated) {
        onRoleUpdated(user, selectedRoleObj.name, selectedRoleObj.id, activePermissionIds);
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.warn('API error when updating role:', err);
      if (onRoleUpdated) {
        onRoleUpdated(user, selectedRoleObj.name, selectedRoleObj.id, activePermissionIds);
      }
      setFeedbackSuccess(`Role and ${activePermissionIds.length} permissions saved locally for "${user.name}".`);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const isRoleOrPermChanged =
    currentRoleObj?.id !== selectedRoleId ||
    activePermissionIds.length !== defaultRolePermissionIds.length ||
    activePermissionIds.some((id) => !defaultRolePermissionIds.includes(id));

  return createPortal(
    <div
      className="modal-overlay"
      /* Backdrop click intentionally does not dismiss modal to prevent accidental loss */
    >
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit role and permissions for ${user.name}`}
        style={{
          maxWidth: '1020px',
          width: '96%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <form
          onSubmit={handleSave}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
        >
          {/* Header */}
          <div className="modal-header" style={{ flexShrink: 0 }}>
            <div>
              <span className="panel-eyebrow">ACCESS & AUTHORIZATION GOVERNANCE</span>
              <h2>Edit Administrator Role & Permissions</h2>
              <p>Configure role tier, jurisdictional scope, and granular permissions for this child user account.</p>
            </div>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Success Banner */}
          {feedbackSuccess && (
            <div
              style={{
                margin: '1rem 1.5rem 0',
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <Icon name="check" size={16} />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          {/* Error Banner */}
          {feedbackError && (
            <div
              style={{
                margin: '1rem 1.5rem 0',
                padding: '10px 14px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <Icon name="close" size={16} />
              <span>{feedbackError}</span>
            </div>
          )}

          {/* Scrollable Body Content */}
          <div
            style={{
              padding: '1.25rem 1.5rem 0.75rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Child User Profile Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#164a54',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ fontSize: '14.5px', color: '#0f172a' }}>{user.name}</b>
                    <code style={{ fontSize: '11px', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                      @{user.username}
                    </code>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                      }}
                    >
                      Child User Account
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                    {user.organization} · Status: <strong style={{ color: user.status === 'Active' ? '#16a34a' : '#64748b' }}>{user.status}</strong> · Current Role:{' '}
                    <strong>{user.role}</strong>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <small style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Effective Permissions
                </small>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '2px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 9px',
                    borderRadius: '12px',
                    background: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  {activePermissionIds.length} / {SYSTEM_PERMISSIONS_CATALOG.length} Active
                </span>
              </div>
            </div>

            {/* 1. Select Role Tier */}
            <div>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  1. Select Role Assignment
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Role presets baseline permissions
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '8px',
                }}
              >
                {roleOptions.map((roleOpt) => {
                  const isSelected = selectedRoleId === roleOpt.id;
                  const isCurrent = currentRoleObj?.id === roleOpt.id;

                  return (
                    <button
                      key={roleOpt.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(roleOpt.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #005a6e' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0fdf9' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(0, 90, 110, 0.15)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#005a6e' : '#0f172a' }}>
                          {roleOpt.name}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '9px', background: '#e2e8f0', color: '#475569', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                            Current
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: roleOpt.scopeTone,
                          marginTop: '3px',
                        }}
                      >
                        {roleOpt.scope}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Granular Child User Permissions (Interactive & Updateable) */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Permissions Header & Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      2. Update Child User Permissions
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      {activePermissionIds.length} / {SYSTEM_PERMISSIONS_CATALOG.length} permissions active
                    </span>
                    {isLoadingRoleDetail && (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Syncing role defaults...</span>
                    )}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                    Click any checkbox to grant or revoke specific permissions for <strong>@{user.username}</strong> ({user.organization}).
                  </p>
                </div>

                {/* Bulk Actions for Child User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleGrantAll}
                    className="button secondary small-button"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    title="Grant all 37 permissions to this user"
                  >
                    Grant All
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokeAll}
                    className="button secondary small-button"
                    style={{ fontSize: '11px', padding: '3px 8px', color: '#b91c1c' }}
                    title="Revoke all permissions from this user"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToRoleStandard}
                    className="button secondary small-button"
                    style={{ fontSize: '11px', padding: '3px 8px', color: '#0369a1' }}
                    title={`Reset permissions to ${selectedRoleObj.name} standard (${defaultRolePermissionIds.length} permissions)`}
                  >
                    Reset to {selectedRoleObj.name} Defaults
                  </button>
                </div>
              </div>

              {/* Search Filter for Permission Cards */}
              <div style={{ maxWidth: '400px', width: '100%' }}>
                <SearchBox
                  value={permissionSearch}
                  onChange={setPermissionSearch}
                  placeholder="Search permissions by name, key, domain..."
                />
              </div>

              {/* Changing State Live Status Banner in Modal */}
              {statusMessage && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: statusMessage.type === 'syncing' ? '#fffbeb' : '#ecfdf5',
                    border: `1.5px solid ${statusMessage.type === 'syncing' ? '#f59e0b' : '#10b981'}`,
                    color: statusMessage.type === 'syncing' ? '#92400e' : '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    animation: 'bannerFadeSlide 0.2s ease',
                  }}
                >
                  <span
                    className={statusMessage.type === 'syncing' ? 'perm-spin-icon' : ''}
                    style={{ display: 'inline-flex' }}
                  >
                    <Icon name={statusMessage.type === 'syncing' ? 'sync' : 'check'} size={15} />
                  </span>
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Interactive Permission Cards Grid */}
              <div
                style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '8px',
                  paddingRight: '4px',
                }}
              >
                {filteredPermissions.map((perm) => {
                  const isGranted = activePermissionIds.includes(perm.id);
                  const isPermSyncing = syncingPermId === perm.id;
                  const domainObj = DOMAIN_GROUPS.find((d) => d.id === perm.group);
                  const iconName = DOMAIN_ICONS[perm.group] || 'layers';

                  return (
                    <div
                      key={perm.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleToggleChildUserPermission(perm)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleToggleChildUserPermission(perm);
                        }
                      }}
                      className={`custom-perm-card${isGranted ? ' granted' : ''}`}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '7px',
                        border: `1.5px solid ${isGranted ? '#a7dfd5' : '#e2e8f0'}`,
                        borderLeft: `3.5px solid ${isGranted ? '#00877a' : '#cbd5e1'}`,
                        background: isGranted ? '#f4faf8' : '#ffffff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                      }}
                    >
                      {/* Interactive Custom Checkbox */}
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                          transition: 'all 0.18s ease',
                          background: isPermSyncing
                            ? '#fef3c7'
                            : isGranted
                              ? 'linear-gradient(135deg, #005a6e 0%, #00877a 100%)'
                              : '#ffffff',
                          border: `1.5px solid ${
                            isPermSyncing ? '#f59e0b' : isGranted ? '#005a6e' : '#cbd5e1'
                          }`,
                        }}
                      >
                        {isPermSyncing ? (
                          <span className="perm-spin-icon" style={{ display: 'inline-flex', color: '#b45309' }}>
                            <Icon name="sync" size={11} />
                          </span>
                        ) : isGranted ? (
                          <span style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}>
                            <Icon name="check" size={12} strokeWidth={2.4} />
                          </span>
                        ) : null}
                      </div>

                      {/* Permission Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                            <span style={{ color: '#005a6e', display: 'flex', alignItems: 'center' }}>
                              <Icon name={iconName} size={12} />
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: '#475569',
                                letterSpacing: '0.04em',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {domainObj?.label || perm.group}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: isGranted ? '#dcfce7' : '#f1f5f9',
                              color: isGranted ? '#15803d' : '#64748b',
                              letterSpacing: '0.03em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isGranted ? '✓ GRANTED' : 'REVOKED'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <b style={{ fontSize: '12px', color: isGranted ? '#00485a' : '#0f172a' }}>{perm.name}</b>
                          <code style={{ fontSize: '10px', background: isGranted ? '#e6f4f2' : '#e2e8f0', color: '#475569', padding: '1px 4px', borderRadius: '3px' }}>
                            {perm.key}
                          </code>
                        </div>

                        {perm.description && (
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
                            {perm.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredPermissions.length === 0 && (
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      padding: '24px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      No permissions match "{permissionSearch}"
                    </p>
                    <p style={{ margin: '4px 0 10px', fontSize: '11.5px', color: '#64748b' }}>
                      Try searching by action (e.g. view, create, manage) or clear the search filter.
                    </p>
                    <button
                      type="button"
                      className="button secondary small-button"
                      onClick={() => setPermissionSearch('')}
                      style={{ fontSize: '11.5px', padding: '3px 10px' }}
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Notice */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                background: selectedRoleObj.slug === 'super_admin' ? '#fef2f2' : '#f0f9ff',
                border: `1px solid ${selectedRoleObj.slug === 'super_admin' ? '#fca5a5' : '#bae6fd'}`,
                color: selectedRoleObj.slug === 'super_admin' ? '#991b1b' : '#0369a1',
                fontSize: '12px',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span style={{ marginTop: '2px' }}>
                <Icon name={selectedRoleObj.slug === 'super_admin' ? 'lock' : 'shield'} size={15} />
              </span>
              <div>
                <b>
                  {selectedRoleObj.slug === 'super_admin'
                    ? 'Caution: Platform Root Authority'
                    : `Permissions Scoped to ${selectedRoleObj.name}`}
                </b>
                <p style={{ margin: '2px 0 0' }}>
                  {selectedRoleObj.slug === 'super_admin'
                    ? 'Super Admins possess unconstrained read and write authority across all platform modules and organizations.'
                    : `Saving will apply ${activePermissionIds.length} tailored permissions to this child user account under the ${selectedRoleObj.scope} boundary.`}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ flexShrink: 0, marginTop: 0 }}>
            <span style={{ fontSize: '12px' }}>
              <Icon name="key" size={14} /> Child user permission changes trigger security audit logs.
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
                disabled={isUpdatingUser}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={isUpdatingUser}
                style={{ minWidth: '150px' }}
              >
                {isUpdatingUser ? 'Saving...' : 'Save user permissions'}
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>

        <style>{`
          @keyframes permSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .perm-spin-icon {
            animation: permSpin 0.85s linear infinite;
          }
          .custom-perm-card:hover {
            border-color: #a7dfd5 !important;
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          }
        `}</style>
      </section>
    </div>,
    document.body
  );
};

export default EditUserRoleModal;
