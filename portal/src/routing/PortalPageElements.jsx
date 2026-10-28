import OverviewPage from '../pages/OverviewPage.jsx'
import OfficesPage from '../pages/OfficesPage.jsx'
import LandingPageCms from '../pages/LandingPageCms.jsx'
import RolesPermissionsPage from '../pages/RolesPermissionsPage.jsx'
import AccountsPage from '../pages/AccountsPage.jsx'
import ServicesPage from '../pages/ServicesPage.jsx'
import FeedbackPage from '../pages/FeedbackPage.jsx'
import NewsPage from '../pages/NewsPage.jsx'
import RoutesPage from '../pages/RoutesPage.jsx'
import QRPage from '../pages/QRPage.jsx'
import OfficePage from '../pages/OfficePage.jsx'
import ActivityPage from '../pages/ActivityPage.jsx'
import { usePortalState } from '../state/PortalStateContext.jsx'

function OverviewRoute() {
  const app = usePortalState()
  const defaultCreatePage = app.role === 'bureau' ? 'routes' : 'offices'
  return <OverviewPage
    role={app.role}
    onNavigate={app.navigate}
    feedback={app.visibleFeedback}
    onFeedback={app.openFeedback}
    onCreate={(targetPage) => app.createForPage(targetPage || defaultCreatePage)}
  />
}

function OfficesRoute() {
  const app = usePortalState()
  return <OfficesPage
    offices={app.offices}
    officeTypes={app.officeTypes}
    role={app.role}
    onAddOffice={() => app.setOfficeModal({ isOpen: true, office: null })}
    onEditOffice={(office) => app.setOfficeModal({ isOpen: true, office })}
    search={app.search}
    setSearch={app.setSearch}
  />
}

function CmsRoute() {
  const { cmsConfig, handleSaveCms } = usePortalState()
  return <LandingPageCms cmsConfig={cmsConfig} onSaveCms={handleSaveCms} />
}

function RolesRoute() {
  const app = usePortalState()
  return <RolesPermissionsPage
    roles={app.roles}
    onUpdateRolePermissions={app.handleUpdateRolePermissions}
    onCreateRole={app.handleCreateRole}
    onUpdateRole={app.handleUpdateRole}
  />
}

function AccountsRoute() {
  const app = usePortalState()
  return <AccountsPage
    items={app.accounts}
    onAdd={() => app.createForPage('accounts')}
    onEdit={app.editAccount}
    search={app.search}
    setSearch={app.setSearch}
  />
}

function ServicesRoute() {
  const app = usePortalState()
  return <ServicesPage
    items={app.services}
    onAdd={() => app.createForPage('services')}
    onEdit={app.updateService}
    search={app.search}
    setSearch={app.setSearch}
    onTogglePublish={app.toggleServicePublish}
  />
}

function FeedbackRoute() {
  const app = usePortalState()
  return <FeedbackPage
    items={app.visibleFeedback}
    onOpen={app.openFeedback}
    search={app.search}
    setSearch={app.setSearch}
    typeFilter={app.typeFilter}
    setTypeFilter={app.setTypeFilter}
    statusFilter={app.statusFilter}
    setStatusFilter={app.setStatusFilter}
  />
}

function NewsRoute() {
  const app = usePortalState()
  return <NewsPage
    items={app.posts}
    onAdd={() => app.createForPage('news')}
    onEdit={app.openNewsEditor}
    search={app.search}
    setSearch={app.setSearch}
    onTogglePublish={app.toggleNewsPublish}
  />
}

function RoomRoutesRoute() {
  const app = usePortalState()
  const bureauRoutes = app.routes.filter((route) => route.bureau === 'Revenues Bureau')
  return <RoutesPage items={bureauRoutes} onEdit={app.editRoute} search={app.search} setSearch={app.setSearch} />
}

function QrRoute() {
  const { generateQr, copyFeedbackLink } = usePortalState()
  return <QRPage onGenerate={generateQr} onCopy={copyFeedbackLink} />
}

function OfficeProfileRoute() {
  const { bureauProfile, editBureauProfile } = usePortalState()
  return <OfficePage profile={bureauProfile} onEdit={editBureauProfile} />
}

function ActivityRoute() {
  return <ActivityPage />
}

export const PORTAL_PAGE_ELEMENTS = {
  overview: <OverviewRoute />,
  offices: <OfficesRoute />,
  cms: <CmsRoute />,
  roles: <RolesRoute />,
  accounts: <AccountsRoute />,
  services: <ServicesRoute />,
  feedback: <FeedbackRoute />,
  news: <NewsRoute />,
  routes: <RoomRoutesRoute />,
  qr: <QrRoute />,
  office: <OfficeProfileRoute />,
  activity: <ActivityRoute />,
}
