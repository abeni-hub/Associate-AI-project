import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_TAG_TYPES } from '../types/api.types';
import { getCookie, tokenStorage } from '../utils/tokenStorage';

export const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

export const BACKEND_URL: string = (() => {
  const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  const envBackend =
    (proc && (proc.env?.VITE_BACKEND_URL || proc.env?.BACKEND_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_BACKEND_URL || import.meta.env?.BACKEND_URL));

  if (typeof envBackend === 'string' && envBackend.trim().length > 0) {
    return envBackend.trim().replace(/\/+$/, '');
  }

  return DEFAULT_BACKEND_URL;
})();

export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export function getBaseApiUrl(isDev = false): string {
  if (isDev) {
    return '/api/v1';
  }

  const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  const envApi =
    (proc && proc.env?.VITE_API_BASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL);

  if (typeof envApi === 'string' && envApi.trim().length > 0) {
    const url = envApi.trim().replace(/\/+$/, '');
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.endsWith('/api')) return `${url}/v1`;
      if (!url.endsWith('/api/v1')) return `${url}/api/v1`;
      return url;
    }
  }

  return API_BASE_URL;
}

export const DEFAULT_CLIENT_URL = 'https://client.pharmasoft-et.com';

export function getClientBaseUrl(): string {
  const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  const envClient =
    (proc && (proc.env?.VITE_CLIENT_URL || proc.env?.CLIENT_URL)) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_CLIENT_URL || import.meta.env?.CLIENT_URL));

  if (typeof envClient === 'string' && envClient.trim().length > 0) {
    return envClient.trim().replace(/\/+$/, '');
  }

  return DEFAULT_CLIENT_URL;
}

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
