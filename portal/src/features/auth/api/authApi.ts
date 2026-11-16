import { baseApi } from '../../../app/baseApi';
import type { ApiResponse } from '../../../types/api.types';
import type {
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types/auth.types';
import { clearAuth, setCredentials } from '../slice/authSlice';

export const authFeatureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponseData>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(
              setCredentials({
                token: data.data.token,
                user: data.data,
              })
            );
          }
        } catch {
          // Errors handled by caller or UI hooks
        }
      },
    }),

      getMe: builder.query<ApiResponse<AuthUser>, void>({
        query: () => ({
          url: '/auth/me',
          method: 'GET',
        }),
        providesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(
              setCredentials({
                user: data.data,
              })
            );
          }
        } catch {
          // If 401 or token expired, caller handles redirection
        }
      },
    }),

    keepAlive: builder.mutation<ApiResponse<{ active: boolean }>, void>({
      query: () => ({
        url: '/auth/activity',
        method: 'POST',
      }),
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearAuth());
        }
      },
    }),

    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body,
      }),
    }),

    forgotPassword: builder.mutation<ApiResponse<null>, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<null>, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    register: builder.mutation<ApiResponse<AuthUser>, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useKeepAliveMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRegisterMutation,
} = authFeatureApi;
