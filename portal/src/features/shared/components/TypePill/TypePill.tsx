import React from 'react';
import type { TypePillProps } from './TypePill.types';
import styles from './TypePill.module.css';

export const TypePill: React.FC<TypePillProps> = ({
  children,
  type,
  className = '',
}) => {
  const resolvedType = (type ?? String(children)).toLowerCase().trim();

  const getStyleClass = (): string => {
    switch (resolvedType) {
      case 'complaint':
        return styles.complaint;
      case 'suggestion':
        return styles.suggestion;
      case 'satisfaction':
        return styles.satisfaction;
      case 'inquiry':
        return styles.inquiry;
      default:
        return styles.inquiry;
    }
  };

  return (
    <span className={`${styles.pill} ${getStyleClass()} ${className}`.trim()}>
      {children}
    </span>
  );
};

export default TypePill;

