import React from 'react';
import { Icon } from './Icon';

export interface PageHeadingProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: string;
  onAction?: () => void;
  secondary?: string;
  onSecondary?: () => void;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  action,
  onAction,
  secondary,
  onSecondary,
}) => {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow page-eyebrow">
          <span className="eyebrow-line" />
          {eyebrow}
        </span>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>{subtitle}</p>
      </div>
      <div className="heading-actions">
        {secondary && (
          <button className="outline-button" onClick={onSecondary}>
            <Icon name="download" size={16} />
            {secondary}
          </button>
        )}
        {action && (
          <button className="primary-button" onClick={onAction}>
            <Icon name="plus" size={16} />
            {action}
          </button>
        )}
      </div>
    </div>
  );
};
