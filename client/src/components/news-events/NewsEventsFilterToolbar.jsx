import {
  CalendarDays,
  Globe,
  Newspaper,
  Search,
  X,
} from 'lucide-react'
import { categories, subCities } from './newsEventsOptions.js'

export default function NewsEventsFilterToolbar({
  language,
  activeType,
  setActiveType,
  searchQuery,
  setSearchQuery,
  selectedSubCity,
  setSelectedSubCity,
  selectedCategory,
  setSelectedCategory,
  onReset,
}) {
  const isAm = language === 'am'

  return (
    <div className="nep-toolbar-wrap">
      <div className="nep-toolbar">
        <div className="nep-toolbar-primary">
          <div className="nep-type-tabs" role="tablist">
            <button
              type="button"
              className={`nep-type-btn ${activeType === 'all' ? 'active' : ''}`}
              onClick={() => setActiveType('all')}
            >
              <Globe size={16} />
              <span>{isAm ? 'ሁሉም' : 'All Feeds'}</span>
            </button>
            <button
              type="button"
              className={`nep-type-btn ${activeType === 'news' ? 'active' : ''}`}
              onClick={() => setActiveType('news')}
            >
              <Newspaper size={16} />
              <span>{isAm ? 'ዜና እና ማስታወቂያ' : 'News & Notices'}</span>
            </button>
            <button
              type="button"
              className={`nep-type-btn ${activeType === 'events' ? 'active' : ''}`}
              onClick={() => setActiveType('events')}
            >
              <CalendarDays size={16} />
              <span>{isAm ? 'ዝግጅቶችና መድረኮች' : 'Events & Town Halls'}</span>
            </button>
          </div>

          <div className="nep-search-wrap">
            <Search size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={isAm ? 'በዜና፣ በርዕስ ወይም በቢሮ ይፈልጉ…' : 'Search notices, town halls, bureaus, tags…'}
            />
            {searchQuery && (
              <button
                type="button"
                className="nep-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="nep-toolbar-secondary">
          <span className="nep-filter-label">{isAm ? 'ክፍለ ከተማ፡' : 'Sub-City:'}</span>
          <select
            className="nep-subcity-select"
            value={selectedSubCity}
            onChange={(event) => setSelectedSubCity(event.target.value)}
          >
            {subCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <span className="nep-filter-label" style={{ marginLeft: '8px' }}>
            {isAm ? 'ዘርፍ፡' : 'Category:'}
          </span>
          <div className="nep-category-chips">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`nep-chip ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {isAm ? category.labelAm : category.label}
              </button>
            ))}
          </div>

          {(selectedCategory !== 'all' || selectedSubCity !== 'All Addis Ababa' || searchQuery) && (
            <button type="button" className="nep-reset-btn" onClick={onReset}>
              {isAm ? 'ማጣሪያዎቹን አጽዳ' : 'Reset filters'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
