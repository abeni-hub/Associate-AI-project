import React from 'react';
import Icon from '../ui/Icon.jsx';
import TypePill from '../ui/TypePill.jsx';
import type { FeedbackItem } from '../../types/portal.types';

export interface FeedbackFocusListProps {
  items?: FeedbackItem[];
  onFeedback?: (item: FeedbackItem) => void;
  onNavigate?: (path: string) => void;
}

export const FeedbackFocusList: React.FC<FeedbackFocusListProps> = ({
  items = [],
  onFeedback,
  onNavigate,
}) => {
  return (
    <article className="panel recent-panel feedback-focus-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">TEAM INBOX</span>
          <h2>Feedback needing attention</h2>
          <p className="feedback-focus-intro">Open citizen inquiries & complaints prioritized for review.</p>
        </div>
        {onNavigate && (
          <button className="panel-link" onClick={() => onNavigate('feedback')}>
            View feedback inbox <Icon name="arrow" size={15} />
          </button>
        )}
      </div>
      <div className="focus-list">
        {items.map((item) => {
          const rawType = (item.type || 'Feedback').toLowerCase();
          const isComplaint = rawType === 'complaint';
          const isSatisfaction = rawType === 'satisfaction';
          const displayType = isComplaint ? 'Complaint' : isSatisfaction ? 'Satisfaction' : 'Feedback';
          const priority = item.priority || (isComplaint ? 'High' : 'Normal');

          return (
            <button
              key={item.id}
              className="focus-item"
              onClick={() => onFeedback && onFeedback(item)}
              aria-label={`Open ${item.id}, ${displayType}, ${priority} priority`}
            >
              <span className={`focus-type ${rawType}`}>
                <Icon
                  name={isComplaint ? 'alertTriangle' : isSatisfaction ? 'spark' : 'message'}
                  size={15}
                />
              </span>
              <span className="focus-copy">
                <span className="focus-topline">
                  <b>{item.id}</b>
                  <TypePill type={displayType} />
                </span>
                <p>{item.message || 'No submission details provided.'}</p>
                <span className="focus-meta">
                  <span>
                    <Icon name="building" size={13} />
                    {item.bureau || 'General Bureau'}
                  </span>
                  <span>
                    <Icon name="clock" size={13} />
                    {item.time || 'Recently'}
                  </span>
                </span>
              </span>
              <span className={`priority-tag ${priority.toLowerCase()}`}>
                {priority}
              </span>
            </button>
          );
        })}
        {items.length === 0 && (
          <div className="quiet-state">
            <Icon name="check" /> You’re all caught up. No pending high-priority feedback.
          </div>
        )}
      </div>
    </article>
  );
};

export default FeedbackFocusList;
