import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface ServiceListItem {
  id: number;
  name: string;
  code: string;
  description: string;
  fee_amount: number;
  fee_currency: string;
  estimated_duration_minutes: number;
  is_active: boolean;
  is_master: boolean;
  parent_id?: number | null;
  subservices_count?: number;
  required_documents_count?: number;
  offering_organizations_count?: number;
}

export interface ServiceDetail extends ServiceListItem {
  eligibility_criteria?: string;
  fee_notes?: string;
  parent?: { id: number; name: string; code: string } | null;
  required_documents?: Array<{
    id: number;
    name: string;
    code: string;
    is_mandatory: boolean;
    order_column: number;
    notes?: string;
  }>;
  offering_organizations?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
}

export interface ServiceStep {
  id: number;
  service_id: number;
  step_number: number;
  title: string;
  instruction: string;
  room_number: string;
  floor: string;
  building: string;
  department_name: string;
  responsible_title: string;
  estimated_duration_minutes: number;
  is_active: boolean;
}

export interface ServiceFilterParams extends PaginationQueryParams {
  parent_id?: string | number;
  organization_id?: number;
  fee?: 'free' | 'paid';
  is_active?: boolean;
}

/**
 * Government Services RTK Query API
 *
 * Injected into baseApi to maintain a single central store and unified caching.
 * Matches /backend/docs/api.md Section 7 & Section 9.
 */
export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<PaginatedResponse<ServiceListItem>, ServiceFilterParams | void>({
      query: (params) => ({
        url: '/services',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Service' as const, id })),
              { type: 'Service', id: 'LIST' },
            ]
          : [{ type: 'Service', id: 'LIST' }],
    }),

    getServiceById: builder.query<ApiResponse<ServiceDetail>, string | number>({
      query: (idOrCode) => ({
        url: `/services/${idOrCode}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, idOrCode) => [{ type: 'Service', id: idOrCode }],
    }),

    getServiceSteps: builder.query<ApiResponse<ServiceStep[]>, string | number>({
      query: (serviceIdOrCode) => ({
        url: `/services/${serviceIdOrCode}/steps`,
        method: 'GET',
      }),
      providesTags: (_result, _error, serviceId) => [{ type: 'ServiceStep', id: `SERVICE-${serviceId}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServicesQuery,
  useLazyGetServicesQuery,
  useGetServiceByIdQuery,
  useGetServiceStepsQuery,
} = servicesApi;
