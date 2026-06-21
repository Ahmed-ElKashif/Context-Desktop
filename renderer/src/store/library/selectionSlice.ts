import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentData, FolderData } from "./librarySlice";

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
      const index = state.selectedFolders.findIndex(
        (f) => f._id === folder._id,
      );
      if (index !== -1) {
        state.selectedFolders.splice(index, 1);
      } else {
        state.selectedFolders.push(folder);
      }
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
    },
    clearSelection: (state) => {
      state.selectedDocs = [];
      state.selectedFolders = [];
    },
    selectSingle: (state, action: PayloadAction<{ item: DocumentData | FolderData; type: "doc" | "folder" }>) => {
      state.selectedDocs = [];
      state.selectedFolders = [];
      if (action.payload.type === "doc") {
        state.selectedDocs.push(action.payload.item as DocumentData);
      } else {
        state.selectedFolders.push(action.payload.item as FolderData);
      }
    },
    selectRange: (state, action: PayloadAction<{
      allItems: { item: DocumentData | FolderData; type: "doc" | "folder" }[];
      fromIndex: number;
      toIndex: number;
    }>) => {
      const { allItems, fromIndex, toIndex } = action.payload;
      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      
      const docsToAdd = new Set<string>();
      const foldersToAdd = new Set<string>();

      for (let i = start; i <= end; i++) {
        const current = allItems[i];
        if (current.type === "doc") {
          docsToAdd.add(current.item._id);
        } else {
          foldersToAdd.add(current.item._id);
        }
      }

      // Add them avoiding duplicates
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
  selectSingle,
  selectRange,
  setSelection,
} = selectionSlice.actions;

export default selectionSlice.reducer;
