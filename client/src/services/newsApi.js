import { baseApi } from './baseApi.js';

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query({
      query: (params) => ({
        url: '/news',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'News', id })),
              { type: 'News', id: 'LIST' },
            ]
          : [{ type: 'News', id: 'LIST' }],
    }),

    getNewsById: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'News', id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNewsQuery, useGetNewsByIdQuery, useLazyGetNewsByIdQuery } = newsApi;
