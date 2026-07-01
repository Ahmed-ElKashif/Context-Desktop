import React from "react";
import { ConfirmDialog } from "../../../components/ui/feedback/ConfirmDialog";
import { RenameDialog } from "../../../components/ui/feedback/RenameDialog";
import { UploadModal } from "./UploadModal";
import { SynthesisModal } from "./SynthesisModal";
import { CreateFolderDialog } from "../../../components/ui/feedback/CreateFolderDialog";
import { FolderPickerModal } from "../../../components/ui/feedback/FolderPickerModal";

interface LibraryModalsProps {
  ui: any;
  actions: any;
  state: any;
  dropzone: any;
}

export const LibraryModals: React.FC<LibraryModalsProps> = ({ ui, actions, state, dropzone }) => {
  return (
    <>
      {/* Modals */}
      <ConfirmDialog
        isOpen={ui.bulkDeleteModal.isOpen}
        title="Delete Items"
        message={`Are you sure you want to delete ${state.selectedDocIds.length + state.selectedFolderIds.length} items?`}
        onConfirm={actions.executeBulkDelete}
        onClose={ui.bulkDeleteModal.close}
        isLoading={ui.loading.isDeleting}
      />

      <ConfirmDialog
        isOpen={ui.reorganizeWarningModal.isOpen}
        title="Reorganize Already Organized Items?"
        message="Some of the selected items have already been organized by AI. Reorganizing them will move them from their current folders and consume your token budget. Are you sure you want to proceed?"
        onConfirm={() => {
          ui.reorganizeWarningModal.close();
          actions.confirmAIOrganization(ui.reorganizeWarningModal.targetFolderId);
        }}
        onClose={ui.reorganizeWarningModal.close}
        confirmText="Yes, Reorganize"
        isDestructive={false}
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

      <RenameDialog
        isOpen={!!ui.folderRenameModal.folder}
        currentName={ui.folderRenameModal.folder?.name || ""}
        onConfirm={(newName) => actions.executeRenameFolder(newName)}
        onClose={ui.folderRenameModal.close}
        isLoading={ui.loading.isRenaming}
      />

      <CreateFolderDialog
        isOpen={ui.createFolderModal.isOpen}
        onClose={ui.createFolderModal.close}
        onConfirm={actions.executeCreateFolder}
        isLoading={ui.loading.isCreatingFolder}
      />

      <FolderPickerModal
        isOpen={ui.folderPickerModal.isOpen}
        onClose={ui.folderPickerModal.close}
        onConfirm={actions.executeMoveOrCopy}
        title={
          ui.folderPickerModal.mode === 'move'
            ? `Move ${state.selectedDocIds.length + state.selectedFolderIds.length} item${state.selectedDocIds.length + state.selectedFolderIds.length !== 1 ? 's' : ''}`
            : `Copy ${state.selectedDocIds.length + state.selectedFolderIds.length} item${state.selectedDocIds.length + state.selectedFolderIds.length !== 1 ? 's' : ''}`
        }
        actionLabel={ui.folderPickerModal.mode === 'move' ? 'Move' : 'Copy'}
        globalFolderTree={state.globalFolderTree}
        onCreateNewFolder={(parentId) => ui.createFolderModal.open(parentId)}
        disabledFolderIds={state.selectedFolderIds}
      />

      <UploadModal
        isOpen={ui.uploadModal.isOpen}
        onClose={ui.uploadModal.close}
        externalFiles={dropzone.globalDroppedFiles}
        externalPaths={dropzone.globalDroppedPaths}
        targetFolderId={ui.uploadModal.targetFolderId}
        forceReorganize={ui.reorganizeWarningModal.isForceReorganize}
        onClearExternal={() => {
          dropzone.setGlobalDroppedFiles([]);
          dropzone.setGlobalDroppedPaths([]);
        }}
      />

      <ConfirmDialog
        isOpen={!!ui.folderDeleteModal.id}
        onClose={ui.folderDeleteModal.close}
        onConfirm={actions.executeDeleteFolder}
        title="Delete Folder"
        message={`Permanently delete this folder and ALL files inside it?`}
        confirmText="Delete Folder"
        isDestructive
        isLoading={ui.loading.isDeleting}
      />

      {state.synthesisResult && (
        <SynthesisModal
          isOpen={true}
          isLoading={state.isFetchingLibrary}
          onClose={() => actions.cancelAISynthesis()}
          synthesisResult={state.synthesisResult}
        />
      )}
    </>
  );
};
