import React, { useState, useEffect } from "react";
import { DocumentData } from "../../../../../store/library/librarySlice";
import {
  getFileIcon,
  formatDate,
  renderCognitiveLoadBars,
  formatFileSize,
  CircleCheckbox,
} from "../../../utils/tableUtils";
import { getTagColorClass } from "../../../../../lib/tagUtils";

interface DocumentRowProps {
  doc: DocumentData;
  index: number;
  isSelected: boolean;
  isFocused: boolean;
  onToggleSelection: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDotsClick: (e: React.MouseEvent) => void;
}

export const DocumentRow = ({
  doc,
  isSelected,
  isFocused,
  onToggleSelection,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDotsClick,
}: DocumentRowProps) => {
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
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [doc.originalClientPath]);

  return (
    <tr
      data-item-id={doc._id}
      data-item-type="doc"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleSelection();
        }
      }}
      className={`group cursor-pointer transition-colors border-b border-light-border dark:border-white/5 focus-ring-standard ${
        isSelected
          ? "bg-light-primary/30 dark:bg-dark-primary/30"
          : "bg-white dark:bg-[#121214] hover:bg-light-primary/10 dark:hover:bg-dark-primary/10"
      } ${
        isFocused ? "outline outline-2 outline-light-primary dark:outline-dark-primary outline-offset-[-2px] z-10 relative" : ""
      }`}
    >
      <td className="py-2 pl-3 pr-1 w-8" onClick={(e) => e.stopPropagation()}>
        <CircleCheckbox 
          checked={isSelected} 
          onChange={onToggleSelection} 
          visible={isSelected} 
        />
      </td>
      <td className="py-1 pr-2">
        <div className="flex items-center gap-1.5">
          {nativeIcon ? (
            <img src={nativeIcon} alt={doc.fileType} className="w-5 h-5 object-contain" />
          ) : (
            getFileIcon(doc.fileType)
          )}
          <div className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[350px]">
            <p 
              className="text-xs font-semibold group-hover:text-black dark:group-hover:text-white hover:underline transition-colors truncate"
              onClick={(e) => {
                e.stopPropagation();
                onDoubleClick();
              }}
            >
              {doc.title}
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
      <td className="py-1 text-light-text/70 dark:text-dark-text/60 font-mono text-[11px] font-semibold whitespace-nowrap">
        {formatFileSize(doc.fileSize)}
      </td>
      <td className="py-1 text-light-text/70 dark:text-dark-text/60 font-mono text-[11px] font-semibold whitespace-nowrap">
        {formatDate(doc.updatedAt)}
      </td>
      <td className="py-1 pr-2 w-10 text-right">
        <div className="flex justify-end items-center pr-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDotsClick(e); }}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-light-text/70 dark:text-white/70 ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">more_vert</span>
          </button>
        </div>
      </td>
    </tr>
  );
};