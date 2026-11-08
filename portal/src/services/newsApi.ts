import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';

export interface NewsContentBlock {
  id?: number;
  news_id?: number;
  content: string;
  content_type: 'text' | 'image' | 'video' | string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface NewsArticle {
  id: number;
  organization_id: number;
  news_title: string;
  created_at: string;
  updated_at?: string;
  organization?: {
    id: number;
    name: string;
    code: string;
  };
  contents: NewsContentBlock[];
}

export interface CreateNewsRequest {
  news_title: string;
  organization_id: number;
  contents: Array<{
    content: string;
    content_type?: string;
    order?: number;
  }>;
}

export interface UpdateNewsRequest {
  news_title?: string;
  organization_id?: number;
  contents?: Array<{
    content: string;
    content_type?: string;
    order?: number;
  }>;
}

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNewsList: builder.query<ApiResponse<NewsArticle[]>, void>({
      query: () => ({
        url: '/news',
        method: 'GET',
      }),
      providesTags: (result) => {
        const raw = result?.data;
        const list = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as any).data)
          ? (raw as any).data
          : [];
        return [
          ...list.map(({ id }: { id: number }) => ({ type: 'News' as const, id })),
          { type: 'News', id: 'LIST' },
        ];
      },
    }),

    getNewsById: builder.query<ApiResponse<NewsArticle>, string | number>({
      query: (id) => ({
        url: `/news/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'News', id }],
    }),

    createNews: builder.mutation<ApiResponse<NewsArticle>, CreateNewsRequest>({
      query: (body) => ({
        url: '/news',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'News', id: 'LIST' }, 'News'],
    }),

    updateNews: builder.mutation<ApiResponse<NewsArticle>, { id: string | number; body: UpdateNewsRequest }>({
      query: ({ id, body }) => ({
        url: `/news/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'News', id },
        { type: 'News', id: 'LIST' },
        'News',
      ],
    }),

    deleteNews: builder.mutation<ApiResponse<null>, string | number>({
      query: (id) => ({
        url: `/news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'News', id },
        { type: 'News', id: 'LIST' },
        'News',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNewsListQuery,
  useGetNewsByIdQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
