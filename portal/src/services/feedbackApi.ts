import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface CitizenFeedback {
  id: string | number;
  type: 'Complaint' | 'Satisfaction' | 'Suggestion';
  rating?: number | null;
  service?: string;
  bureau?: string;
  subcity?: string;
  message: string;
  status: 'Open' | 'In review' | 'Resolved';
  priority?: 'Low' | 'Normal' | 'High';
  created_at?: string;
}

export interface FeedbackFilterParams extends PaginationQueryParams {
  type?: string;
  status?: string;
  bureau_id?: number;
  subcity_id?: number;
}

/**
 * Citizen Feedback RTK Query API
 *
 * Prepared architecture for Phase 9 backend integration.
 * Injected into baseApi to maintain shared caching.
 */
export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbackList: builder.query<PaginatedResponse<CitizenFeedback>, FeedbackFilterParams | void>({
      query: (params) => ({
        url: '/feedback',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Feedback' as const, id })),
              { type: 'Feedback', id: 'LIST' },
            ]
          : [{ type: 'Feedback', id: 'LIST' }],
    }),

    updateFeedbackStatus: builder.mutation<ApiResponse<CitizenFeedback>, { id: string | number; status: string }>({
      query: ({ id, status }) => ({
        url: `/feedback/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Feedback', id },
        { type: 'Feedback', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeedbackListQuery,
  useLazyGetFeedbackListQuery,
  useUpdateFeedbackStatusMutation,
} = feedbackApi;
