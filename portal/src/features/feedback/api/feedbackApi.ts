import { baseApi } from '../../../app/baseApi';
import type { ApiResponse, PaginatedResponse } from '../../../types/api.types';
import type {
  FeedbackFilterParams,
  FeedbackStatus,
  FeedbackType,
  NormalizedFeedbackItem,
  RawCitizenFeedback,
  UpdateFeedbackStatusPayload,
} from '../types/feedback.types';

export function normalizeFeedbackStatus(
  rawStatus?: string,
  hasResponse?: boolean
): FeedbackStatus {
  const s = String(rawStatus || '').toLowerCase().trim();
  if (s === 'resolved' || (hasResponse && !s)) return 'Resolved';
  if (s === 'closed' || s === 'rejected') return 'Closed';
  if (
    s === 'under_review' ||
    s === 'in_progress' ||
    s === 'in_review' ||
    s === 'in review'
  ) {
    return 'In review';
  }
  return 'Open';
}

export function transformRawFeedback(f: RawCitizenFeedback): NormalizedFeedbackItem {
  const isComplaint =
    f.feedback_type === 'complaint' ||
    String((f as { type?: string }).type).toLowerCase() === 'complaint';
  const isSatisfaction =
    f.feedback_type === 'satisfaction' ||
    String((f as { type?: string }).type).toLowerCase() === 'satisfaction';

  const type: FeedbackType = isComplaint
    ? 'Complaint'
    : isSatisfaction
      ? 'Satisfaction'
      : 'Suggestion';

  const status = normalizeFeedbackStatus(f.status, Boolean(f.response));
  const displayId = f.tracking_number ? `#${f.tracking_number}` : `FB-${f.id}`;
  const numericId = typeof f.id === 'number' ? f.id : Number(f.id) || undefined;

  return {
    id: displayId,
    numericId,
    trackingNumber: f.tracking_number,
    type,
    service: f.service || 'Civil Registration',
    bureau: f.organization?.name || f.bureau || 'General Bureau',
    subcity: f.organization?.code || f.subcity || 'City Administration',
    message: f.feedback_content || (f as { message?: string }).message || '',
    rating: f.rating ?? (isSatisfaction ? 5 : isComplaint ? 2 : 4),
    time: f.created_at
      ? new Date(f.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : 'Today',
    status,
    priority: isComplaint ? 'High' : f.priority || 'Normal',
    fullName: f.full_name,
    phoneNumber: f.phone_number,
    email: f.email,
    response: f.response,
  };
}

export const feedbackFeatureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbackList: builder.query<
      NormalizedFeedbackItem[],
      FeedbackFilterParams | void
    >({
      query: (params) => ({
        url: '/feedbacks',
        method: 'GET',
        params: params || undefined,
      }),
      transformResponse: (response: PaginatedResponse<RawCitizenFeedback>) => {
        if (!response?.data || !Array.isArray(response.data)) {
          return [];
        }
        return response.data.map(transformRawFeedback);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Feedback' as const, id })),
              { type: 'Feedback', id: 'LIST' },
            ]
          : [{ type: 'Feedback', id: 'LIST' }],
    }),

    getFeedbackById: builder.query<NormalizedFeedbackItem, string | number>({
      query: (id) => ({
        url: `/feedbacks/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<RawCitizenFeedback>) =>
        transformRawFeedback(response.data),
      providesTags: (_result, _error, id) => [{ type: 'Feedback', id }],
    }),

    updateFeedbackStatus: builder.mutation<
      ApiResponse<RawCitizenFeedback>,
      UpdateFeedbackStatusPayload
    >({
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
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeedbackListQuery,
  useGetFeedbackByIdQuery,
  useUpdateFeedbackStatusMutation,
} = feedbackFeatureApi;

