import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'
import { useGetOrganizationTypesQuery } from '../../services/organizationsApi'

const HIERARCHY_TIERS = [
  {
    scope: 'Platform',
    label: 'Platform-wide (Root)',
    badge: 'Tier 0 · Root',
    badgeTone: '#ecfdf5',
    color: '#047857',
    parentOf: 'Sub-City Admins & Platform Modules',
    reportsTo: 'None (Root Platform Authority)',
    desc: 'Platform-wide administrator with full authority across all modules and sub-cities.',
    icon: 'shield',
  },
  {
    scope: 'Sub-city',
    label: 'Sub-City Level',
    badge: 'Tier 1 · Sub-City',
    badgeTone: '#eff6ff',
    color: '#1d4ed8',
    parentOf: 'Woreda Admins & Sub-City Sector Bureaus',
    reportsTo: 'Platform Super Admin',
    desc: 'Administers own Sub-City jurisdiction and supervises all child Woredas and Bureaus.',
    icon: 'map',
  },
  {
    scope: 'Woreda',
    label: 'Woreda Level',
    badge: 'Tier 2 · Woreda',
    badgeTone: '#f5f3ff',
    color: '#6d28d9',
    parentOf: 'Woreda Bureaus, Service Desks & Local Staff',
    reportsTo: 'Sub-City Admin',
    desc: 'Administers local Woreda municipal operations, public service queues, and citizen desks.',
    icon: 'building',
  },
  {
    scope: 'Bureau',
    label: 'Bureau / Office Level',
    badge: 'Tier 3 · Bureau',
    badgeTone: '#fffbeb',
    color: '#b45309',
    parentOf: 'Operational Front-Desk Staff & Room Clerks',
    reportsTo: 'Sub-City Admin or Woreda Admin',
    desc: 'Supervises sector-specific service workflows, room guides, and operational attendants.',
    icon: 'sitemap',
  },
  {
    scope: 'Staff',
    label: 'Operational Desk Staff',
    badge: 'Tier 4 · Front-line',
    badgeTone: '#f8fafc',
    color: '#475569',
    parentOf: 'Citizen Service Execution (No subordinates)',
    reportsTo: 'Bureau Admin or Woreda Admin',
    desc: 'Front-desk operator receiving citizens, checking documents, and updating room steps.',
    icon: 'activity',
  },
]

export const AVAILABLE_NAV_ITEMS = [
  { id: 'overview', name: 'Overview', desc: 'KPI metrics, service volume charts, and recent activity feed' },
  { id: 'offices', name: 'Offices & Directory', desc: 'Jurisdictional hierarchy, sub-cities, woredas, and bureaus directory' },
  { id: 'levels', name: 'Organization Levels', desc: 'Configure municipal tier levels, hierarchy rank depth, and status' },
  { id: 'accounts', name: 'Accounts & Staff', desc: 'Manage administrative staff accounts and roles' },
  { id: 'roles', name: 'Roles & Permissions', desc: 'Access control policies, security roles, and permission matrix' },
  { id: 'services', name: 'Services & Standards', desc: 'Public service catalog, requirements, and completion tracking' },
  { id: 'feedback', name: 'Citizen Feedback', desc: 'Citizen complaints, ratings, and feedback resolution inbox' },
  { id: 'routes', name: 'Room Routes & Steps', desc: 'Physical room-by-room citizen navigation guides and floor steps' },
  { id: 'qr', name: 'Feedback QR Codes', desc: 'Printable service QR posters and counter rating placards' },
  { id: 'news', name: 'News & Announcements', desc: 'Publish public notices, press releases, and municipal events' },
  { id: 'cms', name: 'Landing Page CMS', desc: 'Configure citizen portal spotlight, hero banner, and FAQs' },
  { id: 'activity', name: 'Activity Log', desc: 'Audit trails and historical administrative event logs' },
]

const getDefaultNavForScope = (scope) => {
  const s = (scope || '').toLowerCase()
  if (s === 'platform') {
    return ['overview', 'offices', 'levels', 'accounts', 'roles', 'services', 'feedback', 'routes', 'qr', 'news', 'cms', 'activity']
  }
  if (s === 'sub-city' || s === 'subcity') {
    return ['overview', 'offices', 'accounts', 'services', 'feedback', 'routes', 'qr', 'news']
  }
  if (s === 'woreda') {
    return ['overview', 'services', 'feedback', 'routes', 'qr', 'news']
  }
  if (s === 'bureau') {
    return ['overview', 'services', 'feedback', 'routes', 'qr']
  }
  return ['overview', 'services', 'feedback', 'routes']
}

function RoleFormInner({ role, onClose, onSave, isLoading = false }) {
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery();

  const hierarchyTiers = useMemo(() => {
    const list = [
      {
        scope: 'Platform',
        label: 'Platform-wide (Root)',
        badge: 'Tier 0 · Root',
        badgeTone: '#ecfdf5',
        color: '#047857',
        parentOf: 'Sub-City Admins & Platform Modules',
        reportsTo: 'None (Root Platform Authority)',
        desc: 'Platform-wide administrator with full authority across all modules and sub-cities.',
        icon: 'shield',
      },
    ];

    if (apiOrgTypes?.data && apiOrgTypes.data.length > 0) {
      apiOrgTypes.data.forEach((t) => {
        list.push({
          scope: t.name,
          label: `${t.name} Level`,
          badge: `Tier ${t.level} · ${t.name}`,
          badgeTone: t.level === 1 ? '#eff6ff' : t.level === 2 ? '#f5f3ff' : '#fffbeb',
          color: t.level === 1 ? '#1d4ed8' : t.level === 2 ? '#6d28d9' : '#b45309',
          parentOf: `Child units under ${t.name}`,
          reportsTo: 'Supervising Tier',
          desc: t.description || `Administers ${t.name} jurisdictional operations.`,
          icon: t.level === 1 ? 'map' : t.level === 2 ? 'building' : 'sitemap',
        });
      });
    } else {
      list.push(
        {
          scope: 'Sub-city',
          label: 'Sub-City Level',
          badge: 'Tier 1 · Sub-City',
          badgeTone: '#eff6ff',
          color: '#1d4ed8',
          parentOf: 'Woreda Admins & Sub-City Sector Bureaus',
          reportsTo: 'Platform Super Admin',
          desc: 'Administers own Sub-City jurisdiction and supervises all child Woredas and Bureaus.',
          icon: 'map',
        },
        {
          scope: 'Woreda',
          label: 'Woreda Level',
          badge: 'Tier 2 · Woreda',
          badgeTone: '#f5f3ff',
          color: '#6d28d9',
          parentOf: 'Woreda Bureaus, Service Desks & Local Staff',
          reportsTo: 'Sub-City Admin',
          desc: 'Administers local Woreda municipal operations, public service queues, and citizen desks.',
          icon: 'building',
        },
        {
          scope: 'Bureau',
          label: 'Bureau / Office Level',
          badge: 'Tier 3 · Bureau',
          badgeTone: '#fffbeb',
          color: '#b45309',
          parentOf: 'Operational Front-Desk Staff & Room Clerks',
          reportsTo: 'Sub-City Admin or Woreda Admin',
          desc: 'Supervises sector-specific service workflows, room guides, and operational attendants.',
          icon: 'sitemap',
        }
      );
    }

    list.push({
      scope: 'Staff',
      label: 'Operational Desk Staff',
      badge: 'Tier 4 · Front-line',
      badgeTone: '#f8fafc',
      color: '#475569',
      parentOf: 'Citizen Service Execution (No subordinates)',
      reportsTo: 'Bureau Admin or Woreda Admin',
      desc: 'Front-desk operator receiving citizens, checking documents, and updating room steps.',
      icon: 'activity',
    });

    return list;
  }, [apiOrgTypes]);

  const [step, setStep] = useState(1)
  const [name, setName] = useState(role?.name || '')
  const [scope, setScope] = useState(role?.scope || 'Platform')
  const [description, setDescription] = useState(role?.description || '')
  const [selectedNavItems, setSelectedNavItems] = useState(
    role?.navigationItems ||
      role?.dashboard_pages ||
      role?.pages ||
      getDefaultNavForScope(role?.scope || 'Platform')
  )
  const [errorMsg, setErrorMsg] = useState(null)

  const currentTier = hierarchyTiers.find((t) => t.scope.toLowerCase() === scope.toLowerCase()) || hierarchyTiers[0]

  const handleScopeChange = (newScope) => {
    setScope(newScope)
    if (!role) {
      setSelectedNavItems(getDefaultNavForScope(newScope))
    }
  }

  const handleNext = (e) => {
    if (e) e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Role title is required.')
      return
    }
    setErrorMsg(null)
    setStep(2)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step === 1) {
      handleNext(e)
      return
    }

    if (selectedNavItems.length === 0) {
      setErrorMsg('Please select at least one navigation item.')
      return
    }

    setErrorMsg(null)

    if (role) {
      onSave({
        ...role,
        name: name.trim(),
        scope,
        description: description.trim() || 'Custom administrative role with tailored access.',
        navigationItems: selectedNavItems,
        dashboard_pages: selectedNavItems,
      })
    } else {
      const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
      onSave({
        id: generatedId || `role_${Date.now()}`,
        name: name.trim(),
        slug: generatedId,
        scope,
        description: description.trim() || 'Custom administrative role with tailored access.',
        userCount: 0,
        isSystem: false,
        navigationItems: selectedNavItems,
        dashboard_pages: selectedNavItems,
        permissions: {
          offices: ['view'],
          accounts: scope === 'Platform' || scope === 'Sub-city' ? ['view'] : [],
          services: ['view'],
          routes: scope === 'Bureau' || scope === 'Woreda' ? ['view', 'edit'] : ['view'],
          feedback: ['view', 'status_update'],
          news: scope === 'Platform' || scope === 'Sub-city' ? ['view', 'create', 'edit'] : ['view'],
          cms: scope === 'Platform' ? ['view'] : [],
          roles: [],
        },
      })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">
            ACCESS CONTROL & GOVERNANCE • STEP {step} OF 2
          </span>
          <h2>
            {step === 1
              ? (role ? 'Edit custom role' : 'Create new administrative role')
              : 'Configure Navigation Items'}
          </h2>
          <p>
            {step === 1
              ? (role
                  ? 'Update role title, jurisdictional boundary, and operational purpose.'
                  : 'Define a new administrative role with tailored permissions and organizational hierarchy.')
              : `Select the sidebar navigation items and modules visible to personnel with ${name ? `the "${name}"` : 'this'} role.`}
          </p>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            margin: '0.75rem 1.5rem 0',
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
          <Icon name="close" size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 1 ? (
        <div className="modal-form-grid" style={{ padding: '1.25rem 1.5rem' }}>
          <label className="modal-field full">
            <span>Role title <i>*</i></span>
            <input
              required
              placeholder="e.g. Public Communications Officer, Sub-City Auditor, or Woreda Registrar"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrorMsg(null)
              }}
            />
          </label>

          <label className="modal-field full">
            <span>Organizational boundary scope <i>*</i></span>
            <select value={scope} onChange={(e) => handleScopeChange(e.target.value)}>
              {hierarchyTiers.map((tier) => (
                <option key={tier.scope} value={tier.scope}>
                  {tier.label}
                </option>
              ))}
            </select>
          </label>

          {/* INTERACTIVE HIERARCHY CARD: "Who is parent of who" */}
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="sitemap" size={15} /> Administrative Hierarchy & Reporting Lines
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: currentTier.badgeTone,
                  color: currentTier.color,
                  border: `1px solid ${currentTier.color}30`,
                }}
              >
                {currentTier.badge}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#ffffff',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <small style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  DIRECT PARENT (REPORTS TO)
                </small>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#0284c7' }}>&uarr;</span> {currentTier.reportsTo}
                </div>
              </div>
              <div>
                <small style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  PARENT OF (MANAGES & SUPERVISES)
                </small>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#16a34a' }}>&darr;</span> {currentTier.parentOf}
                </div>
              </div>
            </div>

            {/* Complete dynamic chain visualization */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '11px' }}>
              {hierarchyTiers.map((tier, idx) => {
                const isSelected = tier.scope.toLowerCase() === scope.toLowerCase()
                return (
                  <div key={tier.scope} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      onClick={() => handleScopeChange(tier.scope)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: isSelected ? '#164a54' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #164a54' : '1px solid #e2e8f0',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {tier.label.split(' ')[0]}
                    </span>
                    {idx < hierarchyTiers.length - 1 && <span style={{ color: '#94a3b8' }}>&rarr;</span>}
                  </div>
                )
              })}
            </div>

            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
              {currentTier.desc}
            </p>
          </div>

          <label className="modal-field full">
            <span>Role description & operational purpose</span>
            <textarea
              rows={3}
              placeholder="Describe what personnel assigned to this role will be responsible for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
      ) : (
        /* Step 2: Navigation Items Selection */
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Available Navigation Items ({selectedNavItems.length} selected)
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                style={{ border: 'none', background: 'none', color: '#0369a1', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSelectedNavItems(AVAILABLE_NAV_ITEMS.map((p) => p.id))}
              >
                Select all
              </button>
              <button
                type="button"
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSelectedNavItems([])}
              >
                Clear all
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {AVAILABLE_NAV_ITEMS.map((page) => {
              const isChecked = selectedNavItems.includes(page.id)
              return (
                <label
                  key={page.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: isChecked ? '1.5px solid #047857' : '1px solid #e2e8f0',
                    background: isChecked ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNavItems((prev) => [...prev, page.id])
                      } else {
                        setSelectedNavItems((prev) => prev.filter((id) => id !== page.id))
                      }
                      setErrorMsg(null)
                    }}
                    style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#047857', width: '16px', height: '16px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a', display: 'block' }}>
                      {page.name}
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.35 }}>
                      {page.desc}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div className="modal-footer">
        {step === 1 ? (
          <>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Step 1 of 2: Role definition & scope
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="button primary" onClick={handleNext}>
                Next <Icon name="arrow" size={15} />
              </button>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="button secondary" onClick={() => setStep(1)}>
              <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
                <Icon name="arrow" size={15} />
              </span>{' '}
              Back
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : (role ? 'Save role changes' : 'Create role')} <Icon name="arrow" size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  )
}

function RoleModal({ role, isOpen, onClose, onSave, isLoading = false }) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="modal-overlay"
      /* Clicks outside the dialog deliberately do not close the modal */
    >
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={role ? 'Edit custom role' : 'Create custom role'}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <RoleFormInner key={role ? role.id : 'new'} role={role} onClose={onClose} onSave={onSave} isLoading={isLoading} />
      </section>
    </div>,
    document.body
  )
}

export default RoleModal
