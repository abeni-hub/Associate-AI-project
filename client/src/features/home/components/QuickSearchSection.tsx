import { useMemo, useState, type FormEvent } from 'react'
import { Icon, SearchableSelect } from '../../shared'
import '../styles/quickSearch.css'

export interface QuickSearchSectionProps {
  t: (key: string) => string
  language?: string
  subCity?: string
  onSubCityChange: (val: string) => void
  bureauId?: string
  onBureauChange: (val: string) => void
  serviceId?: string
  onServiceChange: (val: string) => void
  searchKeyword?: string
  onSearchKeywordChange?: (val: string) => void
  selectedCategory?: string
  onSelectCategory?: (val: string) => void
  activeServiceList?: any[]
  onSubmit?: (e: FormEvent) => void
  subCityOptions?: any[]
  bureauOptions?: any[]
  bureauGroups?: any
  quickSearchContent?: any
  isLoading?: boolean
}

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
  bureauOptions = [],
  bureauGroups = null,
  quickSearchContent,
  isLoading = false,
}: QuickSearchSectionProps) {
  const kickerNum = quickSearchContent?.kickerNum || '01'
  const kicker = quickSearchContent?.kicker || 'START HERE'
  const title = quickSearchContent?.title || 'What do you need help with?'
  const subtitle = quickSearchContent?.subtitle || 'Search and filter services to view your step-by-step room visit guide.'
  const buttonText = quickSearchContent?.buttonText || 'View Visit Guide'
  const footnoteText = quickSearchContent?.footnoteText || 'Takes less than a minute · No citizen account needed'

  // Group services by parent category if available
  const serviceGroups = useMemo(() => {
    if (!activeServiceList || activeServiceList.length === 0) return null

    const hasParent = activeServiceList.some((s) => s.parentName)
    if (!hasParent) return null

    const groups: Record<string, any[]> = {}
    activeServiceList.forEach((service) => {
      const groupKey = service.parentName || service.organizationName || 'Other Services'
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(service)
    })
    return groups
  }, [activeServiceList])

  function handleResetFilters() {
    if (onSearchKeywordChange) onSearchKeywordChange('')
    if (onSelectCategory) onSelectCategory('all')
    if (onSubCityChange) onSubCityChange('all')
    if (onBureauChange) onBureauChange('all')
  }

  function handleSelectCard(selectedId: string) {
    if (onServiceChange) onServiceChange(selectedId)
    setTimeout(() => {
      const el = document.getElementById('service-guide')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 40)
  }

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
        {/* Location & Authority Searchable Filter Form */}
        <form className="search-form scroll-reveal-group" onSubmit={onSubmit}>
          <div className="select-field">
            <span>{t('Sub-city Location')}</span>
            <SearchableSelect
              value={subCity || 'all'}
              onChange={(val: string) => onSubCityChange(val)}
              options={subCityOptions}
              allOption={{ value: 'all', label: 'All Sub-cities (Platform-wide)' }}
              icon="pin"
              placeholder="Choose a sub-city..."
              searchPlaceholder="Search sub-cities (e.g. Bole, Kirkos, Arada)..."
              isLoading={isLoading}
              ariaLabel={t('Sub-city Location')}
              t={t}
            />
          </div>

          <div className="select-field">
            <span>{t('City Office / Bureau')}</span>
            <SearchableSelect
              value={bureauId || 'all'}
              onChange={(val: string) => onBureauChange(val)}
              groups={bureauGroups}
              options={bureauOptions.map((b: any) => ({
                id: String(b.id),
                label: b.label,
                subtext: b.shortLabel || b.code || '',
              }))}
              allOption={{ value: 'all', label: 'All Bureaus & Authorities' }}
              icon="building"
              placeholder="Choose an office..."
              searchPlaceholder="Search offices (e.g. Revenues, Trade, Land)..."
              isLoading={isLoading}
              ariaLabel={t('City Office / Bureau')}
              t={t}
            />
          </div>

          <div className="select-field">
            <span>
              {t('Selected Service')}
              {activeServiceList && (
                <small className="service-count-badge"> ({activeServiceList.length})</small>
              )}
            </span>
            <SearchableSelect
              value={serviceId || ''}
              onChange={(val: string) => onServiceChange(val)}
              groups={serviceGroups}
              options={
                !serviceGroups && activeServiceList
                  ? activeServiceList.map((s) => ({
                      id: String(s.id),
                      label: s.label,
                      subtext: s.parentName || s.organizationName || '',
                      raw: s.raw,
                    }))
                  : []
              }
              icon="file"
              placeholder="Choose a service..."
              searchPlaceholder="Search services (e.g. Birth, License, Tax, Deed)..."
              isLoading={isLoading}
              ariaLabel={t('Selected Service')}
              t={t}
            />
          </div>

          <button className="button button-primary search-button" type="submit">
            <Icon name="search" size={18} /> {t(buttonText)}
          </button>
        </form>

        {/* Streamlined Live Match Bar & Fast Service Chips */}
        {activeServiceList && activeServiceList.length > 0 ? (
          <div className="quick-search-match-bar">
            <div className="match-bar-info">
              <span className="match-count-pill">
                <Icon name="check" size={13} />
                <b>{activeServiceList.length}</b> {t(activeServiceList.length === 1 ? 'service available' : 'services available')}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="filter-reset-link"
                >
                  <Icon name="close" size={12} /> {t('Clear filters')}
                </button>
              )}
            </div>

            {/* Quick Select Chips */}
            <div className="quick-service-chips-row" role="tablist" aria-label={t('Matching services')}>
              <span className="chips-label">{hasActiveFilters ? t('Matching:') : t('Quick Picks:')}</span>
              <div className="chips-scroll-wrap">
                {activeServiceList.slice(0, 7).map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    className={`service-chip-btn ${srv.id === serviceId ? 'is-selected' : ''}`}
                    onClick={() => handleSelectCard(srv.id)}
                    title={srv.parentName ? `${srv.parentName} › ${srv.label}` : srv.label}
                  >
                    {srv.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="quick-search-empty-state">
            <Icon name="search" size={20} />
            <div className="empty-state-copy">
              <h4>{t('No matching services found')}</h4>
              <p>{t('Try clearing your search keyword or switching office location filters.')}</p>
            </div>
            <button
              type="button"
              className="button button-secondary small-button"
              onClick={handleResetFilters}
              style={{ padding: '4px 12px', fontSize: '11px', height: '32px' }}
            >
              {t('Reset filters')}
            </button>
          </div>
        )}

        {/* Footer info footnote */}
        <div className="quick-search-footer">
          <div className="search-footnote">
            <span>{t(footnoteText)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

