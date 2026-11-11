import React from 'react';
import Icon from '../ui/Icon.jsx';

export interface QuickActionItem {
  text: string;
  icon: string;
  page: string;
}

export interface QuickActionsProps {
  items: QuickActionItem[];
  onNavigate: (path: string) => void;
  onCreate?: (targetPage?: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ items, onNavigate, onCreate }) => {
  return (
    <article className="panel quick-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">MOVE THINGS FORWARD</span>
          <h2>Quick actions</h2>
        </div>
      </div>
      <div className="quick-action-list">
        {items.map((action) => (
          <button
            key={action.text}
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
          >
            <span className="quick-action-icon">
              <Icon name={action.icon} size={17} />
            </span>
            <b>{action.text}</b>
            <Icon name="arrow" size={15} />
          </button>
        ))}
      </div>
      <div className="quick-foot">
        <span className="online-indicator" /> All systems operational{' '}
        <span>Updated moments ago</span>
      </div>
    </article>
  );
};

export default QuickActions;
