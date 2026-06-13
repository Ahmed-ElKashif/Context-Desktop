import { createAppAsyncThunk } from "../../hooks";
import { aiService } from "../../../features/library/api/aiService";
import { fetchFolderTree, fetchFolderContents } from "./folderThunks";
import { fetchSettings } from "../../settings/settingsSlice";
import { DocumentData, SemanticUpdate } from "../librarySlice";

export const generateSemanticStructure = createAppAsyncThunk(
  "document/generateSemanticStructure",
  async (
    payload: { documents: DocumentData[]; folderIds?: string[] },
    { dispatch },
  ) => {
    const lightweightPayload = {
      ...payload,
      documents: payload.documents?.map((doc) => ({
    _id: doc._id,
    id: doc._id,
    title: doc.title,
      })),
    };
    const response =
      await aiService.generateFolderStructure(lightweightPayload);
    dispatch(fetchSettings());
    return response.data.updates;
  },
);

export const applySemanticFolders = createAppAsyncThunk(
  "document/applySemanticFolders",
  async (updates: SemanticUpdate[], { dispatch, getState }) => {
    await aiService.applySemanticFolders(updates);
    dispatch(fetchFolderTree());
    const state = getState();
    const currentFolderId = state.library?.currentFolder?._id;
    dispatch(fetchFolderContents({ folderId: currentFolderId, page: 1, limit: 10 }));
    return;
  }
);

export const proposeGlobalFolderStructureThunk = createAppAsyncThunk(
  "document/proposeGlobalFolderStructure",
  async (_, { dispatch }) => {
    const response = await aiService.proposeGlobalFolderStructure();
    dispatch(fetchSettings());
    return response;
  }
);

export const synthesizeDocumentsThunk = createAppAsyncThunk(
  "document/synthesize",
  async (payload: { documentIds?: string[]; folderIds?: string[] }, { dispatch, getState }) => {
    const response = await aiService.synthesizeDocuments(payload);
    dispatch(fetchSettings());
    dispatch(fetchFolderTree());
    const state = getState();
    const currentFolderId = state.library?.currentFolder?._id;
    dispatch(fetchFolderContents({ folderId: currentFolderId, page: 1, limit: 10 }));
    return response.data;
  }
);
