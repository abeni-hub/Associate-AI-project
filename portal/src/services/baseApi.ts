import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_TAG_TYPES } from '../types/api.types';
import { getCookie, tokenStorage } from '../utils/tokenStorage';

/**
 * Resolves the API base URL, defaulting to the live CivicLink deployment
 * and ensuring /api/v1 path is properly formatted.
 */
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let url = envUrl.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api/v1')) {
      url = `${url}/api/v1`;
    }
    return url;
  }
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  return 'http://civiclink.pharmasoft-et.com/api/v1';
};

/**
 * Shared RTK Query Base API
 *
 * Configured as the single central API service for all feature modules:
 * - Supports dual authentication: In-memory Bearer Token header + Laravel Sanctum stateful cookies
 * - credentials: 'include' enables cross-origin session cookies and CSRF
 * - Automatic X-XSRF-TOKEN header attachment when Sanctum CSRF cookie is present
 * - Central tag types for cross-module cache invalidation
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // 1. Resolve Bearer token from Redux state or in-memory token holder
      const state = getState() as { auth?: { token?: string | null } };
      const token = state.auth?.token || tokenStorage.getToken();

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // 2. Attach X-XSRF-TOKEN header if Laravel Sanctum cookie is present
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (xsrfToken && !headers.has('X-XSRF-TOKEN')) {
        headers.set('X-XSRF-TOKEN', xsrfToken);
      }

      // 3. Ensure API response contract is JSON
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }

      return headers;
    },
  }),
  tagTypes: API_TAG_TYPES,
  endpoints: () => ({}),
});
