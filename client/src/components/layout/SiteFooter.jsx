import BrandMark from '../ui/BrandMark.jsx'

export default function SiteFooter({ t, onNavigateToHomeSection }) {
  function handleSectionNavigation(event, sectionId) {
    event.preventDefault()
    onNavigateToHomeSection(sectionId)
  }

  return (
    <footer className="site-footer">
      <div className="footer-main section-wrap scroll-reveal-group">
        <a className="brand footer-brand" href="#top">
          <BrandMark />
          <span className="brand-copy"><strong>Civic<span>Link</span></strong><small>{t('ETHIOPIA · CITIZEN SERVICES')}</small></span>
        </a>
        <p>{t('Clearer information for every visit.')}<br />{t('A more responsive public service.')}</p>
        <div className="footer-nav">
          <a href="#find-service" onClick={(event) => handleSectionNavigation(event, 'find-service')}>{t('Find a service')}</a>
          <a href="#how-it-works" onClick={(event) => handleSectionNavigation(event, 'how-it-works')}>{t('How it works')}</a>
          <a href="#news" onClick={(event) => handleSectionNavigation(event, 'news')}>{t('News & events')}</a>
          <a href="#feedback" onClick={(event) => handleSectionNavigation(event, 'feedback')}>{t('Share feedback')}</a>
        </div>
      </div>
      <div className="footer-bottom section-wrap scroll-reveal">
        <span>{t('© 2026 CivicLink Ethiopia · Public service information platform')}</span>
        <span>{t('Built for citizens, maintained by bureaus.')}</span>
      </div>
    </footer>
  )
}
