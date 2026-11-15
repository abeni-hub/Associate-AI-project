import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { AccountsUiState } from '../types/accounts.types';
import type { RootState } from '../../../app/store';

const initialState: AccountsUiState = {
  search: '',
  roleFilter: 'All roles',
  isAccountModalOpen: false,
  selectedAccountId: null,
};

export const accountsSlice = createSlice({
  name: 'accountsUi',
  initialState,
  reducers: {
    setAccountsSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setAccountsRoleFilter: (state, action: PayloadAction<string>) => {
      state.roleFilter = action.payload;
    },
    openCreateAccountModal: (state) => {
      state.selectedAccountId = null;
      state.isAccountModalOpen = true;
    },
    openEditAccountModal: (state, action: PayloadAction<number>) => {
      state.selectedAccountId = action.payload;
      state.isAccountModalOpen = true;
    },
    closeAccountModal: (state) => {
      state.isAccountModalOpen = false;
      state.selectedAccountId = null;
    },
  },
});

export const {
  setAccountsSearch,
  setAccountsRoleFilter,
  openCreateAccountModal,
  openEditAccountModal,
  closeAccountModal,
} = accountsSlice.actions;

export const selectAccountsUi = (state: RootState): AccountsUiState =>
  state.accountsUi || initialState;

export const selectAccountsSearch = createSelector(
  [selectAccountsUi],
  (ui) => ui.search
);

export const selectAccountsRoleFilter = createSelector(
  [selectAccountsUi],
  (ui) => ui.roleFilter
);

export const selectIsAccountModalOpen = createSelector(
  [selectAccountsUi],
  (ui) => ui.isAccountModalOpen
);

export const selectSelectedAccountId = createSelector(
  [selectAccountsUi],
  (ui) => ui.selectedAccountId
);

export default accountsSlice.reducer;

