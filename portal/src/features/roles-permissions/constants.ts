export interface RoleNavItemDisplay {
  id: number;
  key: string;
  label: string;
  route: string;
  icon: string;
  desc: string;
  required_permission: string | null;
  display_order: number;
}

export const DOMAIN_GROUPS: { id: string; label: string; desc: string; icon: string }[] = [
  { id: 'organizations', label: 'Organizations & Offices', desc: 'Jurisdictional structures, sub-cities, and bureaus.', icon: 'building' },
  { id: 'users', label: 'User Accounts & Access', desc: 'Administrative staff provisioning and authentication.', icon: 'users' },
  { id: 'roles', label: 'Roles & Governance', desc: 'Access control policies and administrative role definitions.', icon: 'shield' },
  { id: 'services', label: 'Public Services Catalog', desc: 'Government service criteria, subservices, and citizen guides.', icon: 'layers' },
  { id: 'documents', label: 'Required Documents', desc: 'Citizen document prerequisites and checklists.', icon: 'layers' },
  { id: 'service_steps', label: 'Room Navigation Routes', desc: 'Physical room sequence directions for office visitors.', icon: 'route' },
  { id: 'news', label: 'News & Announcements', desc: 'Citizen news items and public notices.', icon: 'news' },
  { id: 'events', label: 'Calendar Events', desc: 'Government community events and schedules.', icon: 'calendar' },
  { id: 'feedback', label: 'Citizen Voice & Feedback', desc: 'Complaints, compliments, and citizen resolution.', icon: 'message' },
  { id: 'qr_codes', label: 'Office QR Codes', desc: 'Physical desk QR tokens for direct feedback routing.', icon: 'qr' },
  { id: 'dashboard', label: 'Dashboard & Metrics', desc: 'Role-aware operational insights and analytics.', icon: 'activity' },
  { id: 'audit_logs', label: 'Security Audit Logs', desc: 'Immutable administrative system activity logs.', icon: 'lock' },
  { id: 'cms', label: 'Citizen Landing Page CMS', desc: 'Manage citizen portal landing page, announcement banner, and footer.', icon: 'palette' },
];

export const CANONICAL_NAVIGATION_ITEMS: RoleNavItemDisplay[] = [
  { id: 1, key: 'overview', label: 'Overview', route: '/admin/overview', icon: 'overview', desc: 'KPI metrics, service volume charts, and recent activity feed', required_permission: 'dashboard.view', display_order: 1 },
  { id: 2, key: 'offices', label: 'Offices & Directory', route: '/admin/subcities', icon: 'building', desc: 'Jurisdictional hierarchy, sub-cities, woredas, and bureaus directory', required_permission: 'organizations.view', display_order: 2 },
  { id: 3, key: 'levels', label: 'Organization Levels', route: '/admin/levels', icon: 'layers', desc: 'Configure municipal tier levels, hierarchy rank depth, and status', required_permission: 'organizations.view', display_order: 3 },
  { id: 4, key: 'accounts', label: 'Accounts & Staff', route: '/admin/accounts', icon: 'users', desc: 'Manage administrative staff accounts and roles', required_permission: 'users.view', display_order: 4 },
  { id: 5, key: 'roles', label: 'Roles & Permissions', route: '/admin/roles', icon: 'shield', desc: 'Access control policies, security roles, and permission matrix', required_permission: 'roles.view', display_order: 5 },
  { id: 6, key: 'services', label: 'Services & Standards', route: '/admin/services', icon: 'file', desc: 'Public service catalog, requirements, and completion tracking', required_permission: 'services.view', display_order: 6 },
  { id: 7, key: 'routes', label: 'Room Routes & Steps', route: '/admin/routes', icon: 'route', desc: 'Physical room-by-room citizen navigation guides and floor steps', required_permission: 'service_steps.view', display_order: 7 },
  { id: 8, key: 'feedback', label: 'Citizen Feedback', route: '/admin/feedback', icon: 'message', desc: 'Citizen complaints, ratings, and feedback resolution inbox', required_permission: 'feedback.view_own', display_order: 8 },
  { id: 9, key: 'qr', label: 'Feedback QR Codes', route: '/admin/qr', icon: 'qr', desc: 'Printable service QR posters and counter rating placards', required_permission: 'qr_codes.view', display_order: 9 },
  { id: 10, key: 'news', label: 'News & Announcements', route: '/admin/news', icon: 'news', desc: 'Publish public notices, press releases, and municipal events', required_permission: 'news.view', display_order: 10 },
  { id: 11, key: 'cms', label: 'Landing Page CMS', route: '/admin/cms', icon: 'palette', desc: 'Configure citizen portal spotlight, hero banner, and FAQs', required_permission: 'cms.manage', display_order: 11 },
  { id: 12, key: 'activity', label: 'Activity Log', route: '/admin/activity', icon: 'activity', desc: 'Audit trails and historical administrative event logs', required_permission: 'audit_logs.view', display_order: 12 },
];

export const getScopeDefaultNavIds = (scopeLevel?: string): number[] => {
  const s = (scopeLevel || '').toLowerCase();
  if (s === 'platform' || s === 'global' || s === 'super_admin') {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  if (s.includes('subcity') || s.includes('sub_city') || s.includes('sub-city')) {
    return [1, 2, 4, 6, 7, 8, 9, 10, 12];
  }
  if (s.includes('woreda')) {
    return [1, 4, 6, 7, 8, 9, 10];
  }
  if (s.includes('bureau')) {
    return [1, 4, 6, 7, 8, 9];
  }
  return [1, 6, 7, 8];
};

export const NAV_ITEM_TO_PERM_KEYS: Record<string, string[]> = {
  overview: ['dashboard.view'],
  offices: ['organizations.view', 'organizations.create', 'organizations.update'],
  levels: ['organizations.view'],
  accounts: ['users.view', 'users.create', 'users.update'],
  roles: ['roles.view'],
  services: ['services.view', 'services.create', 'services.update'],
  documents: ['documents.view', 'documents.manage'],
  routes: ['service_steps.view', 'service_steps.manage'],
  feedback: ['feedback.view_own', 'feedback.update_status'],
  qr: ['qr_codes.view', 'qr_codes.manage'],
  news: ['news.view', 'news.create', 'news.update', 'news.publish', 'events.view', 'events.create', 'events.update', 'events.publish'],
  cms: ['cms.manage'],
  activity: ['audit_logs.view'],
};

