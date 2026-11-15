import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FeedbackFilterState, FeedbackStatus } from '../types/feedback.types';

const initialState: FeedbackFilterState = {
  typeFilter: 'All types',
  statusFilter: 'All statuses',
  searchQuery: '',
  statusOverrides: {},
  noticeMessage: null,
};

export const feedbackSlice = createSlice({
  name: 'feedbackUi',
  initialState,
  reducers: {
    setTypeFilter: (state, action: PayloadAction<string>) => {
      state.typeFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusOverride: (
      state,
      action: PayloadAction<{ id: string; status: FeedbackStatus }>
    ) => {
      state.statusOverrides[action.payload.id] = action.payload.status;
    },
    setNoticeMessage: (state, action: PayloadAction<string | null>) => {
      state.noticeMessage = action.payload;
    },
    resetFilters: (state) => {
      state.typeFilter = 'All types';
      state.statusFilter = 'All statuses';
      state.searchQuery = '';
    },
  },
});

export const {
  setTypeFilter,
  setStatusFilter,
  setSearchQuery,
  setStatusOverride,
  setNoticeMessage,
  resetFilters,
} = feedbackSlice.actions;

export const selectFeedbackUiState = (state: { feedbackUi?: FeedbackFilterState }) =>
  state.feedbackUi ?? initialState;

export const selectTypeFilter = createSelector(
  [selectFeedbackUiState],
  (ui) => ui.typeFilter
);

export const selectStatusFilter = createSelector(
  [selectFeedbackUiState],
  (ui) => ui.statusFilter
);

export const selectSearchQuery = createSelector(
  [selectFeedbackUiState],
  (ui) => ui.searchQuery
);

export const selectStatusOverrides = createSelector(
  [selectFeedbackUiState],
  (ui) => ui.statusOverrides
);

export const selectNoticeMessage = createSelector(
  [selectFeedbackUiState],
  (ui) => ui.noticeMessage
);

export default feedbackSlice.reducer;

