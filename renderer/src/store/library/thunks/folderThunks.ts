import { createAppAsyncThunk } from "../../hooks";
import { folderService } from "../../../features/library/api/folderService";

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

export const renameFolderThunk = createAppAsyncThunk(
  "document/renameFolder",
  async (payload: { path: string; newName: string }, { dispatch, getState }) => {
    const response = await folderService.renameFolder(payload.path, payload.newName);
    dispatch(fetchFolderTree());
    const state = getState();
    const currentFolderId = state.library?.currentFolder?._id;
    dispatch(fetchFolderContents({ folderId: currentFolderId, page: 1, limit: 10 }));
    return response;
  }
);

export const deleteFolderThunk = createAppAsyncThunk(
  "document/deleteFolder",
  async (path: string, { dispatch, getState }) => {
    await folderService.deleteFolder(path);
    dispatch(fetchFolderTree());
    const state = getState();
    const currentFolderId = state.library?.currentFolder?._id;
    dispatch(fetchFolderContents({ folderId: currentFolderId, page: 1, limit: 10 }));
    return path;
  }
);

export const downloadFolderZipThunk = createAppAsyncThunk(
  "document/downloadFolderZip",
  async (folderId: string) => {
    const blob = await folderService.downloadFolderZip(folderId);
    return blob;
  }
);
