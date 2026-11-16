import type { AccountItem } from '../../../types/portal.types';
import type { AuthUser } from '../../auth/types/auth.types';
import type { PaginationQueryParams } from '../../../types/api.types';

export type AccountRoleFilter =
  | 'All roles'
  | 'Super Admin'
  | 'Sub-City Admin'
  | 'Woreda Admin'
  | 'Bureau Admin'
  | 'Staff';

export interface UserFilterParams extends PaginationQueryParams {
  organization_id?: number;
  role_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
  organization_id: number | null;
  session_timeout?: number | null;
  status?: 'active' | 'inactive';
}

export interface UpdateUserPayload {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  role_id?: number;
  organization_id?: number | null;
  session_timeout?: number | null;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AccountsUiState {
  search: string;
  roleFilter: string;
  isAccountModalOpen: boolean;
  selectedAccountId: number | null;
}

export interface AccountsPageProps {
  items?: AccountItem[];
  onAdd?: () => void;
  onEdit?: (item: AccountItem) => void;
  search?: string;
  setSearch?: (s: string) => void;
}

export interface AccountsToolbarProps {
  search: string;
  roleFilter: string;
  roleOptions?: string[];
  onSearchChange: (val: string) => void;
  onRoleFilterChange: (val: string) => void;
}

export interface AccountsMetricsGridProps {
  total: number | string;
  active: number | string;
  inactive?: number | string;
  admins?: number | string;
  offices?: number | string;
}

export interface AccountsTableProps {
  items: AccountItem[];
  canUpdate: boolean;
  canDelete: boolean;
  isSuperAdmin: boolean;
  canManageScope: (scope: string) => boolean;
  onEdit: (item: AccountItem) => void;
  onDelete: (item: AccountItem) => void;
}

export interface AccountFormModalProps {
  account: AccountItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  isLoading: boolean;
}
