import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_TAG_TYPES } from '../types/api.types';
import { getCookie, tokenStorage } from '../utils/tokenStorage';
import { getBaseApiUrl } from '../config/apiConfig.js';

const getBaseUrl = (): string => getBaseApiUrl(import.meta.env.DEV);

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

