import { baseApi } from '../../../app/baseApi';

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: '/news',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: number | string }) => ({ type: 'News' as const, id })),
              { type: 'News' as const, id: 'LIST' },
            ]
          : [{ type: 'News' as const, id: 'LIST' }],
    }),

    getNewsById: builder.query<any, string | number>({
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

