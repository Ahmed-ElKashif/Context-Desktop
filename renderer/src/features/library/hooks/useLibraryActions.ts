import { useRef } from "react";
import { useAppDispatch } from "../../../store/hooks";
import {
  deleteDocumentThunk,
  generateSemanticStructure,
  synthesizeDocumentsThunk,
  clearSynthesisResult,
  renameDocumentThunk,
  bulkDeleteDocumentsThunk,
  deleteFolderThunk,
  renameFolderThunk,
  downloadFolderZipThunk,
  DocumentData,
  FolderData,
} from "../../../store/library/librarySlice";
import { clearSelection } from "../../../store/library/selectionSlice";
import { notify } from "../../../components/ui/feedback/ToastEngine";

interface UseLibraryActionsOptions {
  ui: any; // The useLibraryUI hook return value
  selectedDocs: DocumentData[];
  selectedFolders: FolderData[];
  selectedDocIds: string[];
  selectedFolderIds: string[];
}

/**
 * Encapsulates all data-mutation API calls (CRUD + AI).
 */
export const useLibraryActions = ({
  ui,
  selectedDocs,
  selectedFolders,
  selectedDocIds,
  selectedFolderIds,
}: UseLibraryActionsOptions) => {
  const dispatch = useAppDispatch();

  const executeDelete = async () => {
    if (!ui.deleteModal.doc) return;
    ui.loading.setIsDeleting(true);
    try {
      await dispatch(deleteDocumentThunk(ui.deleteModal.doc._id)).unwrap();
      notify("Document permanently deleted.", "success");
      ui.deleteModal.close();
    } catch (error: unknown) {
      notify((error as string) || "Failed to delete document.", "error");
    } finally {
      ui.loading.setIsDeleting(false);
    }
  };

  const executeRename = async (newName: string) => {
    if (!ui.renameModal.doc) return;
    ui.loading.setIsRenaming(true);
    try {
      await dispatch(
        renameDocumentThunk({ id: ui.renameModal.doc._id, title: newName }),
      ).unwrap();
      notify("Document renamed successfully.", "success");
      ui.renameModal.close();
    } catch {
      notify("Failed to rename document.", "error");
    } finally {
      ui.loading.setIsRenaming(false);
    }
  };

  const executeBulkDelete = async () => {
    const documentIds = selectedDocIds;
    const folderIds = selectedFolderIds;
    const totalToDelete = documentIds.length + folderIds.length;

    if (totalToDelete === 0) return;
    ui.loading.setIsDeleting(true);
    try {
      await dispatch(
        bulkDeleteDocumentsThunk({ documentIds, folderIds }),
      ).unwrap();
      notify(`Successfully deleted ${totalToDelete} items.`, "success");
      dispatch(clearSelection());
      ui.bulkDeleteModal.close();
    } catch {
      notify("Failed to delete some items.", "error");
    } finally {
      ui.loading.setIsDeleting(false);
    }
  };

  const executeDeleteFolder = async () => {
    if (!ui.folderDeleteModal.path) return;
    ui.loading.setIsDeleting(true);
    try {
      await dispatch(deleteFolderThunk(ui.folderDeleteModal.path)).unwrap();
      notify("Folder permanently deleted.", "success");
      ui.folderDeleteModal.close();
    } catch (error: unknown) {
      notify((error as string) || "Failed to delete folder.", "error");
    } finally {
      ui.loading.setIsDeleting(false);
    }
  };

  const executeRenameFolder = async (newName: string) => {
    if (!ui.folderRenameModal.path) return;
    ui.loading.setIsRenaming(true);
    try {
      await dispatch(
        renameFolderThunk({ path: ui.folderRenameModal.path, newName }),
      ).unwrap();
      notify("Folder renamed successfully.", "success");
      ui.folderRenameModal.close();
    } catch (error: unknown) {
      notify((error as string) || "Failed to rename folder.", "error");
    } finally {
      ui.loading.setIsRenaming(false);
    }
  };

  const executeDownloadFolder = async (folderId: string) => {
    notify("Preparing your download...", "info");
    try {
      await dispatch(downloadFolderZipThunk(folderId)).unwrap();
      notify("Download started successfully.", "success");
    } catch {
      notify("Failed to download folder.", "error");
    }
  };

  const executeAIOrganization = async () => {
    if (selectedDocs.length === 0 && selectedFolders.length === 0) return;

    try {
      notify("Analyzing semantic paths...", "info");
      await dispatch(
        generateSemanticStructure({
          documents: selectedDocs,
          folderIds: selectedFolderIds,
        }),
      ).unwrap();
      dispatch(clearSelection());
      ui.uploadModal.open();
    } catch (error: any) {
      let errMsg = "Failed to process AI routing.";
      if (typeof error === 'string') errMsg = error;
      else if (error?.response?.data?.message) errMsg = error.response.data.message;
      else if (error?.data?.message) errMsg = error.data.message;
      else if (error?.message) errMsg = error.message;

      if (errMsg.includes("8-hour") || errMsg.includes("token budget")) {
        notify("Not enough tokens to organize folders with AI right now.", "error");
      } else {
        notify(errMsg, "error");
      }
    }
  };

  const synthesisPromiseRef = useRef<any>(null);

  const executeAISynthesis = async () => {
    if (selectedDocIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      synthesisPromiseRef.current = dispatch(
        synthesizeDocumentsThunk({
          documentIds: selectedDocIds,
          folderIds: selectedFolderIds,
        }),
      );
      await synthesisPromiseRef.current.unwrap();
    } catch (error: unknown) {
      const err = error as any;
      if (err?.name === "AbortError" || error === "Synthesis cancelled") {
        return; // Silently handle cancellation
      }
      const errorMsg =
        typeof error === "string"
          ? error
          : err?.message || "Failed to synthesize documents.";
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
