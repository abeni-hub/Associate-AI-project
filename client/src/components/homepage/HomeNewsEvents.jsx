import { useState, useEffect } from 'react'
import { getHomeHighlights } from '../../services/newsEventsService'
import HomeNewsControls from './HomeNewsControls.jsx'
import HomeNewsGrid from './HomeNewsGrid.jsx'
import { NEWS_EVENTS_STORAGE_KEY, NEWS_EVENTS_UPDATED_EVENT } from '../../../../shared/newsEventsStorage.js'

export default function HomeNewsEvents({
  language = 'en',
  onNavigateToHub,
  onSelectItem,
}) {
  const [activeTab, setActiveTab] = useState('news')
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
        if (mounted) setData(result)
      } catch (error) {
        console.error('Failed to load home highlights:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [contentRevision])

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
