import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Client App — Single Source of Truth for API Backend Configuration
 */
export const DEFAULT_BACKEND_URL = 'https://civillink.jobaleengineering.com';
export const BACKEND_URL = DEFAULT_BACKEND_URL;
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export function getBaseApiUrl(_isDev = false): string {
  return API_BASE_URL;
}

const getBaseUrl = () => getBaseApiUrl();

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
