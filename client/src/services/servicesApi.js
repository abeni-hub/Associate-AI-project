import { baseApi } from './baseApi.js';

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: (params) => ({
        url: '/services',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Service'],
    }),

    getServiceById: builder.query({
      query: (idOrCode) => ({
        url: `/services/${idOrCode}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, idOrCode) => [{ type: 'Service', id: idOrCode }],
    }),

    getServiceSteps: builder.query({
      query: (serviceIdOrCode) => ({
        url: `/services/${serviceIdOrCode}/steps`,
        method: 'GET',
      }),
      providesTags: (_result, _error, serviceIdOrCode) => [{ type: 'ServiceStep', id: serviceIdOrCode }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetServicesQuery, useGetServiceByIdQuery, useGetServiceStepsQuery } = servicesApi;
