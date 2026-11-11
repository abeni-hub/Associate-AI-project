import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import CmsLandingPreviewPage from '../../../../client/src/components/CmsLandingPreviewPage'
import clientAppStyles from '../../../../client/src/App.css?inline'
import clientIndexStyles from '../../../../client/src/index.css?inline'
import clientNewsStyles from '../../../../client/src/styles/newsEvents.css?inline'

const DESKTOP_VIEWPORT_WIDTH = 1024
const DESKTOP_VIEWPORT_HEIGHT = 880
const MOBILE_VIEWPORT_HEIGHT = 780

function addStylesheet(documentNode, css) {
  const style = documentNode.createElement('style')
  style.textContent = typeof css === 'string' ? css : (css && typeof css === 'object' && 'default' in css ? css.default : String(css || ''))
  documentNode.head.appendChild(style)
}

function initializeFrameDocument(iframe) {
  const frameDocument = iframe?.contentDocument
  if (!frameDocument) return null

  frameDocument.open()
  frameDocument.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>CivicLink Ethiopia — Citizen Services</title></head><body style="margin:0;padding:0;"><div id="client-landing-preview-root"></div></body></html>')
  frameDocument.close()

  const preconnect = frameDocument.createElement('link')
  preconnect.rel = 'preconnect'
  preconnect.href = 'https://fonts.googleapis.com'
  frameDocument.head.appendChild(preconnect)

  const fontPreconnect = frameDocument.createElement('link')
  fontPreconnect.rel = 'preconnect'
  fontPreconnect.href = 'https://fonts.gstatic.com'
  fontPreconnect.crossOrigin = 'anonymous'
  frameDocument.head.appendChild(fontPreconnect)

  const fonts = frameDocument.createElement('link')
  fonts.rel = 'stylesheet'
  fonts.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..900;1,9..40,300..900&family=Manrope:wght@400..800&family=Noto+Sans+Ethiopic:wght@400;500;600;700;800&display=swap'
  frameDocument.head.appendChild(fonts)

  // Match the stylesheet order used by client/src/main.jsx and client/src/App.jsx.
  addStylesheet(frameDocument, clientIndexStyles)
  addStylesheet(frameDocument, clientAppStyles)
  addStylesheet(frameDocument, clientNewsStyles)

  return frameDocument
}

export default function ClientLandingPageFrame({ cmsConfig, isMobile, previewLanguage }) {
  const iframeRef = useRef(null)
  const stageRef = useRef(null)
  const rootRef = useRef(null)
  const [stageWidth, setStageWidth] = useState(0)

  const renderPreview = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    let frameDoc = iframe.contentDocument
    if (!frameDoc) return

    let mountPoint = frameDoc.getElementById('client-landing-preview-root')
    if (!mountPoint) {
      frameDoc = initializeFrameDocument(iframe)
      mountPoint = frameDoc?.getElementById('client-landing-preview-root')
    }

    if (!mountPoint) return

    if (!rootRef.current) {
      rootRef.current = createRoot(mountPoint)
    }

    rootRef.current.render(
      <CmsLandingPreviewPage
        cmsConfig={cmsConfig}
        documentRef={frameDoc}
        previewLanguage={previewLanguage}
      />
    )
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const measureStage = () => setStageWidth(stage.clientWidth)
    measureStage()
    const observer = new ResizeObserver(measureStage)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    renderPreview()
  }, [cmsConfig, previewLanguage])

  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount()
        rootRef.current = null
      }
    }
  }, [])

  const scale = isMobile || !stageWidth ? 1 : Math.min(1, stageWidth / DESKTOP_VIEWPORT_WIDTH)
  const frameStyle = isMobile
    ? { width: '100%', height: `${MOBILE_VIEWPORT_HEIGHT}px` }
    : {
        width: `${DESKTOP_VIEWPORT_WIDTH}px`,
        height: `${DESKTOP_VIEWPORT_HEIGHT}px`,
        transform: `scale(${scale})`,
      }
  const stageStyle = isMobile ? { height: `${MOBILE_VIEWPORT_HEIGHT}px` } : { height: `${DESKTOP_VIEWPORT_HEIGHT * scale}px` }

  return (
    <div className={`client-frame-stage${isMobile ? ' is-mobile' : ' is-desktop'}`} ref={stageRef} style={stageStyle}>
      <iframe
        ref={iframeRef}
        onLoad={renderPreview}
        className="client-landing-frame"
        title={isMobile ? 'Client landing page mobile preview' : 'Client landing page desktop preview'}
        style={frameStyle}
        scrolling="yes"
      />
    </div>
  )
}
