import { useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'

function RoleFormInner({ role, onClose, onSave }) {
  const [name, setName] = useState(role?.name || '')
  const [scope, setScope] = useState(role?.scope || 'Platform')
  const [description, setDescription] = useState(role?.description || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    if (role) {
      onSave({
        ...role,
        name: name.trim(),
        scope,
        description: description.trim() || 'Custom administrative role with tailored access.',
      })
    } else {
      onSave({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: name.trim(),
        scope,
        description: description.trim() || 'Custom administrative role with tailored access.',
        userCount: 0,
        isSystem: false,
        permissions: {
          offices: ['view'],
          accounts: [],
          services: ['view'],
          routes: scope === 'Bureau' ? ['view', 'edit'] : ['view'],
          feedback: ['view', 'status_update'],
          news: scope === 'Platform' || scope === 'Sub-city' ? ['view', 'create', 'edit'] : [],
          cms: scope === 'Platform' ? ['view', 'edit'] : [],
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
          <span className="panel-eyebrow">ACCESS CONTROL</span>
          <h2>{role ? 'Edit custom role' : 'Create custom role'}</h2>
          <p>{role ? 'Update role title, jurisdictional boundary, and operational purpose.' : 'Define a new administrative role with tailored permissions across platform modules.'}</p>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>

      <div className="modal-form-grid">
        <label className="modal-field full">
          <span>Role title <i>*</i></span>
          <input
            required
            placeholder="e.g. Public Communications Officer or Service Auditor"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="modal-field full">
          <span>Organizational boundary scope <i>*</i></span>
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="Platform">Platform-wide (All jurisdictions)</option>
            <option value="Sub-city">Sub-city level</option>
            <option value="Bureau">Bureau / office level</option>
          </select>
        </label>

        <label className="modal-field full">
          <span>Role description & purpose</span>
          <textarea
            rows={3}
            placeholder="Describe what staff assigned to this role will be responsible for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </div>

      <div className="modal-footer">
        <span>
          <Icon name="key" size={14} /> You can customize module permissions after creation.
        </span>
        <div>
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            {role ? 'Save role' : 'Create role'} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </form>
  )
}

function RoleModal({ role, isOpen, onClose, onSave }) {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="modal-card modal-form" role="dialog" aria-modal="true" aria-label={role ? 'Edit custom role' : 'Create custom role'}>
        <RoleFormInner key={role ? role.id : 'new'} role={role} onClose={onClose} onSave={onSave} />
      </section>
    </div>,
    document.body
  )
}

export default RoleModal
