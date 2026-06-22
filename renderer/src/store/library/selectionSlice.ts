import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentData, FolderData } from "./librarySlice";

interface SelectionState {
  selectedDocs: DocumentData[];
  selectedFolders: FolderData[];
  anchorId: string | null;
  focusId: string | null;
}

const initialState: SelectionState = {
  selectedDocs: [],
  selectedFolders: [],
  anchorId: null,
  focusId: null,
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
      state.anchorId = doc._id;
      state.focusId = doc._id;
    },
    toggleFolderSelection: (state, action: PayloadAction<FolderData>) => {
      const folder = action.payload;
      const index = state.selectedFolders.findIndex(
        (f) => f._id === folder._id,
      );
      if (index !== -1) {
        state.selectedFolders.splice(index, 1);
      } else {
        state.selectedFolders.push(folder);
      }
      state.anchorId = folder._id;
      state.focusId = folder._id;
    },
    toggleAllVisibleSelection: (
      state,
      action: PayloadAction<{
        docs: DocumentData[];
        folders: FolderData[];
        isAllVisibleSelected: boolean;
      }>,
    ) => {
      const { docs, folders, isAllVisibleSelected } = action.payload;

      if (isAllVisibleSelected) {
        const docIdsToRemove = new Set(docs.map((d) => d._id));
        const folderIdsToRemove = new Set(folders.map((f) => f._id));
        state.selectedDocs = state.selectedDocs.filter(
          (d) => !docIdsToRemove.has(d._id),
        );
        state.selectedFolders = state.selectedFolders.filter(
          (f) => !folderIdsToRemove.has(f._id),
        );
      } else {
        const existingDocIds = new Set(state.selectedDocs.map((d) => d._id));
        const existingFolderIds = new Set(
          state.selectedFolders.map((f) => f._id),
        );

        docs.forEach((d) => {
          if (!existingDocIds.has(d._id)) state.selectedDocs.push(d);
        });
        folders.forEach((f) => {
          if (!existingFolderIds.has(f._id)) state.selectedFolders.push(f);
        });
      }
      state.anchorId = null;
      state.focusId = null;
    },
    clearSelection: (state) => {
      state.selectedDocs = [];
      state.selectedFolders = [];
      state.anchorId = null;
      state.focusId = null;
    },
    selectSingle: (state, action: PayloadAction<{ item: DocumentData | FolderData; type: "doc" | "folder" }>) => {
      state.selectedDocs = [];
      state.selectedFolders = [];
      if (action.payload.type === "doc") {
        state.selectedDocs.push(action.payload.item as DocumentData);
      } else {
        state.selectedFolders.push(action.payload.item as FolderData);
      }
      state.anchorId = action.payload.item._id;
      state.focusId = action.payload.item._id;
    },
    selectRange: (state, action: PayloadAction<{
      allItems: { item: DocumentData | FolderData; type: "doc" | "folder" }[];
      fromIndex: number;
      toIndex: number;
      clearOthers?: boolean;
    }>) => {
      const { allItems, fromIndex, toIndex, clearOthers = true } = action.payload;
      
      if (clearOthers) {
        state.selectedDocs = [];
        state.selectedFolders = [];
      }

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      
      for (let i = start; i <= end; i++) {
        const current = allItems[i];
        if (current.type === "doc") {
          if (!state.selectedDocs.some(d => d._id === current.item._id)) {
            state.selectedDocs.push(current.item as DocumentData);
          }
        } else {
          if (!state.selectedFolders.some(f => f._id === current.item._id)) {
             state.selectedFolders.push(current.item as FolderData);
          }
        }
      }
      state.anchorId = allItems[fromIndex].item._id;
      state.focusId = allItems[toIndex].item._id;
    },
    setSelection: (state, action: PayloadAction<{ docs: DocumentData[]; folders: FolderData[] }>) => {
      state.selectedDocs = action.payload.docs;
      state.selectedFolders = action.payload.folders;
    },
    setFocus: (state, action: PayloadAction<string | null>) => {
      state.focusId = action.payload;
    },
    setAnchorAndFocus: (state, action: PayloadAction<string | null>) => {
      state.anchorId = action.payload;
      state.focusId = action.payload;
    },
  },
});

export const {
  toggleDocSelection,
  toggleFolderSelection,
  toggleAllVisibleSelection,
  clearSelection,
  selectSingle,
  selectRange,
  setSelection,
  setFocus,
  setAnchorAndFocus,
} = selectionSlice.actions;

export default selectionSlice.reducer;
