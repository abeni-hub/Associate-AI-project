import { useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'
import { getOfficeSubcityId } from './officeHierarchy.js'

function defaultParentTypeId(typeId, officeTypes) {
  const officeType = officeTypes.find((type) => type.id === Number(typeId))
  return officeTypes
    .filter((type) => officeType && type.level < officeType.level)
    .sort((first, second) => second.level - first.level)[0]?.id || ''
}

function OfficeFormInner({ office, officeTypes, offices, onClose, onSave }) {
  const initialTypeId = office?.typeId || officeTypes[0]?.id || 1
  const currentParent = offices.find((entry) => entry.id === office?.parentId)
  const initialParentTypeId = office?.parentTypeId ?? currentParent?.typeId ?? defaultParentTypeId(initialTypeId, officeTypes)
  const [name, setName] = useState(office?.name || '')
  const [typeId, setTypeId] = useState(initialTypeId)
  const [subcityId, setSubcityId] = useState(office ? getOfficeSubcityId(office, offices) || '' : '')
  const [parentTypeId, setParentTypeId] = useState(initialParentTypeId ? String(initialParentTypeId) : '')
  const [admin, setAdmin] = useState(office?.admin || '')
  const [status, setStatus] = useState(office?.status === 'Inactive' ? 'Inactive' : 'Active')

  const selectedType = officeTypes.find((type) => type.id === Number(typeId))
  const parentTypes = officeTypes.filter((type) => selectedType && type.level < selectedType.level)
  const subcities = offices.filter((entry) => entry.typeId === 1)

  const handleTypeChange = (event) => {
    const nextTypeId = event.target.value
    setTypeId(nextTypeId)
    setParentTypeId(String(defaultParentTypeId(nextTypeId, officeTypes)))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!name.trim()) return

    const parentType = parentTypes.find((type) => type.id === Number(parentTypeId))
    const selectedSubcity = subcities.find((entry) => entry.id === Number(subcityId))
    const isSubcity = selectedType?.level === 1
    if (!isSubcity && (!selectedSubcity || !parentType)) return

    const existingParent = offices.find((entry) => entry.id === office?.parentId)
    const sameSubcity = office && getOfficeSubcityId(office, offices) === selectedSubcity?.id
    const resolvedParent = parentType?.id === 1
      ? selectedSubcity
      : office && sameSubcity && existingParent?.typeId === parentType?.id
        ? existingParent
        : null

    onSave({
      id: office?.id || Date.now(),
      name: name.trim(),
      typeId: Number(typeId),
      subcityId: isSubcity ? null : selectedSubcity.id,
      parentTypeId: parentType?.id || null,
      parentId: resolvedParent?.id ?? null,
      admin: admin.trim() || 'Unassigned',
      services: office?.services ?? 0,
      completion: office?.completion ?? (status === 'Active' ? 85 : 50),
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
          <p>Set its classification, sub-city, and parent office level.</p>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>

      <div className="modal-form-grid">
        <label className="modal-field">
          <span>Office or bureau name <i>*</i></span>
          <input
            required
            placeholder="e.g. Revenues Bureau or Bole Sub-city"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Office classification type <i>*</i></span>
          <select value={typeId} onChange={handleTypeChange} required>
            {officeTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name} (Level {type.level})</option>
            ))}
          </select>
        </label>

        {selectedType?.level > 1 ? <>
          <label className="modal-field">
            <span>Sub-city this office belongs to <i>*</i></span>
            <select value={subcityId} onChange={(event) => setSubcityId(event.target.value)} required>
              <option value="">Select a sub-city</option>
              {subcities.map((subcity) => <option key={subcity.id} value={subcity.id}>{subcity.name}</option>)}
            </select>
          </label>

          <label className="modal-field">
            <span>Parent office level <i>*</i></span>
            <select value={parentTypeId} onChange={(event) => setParentTypeId(event.target.value)} required>
              <option value="">Select a parent level</option>
              {parentTypes.map((parentType) => <option key={parentType.id} value={parentType.id}>{parentType.name}</option>)}
            </select>
          </label>
        </> : <div className="office-top-level-note">
          <Icon name="map" size={16} />
          <span>A sub-city is a top-level office. Choose it as the parent level for the bureaus and offices within it.</span>
        </div>}

        <label className="modal-field">
          <span>Administrator name <i>*</i></span>
          <input
            required
            placeholder="Full name of assigned administrator"
            value={admin}
            onChange={(event) => setAdmin(event.target.value)}
          />
        </label>

        <label className="modal-field">
          <span>Office status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="modal-footer">
        <span><Icon name="sitemap" size={14} /> Offices inherit organizational scope.</span>
        <div>
          <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button primary">{office ? 'Save changes' : 'Create office'} <Icon name="arrow" size={15} /></button>
        </div>
      </div>
    </form>
  )
}

function OfficeModal({ office, officeTypes, offices, isOpen, onClose, onSave }) {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card modal-form" role="dialog" aria-modal="true" aria-label={office ? 'Edit office' : 'Create new office'}>
        <OfficeFormInner
          key={office ? String(office.id) : 'new'}
          office={office}
          officeTypes={officeTypes}
          offices={offices}
          onClose={onClose}
          onSave={onSave}
        />
      </section>
    </div>,
    document.body
  )
}

export default OfficeModal
