import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';

export interface DashboardScope {
  role: string;
  organization_id: number;
  organization_name: string;
  is_global: boolean;
  accessible_organizations_count: number;
}

export interface DashboardOrganizations {
  total: number;
  active: number;
  inactive: number;
  by_type: {
    sub_city?: number;
    woreda?: number;
    bureau?: number;
    [key: string]: number | undefined;
  };
}

export interface DashboardUsers {
  total: number;
  active: number;
  inactive: number;
  must_change_password: number;
  by_role: {
    sub_city_admin?: number;
    woreda_admin?: number;
    bureau_admin?: number;
    staff?: number;
    [key: string]: number | undefined;
  };
}

export interface DashboardServices {
  total_catalog: number;
  active_catalog: number;
  master_services: number;
  subservices: number;
  offered_services_in_scope: number;
}

export interface DashboardDocuments {
  total: number;
  active: number;
  mandatory_links_count: number;
}

export interface DashboardFeedbackOverview {
  total: number;
  by_type: {
    feedback: number;
    complaint: number;
    satisfaction: number;
  };
  recent_last_30_days: number;
}

export interface DashboardNewsOverview {
  total: number;
  recent_last_30_days: number;
}

export interface DashboardOverviewData {
  scope: DashboardScope;
  organizations: DashboardOrganizations;
  users: DashboardUsers;
  services: DashboardServices;
  documents: DashboardDocuments;
  feedback: DashboardFeedbackOverview;
  news: DashboardNewsOverview;
}

export interface DashboardRecentActivityItem {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  actor: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
  organization: {
    id: number;
    name: string;
    code: string;
  };
  ip_address: string;
  created_at: string;
}

export interface DashboardRecentActivityParams {
  limit?: number;
  entity_type?: string;
  action?: string;
}

export interface FeedbackReportSummary {
  total_feedback: number;
  complaints_count: number;
  general_feedback_count: number;
  satisfaction_count: number;
  complaints_percentage: number;
}

export interface FeedbackTypeBreakdown {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface FeedbackTopOrganization {
  organization_id: number;
  organization_name: string;
  organization_code: string;
  count: number;
}

export interface FeedbackRecentItem {
  id: number;
  tracking_number: string;
  feedback_type: string;
  content_snippet: string;
  full_name: string;
  organization: {
    id: number;
    name: string;
    code: string;
  };
  created_at: string;
}

export interface FeedbackReportData {
  summary: FeedbackReportSummary;
  type_breakdown: FeedbackTypeBreakdown[];
  top_organizations: FeedbackTopOrganization[];
  recent_feedback: FeedbackRecentItem[];
}

export interface FeedbackReportParams {
  start_date?: string;
  end_date?: string;
  organization_id?: number;
}

export interface ServicesReportData {
  summary: {
    total_services: number;
    master_services: number;
    subservices: number;
    active_services: number;
    total_steps: number;
    average_steps_per_service: number;
  };
  fees_analysis: {
    free_services_count: number;
    paid_services_count: number;
    average_fee: number;
    max_fee: number;
    currency: string;
  };
  duration_analysis: {
    average_duration_minutes: number;
    min_duration_minutes: number;
    max_duration_minutes: number;
  };
  top_offered_services: Array<{
    service_id: number;
    name: string;
    code: string;
    offering_organizations_count: number;
  }>;
}

export interface OrganizationsReportData {
  summary: {
    total_organizations: number;
    active: number;
    inactive: number;
    suspended: number;
    root_units: number;
    child_units: number;
  };
  type_distribution: Array<{
    type_id: number;
    name: string;
    code: string;
    count: number;
    percentage: number;
  }>;
  top_by_users: Array<{
    id: number;
    name: string;
    code: string;
    users_count: number;
  }>;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<ApiResponse<DashboardOverviewData>, void>({
      query: () => ({
        url: '/dashboard/overview',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    getRecentActivity: builder.query<
      ApiResponse<DashboardRecentActivityItem[]>,
      DashboardRecentActivityParams | void
    >({
      query: (params) => ({
        url: '/dashboard/recent-activity',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Dashboard', 'AuditLog'],
    }),

    getFeedbackReport: builder.query<ApiResponse<FeedbackReportData>, FeedbackReportParams | void>({
      query: (params) => ({
        url: '/dashboard/reports/feedback',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Dashboard', 'Feedback'],
    }),

    getServicesReport: builder.query<ApiResponse<ServicesReportData>, void>({
      query: () => ({
        url: '/dashboard/reports/services',
        method: 'GET',
      }),
      providesTags: ['Dashboard', 'Service'],
    }),

    getOrganizationsReport: builder.query<ApiResponse<OrganizationsReportData>, void>({
      query: () => ({
        url: '/dashboard/reports/organizations',
        method: 'GET',
      }),
      providesTags: ['Dashboard', 'Organization'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardOverviewQuery,
  useGetRecentActivityQuery,
  useGetFeedbackReportQuery,
  useGetServicesReportQuery,
  useGetOrganizationsReportQuery,
} = dashboardApi;
