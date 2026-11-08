import { useState } from 'react'
import BrandMark from '../ui/BrandMark.jsx'
import Icon from '../ui/Icon.jsx'

export default function SiteHeader({
  currentView,
  language,
  t,
  onNavigateToHome,
  onNavigateToHomeSection,
  onNavigateToNews,
  onToggleLanguage,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={`site-header ${currentView === 'detail' ? 'site-header-solid' : ''}`}>
      <a
        className="brand"
        href="#top"
        aria-label={t('CivicLink home')}
        onClick={(event) => {
          event.preventDefault()
          setMenuOpen(false)
          onNavigateToHome()
        }}
      >
        <BrandMark />
        <span className="brand-copy"><strong>Civic<span>Link</span></strong><small>{t('ETHIOPIA · CITIZEN SERVICES')}</small></span>
      </a>

      <button
        className="mobile-menu-button"
        type="button"
        aria-label={t(menuOpen ? 'Close navigation' : 'Open navigation')}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
      </button>

      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label={t('Main navigation')}>
        <a
          href="#find-service"
          onClick={(event) => {
            setMenuOpen(false)
            if (currentView !== 'home') {
              event.preventDefault()
              onNavigateToHomeSection('find-service')
            }
          }}
        >
          {t('Find a service')}
        </a>

        <a
          href="#how-it-works"
          onClick={(event) => {
            setMenuOpen(false)
            if (currentView !== 'home') {
              event.preventDefault()
              onNavigateToHomeSection('how-it-works')
            }
          }}
        >
          {t('How it works')}
        </a>

        <a
          href="#/news-events"
          className={currentView === 'news-events' || currentView === 'detail' ? 'is-current' : undefined}
          onClick={(event) => {
            event.preventDefault()
            setMenuOpen(false)
            onNavigateToNews()
          }}
        >
          {t('News & events')}
        </a>

        <button
          className="language-toggle"
          type="button"
          aria-label={t(language === 'en' ? 'Switch language to Amharic' : 'Switch language to English')}
          onClick={onToggleLanguage}
        >
          <span lang={language === 'en' ? 'am' : 'en'}>{language === 'en' ? 'አማርኛ' : 'English'}</span>
        </button>

        <button
          className="nav-feedback"
          type="button"
          onClick={() => {
            setMenuOpen(false)
            onNavigateToHomeSection('feedback')
          }}
        >
          {t('Share feedback')} <Icon name="arrow" size={16} />
        </button>
      </nav>
    </header>
  )
}
