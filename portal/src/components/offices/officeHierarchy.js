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

export function getOfficeParentSummary(office, offices, officeTypes) {
  if (!office) return ''

  const parentType = officeTypes.find((type) => type.id === office.parentTypeId)
  if (parentType) {
    const subcityId = getOfficeSubcityId(office, offices)
    const subcity = offices.find((entry) => entry.id === subcityId && entry.typeId === 1)
    return subcity ? `${parentType.name} · ${subcity.name}` : parentType.name
  }

  return offices.find((entry) => entry.id === office.parentId)?.name || ''
}
