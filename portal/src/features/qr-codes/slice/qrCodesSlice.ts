import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { QRFilterState } from '../types/qrCodes.types';

const initialState: QRFilterState = {
  searchQuery: '',
  officeFilter: 'All offices',
  statusFilter: 'All statuses',
  selectedId: null,
  isCopied: false,
};

export const qrCodesSlice = createSlice({
  name: 'qrCodesUi',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setOfficeFilter: (state, action: PayloadAction<string>) => {
      state.officeFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setSelectedId: (state, action: PayloadAction<number | null>) => {
      state.selectedId = action.payload;
    },
    setIsCopied: (state, action: PayloadAction<boolean>) => {
      state.isCopied = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.officeFilter = 'All offices';
      state.statusFilter = 'All statuses';
    },
  },
});

export const {
  setSearchQuery,
  setOfficeFilter,
  setStatusFilter,
  setSelectedId,
  setIsCopied,
  resetFilters,
} = qrCodesSlice.actions;

export const selectQrUiState = (state: { qrCodesUi?: QRFilterState }) =>
  state.qrCodesUi ?? initialState;

export const selectQrSearch = createSelector(
  [selectQrUiState],
  (ui) => ui.searchQuery
);

export const selectQrOfficeFilter = createSelector(
  [selectQrUiState],
  (ui) => ui.officeFilter
);

export const selectQrStatusFilter = createSelector(
  [selectQrUiState],
  (ui) => ui.statusFilter
);

export const selectQrSelectedId = createSelector(
  [selectQrUiState],
  (ui) => ui.selectedId
);

export const selectQrIsCopied = createSelector(
  [selectQrUiState],
  (ui) => ui.isCopied
);

export default qrCodesSlice.reducer;

