import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../ui/Icon.jsx'
import { useGetOrganizationTypesQuery } from '../../services/organizationsApi'
import { useGetNavigationItemsQuery, useGetPermissionsQuery } from '../../services/rolesApi'

const HIERARCHY_TIERS = [
  {
    scope: 'Platform',
    label: 'Platform-wide (Root)',
    badge: 'Tier 0 · Root',
    badgeTone: '#ecfdf5',
    color: '#047857',
    parentOf: 'Sub-City Admins & Platform Modules',
    reportsTo: 'None (Root Platform Authority)',
    desc: 'Platform-wide administrator with full authority across all modules and sub-cities.',
    icon: 'shield',
  },
  {
    scope: 'Sub-city',
    label: 'Sub-City Level',
    badge: 'Tier 1 · Sub-City',
    badgeTone: '#eff6ff',
    color: '#1d4ed8',
    parentOf: 'Woreda Admins & Sub-City Sector Bureaus',
    reportsTo: 'Platform Super Admin',
    desc: 'Administers own Sub-City jurisdiction and supervises all child Woredas and Bureaus.',
    icon: 'map',
  },
  {
    scope: 'Woreda',
    label: 'Woreda Level',
    badge: 'Tier 2 · Woreda',
    badgeTone: '#f5f3ff',
    color: '#6d28d9',
    parentOf: 'Woreda Bureaus, Service Desks & Local Staff',
    reportsTo: 'Sub-City Admin',
    desc: 'Administers local Woreda municipal operations, public service queues, and citizen desks.',
    icon: 'building',
  },
  {
    scope: 'Bureau',
    label: 'Bureau / Office Level',
    badge: 'Tier 3 · Bureau',
    badgeTone: '#fffbeb',
    color: '#b45309',
    parentOf: 'Operational Front-Desk Staff & Room Clerks',
    reportsTo: 'Sub-City Admin or Woreda Admin',
    desc: 'Supervises sector-specific service workflows, room guides, and operational attendants.',
    icon: 'sitemap',
  },
  {
    scope: 'Staff',
    label: 'Operational Desk Staff',
    badge: 'Tier 4 · Front-line',
    badgeTone: '#f8fafc',
    color: '#475569',
    parentOf: 'Citizen Service Execution (No subordinates)',
    reportsTo: 'Bureau Admin or Woreda Admin',
    desc: 'Front-desk operator receiving citizens, checking documents, and updating room steps.',
    icon: 'activity',
  },
]

export const AVAILABLE_NAV_ITEMS = [
  { id: 1, key: 'overview', name: 'Overview', route: '/admin/overview', desc: 'KPI metrics, service volume charts, and recent activity feed', icon: 'overview', required_permission: 'dashboard.view' },
  { id: 2, key: 'offices', name: 'Offices & Directory', route: '/admin/subcities', desc: 'Jurisdictional hierarchy, sub-cities, woredas, and bureaus directory', icon: 'building', required_permission: 'organizations.view' },
  { id: 3, key: 'levels', name: 'Organization Levels', route: '/admin/levels', desc: 'Configure municipal tier levels, hierarchy rank depth, and status', icon: 'layers', required_permission: 'organizations.view' },
  { id: 4, key: 'accounts', name: 'Accounts & Staff', route: '/admin/accounts', desc: 'Manage administrative staff accounts and roles', icon: 'users', required_permission: 'users.view' },
  { id: 5, key: 'roles', name: 'Roles & Permissions', route: '/admin/roles', desc: 'Access control policies, security roles, and permission matrix', icon: 'shield', required_permission: 'roles.view' },
  { id: 6, key: 'services', name: 'Services & Standards', route: '/admin/services', desc: 'Public service catalog, requirements, and completion tracking', icon: 'file', required_permission: 'services.view' },
  { id: 7, key: 'routes', name: 'Room Routes & Steps', route: '/admin/routes', desc: 'Physical room-by-room citizen navigation guides and floor steps', icon: 'route', required_permission: 'service_steps.view' },
  { id: 8, key: 'feedback', name: 'Citizen Feedback', route: '/admin/feedback', desc: 'Citizen complaints, ratings, and feedback resolution inbox', icon: 'message', required_permission: 'feedback.view_own' },
  { id: 9, key: 'qr', name: 'Feedback QR Codes', route: '/admin/qr', desc: 'Printable service QR posters and counter rating placards', icon: 'qr', required_permission: 'qr_codes.view' },
  { id: 10, key: 'news', name: 'News & Announcements', route: '/admin/news', desc: 'Publish public notices, press releases, and municipal events', icon: 'news', required_permission: 'news.view' },
  { id: 11, key: 'cms', name: 'Landing Page CMS', route: '/admin/cms', desc: 'Configure citizen portal spotlight, hero banner, and FAQs', icon: 'palette', required_permission: 'cms.manage' },
  { id: 12, key: 'activity', name: 'Activity Log', route: '/admin/activity', desc: 'Audit trails and historical administrative event logs', icon: 'activity', required_permission: 'audit_logs.view' },
]

export const NAV_ITEM_TO_PERM_KEYS = {
  overview: ['dashboard.view'],
  dashboard: ['dashboard.view'],
  offices: ['organizations.view', 'organizations.create', 'organizations.update'],
  subcities: ['organizations.view', 'organizations.create', 'organizations.update'],
  levels: ['organizations.view', 'organizations.create', 'organizations.update'],
  accounts: ['users.view', 'users.create', 'users.update'],
  users: ['users.view', 'users.create', 'users.update'],
  roles: ['roles.view', 'roles.manage'],
  services: ['services.view', 'services.create', 'services.update'],
  routes: ['service_steps.view', 'service_steps.manage'],
  service_steps: ['service_steps.view', 'service_steps.manage'],
  feedback: ['feedback.view_own', 'feedback.view_descendants', 'feedback.update_status'],
  qr: ['qr_codes.view', 'qr_codes.manage'],
  qr_codes: ['qr_codes.view', 'qr_codes.manage'],
  news: ['news.view', 'news.create', 'news.update', 'events.view', 'events.create', 'events.update'],
  events: ['events.view', 'events.create', 'events.update'],
  cms: ['cms.manage'],
  activity: ['audit_logs.view'],
  audit_logs: ['audit_logs.view'],
}

const GROUP_LABELS = {
  organizations: 'Organizations & Hierarchy',
  users: 'User & Staff Accounts',
  roles: 'Roles & Access Control',
  services: 'Public Services & Standards',
  documents: 'Required Documents & Checklists',
  service_steps: 'Room Routes & Floor Steps',
  feedback: 'Citizen Feedback & Complaints',
  qr_codes: 'Feedback QR Codes',
  news: 'Public News & Notices',
  events: 'Town Halls & Civic Events',
  cms: 'Landing Page CMS & Spotlight',
  dashboard: 'Analytics & Dashboards',
  audit_logs: 'Security Audit & Compliance Trails',
}

const getDefaultNavForScope = (scope) => {
  const s = (scope || '').toLowerCase()
  if (s === 'platform' || s === 'global') {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
  if (s === 'sub-city' || s === 'subcity' || s === 'sub_city') {
    return [1, 2, 4, 6, 7, 8, 9, 10]
  }
  if (s === 'woreda') {
    return [1, 6, 7, 8, 9, 10]
  }
  if (s === 'bureau') {
    return [1, 6, 7, 8, 9]
  }
  return [1, 6, 7, 8]
}

function RoleFormInner({ role, onClose, onSave, isLoading = false }) {
  const { data: apiOrgTypes } = useGetOrganizationTypesQuery()
  const { data: apiNavItems } = useGetNavigationItemsQuery()
  const { data: apiPermissions } = useGetPermissionsQuery()

  // 1. Unified navigation items
  const navItemsList = useMemo(() => {
    if (apiNavItems?.data && Array.isArray(apiNavItems.data) && apiNavItems.data.length > 0) {
      return apiNavItems.data.map((item) => ({
        id: item.id,
        key: item.route ? item.route.replace('/admin/', '') : `nav_${item.id}`,
        name: item.label,
        route: item.route,
        desc: item.label ? `${item.label} module management and access` : '',
        icon: item.icon ? item.icon.toLowerCase() : 'layers',
        required_permission: item.required_permission,
      }))
    }
    return AVAILABLE_NAV_ITEMS
  }, [apiNavItems])

  // 2. Unified platform permissions
  const allPermissions = useMemo(() => {
    if (apiPermissions?.data && Array.isArray(apiPermissions.data)) {
      return apiPermissions.data
    }
    return []
  }, [apiPermissions])

  // Group permissions by category
  const permissionsByGroup = useMemo(() => {
    const map = {}
    allPermissions.forEach((p) => {
      const g = p.group || 'general'
      if (!map[g]) map[g] = []
      map[g].push(p)
    })
    return map
  }, [allPermissions])

  const hierarchyTiers = useMemo(() => {
    const list = [
      {
        scope: 'Platform',
        label: 'Platform-wide (Root)',
        badge: 'Tier 0 · Root',
        badgeTone: '#ecfdf5',
        color: '#047857',
        parentOf: 'Sub-City Admins & Platform Modules',
        reportsTo: 'None (Root Platform Authority)',
        desc: 'Platform-wide administrator with full authority across all modules and sub-cities.',
        icon: 'shield',
      },
    ]

    if (apiOrgTypes?.data && apiOrgTypes.data.length > 0) {
      apiOrgTypes.data.forEach((t) => {
        list.push({
          scope: t.name,
          label: `${t.name} Level`,
          badge: `Tier ${t.level} · ${t.name}`,
          badgeTone: t.level === 1 ? '#eff6ff' : t.level === 2 ? '#f5f3ff' : '#fffbeb',
          color: t.level === 1 ? '#1d4ed8' : t.level === 2 ? '#6d28d9' : '#b45309',
          parentOf: `Child units under ${t.name}`,
          reportsTo: 'Supervising Tier',
          desc: t.description || `Administers ${t.name} jurisdictional operations.`,
          icon: t.level === 1 ? 'map' : t.level === 2 ? 'building' : 'sitemap',
        })
      })
    } else {
      list.push(
        {
          scope: 'Sub-city',
          label: 'Sub-City Level',
          badge: 'Tier 1 · Sub-City',
          badgeTone: '#eff6ff',
          color: '#1d4ed8',
          parentOf: 'Woreda Admins & Sub-City Sector Bureaus',
          reportsTo: 'Platform Super Admin',
          desc: 'Administers own Sub-City jurisdiction and supervises all child Woredas and Bureaus.',
          icon: 'map',
        },
        {
          scope: 'Woreda',
          label: 'Woreda Level',
          badge: 'Tier 2 · Woreda',
          badgeTone: '#f5f3ff',
          color: '#6d28d9',
          parentOf: 'Woreda Bureaus, Service Desks & Local Staff',
          reportsTo: 'Sub-City Admin',
          desc: 'Administers local Woreda municipal operations, public service queues, and citizen desks.',
          icon: 'building',
        },
        {
          scope: 'Bureau',
          label: 'Bureau / Office Level',
          badge: 'Tier 3 · Bureau',
          badgeTone: '#fffbeb',
          color: '#b45309',
          parentOf: 'Operational Front-Desk Staff & Room Clerks',
          reportsTo: 'Sub-City Admin or Woreda Admin',
          desc: 'Supervises sector-specific service workflows, room guides, and operational attendants.',
          icon: 'sitemap',
        }
      )
    }

    list.push({
      scope: 'Staff',
      label: 'Operational Desk Staff',
      badge: 'Tier 4 · Front-line',
      badgeTone: '#f8fafc',
      color: '#475569',
      parentOf: 'Citizen Service Execution (No subordinates)',
      reportsTo: 'Bureau Admin or Woreda Admin',
      desc: 'Front-desk operator receiving citizens, checking documents, and updating room steps.',
      icon: 'activity',
    })

    return list
  }, [apiOrgTypes])

  // Form State
  const [step, setStep] = useState(1)
  const [name, setName] = useState(role?.name || '')
  const [scope, setScope] = useState(role?.scope_level || role?.scope || 'Sub-city')
  const [description, setDescription] = useState(role?.description || '')

  // Step 2: Selected navigation item IDs (numbers)
  const [selectedNavIds, setSelectedNavIds] = useState(() => {
    if (role?.navigation_item_ids && Array.isArray(role.navigation_item_ids) && role.navigation_item_ids.length > 0) {
      return role.navigation_item_ids
    }
    if (role?.navigation_items && Array.isArray(role.navigation_items)) {
      return role.navigation_items.map((i) => (typeof i === 'object' ? i.id : i))
    }
    return getDefaultNavForScope(role?.scope_level || role?.scope || 'Sub-city')
  })

  // Step 3: Selected permission IDs (numbers)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(() => {
    if (role?.permission_ids && Array.isArray(role.permission_ids) && role.permission_ids.length > 0) {
      return role.permission_ids
    }
    if (role?.permissions && Array.isArray(role.permissions)) {
      return role.permissions.map((p) => p.id)
    }
    return []
  })

  const [hasManuallyEditedPermissions, setHasManuallyEditedPermissions] = useState(
    Boolean(role?.permission_ids?.length || role?.permissions?.length)
  )
  const [permSearch, setPermSearch] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)

  const currentTier = hierarchyTiers.find((t) => t.scope.toLowerCase() === scope.toLowerCase()) || hierarchyTiers[1]

  const handleScopeChange = (newScope) => {
    setScope(newScope)
    if (!role) {
      const defaultNav = getDefaultNavForScope(newScope)
      setSelectedNavIds(defaultNav)
    }
  }

  // Auto-derive recommended permissions from selected navigation items
  const derivePermissionsFromNav = (navIds) => {
    const requiredKeys = new Set()
    navIds.forEach((navId) => {
      const item = navItemsList.find((n) => n.id === navId)
      if (item?.required_permission) {
        requiredKeys.add(item.required_permission)
      }
      const itemKey = item?.key || (item?.route ? item.route.replace('/admin/', '') : '')
      if (itemKey && NAV_ITEM_TO_PERM_KEYS[itemKey]) {
        NAV_ITEM_TO_PERM_KEYS[itemKey].forEach((k) => requiredKeys.add(k))
      }
    })

    return allPermissions
      .filter((p) => requiredKeys.has(p.key))
      .map((p) => p.id)
  }

  // Pre-seed permissions if not manually customized yet
  const goToPermissionsStep = () => {
    if (selectedNavIds.length === 0) {
      setErrorMsg('Please select at least one navigation item.')
      return
    }
    setErrorMsg(null)

    if (!hasManuallyEditedPermissions || selectedPermissionIds.length === 0) {
      const derived = derivePermissionsFromNav(selectedNavIds)
      if (derived.length > 0) {
        setSelectedPermissionIds(derived)
      }
    }
    setStep(3)
  }

  const togglePermission = (permId) => {
    setHasManuallyEditedPermissions(true)
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    )
  }

  const toggleGroupPermissions = (groupKey) => {
    setHasManuallyEditedPermissions(true)
    const groupPerms = permissionsByGroup[groupKey] || []
    const groupIds = groupPerms.map((p) => p.id)
    const allSelected = groupIds.every((id) => selectedPermissionIds.includes(id))

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !groupIds.includes(id)))
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...groupIds])))
    }
  }

  const handleSelectAllPermissions = () => {
    setHasManuallyEditedPermissions(true)
    setSelectedPermissionIds(allPermissions.map((p) => p.id))
  }

  const handleClearAllPermissions = () => {
    setHasManuallyEditedPermissions(true)
    setSelectedPermissionIds([])
  }

  const handleResetToNavPermissions = () => {
    const derived = derivePermissionsFromNav(selectedNavIds)
    setSelectedPermissionIds(derived)
    setHasManuallyEditedPermissions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Role title is required.')
        return
      }
      setErrorMsg(null)
      setStep(2)
      return
    }

    if (step === 2) {
      goToPermissionsStep()
      return
    }

    // Step 3 submission
    if (selectedPermissionIds.length === 0) {
      setErrorMsg('Please assign at least one permission to this role.')
      return
    }

    setErrorMsg(null)

    const normalizeScope = (s) => {
      const lower = (s || '').toLowerCase()
      if (lower.includes('platform') || lower.includes('global')) return 'global'
      if (lower.includes('subcity') || lower.includes('sub-city') || lower.includes('sub_city')) return 'sub_city'
      if (lower.includes('woreda')) return 'woreda'
      if (lower.includes('bureau') || lower.includes('office')) return 'bureau'
      if (lower.includes('staff')) return 'staff'
      return lower.replace(/[^a-z0-9]+/g, '_')
    }

    try {
      const payload = {
        name: name.trim(),
        scope,
        scope_level: normalizeScope(scope),
        description: description.trim() || 'Custom administrative role with tailored access.',
        navigation_items: selectedNavIds,
        navigationItems: selectedNavIds,
        permission_ids: selectedPermissionIds,
        permissionIds: selectedPermissionIds,
      }

      if (role?.id) {
        payload.id = role.id
      } else {
        const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
        payload.slug = generatedSlug || `role_${Date.now()}`
      }

      await onSave(payload)
      onClose()
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save role.')
    }
  }

  // Filter permissions in Step 3
  const filteredGroups = useMemo(() => {
    if (!permSearch.trim()) return permissionsByGroup

    const search = permSearch.toLowerCase()
    const filtered = {}
    Object.entries(permissionsByGroup).forEach(([gKey, perms]) => {
      const matched = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.key.toLowerCase().includes(search) ||
          (p.description && p.description.toLowerCase().includes(search))
      )
      if (matched.length > 0) {
        filtered[gKey] = matched
      }
    })
    return filtered
  }, [permissionsByGroup, permSearch])

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <div>
          <span className="panel-eyebrow">
            ACCESS CONTROL & GOVERNANCE • STEP {step} OF 3
          </span>
          <h2>
            {step === 1 && (role ? 'Edit Custom Role' : 'Step 1: Role Definition & Hierarchy')}
            {step === 2 && 'Step 2: Assign Sidebar Navigation Items'}
            {step === 3 && 'Step 3: Assign Functional Permissions'}
          </h2>
          <p>
            {step === 1 && 'Define role title, administrative jurisdiction boundary, and operational purpose.'}
            {step === 2 && `Choose which navigation modules appear in the sidebar for personnel with the "${name || 'new'}" role.`}
            {step === 3 && `Select granular read, create, update, and manage capabilities assigned to this role.`}
          </p>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" />
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            margin: '0.75rem 1.5rem 0',
            padding: '10px 14px',
            borderRadius: '6px',
            background: '#fef2f2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Icon name="close" size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: ROLE INFO & SCOPE */}
      {step === 1 && (
        <div className="modal-form-grid" style={{ padding: '1.25rem 1.5rem' }}>
          <label className="modal-field full">
            <span>Role title <i>*</i></span>
            <input
              required
              placeholder="e.g. Public Communications Officer, Sub-City Auditor, or Woreda Registrar"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrorMsg(null)
              }}
              autoFocus
            />
          </label>

          <label className="modal-field full">
            <span>Organizational boundary scope <i>*</i></span>
            <select value={scope} onChange={(e) => handleScopeChange(e.target.value)}>
              {hierarchyTiers.map((tier) => (
                <option key={tier.scope} value={tier.scope}>
                  {tier.label}
                </option>
              ))}
            </select>
          </label>

          {/* INTERACTIVE HIERARCHY CARD */}
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="sitemap" size={15} /> Administrative Hierarchy & Reporting Lines
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: currentTier.badgeTone,
                  color: currentTier.color,
                  border: `1px solid ${currentTier.color}30`,
                }}
              >
                {currentTier.badge}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#ffffff',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <small style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  DIRECT PARENT (REPORTS TO)
                </small>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#0284c7' }}>&uarr;</span> {currentTier.reportsTo}
                </div>
              </div>
              <div>
                <small style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  PARENT OF (MANAGES & SUPERVISES)
                </small>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#16a34a' }}>&darr;</span> {currentTier.parentOf}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '11px' }}>
              {hierarchyTiers.map((tier, idx) => {
                const isSelected = tier.scope.toLowerCase() === scope.toLowerCase()
                return (
                  <div key={tier.scope} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      onClick={() => handleScopeChange(tier.scope)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: isSelected ? '#164a54' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #164a54' : '1px solid #e2e8f0',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {tier.label.split(' ')[0]}
                    </span>
                    {idx < hierarchyTiers.length - 1 && <span style={{ color: '#94a3b8' }}>&rarr;</span>}
                  </div>
                )
              })}
            </div>

            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
              {currentTier.desc}
            </p>
          </div>

          <label className="modal-field full">
            <span>Role description & operational purpose</span>
            <textarea
              rows={3}
              placeholder="Describe what personnel assigned to this role will be responsible for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* STEP 2: NAVIGATION ITEMS */}
      {step === 2 && (
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '440px', overflowY: 'auto' }}>
          <div
            style={{
              padding: '10px 14px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: '#1e40af',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name="info" size={16} />
            <span>
              Selecting navigation items below defines sidebar visibility and automatically recommends corresponding permissions for Step 3.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              Available Sidebar Items ({selectedNavIds.length} of {navItemsList.length} selected)
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                style={{ border: 'none', background: 'none', color: '#0369a1', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSelectedNavIds(navItemsList.map((p) => p.id))}
              >
                Select all
              </button>
              <button
                type="button"
                style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSelectedNavIds(getDefaultNavForScope(scope))}
              >
                Reset to scope default
              </button>
              <button
                type="button"
                style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setSelectedNavIds([])}
              >
                Clear all
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {navItemsList.map((item) => {
              const isChecked = selectedNavIds.includes(item.id)
              return (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: isChecked ? '1.5px solid #047857' : '1px solid #e2e8f0',
                    background: isChecked ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNavIds((prev) => [...prev, item.id])
                      } else {
                        setSelectedNavIds((prev) => prev.filter((id) => id !== item.id))
                      }
                      setErrorMsg(null)
                    }}
                    style={{ cursor: 'pointer', accentColor: '#047857', width: '16px', height: '16px' }}
                  />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        {item.name}
                      </span>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.35 }}>
                        {item.desc || item.route}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {item.route}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 3: ASSIGN PERMISSIONS */}
      {step === 3 && (
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '460px', overflowY: 'auto' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: selectedPermissionIds.length > 0 ? '#047857' : '#991b1b',
                  background: selectedPermissionIds.length > 0 ? '#ecfdf5' : '#fef2f2',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: `1px solid ${selectedPermissionIds.length > 0 ? '#04785730' : '#ef444430'}`,
                }}
              >
                {selectedPermissionIds.length} of {allPermissions.length} permissions assigned
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                style={{ border: 'none', background: 'none', color: '#0369a1', cursor: 'pointer', fontWeight: 600 }}
              >
                Select all
              </button>
              <button
                type="button"
                onClick={handleResetToNavPermissions}
                style={{ border: 'none', background: 'none', color: '#047857', cursor: 'pointer', fontWeight: 600 }}
                title="Re-apply permissions recommended by selected navigation items"
              >
                Reset to Nav defaults
              </button>
              <button
                type="button"
                onClick={handleClearAllPermissions}
                style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Search Filter */}
          <div style={{ marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Filter permissions by name, code or description..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Grouped Permissions Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(filteredGroups).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '13px' }}>
                No permissions matching "{permSearch}"
              </div>
            ) : (
              Object.entries(filteredGroups).map(([groupKey, perms]) => {
                const groupSelectedCount = perms.filter((p) => selectedPermissionIds.includes(p.id)).length
                const allGroupSelected = groupSelectedCount === perms.length

                return (
                  <div
                    key={groupKey}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#ffffff',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Group Header */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                          {GROUP_LABELS[groupKey] || groupKey.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: groupSelectedCount > 0 ? '#dcfce7' : '#f1f5f9',
                            color: groupSelectedCount > 0 ? '#15803d' : '#64748b',
                          }}
                        >
                          {groupSelectedCount} / {perms.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGroupPermissions(groupKey)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: allGroupSelected ? '#dc2626' : '#0284c7',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {allGroupSelected ? 'Deselect group' : 'Select group'}
                      </button>
                    </div>

                    {/* Permissions list in group */}
                    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {perms.map((p) => {
                        const isChecked = selectedPermissionIds.includes(p.id)
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              background: isChecked ? '#f0fdf4' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background 0.1s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.id)}
                              style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#047857', width: '15px', height: '15px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                                  {p.name}
                                </span>
                                <code
                                  style={{
                                    fontSize: '10.5px',
                                    color: '#475569',
                                    background: '#f1f5f9',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                  }}
                                >
                                  {p.key}
                                </code>
                              </div>
                              {p.description && (
                                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b', lineHeight: 1.3 }}>
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* FOOTER WIZARD CONTROLS */}
      <div className="modal-footer">
        {step === 1 && (
          <>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Step 1 of 3: Role definition & scope
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="button primary" onClick={handleSubmit}>
                Next: Navigation Items <Icon name="arrow" size={15} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <button type="button" className="button secondary" onClick={() => setStep(1)}>
              <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
                <Icon name="arrow" size={15} />
              </span>{' '}
              Back to Details
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="button primary" onClick={goToPermissionsStep}>
                Next: Assign Permissions <Icon name="arrow" size={15} />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <button type="button" className="button secondary" onClick={() => setStep(2)}>
              <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
                <Icon name="arrow" size={15} />
              </span>{' '}
              Back to Navigation
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={isLoading}>
                {isLoading
                  ? 'Saving Role...'
                  : role
                  ? 'Save Role Changes'
                  : `Create Role (${selectedPermissionIds.length} Permissions)`}
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  )
}

function RoleModal({ role, isOpen, onClose, onSave, isLoading = false }) {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay">
      <section
        className="modal-card modal-form"
        role="dialog"
        aria-modal="true"
        aria-label={role ? 'Edit custom role' : 'Create custom role'}
        style={{ maxWidth: '720px', width: '94%' }}
      >
        <RoleFormInner key={role ? role.id : 'new'} role={role} onClose={onClose} onSave={onSave} isLoading={isLoading} />
      </section>
    </div>,
    document.body
  )
}

export default RoleModal
