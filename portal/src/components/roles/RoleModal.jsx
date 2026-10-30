import { useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'

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

function RoleFormInner({ role, onClose, onSave }) {
  const [name, setName] = useState(role?.name || '')
  const [scope, setScope] = useState(role?.scope || 'Platform')
  const [description, setDescription] = useState(role?.description || '')
  const [errorMsg, setErrorMsg] = useState(null)

  const currentTier = HIERARCHY_TIERS.find((t) => t.scope.toLowerCase() === scope.toLowerCase()) || HIERARCHY_TIERS[0]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Role title is required.')
      return
    }

    setErrorMsg(null)

    if (role) {
      onSave({
        ...role,
        name: name.trim(),
        scope,
        description: description.trim() || 'Custom administrative role with tailored access.',
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
          <span className="panel-eyebrow">ACCESS CONTROL & GOVERNANCE</span>
          <h2>{role ? 'Edit custom role' : 'Create new administrative role'}</h2>
          <p>{role ? 'Update role title, jurisdictional boundary, and operational purpose.' : 'Define a new administrative role with tailored permissions and organizational hierarchy.'}</p>
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
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="Platform">Platform-wide (All jurisdictions — Root)</option>
            <option value="Sub-city">Sub-city level (Child of Platform, Parent of Woredas)</option>
            <option value="Woreda">Woreda level (Child of Sub-City, Parent of Bureaus)</option>
            <option value="Bureau">Bureau / office level (Child of Woreda/Sub-City)</option>
            <option value="Staff">Operational desk staff (Front-line clerk)</option>
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

          {/* Complete 5-tier chain visualization */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '11px' }}>
            {HIERARCHY_TIERS.map((tier, idx) => {
              const isSelected = tier.scope.toLowerCase() === scope.toLowerCase()
              return (
                <div key={tier.scope} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    onClick={() => setScope(tier.scope)}
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
                  {idx < HIERARCHY_TIERS.length - 1 && <span style={{ color: '#94a3b8' }}>&rarr;</span>}
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

      <div className="modal-footer">
        <span>
          <Icon name="key" size={14} /> You can customize fine-grained module permissions immediately after creation.
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            {role ? 'Save role changes' : 'Create role'} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </form>
  )
}

function RoleModal({ role, isOpen, onClose, onSave }) {
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
        <RoleFormInner key={role ? role.id : 'new'} role={role} onClose={onClose} onSave={onSave} />
      </section>
    </div>,
    document.body
  )
}

export default RoleModal
