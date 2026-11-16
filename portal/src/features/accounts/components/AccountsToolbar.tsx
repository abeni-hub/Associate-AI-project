import React from 'react';
import { SearchBox } from '../../shared';
import type { AccountsToolbarProps } from '../types/accounts.types';
import styles from '../styles/accountsToolbar.module.css';

export const AccountsToolbar: React.FC<AccountsToolbarProps> = ({
  search,
  roleFilter,
  roleOptions = [],
  onSearchChange,
  onRoleFilterChange,
}) => {
  const options = roleOptions.length > 0 ? roleOptions : ['All roles', 'Super Admin', 'Sub-City Admin', 'Woreda Admin', 'Bureau Admin', 'Staff'];

  return (
    <>
      <SearchBox value={search} onChange={onSearchChange} placeholder="Search accounts" />
      <select
        className="filter-select"
        value={roleFilter === 'All' ? 'All roles' : roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value === 'All roles' ? 'All' : e.target.value)}
        aria-label="Filter by admin role"
      >
        {options.map((option) => (
          <option key={option} value={option === 'All roles' ? 'All roles' : option}>
            {option === 'All roles' ? 'All roles' : option}
          </option>
        ))}
      </select>
    </>
  );
};

export default AccountsToolbar;

