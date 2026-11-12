import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import authReducer from '../features/auth/authSlice';
import feedbackReducer from '../features/feedback/slice/feedbackSlice';
import qrCodesReducer from '../features/qr-codes/slice/qrCodesSlice';
import dashboardReducer from '../features/dashboard/slice/dashboardSlice';
import accountsReducer from '../features/accounts/slice/accountsSlice';
import uiReducer from '../features/shared/slice/uiSlice';

/**
 * Redux Toolkit Central Store
 *
 * Configured with:
 * - baseApi reducer for RTK Query caching & state management
 * - auth reducer for client-side authentication status
 * - feedbackUi reducer for citizen feedback filtering & local UI state
 * - qrCodesUi reducer for QR poster management UI state
 * - dashboardUi reducer for dashboard metrics & period state
 * - accountsUi reducer for admin account management & search state
 * - ui reducer for responsive layout drawer and active modal state
 * - RTK Query middleware for caching, invalidation, polling, and refetching
 */
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    feedbackUi: feedbackReducer,
    qrCodesUi: qrCodesReducer,
    dashboardUi: dashboardReducer,
    accountsUi: accountsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignored actions for non-serializable payloads (e.g. FormData/File in document uploads)
        ignoredActions: ['api/executeMutation/pending'],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

// Enable refetchOnFocus and refetchOnReconnect capabilities
setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
