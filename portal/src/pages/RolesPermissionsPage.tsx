import React, { useState } from 'react';
import { Icon } from '../components/shared/Icon';
import { PageHeading } from '../components/shared/PageHeading';
import RoleModal from '../components/roles/RoleModal';
import { INITIAL_ROLES } from '../data/portalData';
import type { RoleItem } from '../types/portal.types';

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

export interface RolesPermissionsPageProps {
  roles?: RoleItem[];
  onUpdateRolePermissions?: (roleId: string, moduleId: string, actions: string[]) => void;
  onCreateRole?: (role: RoleItem) => void;
  onUpdateRole?: (role: RoleItem) => void;
}

export const RolesPermissionsPage: React.FC<RolesPermissionsPageProps> = ({
  roles: propRoles,
  onUpdateRolePermissions,
  onCreateRole,
  onUpdateRole,
}) => {
  const [internalRoles, setInternalRoles] = useState<RoleItem[]>(propRoles || INITIAL_ROLES);
  const roles = propRoles || internalRoles;

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'super');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  const activeRole = roles.find((r: RoleItem) => r.id === selectedRoleId) || roles[0];

  const handleToggle = (moduleId: string, action: string) => {
    if (activeRole.isSystem) return;
    const currentActions = activeRole.permissions[moduleId] || [];
    const hasAction = currentActions.includes(action);
    const newActions = hasAction
      ? currentActions.filter((a: string) => a !== action)
      : [...currentActions, action];

    if (onUpdateRolePermissions) {
      onUpdateRolePermissions(activeRole.id, moduleId, newActions);
    } else {
      setInternalRoles((prev) =>
        prev.map((item) =>
          item.id === activeRole.id
            ? {
                ...item,
                permissions: {
                  ...item.permissions,
                  [moduleId]: newActions,
                },
              }
            : item
        )
      );
    }
  };

  const handleSaveRole = (saved: any) => {
    if (editingRole) {
      if (onUpdateRole) {
        onUpdateRole(saved);
      } else {
        setInternalRoles((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
      }
    } else {
      if (onCreateRole) {
        onCreateRole(saved);
      } else {
        setInternalRoles((prev) => [...prev, saved]);
      }
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="SECURITY & ACCESS GOVERNANCE"
        title="Roles & permissions"
        subtitle="Define access control policies, module capabilities, and customized role permissions."
        action="Create custom role"
        onAction={() => {
          setEditingRole(null);
          setModalOpen(true);
        }}
        secondary="Export audit log"
        onSecondary={() => window.alert('Role permissions audit log exported.')}
      />

      {/* Permissions Matrix Panel */}
      <section className="panel table-panel permissions-matrix-panel">
        <div className="table-toolbar">
          <div>
            <h2>Permissions matrix: {activeRole.name}</h2>
            <p>{activeRole.description}</p>
          </div>
          <div className="toolbar-tools permissions-toolbar-tools">
            <label className="role-picker-control">
              <span>Role</span>
              <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)}>
                {roles.map((role: RoleItem) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
            <span className="role-scope-indicator">
              <Icon name="shield" size={14} /> Scope: <strong>{activeRole.scope}</strong>
            </span>
            {!activeRole.isSystem && (
              <button
                type="button"
                className="button secondary small-button"
                onClick={() => {
                  setEditingRole(activeRole);
                  setModalOpen(true);
                }}
              >
                Edit role details
              </button>
            )}
          </div>
        </div>

        {activeRole.isSystem && (
          <div className="tip-banner inline-tip" style={{ margin: '0.75rem 1.25rem' }}>
            <span className="tip-icon">
              <Icon name="lock" size={16} />
            </span>
            <span>
              <b>Protected core role</b>
              <small>
                Permissions for default system roles are fixed to maintain platform integrity. Create a
                custom role to configure tailored access.
              </small>
            </span>
          </div>
        )}

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
                const roleActions = activeRole.permissions[module.id] || [];

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

                      if (activeRole.isSystem) {
                        return (
                          <td key={col.id} style={{ textAlign: 'center' }}>
                            {isGranted ? (
                              <span
                                className="perm-status-icon granted"
                                role="img"
                                aria-label="Granted"
                                title="Permission granted"
                              >
                                <Icon name="check" size={15} />
                              </span>
                            ) : (
                              <span
                                className="perm-status-icon denied"
                                role="img"
                                aria-label="Not granted"
                                title="No permission"
                              >
                                <Icon name="close" size={13} />
                              </span>
                            )}
                          </td>
                        );
                      }

                      return (
                        <td key={col.id} style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={`perm-toggle-btn${isGranted ? ' granted' : ''}`}
                            onClick={() => handleToggle(module.id, col.id)}
                            aria-pressed={isGranted}
                            title={isGranted ? 'Permission granted' : 'Permission not granted'}
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

        <div className="table-footer">
          <span>
            Policy: <strong>{activeRole.name}</strong> · Governed by Least Privilege Access standard
          </span>
          <button
            type="button"
            className="button secondary small-button"
            onClick={() => window.alert('Role configuration policy verified.')}
          >
            Verify policy
          </button>
        </div>
      </section>

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
