import { useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'

function OfficeFormInner({ office, officeTypes, eligibleParents, onClose, onSave }) {
  const [name, setName] = useState(office?.name || '')
  const [typeId, setTypeId] = useState(office?.typeId || officeTypes[0]?.id || 1)
  const [parentId, setParentId] = useState(office?.parentId !== null && office?.parentId !== undefined ? String(office.parentId) : '')
  const [admin, setAdmin] = useState(office?.admin || '')
  const [status, setStatus] = useState(office?.status || 'Active')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      id: office?.id || Date.now(),
      name: name.trim(),
      typeId: Number(typeId),
      parentId: parentId ? Number(parentId) : null,
      admin: admin.trim() || 'Unassigned',
      services: office?.services ?? 0,
      completion: office?.completion ?? (status === 'Active' ? 85 : status === 'Setup' ? 30 : 50),
      status,
      updated: 'Just now',
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">HIERARCHICAL DIRECTORY</span>
          <h2>{office ? 'Edit office' : 'Create new office'}</h2>
          <p>Configure administrative level, parent jurisdiction, and lead administrator.</p>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>

      <div className="modal-form-grid">
        <label className="modal-field full">
          <span>Office or bureau name <i>*</i></span>
          <input
            required
            placeholder="e.g. Revenues Bureau or Bole Sub-city"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Office classification type <i>*</i></span>
          <select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            {officeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Level {t.level})
              </option>
            ))}
          </select>
        </label>

        <label className="modal-field">
          <span>Parent administrative jurisdiction</span>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">None (Top-level administration)</option>
            {eligibleParents.map((p) => {
              const typeName = officeTypes.find((t) => t.id === p.typeId)?.name || 'Office'
              return (
                <option key={p.id} value={p.id}>
                  {p.name} · {typeName}
                </option>
              )
            })}
          </select>
        </label>

        <label className="modal-field">
          <span>Administrator name <i>*</i></span>
          <input
            required
            placeholder="Full name of assigned administrator"
            value={admin}
            onChange={(e) => setAdmin(e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Operational status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Setup">Setup</option>
            <option value="Needs attention">Needs attention</option>
          </select>
        </label>
      </div>

      <div className="modal-footer">
        <span>
          <Icon name="sitemap" size={14} /> Offices inherit organizational scope.
        </span>
        <div>
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            {office ? 'Save changes' : 'Create office'} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </form>
  )
}

function OfficeModal({ office, officeTypes, offices, isOpen, onClose, onSave }) {
  if (!isOpen) return null

  const eligibleParents = offices.filter((o) => !office || o.id !== office.id)

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="modal-card modal-form" role="dialog" aria-modal="true" aria-label={office ? 'Edit office' : 'Create new office'}>
        <OfficeFormInner
          key={office ? String(office.id) : 'new'}
          office={office}
          officeTypes={officeTypes}
          eligibleParents={eligibleParents}
          onClose={onClose}
          onSave={onSave}
        />
      </section>
    </div>,
    document.body
  )
}

export default OfficeModal
