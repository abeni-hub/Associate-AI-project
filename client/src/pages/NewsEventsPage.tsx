import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchNews,
  fetchEvents,
  fetchCombinedFeed,
} from '../services/newsEventsService';
import FloatingBackToTop from '../components/news-events/FloatingBackToTop.jsx';
import NewsEventsFeed from '../components/news-events/NewsEventsFeed.jsx';
import NewsEventsFilterToolbar from '../components/news-events/NewsEventsFilterToolbar.jsx';
import NewsEventsHero from '../components/news-events/NewsEventsHero.jsx';
import { NEWS_EVENTS_STORAGE_KEY, NEWS_EVENTS_UPDATED_EVENT } from '../../../shared/newsEventsStorage.js';
import type { FeedFilterParams, FeedPage, FeedType, Language, NewsEventItem } from '../types/newsEvents';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import {
  setActiveType,
  setSelectedCategory,
  setSelectedSubCity,
  setSearchQuery,
  resetFilters,
} from '../store/slices/newsFilterSlice.js';
import { useGetNewsQuery } from '../services/newsApi.js';

interface NewsEventsPageProps {
  language?: Language;
  initialTab?: FeedType;
  onNavigateToDetail?: (item: NewsEventItem) => void;
}

export default function NewsEventsPage({
  language = 'en',
  initialTab,
  onNavigateToDetail,
}: NewsEventsPageProps) {
  const dispatch = useAppDispatch();

  // RTK Query: fetch live news from backend and keep cache warm
  const { data: apiNews, refetch: refetchNews } = useGetNewsQuery();

  // Redux Filter state
  const { activeType, selectedCategory, selectedSubCity, searchQuery } = useAppSelector(
    (state: any) => state.newsFilter
  );

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Infinite Scroll State (YouTube-like continuous loading)
  const [items, setItems] = useState<NewsEventItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [contentRevision, setContentRevision] = useState(0);

  // Floating Back-to-Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Observer Sentinel for Infinite Scrolling
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sync initialTab if provided
  useEffect(() => {
    if (initialTab && initialTab !== activeType) {
      dispatch(setActiveType(initialTab));
    }
  }, [initialTab]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Track scroll position for "Back to top"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const refreshWhenContentChanges: EventListener = (rawEvent) => {
      const event = rawEvent as StorageEvent;
      if (rawEvent.type === NEWS_EVENTS_UPDATED_EVENT || event.key === NEWS_EVENTS_STORAGE_KEY) {
        setContentRevision((revision) => revision + 1);
        refetchNews();
      }
    };
    window.addEventListener('storage', refreshWhenContentChanges);
    window.addEventListener(NEWS_EVENTS_UPDATED_EVENT, refreshWhenContentChanges);
    return () => {
      window.removeEventListener('storage', refreshWhenContentChanges);
      window.removeEventListener(NEWS_EVENTS_UPDATED_EVENT, refreshWhenContentChanges);
    };
  }, [refetchNews]);

  // Reset & fetch page 1 whenever filters change
  useEffect(() => {
    let ignore = false;

    async function resetAndFetch() {
      setLoading(true);
      setPage(1);
      try {
        let res: FeedPage;
        const filterParams: FeedFilterParams = {
          page: 1,
          limit: 6,
          category: selectedCategory === 'all' ? '' : selectedCategory,
          subCity: selectedSubCity === 'All Addis Ababa' ? '' : selectedSubCity,
          search: debouncedSearch,
        };

        if (activeType === 'news') {
          res = (await fetchNews(filterParams)) as FeedPage;
        } else if (activeType === 'events') {
          res = (await fetchEvents(filterParams)) as FeedPage;
        } else {
          res = (await fetchCombinedFeed(filterParams)) as FeedPage;
        }

        if (!ignore) {
          setItems(res.items);
          setHasMore(res.hasMore);
          setTotalCount(res.total);
        }
      } catch (err) {
        console.error('Failed to load feed:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    resetAndFetch();

    return () => {
      ignore = true;
    };
  }, [activeType, selectedCategory, selectedSubCity, debouncedSearch, contentRevision, apiNews]);

  // Load next page
  const loadNextPage = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      let res: FeedPage;
      const filterParams: FeedFilterParams = {
        page: nextPage,
        limit: 6,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        subCity: selectedSubCity === 'All Addis Ababa' ? '' : selectedSubCity,
        search: debouncedSearch,
      };

      if (activeType === 'news') {
        res = (await fetchNews(filterParams)) as FeedPage;
      } else if (activeType === 'events') {
        res = (await fetchEvents(filterParams)) as FeedPage;
      } else {
        res = (await fetchCombinedFeed(filterParams)) as FeedPage;
      }

      setItems((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error('Failed to append next page:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, activeType, selectedCategory, selectedSubCity, debouncedSearch]);

  // IntersectionObserver for continuous infinite loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadNextPage();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage, hasMore, loading]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="news-events-page">
      <NewsEventsHero language={language} activeType={activeType} totalCount={totalCount} />

      <div className="nep-container">
        <NewsEventsFilterToolbar
          language={language}
          activeType={activeType}
          setActiveType={(t: FeedType) => dispatch(setActiveType(t))}
          searchQuery={searchQuery}
          setSearchQuery={(q: string) => dispatch(setSearchQuery(q))}
          selectedSubCity={selectedSubCity}
          setSelectedSubCity={(city: string) => dispatch(setSelectedSubCity(city))}
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat: string) => dispatch(setSelectedCategory(cat))}
          onReset={() => dispatch(resetFilters())}
        />

        <NewsEventsFeed
          items={items}
          loading={loading}
          language={language}
          hasMore={hasMore}
          activeType={activeType}
          onNavigateToDetail={onNavigateToDetail}
        />

        {/* Infinite Scroll Sentinel element */}
        <div ref={sentinelRef} className="nep-infinite-sentinel" style={{ height: '20px' }} />
      </div>

      <FloatingBackToTop visible={showScrollTop} onClick={scrollToTop} />
    </div>
  );
}
