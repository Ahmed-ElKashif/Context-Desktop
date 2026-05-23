import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  deleteDocumentThunk,
  clearActiveDocument,
  generateSemanticStructure,
  synthesizeDocumentsThunk,
  clearSynthesisResult,
  DocumentData,
  FolderData,
} from "../../../store/documentSlice";
import { clearSelection } from "../../../store/selectionSlice";
import { documentService } from "../../dashboard/api/documentService";
import { notify } from "../../../components/ui/ToastEngine";
import { updateUserLocalState, updateProfile } from "../../../store/authSlice";

interface UseLibraryActionsOptions {
  ui: any; // The useLibraryUI hook return value
  refetchCurrentView: () => void;
  activeDocument: DocumentData | null;
  selectedDocs: DocumentData[];
  selectedFolders: FolderData[];
  selectedDocIds: string[];
  selectedFolderIds: string[];
  foldersList: FolderData[];
  visibleFolders: FolderData[];
  globalFolderTree: FolderData[];
}

/**
 * Encapsulates all data-mutation API calls (CRUD + AI).
 */
export const useLibraryActions = ({
  ui,
  refetchCurrentView,
  activeDocument,
  selectedDocs,
  selectedFolders,
  selectedDocIds,
  selectedFolderIds,
  foldersList,
  visibleFolders,
  globalFolderTree,
}: UseLibraryActionsOptions) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const executeDelete = async () => {
    if (!ui.deleteModal.doc) return;
    ui.loading.setIsDeleting(true);
    try {
      await dispatch(deleteDocumentThunk(ui.deleteModal.doc._id)).unwrap();
      notify("Document permanently deleted.", "success");
      ui.deleteModal.close();
    } catch (error: any) {
      notify(error || "Failed to delete document.", "error");
    } finally {
      ui.loading.setIsDeleting(false);
    }
  };

  const executeRename = async (newName: string) => {
    if (!ui.renameModal.doc) return;
    ui.loading.setIsRenaming(true);
    try {
      await documentService.updateDocument(ui.renameModal.doc._id, {
        title: newName,
      });
      notify("Document renamed successfully.", "success");
      ui.renameModal.close();
      refetchCurrentView();
    } catch (error: any) {
      notify("Failed to rename document.", "error");
    } finally {
      ui.loading.setIsRenaming(false);
    }
  };

  const executeBulkDelete = async () => {
    const docIdsToDelete = selectedDocIds;
    const folderIdsToDelete = selectedFolderIds;
    const totalToDelete = docIdsToDelete.length + folderIdsToDelete.length;

    if (totalToDelete === 0) return;
    ui.loading.setIsDeleting(true);
    try {
      if (docIdsToDelete.length > 0) {
        await documentService.bulkDeleteDocuments(docIdsToDelete);

        // If the active document was deleted, clear it from Redux
        if (activeDocument?._id && docIdsToDelete.includes(activeDocument._id)) {
          dispatch(clearActiveDocument());
        }
        
        // Also clear lastActiveDocumentId from user profile if it was deleted
        if (user?.lastActiveDocumentId && docIdsToDelete.includes(user.lastActiveDocumentId)) {
          dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
          dispatch(updateProfile({ lastActiveDocumentId: null }));
        }
      }

      if (folderIdsToDelete.length > 0) {
        await Promise.all(
          folderIdsToDelete.map((folderId) =>
            documentService.deleteFolder(folderId)
          )
        );
      }

      notify(`Successfully deleted ${totalToDelete} items.`, "success");
      dispatch(clearSelection());
      ui.bulkDeleteModal.close();
      refetchCurrentView();
    } catch (error: any) {
      notify("Failed to delete some items.", "error");
    } finally {
      ui.loading.setIsDeleting(false);
    }
  };

  const executeDeleteFolder = async () => {
    if (!ui.folderDeleteModal.path) return;
    ui.loading.setIsDeleting(true);
    try {
      await documentService.deleteFolder(ui.folderDeleteModal.path);

      // If the active document resides inside the deleted folder, clear it from Redux
      if (activeDocument?.folder === ui.folderDeleteModal.path) {
        dispatch(clearActiveDocument());
        if (user?.lastActiveDocumentId === activeDocument?._id) {
          dispatch(updateUserLocalState({ lastActiveDocumentId: null }));
          dispatch(updateProfile({ lastActiveDocumentId: null }));
        }
      }

      notify("Folder permanently deleted.", "success");
      ui.folderDeleteModal.close();
      refetchCurrentView();
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Failed to delete folder.";
      notify(errMsg, "error");
    } finally {
      ui.loading.setIsDeleting(false);
    }
  };

  const executeRenameFolder = async (newName: string) => {
    if (!ui.folderRenameModal.path) return;
    ui.loading.setIsRenaming(true);
    try {
      await documentService.renameFolder(ui.folderRenameModal.path, newName);
      notify("Folder renamed successfully.", "success");
      ui.folderRenameModal.close();
      refetchCurrentView();
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Failed to rename folder.";
      notify(errMsg, "error");
    } finally {
      ui.loading.setIsRenaming(false);
    }
  };

  const executeDownloadFolder = async (folderId: string) => {
    const folder =
      foldersList.find((f) => f._id === folderId) ||
      visibleFolders.find((f) => f._id === folderId) ||
      globalFolderTree.find((f) => f._id === folderId);
    if (!folder) return;

    notify("Preparing your download...", "info");
    try {
      await documentService.downloadFolderZip(folder._id);
      notify("Download started successfully.", "success");
    } catch (error: any) {
      notify("Failed to download folder.", "error");
    }
  };

  const executeAIOrganization = async () => {
    if (selectedDocs.length === 0 && selectedFolders.length === 0) return;

    try {
      notify("Analyzing semantic paths...", "info");
      await dispatch(
        generateSemanticStructure({ documents: selectedDocs, folderIds: selectedFolderIds })
      ).unwrap();
      dispatch(clearSelection());
      ui.uploadModal.open();
    } catch (error: any) {
      notify(error || "Failed to process AI routing.", "error");
    }
  };

  const synthesisPromiseRef = useRef<any>(null);

  const executeAISynthesis = async () => {
    if (selectedDocIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      synthesisPromiseRef.current = dispatch(
        synthesizeDocumentsThunk({ documentIds: selectedDocIds, folderIds: selectedFolderIds })
      );
      await synthesisPromiseRef.current.unwrap();
    } catch (error: any) {
      if (error?.name === "AbortError" || error === "Synthesis cancelled") {
        return; // Silently handle cancellation
      }
      const errorMsg = typeof error === 'string' ? error : error?.message || "Failed to synthesize documents.";
      notify(errorMsg, "error");
    }
  };

  const cancelAISynthesis = () => {
    if (synthesisPromiseRef.current) {
      synthesisPromiseRef.current.abort();
    }
    dispatch(clearSynthesisResult());
  };

  return {
    executeDelete,
    executeRename,
    executeBulkDelete,
    executeDeleteFolder,
    executeRenameFolder,
    executeDownloadFolder,
    executeAIOrganization,
    executeAISynthesis,
    cancelAISynthesis,
  };
};
