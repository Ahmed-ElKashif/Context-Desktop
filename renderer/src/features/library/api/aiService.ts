import { api } from "../../../lib/axios";
import { ENV } from "../../../config/env";
import { DocumentData, SemanticUpdate } from "../../../store/library/librarySlice";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export const aiService = {
  generateFolderStructure: async (payload: { documents?: Partial<DocumentData>[]; folderIds?: string[] }): Promise<{ data: { updates: SemanticUpdate[] } }> => {
    const response = await api.post("/ai/organize-folder", payload);
    return response.data;
  },

  proposeGlobalFolderStructure: async (): Promise<{ message?: string; data: { tree: any[]; documentCount: number; wasCapped: boolean } }> => {
    const response = await api.post("/folders/propose");
    return response.data;
  },

  applySemanticFolders: async (updates: SemanticUpdate[]): Promise<void> => {
    const response = await api.put("/ai/apply-folders", { updates });
    return response.data;
  },

  synthesizeDocuments: async (payload: { documentIds?: string[]; folderIds?: string[] }, signal?: AbortSignal): Promise<{ data: { summary: string } }> => {
    const response = await api.post("/ai/synthesize", payload, { signal });
    return response.data;
  },

  getChatHistory: async (documentId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/documents/${documentId}/chat`);
    return response.data.data;
  },

  askQuestion: async (documentId: string, message: string) => {
    const response = await api.post(`/documents/${documentId}/chat`, { message });
    return { reply: response.data.data.content };
  },

  askQuestionStream: async (documentId: string, message: string, onChunk: (text: string) => void) => {
    const token = localStorage.getItem("context_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${ENV.API_BASE_URL}/documents/${documentId}/chat`, {
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
  },
};
