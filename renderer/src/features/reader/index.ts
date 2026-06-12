import { api } from "../../lib/axios";
import { DocumentData } from "../../store/library/librarySlice";

export const readerService = {
  // 1. Fetch document metadata
  getDocumentDetails: async (id: string): Promise<DocumentData> => {
    const response = await api.get(`/documents/${id}`);
    return response.data.data;
  },
};