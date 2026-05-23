import { api } from "../../../lib/axios";

// Types for the comparison feature
export interface ComparisonData {
  synthesis: string;
  similarityPercentage: number;
  similarities: string[];
  differences: string[];
  uniqueToA: string[];
  uniqueToB: string[];
  _warning?: string; // Set by backend when a fallback model was used
}

export interface ComparisonResponse {
  doc1: { _id: string; title: string };
  doc2: { _id: string; title: string };
  comparison: ComparisonData;
}

// API Service
export const comparisonService = {
  compareDocuments: async (docId1: string, docId2: string): Promise<ComparisonResponse> => {
    const response = await api.post("/comparison/compare", {
      documentIds: [docId1, docId2],
    });
    return response.data.data;
  },
};