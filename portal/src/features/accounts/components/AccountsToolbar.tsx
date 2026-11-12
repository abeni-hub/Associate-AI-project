import React from 'react';
import { SearchBox } from '../../shared';
import type { AccountsToolbarProps } from '../types/accounts.types';
import styles from '../styles/accountsToolbar.module.css';

export const AccountsToolbar: React.FC<AccountsToolbarProps> = ({
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.intro}>
        <h2 className={styles.title}>Administrator accounts</h2>
        <p className={styles.description}>
          Role and organization determine what each admin can see and manage.
        </p>
      </div>
      <div className={styles.tools}>
        <SearchBox value={search} onChange={onSearchChange} placeholder="Search accounts" />
        <select
          className={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          aria-label="Filter by admin role"
        >
          <option>All roles</option>
          <option>Super Admin</option>
          <option>Sub-City Admin</option>
          <option>Woreda Admin</option>
          <option>Bureau Admin</option>
          <option>Staff</option>
        </select>
      </div>
    </div>
  );
};

export default AccountsToolbar;

