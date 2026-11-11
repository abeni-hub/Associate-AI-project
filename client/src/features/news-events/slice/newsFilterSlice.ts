import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FeedType } from '../../../types/newsEvents';

export interface NewsFilterState {
  activeType: FeedType;
  selectedCategory: string;
  selectedSubCity: string;
  searchQuery: string;
  page: number;
}

const initialState: NewsFilterState = {
  activeType: 'all',
  selectedCategory: 'all',
  selectedSubCity: 'All Addis Ababa',
  searchQuery: '',
  page: 1,
};

export const newsFilterSlice = createSlice({
  name: 'newsFilter',
  initialState,
  reducers: {
    setActiveType: (state, action: PayloadAction<FeedType>) => {
      state.activeType = action.payload;
      state.page = 1;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.page = 1;
    },
    setSelectedSubCity: (state, action: PayloadAction<string>) => {
      state.selectedSubCity = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.activeType = 'all';
      state.selectedCategory = 'all';
      state.selectedSubCity = 'All Addis Ababa';
      state.searchQuery = '';
      state.page = 1;
    },
  },
});

export const {
  setActiveType,
  setSelectedCategory,
  setSelectedSubCity,
  setSearchQuery,
  setPage,
  resetFilters,
} = newsFilterSlice.actions;

export default newsFilterSlice.reducer;

