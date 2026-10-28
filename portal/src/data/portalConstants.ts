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
import { MOCK_EVENTS, MOCK_NEWS } from '../../../client/src/services/newsEventsService.js';

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

export const INITIAL_SUBCITIES: SubcityItem[] = [
  { id: 1, name: 'Lemi Kura', admin: 'Aster Bekele', bureaus: 9, services: 32, status: 'Active', updated: 'Today' },
  { id: 2, name: 'Bole', admin: 'Henok Girma', bureaus: 11, services: 41, status: 'Active', updated: 'Yesterday' },
  { id: 3, name: 'Yeka', admin: 'Mimi Tesfaye', bureaus: 8, services: 27, status: 'Active', updated: 'Oct 20, 2026' },
  { id: 4, name: 'Kirkos', admin: 'Solomon Worku', bureaus: 10, services: 36, status: 'Setup', updated: 'Oct 19, 2026' },
  { id: 5, name: 'Arada', admin: 'Rahel Kebede', bureaus: 7, services: 24, status: 'Active', updated: 'Oct 18, 2026' },
  { id: 6, name: 'Addis Ketema', admin: 'Abel Fikru', bureaus: 9, services: 29, status: 'Active', updated: 'Oct 17, 2026' },
  { id: 7, name: 'Gulele', admin: 'Samrawit Mamo', bureaus: 6, services: 21, status: 'Active', updated: 'Oct 16, 2026' },
  { id: 8, name: 'Kolfe Keranio', admin: 'Natnael Assefa', bureaus: 7, services: 25, status: 'Active', updated: 'Oct 15, 2026' },
  { id: 9, name: 'Lideta', admin: 'Hana Mekonnen', bureaus: 5, services: 19, status: 'Active', updated: 'Oct 14, 2026' },
  { id: 10, name: 'Akaki Kality', admin: 'Yohannes Daba', bureaus: 8, services: 28, status: 'Active', updated: 'Oct 13, 2026' },
  { id: 11, name: 'Nifas Silk-Lafto', admin: 'Marta Solomon', bureaus: 10, services: 33, status: 'Active', updated: 'Oct 12, 2026' },
];

export const INITIAL_BUREAUS: BureauItem[] = [
  { id: 1, name: 'Revenues Bureau', category: 'Revenue & tax', admin: 'Dawit Alemu', services: 8, completion: 92, status: 'Published' },
  { id: 2, name: 'Civil Registration Office', category: 'Civil services', admin: 'Meseret Hailu', services: 12, completion: 84, status: 'Published' },
  { id: 3, name: 'Land Administration', category: 'Land & property', admin: 'Tewodros Kassa', services: 6, completion: 68, status: 'Needs attention' },
  { id: 4, name: 'Trade & Industry Office', category: 'Business services', admin: 'Selamawit Abate', services: 9, completion: 100, status: 'Published' },
  { id: 5, name: 'Planning & Development', category: 'Planning', admin: 'Biruk Getachew', services: 5, completion: 56, status: 'In progress' },
  { id: 6, name: 'Health Services Office', category: 'Health & wellbeing', admin: 'Liya Getu', services: 7, completion: 73, status: 'Published' },
  { id: 7, name: 'Housing & Settlements', category: 'Housing', admin: 'Kebede Fanta', services: 4, completion: 48, status: 'In progress' },
  { id: 8, name: 'Public Transport Office', category: 'Transport', admin: 'Saron Abebe', services: 3, completion: 82, status: 'Published' },
  { id: 9, name: 'Social Development Office', category: 'Community services', admin: 'Abel Girma', services: 6, completion: 61, status: 'Needs attention' },
];

export const INITIAL_ACCOUNTS: AccountItem[] = [
  { id: 1, name: 'Aster Bekele', username: 'a.bekele', role: 'Sub-city admin', organization: 'Lemi Kura', status: 'Active', lastActive: 'Today, 9:42 AM' },
  { id: 2, name: 'Dawit Alemu', username: 'd.alemu', role: 'Bureau admin', organization: 'Revenues Bureau · Lemi Kura', status: 'Active', lastActive: 'Today, 9:18 AM' },
  { id: 3, name: 'Henok Girma', username: 'h.girma', role: 'Sub-city admin', organization: 'Bole', status: 'Active', lastActive: 'Yesterday' },
  { id: 4, name: 'Mimi Tesfaye', username: 'm.tesfaye', role: 'Sub-city admin', organization: 'Yeka', status: 'Active', lastActive: 'Oct 20, 2026' },
  { id: 5, name: 'Tewodros Kassa', username: 't.kassa', role: 'Bureau admin', organization: 'Land Administration · Lemi Kura', status: 'Pending', lastActive: 'Never' },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  { id: 1, name: 'Business license renewal', category: 'Business services', serviceType: 'Main service', parentService: '', description: 'Renew an active trade license for the new business year.', documents: ['Valid trade license', 'Tax clearance certificate', 'Renewal application form'], bureaus: 8, published: true, customerExpectations: 'Bring a valid trade license, tax clearance and a completed renewal form.', bureauExpectations: 'Review complete applications within 3 working days and explain any missing items.' },
  { id: 2, name: 'Birth registration & certificate', category: 'Civil registration', serviceType: 'Main service', parentService: '', description: 'Register a child’s birth and receive the official certificate.', documents: ['Birth notification paper', 'Parent or guardian ID', 'Child’s full name and date of birth'], bureaus: 7, published: true, customerExpectations: 'Bring original documents where available and have the child’s full details ready.', bureauExpectations: 'Check the details with care and explain the next step clearly.' },
  { id: 3, name: 'Landholding record correction', category: 'Land & property', serviceType: 'Sub-service', parentService: 'Land administration', description: 'Request an update to an existing land record.', documents: ['Kebele ID or Fayda ID', 'Current landholding certificate', 'Correction request letter'], bureaus: 4, published: true, customerExpectations: 'Bring your current certificate and clearly identify the record that needs correction.', bureauExpectations: 'Acknowledge complete requests at the service desk and explain the review steps.' },
  { id: 4, name: 'e-TIN registration', category: 'Revenue & tax', serviceType: 'Main service', parentService: '', description: 'Register for or update a taxpayer identification number.', documents: ['Valid ID', 'Business registration, if applicable'], bureaus: 6, published: false, customerExpectations: 'Bring a valid ID and business registration when applicable.', bureauExpectations: 'Explain any missing requirements and where to complete them.' },
  { id: 5, name: 'Residence ID card', category: 'Civil registration', serviceType: 'Sub-service', parentService: 'Civil registration', description: 'Apply for a resident identification card or update your details.', documents: ['Proof of residence', 'Recent photograph', 'Valid ID'], bureaus: 5, published: true, customerExpectations: 'Bring proof of residence, one recent photograph and a valid ID.', bureauExpectations: 'Review applications in the order received and provide clear status information.' },
];

export const INITIAL_ROUTES: RouteItem[] = [
  { id: 1, service: 'Business license renewal', category: 'Business services', bureau: 'Revenues Bureau', status: 'Published', updated: 'Oct 21, 2026', steps: [{ room: '03', title: 'Application review', detail: 'Submit your renewal documents for an initial check.' }, { room: '07', title: 'Payment desk', detail: 'Pay the service fee and keep your receipt.' }, { room: '09', title: 'License collection', detail: 'Collect your stamped renewed license.' }] },
  { id: 2, service: 'e-TIN registration', category: 'Revenue & tax', bureau: 'Revenues Bureau', status: 'Published', updated: 'Oct 20, 2026', steps: [{ room: '03', title: 'Document check', detail: 'An officer checks your ID and application.' }, { room: '05', title: 'Registration desk', detail: 'Complete your registration details.' }, { room: '09', title: 'Confirmation', detail: 'Receive your taxpayer identification confirmation.' }] },
  { id: 3, service: 'Tax clearance certificate', category: 'Revenue & tax', bureau: 'Revenues Bureau', status: 'Draft', updated: 'Oct 18, 2026', steps: [{ room: '03', title: 'Request review', detail: 'Present your account reference and request.' }, { room: '06', title: 'Account check', detail: 'An officer reviews your tax account.' }] },
  { id: 4, service: 'Business license amendment', category: 'Business services', bureau: 'Trade & Industry Office', status: 'Published', updated: 'Oct 17, 2026', steps: [{ room: '11', title: 'Submit change request', detail: 'Share your updated business information.' }, { room: '14', title: 'Verification', detail: 'The officer checks supporting documents.' }] },
];

export const INITIAL_FEEDBACK: FeedbackItem[] = [
  { id: 'FB-2048', type: 'Complaint', rating: null, service: 'Business license renewal', bureau: 'Revenues Bureau', subcity: 'Lemi Kura', message: 'I had to visit two desks before finding out one supporting paper was missing. A clearer checklist at the entrance would help.', status: 'Open', priority: 'High', time: 'Today · 9:24 AM' },
  { id: 'FB-2047', type: 'Satisfaction', rating: 5, service: 'Birth registration', bureau: 'Civil Registration Office', subcity: 'Lemi Kura', message: 'The room guide was very clear and the staff helped us finish in one visit. Thank you.', status: 'Resolved', priority: 'Low', time: 'Today · 8:51 AM' },
  { id: 'FB-2046', type: 'Suggestion', rating: null, service: 'Landholding record correction', bureau: 'Land Administration', subcity: 'Lemi Kura', message: 'Could the office list the accepted document formats on the public guide?', status: 'In review', priority: 'Normal', time: 'Yesterday · 3:16 PM' },
  { id: 'FB-2045', type: 'Complaint', rating: null, service: 'e-TIN registration', bureau: 'Revenues Bureau', subcity: 'Bole', message: 'The payment desk was closed during the posted opening hours.', status: 'Open', priority: 'Normal', time: 'Yesterday · 1:40 PM' },
  { id: 'FB-2044', type: 'Satisfaction', rating: 4, service: 'Residence ID card', bureau: 'Civil Registration Office', subcity: 'Yeka', message: 'Clear instructions and a friendly team. The wait was a little longer than expected.', status: 'Resolved', priority: 'Low', time: 'Oct 20 · 11:03 AM' },
  { id: 'FB-2043', type: 'Suggestion', rating: null, service: 'Business license renewal', bureau: 'Revenues Bureau', subcity: 'Lemi Kura', message: 'An example of a completed renewal form would make it easier to prepare.', status: 'In review', priority: 'Normal', time: 'Oct 20 · 10:17 AM' },
];

export const INITIAL_POSTS: PostItem[] = [...MOCK_NEWS, ...MOCK_EVENTS].map((item) => ({
  ...item,
  isPublished: !('isPublished' in item) || item.isPublished !== false,
}));
