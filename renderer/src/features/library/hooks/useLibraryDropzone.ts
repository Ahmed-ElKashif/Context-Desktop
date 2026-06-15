import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { notify } from "../../../components/ui/feedback/ToastEngine";
import { extractPathsFromEvent, applyPrototypeBridge } from "@/lib/desktop-dropzone";

export const useLibraryDropzone = (openUploadModal: () => void) => {
  const [globalDroppedFiles, setGlobalDroppedFiles] = useState<File[]>([]);
  const [globalDroppedPaths, setGlobalDroppedPaths] = useState<string[]>([]);

  useEffect(() => {
    const handleExternalUpload = async (event: any) => {
      const pathsToUpload = event.detail as string[];
      if (pathsToUpload && pathsToUpload.length > 0) {
        if ((window as any).electronAPI) {
          try {
            const result = await (
              window as any
            ).electronAPI.localFiles.processDroppedPaths(pathsToUpload);
            if (result && result.files) {
              if (result.files.length === 0) {
                notify("No supported files found in the dropped items.", "error");
                return;
              }
              // We apply the prototype bridge to the raw IPC JSON response
              const nativeFiles = applyPrototypeBridge(result.files);
              setGlobalDroppedFiles(nativeFiles);
              setGlobalDroppedPaths(nativeFiles.map((f: any) => f.webkitRelativePath || f.clientPath));
              openUploadModal();
            }
          } catch (err) {
            console.error("Failed to process CLI paths", err);
          }
        }
      }
    };

    window.addEventListener("external-upload", handleExternalUpload);

    // Check for any pending external uploads from cold start
    if ((window as any).pendingExternalUpload) {
      const pendingPaths = (window as any).pendingExternalUpload;
      if (pendingPaths.length > 0) {
        handleExternalUpload({ detail: pendingPaths });
      }
      delete (window as any).pendingExternalUpload;
    }
    return () => {
      window.removeEventListener("external-upload", handleExternalUpload);
    };
  }, [openUploadModal]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const realFiles = acceptedFiles.filter((f) => f.type !== "" || f.size > 0);

    if (realFiles.length === 0) {
      notify("Cannot upload an empty folder.", "error");
      return;
    }

    const filesToProcess = realFiles.slice(0, 5);

    const paths = filesToProcess.map((file: any) => {
      if (file.webkitRelativePath) return file.webkitRelativePath;
      if (file.path) return file.path.replace(/^\//, "");
      return file.name;
    });

    setGlobalDroppedFiles(filesToProcess);
    setGlobalDroppedPaths(paths);
    openUploadModal();
  };

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    maxSize: 10 * 1024 * 1024,
    getFilesFromEvent: async (event: any) => {
      const files = event.dataTransfer ? event.dataTransfer.files : event.target?.files;
      if (files && files.length > 0) {
        const paths = extractPathsFromEvent(files);
        if (paths.length > 0) {
          window.dispatchEvent(new CustomEvent("external-upload", { detail: paths }));
        }
      }
      return []; // Instantly return empty to terminate react-dropzone's synchronous UI-blocking crawl
    },
    onDropRejected: (rejections) => {
      if (rejections.length > 1) {
        notify("No supported files found in the dropped items.", "error");
      } else {
        notify(`File type not supported: ${rejections[0]?.file?.name}`, "error");
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  return {
    ...dropzoneProps,
    globalDroppedFiles,
    setGlobalDroppedFiles,
    globalDroppedPaths,
    setGlobalDroppedPaths,
  };
};
