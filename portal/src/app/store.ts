import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../services/baseApi';
import authReducer from '../features/auth/authSlice';

/**
 * Redux Toolkit Central Store
 *
 * Configured with:
 * - baseApi reducer for RTK Query caching & state management
 * - auth reducer for client-side authentication status
 * - RTK Query middleware for caching, invalidation, polling, and refetching
 */
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignored actions/paths if non-serializable objects (like FormData or File) are used in uploads
        ignoredActions: ['api/executeMutation/pending'],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

// Enable refetchOnFocus and refetchOnReconnect capabilities
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
