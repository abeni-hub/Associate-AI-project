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

export interface AccountItem {
  id: number;
  name: string;
  username: string;
  role: string;
  organization: string;
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
  room: string;
  title: string;
  detail: string;
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
  type: 'Complaint' | 'Satisfaction' | 'Suggestion' | string;
  rating: number | null;
  service: string;
  bureau: string;
  subcity: string;
  message: string;
  status: 'Open' | 'In review' | 'Resolved' | string;
  priority: 'High' | 'Normal' | 'Low' | string;
  time: string;
}

export interface PostItem {
  id: number;
  type: 'News' | 'Event' | string;
  title: string;
  excerpt: string;
  date: string;
  status: 'Published' | 'Draft' | string;
  audience: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  options?: string[];
  full?: boolean;
  rows?: number;
}

export interface FormModalConfig {
  kind: 'form';
  eyebrow?: string;
  title: string;
  description?: string;
  submit?: string;
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
  onGenerate: () => void;
}

export type ModalConfig =
  | FormModalConfig
  | RouteModalConfig
  | FeedbackModalConfig
  | QRModalConfig
  | null;
