import Icon from '../ui/Icon.jsx'

export default function ServiceGuideSection({ t, serviceGuide, guideService, guideBureau, serviceGuideContent }) {
  if (serviceGuideContent?.enabled === false) return null

  const kickerNum = serviceGuideContent?.kickerNum || '02'
  const kicker = serviceGuideContent?.kicker || 'YOUR VISIT GUIDE'
  const titleLead = serviceGuideContent?.titleLead || 'A clearer path,'
  const titleEmphasis = serviceGuideContent?.titleEmphasis || 'step by step.'
  const description = serviceGuideContent?.description || 'Know what to bring and which room to visit, before you set off.'
  const sampleBadgeText = serviceGuideContent?.sampleBadgeText || (guideService ? 'OFFICIAL GUIDE' : 'SERVICE GUIDE')
  const whatToBringTitle = serviceGuideContent?.whatToBringTitle || 'What to bring'
  const expectationsNote = serviceGuideContent?.expectationsNote || 'Bring original documents where available. Ask the bureau if requirements have changed.'
  const defaultRouteHeading = serviceGuideContent?.routeHeading || 'Your room-by-room route'
  const disclaimerText = serviceGuideContent?.disclaimerText || 'Official public service delivery guide published and maintained by the Addis Ababa City Administration.'

  return (
    <section className="service-guide-section section-wrap" id="service-guide">
      <div className="section-intro service-intro scroll-reveal">
        <div>
          <div className="section-kicker"><span>{kickerNum}</span> {t(kicker)}</div>
          <h2>{t(titleLead)}<br /><em>{t(titleEmphasis)}</em></h2>
        </div>
        <p>{t(description)}</p>
      </div>
      <article className="guide-card scroll-reveal">
        <div className="guide-card-top">
          <div>
            <div className="guide-location"><Icon name="pin" size={15} /> {serviceGuide?.subCity ? t(serviceGuide.subCity) : t('Addis Ababa')} {serviceGuide?.subCity ? t('Sub-city') : ''} <span>·</span> {guideBureau ? t(guideBureau.shortLabel || guideBureau.label) : t('Public Desk')}</div>
            <h3>{guideService ? t(guideService.label) : t('Select a service to view guide')}</h3>
            <p>{guideService ? t(guideService.summary) : t('Use the search above to pick an office and service.')}</p>
          </div>
          <div className="sample-badge"><span /> {t(sampleBadgeText)}</div>
        </div>
        <div className="guide-content-grid scroll-reveal-group">
          <div className="documents-panel">
            <div className="panel-title">
              <span className="panel-icon green-icon"><Icon name="file" size={18} /></span>
              <div><span className="panel-overline">{t('BEFORE YOU LEAVE')}</span><h4>{t(whatToBringTitle)}</h4></div>
            </div>
            {guideService?.documents && guideService.documents.length > 0 ? (
              <ul className="document-list">
                {guideService.documents.map((document) => <li key={document}><Icon name="check" size={15} />{t(document)}</li>)}
              </ul>
            ) : (
              <div style={{ padding: '16px 0', color: '#6d8388', fontSize: '11px' }}>
                <p>{t('No prerequisite documents registered for this service.')}</p>
              </div>
            )}
            <div className="expectations-note"><Icon name="shield" size={16} /><span>{t(expectationsNote)}</span></div>
          </div>
          <div className="route-panel">
            <div className="panel-title">
              <span className="panel-icon yellow-icon"><Icon name="route" size={18} /></span>
              <div><span className="panel-overline">{t('ONCE YOU ARRIVE')}</span><h4>{t(guideService?.routeHeading ?? defaultRouteHeading)}</h4></div>
            </div>
            {guideService?.steps && guideService.steps.length > 0 ? (
              <ol className="room-route">
                {guideService.steps.map((step, index) => (
                  <li key={`${step.room}-${step.title}-${index}`}>
                    <span className="route-number">0{index + 1}</span>
                    <span className="route-track"><i /></span>
                    <span className="room-pill">{t(step.routeLabel ?? 'Room')} {step.routeLabel ? '' : step.room}</span>
                    <span className="route-description"><b>{t(step.title)}</b><small>{t(step.detail)}</small></span>
                  </li>
                ))}
              </ol>
            ) : (
              <div style={{ padding: '16px 0', color: '#6d8388', fontSize: '11px' }}>
                <p>{t('Room navigation steps are being updated by the bureau desk.')}</p>
              </div>
            )}
          </div>
        </div>
        <div className="guide-card-bottom">
          <span><Icon name="clock" size={16} /> {t(guideService?.visitNote ?? 'Service information can change. Confirm with your bureau if you are unsure.')}</span>
          <a href="#feedback">{t('Something out of date? Let us know')} <Icon name="arrow" size={15} /></a>
        </div>
      </article>
      <p className="sample-disclaimer scroll-reveal">{t(disclaimerText)}</p>
    </section>
  )
}
