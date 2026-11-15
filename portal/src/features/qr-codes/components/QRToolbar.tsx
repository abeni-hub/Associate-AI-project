import React from 'react';
import { QrCode, RotateCcw, Search, X } from 'lucide-react';
import type { QRToolbarProps } from '../types/qrCodes.types';
import styles from '../styles/qrToolbar.module.css';

export const QRToolbar: React.FC<QRToolbarProps> = ({
  search,
  onSearchChange,
  officeFilter,
  onOfficeFilterChange,
  statusFilter,
  onStatusFilterChange,
  organizations,
}) => {
  const hasActiveFilters = Boolean(
    search.trim() ||
    (officeFilter && officeFilter !== 'All offices') ||
    (statusFilter && statusFilter !== 'All statuses')
  );

  const handleResetFilters = () => {
    onSearchChange('');
    onOfficeFilterChange('All offices');
    onStatusFilterChange('All statuses');
  };

  return (
    <div className={styles.toolbar}>
      {/* 1. Header with Brand Icon */}
      <div className={styles.intro}>
        <div className={styles.titleRow}>
          <div className={styles.titleIconBadge}>
            <QrCode size={18} strokeWidth={2.2} />
          </div>
          <h2 className={styles.title}>Configured QR posters</h2>
        </div>
      </div>

      {/* 2. Interactive Tools, Filter Controls & Primary Action */}
      <div className={styles.tools}>
        <div className={styles.searchBar}>
          <Search size={15} strokeWidth={2.2} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search posters or codes..."
            aria-label="Search posters or codes"
          />
          {search && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={officeFilter}
            onChange={(e) => onOfficeFilterChange(e.target.value)}
            aria-label="Filter by office"
          >
            <option value="All offices">All offices</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All statuses">All statuses</option>
            <option value="Active">Active only</option>
            <option value="Inactive">Inactive only</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetFilters}
            title="Reset active filters"
          >
            <RotateCcw size={13} strokeWidth={2.2} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QRToolbar;
