import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface LocalizedString {
  eng: string;
  amh?: string;
  oro?: string;
}

export interface ServiceListItem {
  id: number;
  name: string;
  name_amh?: string;
  name_oro?: string;
  name_localized?: LocalizedString;
  code: string;
  description: string;
  description_amh?: string;
  description_oro?: string;
  description_localized?: LocalizedString;
  fee_amount: number;
  fee_currency: string;
  fee_notes?: string;
  eligibility_criteria?: string;
  estimated_duration_minutes: number;
  is_active: boolean;
  is_master: boolean;
  organization_id?: number | null;
  parent_id?: number | null;
  parent?: { id: number; name: string; code: string; name_localized?: LocalizedString } | null;
  subservices_count?: number;
  required_documents_count?: number;
  offering_organizations_count?: number;
  steps_count?: number;
  steps?: ServiceStep[];
  subservices?: ServiceListItem[];
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
  organization?: {
    id: number;
    name: string;
    code: string;
  } | null;
  created_at?: string;
}

export interface ServiceDetail extends ServiceListItem {}

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
  tree?: boolean;
  view?: string;
  scope?: string;
  type?: string;
  sub_city?: string | number;
  category?: string;
}

export interface CreateServicePayload {
  name: string;
  name_amh?: string;
  name_oro?: string;
  code: string;
  parent_id?: number | null;
  description: string;
  description_amh?: string;
  description_oro?: string;
  eligibility_criteria?: string;
  fee_amount?: number;
  fee_currency?: string;
  fee_notes?: string;
  estimated_duration_minutes?: number;
  is_active?: boolean;
  documents?: Array<{
    document_id: number;
    is_mandatory?: boolean;
    order_column?: number;
    notes?: string;
  }>;
}

export interface UpdateServicePayload {
  id: number;
  name?: string;
  name_amh?: string;
  name_oro?: string;
  code?: string;
  parent_id?: number | null;
  description?: string;
  description_amh?: string;
  description_oro?: string;
  eligibility_criteria?: string;
  fee_amount?: number;
  fee_currency?: string;
  fee_notes?: string;
  estimated_duration_minutes?: number;
  is_active?: boolean;
  documents?: Array<{
    document_id: number;
    is_mandatory?: boolean;
    order_column?: number;
    notes?: string;
  }>;
}

export interface CreateServiceStepPayload {
  serviceId: number | string;
  organization_id?: number | null;
  step_number: number;
  title: string;
  instruction: string;
  room_number: string;
  floor: string;
  building: string;
  department_name: string;
  responsible_title: string;
  estimated_duration_minutes?: number;
  is_active?: boolean;
}

export interface UpdateServiceStepPayload {
  serviceId: number | string;
  stepId: number;
  step_number?: number;
  title?: string;
  instruction?: string;
  room_number?: string;
  floor?: string;
  building?: string;
  department_name?: string;
  responsible_title?: string;
  estimated_duration_minutes?: number;
  is_active?: boolean;
}

function normalizeServiceItem(raw: any): ServiceListItem {
  if (!raw) return raw;
  const nameObj = typeof raw.name === 'object' && raw.name !== null ? raw.name : null;
  const descObj = typeof raw.description === 'object' && raw.description !== null ? raw.description : null;

  const parentNameObj =
    raw.parent && typeof raw.parent.name === 'object' && raw.parent.name !== null
      ? raw.parent.name
      : null;
  const parent = raw.parent
    ? {
        ...raw.parent,
        name: parentNameObj
          ? (parentNameObj.eng || parentNameObj.amh || parentNameObj.oro || '')
          : String(raw.parent.name || ''),
        name_localized: parentNameObj || { eng: String(raw.parent.name || '') },
      }
    : null;

  return {
    ...raw,
    name: nameObj ? (nameObj.eng || nameObj.amh || nameObj.oro || '') : String(raw.name || ''),
    name_amh: nameObj?.amh || raw.name_amh || '',
    name_oro: nameObj?.oro || raw.name_oro || '',
    name_localized: nameObj || { eng: String(raw.name || ''), amh: raw.name_amh || '', oro: raw.name_oro || '' },
    description: descObj ? (descObj.eng || descObj.amh || descObj.oro || '') : String(raw.description || ''),
    description_amh: descObj?.amh || raw.description_amh || '',
    description_oro: descObj?.oro || raw.description_oro || '',
    description_localized: descObj || {
      eng: String(raw.description || ''),
      amh: raw.description_amh || '',
      oro: raw.description_oro || '',
    },
    parent,
    subservices: Array.isArray(raw.subservices)
      ? raw.subservices.map(normalizeServiceItem)
      : raw.subservices,
  };
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
        params: {
          per_page: 100,
          ...(params || {}),
        },
      }),
      transformResponse: (res: PaginatedResponse<any>) => {
        if (!res?.data || !Array.isArray(res.data)) return res;
        return {
          ...res,
          data: res.data.map(normalizeServiceItem),
        };
      },
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
      transformResponse: (res: ApiResponse<any>) => {
        if (!res?.data) return res;
        return {
          ...res,
          data: normalizeServiceItem(res.data),
        };
      },
      providesTags: (_result, _error, idOrCode) => [{ type: 'Service', id: idOrCode }],
    }),

    createService: builder.mutation<ApiResponse<ServiceDetail>, CreateServicePayload>({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, 'Service'],
    }),

    updateService: builder.mutation<ApiResponse<ServiceDetail>, UpdateServicePayload>({
      query: ({ id, ...body }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Service', id },
        { type: 'Service', id: 'LIST' },
        'Service',
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          servicesApi.util.updateQueryData('getServices', undefined, (draft) => {
            if (draft?.data && Array.isArray(draft.data)) {
              const item = draft.data.find((s) => s.id === id);
              if (item) {
                if (patch.is_active !== undefined) {
                  item.is_active = patch.is_active;
                }
                if (patch.name !== undefined) item.name = patch.name;
                if (patch.description !== undefined) item.description = patch.description;
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteService: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, 'Service'],
    }),

    getServiceSteps: builder.query<
      ApiResponse<ServiceStep[]>,
      string | number | { serviceId: string | number; organization_id?: number | null }
    >({
      query: (arg) => {
        const serviceId = typeof arg === 'object' && arg !== null ? arg.serviceId : arg;
        const orgId = typeof arg === 'object' && arg !== null ? arg.organization_id : undefined;
        return {
          url: `/services/${serviceId}/steps`,
          method: 'GET',
          params: orgId ? { organization_id: orgId } : undefined,
        };
      },
      providesTags: (_result, _error, arg) => {
        const serviceId = typeof arg === 'object' && arg !== null ? arg.serviceId : arg;
        const orgId = typeof arg === 'object' && arg !== null ? arg.organization_id : 'ALL';
        return [
          { type: 'ServiceStep', id: `SERVICE-${serviceId}-ORG-${orgId}` },
          { type: 'ServiceStep', id: `SERVICE-${serviceId}` },
        ];
      },
    }),

    createServiceStep: builder.mutation<ApiResponse<ServiceStep>, CreateServiceStepPayload>({
      query: ({ serviceId, ...body }) => ({
        url: `/services/${serviceId}/steps`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: 'ServiceStep', id: `SERVICE-${serviceId}` },
        { type: 'Service', id: serviceId },
      ],
    }),

    updateServiceStep: builder.mutation<ApiResponse<ServiceStep>, UpdateServiceStepPayload>({
      query: ({ serviceId, stepId, ...body }) => ({
        url: `/services/${serviceId}/steps/${stepId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: 'ServiceStep', id: `SERVICE-${serviceId}` },
      ],
    }),

    deleteServiceStep: builder.mutation<ApiResponse<null>, { serviceId: number | string; stepId: number }>({
      query: ({ serviceId, stepId }) => ({
        url: `/services/${serviceId}/steps/${stepId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: 'ServiceStep', id: `SERVICE-${serviceId}` },
      ],
    }),

    reorderServiceSteps: builder.mutation<
      ApiResponse<ServiceStep[]>,
      { serviceId: number | string; steps: Array<{ id: number; step_number: number }> }
    >({
      query: ({ serviceId, steps }) => ({
        url: `/services/${serviceId}/steps/reorder`,
        method: 'POST',
        body: { steps },
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: 'ServiceStep', id: `SERVICE-${serviceId}` },
      ],
    }),

    syncServiceSteps: builder.mutation<
      ApiResponse<ServiceStep[]>,
      {
        serviceId: number | string;
        organization_id?: number | null;
        steps: Array<{
          step_number?: number;
          title: string;
          instruction?: string;
          room_number?: string | null;
          floor?: string | null;
          building?: string | null;
          department_name?: string | null;
          responsible_title?: string | null;
          estimated_duration_minutes?: number;
          is_active?: boolean;
          organization_id?: number | null;
        }>;
      }
    >({
      query: ({ serviceId, organization_id, steps }) => ({
        url: `/services/${serviceId}/steps/sync`,
        method: 'POST',
        body: {
          organization_id: organization_id ?? null,
          steps,
        },
      }),
      invalidatesTags: (_result, _error, { serviceId, organization_id }) => [
        { type: 'ServiceStep', id: `SERVICE-${serviceId}` },
        { type: 'ServiceStep', id: `SERVICE-${serviceId}-ORG-${organization_id ?? 'ALL'}` },
        { type: 'Service', id: serviceId },
        { type: 'Service', id: 'LIST' },
      ],
    }),

    syncServiceDocuments: builder.mutation<
      ApiResponse<ServiceDetail>,
      {
        serviceId: number | string;
        documents: Array<{
          document_id: number;
          is_mandatory?: boolean;
          order_column?: number;
          notes?: string;
        }>;
      }
    >({
      query: ({ serviceId, documents }) => ({
        url: `/services/${serviceId}/documents`,
        method: 'POST',
        body: { documents },
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: 'Service', id: serviceId },
        { type: 'Service', id: 'LIST' },
        'Service',
        'Document',
      ],
    }),

    syncServiceOrganizations: builder.mutation<
      ApiResponse<ServiceDetail>,
      {
        serviceId: number | string;
        organizations: Array<{
          organization_id: number;
          is_available?: boolean;
          specific_instructions?: string;
        }>;
      }
    >({
      query: ({ serviceId, organizations }) => ({
        url: `/services/${serviceId}/organizations`,
        method: 'POST',
        body: { organizations },
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: 'Service', id: serviceId },
        { type: 'Service', id: 'LIST' },
        'Service',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServicesQuery,
  useLazyGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServiceStepsQuery,
  useCreateServiceStepMutation,
  useUpdateServiceStepMutation,
  useDeleteServiceStepMutation,
  useReorderServiceStepsMutation,
  useSyncServiceStepsMutation,
  useSyncServiceDocumentsMutation,
  useSyncServiceOrganizationsMutation,
} = servicesApi;
