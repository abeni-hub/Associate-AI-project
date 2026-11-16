import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_TAG_TYPES } from '../types/api.types';
import { getCookie, tokenStorage } from '../utils/tokenStorage';
import { clearAuth } from '../features/auth/slice/authSlice';

export const DEFAULT_BACKEND_URL = 'https://civillink.jobaleengineering.com';
export const DEFAULT_CLIENT_URL = 'https://client.pharmasoft-et.com';

export const BACKEND_URL = DEFAULT_BACKEND_URL;
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export function getBaseApiUrl(_isDev = false): string {
  return API_BASE_URL;
}

export function getClientBaseUrl(): string {
  return DEFAULT_CLIENT_URL;
}

const getBaseUrl = (): string => getBaseApiUrl();

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
