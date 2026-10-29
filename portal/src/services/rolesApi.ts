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
  description?: string;
  is_system: boolean;
  is_active: boolean;
  permissions_count?: number;
  permissions?: PermissionItem[];
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
        url: '/roles',
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
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
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),

    getPermissions: builder.query<ApiResponse<PermissionItem[]>, void>({
      query: () => ({
        url: '/permissions',
        method: 'GET',
      }),
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
  }),
  overrideExisting: false,
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
} = rolesApi;
