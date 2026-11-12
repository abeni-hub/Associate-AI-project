import { baseApi } from '../../../app/baseApi';

export const organizationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: '/organizations',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Organization'],
    }),

    getOrganizationTree: builder.query<any, void>({
      query: () => ({
        url: '/organizations/tree',
        method: 'GET',
      }),
      providesTags: ['Organization'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetOrganizationsQuery, useGetOrganizationTreeQuery } = organizationsApi;

