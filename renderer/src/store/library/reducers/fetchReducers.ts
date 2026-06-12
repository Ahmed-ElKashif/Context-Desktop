import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { LibraryState } from "../librarySlice";
import { fetchLibraryDocuments } from "../thunks/documentThunks";
import { fetchFolderContents, fetchFolderTree } from "../thunks/folderThunks";

// Helper to generate a robust cache key that respects filtering and pagination
const generateCacheKey = (p: any): string => {
  return [
    p?.folderId || "root",
    p?.search || "",
    p?.tags || "",
    p?.sortBy || "updatedAt",
    p?.sortOrder || "desc",
    p?.page || 1,
    p?.limit || 10,
  ].join("|");
};

export const buildFetchReducers = (builder: ActionReducerMapBuilder<LibraryState>) => {
  builder
    .addCase(fetchLibraryDocuments.pending, (state) => {
      state.isFetchingLibrary = true;
      state.error = null;
    })
    .addCase(fetchLibraryDocuments.fulfilled, (state, action) => {
      state.isFetchingLibrary = false;
      state.globalDocumentsList = action.payload.data;
      // Do not overwrite pagination, as fetchLibraryDocuments fetches everything (or doesn't use the same pagination as the active library view)
    })
    .addCase(fetchLibraryDocuments.rejected, (state, action) => {
      state.isFetchingLibrary = false;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    })

    .addCase(fetchFolderContents.pending, (state, action) => {
      state.isFetchingLibrary = true;
      state.error = null;

      // Always remember the latest params for post-upload refetches
      const p = action.meta.arg || {};
      state.lastFetchParams = {
        folderId: p.folderId,
        search: p.search,
        tags: p.tags,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        limit: p.limit || state.lastFetchParams?.limit || 10,
      };

      // Smart SWR Cache Logic
      const targetFolderId = p.folderId || "root";
      const cacheKey = generateCacheKey(p);
      const cached = state.folderCache[cacheKey];
      const CACHE_TTL_MS = 60_000; // 60 seconds
      const isCacheValid = cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS;

      const isContextChange = 
        targetFolderId !== (state.currentFolder?._id || "root") ||
        (p.search || "") !== (state.lastFetchParams?.search || "") ||
        (p.tags || "") !== (state.lastFetchParams?.tags || "");

      if (isCacheValid) {
        // Restore from cache instantly — background fetch will update silently
        state.documentsList = cached.documentsList;
        state.foldersList = cached.foldersList;
        state.breadcrumbs = cached.breadcrumbs;
        state.pagination = cached.pagination;
        state.isFetchingLibrary = false; // Don't show spinner
        state.isRevalidating = true; // Show subtle progress bar
      } else if (isContextChange) {
        // Inter-folder navigation or search change with no valid cache, clear to show skeletons
        state.documentsList = [];
        state.foldersList = [];
      }
      // If !isCacheValid and !isContextChange (e.g. changing page/sort), keep old arrays visible while fetching.
    })
    .addCase(fetchFolderContents.fulfilled, (state, action) => {
      state.isFetchingLibrary = false;
      state.isRevalidating = false;
      state.currentFolder = action.payload.data.currentFolder;
      state.breadcrumbs = action.payload.data.breadcrumbs || [];
      state.foldersList = action.payload.data.folders;
      state.documentsList = action.payload.data.documents;

      if (action.payload.pagination) {
        state.pagination = action.payload.pagination ? action.payload.pagination : null;
      }

      // Save to cache
      const p = action.meta.arg || {};
      const cacheKey = generateCacheKey(p);
      state.folderCache[cacheKey] = {
        documentsList: action.payload.data.documents,
        foldersList: action.payload.data.folders,
        breadcrumbs: action.payload.data.breadcrumbs || [],
        pagination: action.payload.pagination || null,
        timestamp: Date.now()
      };
    })
    .addCase(fetchFolderContents.rejected, (state, action) => {
      state.isFetchingLibrary = false;
      state.error = (action.error.message || "An unexpected error occurred") as string;
    })

    .addCase(fetchFolderTree.fulfilled, (state, action) => {
      state.globalFolderTree = action.payload;
    });
};