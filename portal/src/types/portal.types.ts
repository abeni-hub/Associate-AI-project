export type RoleKey = 'super' | 'subcity' | 'bureau';

export interface RoleMeta {
  label: string;
  title: string;
  organization: string;
  name: string;
  initials: string;
}

export interface NavItem {
  id: string;
  text: string;
  icon: string;
  badge?: string;
  path: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface SubcityItem {
  id: number;
  name: string;
  admin: string;
  bureaus: number;
  services: number;
  status: string;
  updated: string;
}

export interface BureauItem {
  id: number;
  name: string;
  category: string;
  admin: string;
  services: number;
  completion: number;
  status: string;
}

export interface OfficeType {
  id: number;
  name: string;
  description: string;
  level: number;
  can_be_root?: boolean;
}

export interface OfficeItem {
  id: number;
  typeId: number;
  typeName?: string;
  typeCode?: string;
  name: string;
  code?: string;
  parentId: number | null;
  admin?: string;
  email?: string;
  phone?: string;
  address?: string;
  services: number;
  completion: number;
  status: 'Active' | 'Inactive' | string;
  updated: string;
  parentTypeId?: number;
  subcityId?: number | null;
}

export interface RoleItem {
  id: string;
  slug?: string;
  name: string;
  description: string;
  scope: string;
  userCount: number;
  isSystem: boolean;
  permissionsCount?: number;
  permissionIds?: number[];
  permissions: Record<string, string[]>;
  navigationItems?: string[];
  dashboard_pages?: string[];
}

export interface AccountItem {
  id: number;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  role_id?: number;
  roleId?: number;
  organization: string;
  organization_id?: number | null;
  status: string;
  lastActive: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  serviceType: string;
  parentService: string;
  description: string;
  documents: string[];
  bureaus: number;
  published: boolean;
  customerExpectations: string;
  bureauExpectations: string;
}

export interface RouteStep {
  id?: number;
  room: string;
  title: string;
  detail: string;
  floor?: string;
  building?: string;
  department?: string;
}

export interface RouteItem {
  id: number;
  service: string;
  category: string;
  bureau: string;
  status: string;
  updated: string;
  steps: RouteStep[];
}

export interface FeedbackItem {
  id: string;
  numericId?: number;
  type: 'Complaint' | 'Satisfaction' | 'Suggestion' | string;
  rating: number | null;
  service: string;
  bureau: string;
  subcity: string;
  message: string;
  status: 'Open' | 'In review' | 'Resolved' | string;
  priority: 'High' | 'Normal' | 'Low' | string;
  time: string;
  trackingNumber?: string;
  notes?: string[];
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  response?: string;
}

export interface PostItem {
  id: number | string;
  type: 'News' | 'Event' | 'news' | 'event' | string;
  title: string;
  titleAm?: string;
  summary?: string;
  summaryAm?: string;
  content?: string;
  contentAm?: string;
  category?: string;
  categoryAm?: string;
  bureau?: string;
  bureauAm?: string;
  subCity?: string;
  subCityAm?: string;
  location?: {
    subCity?: string;
    subCityAm?: string;
    venue?: string;
    venueAm?: string;
    address?: string;
    addressAm?: string;
    isVirtual?: boolean;
  };
  coverImage?: string;
  images?: string[];
  organization_id?: number;
  contents?: any[];
  author?: {
    name?: string;
    nameAm?: string;
    role?: string;
    roleAm?: string;
    avatar?: string;
  };
  tags?: string[];
  readTimeMinutes?: number;
  time?: string;
  timeAm?: string;
  organizer?: string;
  organizerAm?: string;
  capacity?: number;
  rsvpCount?: number;
  endDate?: string;
  slug?: string;
  excerpt?: string;
  date?: string;
  eventDate?: string;
  publishedAt?: string;
  status?: 'Published' | 'Draft' | string;
  isPublished?: boolean;
  audience?: string;
}

export interface BureauProfile {
  bureau: string;
  hours: string;
  location: string;
  admin: string;
  contact: string;
}

export type FormFieldOption = string | { value: string; label: string };

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  options?: FormFieldOption[];
  full?: boolean;
  rows?: number;
  visibleWhen?: (values: Record<string, string>) => boolean;
}

export interface FormModalConfig {
  kind: 'form';
  eyebrow?: string;
  title: string;
  description?: string;
  submit?: string;
  footerNote?: string;
  size?: string;
  fields: FormFieldConfig[];
  onSubmit: (values: Record<string, string>) => void;
}

export interface RouteModalConfig {
  kind: 'route';
  route: RouteItem;
  onSave: (steps: RouteStep[]) => void;
}

export interface FeedbackModalConfig {
  kind: 'feedback';
  item: FeedbackItem;
  onUpdate: (status: string) => void;
}

export interface QRModalConfig {
  kind: 'qr';
  qr?: any;
  onGenerate?: () => void;
  onCreated?: (created: any) => void;
}

export type ModalConfig =
  | FormModalConfig
  | RouteModalConfig
  | FeedbackModalConfig
  | QRModalConfig
  | null;
