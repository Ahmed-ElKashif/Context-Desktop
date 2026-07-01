import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { LibraryState } from "../librarySlice";
import {
  uploadBatchDocuments,
  renameDocumentThunk,
  deleteDocumentThunk,
  bulkDeleteDocumentsThunk,
  uploadTextDocument,
  reanalyzeDocumentThunk,
  reloadDocumentThunk,
} from "../thunks/documentThunks";
import {
  renameFolderThunk,
  deleteFolderThunk,
  setFolderColorThunk,
} from "../thunks/folderThunks";

const invalidateFolderCache = (state: LibraryState, folderId?: string | null) => {
  const key = folderId || "root";
  delete state.folderCache[key];
};

export const buildMutationReducers = (builder: ActionReducerMapBuilder<LibraryState>) => {
  builder

    // --- Batch Folder Upload ---
    .addCase(uploadBatchDocuments.pending, (state) => {
      state.isUploading = true;
      state.error = null;
      state.uploadProgress = 50;
    })
    .addCase(uploadBatchDocuments.fulfilled, (state, action) => {
      state.isUploading = false;
      state.uploadProgress = 100;
      if (action.payload?.data?.length > 0) {
        const currentFolderId = state.currentFolder?._id || null;
        const matchingDocs = action.payload.data.filter((doc: any) => {
          const docFolderId = typeof doc.folder === "object" ? doc.folder?._id : doc.folder;
          return (docFolderId || null) === currentFolderId;
        });
        if (matchingDocs.length > 0) {
          state.documentsList = [...matchingDocs, ...state.documentsList];
        }
      }
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(uploadBatchDocuments.rejected, (state, action) => {
      state.isUploading = false;
      state.uploadProgress = 0;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    })


    // --- Text Document Upload ---
    .addCase(uploadTextDocument.pending, (state) => {
      state.isUploading = true;
      state.error = null;
      state.uploadProgress = 50;
    })
    .addCase(uploadTextDocument.fulfilled, (state, action) => {
      state.isUploading = false;
      state.uploadProgress = 100;
      if (action.payload?.data?.length > 0) {
        const currentFolderId = state.currentFolder?._id || null;
        const matchingDocs = action.payload.data.filter((doc: any) => {
          const docFolderId = typeof doc.folder === "object" ? doc.folder?._id : doc.folder;
          return (docFolderId || null) === currentFolderId;
        });
        if (matchingDocs.length > 0) {
          state.documentsList = [...matchingDocs, ...state.documentsList];
        }
      }
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(uploadTextDocument.rejected, (state, action) => {
      state.isUploading = false;
      state.uploadProgress = 0;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    })

    // --- Reanalyze & Reload Document ---
    .addCase(reanalyzeDocumentThunk.fulfilled, (state, action) => {
      const index = state.documentsList.findIndex(d => d._id === action.payload._id);
      if (index !== -1) {
        state.documentsList[index] = action.payload;
      }
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(reloadDocumentThunk.fulfilled, (state, action) => {
      const updatedDoc = action.payload;
      const index = state.documentsList.findIndex(d => d._id === updatedDoc._id);
      if (index !== -1) {
        state.documentsList[index] = updatedDoc;
      }
      invalidateFolderCache(state, state.currentFolder?._id);
    })

    // --- Optimistic UI Updates ---
    .addCase(renameDocumentThunk.pending, (state, action) => {
      const { id, title } = action.meta.arg;
      const doc = state.documentsList.find(d => d._id === id);
      if (doc) doc.title = title;
    })
    .addCase(renameDocumentThunk.fulfilled, (state) => {
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(deleteDocumentThunk.pending, (state, action) => {
      const deletedId = action.meta.arg;
      state.documentsList = state.documentsList.filter((doc) => doc._id !== deletedId);
      if (state.pagination) {
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
      }
    })
    .addCase(deleteDocumentThunk.fulfilled, (state) => {
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(bulkDeleteDocumentsThunk.pending, (state, action) => {
      const { documentIds, folderIds } = action.meta.arg;
      if (documentIds && documentIds.length > 0) {
        state.documentsList = state.documentsList.filter(d => !documentIds.includes(d._id));
        if (state.pagination) state.pagination.totalItems = Math.max(0, state.pagination.totalItems - documentIds.length);
      }
      if (folderIds && folderIds.length > 0) {
        state.foldersList = state.foldersList.filter(f => !folderIds.includes(f._id));
      }
    })
    .addCase(bulkDeleteDocumentsThunk.fulfilled, (state) => {
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(renameFolderThunk.pending, (state, action) => {
      const { path, newName } = action.meta.arg;
      const folder = state.foldersList.find(f => f.path === path);
      if (folder) folder.name = newName;
    })
    .addCase(renameFolderThunk.fulfilled, (state) => {
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(deleteFolderThunk.pending, (state, action) => {
      const folderId = action.meta.arg;
      state.foldersList = state.foldersList.filter(f => f._id !== folderId);
    })
    .addCase(deleteFolderThunk.fulfilled, (state) => {
      invalidateFolderCache(state, state.currentFolder?._id);
    })
    .addCase(setFolderColorThunk.pending, (state, action) => {
      const { folderId, color } = action.meta.arg;
      const folder = state.foldersList.find(f => f._id === folderId);
      if (folder) folder.color = color;
      
      const globalFolder = state.globalFolderTree.find(f => f._id === folderId);
      if (globalFolder) globalFolder.color = color;
    })
    .addCase(setFolderColorThunk.fulfilled, (state) => {
      invalidateFolderCache(state, state.currentFolder?._id);
    });
};
