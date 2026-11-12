import React from 'react';
import { Icon } from '../../shared';
import type { DashboardQuickActionsProps } from '../types/dashboard.types';
import styles from '../styles/quickActions.module.css';

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  items,
  onNavigate,
  onCreate,
}) => {
  return (
    <article className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>MOVE THINGS FORWARD</span>
          <h2 className={styles.title}>Quick actions</h2>
        </div>
      </div>

      <div className={styles.actionList}>
        {items.map((action) => (
          <button
            key={action.text}
            className={styles.actionButton}
            onClick={() => {
              onNavigate(action.page);
              if (
                onCreate &&
                (action.page === 'subcities' ||
                  action.page === 'bureaus' ||
                  action.page === 'services' ||
                  action.page === 'routes' ||
                  action.page === 'offices')
              ) {
                onCreate(action.page);
              }
            }}
            type="button"
          >
            <span className={styles.actionIcon}>
              <Icon name={action.icon} size={17} />
            </span>
            <b className={styles.actionText}>{action.text}</b>
            <span className={styles.arrowIcon}>
              <Icon name="arrow" size={15} />
            </span>
          </button>
        ))}
      </div>

      <div className={styles.quickFoot}>
        <span className={styles.onlineIndicator} /> All systems operational
        <span className={styles.footMeta}>Updated moments ago</span>
      </div>
    </article>
  );
};

export default DashboardQuickActions;

