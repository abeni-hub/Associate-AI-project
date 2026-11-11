import React from 'react';

export interface StatusPillProps {
  children: React.ReactNode;
}

export const StatusPill: React.FC<StatusPillProps> = ({ children }) => {
  const key = String(children).toLowerCase().replace(/ /g, '-');
  return (
    <span className={`status-pill status-${key}`}>
      <i />
      {children}
    </span>
  );
};
