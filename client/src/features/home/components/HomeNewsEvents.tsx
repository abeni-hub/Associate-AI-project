import { useState, useEffect } from 'react'
import { getHomeHighlights, parseNewsItem, parseEventItem, useGetNewsQuery, useGetEventsQuery } from '../../news-events'
import HomeNewsControls from './HomeNewsControls'
import HomeNewsGrid from './HomeNewsGrid'
import { NEWS_EVENTS_STORAGE_KEY, NEWS_EVENTS_UPDATED_EVENT } from '../../../../../shared/newsEventsStorage.js'
import '../../news-events/styles/homeNews.css'

export interface HomeNewsEventsProps {
  language?: string
  onNavigateToHub?: (tab: string) => void
  onSelectItem?: (item: any) => void
  newsEventsContent?: any
}

export default function HomeNewsEvents({
  language = 'en',
  onNavigateToHub,
  onSelectItem,
  newsEventsContent,
}: HomeNewsEventsProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'events'>(() => {
    if (newsEventsContent?.showNews === false && newsEventsContent?.showEvents !== false) {
      return 'events'
    }
    return 'news'
  })
  const { data: apiNews } = useGetNewsQuery()
  const { data: apiEvents } = useGetEventsQuery()
  const [data, setData] = useState<{
    news: any[]
    events: any[]
    totalNews: number
    totalEvents: number
  }>({
    news: [],
    events: [],
    totalNews: 0,
    totalEvents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [contentRevision, setContentRevision] = useState(0)

  useEffect(() => {
    const refreshWhenContentChanges = (event: Event | StorageEvent) => {
      if (event.type === NEWS_EVENTS_UPDATED_EVENT || (event as StorageEvent).key === NEWS_EVENTS_STORAGE_KEY) {
        setContentRevision((revision) => revision + 1)
      }
    }
    window.addEventListener('storage', refreshWhenContentChanges)
    window.addEventListener(NEWS_EVENTS_UPDATED_EVENT, refreshWhenContentChanges)
    return () => {
      window.removeEventListener('storage', refreshWhenContentChanges)
      window.removeEventListener(NEWS_EVENTS_UPDATED_EVENT, refreshWhenContentChanges)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        const fallbackHighlights = await getHomeHighlights()
        if (!mounted) return

        let liveNewsItems: any[] | null = null
        if (apiNews?.data && Array.isArray(apiNews.data)) {
          liveNewsItems = apiNews.data.map(parseNewsItem)
        }

        let liveEventItems: any[] | null = null
        const rawEventData = (apiEvents?.data as any)?.data || apiEvents?.data
        if (Array.isArray(rawEventData)) {
          liveEventItems = rawEventData.map(parseEventItem)
        }

        const finalNews = liveNewsItems !== null ? liveNewsItems : fallbackHighlights.news
        const finalEvents = liveEventItems !== null ? liveEventItems : fallbackHighlights.events

        setData({
          news: finalNews,
          events: finalEvents,
          totalNews: finalNews.length,
          totalEvents: finalEvents.length,
        })
      } catch (error) {
        console.error('Failed to load home highlights:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [contentRevision, apiNews, apiEvents])

  const items = activeTab === 'news' ? data.news.slice(0, 3) : data.events.slice(0, 3)

  return (
    <div className="home-news-events">
      <HomeNewsControls
        language={language}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        data={data}
        onNavigateToHub={onNavigateToHub}
        newsEventsContent={newsEventsContent}
      />
      <HomeNewsGrid
        items={items}
        loading={loading}
        language={language}
        onSelectItem={onSelectItem}
      />
    </div>
  )
}

