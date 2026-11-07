import { baseApi } from './baseApi.js';

export const organizationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query({
      query: (params) => ({
        url: '/organizations',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Organization'],
    }),

    getOrganizationTree: builder.query({
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
