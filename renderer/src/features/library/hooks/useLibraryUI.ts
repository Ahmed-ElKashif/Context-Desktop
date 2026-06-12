import { useMemo, useState } from "react";
import { DocumentData } from "../../../store/library/librarySlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store/hooks";
import { clearSelection } from "../../../store/library/selectionSlice";
import {
  setSort,
  setActiveTag,
  setSearchQuery as setReduxSearchQuery,
} from "../../../store/library/libraryUISlice";

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
      open: () => setIsUploadModalOpen(true),
      close: () => setIsUploadModalOpen(false),
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