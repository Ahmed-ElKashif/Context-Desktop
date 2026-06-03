import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { notify } from "../../../../components/ui/ToastEngine";
import {
  uploadBatchDocuments,
  uploadTextDocument,
  applySemanticFolders,
  clearProposedStructure,
  setUploading,
  fetchFolderTree,
  fetchFolderContents,
  setActiveDocument,
} from "../../../../store/documentSlice";
import { resolveUniqueName } from "../../utils/tableUtils";
import { documentService } from "../../../dashboard/api/documentService";
import { addNotification } from "../../../../store/notificationSlice";

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
    currentFolder,
  } = useAppSelector((state) => state.document);
  const { token } = useAppSelector((state: any) => state.auth);

  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isSnippetLoading, setIsSnippetLoading] = useState(false);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [localPaths, setLocalPaths] = useState<string[]>([]);

  const activeFiles = externalFiles.length > 0 ? externalFiles : localFiles;
  const activePaths = externalFiles.length > 0 ? externalPaths : localPaths;

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

  // Process externalPaths when they arrive via prop (from context-menu "Upload to Context")
  useEffect(() => {
    if (!externalPaths || externalPaths.length === 0) return;
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.localFiles?.processDroppedPaths) return;

    (async () => {
      try {
        const result =
          await electronAPI.localFiles.processDroppedPaths(externalPaths);
        if (result && result.files && result.files.length > 0) {
          const fakeFiles = result.files.map((f: any) => ({
            name: f.name,
            path: f.path,
            size: f.size || 0,
            type: f.type || "",
            isNativeFile: true,
          }));
          setLocalFiles(fakeFiles as any as File[]);
          setLocalPaths(
            result.files.map(
              (f: any) => f.clientPath || f.webkitRelativePath || f.path || f.name,
            ),
          );
        } else {
          notify("No supported files found in this selection.", "warning");
          handleClose();
        }
      } catch (err) {
        console.error("Failed to process external upload paths:", err);
        notify("Failed to process folder natively.", "error");
        handleClose();
      }
    })();
  }, [externalPaths]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

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
      const existingNames = new Set(
        documentsList.map((d: any) => (d.title || "").toLowerCase()),
      );
      const duplicates = activeFiles.filter((f) =>
        existingNames.has(f.name.toLowerCase()),
      );

      if (duplicates.length > 0) {
        notify(
          `Duplicate not permitted: "${duplicates[0].name}" already exists in Context.`,
          "error",
        );
        return;
      }

      const isNativeUpload = activeFiles.some((f: any) => f.isNativeFile);

      if (isNativeUpload) {
        const electronAPI = (window as any).electronAPI;
        if (electronAPI?.localFiles?.startBatchIngest) {
          dispatch(setUploading(true));
          
          try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            
            // Pass the current folder ID if we are inside a folder
            const currentFolderId = currentFolder?._id;
            
            const response = await electronAPI.localFiles.startBatchIngest({
              token,
              apiUrl,
              files: activeFiles,
              clientPaths: activePaths,
              folderId: currentFolderId,
            });
            
            // If the backend returned documents, set the first one as active
            // so the SSE listener tracks it and fires the notification/sound.
            if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
              dispatch(setActiveDocument(response.data[0]));
            } else if (response?.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
              dispatch(setActiveDocument(response.data.data[0]));
            }
            
            // Refresh the sidebar tree
            dispatch(fetchFolderTree() as any);
            
            // Refresh the current folder view
            dispatch(fetchFolderContents({ 
              folderId: currentFolderId, 
              page: 1, 
              limit: 10 
            }) as any);
            
            dispatch(addNotification("Saved to Your Folders!"));
            onSuccess?.();
            handleClose();
          } catch (err: any) {
            notify(err.message || "Failed to upload natively.", "error");
          } finally {
            dispatch(setUploading(false));
          }
          return;
        }
      }

      await dispatch(
        uploadBatchDocuments({ files: activeFiles, clientPaths: activePaths }),
      ).unwrap();
      dispatch(addNotification("Saved to Your Folders!"));
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
      dispatch(addNotification("Text snippet added to Context!"));
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
      dispatch(addNotification("Inbox Organized!"));
      onSuccess?.();
      handleClose();
      //eslint-disable-next-line
    } catch (error: any) {
      notify("Failed to apply folders.", "error", toastId);
    }
  };

  const handleAcceptLocal = async () => {
    if (!proposedFolderUpdates) return;
    try {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.localFiles?.selectDirectory) {
        notify("Local export is only available in the Desktop App.", "error");
        return;
      }

      const directoryPath = await electronAPI.localFiles.selectDirectory();
      if (!directoryPath) return; // User canceled

      const toastId = "ai-export-flow";
      notify("Exporting organized files to your PC...", "info", toastId);

      // Fetch missing documents in parallel
      const rawFiles = await Promise.all(
        proposedFolderUpdates.map(async (update) => {
          let doc = documentsList.find((d) => d._id === update.documentId);
          if (!doc || !doc.cloudinaryUrl) {
            try {
              doc = await documentService.getDocument(update.documentId);
            } catch (err) {
              console.warn("Could not fetch document", update.documentId);
            }
          }

          const title =
            update.title || doc?.title || `File_${update.documentId}`;
          const relativePath =
            update.newPath && update.newPath !== "/"
              ? `${update.newPath}/${title}`
              : title;

          return {
            url: doc?.cloudinaryUrl || "",
            relativePath,
            localSourcePath: doc?.originalClientPath,
          };
        }),
      );

      const filesToExport = rawFiles.filter((f) => f.url || f.localSourcePath);

      if (filesToExport.length === 0) {
        notify("No files found to export.", "error", toastId);
        return;
      }

      const result = await electronAPI.localFiles.exportOrganizedFiles(
        directoryPath,
        filesToExport,
      );
      if (result?.success) {
        notify(
          "Export Complete! Check your selected folder.",
          "success",
          toastId,
        );
        onSuccess?.();
        handleClose();
      }
    } catch (err: any) {
      console.error("Local export error:", err);
      notify("Failed to export files to PC.", "error", "ai-export-flow");
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
      
      const fakeFiles = files.map((f: any) => {
        // If clientPath doesn't have a slash (due to old main process without restart), fallback to folderName
        let relativePath = f.clientPath || f.webkitRelativePath || "";
        if (!relativePath.includes("/") && folderPath) {
           const folderName = folderPath.split(/[\\/]/).filter(Boolean).pop() || "Folder";
           relativePath = `${folderName}/${f.name}`;
        }
        
        return {
          name: f.name,
          path: f.path,
          size: f.size || 0,
          type: f.type || "",
          webkitRelativePath: relativePath,
          isNativeFile: true,
        };
      });

      // Delegate to onDrop to handle folder uniqueness and state setting
      onDrop(fakeFiles as any as File[]);
    } catch (err: any) {
      console.error("Native folder select error:", err);
      notify("Failed to read folder recursively.", "error");
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
