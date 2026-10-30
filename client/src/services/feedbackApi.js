import { baseApi } from './baseApi.js';

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query({
      query: (params) => ({
        url: '/feedbacks',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Feedback'],
    }),

    submitFeedback: builder.mutation({
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
          full_name: body.full_name || 'Citizen',
          phone_number: body.phone_number || '',
          email: body.email || '',
          rating: body.rating || undefined,
        },
      }),
      invalidatesTags: ['Feedback'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFeedbacksQuery, useSubmitFeedbackMutation } = feedbackApi;
