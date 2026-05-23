import axios from "axios";

// Assume we have an axios instance or use base URL directly.
// We'll use the existing standard of calling /api endpoints relative to the proxy or full URL.
// The best practice in this project seems to be using axios directly with interceptors if any, 
// or fetching via full URL if standard axios is used. I'll use standard axios pointing to /api.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export const chatService = {
  /**
   * Fetch chat history for a dual-document comparison session
   */
  getChatHistory: async (docIdA: string, docIdB: string, token: string): Promise<ChatMessage[]> => {
    const response = await axios.get(`${API_URL}/comparison/${docIdA}/${docIdB}/chat`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  },

  /**
   * Send a message to the dual-document RAG
   */
  sendMessage: async (docIdA: string, docIdB: string, message: string, token: string): Promise<ChatMessage> => {
    const response = await axios.post(
      `${API_URL}/comparison/${docIdA}/${docIdB}/chat`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data; // { role: 'assistant', content: '...' }
  }
};
