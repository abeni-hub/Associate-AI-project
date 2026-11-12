import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { DashboardPeriod, DashboardUiState } from '../types/dashboard.types';
import type { RootState } from '../../../app/store';

const initialState: DashboardUiState = {
  period: 'This week',
  isExporting: false,
};

export const dashboardSlice = createSlice({
  name: 'dashboardUi',
  initialState,
  reducers: {
    setDashboardPeriod: (state, action: PayloadAction<DashboardPeriod>) => {
      state.period = action.payload;
    },
    toggleDashboardPeriod: (state) => {
      state.period = state.period === 'This week' ? 'Last week' : 'This week';
    },
    setIsExporting: (state, action: PayloadAction<boolean>) => {
      state.isExporting = action.payload;
    },
  },
});

export const { setDashboardPeriod, toggleDashboardPeriod, setIsExporting } = dashboardSlice.actions;

export const selectDashboardUi = (state: RootState): DashboardUiState =>
  state.dashboardUi || initialState;

export const selectDashboardPeriod = createSelector(
  [selectDashboardUi],
  (ui) => ui.period
);

export const selectDashboardIsExporting = createSelector(
  [selectDashboardUi],
  (ui) => ui.isExporting
);

export default dashboardSlice.reducer;

