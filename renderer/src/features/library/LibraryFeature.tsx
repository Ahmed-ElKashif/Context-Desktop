import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setActiveDocument,
} from "../../store/documentSlice";
import { updateProfile, updateUserLocalState } from "../../store/authSlice";
import {
  clearSelection,
  toggleDocSelection,
  toggleFolderSelection,
  toggleAllVisibleSelection,
  setSelection,
} from "../../store/selectionSlice";
import { Icon } from "../../components/ui/Icons";
import { useLibraryUI } from "./hooks/useLibraryUI";
import { handleShareClick } from "./utils/tableUtils";
import { FolderData } from "../../store/documentSlice";

// Hooks
import { useLibraryNavigation } from "./hooks/useLibraryNavigation";
import { useLibraryData } from "./hooks/useLibraryData";
import { useLibraryDropzone } from "./hooks/useLibraryDropzone";
import { useLibraryActions } from "./hooks/useLibraryActions";

// Components
import { LibraryTable } from "./components/LibraryTable/LibraryTable";
import { LibraryPagination } from "./components/LibraryPagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { RenameDialog } from "../../components/ui/RenameDialog";
import { UploadModal } from "./components/UploadModal";
import { LibrarySidebar } from "./components/LibrarySidebar";
import { LibraryDragOverlay } from "./components/LibraryDragOverlay";
import { LibraryHeader } from "./components/LibraryHeader";
import { BulkActionBar } from "./components/BulkActionBar";
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
    pagination,
    isSynthesizing,
    synthesisResult,
    activeDocument,
    globalFolderTree,
  } = useAppSelector((state) => state.document);

  const { selectedDocs, selectedFolders } = useAppSelector((state) => state.selection);
  const selectedDocIds = selectedDocs.map(d => d._id);
  const selectedFolderIds = selectedFolders.map(f => f._id);

  // 2. UI State & Local State
  const ui = useLibraryUI(documentsList);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Navigation Hook
  const { activeFolderId, setActiveFolderId, navPendingRef } = useLibraryNavigation();

  // 4. Data Fetching Hook
  const { debouncedSearchQuery, handlePageChange, refetchCurrentView } = useLibraryData({
    activeFolderId,
    searchQuery: ui.filters.searchQuery,
    activeTag: ui.filters.activeTag,
    sortBy: ui.sorting.sortBy,
    sortOrder: ui.sorting.sortOrder,
    navPendingRef,
  });

  // Derived visible items
  const visibleFolders = debouncedSearchQuery ? [] : foldersList;
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
    refetchCurrentView,
    activeDocument,
    selectedDocs,
    selectedFolders,
    selectedDocIds,
    selectedFolderIds,
    foldersList,
    visibleFolders,
    globalFolderTree,
  });

  const findFolderById = (folders: FolderData[], id: string): FolderData | undefined => {
    return folders.find((f) => f._id === id);
  };
  const folderToRename = ui.folderRenameModal.path ? findFolderById(globalFolderTree, ui.folderRenameModal.path) : null;

  // Keyboard Delete listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'Delete') {
        if (selectedDocIds.length + selectedFolderIds.length > 1) {
          ui.bulkDeleteModal.open();
        } else if (selectedDocIds.length === 1) {
          const doc = documentsList.find(d => d._id === selectedDocIds[0]);
          if (doc) ui.deleteModal.open(doc);
        } else if (selectedFolderIds.length === 1) {
          ui.folderDeleteModal.open(selectedFolderIds[0]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDocIds, selectedFolderIds, documentsList, ui.bulkDeleteModal, ui.deleteModal, ui.folderDeleteModal]);

  return (
    <div
      {...getRootProps()}
      className="flex-1 flex flex-row overflow-hidden relative overscroll-contain outline-none bg-light-surface dark:bg-[#0A0A0C]"
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
          onRenameFolder={ui.folderRenameModal.open}
          onDeleteFolder={ui.folderDeleteModal.open}
          onDownloadFolder={actions.executeDownloadFolder}
          activeTag={ui.filters.activeTag}
          onTagSelect={ui.filters.handleTagSelect}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
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
          <div id="tour-library-table" className="w-full h-full bg-white dark:bg-dark-surface rounded-xl border border-light-border dark:border-white/5 shadow-sm relative flex flex-col overflow-hidden">
            <div className="w-full flex-1 overflow-hidden flex flex-col">
              {isFetchingLibrary ? (
                <div className="flex items-center justify-center h-64 text-light-text/50 dark:text-white/50">
                  <Icon name="sync" className="animate-spin text-3xl" />
                </div>
              ) : (
                <LibraryTable
                  documents={documentsList}
                  childFolders={visibleFolders}
                  currentPage={pagination?.currentPage}
                  isAllSelected={isAllSelected}
                  onFolderDoubleClick={(folderId) => {
                    if (ui.filters.searchQuery) navPendingRef.current = folderId || "ROOT";
                    ui.filters.setSearchQuery("");
                    setActiveFolderId(folderId);
                  }}
                  onFolderRenameClick={ui.folderRenameModal.open}
                  onFolderDeleteClick={ui.folderDeleteModal.open}
                  onFolderDownloadClick={actions.executeDownloadFolder}
                  onRowClick={() => { }}
                  onRowDoubleClick={(doc) => {
                    dispatch(setActiveDocument(doc));
                    dispatch(updateUserLocalState({ lastActiveDocumentId: doc._id }));
                    dispatch(updateProfile({ lastActiveDocumentId: doc._id }));
                    navigate("/dashboard");
                  }}
                  onShareClick={(doc) => handleShareClick(doc.cloudinaryUrl)}
                  onRenameClick={ui.renameModal.open}
                  onDeleteClick={ui.deleteModal.open}
                  onSummarizeClick={(doc) => navigate(`/summary-local?id=${doc._id}`)}
                  onCompareClick={() => navigate(`/compare`)}
                  onRevealClick={(doc) => {
                    if (doc.originalClientPath && (window as any).electronAPI?.localFiles?.showItemInFolder) {
                      (window as any).electronAPI.localFiles.showItemInFolder(doc.originalClientPath);
                    }
                  }}
                  onOrganizeFolderClick={() => actions.executeAIOrganization()}
                  sortBy={ui.sorting.sortBy}
                  sortOrder={ui.sorting.sortOrder}
                  onSort={ui.sorting.handleSort}
                  selectedDocIds={selectedDocIds}
                  selectedFolderIds={selectedFolderIds}
                  onToggleSelection={(id, type) => {
                    if (type === "document") {
                      const doc = documentsList.find(d => d._id === id);
                      if (doc) dispatch(toggleDocSelection(doc));
                    } else {
                      const folder = visibleFolders.find(f => f._id === id);
                      if (folder) dispatch(toggleFolderSelection(folder));
                    }
                  }}
                  onToggleAll={() => dispatch(toggleAllVisibleSelection({
                    docs: documentsList,
                    folders: visibleFolders,
                    isAllVisibleSelected: isAllSelected
                  }))}
                  onSelectRange={(docs, folders) => {
                    dispatch(setSelection({ docs, folders }));
                  }}
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

      <BulkActionBar
        selectedCount={selectedDocIds.length + selectedFolderIds.length}
        onDelete={ui.bulkDeleteModal.open}
        onClear={() => dispatch(clearSelection())}
        onOrganizeAI={
          selectedDocs.some(doc => doc.isOrganized) ||
            selectedFolders.some(f => f.isAIGenerated)
            ? undefined
            : actions.executeAIOrganization
        }
        onSynthesizeAI={actions.executeAISynthesis}
      />

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
