import React, { useState, useEffect, useRef, useMemo } from 'react'
import Icon from './Icon.jsx'

/**
 * SearchableSelect - An accessible, searchable combobox dropdown.
 * Supports simple lists, object items, grouped items, and fast instant keyword search.
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  groups = null,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  icon = 'pin',
  allOption = null, // e.g. { value: 'all', label: 'All Sub-cities' }
  disabled = false,
  isLoading = false,
  ariaLabel = 'Select option',
  t = (s) => s,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 30)
    }
  }, [isOpen])

  // Close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }

  // Normalize options into a consistent array of { value, label, subtext, group, raw }
  const normalizedOptions = useMemo(() => {
    if (groups && typeof groups === 'object') {
      const items = []
      Object.entries(groups).forEach(([groupName, groupItems]) => {
        if (Array.isArray(groupItems)) {
          groupItems.forEach((item) => {
            items.push({
              value: String(item.id ?? item.value ?? item),
              label: String(item.label ?? item.name ?? item),
              subtext: item.subtext ?? item.organizationName ?? item.parentName ?? '',
              group: groupName,
              raw: item,
            })
          })
        }
      })
      return items
    }

    if (Array.isArray(options)) {
      return options.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return {
            value: String(item.id ?? item.value ?? ''),
            label: String(item.label ?? item.name ?? ''),
            subtext: item.shortLabel ?? item.subtext ?? item.code ?? '',
            group: item.group ?? null,
            raw: item,
          }
        }
        return {
          value: String(item),
          label: String(item),
          subtext: '',
          group: null,
          raw: item,
        }
      })
    }

    return []
  }, [options, groups])

  // Filter options based on typed searchTerm
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return normalizedOptions
    }
    const q = searchTerm.trim().toLowerCase()
    return normalizedOptions.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(q)
      const subtextMatch = opt.subtext && opt.subtext.toLowerCase().includes(q)
      const groupMatch = opt.group && opt.group.toLowerCase().includes(q)
      const valueMatch = opt.value && opt.value.toLowerCase().includes(q)
      return labelMatch || subtextMatch || groupMatch || valueMatch
    })
  }, [normalizedOptions, searchTerm])

  // Group filtered options if grouping is active
  const groupedFilteredOptions = useMemo(() => {
    if (!groups) return null

    const map = {}
    filteredOptions.forEach((opt) => {
      const g = opt.group || 'Other'
      if (!map[g]) map[g] = []
      map[g].push(opt)
    })
    return map
  }, [filteredOptions, groups])

  // Current display label
  const currentSelectedLabel = useMemo(() => {
    if (allOption && String(value) === String(allOption.value)) {
      return t(allOption.label)
    }
    const match = normalizedOptions.find((opt) => String(opt.value) === String(value))
    if (match) {
      return t(match.label)
    }
    return ''
  }, [value, normalizedOptions, allOption, t])

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (allOption) {
      onChange(allOption.value)
    } else {
      onChange('')
    }
  }

  const hasSelection = Boolean(
    value !== undefined &&
    value !== '' &&
    (!allOption || String(value) !== String(allOption.value))
  )

  return (
    <div
      className="searchable-select-container"
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`searchable-select-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="searchable-select-icon">
          <Icon name={icon} size={18} />
        </span>

        <span className="searchable-select-value">
          {isLoading ? (
            <span className="searchable-select-placeholder">{t('Loading…')}</span>
          ) : currentSelectedLabel ? (
            currentSelectedLabel
          ) : (
            <span className="searchable-select-placeholder">{t(placeholder)}</span>
          )}
        </span>

        {hasSelection && (
          <span
            className="searchable-select-clear-btn"
            onClick={handleClear}
            title={t('Clear filter')}
            role="button"
            tabIndex={0}
          >
            <Icon name="close" size={12} />
          </span>
        )}

        <span className={`searchable-select-chevron ${isOpen ? 'is-open' : ''}`}>
          <Icon name="chevron" size={16} />
        </span>
      </button>

      {/* Dropdown Floating Panel */}
      {isOpen && (
        <div className="searchable-select-dropdown" role="listbox">
          {/* Live Search Input Box */}
          <div className="searchable-select-search-box" onClick={(e) => e.stopPropagation()}>
            <Icon name="search" size={15} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t(searchPlaceholder)}
              aria-label={t(searchPlaceholder)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (allOption && !searchTerm.trim()) {
                    handleSelect(allOption.value)
                  } else if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0].value)
                  }
                }
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="searchable-select-clear-btn"
                onClick={() => setSearchTerm('')}
                title={t('Clear search query')}
              >
                <Icon name="close" size={11} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="searchable-select-options-list">
            {/* "All" Option at top if not searching or if search matches */}
            {allOption && (!searchTerm.trim() || allOption.label.toLowerCase().includes(searchTerm.toLowerCase())) && (
              <div
                className={`searchable-select-option ${String(value) === String(allOption.value) ? 'is-selected' : ''}`}
                onClick={() => handleSelect(allOption.value)}
                role="option"
                aria-selected={String(value) === String(allOption.value)}
              >
                <div className="searchable-select-option-copy">
                  <b>{t(allOption.label)}</b>
                </div>
                {String(value) === String(allOption.value) && (
                  <Icon name="check" size={15} />
                )}
              </div>
            )}

            {/* Grouped Options */}
            {groupedFilteredOptions ? (
              Object.entries(groupedFilteredOptions).map(([groupName, items]) => (
                <div key={groupName}>
                  <div className="searchable-select-group-header">
                    {t(groupName)}
                  </div>
                  {items.map((opt) => {
                    const isSelected = String(value) === String(opt.value)
                    const raw = opt.raw || {}
                    const stepCount = raw.steps?.length || raw.steps_count || 0
                    const fee = raw.fee_amount ? `${raw.fee_amount} ${raw.fee_currency || 'ETB'}` : null

                    return (
                      <div
                        key={opt.value}
                        className={`searchable-select-option ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleSelect(opt.value)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="searchable-select-option-copy">
                          <b>{t(opt.label)}</b>
                          {opt.subtext && <small>{t(opt.subtext)}</small>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {stepCount > 0 && (
                            <span className="search-filter-badge route" style={{ fontSize: '9px', padding: '1px 5px' }}>
                              {stepCount} {stepCount === 1 ? 'step' : 'steps'}
                            </span>
                          )}
                          {fee && (
                            <span className="search-filter-badge fee" style={{ fontSize: '9px', padding: '1px 5px' }}>
                              {fee}
                            </span>
                          )}
                          {isSelected && <Icon name="check" size={15} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(value) === String(opt.value)
                const raw = opt.raw || {}
                const stepCount = raw.steps?.length || raw.steps_count || 0
                const fee = raw.fee_amount ? `${raw.fee_amount} ${raw.fee_currency || 'ETB'}` : null

                return (
                  <div
                    key={opt.value}
                    className={`searchable-select-option ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="searchable-select-option-copy">
                      <b>{t(opt.label)}</b>
                      {opt.subtext && <small>{t(opt.subtext)}</small>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {stepCount > 0 && (
                        <span className="search-filter-badge route" style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {stepCount} {stepCount === 1 ? 'step' : 'steps'}
                        </span>
                      )}
                      {fee && (
                        <span className="search-filter-badge fee" style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {fee}
                        </span>
                      )}
                      {isSelected && <Icon name="check" size={15} />}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="searchable-select-empty">
                {t('No matches found for')} &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
