import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams, LocalizedString } from '../types/api.types';
export type { LocalizedString };

export interface DocumentItem {
  id: number;
  name: string;
  name_amh?: string;
  name_oro?: string;
  name_localized?: LocalizedString;
  code: string;
  description?: string;
  description_amh?: string;
  description_oro?: string;
  description_localized?: LocalizedString;
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
  name_amh?: string;
  name_oro?: string;
  code: string;
  description?: string;
  description_amh?: string;
  description_oro?: string;
  sample_file_url?: string;
  is_active?: boolean;
}

export interface UpdateDocumentPayload {
  id: number;
  name?: string;
  name_amh?: string;
  name_oro?: string;
  code?: string;
  description?: string;
  description_amh?: string;
  description_oro?: string;
  sample_file_url?: string;
  is_active?: boolean;
}

function normalizeDocumentItem(raw: any): DocumentItem {
  if (!raw) return raw;
  const nameObj = typeof raw.name === 'object' && raw.name !== null ? raw.name : null;
  const descObj = typeof raw.description === 'object' && raw.description !== null ? raw.description : null;

  return {
    ...raw,
    name: nameObj ? (nameObj.eng || nameObj.amh || nameObj.oro || '') : String(raw.name || ''),
    name_amh: nameObj?.amh || raw.name_amh || '',
    name_oro: nameObj?.oro || raw.name_oro || '',
    name_localized: nameObj || { eng: String(raw.name || ''), amh: raw.name_amh || '', oro: raw.name_oro || '' },
    description: descObj ? (descObj.eng || descObj.amh || descObj.oro || '') : (raw.description ? String(raw.description) : undefined),
    description_amh: descObj?.amh || raw.description_amh || '',
    description_oro: descObj?.oro || raw.description_oro || '',
    description_localized: descObj || (raw.description ? { eng: String(raw.description), amh: raw.description_amh || '', oro: raw.description_oro || '' } : undefined),
  };
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
      transformResponse: (response: PaginatedResponse<DocumentItem>) => {
        if (!response?.data) return response;
        return {
          ...response,
          data: response.data.map(normalizeDocumentItem),
        };
      },
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
      transformResponse: (response: ApiResponse<DocumentItem>) => {
        if (!response?.data) return response;
        return {
          ...response,
          data: normalizeDocumentItem(response.data),
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Document', id }],
    }),

    createDocument: builder.mutation<ApiResponse<DocumentItem>, CreateDocumentPayload>({
      query: (body) => ({
        url: '/documents',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<DocumentItem>) => {
        if (!response?.data) return response;
        return {
          ...response,
          data: normalizeDocumentItem(response.data),
        };
      },
      invalidatesTags: [{ type: 'Document', id: 'LIST' }, 'Document', 'Service'],
    }),

    updateDocument: builder.mutation<ApiResponse<DocumentItem>, UpdateDocumentPayload>({
      query: ({ id, ...body }) => ({
        url: `/documents/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<DocumentItem>) => {
        if (!response?.data) return response;
        return {
          ...response,
          data: normalizeDocumentItem(response.data),
        };
      },
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
