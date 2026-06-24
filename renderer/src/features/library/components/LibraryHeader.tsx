import React, { useState } from "react";
import { Icon } from "../../../components/ui/core/Icons";
import { FolderData } from "../../../store/library/librarySlice";
// 🛠️ THE FIX 1: Bring in useAppSelector to grab our hierarchical breadcrumbs from the backend!
import { useAppSelector } from "../../../store/hooks";

interface LibraryHeaderProps {
  activeTag?: string | null;
  currentFolder?: FolderData | null;
  onOpenUpload: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileMenu: () => void;
  onNavigate: (folderId?: string) => void;
}

export const LibraryHeader = ({
  activeTag,
  currentFolder,
  onOpenUpload,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
  onNavigate,
}: LibraryHeaderProps) => {
  // 🛠️ THE FIX 2: Grab the ancestor breadcrumbs (array of real folder objects) from Redux
  const { breadcrumbs } = useAppSelector((state) => state.library);

  // Unified navigate function for all buttons
  const handleNavigate = (folderId?: string) => {
    onNavigate(folderId);
  };

  const handleGoBack = () => {
    if (currentFolder) {
      // If parentFolder is null, it means we go back to root!
      handleNavigate(currentFolder.parentFolder || undefined);
    }
  };

  const renderBreadcrumbs = () => {
    // --- SCENARIO A: Tag Search ---
    if (activeTag) {
      return (
        <h1 className="text-base md:text-lg font-bold text-light-text dark:text-white tracking-tight flex items-center gap-2">
          <button
            onClick={() => handleNavigate(undefined)}
            className="text-light-text/70 dark:text-white/60 hover:text-light-text dark:hover:text-white transition-colors bg-light-border/20 dark:bg-white/5 rounded-lg w-7 h-7 flex items-center justify-center"
            title="Go Back to Root"
          >
            <Icon name="arrow_back" className="text-lg" />
          </button>
          #{activeTag}
        </h1>
      );
    }

    // --- SCENARIO B: File Explorer (Windows Style) ---

    const mappedBreadcrumbs = breadcrumbs.map((b: any) => ({ _id: b.id || b._id, name: b.name }));

    const trail = [
      { _id: undefined, name: "All Documents" }, // 1. Always start with Root
      ...mappedBreadcrumbs, // 2. Add all parents (if any)
    ];

    // 3. Add the current folder at the end, but only if it's not already the last item
    if (currentFolder && trail[trail.length - 1]._id !== currentFolder._id) {
      trail.push(currentFolder);
    }

    // If we're at the root, trail.length is 1. If we are deep, it's > 1.
    const isRoot = trail.length === 1;

    return (
      <div className="flex items-center text-sm md:text-base font-bold overflow-hidden text-light-text dark:text-white min-w-0 flex-1">
        {/* 🛠️ THE FIX 4: The Windows "Back" Arrow (Only active if not in root) */}
        {!isRoot && (
          <button
            onClick={handleGoBack}
            className="mr-2 text-light-text/70 dark:text-white/60 hover:text-light-text dark:hover:text-white transition-colors flex items-center justify-center bg-light-border/20 dark:bg-white/5 rounded-lg w-7 h-7 md:w-8 md:h-8 flex-shrink-0"
            title="Go Back"
          >
            <Icon name="arrow_back" className="text-lg md:text-xl" />
          </button>
        )}

        {/* 🛠️ THE FIX 5: Map out the full clickable trail */}
        {trail.map((node, index) => {
          const isLast = index === trail.length - 1;

          return (
            <React.Fragment key={node._id || "root"}>
              {/* Show the slash/chevron between items */}
              {index > 0 && (
                <span className={`text-light-text/50 dark:text-white/40 material-symbols-rounded text-base md:text-lg mt-0.5 shrink-0 mx-1 ${!isLast ? 'hidden sm:block' : ''}`}>
                  chevron_right
                </span>
              )}

              {/* The Folder Name (It's a button!) */}
              <button
                onClick={() => !isLast && handleNavigate(node._id)}
                disabled={isLast}
                className={`transition-colors whitespace-nowrap min-w-0 shrink truncate text-left ${isLast
                    ? "text-light-text dark:text-white cursor-default" // Current folder
                    : "text-light-text/70 dark:text-white/60 hover:text-light-text dark:hover:text-white cursor-pointer hidden sm:block" // Parent folders
                  }`}
              >
                {node.name}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 border-b border-light-border dark:border-white/5 bg-light-surface dark:bg-[#121214] flex items-center justify-between pl-2 pr-2 lg:pl-4 lg:pr-4 shrink-0 z-10 gap-2 lg:gap-4 flex-nowrap">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        {/* Hamburger menu for mobile only */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-light-text/70 dark:text-white/60 hover:bg-light-border/20 dark:hover:bg-white/5 transition-colors shrink-0"
        >
          <Icon name="menu" className="text-2xl" />
        </button>

        {/* Breadcrumbs — min-w-0 ensures it shrinks and never overflows */}
        <div className="min-w-0 flex-1 overflow-hidden">
          {renderBreadcrumbs()}
        </div>
      </div>

      <div className="flex items-center flex-shrink-0">
        {/* Search — hits the Add button */}
        <div className="relative">
          <div className="flex items-center sm:hidden">
            {searchOpen ? (
              <div className="relative">
                <Icon
                  name="search"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-light-text/60 dark:text-dark-text/40 text-sm"
                />
                <input
                  autoFocus
                  type="text"
                  placeholder={currentFolder ? `Search ${currentFolder.name}` : "Search All Documents"}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setSearchOpen(false);
                  }}
                  className="pl-8 pr-3 w-36 h-9 bg-light-bg dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-l-lg text-sm text-light-text dark:text-white font-medium focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary outline-none transition-all placeholder:text-light-text/60 dark:placeholder:text-white/60"
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-light-text/70 dark:text-white/60 hover:bg-light-border/20 dark:hover:bg-white/5 transition-colors"
              >
                <Icon name="search" className="text-xl" />
              </button>
            )}
          </div>

          <div className="relative hidden sm:block">
            <Icon
              name="search"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-light-text/60 dark:text-dark-text/40 text-sm"
            />
            <input
              type="text"
              placeholder={currentFolder ? `Search ${currentFolder.name}` : "Search All Documents"}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 w-40 md:w-80 h-9 bg-light-bg dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-l-lg rounded-r-none text-sm text-light-text dark:text-white font-medium focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary outline-none transition-all placeholder:text-light-text/60 dark:placeholder:text-white/60 border-r-0"
            />
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3 h-9 bg-light-primary dark:bg-dark-primary text-white dark:text-black text-sm font-bold rounded-r-lg rounded-l-none shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Icon name="add" className="text-lg" />
            <span className="hidden sm:inline">Add to Context</span>
          </button>
        </div>
      </div>
    </header>
  );
};
