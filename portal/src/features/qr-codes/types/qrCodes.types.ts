import type { OrganizationItem } from '../../organizations';

export interface QrCodeOrganization {
  id: number;
  name: string;
  code: string;
}

export interface QrCodeItem {
  id: number;
  organization_id: number;
  code: string;
  label: string;
  target_url: string;
  scan_count: number;
  status: 'active' | 'inactive';
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
  organization?: QrCodeOrganization;
}

export interface CreateQrCodePayload {
  organization_id: number;
  code: string;
  label: string;
  target_url: string;
  status?: 'active' | 'inactive';
}

export interface QRMetrics {
  total: number;
  active: number;
  totalScans: number;
  bureauCount: number;
}

export interface QRFilterState {
  searchQuery: string;
  officeFilter: string;
  statusFilter: string;
  selectedId: number | null;
  isCopied: boolean;
}

/* =========================================================================
 * Component Prop Contracts
 * ========================================================================= */

export interface QRMetricsGridProps {
  metrics: QRMetrics;
  isLoading: boolean;
}

export interface QRToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  officeFilter: string;
  onOfficeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  organizations: OrganizationItem[];
  canManage: boolean;
  onAddPoster: () => void;
}

export interface QRTableProps {
  items: QrCodeItem[];
  selectedId: number | null;
  canManage: boolean;
  onSelect: (qr: QrCodeItem) => void;
  onPreview: (qr: QrCodeItem) => void;
  onDelete: (id: number, code: string) => void;
}

export interface QREmptyStateProps {
  hasPosters: boolean;
}

export interface QRPageProps {
  onGenerate?: () => void;
  onCopy?: () => void;
}

