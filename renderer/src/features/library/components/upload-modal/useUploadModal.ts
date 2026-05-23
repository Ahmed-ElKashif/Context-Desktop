import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { notify } from "../../../../components/ui/ToastEngine";
import {
  uploadBatchDocuments,
  uploadTextDocument,
  applySemanticFolders,
  clearProposedStructure,
} from "../../../../store/documentSlice";
import { resolveUniqueName } from "../../utils/tableUtils";

export interface UseUploadModalProps {
  onClose: () => void;
  externalFiles?: File[];
  externalPaths?: string[];
  onClearExternal?: () => void;
  onSuccess?: () => void;
}

export const useUploadModal = ({
  onClose,
  externalFiles = [],
  externalPaths = [],
  onClearExternal,
  onSuccess,
}: UseUploadModalProps) => {
  const dispatch = useAppDispatch();
  const {
    isUploading,
    proposedFolderUpdates,
    isApplyingFolders,
    globalFolderTree,
    documentsList,
  } = useAppSelector((state) => state.document);

  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isSnippetLoading, setIsSnippetLoading] = useState(false);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [localPaths, setLocalPaths] = useState<string[]>([]);

  const activeFiles = externalFiles.length > 0 ? externalFiles : localFiles;
  const activePaths = externalPaths.length > 0 ? externalPaths : localPaths;

  // Batch Folder Progress State
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentFileName: string } | null>(null);

  const hiddenFolderInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    dispatch(clearProposedStructure());
    setLocalFiles([]);
    setLocalPaths([]);
    setPastedText("");
    setSnippetTitle("");
    setIsSnippetLoading(false);
    setBatchProgress(null);
    onClearExternal?.();
    onClose();
  };

  const startSequentialUpload = async (files: any[], folderPath: string) => {
    const electronAPI = (window as any).electronAPI;
    setBatchProgress({ current: 0, total: files.length, currentFileName: "" });

    // Sequential process to prevent memory overload
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBatchProgress({ current: i + 1, total: files.length, currentFileName: file.name });
      
      try {
        const buffer = await electronAPI.localFiles.readFileBuffer(file.path);
        const browserFile = new File([buffer], file.name, { type: file.mimeType });
        
        await dispatch(
          uploadBatchDocuments({ files: [browserFile], clientPaths: [file.clientPath] })
        ).unwrap();
      } catch (fileErr: any) {
        console.error(`Failed to upload ${file.name}:`, fileErr);
      }
    }

    notify(`Successfully ingested ${files.length} files from ${folderPath}`, "success");
    onSuccess?.();
    handleClose();
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const electronAPI = (window as any).electronAPI;
    // Native Electron mode: send all dropped absolute paths to the Main process to properly walk folders natively.
    if (electronAPI?.localFiles?.processDroppedPaths) {
      const paths = acceptedFiles.map((f: any) => f.path).filter(Boolean);
      if (paths.length > 0) {
        try {
          const result = await electronAPI.localFiles.processDroppedPaths(paths);
          if (result && result.files && result.files.length > 0) {
            await startSequentialUpload(result.files, "Dropped Context");
            return;
          }
        } catch (e) {
          console.error("Dropped paths processing error:", e);
          notify("Failed to process dropped files natively.", "error");
        }
      }
    }

    // Web Browser fallback
    const filesToProcess = acceptedFiles.slice(0, 10);

    const rawPaths = filesToProcess.map((file: any) => {
      if (file.webkitRelativePath) return file.webkitRelativePath;
      if (file.path) return file.path.replace(/^\//, "");
      return file.name;
    });

    const isFolderUpload = rawPaths.some((p) => p.includes("/"));

    if (isFolderUpload) {
      const originalRootFolder = rawPaths[0].split("/")[0];

      const takenRootFolderNames = new Set<string>(
        globalFolderTree
          .filter((f) => f.parentFolder === null)
          .map((f) => f.name.toLowerCase()),
      );

      const uniqueRootFolder = resolveUniqueName(
        originalRootFolder,
        takenRootFolderNames,
      );

      const renamedPaths = rawPaths.map((p) => {
        const segments = p.split("/");
        if (segments[0] === originalRootFolder) segments[0] = uniqueRootFolder;
        return segments.join("/");
      });

      setLocalFiles(filesToProcess);
      setLocalPaths(renamedPaths);
      return;
    }

    setLocalFiles(filesToProcess);
    setLocalPaths(rawPaths);
  };

  const onDropRejected = (fileRejections: any[]) => {
    const error = fileRejections[0]?.errors[0]?.message || "Invalid file.";
    notify(`Upload failed: ${error}`, "error");
  };

  const handleUploadToYourFolders = async () => {
    try {
      await dispatch(
        uploadBatchDocuments({ files: activeFiles, clientPaths: activePaths }),
      ).unwrap();
      notify("Saved to Your Folders!", "success");
      onSuccess?.();
      handleClose();
      //eslint-disable-next-line
    } catch (error: any) {
      notify(error || "Failed to process folder.", "error");
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) return;
    const startedAt = Date.now();
    setIsSnippetLoading(true);
    try {
      await dispatch(
        uploadTextDocument({
          text: pastedText,
          title: snippetTitle.trim() || undefined,
        }),
      ).unwrap();
      const remaining = Math.max(0, 3000 - (Date.now() - startedAt));
      await new Promise((resolve) => setTimeout(resolve, remaining));
      onSuccess?.();
      handleClose();
      notify("Text snippet added to Context!", "success");
      //eslint-disable-next-line
    } catch (error: any) {
      notify(error || "Failed to process text.", "error");
      setIsSnippetLoading(false);
    }
  };

  const handleAcceptAI = async () => {
    if (!proposedFolderUpdates) return;
    const toastId = "ai-upload-flow";
    notify("Applying new structure...", "info", toastId);

    try {
      await dispatch(applySemanticFolders(proposedFolderUpdates)).unwrap();
      notify("Inbox Organized!", "success", toastId);
      onSuccess?.();
      handleClose();
      //eslint-disable-next-line
    } catch (error: any) {
      notify("Failed to apply folders.", "error", toastId);
    }
  };

  const handleManualFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files));
    }
  };

  const handleNativeFolderSelect = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.localFiles?.selectBatchFolder) {
        // Fallback for browser testing
        hiddenFolderInputRef.current?.click();
        return;
      }

      const result = await electronAPI.localFiles.selectBatchFolder();
      if (!result || !result.files || result.files.length === 0) return;

      const { files, folderPath } = result;
      await startSequentialUpload(files, folderPath);

    } catch (err: any) {
      console.error("Native folder select error:", err);
      notify("Failed to read folder recursively.", "error");
      setBatchProgress(null);
    }
  };

  const wordCount = pastedText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const determineFileType = (file: File) => {
    if (file.type.startsWith("image/")) return "Image";
    return "Document";
  };

  const dropzone = useDropzone({
    onDrop,
    onDropRejected,
    maxSize: 10 * 1024 * 1024,
    disabled: isUploading,
    noClick: true,
    noKeyboard: true,
  });

  return {
    // Redux State
    isUploading,
    proposedFolderUpdates,
    isApplyingFolders,
    globalFolderTree,
    documentsList,

    // Local State
    activeTab,
    setActiveTab,
    pastedText,
    setPastedText,
    snippetTitle,
    setSnippetTitle,
    isSnippetLoading,
    activeFiles,
    activePaths,
    wordCount,

    // Handlers
    handleClose,
    handleUploadToYourFolders,
    handleTextSubmit,
    handleAcceptAI,
    handleManualFolderSelect,
    handleNativeFolderSelect,
    determineFileType,

    // Refs
    hiddenFolderInputRef,
    batchProgress,

    // Dropzone state & handlers
    dropzone,
  };
};
