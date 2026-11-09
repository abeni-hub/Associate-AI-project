import BrandMark from '../ui/BrandMark.jsx'

export default function SiteFooter({ t, onNavigateToHomeSection, footerContent, language }) {
  function handleSectionNavigation(event, sectionId) {
    event.preventDefault()
    onNavigateToHomeSection(sectionId)
  }

  const brandTagline = (language === 'am' && footerContent?.brandTaglineAm) || footerContent?.brandTagline || 'Clearer information for every visit.'
  const description = (language === 'am' && footerContent?.descriptionAm) || footerContent?.description || 'A more responsive public service.'
  const copyright = (language === 'am' && footerContent?.copyrightAm) || footerContent?.copyright || '© 2026 CivicLink Ethiopia · Public service information platform'
  const bottomNote = (language === 'am' && footerContent?.bottomNoteAm) || footerContent?.bottomNote || 'Built for citizens, maintained by bureaus.'

  return (
    <footer className="site-footer">
      <div className="footer-main section-wrap scroll-reveal-group">
        <a className="brand footer-brand" href="#top">
          <BrandMark />
          <span className="brand-copy"><strong>Civic<span>Link</span></strong><small>{t('ETHIOPIA · CITIZEN SERVICES')}</small></span>
        </a>
        <p>{t(brandTagline)}<br />{t(description)}</p>
        <div className="footer-nav">
          <a href="#find-service" onClick={(event) => handleSectionNavigation(event, 'find-service')}>{t('Find a service')}</a>
          <a href="#how-it-works" onClick={(event) => handleSectionNavigation(event, 'how-it-works')}>{t('How it works')}</a>
          <a href="#news" onClick={(event) => handleSectionNavigation(event, 'news')}>{t('News & events')}</a>
          <a href="#feedback" onClick={(event) => handleSectionNavigation(event, 'feedback')}>{t('Share feedback')}</a>
        </div>
      </div>
      <div className="footer-bottom section-wrap scroll-reveal">
        <span>{t(copyright)}</span>
        <span>{t(bottomNote)}</span>
      </div>
    </footer>
  )
}
