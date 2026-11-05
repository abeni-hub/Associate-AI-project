import { baseApi } from './baseApi.js';

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandingPageCms: builder.query({
      query: () => ({
        url: '/cms/landing-page',
        method: 'GET',
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Cms'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLandingPageCmsQuery } = cmsApi;

