import React from 'react';
import { Icon } from '../Icon';
import type { SearchBoxProps } from './SearchBox.types';
import styles from './SearchBox.module.css';

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  ariaLabel,
}) => {
  return (
    <label className={`${styles.root} ${disabled ? styles.disabled : ''} ${className}`.trim()}>
      <span className={styles.icon}>
        <Icon name="search" size={17} />
      </span>
      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
      />
      {value && !disabled && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => onChange('')}
          aria-label="Clear search query"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </label>
  );
};

export default SearchBox;

