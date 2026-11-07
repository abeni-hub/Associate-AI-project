import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface EventImageItem {
  id: number;
  event_id: number;
  image_url: string;
  caption?: string | null;
  order_column: number;
}

export interface EventItem {
  id: number;
  organization_id: number;
  title: string;
  description: string;
  location_name: string;
  event_date: string;
  end_date?: string | null;
  audience?: string | null;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
  organization?: {
    id: number;
    name: string;
    code: string;
  };
  images?: EventImageItem[];
}

export interface CreateEventPayload {
  organization_id: number;
  title: string;
  description: string;
  location_name: string;
  event_date: string;
  end_date?: string | null;
  audience?: string | null;
  status?: 'published' | 'draft';
  images?: Array<{
    image_url: string;
    caption?: string;
    order_column?: number;
  }>;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<PaginatedResponse<EventItem>, PaginationQueryParams | void>({
      query: (params) => ({
        url: '/events',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Event' as const, id })),
              { type: 'Event', id: 'LIST' },
            ]
          : [{ type: 'Event', id: 'LIST' }],
    }),

    getEventById: builder.query<ApiResponse<EventItem>, number | string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Event', id }],
    }),

    createEvent: builder.mutation<ApiResponse<EventItem>, CreateEventPayload>({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),

    deleteEvent: builder.mutation<ApiResponse<null>, number | string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
} = eventsApi;

