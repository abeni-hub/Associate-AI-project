import Icon from '../ui/Icon.jsx'

export default function ServiceGuideSection({ t, serviceGuide, guideService, guideBureau }) {
  return (
    <section className="service-guide-section section-wrap" id="service-guide">
      <div className="section-intro service-intro scroll-reveal">
        <div>
          <div className="section-kicker"><span>02</span> {t('YOUR VISIT GUIDE')}</div>
          <h2>{t('A clearer path,')}<br /><em>{t('step by step.')}</em></h2>
        </div>
        <p>{t('Know what to bring and which room to visit, before you set off. The sample guide below shows how service details will appear.')}</p>
      </div>
      <article className="guide-card scroll-reveal">
        <div className="guide-card-top">
          <div>
            <div className="guide-location"><Icon name="pin" size={15} /> {t(serviceGuide.subCity)} {t('Sub-city')} <span>·</span> {guideBureau && t(guideBureau.shortLabel)}</div>
            <h3>{guideService && t(guideService.label)}</h3>
            <p>{guideService && t(guideService.summary)}</p>
          </div>
          <div className="sample-badge"><span /> {t('SAMPLE GUIDE')}</div>
        </div>
        <div className="guide-content-grid scroll-reveal-group">
          <div className="documents-panel">
            <div className="panel-title">
              <span className="panel-icon green-icon"><Icon name="file" size={18} /></span>
              <div><span className="panel-overline">{t('BEFORE YOU LEAVE')}</span><h4>{t('What to bring')}</h4></div>
            </div>
            <ul className="document-list">
              {guideService?.documents.map((document) => <li key={document}><Icon name="check" size={15} />{t(document)}</li>)}
            </ul>
            <div className="expectations-note"><Icon name="shield" size={16} /><span>{t('Bring original documents where available. Ask the bureau if requirements have changed.')}</span></div>
          </div>
          <div className="route-panel">
            <div className="panel-title">
              <span className="panel-icon yellow-icon"><Icon name="route" size={18} /></span>
              <div><span className="panel-overline">{t('ONCE YOU ARRIVE')}</span><h4>{t(guideService?.routeHeading ?? 'Your room-by-room route')}</h4></div>
            </div>
            <ol className="room-route">
              {guideService?.steps.map((step, index) => (
                <li key={`${step.room}-${step.title}`}>
                  <span className="route-number">0{index + 1}</span>
                  <span className="route-track"><i /></span>
                  <span className="room-pill">{t(step.routeLabel ?? 'Room')} {step.routeLabel ? '' : step.room}</span>
                  <span className="route-description"><b>{t(step.title)}</b><small>{t(step.detail)}</small></span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="guide-card-bottom">
          <span><Icon name="clock" size={16} /> {t(guideService?.visitNote ?? 'Service information can change. Confirm with your bureau if you are unsure.')}</span>
          <a href="#feedback">{t('Something out of date? Let us know')} <Icon name="arrow" size={15} /></a>
        </div>
      </article>
      <p className="sample-disclaimer scroll-reveal">{t('Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.')}</p>
    </section>
  )
}
