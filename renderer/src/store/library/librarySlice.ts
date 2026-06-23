import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { buildFetchReducers } from "./reducers/fetchReducers";
import { buildMutationReducers } from "./reducers/mutationReducers";
import { buildAIReducers } from "./reducers/aiReducers";

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
  itemCount?: number;
  isAIGenerated?: boolean;
  color?: string;
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
  prettifiedJson?: any | null;

  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryState {
  uploadingFileType: DocumentType | null;

  currentFolder: FolderData | null;
  breadcrumbs: FolderData[];
  foldersList: FolderData[];
  globalFolderTree: FolderData[];

  documentsList: DocumentData[];
  globalDocumentsList: DocumentData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  } | null;

  /** Mirrors the params of the most recent fetchFolderContents call so that
   *  post-upload refetches can reproduce the exact same query. */
  lastFetchParams: {
    folderId?: string;
    search?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit: number;
  };

  isFetchingLibrary: boolean;
  isRevalidating: boolean; // True when showing cached data but fetching fresh data in background

  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  isAnalyzingFolders: boolean;
  proposedFolderUpdates: SemanticUpdate[] | null;
  isApplyingFolders: boolean;

  isSynthesizing: boolean;
  synthesisResult: string | null;

  folderCache: Record<string, {
    documentsList: DocumentData[];
    foldersList: FolderData[];
    breadcrumbs: FolderData[];
    pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; } | null;
    timestamp: number;
  }>;
}

const initialState: LibraryState = {
  uploadingFileType: null,

  currentFolder: null,
  breadcrumbs: [],
  foldersList: [],
  globalFolderTree: [],
  documentsList: [],
  globalDocumentsList: [],
  pagination: null,
  lastFetchParams: { limit: 50 },
  isFetchingLibrary: false,
  isRevalidating: false,

  isUploading: false,
  uploadProgress: 0,
  error: null,

  isAnalyzingFolders: false,
  proposedFolderUpdates: null,
  isApplyingFolders: false,

  isSynthesizing: false,
  synthesisResult: null,
  folderCache: {},
};

// --- THUNKS ---
export * from "./thunks/documentThunks";
export * from "./thunks/folderThunks";
export * from "./thunks/aiThunks";
export * from "./thunks/sseThunks";



// --- SLICE ---

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    startUpload: (state, action: PayloadAction<DocumentType>) => {
      state.isUploading = true;
      state.uploadingFileType = action.payload;
      state.uploadProgress = 0;
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setDocumentError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isUploading = false;
    },
    clearProposedStructure: (state) => {
      state.proposedFolderUpdates = null;
    },
    clearSynthesisResult: (state) => {
      state.synthesisResult = null;
      state.isSynthesizing = false;
    },
    updateDocumentPrettifyResult: (state, action: PayloadAction<{ documentId: string; prettifiedJson: any }>) => {
      const { documentId, prettifiedJson } = action.payload;
      const docIndex = state.documentsList.findIndex((d) => d._id === documentId);
      if (docIndex !== -1) {
        state.documentsList[docIndex].prettifiedJson = prettifiedJson;
      }
    },
  },
  extraReducers: (builder) => {
    buildFetchReducers(builder);
    buildMutationReducers(builder);
    buildAIReducers(builder);
  },
});

export const {
  startUpload,
  setUploadProgress,
  setDocumentError,
  clearProposedStructure,
  clearSynthesisResult,
  updateDocumentPrettifyResult,
} = librarySlice.actions;

export default librarySlice.reducer;
export * from "./thunks/documentThunks";
export * from "./thunks/folderThunks";
export * from "./thunks/aiThunks";
