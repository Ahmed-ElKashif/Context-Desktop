import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../../components/ui/Icons";
import { useAppDispatch } from "../../../store/hooks";
import { renameComparisonRecord, deleteComparisonRecord } from "../../../store/comparisonSlice";
import { useClickOutside } from "../../../components/ui/hooks/useClickOutside";
import { notify } from "../../../components/ui/ToastEngine";
import { ComparisonHistoryItem } from "../api/comparisonHistoryService";

interface HistoryItemRowProps {
  item: ComparisonHistoryItem;
  isActive: boolean;
  onSelect: () => void;
}

export function ComparisonHistoryItemRow({ item, isActive, onSelect }: HistoryItemRowProps) {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(item.customTitle || `${item.titleA} vs ${item.titleB}`);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setMenuRect(null);
    }
  });

  const handleRenameSubmit = async () => {
    if (!renameValue.trim()) return;
    
    try {
      await dispatch(renameComparisonRecord({ id: item._id, customTitle: renameValue.trim() })).unwrap();
      setIsRenameModalOpen(false);
    } catch (err) {
      notify("Failed to rename record", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteComparisonRecord(item._id)).unwrap();
      setIsDeleteModalOpen(false);
    } catch (err) {
      notify("Failed to delete record", "error");
    }
  };

  const displayName = item.customTitle || `${item.titleA} vs ${item.titleB}`;

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => {
            onSelect();
          }}
          className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex flex-col gap-1 group ${
            isActive
              ? "bg-light-primary/10 dark:bg-dark-primary/10 border-l-2 border-light-primary dark:border-dark-primary"
              : "hover:bg-light-bg dark:hover:bg-white/5 border-l-2 border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden w-full relative">
            <Icon
              name="difference"
              className={`text-[14px] shrink-0 ${
                isActive
                  ? "text-light-primary dark:text-dark-primary"
                  : "text-light-text/70 dark:text-white/60 group-hover:text-light-text dark:group-hover:text-white"
              }`}
            />
            <span
              className={`text-xs font-semibold truncate pr-8 ${
                isActive
                  ? "text-light-primary dark:text-dark-primary"
                  : "text-light-text dark:text-white/80 group-hover:text-light-text dark:group-hover:text-white"
              }`}
            >
              {displayName}
            </span>
          </div>

          {/* Subtle Date */}
          <span className="text-[10px] text-light-text/70 dark:text-white/60 pl-5">
            {new Date(item.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </button>

        {/* 3-Dots Menu Trigger */}
        {(isHovered || isMenuOpen) && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isMenuOpen) {
                  setIsMenuOpen(false);
                  setMenuRect(null);
                } else {
                  setIsMenuOpen(true);
                  setMenuRect(e.currentTarget.getBoundingClientRect());
                }
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all shadow-sm backdrop-blur-sm ${
                isMenuOpen 
                  ? "bg-black/10 dark:bg-black/40 text-light-text dark:text-white" 
                  : "bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-light-text/70 dark:text-white/70"
              }`}
            >
              <Icon name="more_vert" className="text-[18px]" />
            </button>

            {/* Dropdown Menu (Portal) */}
            {isMenuOpen && menuRect && (() => {
              const isNearBottom = menuRect.bottom + 100 > window.innerHeight; // small menu (rename, delete)
              return createPortal(
              <div 
                ref={menuRef}
                className={`fixed w-32 bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden py-1 animate-in zoom-in-95 fade-in duration-100 ${
                  isNearBottom ? "origin-bottom-left" : "origin-top-left"
                }`}
                style={{
                  top: isNearBottom ? undefined : menuRect.top,
                  bottom: isNearBottom ? window.innerHeight - menuRect.bottom : undefined,
                  left: menuRect.right + 4 // Position completely to the right of the button!
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenameModalOpen(true);
                    setIsMenuOpen(false);
                    setMenuRect(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-light-text dark:text-white/80 hover:bg-light-bg dark:hover:bg-white/5 hover:text-light-primary dark:hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Icon name="edit" className="text-[14px]" />
                  Rename
                </button>
                <div className="h-px w-full bg-light-border dark:bg-white/10 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                    setIsMenuOpen(false);
                    setMenuRect(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <Icon name="delete" className="text-[14px]" />
                  Delete
                </button>
              </div>,
              document.body
            );})()}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {isRenameModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsRenameModalOpen(false);
              setRenameValue(item.customTitle || `${item.titleA} vs ${item.titleB}`);
            }}
          ></div>

          <div className="relative bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-2 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Icon name="edit" className="text-[28px]" />
              </div>
              <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
                Rename Comparison
              </h3>
              <p className="text-sm text-light-text/70 dark:text-white/60">
                Enter a new name for this comparison record.
              </p>
            </div>

            <div className="px-6 pb-6">
              <div className="flex items-center w-full bg-light-bg dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-light-primary dark:focus-within:ring-dark-primary transition-all">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                  autoFocus
                  className="w-full px-4 py-3 bg-transparent text-sm text-light-text dark:text-white font-medium border-none ring-0 focus:ring-0 focus:border-transparent outline-none focus:outline-none disabled:opacity-50 text-center"
                  placeholder="Enter new name..."
                />
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-center gap-3 w-full">
              <button
                onClick={() => {
                  setIsRenameModalOpen(false);
                  setRenameValue(item.customTitle || `${item.titleA} vs ${item.titleB}`);
                }}
                className="flex-1 py-2.5 text-sm font-semibold text-light-text/70 dark:text-white/70 hover:bg-light-border/50 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={!renameValue.trim()}
                className="flex-1 py-2.5 text-sm font-bold text-white shadow-sm transition-all bg-light-primary hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 rounded-xl disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>

          <div className="relative bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <Icon name="warning" className="text-[28px]" />
              </div>
              <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
                Delete History
              </h3>
              <p className="text-sm text-light-text/70 dark:text-white/60 leading-relaxed">
                Are you sure you want to delete this comparison record? This action cannot be undone.
              </p>
            </div>

            <div className="p-5 pt-0 flex items-center justify-center gap-3 w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-light-text/70 dark:text-white/70 hover:bg-light-border/50 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-bold text-white shadow-sm transition-all bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
