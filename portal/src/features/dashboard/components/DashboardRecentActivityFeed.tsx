import React from 'react';
import Icon from '../ui/Icon.jsx';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import type { DashboardRecentActivityItem } from '../../services/dashboardApi';

export const DashboardRecentActivityFeed: React.FC<DashboardRecentActivityFeedProps> = ({
  activities = [],
  isLoading,
  onNavigate,
}) => {
  const { language, t } = useLanguage();
  const getActionBadgeClass = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'created':
      case 'registered':
        return styles.statusActive;
      case 'updated':
      case 'edited':
      case 'modified':
        return styles.statusDraft;
      case 'deleted':
      case 'deactivated':
        return styles.statusInactive;
      default:
        return styles.statusDraft;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'user':
        return 'users';
      case 'organization':
        return 'building';
      case 'service':
        return 'layers';
      case 'document':
        return 'file';
      case 'feedback':
      case 'complaint':
        return 'message';
      default:
        return 'activity';
    }
  };

  const formatActivityTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <article className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>AUDIT & TRACEABILITY</span>
          <h2 className={styles.title}>Recent administrative activity</h2>
          <p className={styles.intro}>Live administrative actions across your organization hierarchy.</p>
        </div>
        {onNavigate && (
          <button className="panel-link" onClick={() => onNavigate('activity')}>
            {t('overview.fullAuditLog', 'Full audit log')} <Icon name="arrow" size={15} />
          </button>
        )}
      </div>

      <div className={styles.activityList}>
        {isLoading && (
          <div className={styles.loadingState}>
            <div className="loading-spinner" />
            <p>Loading recent administrative activities...</p>
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className={styles.quietState}>
            <Icon name="check" /> All systems quiet. No recent administrative changes recorded.
          </div>
        )}

        {!isLoading &&
          activities.slice(0, 5).map((act) => (
            <div key={act.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>
                <Icon name={getEntityIcon(act.entity_type)} size={16} />
              </span>
              <div className={styles.activityCopy}>
                <div className={styles.activityTopline}>
                  <b>{act.actor?.name || 'Administrator'}</b>
                  <span className={`${styles.statusPill} ${getActionClass(act.action)}`}>
                    {act.action}
                  </span>
                  <span className={styles.entityIndicator}>
                    {act.entity_type} #{act.entity_id}
                  </span>
                </div>
                <p>
                  {act.actor?.email} in <strong>{getLocalizedText(act.organization?.name as any, language) || (typeof act.organization?.name === 'string' ? act.organization?.name : 'Municipal Unit')}</strong>
                </p>
                <div className={styles.activityMeta}>
                  <span>
                    <Icon name="building" size={13} /> {act.organization?.code || 'admin'}
                  </span>
                  <span>
                    <Icon name="clock" size={13} /> {formatActivityTime(act.created_at)}
                  </span>
                  {act.ip_address && (
                    <span>
                      <Icon name="shield" size={13} /> {act.ip_address}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </article>
  );
};

export default DashboardRecentActivityFeed;

