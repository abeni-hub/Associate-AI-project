import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { ModalConfig } from '../../../types/portal.types';
import type { RootState } from '../../../app/store';

export interface UiState {
  mobileOpen: boolean;
  modal: ModalConfig;
  globalSearch: string;
}

const initialState: UiState = {
  mobileOpen: false,
  modal: null,
  globalSearch: '',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileOpen = action.payload;
    },
    toggleMobileOpen: (state) => {
      state.mobileOpen = !state.mobileOpen;
    },
    setModal: (state, action: PayloadAction<ModalConfig>) => {
      state.modal = action.payload;
    },
    closeModal: (state) => {
      state.modal = null;
    },
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload;
    },
    resetGlobalSearch: (state) => {
      state.globalSearch = '';
    },
  },
});

export const {
  setMobileOpen,
  toggleMobileOpen,
  setModal,
  closeModal,
  setGlobalSearch,
  resetGlobalSearch,
} = uiSlice.actions;

export const selectUiState = (state: RootState): UiState => state.ui || initialState;

export const selectMobileOpen = createSelector([selectUiState], (ui) => ui.mobileOpen);
export const selectActiveModal = createSelector([selectUiState], (ui) => ui.modal);
export const selectGlobalSearch = createSelector([selectUiState], (ui) => ui.globalSearch);

export default uiSlice.reducer;

