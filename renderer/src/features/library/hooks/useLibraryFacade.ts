import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { setActiveDocument } from "../../../store/workspace/workspaceSlice";
import { fetchFolderContents, fetchFolderTree } from "../../../store/library/thunks/folderThunks";
import { clearSelection, selectSingle } from "../../../store/library/selectionSlice";
import { useLibraryUI } from "./useLibraryUI";

// Hooks
import { useLibraryKeyboardShortcuts } from "./useLibraryKeyboardShortcuts";
import { useLibraryDropzone } from "./useLibraryDropzone";
import { useLibraryActions } from "./useLibraryActions";
import { useSelectionManager, LibraryItem } from "./useSelectionManager";
import { useRubberBand } from "./useRubberBand";
import { useContextMenu } from "./useContextMenu";
import { handleWebNativeFolderSelect } from "../utils/uploadHelpers";
import { useDebounce } from "../../../hooks/useDebounce";
import { addNotification } from "../../../store/ui/notificationSlice";
import { generateRawMarkdownString } from "../../../utils/downloadUtils";

export const useLibraryFacade = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Redux State
  const {
    documentsList,
    foldersList,
    isFetchingLibrary,
    isRevalidating,
    pagination,
    synthesisResult,
    currentFolder,
    globalFolderTree,
  } = useSelector((state: RootState) => state.library);

  const { sortBy, sortOrder } = useSelector((state: RootState) => state.libraryUI);
  const clipboardState = useSelector((state: RootState) => state.clipboard);

  const { selectedDocs, selectedFolders, focusId } = useSelector(
    (state: RootState) => state.selection,
  );

  const selectedDocIds = useMemo(() => selectedDocs.map((d) => d._id), [selectedDocs]);
  const selectedFolderIds = useMemo(() => selectedFolders.map((f) => f._id), [selectedFolders]);
  const selectedFolderId = currentFolder?._id || null;

  // 2. UI State & Local State
  const ui = useLibraryUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Navigation Helpers
  const handleOpenReader = (doc: any) => {
    navigate(`/read/${doc._id}`, { state: { returnUrl: location.pathname + location.search } });
  };

  const handleOpenWorkspace = (doc: any) => {
    dispatch(setActiveDocument(doc));
    navigate("/workspace");
  };

  const handleFolderSelect = (id?: string | null) => {
    dispatch(fetchFolderContents({ folderId: id || undefined, page: 1 }));
    dispatch(clearSelection());
  };

  // 4. Derived visible items
  const allOrderedItems = useMemo<LibraryItem[]>(
    () => [
      ...foldersList.map((f: any) => ({ type: "folder" as const, item: f })),
      ...documentsList.map((d: any) => ({ type: "doc" as const, item: d })),
    ],
    [foldersList, documentsList],
  );

  // 5. Drag & Drop Hook
  const dropzone = useLibraryDropzone(() => ui.uploadModal.open(currentFolder?._id));

  // 6. Action Handlers Hook
  const actions = useLibraryActions({
    ui,
    selectedDocs,
    selectedFolders,
    selectedDocIds,
    selectedFolderIds,
    currentFolder,
    clipboardState,
  });

  // 7. Selection Manager
  const { handleItemClick, handleSelectAll, isAllSelected } = useSelectionManager(selectedDocIds, selectedFolderIds);
  const isAllSelectedBool = isAllSelected(documentsList, foldersList);

  // 8. Rubber Band Lasso
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const { rubberBandOverlay } = useRubberBand(
    tableContainerRef as React.RefObject<HTMLDivElement>,
    allOrderedItems,
    selectedDocIds,
    selectedFolderIds,
  );

  // 9. Context Menu
  const { openMenu } = useContextMenu({
    onOpenDocReader: (doc: any) => handleOpenReader(doc),
    onOpenDocWorkspace: (doc: any) => handleOpenWorkspace(doc),
    onOpenFolder: (folder: any) => {
      dispatch(fetchFolderContents({ folderId: folder._id || undefined, page: 1 }));
      dispatch(clearSelection());
    },
    onRenameDoc: (doc: any) => ui.renameModal.open(doc),
    onRenameFolder: (folderPath) => ui.folderRenameModal.open(folderPath),
    onDeleteDoc: () => ui.bulkDeleteModal.open(),
    onDeleteFolder: (folderPath) => ui.folderDeleteModal.open(folderPath),
    onBulkDelete: () => ui.bulkDeleteModal.open(),
    onDownloadFolder: (folderId, folderName) => actions.executeDownloadFolder(folderId, folderName),
    onBulkDownload: () => actions.executeBulkDownload(),
    onOrganizeAI: (folderId?: string) => actions.executeAIOrganization(folderId),
    onSynthesizeAI: (folderId?: string) => actions.executeAISynthesis(folderId),
    onCreateFolder: () => ui.createFolderModal.open(),
    onUploadFilesInCurrentDir: async () => {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // Desktop uses selectBatchFolder? Actually, desktop might not have a generic 'select files' exposed
        // unless there is electronAPI.localFiles.selectFiles? I didn't see one.
        // Let's fallback to the HTML input for file selection which works in Electron.
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) {
            dropzone.setGlobalDroppedFiles(files);
            dropzone.setGlobalDroppedPaths(files.map(f => f.name));
            ui.uploadModal.open(currentFolder?._id ?? null);
          }
        };
        input.click();
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) {
            dropzone.setGlobalDroppedFiles(files);
            dropzone.setGlobalDroppedPaths(files.map(f => f.name));
            ui.uploadModal.open(currentFolder?._id ?? null);
          }
        };
        input.click();
      }
    },
    onUploadFolderInCurrentDir: async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
          const result = await (window as any).electronAPI.localFiles.selectBatchFolder();
          if (result && result.files && result.files.length > 0) {
            dropzone.setGlobalDroppedFiles(result.files);
            const paths = result.files.map((f: any) => f.clientPath || f.name);
            dropzone.setGlobalDroppedPaths(paths);
            ui.uploadModal.open(currentFolder?._id ?? null);
          }
        } else {
          const files = await handleWebNativeFolderSelect();
          if (files && files.length > 0) {
            dropzone.setGlobalDroppedFiles(files);
            const paths = files.map((f: any) => f.path || f.name);
            dropzone.setGlobalDroppedPaths(paths);
            ui.uploadModal.open(currentFolder?._id ?? null);
          }
        }
      } catch (err) {
        console.error("Folder selection cancelled or failed", err);
      }
    },
    onMove: () => ui.folderPickerModal.open('move'),
    onCopy: () => ui.folderPickerModal.open('copy'),
    onChangeFolderColor: (folderId, color) => actions.executeFolderColor(folderId, color),
    onShare: (doc: any) => {
      if (doc.fileType === "TextSnippet") {
        navigator.clipboard.writeText(generateRawMarkdownString(doc));
        dispatch(addNotification({ message: "Markdown copied to clipboard!", type: "success" }));
      } else {
        if (doc.cloudinaryUrl) {
          navigator.clipboard.writeText(doc.cloudinaryUrl);
          dispatch(addNotification({ message: "Share link copied to clipboard!", type: "success" }));
        } else {
          dispatch(addNotification({ message: "No share link available", type: "error" }));
        }
      }
    },
    clipboardState: clipboardState,
    onDuplicate: () => actions.executeDuplicate(),
    onCopyClipboard: () => actions.executeCopy(),
    onPasteClipboard: () => actions.executePaste(),
    onSelectAll: () => handleSelectAll(documentsList, foldersList),
    selectedDocIds,
    selectedFolderIds,
  });

  // 10. Data Fetching
  useEffect(() => {
    dispatch(fetchFolderTree());
  }, [dispatch]);

  const debouncedSearch = useDebounce(ui.filters.searchQuery, 400);

  useEffect(() => {
    dispatch(
      fetchFolderContents({ 
        folderId: selectedFolderId || undefined, 
        search: debouncedSearch || undefined,
        tags: ui.filters.activeTag || undefined,
        page: 1,
        sortBy,
        sortOrder
      }),
    );
  }, [dispatch, selectedFolderId, sortBy, sortOrder, debouncedSearch, ui.filters.activeTag]);

  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchFolderContents({
        folderId: selectedFolderId || undefined,
        search: ui.filters.searchQuery,
        tags: ui.filters.activeTag || undefined,
        page: newPage,
        limit: pagination?.limit || 50,
        sortBy,
        sortOrder,
      })
    );
  };

  // 11. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleSelectAll(documentsList, foldersList);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch(clearSelection());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [documentsList, foldersList, handleSelectAll, dispatch]);

  useLibraryKeyboardShortcuts(
    allOrderedItems,
    selectedDocIds,
    selectedFolderIds,
    (item, type) => {
      if (type === "doc") {
        handleOpenReader(item);
      } else {
        handleFolderSelect((item as any)._id);
      }
    },
    () => {
      if (selectedDocIds.length > 0 || selectedFolderIds.length > 0) {
        ui.bulkDeleteModal.open();
      }
    },
    (item, type) => {
      if (type === "doc") {
        ui.renameModal.open(item as any);
      } else {
        ui.folderRenameModal.open((item as any).path);
      }
    },
    () => ui.createFolderModal.open(),
    () => actions.executeCopy(),
    () => actions.executePaste()
  );

  const isHardLoading = isFetchingLibrary && !isRevalidating && documentsList.length === 0 && foldersList.length === 0;

  return {
    state: {
      currentFolder,
      foldersList,
      documentsList,
      isFetchingLibrary,
      isRevalidating,
      pagination,
      synthesisResult,
      selectedDocIds,
      selectedFolderIds,
      focusId,
      isAllSelected: isAllSelectedBool,
      isHardLoading,
      isMobileMenuOpen,
      sortBy,
      sortOrder,
      globalFolderTree,
    },
    actions: {
      handleSelectAll,
      handleItemClick,
      handlePageChange,
      handleFolderSelect,
      setIsMobileMenuOpen,
      clearSelection: () => dispatch(clearSelection()),
      selectSingle: (item: any, type: any) => dispatch(selectSingle({ item, type })),
      handleRowDoubleClick: (item: any, type: any) => {
        if (type === "folder") {
          handleFolderSelect(item._id);
        } else {
          handleOpenReader(item);
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
    },
    ui,
    dropzone,
    rubberBand: { rubberBandOverlay },
    contextMenu: { openMenu }
  };
};
