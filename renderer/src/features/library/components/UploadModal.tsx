import { createPortal } from "react-dom";
import { EngineRouterSkeleton } from "../../../components/ui/loaders/EngineRouterSkeleton";
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
  // VIEW A: AI Split-Screen Proposal
  // ==========================================
  if (uploadState.proposedFolderUpdates) {
    canCloseOnBackdrop = false; // AISplitScreenView doesn't allow closing via backdrop
    modalContent = (
      <AISplitScreenView
        proposedFolderUpdates={uploadState.proposedFolderUpdates}
        documentsList={uploadState.documentsList}
        globalFolderTree={uploadState.globalFolderTree}
        isApplyingFolders={uploadState.isApplyingFolders}
        handleClose={uploadState.handleClose}
        handleAcceptAI={uploadState.handleAcceptAI}
        handleAcceptLocal={uploadState.handleAcceptLocal}
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
        handleNativeFolderSelect={uploadState.handleNativeFolderSelect}
        handleCreateNewFolder={uploadState.handleCreateNewFolder}
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
