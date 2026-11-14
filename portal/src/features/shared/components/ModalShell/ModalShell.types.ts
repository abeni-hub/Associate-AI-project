import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

