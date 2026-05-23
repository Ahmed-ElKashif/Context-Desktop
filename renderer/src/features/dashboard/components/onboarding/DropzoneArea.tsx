import { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "../../../../components/ui/Icons";

// Redux Imports
import { useAppSelector } from "../../../../store/hooks";

// Shadcn Imports
import { Button } from "@/components/ui/Button";

export const DropzoneArea = ({
  onFilesDropped,
}: {
  onFilesDropped: (files: File[], paths: string[]) => void;
}) => {
  const { isUploading } = useAppSelector((state) => state.document);
  // 🛠️ THE FIX 1: Add a ref to control the hidden folder input
  const hiddenFolderInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle the manual hidden folder selection
  const handleManualFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files));
    }
  };

  // THE FIX: Removed useCallback and the dependency array!
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Limit to 10 files to protect the backend MVP
    const filesToProcess = acceptedFiles.slice(0, 10);

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

        {/* 🛠️ THE FIX 3: Hidden Folder Input (Strictly for folder clicking) */}
        <input
          type="file"
          ref={hiddenFolderInputRef}
          onChange={handleManualFolderSelect}
          className="hidden"
          multiple
          //eslint-disable-next-line
          {...({ webkitdirectory: "true", directory: "true" } as any)}
        />

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
        <div className="flex flex-wrap justify-center gap-2 text-xs font-mono font-semibold text-light-text/70 dark:text-dark-text/50 mb-8">
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
        <div className="flex gap-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              open(); // Opens standard File Picker
            }}
            disabled={isUploading}
            className="bg-light-primary dark:bg-dark-primary text-white dark:text-black px-6 h-auto py-3.5 rounded-xl font-bold hover:bg-light-primary/90 dark:hover:bg-dark-primary/90 hover:opacity-90 active:scale-95 transition-all shadow-md dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            {isUploading ? "Processing..." : "Browse Files"}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              hiddenFolderInputRef.current?.click(); // Opens Folder Picker
            }}
            disabled={isUploading}
            variant="outline"
            className="px-6 h-auto py-3.5 rounded-xl font-bold hover:bg-light-bg dark:hover:bg-white/5 active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer bg-white dark:bg-[#1E1E22] border-light-border dark:border-white/10"
          >
            {isUploading ? "Processing..." : "Browse Folders"}
          </Button>
        </div>
      </div>
    </div>
  );
};
