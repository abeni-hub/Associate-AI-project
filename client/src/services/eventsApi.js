import { baseApi } from './baseApi.js';

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: '/events',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Event'],
    }),

    getEventById: builder.query({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Event', id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetEventsQuery, useGetEventByIdQuery } = eventsApi;

