import { baseApi } from '../../../app/baseApi';

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: '/events',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Event'],
    }),

    getEventById: builder.query<any, string | number>({
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

