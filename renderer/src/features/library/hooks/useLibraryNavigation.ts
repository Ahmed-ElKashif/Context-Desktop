import { useRef } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Manages URL-based folder navigation for the Library.
 * The active folder ID is stored as a `?folder=` query param in the URL,
 * which guarantees correct behaviour on browser refresh and eliminates
 * double-click state race conditions.
 */
export const useLibraryNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // The single source of truth: read directly from the URL.
  const activeFolderId = searchParams.get("folder") || undefined;

  /**
   * Safely update the `?folder=` param without clobbering other params.
   * Pass `undefined` (or call with no argument) to navigate to the root.
   */
  const setActiveFolderId = (folderId?: string) => {
    setSearchParams((prev) => {
      if (folderId) {
        prev.set("folder", folderId);
      } else {
        prev.delete("folder");
      }
      return prev;
    });
  };

  /**
   * Guard flag: set to `true` right before navigating while a search is
   * active so the Master Fetcher skips the stale debounced request that
   * fires before the search query has cleared.
   */
  const navPendingRef = useRef<boolean | string>(false);

  return { activeFolderId, setActiveFolderId, navPendingRef };
};
