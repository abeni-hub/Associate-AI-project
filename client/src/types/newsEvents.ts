export type Language = 'en' | 'am';
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
}

export interface FeedFilterParams {
  page: number;
  limit: number;
  category: string;
  subCity: string;
  search: string;
}

export interface LandingPageCmsConfig {
  announcement?: unknown;
  hero?: {
    slides?: Array<Record<string, unknown> & { bureau?: string; title?: string; description?: string; category?: string }>;
    [key: string]: unknown;
  };
  journey?: unknown;
  [key: string]: unknown;
}
