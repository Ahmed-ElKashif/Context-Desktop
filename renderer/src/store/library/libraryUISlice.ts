import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LibraryUIState {
  sortBy: string;
  sortOrder: "asc" | "desc";
  activeTag: string | null;
  activeFolder: string | null;
  activeClientFolder: string | null;
  searchQuery: string;
}

const initialState: LibraryUIState = {
  sortBy: "updatedAt",
  sortOrder: "desc",
  activeTag: null,
  activeFolder: null,
  activeClientFolder: null,
  searchQuery: "",
};

const libraryUISlice = createSlice({
  name: "libraryUI",
  initialState,
  reducers: {
    setSort: (state, action: PayloadAction<string>) => {
      if (state.sortBy === action.payload) {
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
      } else {
        state.sortBy = action.payload;
        state.sortOrder = "desc";
      }
    },
    setActiveTag: (state, action: PayloadAction<string | null>) => {
      state.activeTag = action.payload;
      state.activeFolder = null;
      state.activeClientFolder = null;
    },
    setActiveFolder: (state, action: PayloadAction<string | null>) => {
      state.activeFolder = action.payload;
      state.activeTag = null;
      state.activeClientFolder = null;
    },
    setActiveClientFolder: (state, action: PayloadAction<string | null>) => {
      state.activeClientFolder = action.payload;
      state.activeFolder = null;
      state.activeTag = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearAllFilters: (state) => {
      state.activeTag = null;
      state.activeFolder = null;
      state.activeClientFolder = null;
      state.searchQuery = "";
    },
  },
});

export const {
  setSort,
  setActiveTag,
  setActiveFolder,
  setActiveClientFolder,
  setSearchQuery,
  clearAllFilters,
} = libraryUISlice.actions;

export default libraryUISlice.reducer;
