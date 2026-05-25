import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentData, FolderData } from "./documentSlice";

interface SelectionState {
  selectedDocs: DocumentData[];
  selectedFolders: FolderData[];
}

const initialState: SelectionState = {
  selectedDocs: [],
  selectedFolders: [],
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    toggleDocSelection: (state, action: PayloadAction<DocumentData>) => {
      const doc = action.payload;
      const index = state.selectedDocs.findIndex((d) => d._id === doc._id);
      if (index !== -1) {
        state.selectedDocs.splice(index, 1);
      } else {
        state.selectedDocs.push(doc);
      }
    },
    toggleFolderSelection: (state, action: PayloadAction<FolderData>) => {
      const folder = action.payload;
      const index = state.selectedFolders.findIndex((f) => f._id === folder._id);
      if (index !== -1) {
        state.selectedFolders.splice(index, 1);
      } else {
        state.selectedFolders.push(folder);
      }
    },
    toggleAllVisibleSelection: (
      state,
      action: PayloadAction<{ docs: DocumentData[]; folders: FolderData[]; isAllVisibleSelected: boolean }>
    ) => {
      const { docs, folders, isAllVisibleSelected } = action.payload;
      
      if (isAllVisibleSelected) {
        const docIdsToRemove = new Set(docs.map(d => d._id));
        const folderIdsToRemove = new Set(folders.map(f => f._id));
        state.selectedDocs = state.selectedDocs.filter(d => !docIdsToRemove.has(d._id));
        state.selectedFolders = state.selectedFolders.filter(f => !folderIdsToRemove.has(f._id));
      } else {
        const existingDocIds = new Set(state.selectedDocs.map(d => d._id));
        const existingFolderIds = new Set(state.selectedFolders.map(f => f._id));
        
        docs.forEach(d => {
          if (!existingDocIds.has(d._id)) state.selectedDocs.push(d);
        });
        folders.forEach(f => {
          if (!existingFolderIds.has(f._id)) state.selectedFolders.push(f);
        });
      }
    },
    clearSelection: (state) => {
      state.selectedDocs = [];
      state.selectedFolders = [];
    },
    setSelection: (state, action: PayloadAction<{ docs: DocumentData[]; folders: FolderData[] }>) => {
      state.selectedDocs = action.payload.docs;
      state.selectedFolders = action.payload.folders;
    },
  },
});

export const {
  toggleDocSelection,
  toggleFolderSelection,
  toggleAllVisibleSelection,
  clearSelection,
  setSelection,
} = selectionSlice.actions;

export default selectionSlice.reducer;

