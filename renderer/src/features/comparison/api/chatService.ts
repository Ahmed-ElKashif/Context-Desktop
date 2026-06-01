import { api } from "../../../lib/axios";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export const chatService = {
  /**
   * Fetch chat history for a dual-document comparison session
   */
  getChatHistory: async (docIdA: string, docIdB: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/comparison/${docIdA}/${docIdB}/chat`);
    return response.data.data;
  },

  /**
   * Send a message to the dual-document RAG
   */
  sendMessage: async (docIdA: string, docIdB: string, message: string): Promise<ChatMessage> => {
    const response = await api.post(
      `/comparison/${docIdA}/${docIdB}/chat`,
      { message }
    );
    return response.data.data; // { role: 'assistant', content: '...' }
  }
};
