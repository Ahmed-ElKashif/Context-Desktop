import React from "react";
import { Icon } from "../../components/ui/core/Icons";

// Components
import { LibrarySidebar } from "./components/LibrarySidebar";
import { LibraryHeader } from "./components/LibraryHeader";
import { LibraryTable } from "./components/LibraryTable/LibraryTable";
import { LibraryPagination } from "./components/LibraryPagination";
import { LibraryDragOverlay } from "./components/LibraryDragOverlay";
import { LibraryModals } from "./components/LibraryModals";

// Hooks
import { useLibraryFacade } from "./hooks/useLibraryFacade";

export const LibraryFeature = () => {
  const { state, actions, refs: { tableContainerRef }, ui, dropzone, rubberBand, contextMenu } = useLibraryFacade();

  return (
    <div
      {...dropzone.getRootProps()}
      className="flex-1 flex flex-row overflow-hidden relative overscroll-contain outline-none bg-light-surface dark:bg-[#0A0A0C]"
      onMouseDown={(e) => {
        // Clear selection when clicking on empty area outside the table
        // But only if it's the main container (not the sidebar or inner elements)
        if (e.target === e.currentTarget) {
          actions.clearSelection();
        }
      }}
    >
      <input {...dropzone.getInputProps()} />
      <LibraryDragOverlay isDragActive={dropzone.isDragActive} />

      <div id="tour-library-sidebar" className="h-full">
        <LibrarySidebar
          currentFolder={state.currentFolder}
          onNavigate={actions.handleNavigate}
          activeTag={ui.filters.activeTag}
          onTagSelect={ui.filters.handleTagSelect}
          isMobileOpen={state.isMobileMenuOpen}
          onCloseMobile={() => actions.setIsMobileMenuOpen(false)}
          onContextMenu={(e: React.MouseEvent, folder: any, type: any) => contextMenu.openMenu(e, { type: "folder", item: folder }, type)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative dark:shadow-none">
        <div id="tour-library-header">
          <LibraryHeader
            currentFolder={state.currentFolder}
            onOpenUpload={ui.uploadModal.open}
            activeTag={ui.filters.activeTag}
            searchQuery={ui.filters.searchQuery}
            onSearchChange={ui.filters.setSearchQuery}
            onToggleMobileMenu={() => actions.setIsMobileMenuOpen(!state.isMobileMenuOpen)}
            onNavigate={actions.handleNavigate}
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
                contextMenu.openMenu(e);
              }
            }}
          >
            {(state.isRevalidating || (state.isFetchingLibrary && !state.isHardLoading)) && (
              <div className="absolute top-0 left-0 w-full h-0.5 z-50 overflow-hidden bg-primary/20">
                <div className="h-full bg-primary animate-progress-indeterminate"></div>
              </div>
            )}
            
            {rubberBand.rubberBandOverlay}

            <div className="w-full flex-1 overflow-hidden flex flex-col relative">
              {state.isHardLoading ? (
                <div className="flex items-center justify-center h-64 text-light-text/60 dark:text-white/60">
                  <Icon name="sync" className="animate-spin text-3xl" />
                </div>
              ) : (
                <LibraryTable
                  documents={state.documentsList}
                  childFolders={state.visibleFolders}
                  currentPage={state.pagination?.currentPage}
                  isAllSelected={state.isAllSelected}
                  selectedDocIds={state.selectedDocIds}
                  selectedFolderIds={state.selectedFolderIds}
                  focusId={state.focusId}
                  sortBy={ui.sorting.sortBy}
                  sortOrder={ui.sorting.sortOrder}
                  onSort={ui.sorting.handleSort}
                  onToggleAll={() => actions.handleSelectAll(state.documentsList, state.visibleFolders)}
                  onRowClick={actions.handleItemClick}
                  onRowDoubleClick={actions.handleRowDoubleClick}
                  onRowContextMenu={actions.handleRowContextMenu}
                  onRowDotsClick={actions.handleRowDotsClick}
                  onTableContextMenu={(e) => contextMenu.openMenu(e)}
                  onEmptySpaceClick={() => actions.clearSelection()}
                />
              )}
            </div>
            {state.pagination && !state.isFetchingLibrary && (
              <LibraryPagination
                {...state.pagination}
                onPageChange={actions.handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      <LibraryModals 
        ui={ui} 
        actions={actions} 
        state={state} 
        dropzone={dropzone} 
      />
    </div>
  );
};
