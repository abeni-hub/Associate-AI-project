import { useMemo, useState } from 'react'
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
  const subtitle = quickSearchContent?.subtitle || 'Search and filter services to view your step-by-step room visit guide.'
  const buttonText = quickSearchContent?.buttonText || 'View Visit Guide'
  const footnoteText = quickSearchContent?.footnoteText || 'Takes less than a minute · No citizen account needed'

  const [showAllResults, setShowAllResults] = useState(false)

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
    if (onSubCityChange) onSubCityChange('all')
    if (onBureauChange) onBureauChange('all')
    setShowAllResults(false)
  }

  function handleSelectCard(selectedId) {
    if (onServiceChange) onServiceChange(selectedId)
    setTimeout(() => {
      const el = document.getElementById('service-guide')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 40)
  }

  // Display limited cards unless expanded or searching
  const displayedCards = useMemo(() => {
    if (!activeServiceList) return []
    if (showAllResults || searchKeyword.trim().length > 0 || activeServiceList.length <= 6) {
      return activeServiceList
    }
    return activeServiceList.slice(0, 6)
  }, [activeServiceList, showAllResults, searchKeyword])

  const hasActiveFilters = Boolean(
    searchKeyword.trim() ||
    selectedCategory !== 'all' ||
    (subCity && subCity !== 'all') ||
    (bureauId && bureauId !== 'all')
  )

  return (
    <section className="quick-search scroll-reveal" id="find-service">
      <div className="quick-search-heading">
        <div className="section-kicker"><span>{kickerNum}</span> {t(kicker)}</div>
        <h2>{t(title)}</h2>
        <p>{t(subtitle)}</p>
      </div>

      <div className="quick-search-body">
        {/* Live Search & Filter Bar */}
        <div className="quick-search-toolbar">
          <div className="quick-search-input-wrap">
            <Icon name="search" size={17} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange && onSearchKeywordChange(e.target.value)}
              placeholder={t('Search services by name or keyword (e.g. birth, license, tax, land lease)...')}
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

          {/* Category Filter Pills */}
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

        {/* Location & Authority Filter Form */}
        <form className="search-form scroll-reveal-group" onSubmit={onSubmit}>
          <label className="select-field">
            <span>{t('Sub-city Location')}</span>
            <span className="select-wrap">
              <Icon name="pin" size={18} />
              <select value={subCity} onChange={(event) => onSubCityChange(event.target.value)}>
                <option value="all">{t('All Sub-cities (Platform-wide)')}</option>
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
            <span>{t('City Office / Bureau')}</span>
            <span className="select-wrap">
              <Icon name="building" size={18} />
              <select value={bureauId} onChange={(event) => onBureauChange(event.target.value)}>
                <option value="all">{t('All Bureaus & Authorities')}</option>
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
              {t('Selected Service')}
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

        {/* Live Filter Results Showcase */}
        {activeServiceList && activeServiceList.length > 0 ? (
          <div className="search-filter-results-container">
            <div className="search-filter-results-header">
              <span className="search-filter-results-title">
                <Icon name="file" size={15} />
                {t('Matching Citizen Services')} ({activeServiceList.length})
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {hasActiveFilters && (
                  <button type="button" onClick={handleResetFilters} className="filter-reset-link" style={{ fontSize: '11px' }}>
                    {t('Reset all filters')}
                  </button>
                )}
                {activeServiceList.length > 6 && !searchKeyword.trim() && (
                  <button
                    type="button"
                    onClick={() => setShowAllResults((prev) => !prev)}
                    className="service-chip-btn"
                    style={{ fontSize: '11px', fontWeight: 600 }}
                  >
                    {showAllResults ? t('Show fewer') : t(`Show all (${activeServiceList.length})`)}
                  </button>
                )}
              </div>
            </div>

            <div className="search-filter-results-grid">
              {displayedCards.map((service) => {
                const isSelected = String(service.id) === String(serviceId)
                const raw = service.raw || {}
                const stepCount = raw.steps?.length || raw.steps_count || 0
                const feeText = raw.fee_amount && Number(raw.fee_amount) > 0
                  ? `${raw.fee_amount} ${raw.fee_currency || 'ETB'}`
                  : 'Free'
                const durationText = raw.estimated_duration_minutes
                  ? `${raw.estimated_duration_minutes} min`
                  : null

                return (
                  <button
                    key={service.id}
                    type="button"
                    className={`search-filter-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleSelectCard(service.id)}
                  >
                    <div className="search-filter-card-category">
                      <span>{service.parentName || service.organizationName || 'Citizen Service'}</span>
                      {isSelected && (
                        <span className="search-filter-active-pill">
                          ✓ {t('Selected')}
                        </span>
                      )}
                    </div>

                    <h4 className="search-filter-card-title">{service.label}</h4>

                    <div className="search-filter-card-meta">
                      {durationText && (
                        <span className="search-filter-badge">
                          <Icon name="clock" size={11} /> {durationText}
                        </span>
                      )}
                      <span className="search-filter-badge fee">
                        {feeText}
                      </span>
                      {stepCount > 0 ? (
                        <span className="search-filter-badge route">
                          <Icon name="route" size={11} /> {stepCount} {stepCount === 1 ? 'room step' : 'room steps'}
                        </span>
                      ) : (
                        <span className="search-filter-badge">
                          <Icon name="pin" size={11} /> {service.organizationName || 'City Office'}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              background: '#f8faf7',
              borderRadius: '6px',
              border: '1px dashed #d5ded6',
              marginTop: '12px',
            }}
          >
            <Icon name="search" size={24} />
            <h4 style={{ margin: '8px 0 4px', fontSize: '13px', color: '#274438' }}>
              {t('No services found matching your search filter')}
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '11.5px', color: '#7a8e83' }}>
              {t('Try adjusting your search keywords, switching categories, or clearing location filters.')}
            </p>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleResetFilters}
              style={{ fontSize: '11px', padding: '4px 12px', height: '32px' }}
            >
              {t('Reset all filters')}
            </button>
          </div>
        )}

        {/* Footer info & popular quick picks */}
        <div className="quick-search-footer">
          <div className="search-footnote">
            <Icon name="sparkle" size={14} />
            <span>{t(footnoteText)}</span>
          </div>

          {!hasActiveFilters && quickPicks.length > 0 && (
            <div className="quick-service-chips">
              <span className="chips-label">{t('Quick Picks:')}</span>
              {quickPicks.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  className={`service-chip-btn ${srv.id === serviceId ? 'is-selected' : ''}`}
                  onClick={() => handleSelectCard(srv.id)}
                >
                  {t(srv.label)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
