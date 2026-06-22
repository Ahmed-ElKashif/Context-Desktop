import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchFolderContents,
  fetchFolderTree,
} from "../../../store/library/librarySlice";

import { useDebounce } from "../../../hooks/useDebounce";

interface UseLibraryDataOptions {
  activeFolderId: string | undefined;
  searchQuery: string;
  activeTag: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
  /** The guard ref from useLibraryNavigation */
  navPendingRef: React.MutableRefObject<boolean | string>;
}

/**
 * Owns all data-fetching side-effects for the Library:
 * - Master Fetcher useEffect (responds to navigation, search, sort changes)
 * - Folder-tree useEffect (keeps the sidebar up to date)
 * - handlePageChange and refetchCurrentView helpers
 */
export const useLibraryData = ({
  activeFolderId,
  searchQuery,
  activeTag,
  sortBy,
  sortOrder,
  navPendingRef,
}: UseLibraryDataOptions) => {
  const dispatch = useAppDispatch();
  const { pagination } = useAppSelector((state) => state.library);
  const limit = pagination?.limit || 10;

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // ── Master Fetcher ────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip the stale fetch that fires right after navigation.
    // The Redux search query clears instantly, but the URL takes a tick to update.
    if (navPendingRef.current) {
      const targetFolderId = navPendingRef.current === "ROOT" ? undefined : navPendingRef.current;
      if (activeFolderId !== targetFolderId) {
        return; // URL hasn't updated yet! Skip fetch.
      }
      navPendingRef.current = false; // We arrived!
    }

    dispatch(
      fetchFolderContents({
        folderId: activeFolderId,
        search: debouncedSearchQuery,
        tags: activeTag || undefined,
        page: 1,
        limit,
        sortBy,
        sortOrder,
      }),
    );
  }, [
    activeFolderId,
    debouncedSearchQuery,
    activeTag,
    sortBy,
    sortOrder,
    dispatch,
    limit,
    navPendingRef,
  ]);

  // ── Sidebar Tree ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchFolderTree());
  }, [dispatch]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchFolderContents({
        folderId: activeFolderId,
        search: debouncedSearchQuery,
        tags: activeTag || undefined,
        page: newPage,
        limit: pagination?.limit || 10,
        sortBy,
        sortOrder,
      }),
    );
  };

  return { debouncedSearchQuery, handlePageChange };
};
