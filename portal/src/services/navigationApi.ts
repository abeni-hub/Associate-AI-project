import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';

export interface SidebarNavigationItem {
  id: number;
  label: string;
  route: string;
  icon: string;
  display_order: number;
  required_permission?: string | null;
}

export const navigationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSidebarNavigation: builder.query<ApiResponse<SidebarNavigationItem[]>, void>({
      query: () => ({
        url: '/navigation/sidebar',
        method: 'GET',
      }),
      providesTags: ['Navigation'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSidebarNavigationQuery } = navigationApi;

