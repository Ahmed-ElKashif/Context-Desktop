import { useDropzone } from "react-dropzone";
import { Icon } from "../../../../components/ui/core/Icons";

// Redux Imports
import { useAppSelector } from "../../../../store/hooks";

// Shadcn Imports
import { Button } from "@/components/ui/core/Button";
import { getDesktopFilesFromEvent, handleDesktopFolderSelect } from "@/lib/desktop-dropzone";
import { notify } from "../../../../components/ui/feedback/ToastEngine";

export const DropzoneArea = ({
  onFilesDropped,
}: {
  onFilesDropped: (files: File[], paths: string[]) => void;
}) => {
  const { isUploading } = useAppSelector((state) => state.library);

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

  // THE FIX: Removed useCallback and the dependency array!
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    if (acceptedFiles.length > 5) {
      notify("Upload rejected. You can only upload up to 5 files at a time. Please select specific files.", "error");
      return;
    }

    // Process exactly 5 or fewer files
    const filesToProcess = acceptedFiles;

    // Extract the physical folder paths from the dropped files
    const paths = filesToProcess.map(
      (file: File & { path?: string }) =>
        file.webkitRelativePath || file.path || `/${file.name}`,
    );

    if (filesToProcess.length > 0) {
      onFilesDropped(filesToProcess, paths);
    }
  };
  // 🛠️ THE FIX 2: Extract 'open' and disable the root click
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // Prevents the whole box from triggering the file picker
    noKeyboard: true, // Prevents spacebar from triggering it
    maxSize: 10 * 1024 * 1024,
    getFilesFromEvent: getDesktopFilesFromEvent,
    onDropRejected: (rejections) => {
      if (rejections.length > 1) {
        notify(`${rejections.length} files were not supported and were skipped.`, "warning");
      } else if (rejections.length === 1) {
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
      //  Excel & CSV Formats
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    disabled: isUploading,
  });

  return (
    <div className="p-8 md:p-12 block animate-enter">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-colors group/drop ${
          isDragActive
            ? "border-light-primary dark:border-dark-primary bg-light-primary/10 dark:bg-dark-primary/10 scale-[1.02]"
            : "border-light-border dark:border-white/20 bg-light-bg/50 dark:bg-black/20 hover:border-light-primary/50 dark:hover:border-dark-primary/50 hover:bg-light-primary/5 dark:hover:bg-dark-primary/5"
        }`}
      >
        <input {...getInputProps()} />


        <div
          className={`w-16 h-16 shadow-sm rounded-full flex items-center justify-center mb-6 transition-colors ${
            isDragActive
              ? "bg-light-primary dark:bg-dark-primary text-white dark:text-black"
              : "bg-white dark:bg-dark-surface text-light-primary dark:text-dark-primary"
          }`}
        >
          <Icon
            name={isUploading ? "sync" : "cloud_upload"}
            className={`text-3xl transition-transform ${
              isUploading ? "animate-spin" : "group-hover/drop:scale-110"
            }`}
          />
        </div>
        <h3 className="text-xl font-extrabold text-light-text dark:text-white mb-3 tracking-tight">
          {isUploading
            ? "Analyzing Context..."
            : isDragActive
              ? "Drop it here!"
              : "Drag & drop your content here"}
        </h3>
        <div className="flex flex-wrap justify-center gap-2 text-xs font-mono font-semibold text-light-text/70 dark:text-dark-text/70 mb-8">
          <span className="px-2 py-1 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 rounded-md">
            PDF
          </span>
          <span className="px-2 py-1 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 rounded-md">
            DOCX
          </span>
          <span className="px-2 py-1 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 rounded-md">
            XLSX / CSV
          </span>
          <span className="px-2 py-1 bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary border border-light-primary/20 dark:border-dark-primary/20 rounded-md flex items-center gap-1">
            <Icon name="image" className="text-[12px]" /> OCR Images
          </span>
        </div>

        {/* 🛠️ THE FIX 4: Explicit UI Buttons to solve the OS limitation */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg mx-auto">
          <Button
            onClick={(e) => {
              e.preventDefault();
              open(); // Opens standard File Picker
            }}
            disabled={isUploading}
            className="flex-1 bg-light-primary dark:bg-dark-primary text-white dark:text-black h-auto py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-light-primary/90 dark:hover:bg-dark-primary/90 hover:opacity-90 active:scale-95 transition-all shadow-md dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <Icon name="upload_file" className="text-[18px]" />
            {isUploading ? "Processing..." : "Browse Files"}
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleNativeFolderSelect();
            }}
            disabled={isUploading}
            className="flex-1 bg-white dark:bg-[#18181B] text-light-text dark:text-white border border-light-border dark:border-white/10 h-auto py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-light-bg dark:hover:bg-white/5 active:scale-95 transition-all shadow-sm disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <Icon name="folder_open" className="text-[18px]" />
            {isUploading ? "Processing..." : "Browse Folders"}
          </Button>
        </div>
      </div>
    </div>
  );
};
