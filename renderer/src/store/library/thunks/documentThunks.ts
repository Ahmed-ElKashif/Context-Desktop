import { createAppAsyncThunk } from "../../hooks";
import { documentService, GetDocumentsParams } from "../../../features/library/api/documentService";
import { uploadService } from "../../../features/library/api/uploadService";
import { folderService } from "../../../features/library/api/folderService";
import { updateUserLocalState, updateProfile } from "../../auth/authSlice";
import { fetchFolderContents, fetchFolderTree } from "./folderThunks";
import { fetchSettings } from "@/store/settings/settingsSlice";

export const fetchLibraryDocuments = createAppAsyncThunk(
  "document/fetchLibrary",
  async (params: GetDocumentsParams | undefined) => {
    const response = await documentService.getDocuments(params);
    return response;
  },
);

export const uploadBatchDocuments = createAppAsyncThunk(
  "document/uploadBatch",
  async (
    payload: { files: File[]; clientPaths: string[] },
    { dispatch, getState },
  ) => {
    const response = await uploadService.uploadBatch(
      payload.files,
      payload.clientPaths,
    );

    // Update the sidebar's tree
    dispatch(fetchFolderTree());

    // Refetch page 1 of the current folder, preserving the active sort/search/tag.
    const state = getState();
    const p = state.library.lastFetchParams;
    dispatch(
      fetchFolderContents({
        folderId: p.folderId,
        page: 1,
        limit: p.limit || 10,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        search: p.search,
        tags: p.tags,
      }),
    );

    return response;
  },
);

export const uploadTextDocument = createAppAsyncThunk(
  "document/uploadText",
  async (
    payload: string | { text: string; title?: string },
    { dispatch, getState },
  ) => {
    const text = typeof payload === "string" ? payload : payload.text;
    const title = typeof payload === "string" ? undefined : payload.title;
    const response = await uploadService.processText(text, title);

    // Refresh the sidebar so "Random files" folder appears immediately
    dispatch(fetchFolderTree());

    // Refetch page 1 of the current folder, preserving the active sort/search/tag.
    const state = getState();
    const p = state.library.lastFetchParams;
    dispatch(
      fetchFolderContents({
        folderId: p.folderId,
        page: 1,
        limit: p.limit || 10,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        search: p.search,
        tags: p.tags,
      }),
    );

    dispatch(fetchSettings()); // Refresh AI budget!

    return response;
  },
);

export const deleteDocumentThunk = createAppAsyncThunk(
  "document/delete",
  async (documentId: string, { dispatch, getState }) => {
    const state = getState();
    // THE FIX: Clear lastActiveDocumentId IMMEDIATELY to prevent the workspace
    // from auto-restoring this document during the 2-second API wait time!
    if (state.auth?.user?.lastActiveDocumentId === documentId) {
      dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
    }

    await documentService.deleteDocument(documentId);

    // Refresh sidebar folder tree
    dispatch(fetchFolderTree());

    // Refresh folder contents
    const currentState = getState();
    const currentFolderId = currentState.library?.currentFolder?._id;
    dispatch(
      fetchFolderContents({
    folderId: currentFolderId,
    page: 1,
    limit: 10,
      }),
    );

    // Also clear lastActiveDocumentId from user profile if it was deleted
    if (currentState.auth?.user?.lastActiveDocumentId === documentId) {
      dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
      dispatch(updateProfile({ lastActiveDocumentId: null }));
    }

    return documentId;
  },
);

export const reloadDocumentThunk = createAppAsyncThunk(
  "document/reload",
  async (documentId: string) => {
    const doc = await documentService.getDocument(documentId);
    return doc;
  },
);

export const reanalyzeDocumentThunk = createAppAsyncThunk(
  "document/reanalyze",
  async (documentId: string) => {
    const response = await documentService.reanalyzeDocument(documentId);
    return response.data;
  },
);

export const renameDocumentThunk = createAppAsyncThunk(
  "document/rename",
  async (
    payload: { id: string; title: string },
    { dispatch, getState },
  ) => {
    const response = await documentService.updateDocument(payload.id, {
      title: payload.title,
    });

    // Auto-refresh in the background without blocking the optimistic UI
    dispatch(fetchFolderTree());
    const state = getState();
    const currentFolderId = state.library?.currentFolder?._id;
    dispatch(
      fetchFolderContents({
    folderId: currentFolderId,
    page: 1,
    limit: 10,
      }),
    );

    return { id: payload.id, title: payload.title, data: response };
  },
);

export const bulkDeleteDocumentsThunk = createAppAsyncThunk(
  "document/bulkDelete",
  async (
    payload: { documentIds: string[]; folderIds: string[] },
    { dispatch, getState },
  ) => {
    const { documentIds, folderIds } = payload;

    if (documentIds.length > 0) {
      await documentService.bulkDeleteDocuments(documentIds);
    }

    if (folderIds.length > 0) {
      await Promise.all(
    folderIds.map((folderId) => folderService.deleteFolder(folderId)),
      );
    }

    // Refresh sidebar and background data
    dispatch(fetchFolderTree());
    const state = getState();
    const currentFolderId = state.library?.currentFolder?._id;
    dispatch(
      fetchFolderContents({
    folderId: currentFolderId,
    page: 1,
    limit: 10,
      }),
    );

    return payload;
  },
);
