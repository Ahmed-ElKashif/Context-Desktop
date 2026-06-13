import { Icon } from "../../../components/ui/core/Icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export const LibraryPagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: PaginationProps) => {
  // Calculate the range of items currently being shown (e.g., "1 to 20")
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // If there's no data, don't render the pagination at all
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-light-border dark:border-white/5 bg-white dark:bg-dark-surface rounded-b-xl">
      {/* Context Text */}
      <div className="text-sm font-medium text-light-text/70 dark:text-dark-text/60 mb-4 sm:mb-0">
        Showing{" "}
        <span className="font-bold text-light-text dark:text-white">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-bold text-light-text dark:text-white">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-bold text-light-text dark:text-white">
          {totalItems}
        </span>{" "}
        total files
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-lg border border-light-border dark:border-white/10 text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Icon name="chevron_left" className="text-[18px]" />
          Previous
        </button>

        {/* Page Indicator Badge */}
        <div className="px-3 py-1.5 text-sm font-bold font-mono bg-light-bg dark:bg-white/5 rounded-lg border border-light-border dark:border-white/5 text-light-primary dark:text-dark-primary">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-lg border border-light-border dark:border-white/10 text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
};
