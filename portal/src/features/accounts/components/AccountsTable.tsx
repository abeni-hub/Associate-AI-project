import React from 'react';
import { StatusPill } from '../../shared';
import type { AccountsTableProps } from '../types/accounts.types';
import styles from '../styles/accountsTable.module.css';

export const AccountsTable: React.FC<AccountsTableProps> = ({
  items,
  canUpdate,
  canDelete,
  isSuperAdmin,
  canManageScope,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ACCOUNT</th>
            <th>ROLE</th>
            <th>ORGANIZATION</th>
            <th>STATUS</th>
            <th>LAST ACTIVE</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const targetScope =
              item.roleScope ||
              (item.role?.toLowerCase().includes('super') ? 'global' : 'sub_city');
            const canManageThisAccount = isSuperAdmin || canManageScope(targetScope);

            const initials = (item.name || 'User')
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .join('');

            return (
              <tr key={item.id}>
                <td>
                  <span className={styles.personCell}>
                    <span className={styles.avatar}>{initials}</span>
                    <span className={styles.personInfo}>
                      <b>{item.name}</b>
                      <small>@{item.username}</small>
                    </span>
                  </span>
                </td>
                <td>
                  <span className={styles.roleBadge}>{item.role}</span>
                </td>
                <td>{item.organization}</td>
                <td>
                  <StatusPill>{item.status}</StatusPill>
                </td>
                <td>{item.lastActive}</td>
                <td>
                  <div className={styles.actionCell}>
                    {canUpdate && canManageThisAccount && (
                      <button
                        className={`button secondary ${styles.editButton}`}
                        onClick={() => onEdit(item)}
                        type="button"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && canManageThisAccount && (
                      <button
                        className={`button secondary ${styles.deleteButton}`}
                        onClick={() => onDelete(item)}
                        title="Delete account"
                        type="button"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AccountsTable;

