import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  documentService,
  GetDocumentsParams,
} from "../features/dashboard/api/documentService";
import { fetchSettings } from "./settingsSlice";
import { updateUserLocalState, updateProfile } from "./authSlice";

export type DocumentType = "PDF" | "Word" | "Image" | "TextSnippet" | "Excel";
export type AIStatus = "Pending" | "Processing" | "Analyzed" | "Failed";
export type CognitiveLoad = "Light" | "Medium" | "Heavy";

export interface SemanticUpdate {
  documentId: string;
  newPath: string;
  title?: string;
  originalPath?: string;
}

export interface FolderData {
  _id: string;
  name: string;
  user: string;
  parentFolder: string | null;
  path: string;
  isAIGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentData {
  _id: string;
  user: string;
  title: string;
  fileType: DocumentType;
  aiStatus: AIStatus;
  cognitiveLoad: CognitiveLoad;
  summary?: string;
  tags: string[];
  extractedText?: string;

  // ☁️ Cloudinary (replaces the old local originalFilePath)
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;

  folder: string | null;
  originalClientPath?: string;
  semanticPath?: string;
  isOrganized?: boolean;

  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  activeDocument: DocumentData | null;
  uploadingFileType: DocumentType | null;

  currentFolder: FolderData | null;
  breadcrumbs: FolderData[];
  foldersList: FolderData[];
  globalFolderTree: FolderData[];

  documentsList: DocumentData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  } | null;
  isFetchingLibrary: boolean;

  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  isAnalyzingFolders: boolean;
  proposedFolderUpdates: SemanticUpdate[] | null;
  isApplyingFolders: boolean;

  isSynthesizing: boolean;
  synthesisResult: string | null;
}

const initialState: DocumentState = {
  activeDocument: null,
  uploadingFileType: null,

  currentFolder: null,
  breadcrumbs: [],
  foldersList: [],
  globalFolderTree: [],
  documentsList: [],
  pagination: null,
  isFetchingLibrary: false,

  isUploading: false,
  uploadProgress: 0,
  error: null,

  isAnalyzingFolders: false,
  proposedFolderUpdates: null,
  isApplyingFolders: false,

  isSynthesizing: false,
  synthesisResult: null,
};

// --- THUNKS ---

export const fetchLibraryDocuments = createAsyncThunk(
  "document/fetchLibrary",
  async (params: GetDocumentsParams | undefined, { rejectWithValue }) => {
    try {
      const response = await documentService.getDocuments(params);
      return response;
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return rejectWithValue(backendMessage || "Failed to fetch library");
    }
  },
);

export const fetchFolderContents = createAsyncThunk(
  "document/fetchFolderContents",
  async (
    params:
      | {
          folderId?: string;
          page?: number;
          limit?: number;
          search?: string;
          tags?: string;
          sortBy?: string; // 🛠️ THE FIX: Allow sortBy
          sortOrder?: string | number; // 🛠️ THE FIX: Allow sortOrder
        }
      | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await documentService.getFolderContents(params || {});
      return response;
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return rejectWithValue(
        backendMessage || "Failed to fetch folder contents",
      );
    }
  },
);

export const fetchFolderTree = createAsyncThunk(
  "document/fetchFolderTree",
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentService.getFolderTree();
      return response.data;
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return rejectWithValue(backendMessage || "Failed to fetch folder tree");
    }
  },
);

export const uploadBatchDocuments = createAsyncThunk(
  "document/uploadBatch",
  async (
    payload: { files: File[]; clientPaths: string[] },
    // 🛠️ THE FIX 1: Bring in `getState` so the thunk knows where we are!
    { dispatch, getState, rejectWithValue },
  ) => {
    try {
      const response = await documentService.uploadBatch(
        payload.files,
        payload.clientPaths,
      );

      // Update the sidebar's tree
      dispatch(fetchFolderTree());

      // 🛠️ THE FIX 2: Automatically refetch the current folder we are sitting in!
      const state = getState() as { document: DocumentState };
      const currentFolderId = state.document.currentFolder?._id;

      dispatch(
        fetchFolderContents({
          folderId: currentFolderId,
          page: 1,
          limit: 10,
        }),
      );

      return response;
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return rejectWithValue(backendMessage || "Failed to upload folder");
    }
  },
);

export const generateSemanticStructure = createAsyncThunk(
  "document/generateSemanticStructure",
  async (payload: { documents: DocumentData[]; folderIds?: string[] }, { dispatch, rejectWithValue }) => {
    try {
      // 🛠️ THE FIX: Strip out heavy fields like 'extractedText' before sending to backend.
      // The backend only needs the document ID to look up the summaries anyway.
      // This prevents the "413 Payload Too Large" error when organizing multiple documents.
      const lightweightPayload = {
        ...payload,
        documents: payload.documents?.map((doc) => ({
          _id: doc._id,
          id: doc._id,
          title: doc.title,
        })) as any, // Type assertion since we stripped required DocumentData fields
      };
      const response = await documentService.generateFolderStructure(lightweightPayload);
      dispatch(fetchSettings());
      return response.data.updates;
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      return rejectWithValue(
        backendMessage || "Failed to analyze folder structure",
      );
    }
  },
);

export const proposeGlobalFolderStructureThunk = createAsyncThunk(
  "document/proposeGlobalFolderStructure",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await documentService.proposeGlobalFolderStructure();
      dispatch(fetchSettings());
      // Return the whole response so UI gets both `message` and `data` (tree, etc.)
      return response;
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      return rejectWithValue(
        backendMessage || "Failed to propose global folder structure",
      );
    }
  },
);

export const applySemanticFolders = createAsyncThunk(
  "document/applySemanticFolders",
  // 🛠️ Bring in dispatch and getState!
  async (
    updates: SemanticUpdate[],
    { dispatch, getState, rejectWithValue },
  ) => {
    try {
      await documentService.applySemanticFolders(updates);

      // 🛠️ THE REFRESH MAGIC: Update the Sidebar!
      dispatch(fetchFolderTree());

      // 🛠️ THE REFRESH MAGIC: Update the Table View!
      const state = getState() as { document: DocumentState };
      const currentFolderId = state.document.currentFolder?._id;

      dispatch(
        fetchFolderContents({
          folderId: currentFolderId,
          page: 1,
          limit: 10,
        }),
      );

      return updates;
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      return rejectWithValue(
        backendMessage || "Failed to apply folder structure",
      );
    }
  },
);
export const uploadTextDocument = createAsyncThunk(
  "document/uploadText",
  // 🛠️ Mirror uploadBatchDocuments: bring in dispatch + getState so we can
  // refresh the sidebar tree AND the current folder view after saving.
  async (
    payload: string | { text: string; title?: string },
    { dispatch, getState, rejectWithValue },
  ) => {
    try {
      const text = typeof payload === "string" ? payload : payload.text;
      const title = typeof payload === "string" ? undefined : payload.title;
      const response = await documentService.processText(text, title);

      // ✅ Refresh the sidebar so "Random files" folder appears immediately
      dispatch(fetchFolderTree());

      // ✅ Refetch the folder the user is currently viewing so the table
      // updates without a manual page refresh.
      const state = getState() as { document: DocumentState };
      const currentFolderId = state.document.currentFolder?._id;
      dispatch(
        fetchFolderContents({ folderId: currentFolderId, page: 1, limit: 10 }),
      );

      dispatch(fetchSettings()); // Refresh AI budget!

      return response;
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      return rejectWithValue(backendMessage || "Failed to process text");
    }
  },
);

export const deleteDocumentThunk = createAsyncThunk(
  "document/delete",
  async (documentId: string, { dispatch, getState, rejectWithValue }) => {
    try {
      await documentService.deleteDocument(documentId);

      // Refresh sidebar folder tree
      dispatch(fetchFolderTree());

      // Refresh folder contents
      const state = getState() as any;
      const currentFolderId = state.document?.currentFolder?._id;
      dispatch(
        fetchFolderContents({
          folderId: currentFolderId,
          page: 1,
          limit: 10,
        }),
      );

      // Also clear lastActiveDocumentId from user profile if it was deleted
      if (state.auth?.user?.lastActiveDocumentId === documentId) {
        dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
        dispatch(updateProfile({ lastActiveDocumentId: null }));
      }

      return documentId;
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      return rejectWithValue(backendMessage || "Failed to delete document");
    }
  }
);

export const reloadDocumentThunk = createAsyncThunk(
  "document/reload",
  async (documentId: string, { rejectWithValue }) => {
    try {
      const doc = await documentService.getDocument(documentId);
      return doc;
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      return rejectWithValue(backendMessage || "Failed to reload document");
    }
  }
);

export const reanalyzeDocumentThunk = createAsyncThunk(
  "document/reanalyze",
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await documentService.reanalyzeDocument(documentId);
      return response.data;
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      return rejectWithValue(backendMessage || "Failed to reanalyze document");
    }
  },
);

export const synthesizeDocumentsThunk = createAsyncThunk(
  "document/synthesize",
  async (payload: { documentIds?: string[], folderIds?: string[] }, { dispatch, rejectWithValue, signal }) => {
    try {
      const response = await documentService.synthesizeDocuments(payload, signal);
      dispatch(fetchSettings());
      return response.data.summary;
    } catch (error: any) {
      if (error.name === 'CanceledError') {
        return rejectWithValue("Synthesis cancelled");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to synthesize documents");
    }
  }
);

// --- SLICE ---

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    setCurrentFolder: (state, action: PayloadAction<FolderData | null>) => {
      state.currentFolder = action.payload;
    },
    startUpload: (state, action: PayloadAction<DocumentType>) => {
      state.isUploading = true;
      state.uploadingFileType = action.payload;
      state.uploadProgress = 0;
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setActiveDocument: (state, action: PayloadAction<DocumentData>) => {
      state.activeDocument = action.payload;
      state.isUploading = false;
      state.uploadingFileType = null;
      state.uploadProgress = 100;
    },
    setDocumentError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isUploading = false;
    },
    clearActiveDocument: (state) => {
      state.activeDocument = null;
      state.uploadingFileType = null;
      state.isUploading = false;
      state.uploadProgress = 0;
      state.error = null;
    },
    clearProposedStructure: (state) => {
      state.proposedFolderUpdates = null;
    },
    clearSynthesisResult: (state) => {
      state.synthesisResult = null;
      state.isSynthesizing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryDocuments.pending, (state) => {
        state.isFetchingLibrary = true;
        state.error = null;
      })
      .addCase(fetchLibraryDocuments.fulfilled, (state, action) => {
        state.isFetchingLibrary = false;
        state.documentsList = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLibraryDocuments.rejected, (state, action) => {
        state.isFetchingLibrary = false;
        state.error = action.payload as string;
      })

      .addCase(fetchFolderContents.pending, (state) => {
        state.isFetchingLibrary = true;
        state.error = null;
        state.documentsList = [];
        state.foldersList = [];
      })
      .addCase(fetchFolderContents.fulfilled, (state, action) => {
        state.isFetchingLibrary = false;
        state.currentFolder = action.payload.data.currentFolder;
        state.breadcrumbs = action.payload.data.breadcrumbs || [];
        state.foldersList = action.payload.data.folders;
        state.documentsList = action.payload.data.documents;

        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchFolderContents.rejected, (state, action) => {
        state.isFetchingLibrary = false;
        state.error = action.payload as string;
      })

      .addCase(fetchFolderTree.fulfilled, (state, action) => {
        state.globalFolderTree = action.payload;
      })

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
          if (!state.activeDocument) {
            state.activeDocument = action.payload.data[0];
          }
          // 🛠️ BUG FIX: We MUST manually push the pending documents into documentsList synchronously!
          // If we don't, the SSE stream connection will be closed while waiting for `fetchFolderContents` to resolve,
          // causing the frontend to completely miss the AI "Analyzed" notifications for documents that finish quickly!
          // They will be safely overwritten by the true paginated data once fetchFolderContents finishes.
          state.documentsList = [...action.payload.data, ...state.documentsList];
        }
      })
      .addCase(uploadBatchDocuments.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      })

      .addCase(deleteDocumentThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.documentsList = state.documentsList.filter((doc) => doc._id !== deletedId);
        if (state.activeDocument?._id === deletedId) {
          state.activeDocument = null;
        }
        if (state.pagination) {
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        }
      })

      .addCase(generateSemanticStructure.pending, (state) => {
        state.isAnalyzingFolders = true;
        state.error = null;
      })
      .addCase(generateSemanticStructure.fulfilled, (state, action) => {
        state.isAnalyzingFolders = false;
        state.proposedFolderUpdates = action.payload;
      })
      .addCase(generateSemanticStructure.rejected, (state, action) => {
        state.isAnalyzingFolders = false;
        state.error = action.payload as string;
      })

      .addCase(applySemanticFolders.pending, (state) => {
        state.isApplyingFolders = true;
        state.error = null;
      })
      .addCase(applySemanticFolders.fulfilled, (state, action) => {
        state.isApplyingFolders = false;
        const updates = action.payload;

        state.documentsList = state.documentsList.map((doc) => {
          const matchedUpdate = updates.find((u) => u.documentId === doc._id);
          if (matchedUpdate) {
            return { ...doc, semanticPath: matchedUpdate.newPath };
          }
          return doc;
        });

        state.proposedFolderUpdates = null;
      })
      .addCase(applySemanticFolders.rejected, (state, action) => {
        state.isApplyingFolders = false;
        state.error = action.payload as string;
      })

      .addCase(uploadTextDocument.pending, (state) => {
        state.isUploading = true;
        state.error = null;
        state.uploadProgress = 50;
      })
      .addCase(uploadTextDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        if (action.payload?.data?.length > 0) {
          state.activeDocument = action.payload.data[0];
          state.documentsList = [...action.payload.data, ...state.documentsList];
        }
      })
      .addCase(uploadTextDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      })
      
      // --- Reanalyze Document ---
      .addCase(reanalyzeDocumentThunk.fulfilled, (state, action) => {
        if (state.activeDocument?._id === action.payload._id) {
          state.activeDocument = action.payload;
        }
        const index = state.documentsList.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.documentsList[index] = action.payload;
        }
      })
      .addCase(reloadDocumentThunk.fulfilled, (state, action) => {
        const updatedDoc = action.payload;
        if (state.activeDocument?._id === updatedDoc._id) {
          state.activeDocument = updatedDoc;
        }
        const index = state.documentsList.findIndex(d => d._id === updatedDoc._id);
        if (index !== -1) {
          state.documentsList[index] = updatedDoc;
        }
      })
      // 7. Global Propose
      .addCase(proposeGlobalFolderStructureThunk.pending, (state) => {
        state.isUploading = true; // Use this to show a loading state for the AI
        state.error = null;
      })
      .addCase(proposeGlobalFolderStructureThunk.fulfilled, (state, action) => {
        state.isUploading = false;
        const tree = action.payload?.data?.tree;
        if (Array.isArray(tree) && tree.length > 0) {
          const updates: SemanticUpdate[] = [];
          tree.forEach((topNode: any) => {
            if (Array.isArray(topNode.documentIds)) {
              topNode.documentIds.forEach((id: string) => {
                updates.push({ documentId: id, newPath: topNode.name });
              });
            }
            if (Array.isArray(topNode.subfolders)) {
              topNode.subfolders.forEach((sub: any) => {
                if (Array.isArray(sub.documentIds)) {
                  sub.documentIds.forEach((id: string) => {
                    updates.push({
                      documentId: id,
                      newPath: `${topNode.name}/${sub.name}`,
                    });
                  });
                }
              });
            }
          });
          state.proposedFolderUpdates = updates;
        }
      })
      .addCase(proposeGlobalFolderStructureThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      })
      // 9. Bulk Synthesize Documents
      .addCase(synthesizeDocumentsThunk.pending, (state) => {
        state.isSynthesizing = true;
        state.error = null;
        state.synthesisResult = null;
      })
      .addCase(synthesizeDocumentsThunk.fulfilled, (state, action) => {
        state.isSynthesizing = false;
        state.synthesisResult = action.payload;
      })
      .addCase(synthesizeDocumentsThunk.rejected, (state, action) => {
        state.isSynthesizing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUploading,
  setCurrentFolder,
  startUpload,
  setUploadProgress,
  setActiveDocument,
  setDocumentError,
  clearActiveDocument,
  clearProposedStructure,
  clearSynthesisResult,
} = documentSlice.actions;

export default documentSlice.reducer;
