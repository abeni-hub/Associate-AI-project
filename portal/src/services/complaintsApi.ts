import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface Complaint {
  id: string | number;
  tracking_number: string;
  title: string;
  description: string;
  category: string;
  status: 'submitted' | 'under_review' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_organization_id?: number;
  created_at?: string;
  resolved_at?: string | null;
}

export interface ComplaintFilterParams extends PaginationQueryParams {
  status?: string;
  priority?: string;
  category?: string;
}

/**
 * Citizen Complaints RTK Query API
 *
 * Prepared architecture for complaint tracking and resolution workflow.
 * Injected into baseApi for unified cache management.
 */
export const complaintsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplaints: builder.query<PaginatedResponse<Complaint>, ComplaintFilterParams | void>({
      query: (params) => ({
        url: '/complaints',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Complaint' as const, id })),
              { type: 'Complaint', id: 'LIST' },
            ]
          : [{ type: 'Complaint', id: 'LIST' }],
    }),

    getComplaintById: builder.query<ApiResponse<Complaint>, string | number>({
      query: (id) => ({
        url: `/complaints/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Complaint', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetComplaintsQuery,
  useLazyGetComplaintsQuery,
  useGetComplaintByIdQuery,
} = complaintsApi;
