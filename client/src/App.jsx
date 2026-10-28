import { useEffect, useLayoutEffect, useState } from 'react'
import './App.css'
import AnnouncementBar from './components/layout/AnnouncementBar.jsx'
import SiteFooter from './components/layout/SiteFooter.jsx'
import SiteHeader from './components/layout/SiteHeader.jsx'
import NewsEventsPage from './pages/NewsEventsPage.jsx'
import ItemDetailPage from './pages/ItemDetailPage.jsx'
import './styles/newsEvents.css'
import { translate } from './i18n/translations.js'
import HomePage from './pages/HomePage.jsx'
function App() {
  const [language, setLanguage] = useState(() => window.localStorage.getItem('civiclink-language') === 'am' ? 'am' : 'en')
  const [detailItemId, setDetailItemId] = useState(() => {
    const hash = window.location.hash
    const match = hash.match(/^#\/(news|event)\/([^/?#]+)/i)
    return match ? match[2] : null
  })
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.toLowerCase()
    if (hash.startsWith('#/news/') || hash.startsWith('#/event/')) {
      return 'detail'
    }
    if (hash.startsWith('#/news') || hash.startsWith('#/events') || hash === '#/news-events') {
      return 'news-events'
    }
    return 'home'
  })
  const [newsEventsTab, setNewsEventsTab] = useState(() => {
    const hash = window.location.hash.toLowerCase()
    if (hash === '#/events') return 'events'
    if (hash === '#/news') return 'news'
    return 'all'
  })

  function navigateToDetail(item) {
    const route = item.type === 'event' ? `#/event/${item.id}` : `#/news/${item.id}`
    setDetailItemId(item.id)
    setCurrentView('detail')
    window.location.hash = route
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigateToHome() {
    setCurrentView('home')
    window.location.hash = '#/'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigateToHomeSection(sectionId) {
    setCurrentView('home')
    window.location.hash = `#${sectionId}`
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  function navigateToNews() {
    setCurrentView('news-events')
    setNewsEventsTab('all')
    window.location.hash = '#/news-events'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleLanguage() {
    setLanguage((current) => current === 'en' ? 'am' : 'en')
  }

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash
      const detailMatch = hash.match(/^#\/(news|event)\/([^/?#]+)/i)
      if (detailMatch) {
        setDetailItemId(detailMatch[2])
        setCurrentView('detail')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      const lower = hash.toLowerCase()
      if (lower === '#/news-events') {
        setCurrentView('news-events')
        setNewsEventsTab('all')
        setDetailItemId(null)
      } else if (lower === '#/news') {
        setCurrentView('news-events')
        setNewsEventsTab('news')
        setDetailItemId(null)
      } else if (lower === '#/events') {
        setCurrentView('news-events')
        setNewsEventsTab('events')
        setDetailItemId(null)
      } else if (lower === '#/' || lower === '' || lower === '#top' || lower.startsWith('#find') || lower.startsWith('#how') || lower.startsWith('#feedback') || lower.startsWith('#news')) {
        setCurrentView('home')
        setDetailItemId(null)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const t = (text) => translate(text, language)


  useEffect(() => {
    window.localStorage.setItem('civiclink-language', language)
    document.documentElement.lang = language
    document.title = language === 'am' ? 'ሲቪክሊንክ ኢትዮጵያ — የዜጎች አገልግሎት' : 'CivicLink Ethiopia — Citizen Services, Made Clear'
    const description = document.querySelector('meta[name="description"]')
    if (description) description.content = language === 'am'
      ? 'የኢትዮጵያን የህዝብ አገልግሎቶች ለመጠቀም ይዘጋጁ። ሰነዶችን፣ የቢሮ ሂደቶችን፣ የማህበረሰብ ዜናዎችንና የአስተያየት መንገዶችን በአንድ ቦታ ያግኙ።'
      : 'Plan your visit to Ethiopian public services. Find the documents, office steps, community news, and feedback channels you need in one place.'
  }, [language])

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const targets = document.querySelectorAll('.scroll-reveal, .scroll-reveal-group')
    if (!targets.length) return undefined

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.remove('is-pending')
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' })

    targets.forEach((target) => {
      target.classList.add('is-pending')
      observer.observe(target)
    })

    return () => observer.disconnect()
  }, [currentView])


  return (
    <div className={`site-shell ${currentView === 'news-events' ? 'site-shell-hub' : currentView === 'detail' ? 'site-shell-detail' : ''}`} lang={language}>
      <AnnouncementBar t={t} onNavigateToHomeSection={navigateToHomeSection} />
      <SiteHeader
        currentView={currentView}
        language={language}
        t={t}
        onNavigateToHome={navigateToHome}
        onNavigateToHomeSection={navigateToHomeSection}
        onNavigateToNews={navigateToNews}
        onToggleLanguage={toggleLanguage}
      />

      {currentView === 'detail' && detailItemId ? (
        <ItemDetailPage
          itemId={detailItemId}
          language={language}
          onBackToHub={() => {
            setCurrentView('news-events')
            window.location.hash = '#/news-events'
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onBackToHome={() => {
            setCurrentView('home')
            window.location.hash = '#/'
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onNavigateToDetail={(item) => navigateToDetail(item)}
        />
      ) : currentView === 'news-events' ? (
        <NewsEventsPage
          language={language}
          initialTab={newsEventsTab}
          onNavigateToDetail={(item) => navigateToDetail(item)}
        />
      ) : (
        <HomePage
          language={language}
          t={t}
          onNavigateToHub={(tab) => {
            setNewsEventsTab(tab || 'all')
            setCurrentView('news-events')
            window.location.hash = '#/' + (tab || 'news-events')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onSelectItem={navigateToDetail}
        />
      )}

      <SiteFooter t={t} onNavigateToHomeSection={navigateToHomeSection} />
    </div>
  )
}

export default App
