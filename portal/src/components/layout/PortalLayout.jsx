import { Navigate, Outlet, useLocation } from 'react-router'
import { parsePortalPath, portalPagePath } from '../../routing/portalRoutes.js'
import { usePortalState } from '../../state/PortalStateContext.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import LoginScreen from './LoginScreen.jsx'
import Icon from '../ui/Icon.jsx'
import Modal from '../modals/Modal.jsx'
import OfficeModal from '../offices/OfficeModal.jsx'

function PortalLayout({ routeRole }) {
  const location = useLocation()
  const app = usePortalState()

  if (!app.session) return <LoginScreen />
  if (app.session.role !== routeRole) {
    return <Navigate to={portalPagePath(app.session.role, 'overview')} replace />
  }

  const currentRoute = parsePortalPath(location.pathname)
  const activePage = currentRoute?.role === routeRole ? currentRoute.page : 'overview'

  return <div className="app-shell">
    <Sidebar role={routeRole} onNavigate={app.resetSearch} onLogout={app.signOut} mobileOpen={app.mobileOpen} setMobileOpen={app.setMobileOpen} />
    <main className="main-area">
      <Topbar role={routeRole} onMenu={() => app.setMobileOpen(true)} onLogout={app.signOut} />
      <div className="main-content" key={`${routeRole}-${activePage}`}>
        <Outlet />
        <footer className="app-footer">
          <span>© 2026 CivicLink Ethiopia</span>
          <span><Icon name="shield" size={13} /> Protected admin workspace</span>
          <span>Help center <Icon name="external" size={12} /></span>
        </footer>
      </div>
    </main>
    <Modal modal={app.modal} onClose={() => app.setModal(null)} />
    <OfficeModal
      isOpen={app.officeModal.isOpen}
      office={app.officeModal.office}
      officeTypes={app.officeTypes}
      offices={app.offices}
      onClose={() => app.setOfficeModal({ isOpen: false, office: null })}
      onSave={(saved) => app.officeModal.office ? app.handleEditOffice(saved) : app.handleAddOffice(saved)}
    />
  </div>
}

export default PortalLayout
