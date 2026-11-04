import { useState, useEffect } from 'react'
import { getHomeHighlights, parseNewsItem, parseEventItem } from '../../services/newsEventsService'
import HomeNewsControls from './HomeNewsControls.jsx'
import HomeNewsGrid from './HomeNewsGrid.jsx'
import { NEWS_EVENTS_STORAGE_KEY, NEWS_EVENTS_UPDATED_EVENT } from '../../../../shared/newsEventsStorage.js'
import { useGetNewsQuery } from '../../services/newsApi.js'
import { useGetEventsQuery } from '../../services/eventsApi.js'

export default function HomeNewsEvents({
  language = 'en',
  onNavigateToHub,
  onSelectItem,
}) {
  const [activeTab, setActiveTab] = useState('news')
  const { data: apiNews } = useGetNewsQuery()
  const { data: apiEvents } = useGetEventsQuery()
  const [data, setData] = useState({
    news: [],
    events: [],
    totalNews: 0,
    totalEvents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [contentRevision, setContentRevision] = useState(0)

  useEffect(() => {
    const refreshWhenContentChanges = (event) => {
      if (event.type === NEWS_EVENTS_UPDATED_EVENT || event.key === NEWS_EVENTS_STORAGE_KEY) {
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

        let liveNewsItems = []
        if (apiNews?.data && Array.isArray(apiNews.data) && apiNews.data.length > 0) {
          liveNewsItems = apiNews.data.map(parseNewsItem)
        }

        let liveEventItems = []
        const rawEventData = apiEvents?.data?.data || apiEvents?.data
        if (Array.isArray(rawEventData) && rawEventData.length > 0) {
          liveEventItems = rawEventData.map(parseEventItem)
        }

        const finalNews = liveNewsItems.length > 0 ? liveNewsItems : fallbackHighlights.news
        const finalEvents = liveEventItems.length > 0 ? liveEventItems : fallbackHighlights.events

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
