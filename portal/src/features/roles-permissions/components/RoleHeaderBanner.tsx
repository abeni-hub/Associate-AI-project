import React from 'react';
import { Icon } from '../../shared';
import type { RoleItem } from '../../../types/portal.types';

export interface RoleHeaderBannerProps {
  activeRole: RoleItem;
  roles: RoleItem[];
  selectedRoleId: string;
  setSelectedRoleId: (id: string) => void;
  isSuperAdmin: boolean;
  canManageRoles: boolean;
  activeRoleDetail: any;
  effectivePermissionIds: number[];
  setEditingRole: (role: any) => void;
  setModalOpen: (open: boolean) => void;
  handleDeleteRole: (role: RoleItem) => void;
  saveStatus: string | null;
  errorStatus: string | null;
}

export const RoleHeaderBanner: React.FC<RoleHeaderBannerProps> = ({
  activeRole,
  roles,
  setSelectedRoleId,
  isSuperAdmin,
  canManageRoles,
  activeRoleDetail,
  effectivePermissionIds,
  setEditingRole,
  setModalOpen,
  handleDeleteRole,
  saveStatus,
  errorStatus,
}) => {
  return (
    <>
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
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: isSuperAdmin ? '#ecfdf5' : '#e8f2ed',
                color: isSuperAdmin ? '#047857' : '#00485a',
              }}
            >
              <Icon name={isSuperAdmin ? 'shield' : 'users'} size={18} />
            </span>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#164a54' }}>
              {activeRole.name}
            </h2>
          </div>
          <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>
            {activeRole.description}
          </p>
        </div>

        {/* Role Selector and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
            }}
          >
            <span>Selected Role:</span>
            <select
              value={String(activeRole.id)}
              onChange={(event) => setSelectedRoleId(event.target.value)}
              style={{
                minHeight: '36px',
                padding: '4px 12px',
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
            <b>Update Synchronized</b>
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
    </>
  );
};

export default RoleHeaderBanner;

