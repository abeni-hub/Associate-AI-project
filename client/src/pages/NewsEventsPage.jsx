import { useState, useEffect, useRef, useCallback } from 'react'
import {
  fetchNews,
  fetchEvents,
  fetchCombinedFeed,
} from '../services/newsEventsService'
import FloatingBackToTop from '../components/news-events/FloatingBackToTop.jsx'
import NewsEventsFeed from '../components/news-events/NewsEventsFeed.jsx'
import NewsEventsFilterToolbar from '../components/news-events/NewsEventsFilterToolbar.jsx'
import NewsEventsHero from '../components/news-events/NewsEventsHero.jsx'

export default function NewsEventsPage({
  language = 'en',
  initialTab = 'all', // 'all' | 'news' | 'events'
  onNavigateToDetail,
}) {

  // Filter state
  const [activeType, setActiveType] = useState(initialTab) // 'all' | 'news' | 'events'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubCity, setSelectedSubCity] = useState('All Addis Ababa')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Infinite Scroll State (YouTube-like continuous loading)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Floating Back-to-Top State
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Observer Sentinel for Infinite Scrolling
  const sentinelRef = useRef(null)

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Track scroll position for "Back to top"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset & fetch page 1 whenever filters change
  useEffect(() => {
    let ignore = false

    async function resetAndFetch() {
      setLoading(true)
      setPage(1)
      try {
        let res
        const filterParams = {
          page: 1,
          limit: 6,
          category: selectedCategory === 'all' ? '' : selectedCategory,
          subCity: selectedSubCity === 'All Addis Ababa' ? '' : selectedSubCity,
          search: debouncedSearch,
        }

        if (activeType === 'news') {
          res = await fetchNews(filterParams)
        } else if (activeType === 'events') {
          res = await fetchEvents(filterParams)
        } else {
          res = await fetchCombinedFeed(filterParams)
        }

        if (!ignore) {
          setItems(res.items)
          setHasMore(res.hasMore)
          setTotalCount(res.total)
        }
      } catch (err) {
        console.error('Failed to load feed:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    resetAndFetch()
    return () => { ignore = true }
  }, [activeType, selectedCategory, selectedSubCity, debouncedSearch])

  // Load next page (YouTube-like infinite scroll)
  const loadNextPage = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const nextPage = page + 1
    try {
      let res
      const filterParams = {
        page: nextPage,
        limit: 6,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        subCity: selectedSubCity === 'All Addis Ababa' ? '' : selectedSubCity,
        search: debouncedSearch,
      }

      if (activeType === 'news') {
        res = await fetchNews(filterParams)
      } else if (activeType === 'events') {
        res = await fetchEvents(filterParams)
      } else {
        res = await fetchCombinedFeed(filterParams)
      }

      setItems((prev) => [...prev, ...res.items])
      setPage(nextPage)
      setHasMore(res.hasMore)
      setTotalCount(res.total)
    } catch (err) {
      console.error('Error loading next page:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, activeType, selectedCategory, selectedSubCity, debouncedSearch])

  // IntersectionObserver for YouTube-like infinite scrolling
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadNextPage()
        }
      },
      {
        root: null,
        rootMargin: '200px', // Preload before user hits absolute bottom
        threshold: 0.1,
      }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadNextPage])


  function resetFilters() {
    setSelectedCategory('all')
    setSelectedSubCity('All Addis Ababa')
    setSearchQuery('')
  }

  return (
    <div className="news-events-page" lang={language}>
      <NewsEventsHero language={language} />
      <NewsEventsFilterToolbar
        language={language}
        activeType={activeType}
        setActiveType={setActiveType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSubCity={selectedSubCity}
        setSelectedSubCity={setSelectedSubCity}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onReset={resetFilters}
      />
      <NewsEventsFeed
        language={language}
        items={items}
        totalCount={totalCount}
        loading={loading}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
        onNavigateToDetail={onNavigateToDetail}
        onResetFilters={resetFilters}
      />
      {showScrollTop && <FloatingBackToTop language={language} />}
    </div>
  )
}
