import { baseApi } from '../../../app/baseApi';
import type { ApiResponse, PaginatedResponse } from '../../../types/api.types';
import type { AuthUser } from '../../auth/types/auth.types';
import type {
  UserFilterParams,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types/accounts.types';

export interface LoginLockout {
  id: number;
  identifier: string;
  ip_address: string;
  locked_until: string;
  remaining_seconds: number;
}

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoginLockouts: builder.query<ApiResponse<LoginLockout[]>, void>({
      query: () => ({
        url: '/users/locked-logins',
        method: 'GET',
      }),
    }),

    unlockLoginLockout: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/users/locked-logins/${id}/unlock`,
        method: 'POST',
      }),
    }),

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
      invalidatesTags: [{ type: 'User', id: 'LIST' }, 'User'],
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
        'User',
      ],
    }),

    deleteUser: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }, 'User'],
    }),

    resetUserTwoFactor: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/users/${id}/two-factor/reset`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLoginLockoutsQuery,
  useUnlockLoginLockoutMutation,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserTwoFactorMutation,
} = accountsApi;
