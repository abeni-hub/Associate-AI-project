import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface QrCodeItem {
  id: number;
  organization_id: number;
  code: string;
  label: string;
  target_url: string;
  scan_count: number;
  status: 'active' | 'inactive';
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
  organization?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateQrCodePayload {
  organization_id: number;
  code: string;
  label: string;
  target_url: string;
}

export const qrCodesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQrCodes: builder.query<PaginatedResponse<QrCodeItem>, PaginationQueryParams | void>({
      query: (params) => ({
        url: '/qr-codes',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'QrCode' as const, id })),
              { type: 'QrCode', id: 'LIST' },
            ]
          : [{ type: 'QrCode', id: 'LIST' }],
    }),

    getQrCodeById: builder.query<ApiResponse<QrCodeItem>, number>({
      query: (id) => ({
        url: `/qr-codes/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'QrCode', id }],
    }),

    createQrCode: builder.mutation<ApiResponse<QrCodeItem>, CreateQrCodePayload>({
      query: (body) => ({
        url: '/qr-codes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'QrCode', id: 'LIST' }],
    }),

    deleteQrCode: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/qr-codes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'QrCode', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQrCodesQuery,
  useGetQrCodeByIdQuery,
  useCreateQrCodeMutation,
  useDeleteQrCodeMutation,
} = qrCodesApi;

