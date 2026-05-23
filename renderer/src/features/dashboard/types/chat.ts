export type MessageRole = "user" | "ai" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;

  // RAG (Retrieval-Augmented Generation) specific fields for the AI phase
  sources?: string[]; // Array of document sections or IDs cited by the AI

  createdAt: string; // ISO timestamp
}
