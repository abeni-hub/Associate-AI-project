import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface SystemNotification {
  id: string | number;
  type: 'announcement' | 'alert' | 'update';
  title: string;
  message: string;
  is_read: boolean;
  audience?: string;
  created_at: string;
}

/**
 * Notifications & Announcements RTK Query API
 *
 * Prepared architecture for announcements and citizen notifications.
 * Injected into baseApi for unified cache management.
 */
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<PaginatedResponse<SystemNotification>, PaginationQueryParams | void>({
      query: (params) => ({
        url: '/notifications',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    markAsRead: builder.mutation<ApiResponse<null>, string | number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkAsReadMutation,
} = notificationsApi;
