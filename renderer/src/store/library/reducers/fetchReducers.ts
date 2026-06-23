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
    p?.limit || 50,
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
        limit: p.limit || state.lastFetchParams?.limit || 50,
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
        const isAppending = p.page && p.page > 1;
        if (!isAppending) {
          // Restore from cache instantly — background fetch will update silently
          state.documentsList = cached.documentsList;
          state.foldersList = cached.foldersList;
          state.breadcrumbs = cached.breadcrumbs;
          state.pagination = cached.pagination;
        }
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
      const isAppending = action.meta.arg?.page && action.meta.arg.page > 1;

      if (isAppending) {
        // Deduplicate to prevent double-appending if cache and fetch run close together
        const newFolders = action.payload.data.folders.filter((f: any) => !state.foldersList.some(existing => existing._id === f._id));
        const newDocs = action.payload.data.documents.filter((d: any) => !state.documentsList.some(existing => existing._id === d._id));
        
        state.foldersList = [...state.foldersList, ...newFolders];
        state.documentsList = [...state.documentsList, ...newDocs];
      } else {
        state.foldersList = action.payload.data.folders;
        state.documentsList = action.payload.data.documents;
      }

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
