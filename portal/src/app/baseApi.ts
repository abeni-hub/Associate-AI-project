import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_TAG_TYPES } from '../types/api.types';
import { getCookie, tokenStorage } from '../utils/tokenStorage';
import { clearAuth } from '../features/auth/slice/authSlice';

export const DEFAULT_BACKEND_URL = 'https://civillink.jobaleengineering.com';
export const DEFAULT_CLIENT_URL = 'https://client.pharmasoft-et.com';

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

const getBaseUrl = (): string => {
  const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);
  return getBaseApiUrl(isDev);
};

/**
 * Shared RTK Query base API.
 *
 * We keep one central fetch layer so every feature shares the same auth, CSRF,
 * and JSON error contract without re-implementing headers in each endpoint.
 */
const rawBaseQuery = fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth?: { token?: string | null } };
      const token = state.auth?.token || tokenStorage.getToken();

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const xsrfToken = getCookie('XSRF-TOKEN');
      if (xsrfToken && !headers.has('X-XSRF-TOKEN')) {
        headers.set('X-XSRF-TOKEN', xsrfToken);
      }

      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
      if (!headers.has('Accept-Language')) {
        let language = 'en';
        try {
          if (typeof window !== 'undefined' && window.localStorage.getItem('civiclink_portal_language') === 'am') {
            language = 'am';
          }
        } catch {
          // Keep the API locale at English if browser storage is unavailable.
        }
        headers.set('Accept-Language', language);
      }

      return headers;
    },
  });

const baseQueryWithSessionExpiry: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const requestUrl = typeof args === 'string' ? args : args.url;

  if (
    !result.error &&
    tokenStorage.hasToken() &&
    !requestUrl.endsWith('/auth/login') &&
    !requestUrl.endsWith('/auth/activity') &&
    !requestUrl.endsWith('/auth/logout') &&
    typeof window !== 'undefined'
  ) {
    window.dispatchEvent(new Event('civiclink:api-activity'));
  }

  if (
    (result.error?.status === 401 || result.error?.status === 419) &&
    !requestUrl.endsWith('/auth/login') &&
    tokenStorage.hasToken()
  ) {
    tokenStorage.markSessionExpired();
    api.dispatch(clearAuth());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithSessionExpiry,
  tagTypes: API_TAG_TYPES,
  endpoints: () => ({}),
});
