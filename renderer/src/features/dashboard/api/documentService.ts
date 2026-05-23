import { api } from "../../../lib/axios";
import {
  DocumentData,
  SemanticUpdate,
  FolderData,
} from "../../../store/documentSlice";

// --- Interfaces ---
export interface PaginatedDocumentResponse {
  success: boolean;
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  data: DocumentData[];
}

export interface FolderContentsResponse {
  success: boolean;
  data: {
    currentFolder: FolderData | null;
    breadcrumbs: FolderData[]; 
    folders: FolderData[];
    documents: DocumentData[];
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

// 🛠️ THE FIX IS HERE: Allow sorting and filtering variables!
export interface GetFolderContentsParams {
  folderId?: string;
  page?: number;
  limit?: number;
  search?: string;              // 👈 إضافة للبحث
  tags?: string;                // 👈 إضافة للفلترة
  sortBy?: string;              // 👈 إضافة لترتيب الأعمدة
  sortOrder?: string | number;  // 👈 إضافة لاتجاه الترتيب (تصاعدي/تنازلي)
}

export interface GetDocumentsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  tags?: string;
  fileType?: string;
  cognitiveLoad?: string;
  semanticPath?: string;
  originalClientPath?: string;
}

export const documentService = {
  // 1. Get all documents (Legacy Flat List)
  getDocuments: async (
    params?: GetDocumentsParams,
  ): Promise<PaginatedDocumentResponse> => {
    const response = await api.get("/documents", { params });
    return response.data;
  },

  // 2. Get specific folder contents (Now fully supports Sorting & Pagination)
  getFolderContents: async (
    params?: GetFolderContentsParams,
  ): Promise<FolderContentsResponse> => {
    const safeParams = params || {};
    const { folderId, ...queryParams } = safeParams; 
    // 💡 Because you used ...queryParams, Axios will automatically send sortBy and sortOrder in the URL!
    const endpoint = folderId ? `/folders/${folderId}` : "/folders";

    const response = await api.get(endpoint, { params: queryParams });
    return response.data;
  },

  // 3. Get Global Folder Tree for the Sidebar
  getFolderTree: async (): Promise<{
    success: boolean;
    data: FolderData[];
  }> => {
    const response = await api.get("/folders/tree");
    return response.data;
  },

  // 4. Get a single document by ID
  getDocument: async (id: string): Promise<DocumentData> => {
    const response = await api.get(`/documents/${id}`);
    return response.data.data;
  },

  // 5. Upload Batch of Files (Folders)
  uploadBatch: async (
    files: File[],
    clientPaths: string[],
  ): Promise<{ data: DocumentData[] }> => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    clientPaths.forEach((path) => {
      formData.append("clientPaths", path);
    });

    const response = await api.post("/documents/upload", formData);
    return response.data;
  },

  // 6. Paste Text
  processText: async (text: string, title?: string): Promise<{ data: DocumentData[] }> => {
    const response = await api.post("/documents/upload", {
      fileType: "TextSnippet",
      extractedText: text,
      title: title || undefined,
    });
    return response.data;
  },

  // 7. Ask the AI to generate the folder tree for specific documents and/or folders
  generateFolderStructure: async (
    payload: { documents?: DocumentData[]; folderIds?: string[] }
  ): Promise<{ data: { updates: SemanticUpdate[] } }> => {
    const response = await api.post("/ai/organize-folder", payload);
    return response.data;
  },

  // 7.5 Ask the AI to propose a global folder tree for ALL unorganized documents
  proposeGlobalFolderStructure: async (): Promise<{ message?: string; data: { tree: any[]; documentCount: number; wasCapped: boolean } }> => {
    const response = await api.post("/folders/propose");
    return response.data;
  },

  // 8. Physically create folders and apply them via the new endpoint!
  applySemanticFolders: async (updates: SemanticUpdate[]): Promise<void> => {
    const response = await api.put("/ai/apply-folders", { updates });
    return response.data;
  },

  // 9. Update Document Metadata
  updateDocument: async (
    id: string,
    updates: Partial<DocumentData>,
  ): Promise<DocumentData> => {
    const response = await api.put(`/documents/${id}`, updates);
    return response.data.data;
  },

  // 10. Delete Document
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  // 11. Delete entire folder (Now uses Folder ID)
  deleteFolder: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  // 12. Rename entire folder (Now uses Folder ID)
  renameFolder: async (id: string, newName: string): Promise<void> => {
    await api.put(`/folders/${id}/rename`, { newName });
  },

  // 13. Bulk Delete Documents
  bulkDeleteDocuments: async (ids: string[]): Promise<void> => {
    await api.delete("/documents/bulk", { data: { ids } });
  },

  // 14. Reanalyze Document
  reanalyzeDocument: async (id: string): Promise<{ data: DocumentData }> => {
    const response = await api.post(`/documents/${id}/reanalyze`);
    return response.data;
  },
  // 14. Get lightweight status of specific documents
  getDocumentStatuses: async (ids: string[]): Promise<{ data: { _id: string; title: string; aiStatus: string; tags?: string[]; cognitiveLoad?: string }[] }> => {
    const response = await api.get(`/documents/status?ids=${ids.join(",")}`);
    return response.data;
  },

  // 15. Synthesize Multiple Documents (AI)
  synthesizeDocuments: async (payload: { documentIds?: string[]; folderIds?: string[] }, signal?: AbortSignal): Promise<{ data: { summary: string } }> => {
    const response = await api.post("/ai/synthesize", payload, { signal });
    return response.data;
  },

  // 16. Fetch RAG chat history for a specific document
  getChatHistory: async (documentId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/documents/${documentId}/chat`);
    return response.data.data;
  },

  // 17. Send a new RAG question to the document AI
  askQuestion: async (documentId: string, message: string) => {
    const response = await api.post(`/documents/${documentId}/chat`, { message });
    return { reply: response.data.data.content };
  },

  // 18. Download folder zip
  downloadFolderZip: async (id: string): Promise<void> => {
    const token = await (window as any).electronAPI.store.get("context_token");
    const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
    
    // We pass the token via query params (supported by backend auth middleware)
    // This allows the browser to natively handle the chunked stream without JS intervention!
    const downloadUrl = `${baseURL}/folders/${id}/download?token=${token}`;
    
    // Use window.location.assign to trigger the download. 
    // Since the backend sends Content-Disposition: attachment, the browser will NOT navigate away from the page,
    // but will instead intercept the request and pop up the native Save File dialog.
    // This is 100% foolproof across Safari, Firefox, Chrome, Brave, and Mobile browsers.
    window.location.assign(downloadUrl);
  },
};