import type { ReactNode } from 'react';

export type PillTypeVariant = 'complaint' | 'suggestion' | 'inquiry' | 'satisfaction' | string;

export interface TypePillProps {
  children: ReactNode;
  type?: PillTypeVariant;
  className?: string;
}

