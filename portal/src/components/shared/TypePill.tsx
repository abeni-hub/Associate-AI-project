import React from 'react';

export interface TypePillProps {
  type: string;
}

export const TypePill: React.FC<TypePillProps> = ({ type }) => {
  const key = type.toLowerCase();
  return (
    <span className={`type-pill type-${key}`}>
      {type === 'Satisfaction' ? '★' : type === 'Complaint' ? '!' : '↗'}{' '}
      <span>{type}</span>
    </span>
  );
};
