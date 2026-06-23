import { api } from "../../../lib/axios";
import { DocumentData } from "../../../store/library/librarySlice";

export const uploadService = {
  uploadBatch: async (files: File[], clientPaths: string[], targetFolderId?: string | null): Promise<{ data: DocumentData[], warning?: string, skippedCount?: number, skippedFiles?: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    clientPaths.forEach((path) => formData.append("clientPaths", path));
    if (targetFolderId) {
      formData.append("folderId", targetFolderId);
    }
    const response = await api.post("/documents/upload", formData);
    return response.data;
  },

  processText: async (text: string, title?: string, targetFolderId?: string | null): Promise<{ data: DocumentData[], warning?: string }> => {
    const payload: any = {
      fileType: "TextSnippet",
      extractedText: text,
      title: title || undefined,
    };
    if (targetFolderId) {
      payload.folderId = targetFolderId;
    }
    const response = await api.post("/documents/upload", payload);
    return response.data;
  },
};
