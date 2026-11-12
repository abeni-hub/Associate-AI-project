import type { ReactNode } from 'react';

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'resolved'
  | 'suspended'
  | 'draft'
  | 'published'
  | 'rejected'
  | 'in-progress'
  | 'under-review'
  | string;

export interface StatusPillProps {
  children: ReactNode;
  status?: StatusVariant;
  className?: string;
}

