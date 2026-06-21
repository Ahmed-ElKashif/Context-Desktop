import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setActiveDocument } from "../../store/workspace/workspaceSlice";
import { updateProfile, updateUserLocalState } from "../../store/auth/authSlice";
import { clearSelection } from "../../store/library/selectionSlice";
import { Icon } from "../../components/ui/core/Icons";
import { useLibraryUI } from "./hooks/useLibraryUI";
import { FolderData, DocumentData } from "../../store/library/librarySlice";

// Hooks
import { useLibraryNavigation } from "./hooks/useLibraryNavigation";
import { useLibraryData } from "./hooks/useLibraryData";
import { useLibraryKeyboardShortcuts } from "./hooks/useLibraryKeyboardShortcuts";
import { useLibraryDropzone } from "./hooks/useLibraryDropzone";
import { useLibraryActions } from "./hooks/useLibraryActions";
import { useSelectionManager, LibraryItem } from "./hooks/useSelectionManager";
import { useRubberBand } from "./hooks/useRubberBand";
import { useContextMenu } from "./hooks/useContextMenu";

// Components
import { LibraryTable } from "./components/LibraryTable/LibraryTable";
import { LibraryPagination } from "./components/LibraryPagination";
import { ConfirmDialog } from "../../components/ui/feedback/ConfirmDialog";
import { RenameDialog } from "../../components/ui/feedback/RenameDialog";
import { UploadModal } from "./components/UploadModal";
import { LibrarySidebar } from "./components/LibrarySidebar";
import { LibraryDragOverlay } from "./components/LibraryDragOverlay";
import { LibraryHeader } from "./components/LibraryHeader";
import { SynthesisModal } from "./components/SynthesisModal";


export const LibraryFeature = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  const { selectedDocs, selectedFolders } = useAppSelector((state) => state.selection);
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
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    globalDroppedFiles,
    globalDroppedPaths,
    setGlobalDroppedFiles,
    setGlobalDroppedPaths,
  } = useLibraryDropzone(ui.uploadModal.open);

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
      navigate(`/read/${doc._id}`);
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
    onRenameDoc: (doc: DocumentData) => console.log("Rename document", doc),
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
      // Don't trigger if user is typing in an input/textarea
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      // Ctrl+A / Cmd+A : Select All
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
        navigate(`/read/${doc._id}`);
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

  return (
    <div
      {...getRootProps()}
      className="flex-1 flex flex-row overflow-hidden relative overscroll-contain outline-none bg-light-surface dark:bg-[#0A0A0C]"
      onMouseDown={(e) => {
        // Clear selection when clicking on empty area outside the table
        // But only if it's the main container (not the sidebar or inner elements)
        if (e.target === e.currentTarget) {
          dispatch(clearSelection());
        }
      }}
    >
      <input {...getInputProps()} />
      <LibraryDragOverlay isDragActive={isDragActive} />

      <div id="tour-library-sidebar" className="h-full">
        <LibrarySidebar
          currentFolder={currentFolder}
          onNavigate={(folderId) => {
            if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
            ui.filters.setSearchQuery("");
            setActiveFolderId(folderId);
          }}
          activeTag={ui.filters.activeTag}
          onTagSelect={ui.filters.handleTagSelect}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onContextMenu={(e: React.MouseEvent, folder: any, type: any) => openMenu(e, { type: "folder", item: folder }, type)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative dark:shadow-none">
        <div id="tour-library-header">
          <LibraryHeader
            currentFolder={currentFolder}
            onOpenUpload={ui.uploadModal.open}
            activeTag={ui.filters.activeTag}
            searchQuery={ui.filters.searchQuery}
            onSearchChange={ui.filters.setSearchQuery}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onNavigate={(folderId) => {
              if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
              ui.filters.setSearchQuery("");
              setActiveFolderId(folderId);
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-0 bg-light-bg dark:bg-dark-bg scroll-smooth relative">
            <div 
            id="tour-library-table" 
            ref={tableContainerRef}
            className="w-full h-full bg-white dark:bg-dark-surface rounded-xl border border-light-border dark:border-white/5 shadow-sm relative flex flex-col overflow-hidden"
            onContextMenu={(e) => {
              // Only open generic context menu if right clicking in empty space of the container
              if (e.target === e.currentTarget) {
                openMenu(e);
              }
            }}
          >
            {(isRevalidating || (isFetchingLibrary && !isHardLoading)) && (
              <div className="absolute top-0 left-0 w-full h-0.5 z-50 overflow-hidden bg-primary/20">
                <div className="h-full bg-primary animate-progress-indeterminate"></div>
              </div>
            )}
            
            {rubberBandOverlay}

            <div className="w-full flex-1 overflow-hidden flex flex-col relative">
              {isHardLoading ? (
                <div className="flex items-center justify-center h-64 text-light-text/60 dark:text-white/60">
                  <Icon name="sync" className="animate-spin text-3xl" />
                </div>
              ) : (
                <LibraryTable
                  documents={documentsList}
                  childFolders={visibleFolders}
                  currentPage={pagination?.currentPage}
                  isAllSelected={isAllSelected}
                  selectedDocIds={selectedDocIds}
                  selectedFolderIds={selectedFolderIds}
                  sortBy={ui.sorting.sortBy}
                  sortOrder={ui.sorting.sortOrder}
                  onSort={ui.sorting.handleSort}
                  onToggleAll={() => handleSelectAll(documentsList, visibleFolders)}
                  onRowClick={handleItemClick}
                  onRowDoubleClick={(item, type) => {
                    if (type === "doc") {
                      const doc = item as DocumentData;
                      navigate(`/read/${doc._id}`);
                    } else {
                      const folderId = (item as FolderData)._id;
                      if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
                      ui.filters.setSearchQuery("");
                      setActiveFolderId(folderId);
                    }
                  }}
                  onRowContextMenu={(e, item, type) => openMenu(e, { type, item } as any)}
                  onRowDotsClick={(e, item, type) => openMenu(e, { type, item } as any)}
                  onTableContextMenu={(e) => openMenu(e)}
                  onEmptySpaceClick={() => dispatch(clearSelection())}
                />
              )}
            </div>
            {pagination && !isFetchingLibrary && (
              <LibraryPagination
                {...pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      <SynthesisModal
        isOpen={isSynthesizing || !!synthesisResult}
        isLoading={isSynthesizing}
        synthesisResult={synthesisResult}
        onClose={actions.cancelAISynthesis}
      />

      <UploadModal
        isOpen={ui.uploadModal.isOpen}
        onClose={ui.uploadModal.close}
        externalFiles={globalDroppedFiles}
        externalPaths={globalDroppedPaths}
        onClearExternal={() => {
          setGlobalDroppedFiles([]);
          setGlobalDroppedPaths([]);
        }}
      />

      <ConfirmDialog
        isOpen={ui.bulkDeleteModal.isOpen}
        onClose={ui.bulkDeleteModal.close}
        onConfirm={actions.executeBulkDelete}
        title="Delete Multiple Records"
        message={`Are you sure you want to permanently delete ${selectedDocIds.length + selectedFolderIds.length} selected items?`}
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
        currentName={folderToRename?.name || "Rename Folder"}
        isLoading={ui.loading.isRenaming}
      />
    </div>
  );
};
