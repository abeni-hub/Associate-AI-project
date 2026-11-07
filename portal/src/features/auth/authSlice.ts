import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from './auth.types';
import { tokenStorage } from '../../utils/tokenStorage';

const initialState: AuthState = {
  token: tokenStorage.getToken(),
  isAuthenticated: false,
  status: 'idle',
  userSummary: null,
};

/**
 * Authentication Slice
 *
 * Stores strictly client-side session status, minimal summary info, and in-memory bearer token.
 * Full profile data, permissions, and organization details are managed by RTK Query's cache.
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token?: string;
        user?: AuthUser;
      }>,
    ) => {
      const { token, user } = action.payload;

      if (token !== undefined) {
        state.token = token;
        tokenStorage.setToken(token);
      }

      state.isAuthenticated = true;
      state.status = 'authenticated';

      if (user) {
        state.userSummary = {
          id: user.id,
          name: user.name,
          username: user.username,
          roleSlug: user.role?.slug ?? null,
          organizationName: user.organization?.name ?? null,
        };
      }
    },

    clearAuth: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'unauthenticated';
      state.userSummary = null;
      tokenStorage.clearToken();
    },

    setAuthStatus: (state, action: PayloadAction<AuthState['status']>) => {
      state.status = action.payload;
    },
  },
});

export const { setCredentials, clearAuth, setAuthStatus } = authSlice.actions;

export default authSlice.reducer;
