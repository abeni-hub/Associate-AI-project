import React from 'react';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import type { FeedbackItem } from '../../types/portal.types';
import { Icon } from './Icon';
import { StatusPill } from './StatusPill';
import { TypePill } from './TypePill';

export interface FeedbackTableProps {
  items: FeedbackItem[];
  onOpen: (item: FeedbackItem) => void;
  compact?: boolean;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  items,
  onOpen,
  compact = false,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="table-scroll">
      <table className="data-table feedback-table">
        <thead>
          <tr>
            <th>{t('feedback.tableCitizenMsg', 'Feedback')}</th>
            <th>{t('feedback.tableServiceBureau', 'Service & office')}</th>
            <th>{t('feedback.tableSubmitted', 'Received')}</th>
            <th>{t('feedback.tableStatus', 'Status')}</th>
            <th aria-label={t('common.actions', 'Actions')} />
          </tr>
        </thead>
        <tbody>
          {items.slice(0, compact ? 4 : undefined).map((item) => {
            const rawStatus = String(item.status || '').toLowerCase();
            const statusText =
              rawStatus === 'open'
                ? t('feedback.open', 'Open')
                : rawStatus === 'in review' || rawStatus === 'in_review' || rawStatus === 'under_review'
                  ? t('feedback.inReview', 'In review')
                  : rawStatus === 'resolved'
                    ? t('feedback.resolved', 'Resolved')
                    : rawStatus === 'closed'
                      ? t('feedback.closed', 'Closed')
                      : item.status;

            return (
              <tr key={item.id} onClick={() => onOpen(item)} className="clickable-row">
                <td>
                  <div className="feedback-id">
                    <b>{item.id}</b>
                    <TypePill type={item.type} />
                  </div>
                  <p>{getLocalizedText(item.message as any, language) || (typeof item.message === 'string' ? item.message : '')}</p>
                </td>
                <td>
                  <b>{getLocalizedText(item.service as any, language) || (typeof item.service === 'string' ? item.service : '')}</b>
                  <small>
                    {getLocalizedText(item.bureau as any, language) || (typeof item.bureau === 'string' ? item.bureau : '')} · {getLocalizedText(item.subcity as any, language) || (typeof item.subcity === 'string' ? item.subcity : '')}
                  </small>
                </td>
                <td className="time-cell">{item.time}</td>
                <td>
                  <StatusPill>{statusText}</StatusPill>
                </td>
                <td>
                  <button
                    className="row-more"
                    aria-label={`Open ${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(item);
                    }}
                  >
                    <Icon name="arrow" size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="message" size={22} />
          </span>
          <b>{t('feedback.emptyNotice', 'No feedback found')}</b>
          <p>{t('feedback.adjustFilter', 'Try changing your filters or search terms.')}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackTable;
