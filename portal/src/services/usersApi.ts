import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, PaginationQueryParams } from '../types/api.types';
import type { AuthUser } from '../features/auth/auth.types';

export interface UserFilterParams extends PaginationQueryParams {
  organization_id?: number;
  role_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
  organization_id: number;
  status?: 'active' | 'inactive';
}

export interface UpdateUserPayload {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  role_id?: number;
  organization_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * User Management RTK Query API
 *
 * Injected into baseApi for administrative provisioning, role assignments, and listing.
 * Matches /backend/docs/api.md Section 6.
 */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<AuthUser>, UserFilterParams | void>({
      query: (params) => ({
        url: '/users',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<ApiResponse<AuthUser>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<ApiResponse<AuthUser>, CreateUserPayload>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<ApiResponse<AuthUser>, UpdateUserPayload>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
