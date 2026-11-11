import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface DocumentItem {
  id: number;
  name: string;
  code: string;
  description?: string;
  sample_file_url?: string | null;
  is_active: boolean;
  services_count?: number;
  created_at?: string;
}

export interface DocumentFilterParams extends PaginationQueryParams {
  is_active?: boolean;
}

export interface CreateDocumentPayload {
  name: string;
  code: string;
  description?: string;
  sample_file_url?: string;
  is_active?: boolean;
}

export interface UpdateDocumentPayload {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  sample_file_url?: string;
  is_active?: boolean;
}

/**
 * Required Documents RTK Query API
 *
 * Implements endpoints matching /backend/docs/api.md Section 8.
 */
export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<PaginatedResponse<DocumentItem>, DocumentFilterParams | void>({
      query: (params) => ({
        url: '/documents',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Document' as const, id })),
              { type: 'Document', id: 'LIST' },
            ]
          : [{ type: 'Document', id: 'LIST' }],
    }),

    getDocumentById: builder.query<ApiResponse<DocumentItem>, number | string>({
      query: (idOrCode) => ({
        url: `/documents/${idOrCode}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Document', id }],
    }),

    createDocument: builder.mutation<ApiResponse<DocumentItem>, CreateDocumentPayload>({
      query: (body) => ({
        url: '/documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Document', id: 'LIST' }, 'Document', 'Service'],
    }),

    updateDocument: builder.mutation<ApiResponse<DocumentItem>, UpdateDocumentPayload>({
      query: ({ id, ...body }) => ({
        url: `/documents/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Document', id },
        { type: 'Document', id: 'LIST' },
        'Document',
        'Service',
      ],
    }),

    deleteDocument: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Document', id: 'LIST' }, 'Document', 'Service'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDocumentsQuery,
  useLazyGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;
