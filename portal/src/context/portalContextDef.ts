import { createContext } from 'react';
import type {
  AccountItem,
  BureauItem,
  FeedbackItem,
  FormFieldConfig,
  ModalConfig,
  PostItem,
  RoleKey,
  RouteItem,
  RouteStep,
  ServiceItem,
  SubcityItem,
} from '../types/portal.types';
import type { AuthUser } from '../features/auth/auth.types';

export interface PortalSession {
  role: RoleKey;
  user?: AuthUser | null;
}

export interface PortalContextType {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  session: PortalSession | null;
  authUser: AuthUser | null;
  signInLive: (user: AuthUser, token?: string) => void;
  signOut: () => Promise<void> | void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  modal: ModalConfig;
  setModal: (modal: ModalConfig) => void;
  search: string;
  setSearch: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  resetSearch: () => void;
  subcities: SubcityItem[];
  bureaus: BureauItem[];
  accounts: AccountItem[];
  services: ServiceItem[];
  routes: RouteItem[];
  feedback: FeedbackItem[];
  posts: PostItem[];
  visibleFeedback: FeedbackItem[];
  openForm: (config: {
    eyebrow?: string;
    title: string;
    description?: string;
    submit?: string;
    fields: FormFieldConfig[];
    onSubmit: (values: Record<string, string>) => void;
  }) => void;
  openFeedback: (item: FeedbackItem) => void;
  createForPage: (page: string) => void;
  onUpdateService: (item: ServiceItem) => void;
  onToggleServicePublish: (id: number) => void;
  onUpdatePost: (id: number | string, updates: Partial<PostItem>) => void;
  onTogglePostPublish: (id: number | string) => void;
  saveRouteSteps: (routeId: number, steps: RouteStep[]) => void;
}

export const PortalContext = createContext<PortalContextType | undefined>(undefined);
