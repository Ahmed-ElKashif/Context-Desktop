import { createPortal } from "react-dom";
import { Icon } from "../../../components/ui/Icons";
import { EngineRouterSkeleton } from "../../../components/ui/EngineRouterSkeleton";
import {
  useUploadModal,
  UseUploadModalProps,
} from "./upload-modal/useUploadModal";
import { AISplitScreenView } from "./upload-modal/views/AISplitScreenView";
import { StagedFilesView } from "./upload-modal/views/StagedFilesView";
import { DefaultDropzoneView } from "./upload-modal/views/DefaultDropzoneView";

export const UploadModal = ({
  isOpen,
  ...props
}: UseUploadModalProps & { isOpen: boolean }) => {
  const uploadState = useUploadModal(props);

  if (!isOpen) return null;

  let modalContent = null;
  let canCloseOnBackdrop = !uploadState.isUploading;

  // ==========================================
  // VIEW Z: Batch Native Folder Progress
  // ==========================================
  if (uploadState.batchProgress) {
    canCloseOnBackdrop = false;
    modalContent = (
      <div className="w-full max-w-md bg-white dark:bg-[#0A0A0C] p-8 rounded-2xl border border-light-border dark:border-white/10 shadow-xl flex flex-col items-center">
         <Icon name="folder_sync" className="text-light-primary dark:text-dark-primary text-5xl mb-4 animate-pulse" />
         <h2 className="text-xl font-bold text-light-text dark:text-white mb-2">Ingesting Directory</h2>
         <p className="text-light-text/60 dark:text-white/60 mb-6 text-center text-sm font-semibold">
           Processing {uploadState.batchProgress.current} of {uploadState.batchProgress.total} files...
         </p>
         <div className="w-full bg-light-bg dark:bg-white/10 h-2 rounded-full overflow-hidden">
           <div 
             className="bg-light-primary dark:bg-dark-primary h-full transition-all duration-300" 
             style={{ width: `${(uploadState.batchProgress.current / Math.max(1, uploadState.batchProgress.total)) * 100}%` }}
           ></div>
         </div>
         <p className="text-xs text-light-text/40 dark:text-white/40 mt-4 truncate w-full text-center font-mono">
           {uploadState.batchProgress.currentFileName || "Scanning..."}
         </p>
      </div>
    );
  }
  // ==========================================
  // VIEW A: AI Split-Screen Proposal
  // ==========================================
  else if (uploadState.proposedFolderUpdates) {
    canCloseOnBackdrop = false; // AISplitScreenView doesn't allow closing via backdrop
    modalContent = (
      <AISplitScreenView
        proposedFolderUpdates={uploadState.proposedFolderUpdates}
        documentsList={uploadState.documentsList}
        globalFolderTree={uploadState.globalFolderTree}
        isApplyingFolders={uploadState.isApplyingFolders}
        handleClose={uploadState.handleClose}
        handleAcceptAI={uploadState.handleAcceptAI}
      />
    );
  }
  // ==========================================
  // VIEW A2: Text Snippet Upload (Engine Router)
  // ==========================================
  else if (
    uploadState.activeTab === "text" &&
    (uploadState.isUploading || uploadState.isSnippetLoading)
  ) {
    canCloseOnBackdrop =
      !uploadState.isUploading && !uploadState.isSnippetLoading;
    modalContent = (
      <div className="w-full max-w-5xl h-[80vh] relative flex items-center justify-center">
        <EngineRouterSkeleton
          fileType="TextSnippet"
          title={uploadState.snippetTitle || "Raw_Text_Snippet"}
        />
      </div>
    );
  }
  // ==========================================
  // VIEW B: Staged Files Confirmation
  // ==========================================
  else if (uploadState.activeFiles.length > 0) {
    const isBatch = uploadState.activeFiles.length > 1;
    const fileType = isBatch
      ? "Batch"
      : uploadState.determineFileType(uploadState.activeFiles[0]);
    const title = isBatch
      ? "Directory_Sync.sys"
      : uploadState.activeFiles[0]?.name;

    if (uploadState.isUploading) {
      modalContent = (
        <div className="w-full max-w-5xl h-[80vh] relative flex items-center justify-center">
          <EngineRouterSkeleton
            isBatch={isBatch}
            fileCount={uploadState.activeFiles.length}
            fileType={fileType}
            title={title}
          />
        </div>
      );
    } else {
      return (
        <StagedFilesView
          activeFiles={uploadState.activeFiles}
          activePaths={uploadState.activePaths}
          handleClose={uploadState.handleClose}
          handleUploadToYourFolders={uploadState.handleUploadToYourFolders}
        />
      );
    }
  }
  // ==========================================
  // VIEW C: Default Empty Dropzone
  // ==========================================
  else {
    modalContent = (
      <DefaultDropzoneView
        activeTab={uploadState.activeTab}
        setActiveTab={uploadState.setActiveTab}
        pastedText={uploadState.pastedText}
        setPastedText={uploadState.setPastedText}
        snippetTitle={uploadState.snippetTitle}
        setSnippetTitle={uploadState.setSnippetTitle}
        isUploading={uploadState.isUploading}
        wordCount={uploadState.wordCount}
        handleTextSubmit={uploadState.handleTextSubmit}
        handleClose={uploadState.handleClose}
        dropzone={uploadState.dropzone}
        hiddenFolderInputRef={uploadState.hiddenFolderInputRef}
        handleManualFolderSelect={uploadState.handleManualFolderSelect}
        handleNativeFolderSelect={uploadState.handleNativeFolderSelect}
      />
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={canCloseOnBackdrop ? uploadState.handleClose : undefined}
      ></div>
      {modalContent}
    </div>,
    document.body,
  );
};
