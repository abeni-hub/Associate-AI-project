import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../ui/Icon.jsx';
import { useGetOrganizationTypesQuery } from '../../services/organizationsApi';
import { useGetNavigationItemsQuery, useGetPermissionsQuery } from '../../services/rolesApi';

const DEFAULT_SCOPE_TIERS = [
  {
    id: 'sub_city',
    scope: 'Sub-city',
    label: 'Sub-City Level',
    tier: 'Tier 1',
    desc: 'Administers sub-city jurisdiction and child bureaus',
    icon: 'map',
    defaultNavIds: [1, 2, 4, 6, 7, 8, 9, 10, 12],
  },
  {
    id: 'woreda',
    scope: 'Woreda',
    label: 'Woreda Level',
    tier: 'Tier 2',
    desc: 'Local woreda municipal operations and public queues',
    icon: 'building',
    defaultNavIds: [1, 4, 6, 7, 8, 9, 10],
  },
  {
    id: 'bureau',
    scope: 'Bureau',
    label: 'Bureau Level',
    tier: 'Tier 3',
    desc: 'Sector-specific service desks, guides, and room routes',
    icon: 'layers',
    defaultNavIds: [1, 4, 6, 7, 8, 9],
  },
  {
    id: 'staff',
    scope: 'Staff',
    label: 'Front-line Staff',
    tier: 'Tier 4',
    desc: 'Operational counter operators and service window attendants',
    icon: 'users',
    defaultNavIds: [1, 6, 7, 8],
  },
];

const CANONICAL_MODULES = [
  { id: 1, key: 'overview', name: 'Overview', route: '/admin/overview', icon: 'overview', desc: 'KPI metrics and activity feed' },
  { id: 2, key: 'offices', name: 'Offices & Directory', route: '/admin/subcities', icon: 'building', desc: 'Jurisdictional hierarchy directory' },
  { id: 3, key: 'levels', name: 'Organization Levels', route: '/admin/levels', icon: 'layers', desc: 'Municipal tier hierarchy depth' },
  { id: 4, key: 'accounts', name: 'Accounts & Staff', route: '/admin/accounts', icon: 'users', desc: 'Administrative staff provisioning' },
  { id: 5, key: 'roles', name: 'Roles & Permissions', route: '/admin/roles', icon: 'shield', desc: 'RBAC governance and policy matrix' },
  { id: 6, key: 'services', name: 'Services & Standards', route: '/admin/services', icon: 'file', desc: 'Public service criteria catalog' },
  { id: 7, key: 'routes', name: 'Room Routes & Steps', route: '/admin/routes', icon: 'route', desc: 'Room-by-room visitor directions' },
  { id: 8, key: 'feedback', name: 'Citizen Feedback', route: '/admin/feedback', icon: 'message', desc: 'Citizen complaints & resolution' },
  { id: 9, key: 'qr', name: 'Feedback QR Codes', route: '/admin/qr', icon: 'qr', desc: 'Printable counter feedback QR tokens' },
  { id: 10, key: 'news', name: 'News & Notices', route: '/admin/news', icon: 'news', desc: 'Public announcements & events' },
  { id: 11, key: 'cms', name: 'Landing Page CMS', route: '/admin/cms', icon: 'palette', desc: 'Citizen portal homepage configuration' },
  { id: 12, key: 'activity', name: 'Activity Log', route: '/admin/activity', icon: 'activity', desc: 'Administrative audit trails' },
];

const NAV_ITEM_TO_PERMS = {
  overview: ['dashboard.view'],
  offices: ['organizations.view', 'organizations.create', 'organizations.update'],
  levels: ['organizations.view'],
  accounts: ['users.view', 'users.create', 'users.update'],
  roles: ['roles.view'],
  services: ['services.view', 'services.create', 'services.update'],
  routes: ['service_steps.view', 'service_steps.manage'],
  feedback: ['feedback.view_own', 'feedback.update_status'],
  qr: ['qr_codes.view', 'qr_codes.manage'],
  news: ['news.view', 'news.create', 'news.update', 'events.view', 'events.create'],
  cms: ['cms.manage'],
  activity: ['audit_logs.view'],
};

function RoleFormInner({ role, onClose, onSave, isLoading = false }) {
  const isEditing = Boolean(role?.id);
  const [activeTab, setActiveTab] = useState('details');

  const { data: apiOrgTypes } = useGetOrganizationTypesQuery();
  const { data: apiNavItems } = useGetNavigationItemsQuery();
  const { data: apiPermissions } = useGetPermissionsQuery();

  // Merge backend tiers with defaults
  const scopeTiers = useMemo(() => {
    if (apiOrgTypes?.data && Array.isArray(apiOrgTypes.data) && apiOrgTypes.data.length > 0) {
      return apiOrgTypes.data.map((t) => {
        const canonical = DEFAULT_SCOPE_TIERS.find(
          (d) => d.id === t.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || d.tier.includes(String(t.level))
        );
        return {
          id: t.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          scope: t.name,
          label: `${t.name} Level`,
          tier: `Tier ${t.level}`,
          desc: t.description || `Administers ${t.name} jurisdictional operations`,
          icon: canonical?.icon || 'layers',
          defaultNavIds: canonical?.defaultNavIds || [1, 6, 7, 8],
        };
      });
    }
    return DEFAULT_SCOPE_TIERS;
  }, [apiOrgTypes]);

  // Merge backend navigation items
  const navModules = useMemo(() => {
    if (apiNavItems?.data && Array.isArray(apiNavItems.data) && apiNavItems.data.length > 0) {
      return apiNavItems.data.map((item) => {
        const canonical = CANONICAL_MODULES.find(
          (c) => c.id === Number(item.id) || c.route.toLowerCase() === (item.route || '').toLowerCase()
        );
        return {
          id: Number(item.id),
          key: canonical?.key || item.route?.replace('/admin/', '') || `nav_${item.id}`,
          name: item.label || canonical?.name || `Module ${item.id}`,
          route: item.route || canonical?.route || `/admin/${item.id}`,
          desc: item.description || canonical?.desc || 'Portal module access',
          icon: canonical?.icon || 'layers',
        };
      });
    }
    return CANONICAL_MODULES;
  }, [apiNavItems]);

  const allPermissions = useMemo(() => {
    if (apiPermissions?.data && Array.isArray(apiPermissions.data)) {
      return apiPermissions.data;
    }
    return [];
  }, [apiPermissions]);

  // Form states
  const [name, setName] = useState(role?.name || '');
  const [scope, setScope] = useState(() => {
    const s = role?.scope_level || role?.scope || 'sub_city';
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  });
  const [description, setDescription] = useState(role?.description || '');
  const [selectedNavIds, setSelectedNavIds] = useState(() => {
    if (role?.navigation_item_ids && Array.isArray(role.navigation_item_ids) && role.navigation_item_ids.length > 0) {
      return role.navigation_item_ids.map(Number);
    }
    if (role?.navigation_items && Array.isArray(role.navigation_items) && role.navigation_items.length > 0) {
      return role.navigation_items.map((i) => (typeof i === 'object' ? Number(i.id) : Number(i))).filter(Boolean);
    }
    return DEFAULT_SCOPE_TIERS[0].defaultNavIds;
  });
  const [errorMsg, setErrorMsg] = useState(null);

  // Derived identifier slug
  const slug = useMemo(() => {
    if (role?.slug) return role.slug;
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');
  }, [name, role?.slug]);

  // When changing scope on a new role, auto-load recommended defaults
  const handleScopeSelect = (tierId) => {
    setScope(tierId);
    if (!isEditing) {
      const match = scopeTiers.find((t) => t.id === tierId) || DEFAULT_SCOPE_TIERS[0];
      setSelectedNavIds(match.defaultNavIds);
    }
  };

  const toggleNavModule = (moduleId) => {
    setSelectedNavIds((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSelectAllNav = () => {
    setSelectedNavIds(navModules.map((m) => m.id));
  };

  const handleClearAllNav = () => {
    setSelectedNavIds([]);
  };

  const handleResetScopeDefaults = () => {
    const match = scopeTiers.find((t) => t.id === scope) || DEFAULT_SCOPE_TIERS[0];
    setSelectedNavIds(match.defaultNavIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a role title.');
      setActiveTab('details');
      return;
    }

    if (selectedNavIds.length === 0) {
      setErrorMsg('Please select at least one navigation module for this role.');
      setActiveTab('navigation');
      return;
    }

    setErrorMsg(null);

    // Derive required permissions from selected navigation modules
    const neededKeys = new Set();
    selectedNavIds.forEach((id) => {
      const mod = navModules.find((m) => m.id === id);
      if (mod?.key && NAV_ITEM_TO_PERMS[mod.key]) {
        NAV_ITEM_TO_PERMS[mod.key].forEach((k) => neededKeys.add(k));
      }
    });

    const derivedPermIds = allPermissions
      .filter((p) => neededKeys.has(p.key))
      .map((p) => p.id);

    const chosenTier = scopeTiers.find((t) => t.id === scope) || DEFAULT_SCOPE_TIERS[0];

    const payload = {
      name: name.trim(),
      slug: slug || `role_${Date.now()}`,
      scope: chosenTier.scope,
      scope_level: scope,
      description: description.trim() || `Administrative role for ${chosenTier.label}.`,
      navigation_items: selectedNavIds,
      permission_ids: role?.permission_ids?.length ? role.permission_ids : derivedPermIds,
    };

    if (role?.id) {
      payload.id = role.id;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Save role error in modal:', err);
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save role.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        className="modal-header"
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid #edf1ed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#e8f2ed',
              color: '#00485a',
            }}
          >
            <Icon name={isEditing ? 'shield' : 'plus'} size={20} />
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#164a54' }}>
              {isEditing ? `Edit Role: ${role.name}` : 'Create New Role'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
              {isEditing
                ? 'Update role title, organizational scope, and description.'
                : 'Define role identity and jurisdictional authority level.'}
            </p>
          </div>
        </div>

        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#fcfdfc',
          padding: '0 24px',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          style={{
            padding: '12px 14px',
            border: 'none',
            borderBottom: activeTab === 'details' ? '2.5px solid #00485a' : '2.5px solid transparent',
            background: 'transparent',
            color: activeTab === 'details' ? '#00485a' : '#64748b',
            fontWeight: activeTab === 'details' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Icon name="users" size={15} />
          <span>Role Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('navigation')}
          style={{
            padding: '12px 14px',
            border: 'none',
            borderBottom: activeTab === 'navigation' ? '2.5px solid #00485a' : '2.5px solid transparent',
            background: 'transparent',
            color: activeTab === 'navigation' ? '#00485a' : '#64748b',
            fontWeight: activeTab === 'navigation' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Icon name="layers" size={15} />
          <span>Navigation Modules</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '10px',
              background: activeTab === 'navigation' ? '#e8f2ed' : '#f1f5f9',
              color: activeTab === 'navigation' ? '#00485a' : '#64748b',
            }}
          >
            {selectedNavIds.length}
          </span>
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div
          style={{
            margin: '12px 24px 0',
            padding: '8px 12px',
            borderRadius: '6px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12.5px',
          }}
        >
          <Icon name="close" size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Role Details */}
      {activeTab === 'details' && (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Role Title */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
              Role Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              required
              placeholder="e.g. Public Communications Officer, Sub-City Registrar"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg(null);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                color: '#1e293b',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              autoFocus
            />
            {slug && (
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                System Identifier: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px' }}>{slug}</code>
              </div>
            )}
          </div>

          {/* Scope Level Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
              Organizational Scope Level <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
              {scopeTiers.map((tier) => {
                const isSelected = scope === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => handleScopeSelect(tier.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #00485a' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? '#00485a' : '#1e293b' }}>
                        {tier.label}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: isSelected ? '#dcfce7' : '#f1f5f9',
                          color: isSelected ? '#15803d' : '#64748b',
                        }}
                      >
                        {tier.tier}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.35 }}>
                      {tier.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Description */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
              Operational Responsibilities Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe what personnel holding this role will be responsible for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#1e293b',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Navigation Modules */}
      {activeTab === 'navigation' && (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '440px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Select which portal navigation modules appear in the sidebar for this role:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleResetScopeDefaults}
                style={{ border: 'none', background: 'none', color: '#00485a', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Reset defaults
              </button>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <button
                type="button"
                onClick={handleSelectAllNav}
                style={{ border: 'none', background: 'none', color: '#0369a1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Select all
              </button>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <button
                type="button"
                onClick={handleClearAllNav}
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Module items grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
            {navModules.map((item) => {
              const isChecked = selectedNavIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleNavModule(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: isChecked ? '1.5px solid #00485a' : '1px solid #e2e8f0',
                    background: isChecked ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ cursor: 'pointer', accentColor: '#00485a', width: '15px', height: '15px' }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <b style={{ fontSize: '13px', color: isChecked ? '#00485a' : '#1e293b' }}>
                        {item.name}
                      </b>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.route}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#64748b',
              lineHeight: 1.4,
            }}
          >
            💡 <strong>Note:</strong> Detailed domain permissions can also be fine-tuned at any time on the main page using the live preview and domain tabs.
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="modal-footer"
        style={{
          padding: '14px 24px',
          borderTop: '1px solid #edf1ed',
          background: '#fcfdfc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {selectedNavIds.length} navigation modules active
        </span>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : isEditing
              ? 'Save Changes'
              : 'Create Role'}
          </button>
        </div>
      </div>
    </form>
  );
}

export function RoleModal({ role, isOpen, onClose, onSave, isLoading = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={role ? 'Edit custom role' : 'Create custom role'}
        style={{ maxWidth: '640px', width: '92%', borderRadius: '12px', overflow: 'hidden', padding: 0 }}
      >
        <RoleFormInner
          key={role ? role.id : 'new'}
          role={role}
          onClose={onClose}
          onSave={onSave}
          isLoading={isLoading}
        />
      </section>
    </div>,
    document.body
  );
}

export default RoleModal;
