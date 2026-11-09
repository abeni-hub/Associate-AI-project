import { useMemo } from 'react'
import Icon from '../ui/Icon.jsx'

export default function QuickSearchSection({
  t,
  subCity,
  onSubCityChange,
  bureauId,
  onBureauChange,
  serviceId,
  onServiceChange,
  searchKeyword = '',
  onSearchKeywordChange,
  selectedCategory = 'all',
  onSelectCategory,
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

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'vital', label: 'Vital Records' },
    { id: 'tax', label: 'Taxes & Revenues' },
    { id: 'business', label: 'Business & Trade' },
    { id: 'land', label: 'Land & Property' },
    { id: 'plan', label: 'Planning & Urban' },
  ]

  // Group services by parent category if available
  const serviceGroups = useMemo(() => {
    if (!activeServiceList || activeServiceList.length === 0) return null

    const hasParent = activeServiceList.some((s) => s.parentName)
    if (!hasParent) return null

    const groups = {}
    activeServiceList.forEach((service) => {
      const groupKey = service.parentName || service.organizationName || 'Other Services'
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(service)
    })
    return groups
  }, [activeServiceList])

  const quickPicks = activeServiceList && activeServiceList.length > 0 ? activeServiceList.slice(0, 5) : []

  function handleResetFilters() {
    if (onSearchKeywordChange) onSearchKeywordChange('')
    if (onSelectCategory) onSelectCategory('all')
  }

  return (
    <section className="quick-search scroll-reveal" id="find-service">
      <div className="quick-search-heading">
        <div className="section-kicker"><span>{kickerNum}</span> {t(kicker)}</div>
        <h2>{t(title)}</h2>
        <p>{t(subtitle)}</p>
      </div>

      <div className="quick-search-body">
        <div className="quick-search-toolbar">
          <div className="quick-search-input-wrap">
            <Icon name="search" size={17} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange && onSearchKeywordChange(e.target.value)}
              placeholder={t('Search services by keyword (e.g. birth, license, tax, land)...')}
              aria-label={t('Search services')}
            />
            {searchKeyword && (
              <button
                type="button"
                className="quick-search-clear"
                onClick={() => onSearchKeywordChange && onSearchKeywordChange('')}
                title={t('Clear search')}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          <div className="category-pills-row" role="tablist" aria-label={t('Filter by category')}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`category-pill ${selectedCategory === cat.id ? 'is-active' : ''}`}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>
        </div>

        <form className="search-form scroll-reveal-group" onSubmit={onSubmit}>
          <label className="select-field">
            <span>{t('Sub-city')}</span>
            <span className="select-wrap">
              <Icon name="pin" size={18} />
              <select value={subCity} onChange={(event) => onSubCityChange(event.target.value)}>
                <option value="all">{t('All Sub-cities')}</option>
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
                <option value="all">{t('All Bureaus / Offices')}</option>
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
            <span>
              {t('Service')}
              {activeServiceList && (
                <small className="service-count-badge"> ({activeServiceList.length})</small>
              )}
            </span>
            <span className="select-wrap">
              <Icon name="file" size={18} />
              <select value={serviceId} onChange={(event) => onServiceChange(event.target.value)}>
                {serviceGroups ? (
                  Object.entries(serviceGroups).map(([groupTitle, services]) => (
                    <optgroup key={groupTitle} label={t(groupTitle)}>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {t(service.label)}
                        </option>
                      ))}
                    </optgroup>
                  ))
                ) : activeServiceList && activeServiceList.length > 0 ? (
                  activeServiceList.map((service) => (
                    <option key={service.id} value={service.id}>
                      {t(service.label)}
                    </option>
                  ))
                ) : isLoading ? (
                  <option value="">{t('Loading services…')}</option>
                ) : (
                  <option value="">{t('No matching services found')}</option>
                )}
              </select>
              <Icon name="chevron" size={16} />
            </span>
          </label>

          <button className="button button-primary search-button" type="submit">
            <Icon name="search" size={18} /> {t(buttonText)}
          </button>
        </form>

        <div className="quick-search-footer">
          <div className="search-footnote">
            <Icon name="sparkle" size={14} />
            <span>{t(footnoteText)}</span>
          </div>

          {(searchKeyword || selectedCategory !== 'all') ? (
            <div className="search-filter-status">
              <span>{activeServiceList?.length ?? 0} {t('services found')}</span>
              <button type="button" onClick={handleResetFilters} className="filter-reset-link">
                {t('Reset filters')}
              </button>
            </div>
          ) : quickPicks.length > 0 ? (
            <div className="quick-service-chips">
              <span className="chips-label">{t('Popular:')}</span>
              {quickPicks.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  className={`service-chip-btn ${srv.id === serviceId ? 'is-selected' : ''}`}
                  onClick={() => onServiceChange(srv.id)}
                >
                  {t(srv.label)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
