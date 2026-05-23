import { api } from "../../../lib/axios";
import { ComparisonResponse } from "./comparisonService";

export interface ComparisonHistoryItem {
  _id: string;
  titleA: string;
  titleB: string;
  customTitle?: string;
  createdAt: string;
}

export interface ComparisonRecord extends ComparisonHistoryItem {
  user: string;
  docIdA: string;
  docIdB: string;
  comparison: ComparisonResponse;
}

export const comparisonHistoryService = {
  // Get history list
  getHistory: async (): Promise<ComparisonHistoryItem[]> => {
    const response = await api.get('/comparison/history');
    return response.data.data;
  },

  // Get full record by ID
  getRecordById: async (id: string): Promise<ComparisonRecord> => {
    const response = await api.get(`/comparison/history/${id}`);
    return response.data.data;
  },

  // Save new record
  saveRecord: async (payload: {
    docIdA: string;
    docIdB: string;
    titleA: string;
    titleB: string;
    comparison: ComparisonResponse;
  }): Promise<ComparisonRecord> => {
    const response = await api.post('/comparison/history', payload);
    return response.data.data;
  },

  // Rename record
  renameRecord: async (id: string, customTitle: string): Promise<ComparisonRecord> => {
    const response = await api.patch(`/comparison/history/${id}`, { customTitle });
    return response.data.data;
  },

  // Delete record
  deleteRecord: async (id: string): Promise<void> => {
    await api.delete(`/comparison/history/${id}`);
  }
};
