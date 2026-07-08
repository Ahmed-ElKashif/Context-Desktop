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
    payload: { files: File[] | any[]; clientPaths: string[]; targetFolderId?: string | null },
    { dispatch, getState, rejectWithValue },
  ) => {
    let response;
    
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const electronAPI = (window as any).electronAPI;
      const state: any = getState();
      const token = state.auth?.token;
      // In electron, we need to pass the apiUrl explicitly, or maybe hardcode it/get it from env.
      // But we can just use the standard Vite env var
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // CRITICAL FIX: Serialize to plain objects before crossing contextBridge.
      // File/Blob DOM objects lose non-enumerable properties (e.g. .path injected by
      // Object.defineProperty) when the Structured Clone Algorithm serializes them.
      const serializableFiles = payload.files.map((file: any, i: number) => {
        // 1. Read non-enumerable .path (set by applyPrototypeBridge via Object.defineProperty)
        const bridgePath = Object.getOwnPropertyDescriptor(file, 'path')?.value;
        // 2. Direct .path on plain objects (from selectBatchFolder raw result)
        const directPath = typeof file.path === 'string' ? file.path : undefined;
        // 3. webUtils fallback for native <input> File objects (strict contextIsolation)
        const webUtilsPath = (!bridgePath && !directPath && electronAPI.localFiles?.getPathForFile)
          ? electronAPI.localFiles.getPathForFile(file)
          : undefined;

        return {
          name: file.name || '',
          path: bridgePath || directPath || webUtilsPath || '',
          clientPath: payload.clientPaths?.[i] || (file as any).webkitRelativePath || (file as any).clientPath || file.name || '',
          type: file.type || '',
          size: file.size || 0,
        };
      });

      try {
        response = await electronAPI.localFiles.startBatchIngest({
          token,
          apiUrl,
          files: serializableFiles,
          clientPaths: payload.clientPaths,
          folderId: payload.targetFolderId
        });
      } catch (err: any) {
        if (err.message && err.message.includes('[AxiosError]')) {
          try {
            const jsonStr = err.message.split('[AxiosError]')[1];
            const parsed = JSON.parse(jsonStr);
            return rejectWithValue(parsed); // Restored as a plain object resembling AxiosError
          } catch {
            return rejectWithValue(err.message);
          }
        }
        return rejectWithValue(err.message);
      }
    } else {
      response = await uploadService.uploadBatch(
        payload.files as File[],
        payload.clientPaths,
        payload.targetFolderId,
      );
    }

    // Update the sidebar's tree
    dispatch(fetchFolderTree());

    // Refetch page 1 of the current folder, preserving the active sort/search/tag.
    const state = getState();
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
      }),
    );

    return response;
  },
);

export const uploadTextDocument = createAppAsyncThunk(
  "document/uploadText",
  async (
    payload: string | { text: string; title?: string; targetFolderId?: string | null },
    { dispatch, getState },
  ) => {
    const text = typeof payload === "string" ? payload : payload.text;
    const title = typeof payload === "string" ? undefined : payload.title;
    const targetFolderId = typeof payload === "string" ? undefined : payload.targetFolderId;
    const response = await uploadService.processText(text, title, targetFolderId);

    // Refresh the sidebar so "Random files" folder appears immediately
    dispatch(fetchFolderTree());

    // Refetch page 1 of the current folder, preserving the active sort/search/tag.
    const state = getState();
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
    const p = currentState.library.lastFetchParams;
    dispatch(
      fetchFolderContents({
        folderId: p.folderId,
        page: 1,
        limit: p.limit || 50,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        search: p.search,
        tags: p.tags,
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

    const state: any = getState();
    const lastDocId = state.auth?.user?.lastActiveDocumentId;

    // 1. Clear lastActiveDocumentId if the active document is being directly deleted
    if (lastDocId && documentIds.includes(lastDocId)) {
      dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
      dispatch(updateProfile({ lastActiveDocumentId: null }));
    }

    // 2. Clear workspace if the active document is inside a folder being deleted
    if (lastDocId && !documentIds.includes(lastDocId) && folderIds.length > 0) {
      const activeDoc =
        state.library.globalDocumentsList?.find((d: any) => d._id === lastDocId) ||
        state.workspace.activeDocument;
      if (activeDoc?.folder) {
        const allAffectedFolderIds = new Set<string>();
        for (const fId of folderIds) {
          const queue = [fId];
          allAffectedFolderIds.add(fId);
          while (queue.length > 0) {
            const current = queue.shift()!;
            for (const folder of state.library.globalFolderTree || []) {
              if (folder.parentFolder === current && !allAffectedFolderIds.has(folder._id)) {
                allAffectedFolderIds.add(folder._id);
                queue.push(folder._id);
              }
            }
          }
        }
        if (allAffectedFolderIds.has(activeDoc.folder)) {
          dispatch({ type: "workspace/clearActiveDocument" });
          dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
          dispatch(updateProfile({ lastActiveDocumentId: null }));
        }
      }
    }

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
    const currentState: any = getState();
    const p = currentState.library.lastFetchParams;
    dispatch(
      fetchFolderContents({
        folderId: p.folderId,
        page: 1,
        limit: p.limit || 50,
        sortBy: p.sortBy,
        sortOrder: p.sortOrder,
        search: p.search,
        tags: p.tags,
      }),
    );

    return payload;
  },
);
