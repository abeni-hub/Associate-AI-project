import { NAV } from '../data/portalData.js'

export const PORTAL_PAGES_BY_ROLE = {
  ...Object.fromEntries(
    Object.entries(NAV).map(([role, groups]) => [role, groups.flatMap((group) => group.items.map((item) => item.id))]),
  ),
}

const PAGE_ALIASES = {
  super: { subcities: 'offices', bureaus: 'offices' },
  subcity: { subcities: 'offices', bureaus: 'offices' },
}

export function normalizePortalPage(role, page) {
  return PAGE_ALIASES[role]?.[page] ?? page
}

export function portalPagePath(role, page) {
  const routeRole = Object.hasOwn(PORTAL_PAGES_BY_ROLE, role) ? role : 'super'
  const pages = PORTAL_PAGES_BY_ROLE[routeRole]
  const normalizedPage = normalizePortalPage(routeRole, page)
  const destination = pages?.includes(normalizedPage) ? normalizedPage : 'overview'
  return `/admin/${routeRole}/${destination}`
}

export function parsePortalPath(pathname) {
  const match = pathname.match(/^\/admin\/(super|subcity|bureau)\/([^/]+)\/?$/)
  if (!match) return null

  const [, role, page] = match
  if (!PORTAL_PAGES_BY_ROLE[role].includes(page)) return null
  return { role, page }
}
