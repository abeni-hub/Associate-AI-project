import { baseApi } from './baseApi.js';

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: (params) => ({
        url: '/documents',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Document'],
    }),

    getDocumentById: builder.query({
      query: (idOrCode) => ({
        url: `/documents/${idOrCode}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, idOrCode) => [{ type: 'Document', id: idOrCode }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDocumentsQuery, useGetDocumentByIdQuery } = documentsApi;

