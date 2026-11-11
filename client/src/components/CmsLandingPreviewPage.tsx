import { Component, type ReactNode, useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import store from '../store/index.js'
import { translate } from '../i18n/translations.js'
import AnnouncementBar from './layout/AnnouncementBar.jsx'
import SiteFooter from './layout/SiteFooter.jsx'
import SiteHeader from './layout/SiteHeader.jsx'
import HomePage from '../pages/HomePage'
import type { LandingPageCmsConfig, Language } from '../types/newsEvents'

interface CmsLandingPreviewPageProps {
  cmsConfig?: LandingPageCmsConfig | null;
  documentRef?: Document;
  previewLanguage?: Language;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('CMS Preview rendering error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#b91c1c', background: '#fef2f2', borderRadius: '8px', margin: '2rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Preview Rendering Error</h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#7f1d1d' }}>
            {this.state.error?.message || 'An error occurred while rendering the preview.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ padding: '0.5rem 1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry Preview
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function PreviewContent({ cmsConfig, documentRef, previewLanguage }: CmsLandingPreviewPageProps) {
  const [language, setLanguage] = useState<Language>(previewLanguage || 'en')

  useEffect(() => {
    if (previewLanguage) setLanguage(previewLanguage)
  }, [previewLanguage])

  const t = (text: string) => translate(text, language)
  const pageDocument = documentRef || document

  function scrollToSection(sectionId: string) {
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
        language={language}
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
      <SiteFooter
        t={t}
        language={language}
        footerContent={cmsConfig?.footer}
        onNavigateToHomeSection={scrollToSection}
      />
    </div>
  )
}

export default function CmsLandingPreviewPage(props: CmsLandingPreviewPageProps) {
  return (
    <Provider store={store}>
      <PreviewErrorBoundary>
        <PreviewContent {...props} />
      </PreviewErrorBoundary>
    </Provider>
  )
}
