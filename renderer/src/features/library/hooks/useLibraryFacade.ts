import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setActiveDocument } from "../../../store/workspace/workspaceSlice";
import { updateProfile, updateUserLocalState } from "../../../store/auth/authSlice";
import { clearSelection, selectSingle } from "../../../store/library/selectionSlice";
import { useLibraryUI } from "./useLibraryUI";
import { FolderData, DocumentData } from "../../../store/library/librarySlice";

// Hooks
import { useLibraryNavigation } from "./useLibraryNavigation";
import { useLibraryData } from "./useLibraryData";
import { useLibraryKeyboardShortcuts } from "./useLibraryKeyboardShortcuts";
import { useLibraryDropzone } from "./useLibraryDropzone";
import { useLibraryActions } from "./useLibraryActions";
import { useSelectionManager, LibraryItem } from "./useSelectionManager";
import { useRubberBand } from "./useRubberBand";
import { useContextMenu } from "./useContextMenu";

export const useLibraryFacade = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Redux State
  const {
    currentFolder,
    foldersList,
    documentsList,
    isFetchingLibrary,
    isRevalidating,
    pagination,
    isSynthesizing,
    synthesisResult,
    globalFolderTree,
  } = useAppSelector((state) => state.library);

  const { selectedDocs, selectedFolders, focusId } = useAppSelector((state) => state.selection);
  const selectedDocIds = selectedDocs.map(d => d._id);
  const selectedFolderIds = selectedFolders.map(f => f._id);

  // 2. UI State & Local State
  const ui = useLibraryUI(documentsList);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Navigation Hook
  const { activeFolderId, setActiveFolderId, navPendingRef } = useLibraryNavigation();

  // 4. Data Fetching Hook
  const { debouncedSearchQuery, handlePageChange } = useLibraryData({
    activeFolderId,
    searchQuery: ui.filters.searchQuery,
    activeTag: ui.filters.activeTag,
    sortBy: ui.sorting.sortBy,
    sortOrder: ui.sorting.sortOrder,
    navPendingRef,
  });

  // Derived visible items
  const visibleFolders = useMemo(() => {
    return debouncedSearchQuery ? [] : foldersList;
  }, [debouncedSearchQuery, foldersList]);
  
  const visibleItemsCount = documentsList.length + visibleFolders.length;
  const isAllSelected = visibleItemsCount > 0 &&
    documentsList.every(doc => selectedDocIds.includes(doc._id)) &&
    visibleFolders.every(f => selectedFolderIds.includes(f._id));

  // 5. Drag & Drop Hook
  const dropzone = useLibraryDropzone(ui.uploadModal.open);

  // 6. Action Handlers Hook
  const actions = useLibraryActions({
    ui,
    selectedDocs,
    selectedFolders,
    selectedDocIds,
    selectedFolderIds,
  });

  // 7. Selection Manager
  const { handleItemClick, handleSelectAll } = useSelectionManager(selectedDocs, selectedFolders);

  const allOrderedItems = useMemo<LibraryItem[]>(() => [
    ...visibleFolders.map(f => ({ type: "folder" as const, item: f })),
    ...documentsList.map(d => ({ type: "doc" as const, item: d }))
  ], [visibleFolders, documentsList]);

  // 8. Rubber Band Lasso
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rubberBandOverlay } = useRubberBand(tableContainerRef, allOrderedItems, selectedDocs, selectedFolders);

  // 9. Context Menu
  const { openMenu } = useContextMenu({
    onOpenDocReader: (doc: DocumentData) => {
      navigate(`/read/${doc._id}`, { state: { returnUrl: location.pathname + location.search } });
    },
    onOpenDocWorkspace: (doc: DocumentData) => {
      dispatch(setActiveDocument(doc));
      dispatch(updateUserLocalState({ lastActiveDocumentId: doc._id }));
      dispatch(updateProfile({ lastActiveDocumentId: doc._id }));
      navigate("/workspace");
    },
    onOpenFolder: (folder: FolderData) => {
      const folderId = folder._id;
      if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
      ui.filters.setSearchQuery("");
      setActiveFolderId(folderId);
    },
    onRenameDoc: (doc: DocumentData) => ui.renameModal.open(doc),
    onRenameFolder: (folderPath: string) => ui.folderRenameModal.open(folderPath),
    onDeleteDoc: () => ui.bulkDeleteModal.open(),
    onDeleteFolder: (folderPath: string) => ui.folderDeleteModal.open(folderPath),
    onBulkDelete: () => ui.bulkDeleteModal.open(),
    onDownloadFolder: (folderId: string, folderName: string) => actions.executeDownloadFolder(folderId, folderName),
    onBulkDownload: () => actions.executeBulkDownload(),
    onOrganizeAI: (folderId?: string) => actions.executeAIOrganization(folderId),
    onSynthesizeAI: (folderId?: string) => actions.executeAISynthesis(folderId),
    onUploadClick: () => ui.uploadModal.open(),
    onSelectAll: () => handleSelectAll(documentsList, visibleFolders),
    selectedDocIds,
    selectedFolderIds,
  });

  // 10. Polish: Pagination Clear
  useEffect(() => {
    dispatch(clearSelection());
  }, [pagination?.currentPage, debouncedSearchQuery, activeFolderId, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleSelectAll(documentsList, visibleFolders);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [documentsList, visibleFolders, handleSelectAll]);

  useLibraryKeyboardShortcuts(
    allOrderedItems,
    selectedDocIds,
    selectedFolderIds,
    (item, type) => {
      if (type === "doc") {
        const doc = item as DocumentData;
        navigate(`/read/${doc._id}`, { state: { returnUrl: location.pathname + location.search } });
      } else {
        const folderId = (item as FolderData)._id;
        if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
        ui.filters.setSearchQuery("");
        setActiveFolderId(folderId);
      }
    },
    () => {
      if (selectedDocIds.length > 0 && selectedFolderIds.length === 0) {
        if (selectedDocIds.length === 1) {
          const doc = documentsList.find(d => d._id === selectedDocIds[0]);
          if (doc) ui.deleteModal.open(doc);
        } else {
          ui.bulkDeleteModal.open();
        }
      } else if (selectedFolderIds.length === 1 && selectedDocIds.length === 0) {
        const folder = visibleFolders.find(f => f._id === selectedFolderIds[0]);
        if (folder) ui.folderDeleteModal.open(folder._id);
      }
    },
    (item, type) => {
      if (type === "doc") {
        ui.renameModal.open(item as DocumentData);
      } else {
        const folder = item as FolderData;
        if (!folder.isAIGenerated && folder.name?.toLowerCase() !== "random files") {
          ui.folderRenameModal.open(folder._id);
        }
      }
    }
  );

  const findFolderById = (folders: FolderData[], id: string): FolderData | undefined => {
    return folders.find((f) => f._id === id);
  };
  const folderToRename = ui.folderRenameModal.path ? findFolderById(globalFolderTree, ui.folderRenameModal.path) : null;

  const isHardLoading = isFetchingLibrary && !isRevalidating && documentsList.length === 0 && foldersList.length === 0;

  return {
    state: {
      currentFolder,
      foldersList,
      documentsList,
      isFetchingLibrary,
      isRevalidating,
      pagination,
      isSynthesizing,
      synthesisResult,
      globalFolderTree,
      selectedDocIds,
      selectedFolderIds,
      focusId,
      visibleFolders,
      isAllSelected,
      isHardLoading,
      folderToRename,
      isMobileMenuOpen,
    },
    actions: {
      handleSelectAll,
      handleItemClick,
      handlePageChange,
      setActiveFolderId,
      handleNavigate: (folderId?: string | null) => {
        if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
        ui.filters.setSearchQuery("");
        setActiveFolderId(folderId || undefined);
      },
      setIsMobileMenuOpen,
      clearSelection: () => dispatch(clearSelection()),
      selectSingle: (item: any, type: any) => dispatch(selectSingle({ item, type })),
      handleRowDoubleClick: (item: any, type: any) => {
        if (type === "doc") {
          const doc = item as DocumentData;
          navigate(`/read/${doc._id}`, { state: { returnUrl: location.pathname + location.search } });
        } else {
          const folderId = (item as FolderData)._id;
          if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
          ui.filters.setSearchQuery("");
          setActiveFolderId(folderId);
        }
      },
      handleRowContextMenu: (e: React.MouseEvent, item: any, type: any) => {
        const isSelected = type === "doc" 
          ? selectedDocIds.includes(item._id) 
          : selectedFolderIds.includes(item._id);
        if (!isSelected) dispatch(selectSingle({ item, type }));
        openMenu(e, { type, item } as any);
      },
      handleRowDotsClick: (e: React.MouseEvent, item: any, type: any) => {
        const isSelected = type === "doc" 
          ? selectedDocIds.includes(item._id) 
          : selectedFolderIds.includes(item._id);
        if (!isSelected) dispatch(selectSingle({ item, type }));
        openMenu(e, { type, item } as any);
      },
      ...actions,
    },
    refs: {
      tableContainerRef,
      navPendingRef,
    },
    ui,
    dropzone,
    rubberBand: { rubberBandOverlay },
    contextMenu: { openMenu }
  };
};
