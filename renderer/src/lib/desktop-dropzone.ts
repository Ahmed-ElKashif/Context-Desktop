/**
 * Global Desktop Bridge Utility
 * Centralizes secure file extraction, OS folder selection, and Prototype Bridging
 * across all Desktop UI dropzones (Library, Upload Modal, Onboarding).
 */

export const extractPathsFromEvent = (files: FileList | File[] | null | undefined): string[] => {
  if (!files || files.length === 0) return [];

  return Array.from(files)
    .map((f: any) => {
      // 1. Standard HTML5 Path (fallback if webSecurity is loose)
      if (f.path) return f.path;
      // 2. Secure Electron webUtils Bridge (strict contextIsolation)
      if ((window as any).electronAPI?.localFiles?.getPathForFile) {
        return (window as any).electronAPI.localFiles.getPathForFile(f);
      }
      return "";
    })
    .filter(Boolean);
};

export const applyPrototypeBridge = (fakeFiles: any[]): File[] => {
  if (!fakeFiles || fakeFiles.length === 0) return [];

  return fakeFiles.map((f: any) => {
    // Big Tech Prototype Bridge: Wrap fake JSON inside a native File
    const file = new File([], f.name, { type: f.type || "" });
    // Forcibly inject the native OS metadata into the DOM object
    Object.defineProperty(file, "path", { value: f.path });
    Object.defineProperty(file, "size", { value: f.size || 0 });
    Object.defineProperty(file, "webkitRelativePath", { value: f.clientPath || f.name });
    Object.defineProperty(file, "isNativeFile", { value: true });
    return file;
  }) as unknown as File[];
};

export const getDesktopFilesFromEvent = async (event: any): Promise<File[]> => {
  try {
    const files = event.dataTransfer ? event.dataTransfer.files : event.target?.files;
    const paths = extractPathsFromEvent(files);

    if (paths.length > 0 && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.localFiles.processDroppedPaths(paths);
      if (result && result.files) {
        return applyPrototypeBridge(result.files);
      }
    }
  } catch (err) {
    console.error("Error processing dropped files via desktop bridge:", err);
  }
  return [];
};

export const handleDesktopFolderSelect = async (): Promise<File[] | null> => {
  try {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.localFiles?.selectBatchFolder) return null;

    const result = await electronAPI.localFiles.selectBatchFolder();
    if (!result || !result.files || result.files.length === 0) return null;

    return applyPrototypeBridge(result.files);
  } catch (err) {
    console.error("Error selecting folder via desktop bridge:", err);
    return null;
  }
};
