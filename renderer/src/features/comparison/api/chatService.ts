import { api } from "../../../lib/axios";

// Assume we have an axios instance or use base URL directly.
// We'll use the existing standard of calling /api endpoints relative to the proxy or full URL.
// The best practice in this project seems to be using axios directly with interceptors if any, 
// or fetching via full URL if standard axios is used. I'll use standard axios pointing to /api.

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

  sendMessage: async (docIdA: string, docIdB: string, message: string): Promise<ChatMessage> => {
    const response = await api.post(
      `/comparison/${docIdA}/${docIdB}/chat`,
      { message }
    );
    return response.data.data; // { role: 'assistant', content: '...' }
  },

  /**
   * Stream a message to the dual-document RAG
   */
  sendMessageStream: async (docIdA: string, docIdB: string, message: string, onChunk: (text: string) => void) => {
    const { ENV } = await import("../../../config/env");
    const token = localStorage.getItem("context_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${ENV.API_BASE_URL}/comparison/${docIdA}/${docIdB}/chat`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error("Failed to stream chat");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (reader) {
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.content !== undefined) {
                  onChunk(data.content);
                }
              } catch (e) {
                console.error("SSE Parse error", e, dataStr);
              }
            }
          }
        }
      }
    }
  }
};
