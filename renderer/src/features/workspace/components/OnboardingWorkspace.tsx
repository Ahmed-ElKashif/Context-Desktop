import { useState } from "react";
import { Icon } from "../../../components/ui/core/Icons";
import { DropzoneArea } from "./onboarding/DropzoneArea"; // Adjust path if needed
import { PasteArea } from "./onboarding/PasteArea"; // Adjust path if needed

// Redux Imports
import { useAppSelector } from "../../../store/hooks";
import { DocumentData } from "@/store/library/librarySlice";
import { UploadModal } from "../../library/components/UploadModal";

export const OnboardingWorkspace = ({
  onUploadSuccess,
}: {
  onUploadSuccess: (doc: DocumentData) => void;
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [droppedPaths, setDroppedPaths] = useState<string[]>([]);

  const handleFilesDropped = (files: File[], paths: string[]) => {
    setDroppedFiles(files);
    setDroppedPaths(paths);
    setIsModalOpen(true);
  };

  // 1. Pull the global uploading state
  const { isUploading } = useAppSelector((state) => state.library);

  return (
    <div className="max-w-4xl mx-auto w-full pt-20 md:pt-28 pb-12 px-6 text-center relative z-10 animate-enter">
      <h1 className="text-4xl md:text-5xl font-black mb-4 text-light-text dark:text-white tracking-tight leading-tight">
        Welcome to your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-secondary">
          new second brain.
        </span>
      </h1>
      <p className="text-lg text-light-text/80 dark:text-dark-text/60 mb-12 font-medium max-w-xl mx-auto">
        {/* 🛠️ UPGRADE: Updated copy to indicate folders are supported! */}
        Context is ready. To get started, upload files, drag in a folder, or
        paste raw text to define your semantic intent.
      </p>

      <div className="relative group mb-12">
        <div className="relative bg-white dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-[2rem] shadow-xl overflow-hidden flex flex-col">
          <div className="flex bg-light-bg dark:bg-[#0A0A0C] border-b border-light-border dark:border-white/5 w-full">
            <button
              onClick={() => !isUploading && setActiveTab("upload")}
              disabled={isUploading}
              className={`flex-1 py-5 text-sm flex items-center justify-center gap-2 outline-none border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "font-bold text-light-primary dark:text-dark-primary border-light-primary dark:border-dark-primary bg-white dark:bg-[#121214]"
                  : "font-semibold text-light-text/80 dark:text-dark-text/70 border-transparent hover:bg-light-border/50 dark:hover:bg-white/5 hover:text-light-primary dark:hover:text-white"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {/* 🛠️ UPGRADE: Changed the tab label */}
              <Icon name="upload_file" className="text-[18px]" /> Folder & File
              Upload
            </button>
            <button
              onClick={() => !isUploading && setActiveTab("paste")}
              disabled={isUploading}
              className={`flex-1 py-5 text-sm flex items-center justify-center gap-2 outline-none border-b-2 transition-colors ${
                activeTab === "paste"
                  ? "font-bold text-light-primary dark:text-dark-primary border-light-primary dark:border-dark-primary bg-white dark:bg-[#121214]"
                  : "font-semibold text-light-text/80 dark:text-dark-text/70 border-transparent hover:bg-light-border/50 dark:hover:bg-white/5 hover:text-light-primary dark:hover:text-white"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Icon name="content_paste" className="text-[18px]" /> Paste Text
            </button>
          </div>

          {activeTab === "upload" ? (
            <DropzoneArea onFilesDropped={handleFilesDropped} />
          ) : (
            <PasteArea onUploadSuccess={onUploadSuccess} />
          )}
        </div>
      </div>
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDroppedFiles([]);
          setDroppedPaths([]);
        }}
        externalFiles={droppedFiles}
        externalPaths={droppedPaths}
        onSuccess={() => {
          // Onboarding assumes any upload makes the user "populated"
          // We can optionally pass something back, but DashboardFeature detects populated state automatically
          setIsModalOpen(false);
          setDroppedFiles([]);
          setDroppedPaths([]);
          onUploadSuccess({} as DocumentData); // Dummy trigger to hide Onboarding if needed
        }}
      />
    </div>
  );
};
