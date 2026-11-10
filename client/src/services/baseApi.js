import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getBaseApiUrl } from '../config/apiConfig.js';

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
  tagTypes: ['News', 'Feedback', 'Service', 'ServiceStep', 'Organization', 'Cms', 'Event'],
  endpoints: () => ({}),
});
