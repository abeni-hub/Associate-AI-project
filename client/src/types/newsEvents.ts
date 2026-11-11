export type Language = 'en' | 'am' | 'om';
export type FeedType = 'all' | 'news' | 'events';

export interface NewsEventItem {
  id: string;
  type: 'news' | 'event';
  title: string;
  titleAm?: string;
  summary?: string;
  summaryAm?: string;
  content?: string;
  contentAm?: string;
  category?: string;
  categoryAm?: string;
  bureau?: string;
  bureauAm?: string;
  subCity?: string;
  subCityAm?: string;
  coverImage?: string;
  images?: string[];
  eventDate?: string;
  endDate?: string;
  audience?: string;
  publishedAt?: string;
  location?: {
    venue?: string;
    venueAm?: string;
    address?: string;
    addressAm?: string;
    subCity?: string;
    subCityAm?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface FeedPage {
  items: NewsEventItem[];
  hasMore: boolean;
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface FeedFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  subCity?: string;
  search?: string;
}

export interface LandingPageCmsConfig {
  announcement?: any;
  hero?: any;
  journey?: any;
  quickSearch?: any;
  serviceGuide?: any;
  newsEvents?: any;
  feedback?: any;
  footer?: any;
  [key: string]: any;
}
