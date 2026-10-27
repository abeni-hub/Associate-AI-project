import { useState } from 'react'
import { translate } from '../i18n/translations.js'
import AnnouncementBar from './layout/AnnouncementBar.jsx'
import SiteFooter from './layout/SiteFooter.jsx'
import SiteHeader from './layout/SiteHeader.jsx'
import HomePage from '../pages/HomePage.jsx'

export default function CmsLandingPreviewPage({ cmsConfig, documentRef }) {
  const [language, setLanguage] = useState('en')
  const t = (text) => translate(text, language)
  const pageDocument = documentRef || document

  function scrollToSection(sectionId) {
    const targetId = sectionId || 'top'
    pageDocument.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function navigateToHome() {
    pageDocument.defaultView?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigateToNews() {
    scrollToSection('news')
  }

  return (
    <div className="site-shell" lang={language}>
      <AnnouncementBar
        t={t}
        announcement={cmsConfig?.announcement}
        onNavigateToHomeSection={scrollToSection}
      />
      <SiteHeader
        currentView="home"
        language={language}
        t={t}
        onNavigateToHome={navigateToHome}
        onNavigateToHomeSection={scrollToSection}
        onNavigateToNews={navigateToNews}
        onToggleLanguage={() => setLanguage((current) => current === 'en' ? 'am' : 'en')}
      />
      <HomePage
        language={language}
        t={t}
        cmsConfig={cmsConfig}
        documentRef={pageDocument}
        onNavigateToHub={navigateToNews}
        onSelectItem={navigateToNews}
      />
      <SiteFooter t={t} onNavigateToHomeSection={scrollToSection} />
    </div>
  )
}
