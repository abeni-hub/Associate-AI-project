import { baseApi } from '../../../app/baseApi';
import type { ApiResponse } from '../../../types/api.types';
import type {
  DashboardOverviewData,
  DashboardRecentActivityItem,
  DashboardRecentActivityParams,
  FeedbackReportData,
  FeedbackReportParams,
  ServicesReportData,
  OrganizationsReportData,
} from '../types/dashboard.types';

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

