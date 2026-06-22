import React from "react";
import { ConfirmDialog } from "../../../components/ui/feedback/ConfirmDialog";
import { RenameDialog } from "../../../components/ui/feedback/RenameDialog";
import { UploadModal } from "./UploadModal";
import { SynthesisModal } from "./SynthesisModal";

interface LibraryModalsProps {
  ui: any;
  actions: any;
  state: any;
  dropzone: any;
}

export const LibraryModals: React.FC<LibraryModalsProps> = ({ ui, actions, state, dropzone }) => {
  return (
    <>
      <SynthesisModal
        isOpen={state.isSynthesizing || !!state.synthesisResult}
        isLoading={state.isSynthesizing}
        synthesisResult={state.synthesisResult}
        onClose={actions.cancelAISynthesis}
      />

      <UploadModal
        isOpen={ui.uploadModal.isOpen}
        onClose={ui.uploadModal.close}
        externalFiles={dropzone.globalDroppedFiles}
        externalPaths={dropzone.globalDroppedPaths}
        onClearExternal={() => {
          dropzone.setGlobalDroppedFiles([]);
          dropzone.setGlobalDroppedPaths([]);
        }}
      />

      <ConfirmDialog
        isOpen={ui.bulkDeleteModal.isOpen}
        onClose={ui.bulkDeleteModal.close}
        onConfirm={actions.executeBulkDelete}
        title="Delete Multiple Records"
        message={`Are you sure you want to permanently delete ${state.selectedDocIds.length + state.selectedFolderIds.length} selected items?`}
        confirmText="Delete All"
        isDestructive
        isLoading={ui.loading.isDeleting}
      />
      
      <ConfirmDialog
        isOpen={!!ui.deleteModal.doc}
        onClose={ui.deleteModal.close}
        onConfirm={actions.executeDelete}
        title="Delete Record"
        message={`Permanently delete "${ui.deleteModal.doc?.title}"?`}
        confirmText="Delete"
        isDestructive
        isLoading={ui.loading.isDeleting}
      />
      
      <RenameDialog
        isOpen={!!ui.renameModal.doc}
        onClose={ui.renameModal.close}
        onConfirm={actions.executeRename}
        currentName={ui.renameModal.doc?.title || ""}
        isLoading={ui.loading.isRenaming}
      />
      
      <ConfirmDialog
        isOpen={!!ui.folderDeleteModal.path}
        onClose={ui.folderDeleteModal.close}
        onConfirm={actions.executeDeleteFolder}
        title="Delete Folder"
        message={`Permanently delete this folder and ALL files inside it?`}
        confirmText="Delete Folder"
        isDestructive
        isLoading={ui.loading.isDeleting}
      />
      
      <RenameDialog
        isOpen={!!ui.folderRenameModal.path}
        onClose={ui.folderRenameModal.close}
        onConfirm={actions.executeRenameFolder}
        currentName={state.folderToRename?.name || "Rename Folder"}
        isLoading={ui.loading.isRenaming}
      />
    </>
  );
};
