import { baseApi } from '../../../app/baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../../../types/api.types';
import type { QrCodeItem, CreateQrCodePayload } from '../types/qrCodes.types';

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
          : Array.isArray((result?.data as unknown as { data?: QrCodeItem[] })?.data)
            ? (result?.data as unknown as { data: QrCodeItem[] }).data
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

