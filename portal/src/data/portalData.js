
export const ROLE = {
  super: { label: 'Super admin', title: 'Platform administration', organization: 'CivicLink Ethiopia', name: 'Mekdes Tadesse', initials: 'MT' },
  subcity: { label: 'Sub-city admin', title: 'Sub-city administration', organization: 'Lemi Kura Sub-city', name: 'Aster Bekele', initials: 'AB' },
  bureau: { label: 'Bureau admin', title: 'Bureau operations', organization: 'Revenues Bureau · Lemi Kura', name: 'Dawit Alemu', initials: 'DA' },
}

export const NAV = {
  super: [
    { label: '', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'offices', text: 'Offices & directory', icon: 'sitemap' }, { id: 'levels', text: 'Organization levels', icon: 'layers' }, { id: 'accounts', text: 'Accounts', icon: 'users' }, { id: 'roles', text: 'Roles & permissions', icon: 'key' }] },
    { label: 'Public services', items: [{ id: 'services', text: 'Service standards', icon: 'layers' }, { id: 'documents', text: 'Required documents', icon: 'file' }] },
    { label: 'Public experience', items: [{ id: 'cms', text: 'Landing page CMS', icon: 'palette' }, { id: 'news', text: 'News & events', icon: 'news' }] },
    { label: 'Citizen voice', items: [{ id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '23' }, { id: 'activity', text: 'Activity log', icon: 'activity' }] },
  ],
  subcity: [
    { label: 'Workspace', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'offices', text: 'Bureaus & offices', icon: 'sitemap' }, { id: 'services', text: 'Service standards', icon: 'layers' }, { id: 'documents', text: 'Required documents', icon: 'file' }] },
    { label: 'Community', items: [{ id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '8' }, { id: 'news', text: 'News & events', icon: 'news' }] },
  ],
  bureau: [
    { label: 'Workspace', items: [{ id: 'overview', text: 'Overview', icon: 'overview' }, { id: 'services', text: 'Service standards', icon: 'layers' }, { id: 'documents', text: 'Required documents', icon: 'file' }, { id: 'routes', text: 'Room routes', icon: 'route' }, { id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '5' }] },
    { label: 'Office tools', items: [{ id: 'qr', text: 'Feedback QR codes', icon: 'qr' }, { id: 'office', text: 'Office profile', icon: 'building' }] },
  ],
}

export const INITIAL_OFFICE_TYPES = [
  { id: 1, name: 'Sub-City', description: 'Municipal sub-city administrative center', level: 1 },
  { id: 2, name: 'Woreda', description: 'Local community administrative branch', level: 2 },
  { id: 3, name: 'Bureau', description: 'Specialized public service bureau or sector office', level: 3 },
  { id: 4, name: 'Service Center', description: 'Walk-in civic service desk or satellite branch', level: 4 },
]

export const INITIAL_OFFICES = []

export const INITIAL_ROLES = [
  {
    id: '1',
    name: 'Super Admin',
    slug: 'super_admin',
    scope: 'Platform',
    scope_level: 'global',
    description: 'Platform-wide administrator with full authority across all modules.',
    isSystem: true,
    permissionsCount: 38,
    permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
    userCount: 2,
  },
  {
    id: '2',
    name: 'Sub-City Admin',
    slug: 'sub_city_admin',
    scope: 'Sub-city',
    scope_level: 'sub_city',
    description: 'Sub-City level administrator managing own organization and descendant Woredas/Bureaus.',
    isSystem: true,
    permissionsCount: 28,
    permissionIds: [1, 2, 3, 5, 6, 7, 8, 9, 12, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
    userCount: 11,
  },
  {
    id: '3',
    name: 'Woreda Admin',
    slug: 'woreda_admin',
    scope: 'Woreda',
    scope_level: 'woreda',
    description: 'Woreda level administrator managing Woreda operations and descendant Bureaus.',
    isSystem: true,
    permissionsCount: 20,
    permissionIds: [1, 5, 6, 7, 9, 12, 17, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36],
    userCount: 45,
  },
  {
    id: '4',
    name: 'Bureau Admin',
    slug: 'bureau_admin',
    scope: 'Bureau',
    scope_level: 'bureau',
    description: 'Bureau level administrator managing Bureau staff, service steps, and own feedback.',
    isSystem: true,
    permissionsCount: 16,
    permissionIds: [1, 5, 12, 17, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 31, 33, 34, 36],
    userCount: 30,
  },
  {
    id: '5',
    name: 'Operational Staff',
    slug: 'staff',
    scope: 'Staff',
    scope_level: 'staff',
    description: 'Operational government staff member with service navigation and feedback viewing rights.',
    isSystem: true,
    permissionsCount: 5,
    permissionIds: [12, 17, 19, 31, 36],
    userCount: 120,
  },
]

export const INITIAL_SUBCITIES = []
export const INITIAL_BUREAUS = []
export const INITIAL_ACCOUNTS = []
export const INITIAL_SERVICES = []
export const INITIAL_ROUTES = []
export const INITIAL_FEEDBACK = []
export const INITIAL_POSTS = []
export const INITIAL_ACTIVITIES = []
