import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    setActiveType: (state, action) => {
      state.activeType = action.payload;
      state.page = 1;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.page = 1;
    },
    setSelectedSubCity: (state, action) => {
      state.selectedSubCity = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => {
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
