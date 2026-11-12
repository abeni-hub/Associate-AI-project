import { baseApi } from '../../../app/baseApi';

export interface SubmitFeedbackPayload {
  feedback_for_organization?: number | string;
  feedback_content: string;
  feedback_type?: string;
  full_name?: string | null;
  phone_number?: string | null;
}

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: '/feedbacks',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Feedback'],
    }),

    submitFeedback: builder.mutation<any, SubmitFeedbackPayload>({
      query: (body) => ({
        url: '/feedbacks',
        method: 'POST',
        body: {
          feedback_for_organization: Number(body.feedback_for_organization) || 1,
          feedback_content: String(body.feedback_content || '').trim(),
          feedback_type:
            String(body.feedback_type || '').toLowerCase() === 'complaint'
              ? 'complaint'
              : String(body.feedback_type || '').toLowerCase() === 'satisfaction'
                ? 'satisfaction'
                : 'feedback',
          full_name: body.full_name?.trim() || null,
          phone_number: body.phone_number?.trim() || null,
        },
      }),
      invalidatesTags: ['Feedback'],
    }),

    trackFeedback: builder.query<any, string | number>({
      query: (trackingNumber) => ({
        url: `/feedbacks/track/${encodeURIComponent(String(trackingNumber).trim())}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Feedback', id: arg }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFeedbacksQuery, useSubmitFeedbackMutation, useTrackFeedbackQuery, useLazyTrackFeedbackQuery } = feedbackApi;

