import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
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

import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import Icon from './components/ui/Icon.jsx'
import Modal from './components/modals/Modal.jsx'
import OfficeModal from './components/offices/OfficeModal.jsx'

import LoginPage from './pages/LoginPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import OfficesPage from './pages/OfficesPage.jsx'
import LandingPageCms from './pages/LandingPageCms.jsx'
import RolesPermissionsPage from './pages/RolesPermissionsPage.jsx'
import AccountsPage from './pages/AccountsPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import NewsPage from './pages/NewsPage.jsx'
import RoutesPage from './pages/RoutesPage.jsx'
import QRPage from './pages/QRPage.jsx'
import OfficePage from './pages/OfficePage.jsx'
import ActivityPage from './pages/ActivityPage.jsx'
import { parsePortalPath, PORTAL_PAGES_BY_ROLE, portalPagePath } from './routing/portalRoutes.js'
import { createNewsEventModal } from './data/newsEventForm.js'
import { NEWS_EVENTS_STORAGE_KEY, readSharedNewsEvents, writeSharedNewsEvents } from '../../shared/newsEventsStorage.js'

function App() {
  const location = useLocation()
  const routerNavigate = useNavigate()
  const [role, setRole] = useState(() => parsePortalPath(location.pathname)?.role ?? 'super')
  const [session, setSession] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [officeModal, setOfficeModal] = useState({ isOpen: false, office: null })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  // Relational entities
  const [officeTypes] = useState(INITIAL_OFFICE_TYPES)
  const [offices, setOffices] = useState(INITIAL_OFFICES)
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [cmsConfig, setCmsConfig] = useState(INITIAL_CMS_CONFIG)
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS)
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [routes, setRoutes] = useState(INITIAL_ROUTES)
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK)
  const [posts, setPosts] = useState(() => readSharedNewsEvents(INITIAL_POSTS))
  const [, setCopiedLink] = useState(false)
  const [bureauProfile, setBureauProfile] = useState({
    bureau: 'Revenues Bureau',
    hours: 'Monday – Friday · 8:30 AM – 5:30 PM',
    location: 'Lemi Kura Sub-city, Addis Ababa',
    admin: 'Dawit Alemu',
    contact: '+251 11 000 0000',
  })

  useEffect(() => {
    writeSharedNewsEvents(posts)
  }, [posts])

  useEffect(() => {
    const syncNewsEvents = (event) => {
      if (event.key === NEWS_EVENTS_STORAGE_KEY) setPosts(readSharedNewsEvents(INITIAL_POSTS))
    }
    window.addEventListener('storage', syncNewsEvents)
    return () => window.removeEventListener('storage', syncNewsEvents)
  }, [])

  const resetSearch = () => { setSearch(''); setTypeFilter('All types'); setStatusFilter('All statuses') }
  const navigate = (page) => { routerNavigate(portalPagePath(role, page)); resetSearch() }
  const signInDemo = (selected) => {
    const requestedRoute = parsePortalPath(location.pathname)
    const destination = requestedRoute?.role === selected
      ? location.pathname
      : portalPagePath(selected, 'overview')
    setRole(selected)
    setSession({ role: selected })
    resetSearch()
    routerNavigate(destination, { replace: true })
  }
  const signOut = () => { setSession(null); setModal(null); setOfficeModal({ isOpen: false, office: null }); routerNavigate('/', { replace: true }) }

  const openForm = (config) => setModal({ kind: 'form', ...config })
  const openFeedback = (item) => setModal({ kind: 'feedback', item, onUpdate: (status) => setFeedback((list) => list.map((entry) => entry.id === item.id ? { ...entry, status } : entry)) })

  // Hierarchical Office Handlers
  const handleAddOffice = (newOffice) => setOffices((prev) => [newOffice, ...prev])
  const handleEditOffice = (updated) => setOffices((prev) => prev.map((o) => o.id === updated.id ? updated : o))

  // CMS Handlers
  const handleSaveCms = (newConfig) => setCmsConfig(newConfig)

  const openNewsEditor = (item = null) => openForm(createNewsEventModal(item, (record) => setPosts((list) => {
    const exists = list.some((post) => post.id === record.id)
    return exists ? list.map((post) => post.id === record.id ? record : post) : [record, ...list]
  })))

  // Roles & Permissions Handlers
  const handleUpdateRolePermissions = (roleId, moduleId, newActions) => {
    setRoles((prev) => prev.map((r) => r.id === roleId ? {
      ...r,
      permissions: { ...r.permissions, [moduleId]: newActions },
    } : r))
  }
  const handleCreateRole = (newRole) => setRoles((prev) => [...prev, newRole])

  const createForPage = (page = activePage) => {
    if (page === 'offices' || page === 'subcities' || page === 'bureaus') {
      navigate('offices')
      setOfficeModal({ isOpen: true, office: null })
      return null
    }
    if (page === 'accounts') return openForm({ eyebrow: 'ACCESS & PERMISSIONS', title: 'Create an account', description: 'Assign a role and organization to give an administrator the right workspace.', submit: 'Create account', fields: [{ name: 'name', label: 'Full name', required: true }, { name: 'username', label: 'Username', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }, { name: 'role', label: 'Admin role', type: 'select', required: true, options: ['Sub-city admin', 'Bureau admin', 'Public Communications Editor'] }, { name: 'organization', label: 'Organization', required: true }, { name: 'status', label: 'Account status', type: 'select', required: true, value: 'Active', options: ['Active', 'Inactive'] }, { name: 'password', label: 'Temporary password', placeholder: 'Set a temporary password', required: true }], onSubmit: (v) => setAccounts((list) => [{ id: Date.now(), name: v.name, username: v.username, role: v.role, organization: v.organization, status: v.status, lastActive: 'Never' }, ...list]) })
    if (page === 'services') return openForm({ eyebrow: 'SERVICE INFORMATION', title: 'Create a service standard', description: 'Define the service, required documents and expectations on both sides.', submit: 'Save service', fields: [{ name: 'name', label: 'Service name', required: true }, { name: 'serviceType', label: 'Service level', type: 'select', required: true, options: ['Main service', 'Sub-service'] }, { name: 'parentService', label: 'Parent service', placeholder: 'Required for a sub-service' }, { name: 'category', label: 'Category', placeholder: 'e.g. Civil registration' }, { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true }, { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, placeholder: 'Add one document per line' }, { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true }, { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true }], onSubmit: (v) => setServices((list) => [{ id: Date.now(), name: v.name, serviceType: v.serviceType, parentService: v.parentService, category: v.category || 'Public service', description: v.description, documents: (v.documents || '').split('\n').filter(Boolean), bureaus: 0, published: false, customerExpectations: v.customerExpectations, bureauExpectations: v.bureauExpectations }, ...list]) })
    if (page === 'news') return openNewsEditor()
    if (page === 'routes') return setModal({ kind: 'route', route: routes[0], onSave: (steps) => setRoutes((list) => list.map((route) => route.id === routes[0]?.id ? { ...route, steps, status: 'Draft', updated: 'Just now' } : route)) })
    return null
  }

  const onUpdateService = (item) => openForm({ eyebrow: 'SERVICE INFORMATION', title: 'Edit service standard', description: 'Update the service description, checklist and shared expectations.', submit: 'Save standard', fields: [{ name: 'name', label: 'Service name', required: true, value: item.name }, { name: 'serviceType', label: 'Service level', type: 'select', required: true, value: item.serviceType || 'Main service', options: ['Main service', 'Sub-service'] }, { name: 'parentService', label: 'Parent service', value: item.parentService || '' }, { name: 'category', label: 'Category', value: item.category }, { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true, value: item.description }, { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, value: item.documents.join('\n') }, { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true, value: item.customerExpectations }, { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true, value: item.bureauExpectations }], onSubmit: (v) => setServices((list) => list.map((service) => service.id === item.id ? { ...service, name: v.name, category: v.category, serviceType: v.serviceType, parentService: v.parentService, description: v.description, documents: v.documents.split('\n').filter(Boolean), customerExpectations: v.customerExpectations, bureauExpectations: v.bureauExpectations } : service)) })

  const onEditAccount = (item) => openForm({
    eyebrow: 'ACCESS & PERMISSIONS',
    title: 'Edit administrator account',
    description: 'Update user permissions, work email, and organizational workspace assignment.',
    submit: 'Save changes',
    fields: [
      { name: 'name', label: 'Full name', required: true, value: item.name },
      { name: 'username', label: 'Username', required: true, value: item.username },
      { name: 'email', label: 'Work email', type: 'email', required: true, value: item.email || `${item.username}@civiclink.gov.et` },
      { name: 'role', label: 'Admin role', type: 'select', required: true, value: item.role, options: ['Sub-city admin', 'Bureau admin', 'Public Communications Editor'] },
      { name: 'organization', label: 'Organization', required: true, value: item.organization },
      { name: 'status', label: 'Account status', type: 'select', required: true, value: item.status === 'Inactive' ? 'Inactive' : 'Active', options: ['Active', 'Inactive'] },
    ],
    onSubmit: (v) => setAccounts((list) => list.map((acc) => acc.id === item.id ? { ...acc, ...v } : acc)),
  })

  const onEditNews = (item) => openNewsEditor(item)

  const onEditBureauProfile = () => openForm({
    eyebrow: 'BUREAU SETTINGS',
    title: 'Edit office profile',
    description: 'Update public service hours, physical location, and contact information.',
    submit: 'Save profile',
    fields: [
      { name: 'bureau', label: 'Bureau name', required: true, value: bureauProfile.bureau },
      { name: 'hours', label: 'Public service hours', required: true, value: bureauProfile.hours },
      { name: 'location', label: 'Office location', required: true, value: bureauProfile.location },
      { name: 'admin', label: 'Bureau administrator', required: true, value: bureauProfile.admin },
      { name: 'contact', label: 'Public contact phone', required: true, value: bureauProfile.contact },
    ],
    onSubmit: (v) => setBureauProfile(v),
  })

  const visibleFeedback = useMemo(() => role === 'bureau' ? feedback.filter((item) => item.bureau === 'Revenues Bureau' && item.subcity === 'Lemi Kura') : role === 'subcity' ? feedback.filter((item) => item.subcity === 'Lemi Kura') : feedback, [feedback, role])
  const currentRoute = parsePortalPath(location.pathname)
  const activePage = currentRoute?.role === role ? currentRoute.page : 'overview'

  const renderPage = (page) => <>
    {page === 'overview' && (
      <OverviewPage
        role={role}
        onNavigate={navigate}
        feedback={visibleFeedback}
        onFeedback={openFeedback}
        onCreate={(targetPage) => createForPage(targetPage || (role === 'super' ? 'offices' : role === 'subcity' ? 'offices' : 'routes'))}
      />
    )}
    {(page === 'offices' || page === 'subcities' || page === 'bureaus') && (
      <OfficesPage
        offices={offices}
        officeTypes={officeTypes}
        role={role}
        onAddOffice={() => setOfficeModal({ isOpen: true, office: null })}
        onEditOffice={(office) => setOfficeModal({ isOpen: true, office })}
        search={search}
        setSearch={setSearch}
      />
    )}
    {page === 'cms' && role === 'super' && (
      <LandingPageCms cmsConfig={cmsConfig} onSaveCms={handleSaveCms} />
    )}
    {page === 'roles' && role === 'super' && (
      <RolesPermissionsPage
        roles={roles}
        onUpdateRolePermissions={handleUpdateRolePermissions}
        onCreateRole={handleCreateRole}
        onUpdateRole={(updated) => setRoles((prev) => prev.map((item) => item.id === updated.id ? updated : item))}
      />
    )}
    {page === 'accounts' && role === 'super' && (
      <AccountsPage items={accounts} onAdd={() => createForPage('accounts')} onEdit={onEditAccount} search={search} setSearch={setSearch} />
    )}
    {page === 'services' && role === 'subcity' && (
      <ServicesPage items={services} onAdd={() => createForPage('services')} onEdit={onUpdateService} search={search} setSearch={setSearch} onTogglePublish={(id) => setServices((list) => list.map((item) => item.id === id ? { ...item, published: !item.published } : item))} />
    )}
    {page === 'feedback' && (
      <FeedbackPage items={visibleFeedback} onOpen={openFeedback} search={search} setSearch={setSearch} typeFilter={typeFilter} setTypeFilter={setTypeFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
    )}
    {page === 'news' && (
      <NewsPage items={posts} onAdd={() => createForPage('news')} onEdit={onEditNews} search={search} setSearch={setSearch} onTogglePublish={(id) => setPosts((list) => list.map((item) => item.id === id ? { ...item, isPublished: item.isPublished === false } : item))} />
    )}
    {page === 'routes' && role === 'bureau' && (
      <RoutesPage items={routes.filter((route) => route.bureau === 'Revenues Bureau')} onEdit={(route) => setModal({ kind: 'route', route, onSave: (steps) => setRoutes((list) => list.map((item) => item.id === route.id ? { ...item, steps, status: 'Draft', updated: 'Just now' } : item)) })} search={search} setSearch={setSearch} />
    )}
    {page === 'qr' && role === 'bureau' && (
      <QRPage onGenerate={() => setModal({ kind: 'qr', onGenerate: () => setCopiedLink(true) })} onCopy={() => { navigator.clipboard?.writeText('https://civiclink.gov.et/feedback/rev-001'); setCopiedLink(true) }} />
    )}
    {page === 'office' && role === 'bureau' && <OfficePage profile={bureauProfile} onEdit={onEditBureauProfile} />}
    {page === 'activity' && role === 'super' && <ActivityPage />}

    <footer className="app-footer">
      <span>© 2026 CivicLink Ethiopia</span>
      <span><Icon name="shield" size={13} /> Protected admin workspace</span>
      <span>Help center <Icon name="external" size={12} /></span>
    </footer>
  </>

  if (!session) return <LoginPage selectedRole={role} setSelectedRole={setRole} onLogin={signInDemo} />

  return <div className="app-shell">
    <Sidebar role={role} onNavigate={resetSearch} onLogout={signOut} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <main className="main-area">
      <Topbar role={role} onMenu={() => setMobileOpen(true)} onLogout={signOut} />
      <div className="main-content" key={activePage}>
        <Routes>
          {Object.entries(PORTAL_PAGES_BY_ROLE).flatMap(([routeRole, pages]) => pages.map((page) => (
            <Route
              key={`${routeRole}-${page}`}
              path={portalPagePath(routeRole, page)}
              element={routeRole === role ? renderPage(page) : <Navigate to={portalPagePath(role, 'overview')} replace />}
            />
          )))}
          <Route path="*" element={<Navigate to={portalPagePath(role, 'overview')} replace />} />
        </Routes>
      </div>
    </main>
    <Modal modal={modal} onClose={() => setModal(null)} />
    <OfficeModal
      isOpen={officeModal.isOpen}
      office={officeModal.office}
      officeTypes={officeTypes}
      offices={offices}
      onClose={() => setOfficeModal({ isOpen: false, office: null })}
      onSave={(saved) => {
        if (officeModal.office) {
          handleEditOffice(saved)
        } else {
          handleAddOffice(saved)
        }
      }}
    />
  </div>
}

export default App
