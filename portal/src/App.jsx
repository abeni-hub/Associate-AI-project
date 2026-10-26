import { useMemo, useState } from 'react'
import './App.css'

import {
  INITIAL_SUBCITIES,
  INITIAL_BUREAUS,
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

import LoginPage from './pages/LoginPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import SubcitiesPage from './pages/SubcitiesPage.jsx'
import AccountsPage from './pages/AccountsPage.jsx'
import BureausPage from './pages/BureausPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import NewsPage from './pages/NewsPage.jsx'
import RoutesPage from './pages/RoutesPage.jsx'
import QRPage from './pages/QRPage.jsx'
import OfficePage from './pages/OfficePage.jsx'
import ActivityPage from './pages/ActivityPage.jsx'

function App() {
  const [role, setRole] = useState('super')
  const [session, setSession] = useState(null)
  const [activePage, setActivePage] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [subcities, setSubcities] = useState(INITIAL_SUBCITIES)
  const [bureaus, setBureaus] = useState(INITIAL_BUREAUS)
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS)
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [routes, setRoutes] = useState(INITIAL_ROUTES)
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK)
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [, setCopiedLink] = useState(false)

  const resetSearch = () => { setSearch(''); setTypeFilter('All types'); setStatusFilter('All statuses') }
  const navigate = (page) => { setActivePage(page); resetSearch() }
  const signInDemo = (selected) => { setRole(selected); setSession({ role: selected }); setActivePage('overview'); resetSearch() }
  const signOut = () => { setSession(null); setActivePage('overview'); setModal(null) }

  const openForm = (config) => setModal({ kind: 'form', ...config })
  const openFeedback = (item) => setModal({ kind: 'feedback', item, onUpdate: (status) => setFeedback((list) => list.map((entry) => entry.id === item.id ? { ...entry, status } : entry)) })

  const createForPage = (page = activePage) => {
    if (page === 'subcities') return openForm({ eyebrow: 'PLATFORM DIRECTORY', title: 'Add a sub-city', description: 'Create a local workspace and invite its administrator.', submit: 'Create sub-city', fields: [{ name: 'name', label: 'Sub-city name', required: true }, { name: 'admin', label: 'Administrator name', required: true }, { name: 'username', label: 'Admin username', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }], onSubmit: (v) => { setSubcities((list) => [{ id: Date.now(), name: v.name, admin: v.admin, bureaus: 0, services: 0, status: 'Setup', updated: 'Just now' }, ...list]); setAccounts((list) => [{ id: Date.now() + 1, name: v.admin, username: v.username, role: 'Sub-city admin', organization: v.name, status: 'Pending', lastActive: 'Never' }, ...list]) } })
    if (page === 'bureaus') return openForm({ eyebrow: 'LEMI KURA · ORGANIZATION', title: 'Add a bureau', description: 'Register an office and assign a bureau administrator.', submit: 'Create bureau', fields: [{ name: 'name', label: 'Bureau name', required: true }, { name: 'category', label: 'Service category', placeholder: 'e.g. Civil registration' }, { name: 'admin', label: 'Administrator name', required: true }, { name: 'username', label: 'Admin username', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }], onSubmit: (v) => { setBureaus((list) => [{ id: Date.now(), name: v.name, category: v.category || 'Public services', admin: v.admin, services: 0, completion: 0, status: 'In progress' }, ...list]); setAccounts((list) => [{ id: Date.now() + 1, name: v.admin, username: v.username, role: 'Bureau admin', organization: `${v.name} · Lemi Kura`, status: 'Pending', lastActive: 'Never' }, ...list]) } })
    if (page === 'accounts') return openForm({ eyebrow: 'ACCESS & PERMISSIONS', title: 'Create an account', description: 'Assign a role and organization to give an administrator the right workspace.', submit: 'Create account', fields: [{ name: 'name', label: 'Full name', required: true }, { name: 'username', label: 'Username', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }, { name: 'role', label: 'Admin role', type: 'select', required: true, options: ['Sub-city admin', 'Bureau admin'] }, { name: 'organization', label: 'Organization', required: true }, { name: 'password', label: 'Temporary password', placeholder: 'Set a temporary password', required: true }], onSubmit: (v) => setAccounts((list) => [{ id: Date.now(), name: v.name, username: v.username, role: v.role, organization: v.organization, status: 'Pending', lastActive: 'Never' }, ...list]) })
    if (page === 'services') return openForm({ eyebrow: 'SERVICE INFORMATION', title: 'Create a service standard', description: 'Define the service, required documents and expectations on both sides.', submit: 'Save service', fields: [{ name: 'name', label: 'Service name', required: true }, { name: 'serviceType', label: 'Service level', type: 'select', required: true, options: ['Main service', 'Sub-service'] }, { name: 'parentService', label: 'Parent service', placeholder: 'Required for a sub-service' }, { name: 'category', label: 'Category', placeholder: 'e.g. Civil registration' }, { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true }, { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, placeholder: 'Add one document per line' }, { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true }, { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true }], onSubmit: (v) => setServices((list) => [{ id: Date.now(), name: v.name, serviceType: v.serviceType, parentService: v.parentService, category: v.category || 'Public service', description: v.description, documents: (v.documents || '').split('\n').filter(Boolean), bureaus: 0, published: false, customerExpectations: v.customerExpectations, bureauExpectations: v.bureauExpectations }, ...list]) })
    if (page === 'news') return openForm({ eyebrow: 'PUBLIC INFORMATION', title: 'Create an update', description: 'Share an official announcement or upcoming event with your community.', submit: 'Save update', fields: [{ name: 'type', label: 'Update type', type: 'select', required: true, options: ['News', 'Event'] }, { name: 'title', label: 'Title', required: true }, { name: 'date', label: 'Publish or event date', type: 'date', required: true }, { name: 'audience', label: 'Audience', placeholder: 'e.g. All residents' }, { name: 'excerpt', label: 'What residents should know', type: 'textarea', full: true, required: true }, { name: 'status', label: 'Save as', type: 'select', required: true, options: ['Draft', 'Published'] }], onSubmit: (v) => setPosts((list) => [{ id: Date.now(), type: v.type, title: v.title, excerpt: v.excerpt, date: v.date, status: v.status, audience: v.audience || 'All residents' }, ...list]) })
    if (page === 'routes') return setModal({ kind: 'route', route: routes[0], onSave: (steps) => setRoutes((list) => list.map((route) => route.id === routes[0]?.id ? { ...route, steps, status: 'Draft', updated: 'Just now' } : route)) })
    return null
  }

  const onUpdateService = (item) => openForm({ eyebrow: 'SERVICE INFORMATION', title: 'Edit service standard', description: 'Update the service description, checklist and shared expectations.', submit: 'Save standard', fields: [{ name: 'name', label: 'Service name', required: true, value: item.name }, { name: 'serviceType', label: 'Service level', type: 'select', required: true, value: item.serviceType || 'Main service', options: ['Main service', 'Sub-service'] }, { name: 'parentService', label: 'Parent service', value: item.parentService || '' }, { name: 'category', label: 'Category', value: item.category }, { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true, value: item.description }, { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, value: item.documents.join('\n') }, { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true, value: item.customerExpectations }, { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true, value: item.bureauExpectations }], onSubmit: (v) => setServices((list) => list.map((service) => service.id === item.id ? { ...service, name: v.name, category: v.category, serviceType: v.serviceType, parentService: v.parentService, description: v.description, documents: v.documents.split('\n').filter(Boolean), customerExpectations: v.customerExpectations, bureauExpectations: v.bureauExpectations } : service)) })

  const visibleFeedback = useMemo(() => role === 'bureau' ? feedback.filter((item) => item.bureau === 'Revenues Bureau' && item.subcity === 'Lemi Kura') : role === 'subcity' ? feedback.filter((item) => item.subcity === 'Lemi Kura') : feedback, [feedback, role])
  if (!session) return <LoginPage selectedRole={role} setSelectedRole={setRole} onLogin={signInDemo} />

  return <div className="app-shell">
    <Sidebar role={role} activePage={activePage} setActivePage={navigate} onLogout={signOut} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <main className="main-area">
      <Topbar role={role} onMenu={() => setMobileOpen(true)} onLogout={signOut} />
      <div className="main-content" key={activePage}>
        {activePage === 'overview' && <OverviewPage role={role} onNavigate={navigate} feedback={visibleFeedback} onFeedback={openFeedback} onCreate={(page) => createForPage(page || (role === 'super' ? 'subcities' : role === 'subcity' ? 'bureaus' : 'routes'))} />}
        {activePage === 'subcities' && role === 'super' && <SubcitiesPage items={subcities} onAdd={() => createForPage('subcities')} search={search} setSearch={setSearch} />}
        {activePage === 'accounts' && role === 'super' && <AccountsPage items={accounts} onAdd={() => createForPage('accounts')} search={search} setSearch={setSearch} />}
        {activePage === 'bureaus' && role === 'subcity' && <BureausPage items={bureaus} onAdd={() => createForPage('bureaus')} search={search} setSearch={setSearch} />}
        {activePage === 'services' && role === 'subcity' && <ServicesPage items={services} onAdd={() => createForPage('services')} onEdit={onUpdateService} search={search} setSearch={setSearch} onTogglePublish={(id) => setServices((list) => list.map((item) => item.id === id ? { ...item, published: !item.published } : item))} />}
        {activePage === 'feedback' && <FeedbackPage items={visibleFeedback} onOpen={openFeedback} search={search} setSearch={setSearch} typeFilter={typeFilter} setTypeFilter={setTypeFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
        {activePage === 'news' && role === 'subcity' && <NewsPage items={posts} onAdd={() => createForPage('news')} search={search} setSearch={setSearch} onTogglePublish={(id) => setPosts((list) => list.map((item) => item.id === id ? { ...item, status: item.status === 'Published' ? 'Draft' : 'Published' } : item))} />}
        {activePage === 'routes' && role === 'bureau' && <RoutesPage items={routes.filter((route) => route.bureau === 'Revenues Bureau')} onEdit={(route) => setModal({ kind: 'route', route, onSave: (steps) => setRoutes((list) => list.map((item) => item.id === route.id ? { ...item, steps, status: 'Draft', updated: 'Just now' } : item)) })} search={search} setSearch={setSearch} />}
        {activePage === 'qr' && role === 'bureau' && <QRPage onGenerate={() => setModal({ kind: 'qr', onGenerate: () => setCopiedLink(true) })} onCopy={() => { navigator.clipboard?.writeText('https://civiclink.gov.et/feedback/rev-001'); setCopiedLink(true) }} />}
        {activePage === 'office' && role === 'bureau' && <OfficePage />}
        {activePage === 'activity' && role === 'super' && <ActivityPage />}
        <footer className="app-footer">
          <span>© 2026 CivicLink Ethiopia</span>
          <span><Icon name="shield" size={13} /> Protected admin workspace</span>
          <span>Help center <Icon name="external" size={12} /></span>
        </footer>
      </div>
    </main>
    <Modal modal={modal} onClose={() => setModal(null)} />
  </div>
}

export default App
