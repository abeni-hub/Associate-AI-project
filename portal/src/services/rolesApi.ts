import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';

export interface PermissionItem {
  id: number;
  key: string;
  name: string;
  group: string;
  description?: string;
}

export interface RoleDetailItem {
  id: number;
  name: string;
  slug: string;
  scope_level?: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  permissions_count?: number;
  permissions?: PermissionItem[];
  permission_ids?: number[];
  navigation_items?: string[];
  created_at?: string;
}

export interface UpdateRolePermissionsPayload {
  roleId: number | string;
  permission_ids: number[];
}

/**
 * Roles & Permissions RTK Query API
 *
 * Implements endpoints matching /backend/docs/api.md Section 3.
 */
export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<ApiResponse<RoleDetailItem[]>, void>({
      query: () => ({
        url: '/roles?per_page=100',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (!response) return { success: true, message: '', data: [] };
        let list = response.data !== undefined ? response.data : response;
        if (list && list.data && Array.isArray(list.data)) {
          list = list.data;
        }
        if (!Array.isArray(list)) {
          list = [];
        }
        return {
          success: response.success ?? true,
          message: response.message || '',
          data: list,
        };
      },
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),

    getRoleById: builder.query<ApiResponse<RoleDetailItem>, number | string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (!response) return { success: true, message: '', data: null as any };
        let item = response.data !== undefined ? response.data : response;
        if (item && item.data && typeof item.data === 'object' && !Array.isArray(item.data)) {
          item = item.data;
        }
        return {
          success: response.success ?? true,
          message: response.message || '',
          data: item,
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),

    getPermissions: builder.query<ApiResponse<PermissionItem[]>, void>({
      query: () => ({
        url: '/permissions',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (!response) return { success: true, message: '', data: [] };
        let list = response.data !== undefined ? response.data : response;
        if (list && list.data && Array.isArray(list.data)) {
          list = list.data;
        }
        if (!Array.isArray(list)) {
          list = [];
        }
        return {
          success: response.success ?? true,
          message: response.message || '',
          data: list,
        };
      },
      providesTags: ['Permission'],
    }),

    updateRolePermissions: builder.mutation<ApiResponse<RoleDetailItem>, UpdateRolePermissionsPayload>({
      query: ({ roleId, permission_ids }) => ({
        url: `/roles/${roleId}/permissions`,
        method: 'PUT',
        body: { permission_ids },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    createRole: builder.mutation<ApiResponse<RoleDetailItem>, {
      name: string;
      slug?: string;
      scope_level?: string;
      description?: string;
      is_active?: boolean;
      permission_ids?: number[];
      navigation_items?: string[];
    }>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    updateRole: builder.mutation<ApiResponse<RoleDetailItem>, {
      id: number | string;
      name?: string;
      scope_level?: string;
      description?: string;
      is_active?: boolean;
      permission_ids?: number[];
      navigation_items?: string[];
    }>({
      query: ({ id, ...body }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    deleteRole: builder.mutation<ApiResponse<null>, number | string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    getNavigationItems: builder.query<ApiResponse<any[]>, void>({
      query: () => ({
        url: '/navigation/items',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (!response) return { success: true, message: '', data: [] };
        let list = response.data !== undefined ? response.data : response;
        if (list && list.data && Array.isArray(list.data)) {
          list = list.data;
        }
        if (!Array.isArray(list)) {
          list = [];
        }
        return {
          success: response.success ?? true,
          message: response.message || '',
          data: list,
        };
      },
    }),

    updateRoleNavigationItems: builder.mutation<ApiResponse<RoleDetailItem>, {
      roleId: number | string;
      navigation_items: any[];
    }>({
      query: ({ roleId, navigation_items }) => ({
        url: `/roles/${roleId}/navigation-items`,
        method: 'PUT',
        body: { navigation_items },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useGetPermissionsQuery,
  useGetNavigationItemsQuery,
  useUpdateRolePermissionsMutation,
  useUpdateRoleNavigationItemsMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
