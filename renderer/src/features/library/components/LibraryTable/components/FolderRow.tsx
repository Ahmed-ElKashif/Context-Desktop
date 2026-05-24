import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FolderData } from "../../../../../store/documentSlice";
import { formatDate } from "../../../utils/tableUtils";
import { useClickOutside } from "../../../../../components/ui/hooks/useClickOutside";

interface FolderRowProps {
  folder: FolderData;
  isMenuOpen: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onToggleMenu: (e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onDoubleClick: () => void;
  onClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

export const FolderRow = ({
  folder,
  isMenuOpen,
  isSelected = false,
  onToggleSelection,
  onToggleMenu,
  onCloseMenu,
  onDoubleClick,
  onClick,
  onRename,
  onDelete,
  onDownload,
}: FolderRowProps) => {
  const folderName = folder.name || "Folder";
  const menuRef = useRef<HTMLTableCellElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      setMenuRect(menuRef.current.getBoundingClientRect());
    } else {
      setMenuRect(null);
    }
  }, [isMenuOpen]);

  useClickOutside([menuRef, portalRef], () => {
    if (isMenuOpen) {
      onCloseMenu();
    }
  });

  return (
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`group cursor-pointer border-b border-light-border dark:border-white/5 transition-colors select-none ${
        isSelected
          ? "bg-black/5 dark:bg-white/10"
          : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <td className="py-1 pl-3 pr-1 w-8" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="w-3 h-3 cursor-pointer rounded border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 transition-colors"
        />
      </td>
      <td className="py-1 pr-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-rounded text-lg text-yellow-500">
            folder
          </span>
          <div className="truncate max-w-[200px] md:max-w-[250px] lg:max-w-[400px]">
            <p className="text-xs font-semibold text-light-text dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors truncate">
              {folderName}
            </p>
          </div>
        </div>
      </td>

      {/* Tags Column */}
      <td className="py-1 text-light-text/50 dark:text-white/40 text-[9px] italic">
        --
      </td>

      {/* Cognitive Load Column */}
      <td className="py-1 text-light-text/50 dark:text-white/40 text-[9px] italic">
        --
      </td>

      {/* Last Modified Column */}
      <td className="py-1 text-light-text/70 dark:text-dark-text/60 font-mono text-[9px] font-semibold whitespace-nowrap">
        {formatDate(folder.updatedAt || folder.createdAt)}
      </td>

      <td
        ref={menuRef}
        className={`py-1 pr-2 text-right relative bg-inherit ${isMenuOpen ? "z-[60]" : "z-10"}`}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end items-center pr-2">
          <button
            onClick={onToggleMenu}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all shadow-sm backdrop-blur-sm ${
              isMenuOpen
                ? "bg-black/10 dark:bg-white/10 text-light-text dark:text-white"
                : "opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-white/70"
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">
              more_vert
            </span>
          </button>
        </div>

        {isMenuOpen &&
          menuRect &&
          (() => {
            const isNearBottom = menuRect.bottom + 150 > window.innerHeight;
            return createPortal(
              <div
                ref={portalRef}
                className={`fixed z-[100] w-40 bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 text-left animate-in fade-in zoom-in-95 duration-100 ${
                  isNearBottom ? "origin-bottom-right" : "origin-top-right"
                }`}
                style={{
                  top: isNearBottom ? undefined : menuRect.top,
                  bottom: isNearBottom
                    ? window.innerHeight - menuRect.bottom
                    : undefined,
                  right: window.innerWidth - menuRect.left + 8, // Position to the LEFT of the button since it's on the right edge
                }}
              >
                {!folder.isAIGenerated &&
                  folder.name?.toLowerCase() !== "random files" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename?.();
                        }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <span className="material-symbols-rounded text-[18px] text-blue-500">
                          edit
                        </span>
                        Rename
                      </button>
                      <div className="h-px w-full bg-light-border dark:bg-white/10 my-1"></div>
                    </>
                  )}
                {folder.isAIGenerated && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload?.();
                      }}
                      className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <span className="material-symbols-rounded text-[18px] text-green-500">
                        download
                      </span>
                      Download
                    </button>
                    <div className="h-px w-full bg-light-border dark:bg-white/10 my-1"></div>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    delete
                  </span>
                  Delete
                </button>
              </div>,
              document.body,
            );
          })()}
      </td>
    </tr>
  );
};
