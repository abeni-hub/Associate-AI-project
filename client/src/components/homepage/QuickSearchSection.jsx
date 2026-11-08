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
  quickSearchContent,
  isLoading = false,
}) {
  const kickerNum = quickSearchContent?.kickerNum || '01'
  const kicker = quickSearchContent?.kicker || 'START HERE'
  const title = quickSearchContent?.title || 'What do you need help with?'
  const subtitle = quickSearchContent?.subtitle || 'Choose a location and service to see your visit guide.'
  const buttonText = quickSearchContent?.buttonText || 'Show my guide'
  const footnoteText = quickSearchContent?.footnoteText || 'Takes less than a minute · No account needed'

  return (
    <section className="quick-search scroll-reveal" id="find-service">
      <div className="quick-search-heading">
        <div className="section-kicker"><span>{kickerNum}</span> {t(kicker)}</div>
        <h2>{t(title)}</h2>
        <p>{t(subtitle)}</p>
      </div>
      <form className="search-form scroll-reveal-group" onSubmit={onSubmit}>
        <label className="select-field">
          <span>{t('Sub-city')}</span>
          <span className="select-wrap">
            <Icon name="pin" size={18} />
            <select value={subCity} onChange={(event) => onSubCityChange(event.target.value)}>
              {subCityOptions && subCityOptions.length > 0 ? (
                subCityOptions.map((name) => <option key={name} value={name}>{t(name)}</option>)
              ) : isLoading ? (
                <option value="">{t('Loading sub-cities…')}</option>
              ) : (
                <option value="">{t('Select a sub-city')}</option>
              )}
            </select>
            <Icon name="chevron" size={16} />
          </span>
        </label>
        <label className="select-field">
          <span>{t('City office / bureau')}</span>
          <span className="select-wrap">
            <Icon name="building" size={18} />
            <select value={bureauId} onChange={(event) => onBureauChange(event.target.value)}>
              {bureauOptions && bureauOptions.length > 0 ? (
                bureauOptions.map((bureau) => <option key={bureau.id} value={bureau.id}>{t(bureau.label)}</option>)
              ) : isLoading ? (
                <option value="">{t('Loading offices…')}</option>
              ) : (
                <option value="">{t('Select an office')}</option>
              )}
            </select>
            <Icon name="chevron" size={16} />
          </span>
        </label>
        <label className="select-field">
          <span>{t('Service')}</span>
          <span className="select-wrap">
            <Icon name="file" size={18} />
            <select value={serviceId} onChange={(event) => onServiceChange(event.target.value)}>
              {activeServiceList && activeServiceList.length > 0 ? (
                activeServiceList.map((service) => <option key={service.id} value={service.id}>{t(service.label)}</option>)
              ) : isLoading ? (
                <option value="">{t('Loading services…')}</option>
              ) : (
                <option value="">{t('Select a service')}</option>
              )}
            </select>
            <Icon name="chevron" size={16} />
          </span>
        </label>
        <button className="button button-primary search-button" type="submit"><Icon name="search" size={18} /> {t(buttonText)}</button>
      </form>
      <div className="search-footnote"><Icon name="sparkle" size={15} /> {t(footnoteText)}</div>
    </section>
  )
}
