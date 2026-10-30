import { baseApi } from './baseApi';
import type { PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface AuditLogItem {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor: {
    id: number;
    name: string;
    username: string;
    email: string;
  } | null;
  organization: {
    id: number;
    name: string;
    code: string;
  } | null;
}

export interface AuditLogFilterParams extends PaginationQueryParams {
  action?: string;
  entity_type?: string;
  organization_id?: number;
}

export const auditLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PaginatedResponse<AuditLogItem>, AuditLogFilterParams | void>({
      query: (params) => ({
        url: '/audit-logs',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'AuditLog' as const, id })),
              { type: 'AuditLog', id: 'LIST' },
            ]
          : [{ type: 'AuditLog', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery, useLazyGetAuditLogsQuery } = auditLogsApi;
