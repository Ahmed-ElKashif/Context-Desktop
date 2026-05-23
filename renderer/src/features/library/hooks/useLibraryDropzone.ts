import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { notify } from "../../../components/ui/ToastEngine";

export const useLibraryDropzone = (openUploadModal: () => void) => {
  const [globalDroppedFiles, setGlobalDroppedFiles] = useState<File[]>([]);
  const [globalDroppedPaths, setGlobalDroppedPaths] = useState<string[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const realFiles = acceptedFiles.filter((f) => f.type !== "" || f.size > 0);

    if (realFiles.length === 0) {
      notify("Cannot upload an empty folder.", "error");
      return;
    }

    const filesToProcess = realFiles.slice(0, 10);

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
    onDropRejected: (rejections) =>
      notify(`File type not supported: ${rejections[0]?.file?.name}`, "error"),
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
