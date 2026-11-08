import React from 'react';
import Icon from '../ui/Icon.jsx';
import type { DashboardRecentActivityItem } from '../../services/dashboardApi';

interface RecentActivityFeedProps {
  activities?: DashboardRecentActivityItem[];
  isLoading?: boolean;
  onNavigate?: (path: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities = [],
  isLoading,
  onNavigate,
}) => {
  const getActionBadgeClass = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'created':
      case 'registered':
        return 'status-active';
      case 'updated':
      case 'edited':
      case 'modified':
        return 'status-draft';
      case 'deleted':
      case 'deactivated':
        return 'status-inactive';
      default:
        return 'status-draft';
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
    <article className="panel recent-panel activity-feed-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">AUDIT & TRACEABILITY</span>
          <h2>Recent administrative activity</h2>
          <p className="feedback-focus-intro">
            Live administrative actions across your organization hierarchy.
          </p>
        </div>
        {onNavigate && (
          <button className="panel-link" onClick={() => onNavigate('activity')}>
            View full audit logs <Icon name="arrow" size={15} />
          </button>
        )}
      </div>

      <div className="focus-list activity-stream-list">
        {isLoading && (
          <div className="table-empty">
            <div className="loading-spinner" />
            <p>Loading recent administrative activities...</p>
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className="quiet-state">
            <Icon name="check" /> All systems quiet. No recent administrative changes recorded.
          </div>
        )}

        {!isLoading &&
          activities.slice(0, 5).map((act) => (
            <div key={act.id} className="focus-item activity-feed-item">
              <span className="focus-type">
                <Icon name={getEntityIcon(act.entity_type)} size={16} />
              </span>
              <span className="focus-copy">
                <span className="focus-topline">
                  <b>{act.actor?.name || 'Administrator'}</b>
                  <span className={`status-pill ${getActionBadgeClass(act.action)}`}>
                    {act.action}
                  </span>
                  <span className="entity-indicator">
                    {act.entity_type} #{act.entity_id}
                  </span>
                </span>
                <p>
                  {act.actor?.email} in <strong>{act.organization?.name || 'Municipal Unit'}</strong>
                </p>
                <span className="focus-meta">
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
                </span>
              </span>
            </div>
          ))}
      </div>
    </article>
  );
};

export default RecentActivityFeed;
