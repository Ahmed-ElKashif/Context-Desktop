import React from "react";
import { FolderData } from "../../../../../store/library/librarySlice";
import { formatDate, formatItemCount, CircleCheckbox } from "../../../utils/tableUtils";
import { getFolderColorHex } from "../../../utils/folderColors";

interface FolderRowProps {
  folder: FolderData;
  index: number;
  isSelected: boolean;
  isFocused: boolean;
  childCount?: number;
  onToggleSelection: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDotsClick: (e: React.MouseEvent) => void;
}

export const FolderRow = ({
  folder,
  isSelected,
  isFocused,
  childCount,
  onToggleSelection,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDotsClick,
}: FolderRowProps) => {
  const folderName = folder.name || "Folder";

  return (
    <tr
      data-item-id={folder._id}
      data-item-type="folder"
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
      className={`group cursor-pointer border-b border-light-border dark:border-white/5 transition-colors select-none focus-ring-standard ${
        isSelected
          ? "bg-light-primary/30 dark:bg-dark-primary/30"
          : "bg-white dark:bg-[#121214] hover:bg-light-primary/10 dark:hover:bg-dark-primary/10"
      } ${
        isFocused ? "outline outline-2 outline-light-primary dark:outline-dark-primary outline-offset-[-2px] z-10 relative" : ""
      }`}
    >
      <td className="py-1 pl-3 pr-1 w-8" onClick={(e) => e.stopPropagation()}>
        <CircleCheckbox 
          checked={isSelected} 
          onChange={onToggleSelection} 
          visible={isSelected} 
        />
      </td>
      <td className="py-1 pr-2">
        <div className="flex items-center gap-1.5">
          <span 
            className="material-symbols-rounded text-lg"
            style={{ color: getFolderColorHex(folder.color || 'yellow') }}
          >
            folder
          </span>
          <div className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[350px]">
            <p 
              className="text-xs font-semibold text-light-text dark:text-white group-hover:text-black dark:group-hover:text-white hover:underline transition-colors truncate"
              onClick={(e) => {
                e.stopPropagation();
                onDoubleClick();
              }}
            >
              {folderName}
            </p>
          </div>
        </div>
      </td>

      {/* Tags Column */}
      <td className="py-1 text-light-text/60 dark:text-white/50 text-[9px] italic">
        --
      </td>

      {/* Cognitive Load Column */}
      <td className="py-1 text-light-text/60 dark:text-white/50 text-[9px] italic">
        --
      </td>

      {/* Item Count Column */}
      <td className="py-1 text-light-text/70 dark:text-dark-text/60 font-mono text-[11px] font-semibold whitespace-nowrap">
        {formatItemCount(childCount)}
      </td>

      {/* Last Modified Column */}
      <td className="py-1 text-light-text/70 dark:text-dark-text/60 font-mono text-[11px] font-semibold whitespace-nowrap">
        {formatDate(folder.updatedAt || folder.createdAt)}
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
