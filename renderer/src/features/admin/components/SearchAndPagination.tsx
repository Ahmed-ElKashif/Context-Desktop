/**
 * SearchAndPagination.tsx
 * Search bar + pagination controls.
 * Completely URL-driven — no internal state. Parent passes URL-derived values + handlers.
 */

import React, { useState, useEffect } from "react";

interface SearchAndPaginationProps {
  search: string;
  onSearch: (value: string) => void;
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
  isLoading?: boolean;
  hidePagination?: boolean;
}

const SearchAndPagination: React.FC<SearchAndPaginationProps> = ({
  search,
  onSearch,
  page,
  totalPages,
  total,
  onPage,
  isLoading,
  hidePagination,
}) => {
  // Local input state so typing feels instant; debounce syncs to URL
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== search) onSearch(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const pageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Search */}
      <div className="relative w-full sm:w-72">
        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-light-text/30 dark:text-white/30 pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-light-surface dark:bg-white/[0.04] border border-light-border dark:border-white/[0.08] rounded-xl text-light-text dark:text-white placeholder-light-text/30 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-light-primary/30 dark:focus:ring-dark-primary/30 transition-all"
        />
        {inputValue && (
          <button
            onClick={() => { setInputValue(""); onSearch(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text/30 dark:text-white/30 hover:text-light-text dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-rounded text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Right side: total count + export + pagination */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Total count */}
        <span className="text-xs text-light-text/40 dark:text-white/30 font-medium hidden sm:block">
          {total.toLocaleString()} users
        </span>

        {/* Pagination */}
        {!hidePagination && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPage(page - 1)}
              disabled={page === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/50 dark:text-white/40 hover:text-light-text dark:hover:text-white hover:bg-light-border dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-rounded text-[18px]">chevron_left</span>
            </button>

            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-light-text/30 dark:text-white/30">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPage(p as number)}
                  disabled={isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    p === page
                      ? "bg-light-primary dark:bg-dark-primary text-white shadow-sm"
                      : "text-light-text/60 dark:text-white/40 hover:bg-light-border dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => onPage(page + 1)}
              disabled={page === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/50 dark:text-white/40 hover:text-light-text dark:hover:text-white hover:bg-light-border dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-rounded text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndPagination;