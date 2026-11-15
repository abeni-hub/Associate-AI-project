import { useEffect, useLayoutEffect, useState } from 'react'
import './App.css'
import { SiteFooter, SiteHeader, translate } from './features/shared'
import { NewsEventsPage, ItemDetailPage } from './features/news-events'
import './styles/newsEvents.css'
import { HomePage } from './features/home'
import { QrFeedbackPage } from './features/feedback'
import { useGetLandingPageCmsQuery } from './features/cms'
import type { FeedType, Language, NewsEventItem } from './types/newsEvents'

function isFeedbackOrQrRoute(path: string, hash: string, search: string): boolean {
  const p = path.toLowerCase()
  const h = hash.toLowerCase()
  const s = new URLSearchParams(search)
  const hs = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : null

  return (
    p === '/feedback' ||
    p.startsWith('/feedback') ||
    p.startsWith('/qr') ||
    p.startsWith('/guide') ||
    h === '#feedback' ||
    h.startsWith('#feedback') ||
    h === '#/feedback' ||
    h.startsWith('#/feedback') ||
    h.startsWith('#/qr') ||
    h.startsWith('#qr') ||
    h.startsWith('#guide') ||
    h.startsWith('#/guide') ||
    s.has('code') ||
    s.has('bureau') ||
    s.has('feedback') ||
    (s.has('org') && !h.startsWith('#find')) ||
    (hs !== null && (hs.has('code') || hs.has('bureau') || hs.has('feedback')))
  )
}

function App() {
  const { data: apiCmsData } = useGetLandingPageCmsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })
  const [cachedCms, setCachedCms] = useState<any>(null)

  useEffect(() => {
    const handleCmsUpdate = (e: any) => {
      if (e?.detail) {
        setCachedCms(e.detail)
      }
    }
    window.addEventListener('civiclink-cms-updated', handleCmsUpdate)
    return () => {
      window.removeEventListener('civiclink-cms-updated', handleCmsUpdate)
    }
  }, [])

  const cmsConfig = (apiCmsData && ('data' in apiCmsData ? apiCmsData.data : apiCmsData)) || cachedCms

  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem('civiclink-language') as Language
    if (saved === 'am' || saved === 'om') return saved
    return 'en'
  })
  const [detailItemId, setDetailItemId] = useState<string | null>(() => {
    const hash = window.location.hash
    const match = hash.match(/^#\/(news|event)\/([^/?#]+)/i)
    return match ? match[2] : null
  })
  const [currentView, setCurrentView] = useState<'home' | 'news-events' | 'detail' | 'feedback'>(() => {
    if (isFeedbackOrQrRoute(window.location.pathname, window.location.hash, window.location.search)) {
      return 'feedback'
    }
    const hash = window.location.hash.toLowerCase()
    if (hash.startsWith('#/news/') || hash.startsWith('#/event/')) {
      return 'detail'
    }
    if (hash.startsWith('#/news') || hash.startsWith('#/events') || hash === '#/news-events') {
      return 'news-events'
    }
    return 'home'
  })
  const [newsEventsTab, setNewsEventsTab] = useState<FeedType>(() => {
    const hash = window.location.hash.toLowerCase()
    if (hash === '#/events') return 'events'
    if (hash === '#/news') return 'news'
    return 'all'
  })

  function navigateToDetail(item: NewsEventItem) {
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

  function navigateToHomeSection(sectionId: string) {
    if (sectionId === 'feedback') {
      setCurrentView('feedback')
      window.location.hash = '#feedback'
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
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
    setLanguage((current) => (current === 'en' ? 'am' : current === 'am' ? 'om' : 'en'))
  }

  function handleSelectLanguage(newLang: string) {
    if (newLang === 'en' || newLang === 'am' || newLang === 'om') {
      setLanguage(newLang as Language)
    }
  }

  useEffect(() => {
    function onHashChange() {
      const path = window.location.pathname.toLowerCase()
      const hash = window.location.hash
      const lower = hash.toLowerCase()

      // 1. Direct feedback or QR scan route -> Dedicated Feedback & Service Guide Page
      if (isFeedbackOrQrRoute(path, hash, window.location.search)) {
        setCurrentView('feedback')
        setDetailItemId(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // 2. News/Event detail match
      const detailMatch = hash.match(/^#\/(news|event)\/([^/?#]+)/i)
      if (detailMatch) {
        setDetailItemId(detailMatch[2])
        setCurrentView('detail')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // 3. News and Events hub
      if (lower === '#/news-events' || path === '/news-events') {
        setCurrentView('news-events')
        setNewsEventsTab('all')
        setDetailItemId(null)
      } else if (lower === '#/news' || path === '/news') {
        setCurrentView('news-events')
        setNewsEventsTab('news')
        setDetailItemId(null)
      } else if (lower === '#/events' || path === '/events') {
        setCurrentView('news-events')
        setNewsEventsTab('events')
        setDetailItemId(null)
      } else if (lower === '#/' || lower === '' || lower === '#top' || lower.startsWith('#find') || lower.startsWith('#how') || lower.startsWith('#news')) {
        setCurrentView('home')
        setDetailItemId(null)
      }
    }

    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [])

  const t = (text: string) => translate(text, language)

  useEffect(() => {
    window.localStorage.setItem('civiclink-language', language)
    document.documentElement.lang = language
    document.title =
      language === 'am'
        ? 'ሲቪክሊንክ ኢትዮጵያ — የዜጎች አገልግሎት'
        : language === 'om'
          ? 'CivicLink Itoophiyaa — Tajaajila Lammiilee'
          : 'CivicLink Ethiopia — Citizen Services, Made Clear'
    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute(
        'content',
        language === 'am'
          ? 'የኢትዮጵያን የህዝብ አገልግሎቶች ለመጠቀም ይዘጋጁ። ሰነዶችን፣ የቢሮ ሂደቶችን፣ የማህበረሰብ ዜናዎችንና የአስተያየት መንገዶችን በአንድ ቦታ ያግኙ።'
          : language === 'om'
            ? 'Daawwanna keessan tajaajila mootummaa Itoophiyaatiif qopheessaa. Sanadoota, adeemsa biiroo, oduu hawaasaa fi karaalee yaada kennuu bakka tokkotti argadhaa.'
            : 'Plan your visit to Ethiopian public services. Find the documents, office steps, community news, and feedback channels you need in one place.'
      )
    }
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
    <div className={`site-shell ${currentView === 'news-events' ? 'site-shell-hub' : currentView === 'detail' ? 'site-shell-detail' : currentView === 'feedback' ? 'site-shell-feedback' : ''}`} lang={language}>
      {currentView !== 'feedback' && (
        <SiteHeader
          currentView={currentView}
          language={language}
          t={t}
          onNavigateToHome={navigateToHome}
          onNavigateToHomeSection={navigateToHomeSection}
          onNavigateToNews={navigateToNews}
          onToggleLanguage={toggleLanguage}
          onSelectLanguage={handleSelectLanguage}
        />
      )}

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
      ) : currentView === 'feedback' ? (
        <QrFeedbackPage
          language={language}
          t={t}
          onNavigateToHome={navigateToHome}
          onSelectLanguage={handleSelectLanguage}
        />
      ) : (
        <HomePage
          language={language}
          t={t}
          cmsConfig={cmsConfig}
          onNavigateToHub={(tab) => {
            setNewsEventsTab(tab || 'all')
            setCurrentView('news-events')
            window.location.hash = '#/' + (tab || 'news-events')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onSelectItem={navigateToDetail}
        />
      )}

      {currentView !== 'feedback' && (
        <SiteFooter
          t={t}
          language={language}
          onNavigateToHomeSection={navigateToHomeSection}
          footerContent={cmsConfig?.footer}
        />
      )}
    </div>
  )
}

export default App

