import React, { useState, useRef, useEffect, useId } from 'react';
import { Icon } from './Icon';

export interface SearchSelectOption {
  value: string | number;
  label: string;
  code?: string;
  badge?: string;
  badgeTone?: 'teal' | 'gold' | 'sage' | 'blue' | 'gray';
  secondary?: string;
  disabled?: boolean;
}

export interface SearchSelectProps {
  label?: string;
  required?: boolean;
  value: string | number | null;
  onChange: (value: string | number | null, option?: SearchSelectOption) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  helperText?: string;
  emptyMessage?: string;
  allowClear?: boolean;
}

export const SearchSelect: React.FC<SearchSelectProps> = ({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search by name, code, or ID...',
  disabled = false,
  helperText,
  emptyMessage = 'No matching options found',
  allowClear = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Find currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchLabel = opt.label.toLowerCase().includes(term);
    const matchCode = opt.code ? opt.code.toLowerCase().includes(term) : false;
    const matchSecondary = opt.secondary ? opt.secondary.toLowerCase().includes(term) : false;
    const matchValue = String(opt.value).toLowerCase().includes(term);
    return matchLabel || matchCode || matchSecondary || matchValue;
  });

  // Handle outside click to close dropdown menu only
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (option: SearchSelectOption) => {
    if (option.disabled) return;
    onChange(option.value, option);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`search-select-container${disabled ? ' is-disabled' : ''}${isOpen ? ' is-open' : ''}`}
      onKeyDown={handleKeyDown}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', position: 'relative' }}
    >
      {label && (
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {label}
          {required && <i style={{ color: '#dc2626', fontStyle: 'normal' }}>*</i>}
        </span>
      )}

      {/* Select Trigger Box */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '6px',
          border: isOpen ? '1.5px solid #164a54' : '1px solid #cbd5e1',
          background: disabled ? '#f8fafc' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '40px',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(22, 74, 84, 0.1)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {selectedOption ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {selectedOption.badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background:
                      selectedOption.badgeTone === 'sage'
                        ? '#ecfdf5'
                        : selectedOption.badgeTone === 'gold'
                          ? '#fef3c7'
                          : selectedOption.badgeTone === 'blue'
                            ? '#e0f2fe'
                            : '#f1f5f9',
                    color:
                      selectedOption.badgeTone === 'sage'
                        ? '#047857'
                        : selectedOption.badgeTone === 'gold'
                          ? '#b45309'
                          : selectedOption.badgeTone === 'blue'
                            ? '#0369a1'
                            : '#334155',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedOption.badge}
                </span>
              )}
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {selectedOption.label}
              </span>
              {selectedOption.code && (
                <code style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '1px 5px', borderRadius: '3px' }}>
                  {selectedOption.code}
                </code>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '13.5px', color: '#94a3b8' }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
          {allowClear && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '50%',
              }}
              title="Clear selection"
            >
              <Icon name="close" size={13} />
            </button>
          )}
          <span style={{ color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
            <Icon name="chevron" size={14} />
          </span>
        </div>
      </div>

      {/* Dropdown Floating Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Search Header */}
          <div
            style={{
              padding: '8px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: '#94a3b8' }}>
              <Icon name="search" size={14} />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder={searchPlaceholder}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '12.5px',
                color: '#0f172a',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>

          {/* Options Scrollable List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = highlightedIndex === index;

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '5px',
                      background: isSelected ? '#eef5f1' : isHighlighted ? '#f8fafc' : 'transparent',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      opacity: opt.disabled ? 0.6 : 1,
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background:
                                opt.badgeTone === 'sage'
                                  ? '#ecfdf5'
                                  : opt.badgeTone === 'gold'
                                    ? '#fef3c7'
                                    : opt.badgeTone === 'blue'
                                      ? '#e0f2fe'
                                      : '#f1f5f9',
                              color:
                                opt.badgeTone === 'sage'
                                  ? '#047857'
                                  : opt.badgeTone === 'gold'
                                    ? '#b45309'
                                    : opt.badgeTone === 'blue'
                                      ? '#0369a1'
                                      : '#334155',
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#164a54' : '#0f172a',
                          }}
                        >
                          {opt.label}
                        </span>
                        {opt.code && (
                          <code style={{ fontSize: '10.5px', color: '#64748b', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>
                            {opt.code}
                          </code>
                        )}
                      </div>
                      {opt.secondary && (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{opt.secondary}</span>
                      )}
                    </div>

                    {isSelected && (
                      <span style={{ color: '#164a54', marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
                        <Icon name="check" size={15} />
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px' }}>
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {helperText && (
        <small style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.3 }}>
          {helperText}
        </small>
      )}
    </div>
  );
};

export default SearchSelect;
