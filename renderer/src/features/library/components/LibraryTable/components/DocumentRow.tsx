import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DocumentData } from "../../../../../store/documentSlice";
import {
  getFileIcon,
  formatDate,
  renderCognitiveLoadBars,
} from "../../../utils/tableUtils";
import { getTagColorClass } from "../../../../../lib/tagUtils";
import { useClickOutside } from "../../../../../components/ui/hooks/useClickOutside";

interface DocumentRowProps {
  doc: DocumentData;
  isSelected: boolean;
  isMenuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onToggleSelection: () => void;
  onClick: (e?: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
  onSummarize?: () => void;
  onCompare?: () => void;
  onReveal?: () => void;
}

export const DocumentRow = ({
  doc,
  isSelected,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onToggleSelection,
  onClick,
  onDoubleClick,
  onShare,
  onRename,
  onDelete,
  onSummarize,
  onCompare,
  onReveal,
}: DocumentRowProps) => {
  const menuRef = useRef<HTMLTableCellElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [nativeIcon, setNativeIcon] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (doc.originalClientPath && (window as any).electronAPI?.localFiles?.getFileIcon) {
      (window as any).electronAPI.localFiles.getFileIcon(doc.originalClientPath)
        .then((iconData: string) => {
          if (isMounted && iconData) {
            setNativeIcon(iconData);
          }
        })
        .catch(() => {}); // Fallback silently
    }
    return () => { isMounted = false; };
  }, [doc.originalClientPath]);

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
      onContextMenu={(e) => {
        onClick(); // ensure it's selected
        onToggleMenu(e);
      }}
    className={`group cursor-pointer transition-colors border-b border-light-border dark:border-white/5 bg-white dark:bg-[#121214] ${
      isSelected
        ? "bg-black/5 dark:bg-white/10"
        : "hover:bg-light-bg/50 dark:hover:bg-white/5"
        }`}
    >
      <td className="py-2 pl-3 pr-1 w-8" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="w-3 h-3 cursor-pointer rounded border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white focus:ring-0 focus:ring-offset-0 transition-colors"
        />
      </td>
      <td className="py-1 pr-2">
        <div className="flex items-center gap-1.5">
          {nativeIcon ? (
            <img src={nativeIcon} alt={doc.fileType} className="w-5 h-5 object-contain" />
          ) : (
            getFileIcon(doc.fileType)
          )}
          <div className="truncate max-w-[250px] lg:max-w-[400px]">
            <p className="text-xs font-semibold group-hover:text-black dark:group-hover:text-white transition-colors truncate">
              {doc.title}
            </p>
            <p className="text-[9px] font-semibold text-light-text/60 dark:text-dark-text/50">
              {doc.fileType} • Active
            </p>
          </div>
        </div>
      </td>
      <td className="py-1">
        <div className="flex gap-1 flex-wrap">
          {doc.tags && doc.tags.length > 0 ? (
            doc.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className={`px-1 py-0.5 rounded text-[9px] font-bold whitespace-nowrap border border-transparent ${getTagColorClass(tag)}`}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))
          ) : (
            <span className="text-[9px] text-gray-400 italic">No tags</span>
          )}
          {doc.tags && doc.tags.length > 2 && (
            <div className="group/tag relative">
              <span 
                tabIndex={0}
                className="px-1 py-0.5 rounded text-[9px] font-bold bg-light-bg dark:bg-white/5 text-light-text/70 dark:text-white/60 border border-light-border dark:border-white/10 cursor-pointer hover:bg-light-primary/10 dark:hover:bg-white/10 transition-colors inline-block"
              >
                +{doc.tags.length - 2}
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 z-[60] hidden group-hover/tag:flex group-focus-within/tag:flex pt-2">
                <div className="flex flex-wrap gap-1.5 w-max max-w-[200px] bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-lg p-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                  {doc.tags.slice(2).map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-1 py-0.5 rounded text-[9px] font-bold whitespace-nowrap border border-transparent ${getTagColorClass(tag)}`}
                    >
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="py-1 whitespace-nowrap">{renderCognitiveLoadBars(doc.cognitiveLoad)}</td>
      <td className="py-1 text-light-text/70 dark:text-dark-text/60 font-mono text-[9px] font-semibold whitespace-nowrap">
        {formatDate(doc.updatedAt)}
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
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary ${
              isMenuOpen
                ? "bg-black/10 dark:bg-white/10 text-light-text dark:text-white opacity-100"
                : "opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-white/70"
              }`}
            aria-label={`Actions for ${doc.title}`}
          >
            <span className="material-symbols-rounded text-[18px]">more_vert</span>
          </button>
        </div>

        {isMenuOpen && menuRect && (() => {
          const isNearBottom = menuRect.bottom + 170 > window.innerHeight; // A bit taller for DocumentRow since it has more options
          return createPortal(
            <div
              ref={portalRef}
              className={`fixed z-[100] w-40 bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 text-left animate-in fade-in zoom-in-95 duration-100 ${
                isNearBottom ? "origin-bottom-right" : "origin-top-right"
              }`}
              style={{
                top: isNearBottom ? undefined : menuRect.top,
                bottom: isNearBottom ? window.innerHeight - menuRect.bottom : undefined,
                right: window.innerWidth - menuRect.left + 8 // Position to the LEFT of the button since it's on the right edge
              }}
            >
            {onSummarize && (
              <button
                onClick={(e) => { e.stopPropagation(); onSummarize(); }}
                className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-rounded text-[18px] text-purple-500">auto_awesome</span>
                Summarize
              </button>
            )}
            {onCompare && (
              <button
                onClick={(e) => { e.stopPropagation(); onCompare(); }}
                className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-rounded text-[18px] text-blue-400">compare_arrows</span>
                Compare
              </button>
            )}
            {onReveal && (
              <button
                onClick={(e) => { e.stopPropagation(); onReveal(); }}
                className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-rounded text-[18px] text-yellow-500">folder_open</span>
                Reveal in Explorer
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px] text-light-primary dark:text-dark-primary">
                share
              </span>
              Share
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
              className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px] text-blue-500">
                edit
              </span>
              Rename
            </button>
            <div className="h-px w-full bg-light-border dark:bg-white/10 my-1"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-rounded text-[18px]">
                delete
              </span>
              Delete
            </button>
          </div>,
          document.body
        );})()}
      </td>
    </tr>
  );
};