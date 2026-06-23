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
  createFolderThunk,
  setFolderColorThunk,
  moveItemsThunk,
  copyItemsThunk,
  DocumentData,
  FolderData,
} from "../../../store/library/librarySlice";
import { setClipboard, clearClipboard } from "../../../store/library/clipboardSlice";
import { clearSelection } from "../../../store/library/selectionSlice";
import { notify } from "../../../components/ui/feedback/ToastEngine";
import { folderService } from "../api/folderService";
import { documentService } from "../api/documentService";

interface UseLibraryActionsOptions {
  ui: any; // The useLibraryUI hook return value
  selectedDocs: DocumentData[];
  selectedFolders: FolderData[];
  selectedDocIds: string[];
  selectedFolderIds: string[];
  currentFolder: FolderData | null;
  clipboardState: { action: "copy" | null; documentIds: string[]; folderIds: string[] };
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
  currentFolder,
  clipboardState,
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

  const executeCreateFolder = async (name: string, color: string) => {
    const parentFolderId = ui.createFolderModal.targetFolderId !== undefined
      ? ui.createFolderModal.targetFolderId
      : currentFolder?._id ?? null;
    try {
      await dispatch(createFolderThunk({ name, parentFolderId, color })).unwrap();
      notify(`Folder "${name}" created.`, "success");
      ui.createFolderModal.close();
    } catch (error: unknown) {
      notify((error as string) || "Failed to create folder.", "error");
    }
  };

  const executeDownloadFolder = async (folderId: string, folderName: string) => {
    notify("Preparing your download...", "info");
    try {
      const blob = await folderService.downloadFolderZip(folderId);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${folderName}.zip`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      notify("Download started successfully.", "success");
    } catch {
      notify("Failed to download folder.", "error");
    }
  };

  const executeBulkDownload = async () => {
    if (selectedDocIds.length === 0 && selectedFolderIds.length === 0) return;
    notify("Preparing your download...", "info");
    try {
      const blob = await documentService.downloadBulkZip(selectedDocIds, selectedFolderIds);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `Library_Download.zip`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      notify("Download started successfully.", "success");
    } catch {
      notify("Failed to download selected items.", "error");
    }
  };

  const confirmAIOrganization = async (targetFolderId?: string) => {
    const isTargetingSingleFolder = !!targetFolderId;
    if (!isTargetingSingleFolder && selectedDocs.length === 0 && selectedFolders.length === 0) return;

    try {
      notify("Analyzing semantic paths...", "info");
      await dispatch(
        generateSemanticStructure({
          documents: isTargetingSingleFolder ? [] : selectedDocs,
          folderIds: isTargetingSingleFolder ? [targetFolderId!] : selectedFolderIds,
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

  const executeAIOrganization = (targetFolderId?: string) => {
    const isTargetingSingleFolder = !!targetFolderId;
    if (!isTargetingSingleFolder && selectedDocs.length === 0 && selectedFolders.length === 0) return;

    let hasOrganizedItems = false;

    if (isTargetingSingleFolder) {
      // We don't have the full FolderData of the target folder here easily unless we search for it.
      // But typically targetFolderId is passed from context menu of a folder, which might be in selectedFolders or foldersList.
      // Let's check selectedFolders first. If it's a single folder, we can check its isAIGenerated flag.
      const target = selectedFolders.find(f => f._id === targetFolderId);
      if (target?.isAIGenerated) {
        hasOrganizedItems = true;
      }
    } else {
      hasOrganizedItems = selectedDocs.some(d => d.isOrganized) || selectedFolders.some(f => f.isAIGenerated);
    }

    if (hasOrganizedItems) {
      ui.reorganizeWarningModal.open(targetFolderId);
    } else {
      confirmAIOrganization(targetFolderId);
    }
  };
  const synthesisPromiseRef = useRef<any>(null);

  const executeAISynthesis = async (targetFolderId?: string) => {
    const isTargetingSingleFolder = !!targetFolderId;
    if (!isTargetingSingleFolder && selectedDocIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      synthesisPromiseRef.current = dispatch(
        synthesizeDocumentsThunk({
          documentIds: isTargetingSingleFolder ? [] : selectedDocIds,
          folderIds: isTargetingSingleFolder ? [targetFolderId!] : selectedFolderIds,
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

  const executeMoveOrCopy = async (targetFolderId: string | null) => {
    const documentIds = selectedDocIds;
    const folderIds = selectedFolderIds;
    const totalItems = documentIds.length + folderIds.length;
    
    if (totalItems === 0) return;

    try {
      if (ui.folderPickerModal.mode === 'move') {
        await dispatch(moveItemsThunk({ documentIds, folderIds, targetFolderId })).unwrap();
        notify(`Successfully moved ${totalItems} items.`, "success");
      } else if (ui.folderPickerModal.mode === 'copy') {
        await dispatch(copyItemsThunk({ documentIds, folderIds, targetFolderId })).unwrap();
        notify(`Successfully copied ${totalItems} items.`, "success");
      }
      dispatch(clearSelection());
      ui.folderPickerModal.close();
    } catch (error : any) {
      notify(`Failed to ${ui.folderPickerModal.mode} items.`, "error");
    }
  };

  const executeFolderColor = async (folderId: string, color: string) => {
    try {
      await dispatch(setFolderColorThunk({ folderId, color })).unwrap();
      // Optimistic update handles the immediate visual feedback
    } catch (error : any ) {
      notify("Failed to update folder color.", "error");
    }
  };

  const executeDuplicate = async () => {
    const documentIds = selectedDocIds;
    const folderIds = selectedFolderIds;
    const totalItems = documentIds.length + folderIds.length;
    if (totalItems === 0) return;

    try {
      await dispatch(copyItemsThunk({ 
        documentIds, 
        folderIds, 
        targetFolderId: currentFolder?._id || null 
      })).unwrap();
      notify(`Successfully duplicated ${totalItems} items.`, "success");
      dispatch(clearSelection());
    } catch (error: any) {
      notify("Failed to duplicate items.", "error");
    }
  };

  const executeCopy = () => {
    const documentIds = selectedDocIds;
    const folderIds = selectedFolderIds;
    const totalItems = documentIds.length + folderIds.length;
    if (totalItems === 0) return;

    dispatch(setClipboard({ action: "copy", documentIds, folderIds }));
    notify(`Copied ${totalItems} items to clipboard.`, "success");
  };

  const executePaste = async () => {
    if (clipboardState.action !== "copy") return;
    
    const { documentIds, folderIds } = clipboardState;
    const totalItems = documentIds.length + folderIds.length;
    if (totalItems === 0) return;

    try {
      await dispatch(copyItemsThunk({ 
        documentIds, 
        folderIds, 
        targetFolderId: currentFolder?._id || null 
      })).unwrap();
      notify(`Successfully pasted ${totalItems} items.`, "success");
      dispatch(clearClipboard());
    } catch (error: any) {
      notify("Failed to paste items.", "error");
    }
  };

  return {
    executeDelete,
    executeRename,
    executeBulkDelete,
    executeDeleteFolder,
    executeRenameFolder,
    executeCreateFolder,
    executeDownloadFolder,
    executeBulkDownload,
    executeAIOrganization,
    executeAISynthesis,
    cancelAISynthesis,
    executeMoveOrCopy,
    executeFolderColor,
    executeDuplicate,
    executeCopy,
    executePaste,
    confirmAIOrganization,
  };
};
