import { baseApi } from '../../../app/baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams, LocalizedString } from '../../../types/api.types';
export type { LocalizedString };

export interface CitizenFeedback {
  id: string | number;
  type?: 'Complaint' | 'Satisfaction' | 'Suggestion';
  rating?: number | null;
  service?: string;
  bureau?: string;
  subcity?: string;
  message?: string;
  status?: 'Open' | 'In review' | 'Resolved' | 'Closed';
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

export function normalizeFeedbackStatus(rawStatus?: string, hasResponse?: boolean): 'Open' | 'In review' | 'Resolved' | 'Closed' {
  const s = String(rawStatus || '').toLowerCase().trim();
  if (s === 'resolved' || (hasResponse && !s)) return 'Resolved';
  if (s === 'closed' || s === 'rejected') return 'Closed';
  if (s === 'under_review' || s === 'in_progress' || s === 'in_review' || s === 'in review') {
    return 'In review';
  }
  return 'Open';
}

export function normalizeFeedback(raw: any): CitizenFeedback {
  if (!raw) return raw;

  const contentObj = (raw.feedback_content_localized && typeof raw.feedback_content_localized === 'object')
    ? raw.feedback_content_localized
    : (raw.content_localized && typeof raw.content_localized === 'object')
      ? raw.content_localized
      : (typeof raw.feedback_content === 'object' && raw.feedback_content !== null)
        ? raw.feedback_content
        : null;

  const respObj = (raw.response_localized && typeof raw.response_localized === 'object')
    ? raw.response_localized
    : (typeof raw.response === 'object' && raw.response !== null)
      ? raw.response
      : null;

  return {
    ...raw,
    feedback_content: contentObj
      ? (contentObj.eng || contentObj.en || contentObj.amh || contentObj.am || contentObj.oro || contentObj.om || '')
      : String(raw.feedback_content || ''),
    feedback_content_amh: contentObj?.amh || contentObj?.am || raw.feedback_content_amh || '',
    feedback_content_oro: contentObj?.oro || contentObj?.om || raw.feedback_content_oro || '',
    feedback_content_localized: contentObj || { eng: String(raw.feedback_content || '') },
    response: respObj
      ? (respObj.eng || respObj.en || respObj.amh || respObj.am || respObj.oro || respObj.om || '')
      : (raw.response != null ? String(raw.response) : undefined),
    response_amh: respObj?.amh || respObj?.am || raw.response_amh || '',
    response_oro: respObj?.oro || respObj?.om || raw.response_oro || '',
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

    respondToFeedback: builder.mutation<ApiResponse<CitizenFeedback>, { id: string | number; response: string; response_amh?: string; response_oro?: string }>({
      query: ({ id, response, response_amh, response_oro }) => ({
        url: `/feedbacks/${id}/respond`,
        method: 'POST',
        body: {
          response,
          ...(response_amh !== undefined ? { response_amh } : {}),
          ...(response_oro !== undefined ? { response_oro } : {}),
        },
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

    updateFeedbackStatus: builder.mutation<ApiResponse<CitizenFeedback>, { id: string | number; status?: string; response?: string; response_amh?: string; response_oro?: string }>({
      query: ({ id, status, response, response_amh, response_oro }) => ({
        url: `/feedbacks/${id}`,
        method: 'PUT',
        body: {
          ...(status ? { status } : {}),
          ...(response !== undefined ? { response } : {}),
          ...(response_amh !== undefined ? { response_amh } : {}),
          ...(response_oro !== undefined ? { response_oro } : {}),
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

export default feedbackApi;
