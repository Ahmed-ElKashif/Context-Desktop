import { api } from "../../../lib/axios";
import { DocumentData } from "../../../store/library/librarySlice";

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
  getDocuments: async (params?: GetDocumentsParams): Promise<PaginatedDocumentResponse> => {
    const response = await api.get("/documents", { params });
    return response.data;
  },

  getDocument: async (id: string): Promise<DocumentData> => {
    const response = await api.get(`/documents/${id}`);
    return response.data.data;
  },

  updateDocument: async (id: string, updates: Partial<DocumentData>): Promise<DocumentData> => {
    const response = await api.put(`/documents/${id}`, updates);
    return response.data.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  bulkDeleteDocuments: async (ids: string[]): Promise<void> => {
    await api.delete("/documents/bulk", { data: { ids } });
  },

  reanalyzeDocument: async (id: string): Promise<{ data: DocumentData }> => {
    const response = await api.post(`/documents/${id}/reanalyze`);
    return response.data;
  },

  getDocumentStatuses: async (ids: string[]): Promise<{ data: { _id: string; title: string; aiStatus: string; tags?: string[]; cognitiveLoad?: string }[] }> => {
    const response = await api.get(`/documents/status?ids=${ids.join(",")}`);
    return response.data;
  },

  downloadBulkZip: async (documentIds: string[], folderIds?: string[]): Promise<Blob> => {
    const response = await api.post("/documents/download-bulk", { documentIds, folderIds }, {
      responseType: 'blob',
      timeout: 0,
    });
    return response.data;
  },

  copyDocument: async (id: string, targetFolderId: string | null): Promise<DocumentData> => {
    const response = await api.post(`/documents/${id}/copy`, { targetFolderId });
    return response.data.data;
  },
};
