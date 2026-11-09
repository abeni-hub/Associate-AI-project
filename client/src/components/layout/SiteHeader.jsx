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
  onSelectLanguage,
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

        <div className="language-selector" role="group" aria-label={t('Select language')}>
          <button
            type="button"
            className={`lang-btn ${language === 'en' ? 'is-active' : ''}`}
            onClick={() => (onSelectLanguage ? onSelectLanguage('en') : onToggleLanguage())}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            className={`lang-btn ${language === 'am' ? 'is-active' : ''}`}
            onClick={() => (onSelectLanguage ? onSelectLanguage('am') : onToggleLanguage())}
            title="አማርኛ"
          >
            አማ
          </button>
          <button
            type="button"
            className={`lang-btn ${language === 'om' ? 'is-active' : ''}`}
            onClick={() => (onSelectLanguage ? onSelectLanguage('om') : onToggleLanguage())}
            title="Afaan Oromoo"
          >
            ORO
          </button>
        </div>

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
