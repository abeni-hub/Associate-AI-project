export function getOfficeSubcityId(office, offices) {
  if (!office) return null
  if (office.subcityId !== null && office.subcityId !== undefined) return Number(office.subcityId)

  let current = office
  const visited = new Set()
  while (current && !visited.has(current.id)) {
    if (current.typeId === 1) return current.id
    visited.add(current.id)
    current = offices.find((entry) => entry.id === current.parentId)
  }
  return null
}

function safeText(val) {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') return val.eng || val.amh || val.oro || val.en || ''
  return String(val)
}

export function getOfficeParentSummary(office, offices, officeTypes) {
  if (!office) return ''

  const parentType = officeTypes.find((type) => type.id === office.parentTypeId)
  if (parentType) {
    const subcityId = getOfficeSubcityId(office, offices)
    const subcity = offices.find((entry) => entry.id === subcityId && entry.typeId === 1)
    const pName = safeText(parentType.name)
    const sName = safeText(subcity?.name)
    return subcity ? `${pName} · ${sName}` : pName
  }

  const pOrg = offices.find((entry) => entry.id === office.parentId)
  return safeText(pOrg?.name) || ''
}
