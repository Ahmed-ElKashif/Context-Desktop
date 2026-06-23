import { api } from "../../../lib/axios";
import { DocumentData, FolderData } from "../../../store/library/librarySlice";

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

export interface GetFolderContentsParams {
  folderId?: string;
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: string | number;
}

export const folderService = {
  createFolder: async (name: string, parentFolderId: string | null, color?: string): Promise<{ data: FolderData }> => {
    const response = await api.post("/folders", {
      name,
      parentFolder: parentFolderId ?? null,
      color: color ?? "yellow",
    });
    return response.data;
  },

  getFolderContents: async (params?: GetFolderContentsParams): Promise<FolderContentsResponse> => {
    const safeParams = params || {};
    const { folderId, ...queryParams } = safeParams; 
    const endpoint = folderId ? `/folders/${folderId}` : "/folders";
    const response = await api.get(endpoint, { params: queryParams });
    return response.data;
  },

  getFolderTree: async (): Promise<{ success: boolean; data: FolderData[] }> => {
    const response = await api.get("/folders/tree");
    return response.data;
  },

  deleteFolder: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  renameFolder: async (id: string, newName: string): Promise<void> => {
    await api.put(`/folders/${id}`, { name: newName });
  },

  setFolderColor: async (id: string, color: string): Promise<void> => {
    await api.put(`/folders/${id}`, { color });
  },

  downloadFolderZip: async (id: string): Promise<Blob> => {
    const response = await api.get(`/folders/${id}/download`, {
      responseType: 'blob',
      timeout: 0,
    });
    return response.data;
  },

  moveFolder: async (id: string, targetParentFolderId: string | null): Promise<void> => {
    await api.patch(`/folders/${id}/move`, { targetParentFolderId });
  },

  copyFolder: async (id: string, targetParentFolderId: string | null): Promise<FolderData> => {
    const response = await api.post(`/folders/${id}/copy`, { targetParentFolderId });
    return response.data.data;
  },
};
