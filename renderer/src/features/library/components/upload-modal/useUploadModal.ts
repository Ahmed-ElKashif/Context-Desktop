import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { notify } from "../../../../components/ui/feedback/ToastEngine";
import {
  uploadBatchDocuments,
  uploadTextDocument,
  applySemanticFolders,
  clearProposedStructure,
} from "../../../../store/library/librarySlice";
import { resolveUniqueName } from "../../utils/tableUtils";
import { getDesktopFilesFromEvent, handleDesktopFolderSelect } from "@/lib/desktop-dropzone";

export interface UseUploadModalProps {
  onClose: () => void;
  externalFiles?: File[];
  externalPaths?: string[];
  onClearExternal?: () => void;
  onSuccess?: () => void;
  targetFolderId?: string | null;
  forceReorganize?: boolean;
}

export const useUploadModal = ({
  onClose,
  externalFiles = [],
  externalPaths = [],
  onClearExternal,
  onSuccess,
  targetFolderId,
  forceReorganize = false,
}: UseUploadModalProps) => {
  const dispatch = useAppDispatch();
  const {
    isUploading,
    proposedFolderUpdates,
    isApplyingFolders,
    globalFolderTree,
    documentsList,
  } = useAppSelector((state) => state.library);

  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isSnippetLoading, setIsSnippetLoading] = useState(false);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [localPaths, setLocalPaths] = useState<string[]>([]);

  const activeFiles = externalFiles.length > 0 ? externalFiles : localFiles;
  const activePaths = externalPaths.length > 0 ? externalPaths : localPaths;

  const hiddenFolderInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    dispatch(clearProposedStructure());
    setLocalFiles([]);
    setLocalPaths([]);
    setPastedText("");
    setSnippetTitle("");
    setIsSnippetLoading(false);
    onClearExternal?.();
    onClose();
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    if (acceptedFiles.length > 5) {
      notify("Upload rejected. You can only upload up to 5 files at a time. Please select specific files.", "error");
      return;
    }

    const filesToProcess = acceptedFiles;

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
      const res = await dispatch(
        uploadBatchDocuments({ files: activeFiles, clientPaths: activePaths, targetFolderId }),
      ).unwrap();
      
      let successMsg = "Saved to Your Folders!";
      if (res.skippedCount && res.skippedCount > 0 && res.skippedFiles) {
        let skippedText = res.skippedFiles.slice(0, 2).join(', ');
        if (res.skippedFiles.length > 2) {
          skippedText += ` and ${res.skippedFiles.length - 2} others`;
        }
        successMsg = `Saved ${res.data?.length || 0} files. Skipped duplicates: ${skippedText}.`;
      }

      if (res.warning) {
        notify(res.warning, "warning");
      } else {
        notify(successMsg, "success");
      }
      onSuccess?.();
      handleClose();
      //eslint-disable-next-line
    } catch (error: any) {
      let errorMessage = "Failed to process folder.";
      if (typeof error === 'string') errorMessage = error;
      else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (error.response.data.skippedFiles && error.response.data.skippedFiles.length > 0) {
          const skipped = error.response.data.skippedFiles;
          let skippedText = skipped.slice(0, 2).join(', ');
          if (skipped.length > 2) {
            skippedText += ` and ${skipped.length - 2} others`;
          }
          errorMessage += ` (${skippedText})`;
        }
      }
      else if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.message) errorMessage = error.message;
      notify(errorMessage, "error");
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) return;
    const startedAt = Date.now();
    setIsSnippetLoading(true);
    try {
      const res = await dispatch(
        uploadTextDocument({
          text: pastedText,
          title: snippetTitle.trim() || undefined,
          targetFolderId,
        }),
      ).unwrap();
      const remaining = Math.max(0, 3000 - (Date.now() - startedAt));
      await new Promise((resolve) => setTimeout(resolve, remaining));
      onSuccess?.();
      handleClose();
      if (res.warning) {
        notify(res.warning, "warning");
      } else {
        notify("Text snippet added to Context!", "success");
      }
      //eslint-disable-next-line
    } catch (error: any) {
      let errorMessage = "Failed to process text.";
      if (typeof error === 'string') errorMessage = error;
      else if (error?.response?.data?.message) errorMessage = error.response.data.message;
      else if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.message) errorMessage = error.message;
      notify(errorMessage, "error");
      setIsSnippetLoading(false);
    }
  };

  const handleAcceptAI = async () => {
    if (!proposedFolderUpdates) return;
    const toastId = "ai-upload-flow";
    notify("Applying new structure...", "info", toastId);

    try {
      await dispatch(applySemanticFolders({ updates: proposedFolderUpdates, force: forceReorganize })).unwrap();
      notify("Inbox Organized!", "success", toastId);
      onSuccess?.();
      handleClose();
      //eslint-disable-next-line
    } catch (error: any) {
      let errorMessage = "Failed to apply folders.";
      if (typeof error === 'string') errorMessage = error;
      else if (error?.response?.data?.message) errorMessage = error.response.data.message;
      else if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.message) errorMessage = error.message;
      notify(errorMessage, "error", toastId);
    }
  };

  const handleAcceptLocal = async () => {
    if (!proposedFolderUpdates) return;
    try {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.localFiles?.exportOrganizedFiles) {
        notify("Local export is only available in the Desktop App.", "error");
        return;
      }

      const toastId = "ai-export-flow";
      notify("Exporting organized files to your PC...", "info", toastId);

      // We only have documentIds in proposedFolderUpdates, so we need to fetch their URLs
      // In the new API structure, the backend doesn't have an endpoint for this, we just map them from documentsList
      const rawFiles = proposedFolderUpdates.map((update: any) => {
          let doc = documentsList.find((d: any) => d._id === update.documentId);
          
          const title = update.title || doc?.title || `File_${update.documentId}`;
          const relativePath = update.newPath && update.newPath !== "/"
              ? `${update.newPath}/${title}`
              : title;

          return {
            url: doc?.cloudinaryUrl || "",
            relativePath,
            localSourcePath: doc?.originalClientPath,
          };
      });

      const filesToExport = rawFiles.filter((f: any) => f.url || f.localSourcePath);

      if (filesToExport.length === 0) {
        notify("No files found to export.", "error", toastId);
        return;
      }

      const result = await electronAPI.localFiles.exportOrganizedFiles(
        filesToExport,
      );
      if (result?.success) {
        notify("Export Complete! Check your selected folder.", "success", toastId);
        onSuccess?.();
        handleClose();
      }
    } catch (err: any) {
      console.error("Local export error:", err);
      notify("Failed to export files to PC.", "error", "ai-export-flow");
    }
  };

  const handleNativeFolderSelect = async () => {
    try {
      const nativeFiles = await handleDesktopFolderSelect();
      if (nativeFiles) {
        onDrop(nativeFiles);
      }
    } catch (err: any) {
      console.error("Native folder select error:", err);
      notify("Failed to select folder.", "error");
    }
  };

  const handleManualFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files));
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
    getFilesFromEvent: getDesktopFilesFromEvent,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      // Excel & CSV Formats
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
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
    handleAcceptLocal,
    handleManualFolderSelect,
    handleNativeFolderSelect,
    determineFileType,

    // Refs
    hiddenFolderInputRef,

    // Dropzone state & handlers
    dropzone,
  };
};
