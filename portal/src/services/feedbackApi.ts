import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface LocalizedString {
  eng: string;
  amh?: string;
  oro?: string;
}

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
  feedback_content_amh?: string;
  feedback_content_oro?: string;
  feedback_content_localized?: LocalizedString;
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
  response?: string;
  response_amh?: string;
  response_oro?: string;
  response_localized?: LocalizedString | null;
  resolved_at?: string;
}

function normalizeFeedback(raw: any): CitizenFeedback {
  if (!raw) return raw;
  const contentObj =
    typeof raw.feedback_content === 'object' && raw.feedback_content !== null
      ? raw.feedback_content
      : null;
  const respObj =
    typeof raw.response === 'object' && raw.response !== null ? raw.response : null;

  return {
    ...raw,
    feedback_content: contentObj
      ? (contentObj.eng || contentObj.amh || contentObj.oro || '')
      : String(raw.feedback_content || ''),
    feedback_content_amh: contentObj?.amh || raw.feedback_content_amh || '',
    feedback_content_oro: contentObj?.oro || raw.feedback_content_oro || '',
    feedback_content_localized: contentObj || { eng: String(raw.feedback_content || '') },
    response: respObj
      ? (respObj.eng || respObj.amh || respObj.oro || '')
      : (raw.response != null ? String(raw.response) : undefined),
    response_amh: respObj?.amh || raw.response_amh || '',
    response_oro: respObj?.oro || raw.response_oro || '',
    response_localized: respObj || (raw.response != null ? { eng: String(raw.response) } : null),
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
      transformResponse: (res: PaginatedResponse<any>) => {
        if (!res?.data || !Array.isArray(res.data)) return res;
        return {
          ...res,
          data: res.data.map(normalizeFeedback),
        };
      },
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
      transformResponse: (res: ApiResponse<any>) => {
        if (!res?.data) return res;
        return {
          ...res,
          data: normalizeFeedback(res.data),
        };
      },
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
      query: ({ id, status, response }) => ({
        url: `/feedbacks/${id}`,
        method: 'PUT',
        body: {
          ...(status ? { status } : {}),
          ...(response !== undefined ? { response } : {}),
        },
      }),
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
