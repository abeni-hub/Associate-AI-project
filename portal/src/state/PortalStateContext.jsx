import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import {
  INITIAL_ACCOUNTS,
  INITIAL_CMS_CONFIG,
  INITIAL_FEEDBACK,
  INITIAL_OFFICE_TYPES,
  INITIAL_OFFICES,
  INITIAL_POSTS,
  INITIAL_ROLES,
  INITIAL_ROUTES,
  INITIAL_SERVICES,
} from '../data/portalData.js'
import { createNewsEventModal } from '../data/newsEventForm.js'
import { NEWS_EVENTS_STORAGE_KEY, readSharedNewsEvents, writeSharedNewsEvents } from '../../../shared/newsEventsStorage.js'
import { parsePortalPath, portalPagePath } from '../routing/portalRoutes.js'

const PortalStateContext = createContext(null)

export function usePortalState() {
  const context = useContext(PortalStateContext)
  if (!context) throw new Error('usePortalState must be used within PortalStateProvider')
  return context
}

export function PortalStateProvider() {
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

  const currentRoute = parsePortalPath(location.pathname)
  const activePage = currentRoute?.role === role ? currentRoute.page : 'overview'
  const visibleFeedback = useMemo(() => {
    if (role === 'bureau') return feedback.filter((item) => item.bureau === 'Revenues Bureau' && item.subcity === 'Lemi Kura')
    if (role === 'subcity') return feedback.filter((item) => item.subcity === 'Lemi Kura')
    return feedback
  }, [feedback, role])

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

  const resetSearch = () => {
    setSearch('')
    setTypeFilter('All types')
    setStatusFilter('All statuses')
  }

  const navigate = (page) => {
    routerNavigate(portalPagePath(role, page))
    resetSearch()
  }

  const signInDemo = (selectedRole) => {
    const requestedRoute = parsePortalPath(location.pathname)
    const destination = requestedRoute?.role === selectedRole
      ? location.pathname
      : portalPagePath(selectedRole, 'overview')
    setRole(selectedRole)
    setSession({ role: selectedRole })
    resetSearch()
    routerNavigate(destination, { replace: true })
  }

  const signOut = () => {
    setSession(null)
    setModal(null)
    setOfficeModal({ isOpen: false, office: null })
    routerNavigate('/', { replace: true })
  }

  const openForm = (config) => setModal({ kind: 'form', ...config })

  const openFeedback = (item) => setModal({
    kind: 'feedback',
    item,
    onUpdate: (status) => setFeedback((list) => list.map((entry) => entry.id === item.id ? { ...entry, status } : entry)),
  })

  const handleAddOffice = (newOffice) => setOffices((previous) => [newOffice, ...previous])
  const handleEditOffice = (updated) => setOffices((previous) => previous.map((office) => office.id === updated.id ? updated : office))
  const handleSaveCms = (newConfig) => setCmsConfig(newConfig)

  const openNewsEditor = (item = null) => openForm(createNewsEventModal(item, (record) => setPosts((list) => {
    const exists = list.some((post) => post.id === record.id)
    return exists ? list.map((post) => post.id === record.id ? record : post) : [record, ...list]
  })))

  const handleUpdateRolePermissions = (roleId, moduleId, actions) => {
    setRoles((previous) => previous.map((entry) => entry.id === roleId
      ? { ...entry, permissions: { ...entry.permissions, [moduleId]: actions } }
      : entry))
  }

  const handleCreateRole = (newRole) => setRoles((previous) => [...previous, newRole])
  const handleUpdateRole = (updated) => setRoles((previous) => previous.map((entry) => entry.id === updated.id ? updated : entry))

  const createForPage = (page = activePage) => {
    if (page === 'offices' || page === 'subcities' || page === 'bureaus') {
      navigate('offices')
      setOfficeModal({ isOpen: true, office: null })
      return
    }

    if (page === 'accounts') {
      openForm({
        eyebrow: 'ACCESS & PERMISSIONS',
        title: 'Create an account',
        description: 'Assign a role and organization to give an administrator the right workspace.',
        submit: 'Create account',
        fields: [
          { name: 'name', label: 'Full name', required: true },
          { name: 'username', label: 'Username', required: true },
          { name: 'email', label: 'Work email', type: 'email', required: true },
          { name: 'role', label: 'Admin role', type: 'select', required: true, options: ['Sub-city admin', 'Bureau admin', 'Public Communications Editor'] },
          { name: 'organization', label: 'Organization', required: true },
          { name: 'status', label: 'Account status', type: 'select', required: true, value: 'Active', options: ['Active', 'Inactive'] },
          { name: 'password', label: 'Temporary password', placeholder: 'Set a temporary password', required: true },
        ],
        onSubmit: (values) => setAccounts((list) => [{ id: Date.now(), name: values.name, username: values.username, role: values.role, organization: values.organization, status: values.status, lastActive: 'Never' }, ...list]),
      })
      return
    }

    if (page === 'services') {
      openForm({
        eyebrow: 'SERVICE INFORMATION',
        title: 'Create a service standard',
        description: 'Define the service, required documents and expectations on both sides.',
        submit: 'Save service',
        fields: [
          { name: 'name', label: 'Service name', required: true },
          { name: 'serviceType', label: 'Service level', type: 'select', required: true, options: ['Main service', 'Sub-service'] },
          { name: 'parentService', label: 'Parent service', placeholder: 'Required for a sub-service' },
          { name: 'category', label: 'Category', placeholder: 'e.g. Civil registration' },
          { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true },
          { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, placeholder: 'Add one document per line' },
          { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true },
          { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true },
        ],
        onSubmit: (values) => setServices((list) => [{
          id: Date.now(),
          name: values.name,
          serviceType: values.serviceType,
          parentService: values.parentService,
          category: values.category || 'Public service',
          description: values.description,
          documents: (values.documents || '').split('\n').filter(Boolean),
          bureaus: 0,
          published: false,
          customerExpectations: values.customerExpectations,
          bureauExpectations: values.bureauExpectations,
        }, ...list]),
      })
      return
    }

    if (page === 'news') {
      openNewsEditor()
      return
    }

    if (page === 'routes') {
      setModal({
        kind: 'route',
        route: routes[0],
        onSave: (steps) => setRoutes((list) => list.map((route) => route.id === routes[0]?.id ? { ...route, steps, status: 'Draft', updated: 'Just now' } : route)),
      })
    }
  }

  const updateService = (item) => openForm({
    eyebrow: 'SERVICE INFORMATION',
    title: 'Edit service standard',
    description: 'Update the service description, checklist and shared expectations.',
    submit: 'Save standard',
    fields: [
      { name: 'name', label: 'Service name', required: true, value: item.name },
      { name: 'serviceType', label: 'Service level', type: 'select', required: true, value: item.serviceType || 'Main service', options: ['Main service', 'Sub-service'] },
      { name: 'parentService', label: 'Parent service', value: item.parentService || '' },
      { name: 'category', label: 'Category', value: item.category },
      { name: 'description', label: 'What this service does', type: 'textarea', full: true, required: true, value: item.description },
      { name: 'documents', label: 'Required documents', type: 'textarea', full: true, rows: 3, value: item.documents.join('\n') },
      { name: 'customerExpectations', label: 'What the citizen should prepare or do', type: 'textarea', full: true, required: true, value: item.customerExpectations },
      { name: 'bureauExpectations', label: 'What the bureau commits to', type: 'textarea', full: true, required: true, value: item.bureauExpectations },
    ],
    onSubmit: (values) => setServices((list) => list.map((service) => service.id === item.id ? {
      ...service,
      name: values.name,
      category: values.category,
      serviceType: values.serviceType,
      parentService: values.parentService,
      description: values.description,
      documents: values.documents.split('\n').filter(Boolean),
      customerExpectations: values.customerExpectations,
      bureauExpectations: values.bureauExpectations,
    } : service)),
  })

  const editAccount = (item) => openForm({
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
    onSubmit: (values) => setAccounts((list) => list.map((account) => account.id === item.id ? { ...account, ...values } : account)),
  })

  const editBureauProfile = () => openForm({
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
    onSubmit: (values) => setBureauProfile(values),
  })

  const editRoute = (route) => setModal({
    kind: 'route',
    route,
    onSave: (steps) => setRoutes((list) => list.map((item) => item.id === route.id ? { ...item, steps, status: 'Draft', updated: 'Just now' } : item)),
  })

  const toggleServicePublish = (id) => setServices((list) => list.map((item) => item.id === id ? { ...item, published: !item.published } : item))
  const toggleNewsPublish = (id) => setPosts((list) => list.map((item) => item.id === id ? { ...item, isPublished: item.isPublished === false } : item))
  const generateQr = () => setModal({ kind: 'qr', onGenerate: () => setCopiedLink(true) })
  const copyFeedbackLink = () => {
    navigator.clipboard?.writeText('https://civiclink.gov.et/feedback/rev-001')
    setCopiedLink(true)
  }

  const value = {
    role,
    setRole,
    session,
    mobileOpen,
    setMobileOpen,
    modal,
    setModal,
    officeModal,
    setOfficeModal,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    officeTypes,
    offices,
    roles,
    cmsConfig,
    accounts,
    services,
    routes,
    feedback,
    posts,
    bureauProfile,
    visibleFeedback,
    activePage,
    resetSearch,
    navigate,
    signInDemo,
    signOut,
    openFeedback,
    openNewsEditor,
    createForPage,
    handleAddOffice,
    handleEditOffice,
    handleSaveCms,
    handleUpdateRolePermissions,
    handleCreateRole,
    handleUpdateRole,
    updateService,
    editAccount,
    editBureauProfile,
    editRoute,
    toggleServicePublish,
    toggleNewsPublish,
    generateQr,
    copyFeedbackLink,
  }

  return <PortalStateContext.Provider value={value}><Outlet /></PortalStateContext.Provider>
}
