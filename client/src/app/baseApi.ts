import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Client App — Single Source of Truth for API Backend Configuration
 */
export const DEFAULT_BACKEND_URL = 'https://civillink.jobaleengineering.com';

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

const getBaseUrl = () => getBaseApiUrl(import.meta.env.DEV);

/**
 * Shared RTK Query Base API for CivicLink Citizen Client
 */
export const baseApi = createApi({
  reducerPath: 'civicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['News', 'Feedback', 'Service', 'ServiceStep', 'Organization', 'Cms', 'Event', 'Document'],
  endpoints: () => ({}),
});
