import { useMemo, useState, useEffect } from "react";
import { DocumentData } from "../../../store/documentSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store/hooks";
import { clearSelection } from "../../../store/selectionSlice";
import {
  setSort,
  setActiveTag,
  setSearchQuery as setReduxSearchQuery,
} from "../../../store/libraryUISlice";

export const useLibraryUI = (documentsList: DocumentData[] = []) => {

  const dispatch = useDispatch();

  // 2. Document Modal States
  const [docToDelete, setDocToDelete] = useState<DocumentData | null>(null);
  const [docToRename, setDocToRename] = useState<DocumentData | null>(null);

  // 2. Folder Modal States
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);

  // 3. Global UI States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [externalUploadPaths, setExternalUploadPaths] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  // 4. Global UI State (Sorting & Filters from Redux)
  const {
    sortBy,
    sortOrder,
    activeTag,
    searchQuery,
  } = useAppSelector((state) => state.libraryUI);

  // --- 🧠 THE BRAIN: Derived State via useMemo ---
  const knownTags = useMemo(() => {
    // 1. Accumulate Tags
    const tags = new Set<string>();
    documentsList.forEach((doc) => doc.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [documentsList]);

  // --- Global Event Listeners for Keyboard Shortcuts ---
  useEffect(() => {
    const handleOpenUpload = () => setIsUploadModalOpen(true);
    const handleExternalUpload = (e: Event) => {
      const paths: string[] = (e as CustomEvent).detail || [];
      if (paths.length > 0) {
        setExternalUploadPaths((prev) => Array.from(new Set([...prev, ...paths])));
        setIsUploadModalOpen(true);
      }
      delete (window as any).pendingExternalUpload;
    };
    const handleCloseModals = () => {
      setIsUploadModalOpen(false);
      setExternalUploadPaths([]);
      setIsBulkDeleteModalOpen(false);
      setDocToDelete(null);
      setDocToRename(null);
      setFolderToDelete(null);
      setFolderToRename(null);
    };

    // Check for any pending external uploads from cold start
    if ((window as any).pendingExternalUpload) {
      const pendingPaths = (window as any).pendingExternalUpload;
      if (pendingPaths.length > 0) {
        setExternalUploadPaths(pendingPaths);
        setIsUploadModalOpen(true);
      }
      delete (window as any).pendingExternalUpload;
    }

    window.addEventListener("open-upload-modal", handleOpenUpload);
    window.addEventListener("external-upload", handleExternalUpload);
    window.addEventListener("close-all-modals", handleCloseModals);
    
    return () => {
      window.removeEventListener("open-upload-modal", handleOpenUpload);
      window.removeEventListener("external-upload", handleExternalUpload);
      window.removeEventListener("close-all-modals", handleCloseModals);
    };
  }, []);

  // --- Handlers ---


  const handleSort = (column: string) => {
    dispatch(setSort(column));
  };


  // --- Filter Handlers ---
  const handleTagSelect = (tag: string | null) => {
    dispatch(setActiveTag(tag));
    dispatch(clearSelection());
  };



  const handleSearchQuery = (query: string) => {
    dispatch(setReduxSearchQuery(query));
  };




  return {
    deleteModal: {
      doc: docToDelete,
      open: setDocToDelete,
      close: () => setDocToDelete(null),
    },
    renameModal: {
      doc: docToRename,
      open: setDocToRename,
      close: () => setDocToRename(null),
    },
    folderDeleteModal: {
      path: folderToDelete,
      open: setFolderToDelete,
      close: () => setFolderToDelete(null),
    },
    folderRenameModal: {
      path: folderToRename,
      open: setFolderToRename,
      close: () => setFolderToRename(null),
    },
    uploadModal: {
      isOpen: isUploadModalOpen,
      externalPaths: externalUploadPaths,
      open: () => setIsUploadModalOpen(true),
      close: () => {
        setIsUploadModalOpen(false);
        setExternalUploadPaths([]);
      },
    },
    bulkDeleteModal: {
      isOpen: isBulkDeleteModalOpen,
      open: () => setIsBulkDeleteModalOpen(true),
      close: () => setIsBulkDeleteModalOpen(false),
    },
    loading: {
      isDeleting,
      setIsDeleting,
      isRenaming,
      setIsRenaming,
    },
    sorting: { sortBy, sortOrder, handleSort },

    filters: {
      activeTag,
      handleTagSelect,
      knownTags,
      searchQuery,
      setSearchQuery: handleSearchQuery,
    },
  };
};