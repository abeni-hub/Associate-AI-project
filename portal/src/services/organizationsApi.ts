import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';

export interface OrganizationTypeItem {
  id: number;
  name: string;
  code: string;
  description?: string;
  level: number;
  can_be_root: boolean;
  is_active: boolean;
  allowed_parent_types?: Array<{ id: number; name: string; code: string }>;
}

export interface CreateOrganizationTypePayload {
  name: string;
  code: string;
  description?: string;
  level: number;
  can_be_root?: boolean;
  is_active?: boolean;
}

export interface UpdateOrganizationTypePayload {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  level?: number;
  can_be_root?: boolean;
  is_active?: boolean;
}

export interface OrganizationItem {
  id: number;
  name: string;
  code: string;
  organization_type_id: number;
  parent_organization_id?: number | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  is_root?: boolean;
  type?: { id: number; name: string; code: string };
  parent?: { id: number; name: string; code: string } | null;
  children?: OrganizationItem[];
  users_count?: number;
  services_count?: number;
  created_at?: string;
}

export interface OrganizationFilterParams extends PaginationQueryParams {
  type?: string;
  parent_id?: string | number;
  status?: string;
}

export interface CreateOrganizationPayload {
  name: string;
  code: string;
  organization_type_id: number;
  parent_organization_id?: number | null;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateOrganizationPayload {
  id: number;
  name?: string;
  code?: string;
  organization_type_id?: number;
  parent_organization_id?: number | null;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * Organizations RTK Query API
 *
 * Implements endpoints matching /backend/docs/api.md Section 5.
 */
export const organizationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationTypes: builder.query<ApiResponse<OrganizationTypeItem[]>, void>({
      query: () => ({
        url: '/organization-types',
        method: 'GET',
      }),
      providesTags: ['Organization'],
    }),

    getOrganizations: builder.query<PaginatedResponse<OrganizationItem>, OrganizationFilterParams | void>({
      query: (params) => ({
        url: '/organizations',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Organization' as const, id })),
              { type: 'Organization', id: 'LIST' },
            ]
          : [{ type: 'Organization', id: 'LIST' }],
    }),

    getOrganizationTree: builder.query<ApiResponse<OrganizationItem[]>, void>({
      query: () => ({
        url: '/organizations/tree',
        method: 'GET',
      }),
      providesTags: [{ type: 'Organization', id: 'TREE' }],
    }),

    getOrganizationById: builder.query<ApiResponse<OrganizationItem>, number>({
      query: (id) => ({
        url: `/organizations/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),

    createOrganization: builder.mutation<ApiResponse<OrganizationItem>, CreateOrganizationPayload>({
      query: (body) => ({
        url: '/organizations',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Organization', id: 'LIST' },
        { type: 'Organization', id: 'TREE' },
      ],
    }),

    updateOrganization: builder.mutation<ApiResponse<OrganizationItem>, UpdateOrganizationPayload>({
      query: ({ id, ...body }) => ({
        url: `/organizations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Organization', id },
        { type: 'Organization', id: 'LIST' },
        { type: 'Organization', id: 'TREE' },
      ],
    }),

    deleteOrganization: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/organizations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Organization', id: 'LIST' },
        { type: 'Organization', id: 'TREE' },
      ],
    }),

    createOrganizationType: builder.mutation<ApiResponse<OrganizationTypeItem>, CreateOrganizationTypePayload>({
      query: (body) => ({
        url: '/organization-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),

    updateOrganizationType: builder.mutation<ApiResponse<OrganizationTypeItem>, UpdateOrganizationTypePayload>({
      query: ({ id, ...body }) => ({
        url: `/organization-types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),

    deleteOrganizationType: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/organization-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrganizationTypesQuery,
  useGetOrganizationsQuery,
  useLazyGetOrganizationsQuery,
  useGetOrganizationTreeQuery,
  useGetOrganizationByIdQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useCreateOrganizationTypeMutation,
  useUpdateOrganizationTypeMutation,
  useDeleteOrganizationTypeMutation,
} = organizationsApi;
