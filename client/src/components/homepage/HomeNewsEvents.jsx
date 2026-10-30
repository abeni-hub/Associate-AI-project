import { useState, useEffect } from 'react'
import { getHomeHighlights } from '../../services/newsEventsService'
import HomeNewsControls from './HomeNewsControls.jsx'
import HomeNewsGrid from './HomeNewsGrid.jsx'
import { NEWS_EVENTS_STORAGE_KEY, NEWS_EVENTS_UPDATED_EVENT } from '../../../../shared/newsEventsStorage.js'
import { useGetNewsQuery } from '../../services/newsApi.js'

export default function HomeNewsEvents({
  language = 'en',
  onNavigateToHub,
  onSelectItem,
}) {
  const [activeTab, setActiveTab] = useState('news')
  const { data: apiNews } = useGetNewsQuery()
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
      if (event.type === NEWS_EVENTS_UPDATED_EVENT || event.key === NEWS_EVENTS_STORAGE_KEY) setContentRevision((revision) => revision + 1)
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
        const result = await getHomeHighlights()
        if (mounted) {
          if (apiNews?.data && Array.isArray(apiNews.data) && apiNews.data.length > 0) {
            const liveNewsItems = apiNews.data.map((art) => ({
              id: String(art.id),
              type: 'news',
              title: art.news_title,
              titleAm: '',
              slug: `news-${art.id}`,
              summary: art.contents?.[0]?.content || 'Official Municipal Announcement',
              summaryAm: '',
              content: art.contents?.map((c) => c.content).join('\n\n') || '',
              contentAm: '',
              category: 'Public notice',
              categoryAm: 'ይፋዊ ማስታወቂያ',
              subCity: art.organization?.name || 'All Addis Ababa',
              subCityAm: 'መላው አዲስ አበባ',
              bureau: art.organization?.name || 'City Administration',
              bureauAm: 'የከተማ አስተዳደር',
              coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
              publishedAt: art.created_at ? art.created_at.split('T')[0] : '2026-10-26',
              readTimeMinutes: 3,
              isPublished: true,
            }))
            setData({
              news: liveNewsItems,
              events: result.events,
              totalNews: liveNewsItems.length,
              totalEvents: result.totalEvents,
            })
          } else {
            setData(result)
          }
        }
      } catch (error) {
        console.error('Failed to load home highlights:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [contentRevision, apiNews])

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
