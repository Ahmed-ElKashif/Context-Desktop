import { api } from "../../../lib/axios";

export interface SemanticSearchResult {
  text: string;
  confidenceScore: number;
  documentId: string;
  documentTitle: string;
  documentType: string;
  documentUrl: string | null;
  chunkIndex: number;
}

export interface SearchResponse {
  success: boolean;
  count: number;
  data: SemanticSearchResult[];
}

export const searchService = {
  searchDocuments: async (query: string, limit = 5): Promise<SearchResponse> => {
    const response = await api.get(`/ai/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },
};
