import { createBrowserRouter, Navigate } from 'react-router'
import { PORTAL_PAGES_BY_ROLE, normalizePortalPage, portalPagePath } from './portalRoutes.js'
import { PORTAL_PAGE_ELEMENTS } from './PortalPageElements.jsx'
import { PortalEntryRoute, PortalFallbackRoute } from './PortalEntryRoutes.jsx'
import PortalLayout from '../components/layout/PortalLayout.jsx'
import { PortalStateProvider } from '../state/PortalStateContext.jsx'

const roleRoutes = Object.entries(PORTAL_PAGES_BY_ROLE).map(([role, pages]) => {
  const canonicalPages = [...new Set(pages.map((page) => normalizePortalPage(role, page)))]

  return {
    path: `admin/${role}`,
    element: <PortalLayout routeRole={role} />,
    children: [
      { index: true, element: <Navigate to={portalPagePath(role, 'overview')} replace /> },
      ...canonicalPages.map((page) => ({ path: page, element: PORTAL_PAGE_ELEMENTS[page] })),
      { path: '*', element: <Navigate to={portalPagePath(role, 'overview')} replace /> },
    ],
  }
})

export const portalRouter = createBrowserRouter([
  {
    element: <PortalStateProvider />,
    children: [
      { path: '/', element: <PortalEntryRoute /> },
      ...roleRoutes,
      { path: '*', element: <PortalFallbackRoute /> },
    ],
  },
])
