import { baseApi } from './baseApi';
import type { ApiResponse } from '../types/api.types';

export interface CmsAnnouncement {
  enabled: boolean;
  tag: string;
  message: string;
  linkText: string;
  linkUrl: string;
}

export interface CmsHeroSlide {
  id: number;
  title: string;
  bureau: string;
  category: string;
  image: string;
  alt: string;
  credit?: string;
  source?: string;
  tint?: string;
}

export interface CmsHero {
  badge: string;
  titleEn: string;
  titleAm: string;
  subtitleEn: string;
  subtitleAm: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  slides: CmsHeroSlide[];
}

export interface CmsQuickSearch {
  enabled: boolean;
  kicker: string;
  kickerNum: string;
  title: string;
  subtitle: string;
  buttonText: string;
  footnoteText: string;
}

export interface CmsServiceGuide {
  enabled: boolean;
  kicker: string;
  kickerNum: string;
  titleLead: string;
  titleEmphasis: string;
  description: string;
  sampleBadgeText: string;
  whatToBringTitle: string;
  expectationsNote: string;
  routeHeading: string;
  disclaimerText: string;
}

export interface CmsJourneyStep {
  step: string;
  title: string;
  detail: string;
}

export interface CmsJourney {
  enabled: boolean;
  kicker: string;
  kickerNum: string;
  title: string;
  steps: CmsJourneyStep[];
}

export interface CmsNewsEvents {
  enabled: boolean;
  kicker: string;
  kickerNum: string;
  title: string;
  sourceLabel: string;
  showEvents: boolean;
  showNews: boolean;
  viewAllText: string;
  emptyMessage: string;
}

export interface CmsFeedback {
  enabled: boolean;
  kicker: string;
  kickerNum: string;
  title: string;
  description: string;
}

export interface CmsFooter {
  tagline: string;
  description: string;
  copyrightText: string;
}

export interface LandingPageCmsConfig {
  announcement?: CmsAnnouncement;
  hero?: CmsHero;
  quickSearch?: CmsQuickSearch;
  serviceGuide?: CmsServiceGuide;
  journey?: CmsJourney;
  newsEvents?: CmsNewsEvents;
  feedback?: CmsFeedback;
  footer?: CmsFooter;
}

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandingPageCms: builder.query<ApiResponse<LandingPageCmsConfig>, void>({
      query: () => ({
        url: '/cms/landing-page',
        method: 'GET',
      }),
      providesTags: ['Cms' as any],
    }),

    updateLandingPageCms: builder.mutation<ApiResponse<LandingPageCmsConfig>, Partial<LandingPageCmsConfig>>({
      query: (body) => ({
        url: '/cms/landing-page',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Cms' as any],
    }),

    uploadCmsImage: builder.mutation<ApiResponse<{ url: string }>, FormData>({
      query: (formData) => ({
        url: '/cms/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLandingPageCmsQuery,
  useUpdateLandingPageCmsMutation,
  useUploadCmsImageMutation,
} = cmsApi;

