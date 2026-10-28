import { RouterProvider } from 'react-router'
import { portalRouter } from './routing/portalRouter.jsx'
import './App.css'

import {
  INITIAL_OFFICE_TYPES,
  INITIAL_OFFICES,
  INITIAL_ROLES,
  INITIAL_CMS_CONFIG,
  INITIAL_ACCOUNTS,
  INITIAL_SERVICES,
  INITIAL_ROUTES,
  INITIAL_FEEDBACK,
  INITIAL_POSTS,
} from './data/portalData.js'

import Sidebar from './components/layout/Sidebar.js'
import Topbar from './components/layout/Topbar.js'
import Icon from './components/ui/Icon.jsx'
import Modal from './components/modals/Modal.js'
import OfficeModal from './components/offices/OfficeModal.jsx'

import LoginPage from './pages/LoginPage.js'
import OverviewPage from './pages/OverviewPage.js'
import OfficesPage from './pages/OfficesPage.jsx'
import LandingPageCms from './pages/LandingPageCms.jsx'
import RolesPermissionsPage from './pages/RolesPermissionsPage.jsx'
import AccountsPage from './pages/AccountsPage.js'
import ServicesPage from './pages/ServicesPage.js'
import FeedbackPage from './pages/FeedbackPage.js'
import NewsPage from './pages/NewsPage.js'
import RoutesPage from './pages/RoutesPage.js'
import QRPage from './pages/QRPage.js'
import OfficePage from './pages/OfficePage.js'
import ActivityPage from './pages/ActivityPage.js'
import { parsePortalPath, PORTAL_PAGES_BY_ROLE, portalPagePath } from './routing/portalRoutes.js'
import { createNewsEventModal } from './data/newsEventForm.js'
import { NEWS_EVENTS_STORAGE_KEY, readSharedNewsEvents, writeSharedNewsEvents } from '../../shared/newsEventsStorage.js'

function App() {
  return <RouterProvider router={portalRouter} />
}

export default App
