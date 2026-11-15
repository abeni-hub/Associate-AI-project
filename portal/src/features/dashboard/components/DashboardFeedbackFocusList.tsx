import React from 'react';
import { Icon, TypePill } from '../../shared';
import { useLanguage, getLocalizedText } from '../../shared/i18n';
import type { DashboardFeedbackFocusListProps } from '../types/dashboard.types';
import styles from '../styles/feedbackFocusList.module.css';

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
          <button className={styles.panelLink} onClick={() => onNavigate('feedback')} type="button">
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

          const displayMessage = getLocalizedText((item as any).message_localized, language) || item.message || 'No submission details provided.';
          const displayBureau = getLocalizedText((item as any).bureau_localized, language) || item.bureau || 'General Bureau';

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
                  <TypePill type={displayType}>{displayType}</TypePill>
                </span>
                <p>{displayMessage}</p>
                <span className={styles.focusMeta}>
                  <span>
                    <Icon name="building" size={13} />
                    {displayBureau}
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
