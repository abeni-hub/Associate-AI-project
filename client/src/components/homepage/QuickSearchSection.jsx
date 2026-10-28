import Icon from '../ui/Icon.jsx'

export default function QuickSearchSection({
  t,
  subCity,
  onSubCityChange,
  bureauId,
  onBureauChange,
  serviceId,
  onServiceChange,
  activeServiceList,
  onSubmit,
  subCityOptions,
  bureauOptions,
}) {
  return (
    <section className="quick-search scroll-reveal" id="find-service">
      <div className="quick-search-heading">
        <div className="section-kicker"><span>01</span> {t('START HERE')}</div>
        <h2>{t('What do you need help with?')}</h2>
        <p>{t('Choose a location and service to see your visit guide.')}</p>
      </div>
      <form className="search-form scroll-reveal-group" onSubmit={onSubmit}>
        <label className="select-field">
          <span>{t('Sub-city')}</span>
          <span className="select-wrap">
            <Icon name="pin" size={18} />
            <select value={subCity} onChange={(event) => onSubCityChange(event.target.value)}>
              {subCityOptions.map((name) => <option key={name} value={name}>{t(name)}</option>)}
            </select>
            <Icon name="chevron" size={16} />
          </span>
        </label>
        <label className="select-field">
          <span>{t('City office / bureau')}</span>
          <span className="select-wrap">
            <Icon name="building" size={18} />
            <select value={bureauId} onChange={(event) => onBureauChange(event.target.value)}>
              {bureauOptions.map((bureau) => <option key={bureau.id} value={bureau.id}>{t(bureau.label)}</option>)}
            </select>
            <Icon name="chevron" size={16} />
          </span>
        </label>
        <label className="select-field">
          <span>{t('Service')}</span>
          <span className="select-wrap">
            <Icon name="file" size={18} />
            <select value={serviceId} onChange={(event) => onServiceChange(event.target.value)}>
              {activeServiceList.map((service) => <option key={service.id} value={service.id}>{t(service.label)}</option>)}
            </select>
            <Icon name="chevron" size={16} />
          </span>
        </label>
        <button className="button button-primary search-button" type="submit"><Icon name="search" size={18} /> {t('Show my guide')}</button>
      </form>
      <div className="search-footnote"><Icon name="sparkle" size={15} /> {t('Takes less than a minute')} <span>·</span> {t('No account needed')}</div>
    </section>
  )
}
