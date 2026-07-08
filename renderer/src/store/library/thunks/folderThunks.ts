import { createAppAsyncThunk } from "../../hooks";
import { folderService } from "../../../features/library/api/folderService";
import { documentService } from "../../../features/library/api/documentService";
import { updateUserLocalState, updateProfile } from "../../auth/authSlice";
import type { FolderData } from "../librarySlice";

/**
 * Collect a folder and all its descendant folder IDs from the global tree.
 * Used to determine whether the active document lives inside a folder
 * that is about to be deleted (including nested children).
 */
function collectFolderAndDescendants(folderId: string, tree: FolderData[]): Set<string> {
  const ids = new Set<string>([folderId]);
  const queue = [folderId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const folder of tree) {
      if (folder.parentFolder === current && !ids.has(folder._id)) {
        ids.add(folder._id);
        queue.push(folder._id);
      }
    }
  }
  return ids;
}

export const fetchFolderTree = createAppAsyncThunk(
  "document/fetchFolderTree",
  async () => {
    const response = await folderService.getFolderTree();
    return response.data;
  },
);

export const fetchFolderContents = createAppAsyncThunk(
  "document/fetchFolderContents",
  async (params: | { folderId?: string; page?: number; limit?: number; search?: string; tags?: string; sortBy?: string; sortOrder?: "asc" | "desc"; } | undefined) => {
    const response = await folderService.getFolderContents(params || {});
    return response;
  }
);

export const createFolderThunk = createAppAsyncThunk(
  "folder/createFolder",
  async (
    payload: { name: string; parentFolderId: string | null; color?: string },
    { dispatch, getState }
  ) => {
    const response = await folderService.createFolder(
      payload.name,
      payload.parentFolderId,
      payload.color
    );
    dispatch(fetchFolderTree());
    const state: any = getState();
    const p = state.library.lastFetchParams;
    dispatch(fetchFolderContents({
      folderId: p.folderId,
      page: 1,
      limit: p.limit || 50,
      sortBy: p.sortBy,
      sortOrder: p.sortOrder,
      search: p.search,
      tags: p.tags,
    }));
    return response.data;
  }
);

export const renameFolderThunk = createAppAsyncThunk(
  "document/renameFolder",
  async (payload: { id: string; newName: string }, { dispatch, getState }) => {
    const response = await folderService.renameFolder(payload.id, payload.newName);
    dispatch(fetchFolderTree());
    const state: any = getState();
    const p = state.library.lastFetchParams;
    dispatch(fetchFolderContents({
      folderId: p.folderId,
      page: 1,
      limit: p.limit || 50,
      sortBy: p.sortBy,
      sortOrder: p.sortOrder,
      search: p.search,
      tags: p.tags,
    }));
    return response;
  }
);

export const deleteFolderThunk = createAppAsyncThunk(
  "document/deleteFolder",
  async (folderId: string, { dispatch, getState }) => {
    const state: any = getState();
    const activeDoc = state.workspace.activeDocument;

    // Clear workspace if the active document lives inside the folder being deleted.
    // We check the folder itself plus all descendant sub-folders.
    if (activeDoc?.folder) {
      const affectedFolderIds = collectFolderAndDescendants(folderId, state.library.globalFolderTree || []);
      if (affectedFolderIds.has(activeDoc.folder)) {
        // Use raw action type to avoid circular import (workspaceSlice → documentThunks → folderThunks)
        dispatch({ type: "workspace/clearActiveDocument" });
        dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
        dispatch(updateProfile({ lastActiveDocumentId: null }));
      }
    }

    await folderService.deleteFolder(folderId);
    dispatch(fetchFolderTree());
    const currentState: any = getState();
    const p = currentState.library.lastFetchParams;
    dispatch(fetchFolderContents({
      folderId: p.folderId,
      page: 1,
      limit: p.limit || 50,
      sortBy: p.sortBy,
      sortOrder: p.sortOrder,
      search: p.search,
      tags: p.tags,
    }));
    return folderId;
  }
);

export const downloadFolderZipThunk = createAppAsyncThunk(
  "document/downloadFolderZip",
  async (folderId: string) => {
    await folderService.downloadFolderZip(folderId);
    return folderId;
  }
);

export const moveItemsThunk = createAppAsyncThunk(
  "library/moveItems",
  async (
    payload: { documentIds: string[]; folderIds: string[]; targetFolderId: string | null },
    { dispatch, getState }
  ) => {
    const { documentIds, folderIds, targetFolderId } = payload;

    // Move documents by updating their folder ID
    if (documentIds.length > 0) {
      await Promise.all(
        documentIds.map((id) => documentService.updateDocument(id, { folder: targetFolderId }))
      );
    }

    // Move folders
    if (folderIds.length > 0) {
      await Promise.all(
        folderIds.map((id) => folderService.moveFolder(id, targetFolderId))
      );
    }

    // Refresh sidebar folder tree
    dispatch(fetchFolderTree());

    // Refresh folder contents
    const state: any = getState();
    const p = state.library.lastFetchParams;
    dispatch(
      fetchFolderContents({
        folderId: p.folderId,
        page: 1,
        limit: p.limit || 50,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        search: p.search,
        tags: p.tags,
      })
    );

    return payload;
  }
);

export const copyItemsThunk = createAppAsyncThunk(
  "library/copyItems",
  async (
    payload: { documentIds: string[]; folderIds: string[]; targetFolderId: string | null },
    { dispatch, getState }
  ) => {
    const { documentIds, folderIds, targetFolderId } = payload;

    // Copy documents
    if (documentIds.length > 0) {
      await Promise.all(
        documentIds.map((id) => documentService.copyDocument(id, targetFolderId))
      );
    }

    // Copy folders
    if (folderIds.length > 0) {
      await Promise.all(
        folderIds.map((id) => folderService.copyFolder(id, targetFolderId))
      );
    }

    // Refresh sidebar folder tree
    dispatch(fetchFolderTree());

    // Refresh folder contents
    const state: any = getState();
    const p = state.library.lastFetchParams;
    dispatch(
      fetchFolderContents({
        folderId: p.folderId,
        page: 1,
        limit: p.limit || 50,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        search: p.search,
        tags: p.tags,
      })
    );

    return payload;
  }
);

export const setFolderColorThunk = createAppAsyncThunk(
  "library/setFolderColor",
  async (payload: { folderId: string; color: string }, { dispatch }) => {
    const { folderId, color } = payload;
    try {
      await folderService.setFolderColor(folderId, color);
    } finally {
      dispatch(fetchFolderTree());
    }
    return payload;
  }
);
