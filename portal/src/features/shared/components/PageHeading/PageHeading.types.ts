import type { ReactNode } from 'react';

export interface PageHeadingProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: string;
  onAction?: () => void;
  actionIcon?: string;
  secondary?: string;
  onSecondary?: () => void;
  secondaryIcon?: string;
  children?: ReactNode;
  className?: string;
}

