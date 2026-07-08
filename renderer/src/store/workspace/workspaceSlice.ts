import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentData, updateDocumentPrettifyResult } from "../library/librarySlice";
import {
  uploadBatchDocuments,
  uploadTextDocument,
  reanalyzeDocumentThunk,
  reloadDocumentThunk,
  renameDocumentThunk,
  deleteDocumentThunk,
  bulkDeleteDocumentsThunk,
} from "../library/thunks/documentThunks";
import { deleteFolderThunk } from "../library/thunks/folderThunks";

export interface WorkspaceState {
  activeDocument: DocumentData | null;
}

const initialState: WorkspaceState = {
  activeDocument: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveDocument: (state, action: PayloadAction<DocumentData>) => {
      state.activeDocument = action.payload;
    },
    clearActiveDocument: (state) => {
      state.activeDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadBatchDocuments.fulfilled, (state, action) => {
        if (action.payload?.data?.length > 0) {
          if (!state.activeDocument) {
            state.activeDocument = action.payload.data[0];
          }
        }
      })
      .addCase(uploadTextDocument.fulfilled, (state, action) => {
        if (action.payload?.data?.length > 0) {
          state.activeDocument = action.payload.data[0];
        }
      })
      .addCase(reanalyzeDocumentThunk.pending, (state, action) => {
        if (state.activeDocument && state.activeDocument._id === action.meta.arg) {
          state.activeDocument.aiStatus = "Processing";
        }
      })
      .addCase(reanalyzeDocumentThunk.fulfilled, (state, action) => {
        if (state.activeDocument?._id === action.payload._id) {
          state.activeDocument = action.payload;
        }
      })
      .addCase(reloadDocumentThunk.fulfilled, (state, action) => {
        if (state.activeDocument?._id === action.payload._id) {
          state.activeDocument = action.payload;
        }
      })
      .addCase(renameDocumentThunk.pending, (state, action) => {
        const { id, title } = action.meta.arg;
        if (state.activeDocument?._id === id) {
          state.activeDocument.title = title;
        }
      })
      .addCase(deleteDocumentThunk.pending, (state, action) => {
        const deletedId = action.meta.arg;
        if (state.activeDocument?._id === deletedId) {
          state.activeDocument = null;
        }
      })
      .addCase(bulkDeleteDocumentsThunk.pending, (state, action) => {
        const { documentIds, folderIds } = action.meta.arg;
        if (documentIds && state.activeDocument && documentIds.includes(state.activeDocument._id)) {
          state.activeDocument = null;
        }
        // Also clear if the active document is directly inside a deleted folder
        if (folderIds && state.activeDocument?.folder && folderIds.includes(state.activeDocument.folder)) {
          state.activeDocument = null;
        }
      })
      .addCase(deleteFolderThunk.pending, (state, action) => {
        const folderId = action.meta.arg;
        if (state.activeDocument?.folder === folderId) {
          state.activeDocument = null;
        }
      })
      // Keep activeDocument.prettifiedJson in sync when prettify completes,
      // so PrettifyViewer can read it after unmount/remount without a full page reload.
      .addCase(updateDocumentPrettifyResult, (state, action) => {
        if (state.activeDocument && state.activeDocument._id === action.payload.documentId) {
          state.activeDocument.prettifiedJson = action.payload.prettifiedJson;
        }
      });
  },
});

export const { setActiveDocument, clearActiveDocument } = workspaceSlice.actions;

export default workspaceSlice.reducer;
