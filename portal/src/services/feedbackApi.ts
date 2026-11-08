import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface CitizenFeedback {
  id: string | number;
  type?: 'Complaint' | 'Satisfaction' | 'Suggestion';
  rating?: number | null;
  service?: string;
  bureau?: string;
  subcity?: string;
  message?: string;
  status?: 'Open' | 'In review' | 'Resolved';
  priority?: 'Low' | 'Normal' | 'High';
  created_at?: string;
  updated_at?: string;

  // Exact fields from api.md Section 11
  feedback_for_organization?: number;
  feedback_content?: string;
  feedback_type?: 'complaint' | 'feedback' | 'satisfaction';
  tracking_number?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  organization?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface FeedbackFilterParams extends PaginationQueryParams {
  type?: string;
  status?: string;
  bureau_id?: number;
  subcity_id?: number;
}

export interface CreateFeedbackRequest {
  feedback_for_organization: number;
  feedback_content: string;
  feedback_type: 'complaint' | 'feedback' | 'satisfaction';
  full_name?: string;
  phone_number?: string;
  email?: string;
}

/**
 * Citizen Feedback RTK Query API
 * Adheres to backend/docs/api.md Section 11
 */
export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbackList: builder.query<PaginatedResponse<CitizenFeedback>, FeedbackFilterParams | void>({
      query: (params) => ({
        url: '/feedbacks',
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

    getFeedbackById: builder.query<ApiResponse<CitizenFeedback>, string | number>({
      query: (id) => ({
        url: `/feedbacks/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Feedback', id }],
    }),

    createFeedback: builder.mutation<ApiResponse<CitizenFeedback>, CreateFeedbackRequest>({
      query: (body) => ({
        url: '/feedbacks',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Feedback', id: 'LIST' }, 'Feedback'],
    }),

    updateFeedback: builder.mutation<ApiResponse<CitizenFeedback>, { id: string | number; [key: string]: any }>({
      query: ({ id, ...body }) => ({
        url: `/feedbacks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Feedback', id },
        { type: 'Feedback', id: 'LIST' },
        'Feedback',
      ],
    }),

    respondToFeedback: builder.mutation<ApiResponse<CitizenFeedback>, { id: string | number; response: string }>({
      query: ({ id, response }) => ({
        url: `/feedbacks/${id}/respond`,
        method: 'POST',
        body: { response },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Feedback', id },
        { type: 'Feedback', id: 'LIST' },
        'Feedback',
      ],
    }),

    deleteFeedback: builder.mutation<ApiResponse<null>, string | number>({
      query: (id) => ({
        url: `/feedbacks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Feedback', id: 'LIST' }, 'Feedback'],
    }),

    updateFeedbackStatus: builder.mutation<ApiResponse<CitizenFeedback>, { id: string | number; status?: string; response?: string }>({
      query: ({ id, status, response }) => {
        if (response) {
          return {
            url: `/feedbacks/${id}/respond`,
            method: 'POST',
            body: { response },
          };
        }
        return {
          url: `/feedbacks/${id}`,
          method: 'PUT',
          body: { status },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Feedback', id },
        { type: 'Feedback', id: 'LIST' },
        'Feedback',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeedbackListQuery,
  useGetFeedbackByIdQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useRespondToFeedbackMutation,
  useDeleteFeedbackMutation,
  useUpdateFeedbackStatusMutation,
} = feedbackApi;
