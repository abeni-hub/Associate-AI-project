import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { SearchSelect, type SearchSelectOption } from '../shared/SearchSelect';
import { useGetRolesQuery } from '../../services/rolesApi';
import { useGetOrganizationsQuery } from '../../services/organizationsApi';

export interface AccountModalProps {
  account?: any;
  roles?: any[];
  organizations?: any[];
  isOpen: boolean;
  onClose: () => void;
  onSave?: (saved: any) => void;
}

const slugifyUsername = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9._-]+/g, '.').replace(/(^\.|\.$)/g, '');

export const AccountModal: React.FC<AccountModalProps> = ({
  account,
  roles: propRoles,
  organizations: propOrganizations,
  isOpen,
  onClose,
  onSave,
}) => {
  const { data: apiRoles } = useGetRolesQuery(undefined, { skip: !isOpen });
  const { data: apiOrgs } = useGetOrganizationsQuery(undefined, { skip: !isOpen });

  // Form states strictly matching users table schema
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form state when opening or switching account
  useEffect(() => {
    if (isOpen) {
      setName(account?.name || '');
      setUsername(account?.username || (account?.name ? slugifyUsername(account.name) : ''));
      setEmail(account?.email || '');
      setPassword('');
      setPhone(account?.phone || '');

      const isAccountSuperAdmin =
        account?.role === 'Super Admin' ||
        Number(account?.role_id) === 1 ||
        account?.role?.slug === 'super_admin';

      const initialOrgId = isAccountSuperAdmin
        ? 0
        : account?.organization_id ?? account?.organization?.id ?? null;
      setOrganizationId(initialOrgId);

      const initialRoleId = account?.role_id
        ? Number(account.role_id)
        : account?.role?.id
          ? Number(account.role.id)
          : isAccountSuperAdmin
            ? 1
            : account?.role === 'Sub-City Admin'
              ? 2
              : account?.role === 'Woreda Admin'
                ? 3
                : account?.role === 'Bureau Admin'
                  ? 4
                  : account?.role === 'Staff'
                    ? 5
                    : null;
      setRoleId(initialRoleId);

      setStatus(account?.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active');
      setErrorMsg(null);
    }
  }, [isOpen, account]);

  // Organization options (Global Platform + Statutory Org Hierarchy)
  const organizationOptions: SearchSelectOption[] = useMemo(() => {
    const orgsList: any[] = propOrganizations?.length ? propOrganizations : apiOrgs?.data || [];
    return [
      {
        value: 0,
        label: 'None (Global Platform Administrator)',
        code: 'global',
        badge: 'Global',
        badgeTone: 'gold',
        secondary: 'Platform-wide authority without organizational boundary (Super Admin).',
      },
      ...orgsList.map((org: any) => ({
        value: org.id,
        label: org.name,
        code: org.code,
        badge: org.organization_type_id === 1 ? 'Sub-City' : org.organization_type_id === 2 ? 'Woreda' : 'Bureau',
        badgeTone: org.organization_type_id === 1 ? 'sage' : org.organization_type_id === 2 ? 'blue' : 'gold',
        secondary: org.address || `${org.code} jurisdictional office`,
      })),
    ];
  }, [propOrganizations, apiOrgs]);

  // Look up selected organization metadata to contextualize roles
  const selectedOrg = useMemo(() => {
    if (organizationId === null || organizationId === 0) return null;
    const orgsList: any[] = propOrganizations?.length ? propOrganizations : apiOrgs?.data || [];
    return orgsList.find((o: any) => o.id === Number(organizationId)) || null;
  }, [organizationId, propOrganizations, apiOrgs]);

  // Filter roles dynamically based on selected organization
  const filteredRoleOptions: SearchSelectOption[] = useMemo(() => {
    if (organizationId === null || organizationId === undefined) {
      return [];
    }

    const rawRoles: any[] = propRoles?.length ? propRoles : apiRoles?.data || [
      { id: 1, name: 'Super Admin', slug: 'super_admin', description: 'Platform-wide authority with unrestricted access.' },
      { id: 2, name: 'Sub-City Admin', slug: 'sub_city_admin', description: 'Sub-City administrator managing own unit and descendants.' },
      { id: 3, name: 'Woreda Admin', slug: 'woreda_admin', description: 'Woreda administrator managing local municipal unit.' },
      { id: 4, name: 'Bureau Admin', slug: 'bureau_admin', description: 'Bureau administrator managing sectoral staff and workflows.' },
      { id: 5, name: 'Staff', slug: 'staff', description: 'Operational government staff member.' },
    ];

    let allowed: any[] = [];
    if (Number(organizationId) === 0) {
      allowed = rawRoles.filter((r) => r.slug === 'super_admin' || r.id === 1);
    } else if (selectedOrg?.organization_type_id === 1) {
      // Sub-City
      allowed = rawRoles.filter((r) => r.slug === 'sub_city_admin' || r.slug === 'staff' || r.id === 2 || r.id === 5);
    } else if (selectedOrg?.organization_type_id === 2) {
      // Woreda
      allowed = rawRoles.filter((r) => r.slug === 'woreda_admin' || r.slug === 'staff' || r.id === 3 || r.id === 5);
    } else if (selectedOrg?.organization_type_id === 3) {
      // Bureau
      allowed = rawRoles.filter((r) => r.slug === 'bureau_admin' || r.slug === 'staff' || r.id === 4 || r.id === 5);
    } else {
      // Fallback for custom organizations
      allowed = rawRoles.filter((r) => r.slug !== 'super_admin' && r.id !== 1);
    }

    return allowed.map((r: any) => ({
      value: r.id,
      label: r.name,
      code: r.slug,
      badge: r.slug === 'super_admin' ? 'global' : r.slug === 'sub_city_admin' ? 'sub_city' : r.slug === 'woreda_admin' ? 'woreda' : 'bureau',
      badgeTone: r.slug === 'super_admin' ? 'gold' : r.slug === 'sub_city_admin' ? 'sage' : r.slug === 'woreda_admin' ? 'blue' : 'gray',
      secondary: r.description,
    }));
  }, [organizationId, selectedOrg, propRoles, apiRoles]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!account) setUsername(slugifyUsername(val));
  };

  const handleOrganizationSelect = (val: string | number | null) => {
    const nextOrgId = val !== null && val !== undefined ? Number(val) : null;
    setOrganizationId(nextOrgId);
    setErrorMsg(null);

    const rawRoles: any[] = propRoles?.length ? propRoles : apiRoles?.data || [];

    if (nextOrgId === 0) {
      const superRole = rawRoles.find((r: any) => r.slug === 'super_admin') || { id: 1 };
      setRoleId(superRole.id);
    } else if (nextOrgId !== null) {
      const orgsList: any[] = propOrganizations?.length ? propOrganizations : apiOrgs?.data || [];
      const targetOrg = orgsList.find((o: any) => o.id === nextOrgId);
      if (targetOrg?.organization_type_id === 1) {
        const role = rawRoles.find((r: any) => r.slug === 'sub_city_admin') || { id: 2 };
        setRoleId(role.id);
      } else if (targetOrg?.organization_type_id === 2) {
        const role = rawRoles.find((r: any) => r.slug === 'woreda_admin') || { id: 3 };
        setRoleId(role.id);
      } else if (targetOrg?.organization_type_id === 3) {
        const role = rawRoles.find((r: any) => r.slug === 'bureau_admin') || { id: 4 };
        setRoleId(role.id);
      } else {
        const defaultRole = rawRoles.find((r: any) => r.slug !== 'super_admin') || { id: 5 };
        setRoleId(defaultRole.id);
      }
    } else {
      setRoleId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Full name is required.');
    if (!username.trim()) return setErrorMsg('Username is required.');
    if (!email.trim()) return setErrorMsg('Email address is required.');
    if (!account && !password.trim()) {
      return setErrorMsg('Initial password is required for new accounts (minimum 8 characters).');
    }
    if (password.trim() && password.trim().length < 8) {
      return setErrorMsg('Password must be at least 8 characters long.');
    }
    if (organizationId === null || organizationId === undefined) {
      return setErrorMsg('Please select an organization (or Global Platform) first.');
    }
    if (!roleId) {
      return setErrorMsg('Please select an administrative role.');
    }

    const isGlobal = Number(organizationId) === 0 || Number(roleId) === 1;

    const payload = {
      ...(account?.id ? { id: account.id } : {}),
      name: name.trim(),
      username: username.toLowerCase().trim().replace(/[^a-zA-Z0-9._-]/g, ''),
      email: email.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
      phone: phone.trim() || null,
      role_id: Number(roleId),
      organization_id: isGlobal ? null : Number(organizationId),
      status,
    };

    onSave?.(payload);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={account ? 'Edit administrator account' : 'Create administrator account'}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <span className="panel-eyebrow">ACCESS & PERMISSIONS</span>
              <h2>{account ? 'Edit account' : 'Create account'}</h2>
              <p>Assign administrative authority and link workspace organization.</p>
            </div>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
              <Icon name="close" />
            </button>
          </div>

          {errorMsg && (
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
              }}
            >
              <Icon name="close" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="modal-form-grid" style={{ padding: '1.25rem 1.5rem' }}>
            {/* 1. Organization Assignment (Selected First) */}
            <div className="modal-field full">
              <SearchSelect
                label="Assigned Organization"
                required
                value={organizationId}
                onChange={handleOrganizationSelect}
                options={organizationOptions}
                placeholder="Search & select organization or Global Platform..."
                helperText={
                  organizationId === 0
                    ? 'Global Platform provides platform-wide administration across all organizations.'
                    : selectedOrg
                      ? `Selected ${selectedOrg.organization_type_id === 1 ? 'Sub-City' : selectedOrg.organization_type_id === 2 ? 'Woreda' : 'Bureau'}: ${selectedOrg.name}`
                      : 'Choose an organization to unlock applicable administrative roles.'
                }
              />
            </div>

            {/* 2. Administrative Role (Selected Second, filtered by organization) */}
            <div className="modal-field full">
              <SearchSelect
                label="Administrative Role"
                required
                value={roleId}
                onChange={(val) => {
                  setRoleId(val ? Number(val) : null);
                  setErrorMsg(null);
                }}
                options={filteredRoleOptions}
                disabled={organizationId === null || organizationId === undefined}
                placeholder={
                  organizationId === null || organizationId === undefined
                    ? 'Select an organization first...'
                    : 'Select role for this organization...'
                }
                helperText={
                  organizationId === null || organizationId === undefined
                    ? 'Select an organization above to view its permitted administrative roles.'
                    : undefined
                }
              />
            </div>

            {/* Full Name */}
            <label className="modal-field">
              <span>Full name <i>*</i></span>
              <input
                required
                placeholder="e.g. Sofia Lemma"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            {/* Username */}
            <label className="modal-field">
              <span>Username <i>*</i></span>
              <input
                required
                placeholder="e.g. sofia.lemma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            {/* Email */}
            <label className="modal-field">
              <span>Work email <i>*</i></span>
              <input
                required
                type="email"
                placeholder="sofia@admin.gov.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {/* Phone */}
            <label className="modal-field">
              <span>Phone number</span>
              <input
                type="tel"
                placeholder="+251 91 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            {/* Password */}
            <label className="modal-field">
              <span>
                {account ? 'New password (optional)' : 'Initial password'} <i>{!account && '*'}</i>
              </span>
              <input
                type="password"
                placeholder={account ? 'Leave blank to keep current' : 'Min 8 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!account}
              />
            </label>

            {/* Status */}
            <label className="modal-field">
              <span>Account status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="modal-footer">
            <span />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button primary">
                {account ? 'Save changes' : 'Create account'} <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default AccountModal;
