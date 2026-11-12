import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from '../types/auth.types';
import { mapBackendRoleToPortalRole } from '../types/auth.types';
import { tokenStorage } from '../../../utils/tokenStorage';
import type { RootState } from '../../../app/store';

const initialToken = tokenStorage.getToken();
const savedUser = tokenStorage.getSessionUser<AuthUser>();
const savedRole = tokenStorage.getSessionRole<'super' | 'subcity' | 'bureau'>() ||
  (savedUser?.role?.slug ? mapBackendRoleToPortalRole(savedUser.role.slug) : 'super');

const initialState: AuthState = {
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  status: initialToken ? 'authenticated' : 'idle',
  userSummary: savedUser
    ? {
        id: savedUser.id,
        name: savedUser.name,
        username: savedUser.username,
        roleSlug: savedUser.role?.slug ?? null,
        organizationName: savedUser.organization?.name ?? null,
      }
    : null,
  user: savedUser || null,
  role: savedRole,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token?: string;
        user?: AuthUser;
      }>
    ) => {
      const { token, user } = action.payload;

      if (token !== undefined) {
        state.token = token;
        tokenStorage.setToken(token);
      }

      state.isAuthenticated = true;
      state.status = 'authenticated';

      if (user) {
        state.user = user;
        const mappedRole = mapBackendRoleToPortalRole(user.role?.slug);
        state.role = mappedRole;
        tokenStorage.setSessionUser(user);
        tokenStorage.setSessionRole(mappedRole);

        state.userSummary = {
          id: user.id,
          name: user.name,
          username: user.username,
          roleSlug: user.role?.slug ?? null,
          organizationName: user.organization?.name ?? null,
        };
      }
    },

    setRole: (state, action: PayloadAction<'super' | 'subcity' | 'bureau'>) => {
      state.role = action.payload;
      tokenStorage.setSessionRole(action.payload);
    },

    clearAuth: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'unauthenticated';
      state.userSummary = null;
      state.user = null;
      state.role = 'super';
      tokenStorage.clearToken();
    },

    setAuthStatus: (state, action: PayloadAction<AuthState['status']>) => {
      state.status = action.payload;
    },
  },
});

export const { setCredentials, setRole, clearAuth, setAuthStatus } = authSlice.actions;

export const selectAuth = (state: RootState): AuthState => state.auth;

export const selectAuthToken = createSelector([selectAuth], (auth) => auth.token);
export const selectIsAuthenticated = createSelector([selectAuth], (auth) => auth.isAuthenticated);
export const selectAuthStatus = createSelector([selectAuth], (auth) => auth.status);
export const selectAuthUser = createSelector([selectAuth], (auth) => auth.user);
export const selectAuthRole = createSelector([selectAuth], (auth) => auth.role);
export const selectUserSummary = createSelector([selectAuth], (auth) => auth.userSummary);

export default authSlice.reducer;
