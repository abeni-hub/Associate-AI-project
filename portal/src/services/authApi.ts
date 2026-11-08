import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';
import type {
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  ResetPasswordRequest,
} from '../features/auth/auth.types';
import { clearAuth, setCredentials } from '../features/auth/authSlice';

/**
 * Authentication API Service
 *
 * Implements endpoints specified in Laravel backend specification (/backend/docs/api.md):
 * - POST /api/v1/auth/login
 * - GET  /api/v1/auth/me
 * - POST /api/v1/auth/logout
 * - PUT  /api/v1/auth/change-password
 * - POST /api/v1/auth/forgot-password
 * - POST /api/v1/auth/reset-password
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Authenticate credentials and receive session token & profile.
     */
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
              }),
            );
          }
        } catch {
          // Errors handled by caller or UI hooks
        }
      },
    }),

    /**
     * Fetch current authenticated user's profile and organization context.
     */
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
            dispatch(setCredentials({ user: data.data }));
          }
        } catch (err: unknown) {
          const status = (err as { error?: { status?: number } })?.error?.status;
          if (status === 401 || status === 403) {
            dispatch(clearAuth());
          }
        }
      },
    }),

    /**
     * User registration.
     * Note: Current backend provisions users via administrative POST /api/v1/users.
     * This endpoint targets /auth/register with configurable fallback for future public registration.
     */
    register: builder.mutation<ApiResponse<AuthUser>, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * Terminate authenticated session and revoke access token.
     */
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearAuth());
          // Clear all cached query data across the base API
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    /**
     * Token / Session refresh endpoint.
     * Assumption: Laravel Sanctum uses persistent personal access tokens or stateful cookie sessions.
     * If explicit refresh endpoint is enabled, it hits /auth/refresh.
     */
    refreshToken: builder.mutation<ApiResponse<{ token: string }>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Change password for authenticated user.
     */
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body,
      }),
    }),

    /**
     * Request password reset link.
     */
    forgotPassword: builder.mutation<ApiResponse<null>, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Reset password using token received via email.
     */
    resetPassword: builder.mutation<ApiResponse<null>, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
