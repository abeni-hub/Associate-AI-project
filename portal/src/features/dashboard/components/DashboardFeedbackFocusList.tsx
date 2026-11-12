import React from 'react';
import Icon from '../ui/Icon.jsx';
import TypePill from '../ui/TypePill.jsx';
import { useLanguage } from '../../i18n/i18nContext';
import { getLocalizedText } from '../../i18n/utils/getLocalized';
import type { FeedbackItem } from '../../types/portal.types';

export const DashboardFeedbackFocusList: React.FC<DashboardFeedbackFocusListProps> = ({
  items = [],
  onFeedback,
  onNavigate,
}) => {
  const { language, t } = useLanguage();
  return (
    <article className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>TEAM INBOX</span>
          <h2 className={styles.title}>Feedback needing attention</h2>
          <p className={styles.intro}>Open citizen inquiries & complaints prioritized for review.</p>
        </div>
        {onNavigate && (
          <button className="panel-link" onClick={() => onNavigate('feedback')}>
            {t('overview.viewFeedbackInbox', 'View feedback inbox')} <Icon name="arrow" size={15} />
          </button>
        )}
      </div>

      <div className={styles.focusList}>
        {items.map((item) => {
          const rawType = (item.type || 'Feedback').toLowerCase();
          const isComplaint = rawType === 'complaint';
          const isSatisfaction = rawType === 'satisfaction';
          const displayType = isComplaint ? 'Complaint' : isSatisfaction ? 'Satisfaction' : 'Feedback';
          const priority = item.priority || (isComplaint ? 'High' : 'Normal');

          const typeClass = isComplaint
            ? styles.focusTypeComplaint
            : isSatisfaction
              ? styles.focusTypeSatisfaction
              : styles.focusTypeSuggestion;

          const priorityClass =
            priority.toLowerCase() === 'high'
              ? styles.priorityHigh
              : priority.toLowerCase() === 'low'
                ? styles.priorityLow
                : '';

          return (
            <button
              key={item.id}
              className={styles.focusItem}
              onClick={() => onFeedback && onFeedback(item)}
              aria-label={`Open ${item.id}, ${displayType}, ${priority} priority`}
              type="button"
            >
              <span className={`${styles.focusType} ${typeClass}`}>
                <Icon
                  name={isComplaint ? 'alertTriangle' : isSatisfaction ? 'heart' : 'message'}
                  size={15}
                />
              </span>
              <span className={styles.focusCopy}>
                <span className={styles.focusTopline}>
                  <b>{item.id}</b>
                  <TypePill type={displayType} />
                </span>
                <p>{getLocalizedText(item.message as any, language) || (typeof item.message === 'string' ? item.message : '') || 'No submission details provided.'}</p>
                <span className="focus-meta">
                  <span>
                    <Icon name="building" size={13} />
                    {getLocalizedText(item.bureau as any, language) || (typeof item.bureau === 'string' ? item.bureau : 'General Bureau')}
                  </span>
                  <span>
                    <Icon name="clock" size={13} />
                    {item.time || 'Recently'}
                  </span>
                </span>
              </span>
              <span className={`${styles.priorityTag} ${priorityClass}`}>{priority}</span>
            </button>
          );
        })}
        {items.length === 0 && (
          <div className={styles.quietState}>
            <Icon name="check" /> You’re all caught up. No pending high-priority feedback.
          </div>
        )}
      </div>
    </article>
  );
};

export default DashboardFeedbackFocusList;

