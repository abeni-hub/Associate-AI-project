import React from 'react';
import { Icon, useLanguage, getLocalizedText } from '../../shared';

export interface ActivityTableProps {
  filteredActivities: any[];
  activities: any[];
  isLoading: boolean;
  hasData: boolean;
  setSelectedEvent: (event: any) => void;
  setSearch: (s: string) => void;
  setCategoryFilter: (c: string) => void;
  setActionTypeFilter: (a: string) => void;
}

const ACTION_TONE_MAP: Record<string, string> = {
  UPDATE: 'amber',
  CREATE: 'green',
  PUBLISH: 'teal',
  SECURITY: 'purple',
  STATUS: 'blue',
  DELETE: 'red',
};

const ACTION_ICON_MAP: Record<string, string> = {
  UPDATE: 'edit',
  CREATE: 'plus',
  PUBLISH: 'checkCircle',
  SECURITY: 'shield',
  STATUS: 'arrow',
  DELETE: 'close',
};

export const ActivityTable: React.FC<ActivityTableProps> = ({
  filteredActivities,
  activities,
  isLoading,
  hasData,
  setSelectedEvent,
  setSearch,
  setCategoryFilter,
  setActionTypeFilter,
}) => {
  const { language } = useLanguage();
  return (
    <div className="panel activity-table-panel">
      <div className="table-scroll">
        <table className="data-table activity-rich-table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>TIME & EVENT ID</th>
              <th style={{ width: 200 }}>USER (ACTOR)</th>
              <th style={{ width: 190 }}>ACTION & HTTP STATUS</th>
              <th style={{ width: 210 }}>RESOURCE / TARGET</th>
              <th>WHAT CHANGED (FROM ➔ TO)</th>
              <th style={{ width: 170 }}>ORIGIN & IP</th>
              <th style={{ width: 90, textAlign: 'right' }}>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && !hasData ? (
              <tr>
                <td colSpan={7}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
                    <div className="loading-spinner" />
                    <p style={{ margin: 0, color: '#00485a', fontWeight: 600, fontSize: '14px' }}>Loading audit records...</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Connecting to administrative audit log</p>
                  </div>
                </td>
              </tr>
            ) : filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <Icon name="activity" size={32} />
                    <b>No matching activity records</b>
                    <p>Try clearing your search term or selecting a different filter.</p>
                    <button
                      type="button"
                      className="button secondary small-button"
                      onClick={() => {
                        setSearch('');
                        setCategoryFilter('all');
                        setActionTypeFilter('all');
                      }}
                    >
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredActivities.map((event) => {
                const tone = ACTION_TONE_MAP[event.actionType] || 'teal';
                const icon = ACTION_ICON_MAP[event.actionType] || 'activity';

                return (
                  <tr
                    key={event.id}
                    className="clickable-row"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Time & Event ID */}
                    <td className="activity-time-cell">
                      <span className="activity-id-badge">{event.id}</span>
                      <b>{event.timestamp}</b>
                    </td>

                    {/* Actor (User) */}
                    <td>
                      <div className="table-person activity-actor-person">
                        <span className={`mini-avatar ${event.actor?.avatar ? 'teal' : 'teal'}`}>
                          {event.actor?.avatar}
                        </span>
                        <div>
                          <b>{getLocalizedText(event.actor?.name, language) || (typeof event.actor?.name === 'string' ? event.actor.name : 'Administrator')}</b>
                          <small>
                            {event.actor?.username} ·{' '}
                            <span className="role-subpill">{getLocalizedText(event.actor?.role, language) || (typeof event.actor?.role === 'string' ? event.actor.role : '')}</span>
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* Action & HTTP Status */}
                    <td>
                      <div className="activity-action-column">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <span className={`activity-action-tag ${tone}`}>
                            <Icon name={icon} size={12} /> {event.actionType}
                          </span>
                          <span className={`http-status-pill ${event.statusTone}`}>
                            {event.statusCode}
                          </span>
                          {event.hasTelemetry && (
                            <span className="telemetry-pill" title="Incoming request & outgoing response payload recorded">
                              <Icon name="file" size={10} /> Req/Res
                            </span>
                          )}
                        </div>
                        <span className="activity-action-title">{event.actionLabel}</span>
                      </div>
                    </td>

                    {/* Resource / Target */}
                    <td>
                      <div className="activity-target-column">
                        <b>{getLocalizedText(event.target?.name, language) || (typeof event.target?.name === 'string' ? event.target.name : '')}</b>
                        <div className="activity-target-meta">
                          <small>{getLocalizedText(event.target?.jurisdiction, language) || (typeof event.target?.jurisdiction === 'string' ? event.target.jurisdiction : '')}</small>
                        </div>
                      </div>
                    </td>

                    {/* What Changed */}
                    <td className="activity-diff-cell">
                      {event.displayDiffs && event.displayDiffs.length > 0 ? (
                        <div className="diff-container">
                          <div className="diff-field-name">
                            <Icon name="edit" size={11} /> {event.displayDiffs[0].field}:
                          </div>
                          <div className="diff-flow">
                            <span className="diff-from" title={`Previous: ${event.displayDiffs[0].from}`}>
                              <span className="diff-state-prefix">FROM:</span> {event.displayDiffs[0].from}
                            </span>
                            <span className="diff-arrow" aria-hidden="true">➔</span>
                            <span className="diff-to" title={`New: ${event.displayDiffs[0].to}`}>
                              <span className="diff-state-prefix">TO:</span> {event.displayDiffs[0].to}
                            </span>
                          </div>
                          {event.displayDiffs.length > 1 && (
                            <span className="diff-more-badge">
                              +{event.displayDiffs.length - 1} more fields modified ({event.displayDiffs.slice(1).map((d: any) => d.field).join(', ')})
                            </span>
                          )}
                          {event.change?.summary && (
                            <p className="diff-summary-note">{event.change.summary}</p>
                          )}
                        </div>
                      ) : event.actionType === 'CREATE' ? (
                        <div className="diff-container">
                          <span className="diff-created-pill">
                            <Icon name="plus" size={12} /> New Record Created
                          </span>
                          <p className="diff-summary-note">{event.change?.summary || 'Instantiated with initial properties'}</p>
                        </div>
                      ) : event.actionType === 'DELETE' ? (
                        <div className="diff-container">
                          <span className="diff-deleted-pill">
                            <Icon name="trash" size={12} /> Record Purged
                          </span>
                          <p className="diff-summary-note">{event.change?.summary || 'Permanently removed from database'}</p>
                        </div>
                      ) : event.actionType === 'SECURITY' ? (
                        <div className="diff-container">
                          <span className="diff-auth-pill">
                            <Icon name="shield" size={12} /> {event.change?.summary || 'Authenticated Session'}
                          </span>
                        </div>
                      ) : (
                        <span className="diff-static-note">
                          {event.change?.summary || 'Standard operation completed.'}
                        </span>
                      )}
                      {event.errorMessage && (
                        <div className="diff-error-pill" title={event.errorMessage} style={{ marginTop: 4 }}>
                          <Icon name="alertTriangle" size={12} /> {event.errorMessage}
                        </div>
                      )}
                    </td>

                    {/* Origin & IP */}
                    <td>
                      <div className="activity-network-column">
                        <code>{event.network?.ip}</code>
                        <small>{event.network?.location}</small>
                        <span className="channel-tag">{event.network?.channel}</span>
                      </div>
                    </td>

                    {/* Details button */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="button secondary small-button inspect-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        title="Inspect full audit record"
                      >
                        <Icon name="eye" size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="table-footer">
        <span>
          Showing <b>{filteredActivities.length}</b> of <b>{activities.length}</b> recorded audit logs
        </span>
        <div className="table-pagination">
          <button type="button" className="button secondary small-button" disabled>
            Previous
          </button>
          <button type="button" className="button secondary small-button" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;

