import { baseApi } from '../../../app/baseApi';

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandingPageCms: builder.query<any, void>({
      query: () => ({
        url: '/cms/landing-page',
        method: 'GET',
      }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ['Cms'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLandingPageCmsQuery } = cmsApi;

