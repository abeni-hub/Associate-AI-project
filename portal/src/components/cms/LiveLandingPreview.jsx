import Icon from '../ui/Icon.jsx'
import BrandMark from '../ui/BrandMark.jsx'
import ClientLandingPageFrame from './ClientLandingPageFrame.jsx'

function LiveLandingPreview({ config, previewDevice = 'desktop', onToggleDevice }) {
  const isMobile = previewDevice === 'mobile'

  return (
    <div className="cms-preview-card">
      <div className="cms-preview-toolbar">
        <div className="preview-label">
          <span className="live-dot" />
          <span>CITIZEN APP LIVE PREVIEW</span>
        </div>

        <div className="preview-url-bar">
          <Icon name="lock" size={12} />
          <span>https://civiclink.et</span>
        </div>

        <div className="device-switcher">
          <button
            type="button"
            className={`device-btn${!isMobile ? ' active' : ''}`}
            onClick={() => onToggleDevice('desktop')}
            aria-label="Desktop view"
          >
            <Icon name="desktop" size={15} /> Desktop
          </button>
          <button
            type="button"
            className={`device-btn${isMobile ? ' active' : ''}`}
            onClick={() => onToggleDevice('mobile')}
            aria-label="Mobile view"
          >
            <Icon name="mobile" size={15} /> Mobile
          </button>
        </div>
      </div>

      <div className={`preview-viewport-wrapper${isMobile ? ' mobile-viewport' : ''}`}>
        <div className={`preview-device-frame ${isMobile ? 'phone-frame' : 'browser-frame'}`}>
          {!isMobile && (
            <div className="browser-header-strip">
              <div className="browser-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="browser-title-tab">
                <BrandMark size={14} />
                <span>CivicLink Ethiopia — Citizen Services</span>
              </div>
            </div>
          )}

          {isMobile && (
            <div className="phone-notch-bar">
                <span className="phone-time">9:41</span>
              <div className="phone-notch" />
              <div className="phone-signals">
                <span className="signal-bars">●●●</span>
                <span className="battery-icon">100%</span>
              </div>
            </div>
          )}

          <div className="preview-viewport">
            <ClientLandingPageFrame cmsConfig={config} isMobile={isMobile} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveLandingPreview
