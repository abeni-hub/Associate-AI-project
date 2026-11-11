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
  status?: 'active' | 'inactive';
}

export const qrCodesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQrCodes: builder.query<PaginatedResponse<QrCodeItem>, PaginationQueryParams | void>({
      query: (params) => ({
        url: '/qr-codes',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray((result?.data as any)?.data)
            ? (result?.data as any).data
            : [];
        return [
          ...list.map(({ id }: { id: number }) => ({ type: 'QrCode' as const, id })),
          { type: 'QrCode', id: 'LIST' },
        ];
      },
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
      invalidatesTags: [{ type: 'QrCode', id: 'LIST' }, 'QrCode'],
    }),

    deleteQrCode: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/qr-codes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'QrCode', id: 'LIST' }, 'QrCode'],
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

