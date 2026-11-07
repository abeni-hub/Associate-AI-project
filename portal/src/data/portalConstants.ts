import type {
  AccountItem,
  BureauItem,
  FeedbackItem,
  NavGroup,
  PostItem,
  RoleKey,
  RoleMeta,
  RouteItem,
  ServiceItem,
  SubcityItem,
} from '../types/portal.types';

export const ROLE: Record<RoleKey, RoleMeta> = {
  super: {
    label: 'Super admin',
    title: 'Platform administration',
    organization: 'CivicLink Ethiopia',
    name: 'Mekdes Tadesse',
    initials: 'MT',
  },
  subcity: {
    label: 'Sub-city admin',
    title: 'Sub-city administration',
    organization: 'Lemi Kura Sub-city',
    name: 'Aster Bekele',
    initials: 'AB',
  },
  bureau: {
    label: 'Bureau admin',
    title: 'Bureau operations',
    organization: 'Revenues Bureau · Lemi Kura',
    name: 'Dawit Alemu',
    initials: 'DA',
  },
};

export const NAV: Record<RoleKey, NavGroup[]> = {
  super: [
    {
      label: 'Workspace',
      items: [
        { id: 'overview', text: 'Overview', icon: 'overview', path: '/overview' },
        { id: 'subcities', text: 'Sub-cities', icon: 'map', path: '/subcities' },
        { id: 'accounts', text: 'Accounts', icon: 'users', path: '/accounts' },
      ],
    },
    {
      label: 'Platform',
      items: [
        { id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '23', path: '/feedback' },
        { id: 'activity', text: 'Activity log', icon: 'activity', path: '/activity' },
      ],
    },
  ],
  subcity: [
    {
      label: 'Workspace',
      items: [
        { id: 'overview', text: 'Overview', icon: 'overview', path: '/overview' },
        { id: 'bureaus', text: 'Bureaus', icon: 'building', path: '/bureaus' },
        { id: 'services', text: 'Service standards', icon: 'layers', path: '/services' },
      ],
    },
    {
      label: 'Community',
      items: [
        { id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '8', path: '/feedback' },
        { id: 'news', text: 'News & events', icon: 'news', path: '/news' },
      ],
    },
  ],
  bureau: [
    {
      label: 'Workspace',
      items: [
        { id: 'overview', text: 'Overview', icon: 'overview', path: '/overview' },
        { id: 'routes', text: 'Room routes', icon: 'route', path: '/routes' },
        { id: 'feedback', text: 'Citizen feedback', icon: 'message', badge: '5', path: '/feedback' },
      ],
    },
    {
      label: 'Office tools',
      items: [
        { id: 'qr', text: 'Feedback QR codes', icon: 'qr', path: '/qr' },
        { id: 'office', text: 'Office profile', icon: 'building', path: '/office' },
      ],
    },
  ],
};

export const INITIAL_SUBCITIES: SubcityItem[] = [];
export const INITIAL_BUREAUS: BureauItem[] = [];
export const INITIAL_ACCOUNTS: AccountItem[] = [];
export const INITIAL_SERVICES: ServiceItem[] = [];
export const INITIAL_ROUTES: RouteItem[] = [];
export const INITIAL_FEEDBACK: FeedbackItem[] = [];
export const INITIAL_POSTS: PostItem[] = [];
