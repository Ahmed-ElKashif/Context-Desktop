import { useEffect } from "react";
import { Icon } from "../../../components/ui/core/Icons";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchComparisonHistory, setSearchQuery } from "../../../store/comparison/comparisonSlice";
import { ComparisonHistoryItemRow } from "./ComparisonHistoryItemRow";

interface SidebarProps {
  onSelectHistory: (id: string) => void;
  onNewComparison: () => void;
}

export function ComparisonHistorySidebar({ onSelectHistory, onNewComparison }: SidebarProps) {
  const dispatch = useAppDispatch();
  const { history, isFetchingHistory, activeComparisonId, searchQuery } = useAppSelector((state) => state.comparison);

  useEffect(() => {
    dispatch(fetchComparisonHistory());
  }, [dispatch]);

  const filteredHistory = history.filter((item) => {
    const defaultTitle = `${item.titleA} vs ${item.titleB}`.toLowerCase();
    const customTitle = (item.customTitle || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return defaultTitle.includes(q) || customTitle.includes(q);
  });

  return (
    <div id="tour-compare-history" className="w-64 h-full bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-white/5 flex flex-col shrink-0 z-20">
      {/* Action Area */}
      <div className="p-4 border-b border-light-border dark:border-white/5 space-y-3">
        <button
          onClick={onNewComparison}
          className="w-full flex items-center justify-center gap-2 bg-light-primary dark:bg-dark-primary text-white dark:text-black py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <Icon name="add" className="text-[18px]" />
          New Comparison
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-light-text/70 dark:text-dark-text/60 text-[14px]"
          />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-8 pr-3 h-8 bg-light-bg dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-lg text-xs text-light-text dark:text-white focus:ring-1 focus:ring-light-primary dark:focus:ring-dark-primary outline-none transition-all placeholder:text-light-text/60 dark:placeholder:text-white/60"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        <div className="px-2 mb-3 mt-1">
          <span className="text-[10px] font-mono font-bold text-light-text/70 dark:text-white/60 uppercase tracking-widest">
            History
          </span>
        </div>

        {isFetchingHistory ? (
          <div className="flex justify-center p-4">
            <span className="w-5 h-5 rounded-full border-2 border-light-border dark:border-white/10 border-t-light-primary dark:border-t-dark-primary animate-spin"></span>
          </div>
        ) : history.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-light-text/70 dark:text-white/60">No previous comparisons found.</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-light-text/70 dark:text-white/60">No results match your search.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredHistory.map((item) => (
              <ComparisonHistoryItemRow
                key={item._id}
                item={item}
                isActive={item._id === activeComparisonId}
                onSelect={() => onSelectHistory(item._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}