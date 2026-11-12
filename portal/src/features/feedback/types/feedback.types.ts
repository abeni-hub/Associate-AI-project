import type { PaginationQueryParams } from '../../../types/api.types';

export type FeedbackType = 'Complaint' | 'Satisfaction' | 'Suggestion';

export type FeedbackStatus = 'Open' | 'In review' | 'Resolved' | 'Closed';

export type BackendFeedbackType = 'complaint' | 'feedback' | 'satisfaction';

export type BackendFeedbackStatus = 'submitted' | 'under_review' | 'resolved' | 'closed';

/**
 * Raw feedback contract received from the backend API.
 */
export interface RawCitizenFeedback {
  id: number | string;
  feedback_for_organization?: number;
  feedback_content?: string;
  feedback_type?: BackendFeedbackType;
  tracking_number?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  rating?: number | null;
  status?: string;
  priority?: 'Low' | 'Normal' | 'High';
  response?: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
  service?: string;
  bureau?: string;
  subcity?: string;
  organization?: {
    id: number;
    name: string;
    code: string;
  };
}

/**
 * Normalized UI domain model consumed by components.
 */
export interface NormalizedFeedbackItem {
  id: string;
  numericId?: number;
  trackingNumber?: string;
  type: FeedbackType;
  service: string;
  bureau: string;
  subcity: string;
  message: string;
  rating: number;
  time: string;
  status: FeedbackStatus;
  priority: 'Low' | 'Normal' | 'High';
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  response?: string;
}

export interface FeedbackFilterParams extends PaginationQueryParams {
  type?: string;
  status?: string;
  bureau_id?: number;
  subcity_id?: number;
}

export interface UpdateFeedbackStatusPayload {
  id: string | number;
  status?: BackendFeedbackStatus;
  response?: string;
}

export interface FeedbackMetrics {
  total: number;
  open: number;
  inReview: number;
  resolved: number;
  resolutionRate: number;
}

export interface FeedbackFilterState {
  typeFilter: string;
  statusFilter: string;
  searchQuery: string;
  statusOverrides: Record<string, FeedbackStatus>;
  noticeMessage: string | null;
}

/* =========================================================================
 * Component Prop Contracts
 * ========================================================================= */

export interface FeedbackMetricsGridProps {
  metrics: FeedbackMetrics;
  isLoading: boolean;
}

export interface FeedbackToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export interface FeedbackTableProps {
  items: NormalizedFeedbackItem[];
  onOpen: (item: NormalizedFeedbackItem) => void;
  compact?: boolean;
}

export interface FeedbackNoticeProps {
  message: string;
}

export interface FeedbackLoadingStateProps {
  message?: string;
  subMessage?: string;
}

export interface FeedbackTipBannerProps {
  title?: string;
  description?: string;
}

