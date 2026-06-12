import { api } from "../../../lib/axios";
import { DocumentData } from "../../../store/library/librarySlice";

export const uploadService = {
  uploadBatch: async (files: File[], clientPaths: string[]): Promise<{ data: DocumentData[], warning?: string, skippedCount?: number, skippedFiles?: string[] }> => {
    
    // NATIVE DESKTOP UPLOAD HANDLER
    if ((window as any).electronAPI) {
      const token = await (window as any).electronAPI.store.get("context_token");
      
      // Extract the correct path whether it's a real File object or a pseudo-file object from our CLI args process
      const nativeFiles = files.map((f: any) => ({
        name: f.name,
        path: f.path || f.clientPath,
        clientPath: f.clientPath || f.name,
      }));

      // Check if we actually have absolute paths for the main process to use
      const hasAbsolutePaths = nativeFiles.every((f) => {
        // Absolute paths start with a drive letter (C:\), a network share (\\), or a slash (/)
        return f.path && (f.path.match(/^[a-zA-Z]:\\/) || f.path.startsWith("\\\\") || f.path.startsWith("/"));
      });

      if (hasAbsolutePaths) {
        // Start ingest via Main Process to bypass Chromium filesystem restrictions
        return await (window as any).electronAPI.localFiles.startBatchIngest({
          token,
          apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
          files: nativeFiles,
          clientPaths: clientPaths.length > 0 ? clientPaths : undefined
        });
      }
      // If we don't have absolute paths, fall through to Web Mode
    }

    // FALLBACK FOR WEB MODE
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    clientPaths.forEach((path) => formData.append("clientPaths", path));
    const response = await api.post("/documents/upload", formData);
    return response.data;
  },

  processText: async (text: string, title?: string): Promise<{ data: DocumentData[], warning?: string }> => {
    const response = await api.post("/documents/upload", {
      fileType: "TextSnippet",
      extractedText: text,
      title: title || undefined,
    });
    return response.data;
  },
};
