import React from 'react';
import { SearchBox, Icon, useLanguage, getLocalizedText } from '../../shared';
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
  canManage,
  onAddPoster,
}) => {
  const { language } = useLanguage();
  return (
    <div className={styles.toolbar}>
      <div className={styles.intro}>
        <h2 className={styles.title}>Configured QR posters</h2>
        <p className={styles.description}>
          Physical display tokens and scannable citizen touchpoints across jurisdictions.
        </p>
      </div>

      <div className={styles.tools}>
        <SearchBox
          value={search}
          onChange={onSearchChange}
          placeholder="Search posters or codes..."
        />

        <select
          className={styles.select}
          value={officeFilter}
          onChange={(e) => onOfficeFilterChange(e.target.value)}
          aria-label="Filter by office"
        >
          <option>All offices</option>
          {organizations.map((org) => {
            const orgName = getLocalizedText(org.name, language) || (typeof org.name === 'string' ? org.name : '');
            return (
              <option key={org.id} value={orgName}>
                {orgName}
              </option>
            );
          })}
        </select>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter by status"
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        {canManage && (
          <button
            type="button"
            className={styles.addButton}
            onClick={onAddPoster}
          >
            <Icon name="plus" size={14} />
            <span>Add poster</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QRToolbar;

