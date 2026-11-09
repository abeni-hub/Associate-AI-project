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
      query: (arg) => {
        const isObj = typeof arg === 'object' && arg !== null;
        const serviceId = isObj ? (arg.serviceId || arg.service) : arg;
        const params = isObj && arg.organization_id ? { organization_id: arg.organization_id } : undefined;
        return {
          url: `/services/${serviceId}/steps`,
          method: 'GET',
          params,
        };
      },
      providesTags: (_result, _error, arg) => {
        const id = typeof arg === 'object' && arg !== null
          ? `${arg.serviceId || arg.service}-${arg.organization_id || 'all'}`
          : arg;
        return [{ type: 'ServiceStep', id }];
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetServicesQuery, useGetServiceByIdQuery, useGetServiceStepsQuery } = servicesApi;
