import React, { useMemo } from "react";
import { DocumentData, FolderData } from "../../../../store/library/librarySlice";
import { FolderRow } from "./components/FolderRow";
import { DocumentRow } from "./components/DocumentRow";
import { LibraryItem } from "../../hooks/useSelectionManager";
import { CircleCheckbox } from "../../utils/tableUtils";

interface LibraryTableProps {
  documents: DocumentData[];
  childFolders?: FolderData[];

  currentPage?: number;
  isAllSelected: boolean;
  selectedDocIds: string[];
  selectedFolderIds: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  onToggleAll: () => void;
  onRowClick: (e: React.MouseEvent, item: LibraryItem, index: number, allOrderedItems: LibraryItem[]) => void;
  onRowDoubleClick: (item: DocumentData | FolderData, type: "doc" | "folder") => void;
  onRowContextMenu: (e: React.MouseEvent, item: DocumentData | FolderData, type: "doc" | "folder") => void;
  onRowDotsClick: (e: React.MouseEvent, item: DocumentData | FolderData, type: "doc" | "folder") => void;
  onTableContextMenu: (e: React.MouseEvent) => void;
  onEmptySpaceClick: () => void;
}

export const LibraryTable = React.memo(({
  documents,
  childFolders = [],

  currentPage = 1,
  isAllSelected,
  selectedDocIds,
  selectedFolderIds,
  sortBy,
  sortOrder,
  onSort,
  onToggleAll,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  onRowDotsClick,
  onTableContextMenu,
  onEmptySpaceClick,
}: LibraryTableProps) => {

  const allOrderedItems = useMemo<LibraryItem[]>(() => [
    ...childFolders.map(f => ({ type: "folder" as const, item: f })),
    ...documents.map(d => ({ type: "doc" as const, item: d }))
  ], [childFolders, documents]);

  const renderSortArrow = (column: string) => {
    const isActive = sortBy === column;
    return (
      <span 
        className={`material-symbols-rounded text-[16px] transition-all duration-300 ${
          isActive 
            ? "text-light-primary dark:text-dark-primary opacity-100" 
            : "text-light-text/50 dark:text-white/40 opacity-0 group-hover:opacity-100"
        } ${isActive && sortOrder === "asc" ? "rotate-180" : "rotate-0"}`}
      >
        keyboard_arrow_down
      </span>
    );
  };

  const totalRows = childFolders.length + documents.length;

  if (totalRows === 0) {
    if (currentPage > 1) {
      return (
        <div
          className="h-64 flex flex-col items-center justify-center text-light-text/60 dark:text-white/50"
          onContextMenu={onTableContextMenu}
        >
          <span className="material-symbols-rounded text-4xl mb-2">find_in_page</span>
          <p className="font-bold">No more files to display.</p>
          <p className="text-sm">Your folders are pinned to Page 1.</p>
        </div>
      );
    }
    return (
      <div
        className="h-64 flex flex-col items-center justify-center text-light-text/60 dark:text-white/50 px-4 text-center"
        onContextMenu={onTableContextMenu}
      >
        <span className="material-symbols-rounded text-4xl mb-2">inbox</span>
        <p className="font-bold">This folder is empty.</p>
        <p className="text-sm">Drop files here to add them.</p>
      </div>
    );
  }

  const selectedCount = selectedDocIds.length + selectedFolderIds.length;

  return (
    <div 
      className="w-full flex-1 overflow-auto hide-scrollbar"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('tr[data-item-id]')) {
          onEmptySpaceClick();
        }
      }}
    >
      <table
        className="w-full text-left border-collapse min-w-[700px] select-none"
        onContextMenu={onTableContextMenu}
      >
    <thead className="group sticky top-0 bg-light-surface/95 dark:bg-[#121214]/95 backdrop-blur-md z-20 border-b border-light-border dark:border-white/5 shadow-sm">
      <tr className="text-xs font-mono font-bold text-light-text/70 dark:text-dark-text/60 uppercase tracking-widest">
        <th className="py-1.5 pl-3 pr-1 w-8">
          <CircleCheckbox
            checked={isAllSelected}
            onChange={onToggleAll}
            visible={isAllSelected}
          />
        </th>

            <th
              className="py-1.5 group cursor-pointer hover:text-light-text dark:hover:text-white transition-colors"
              onClick={() => onSort("title")}
            >
              <div className="flex items-center gap-1">
                {selectedCount > 0 ? `${selectedCount} selected` : <>Name {renderSortArrow("title")}</>}
              </div>
            </th>

            <th className="py-1.5 w-32 sm:w-40">{selectedCount > 0 ? "" : "Tags"}</th>

            <th
              className="py-1.5 w-40 sm:w-48 group cursor-pointer hover:text-light-text dark:hover:text-white transition-colors"
              onClick={() => onSort("cognitiveLoad")}
            >
              <div className="flex items-center gap-1">
                {selectedCount > 0 ? "" : <>Cognitive Load {renderSortArrow("cognitiveLoad")}</>}
              </div>
            </th>

            <th 
              className="py-1.5 w-24 group cursor-pointer hover:text-light-text dark:hover:text-white transition-colors"
              onClick={() => onSort("fileSize")}
            >
              <div className="flex items-center gap-1">
                {selectedCount > 0 ? "" : <>File Size {renderSortArrow("fileSize")}</>}
              </div>
            </th>

            <th
              className="py-1.5 w-32 group cursor-pointer hover:text-light-text dark:hover:text-white transition-colors"
              onClick={() => onSort("updatedAt")}
            >
              <div className="flex items-center gap-1">
                {selectedCount > 0 ? "" : <>Last Modified {renderSortArrow("updatedAt")}</>}
              </div>
            </th>

            <th className="py-1.5 w-10 pr-2 sticky right-0 z-30 bg-light-surface/95 dark:bg-[#121214]/95 shadow-[-4px_0_4px_rgba(0,0,0,0.05)] dark:shadow-none"></th>
          </tr>
        </thead>

        <tbody className="text-sm text-light-text dark:text-white font-medium relative z-0">
          {childFolders.map((folder, idx) => (
            <FolderRow
              key={folder._id}
              folder={folder}
              index={idx}
              isSelected={selectedFolderIds.includes(folder._id)}
              childCount={folder.itemCount}
              onToggleSelection={() => onRowClick({ ctrlKey: true, stopPropagation: () => {}, preventDefault: () => {} } as any, { type: "folder", item: folder }, idx, allOrderedItems)}
              onClick={(e) => onRowClick(e, { type: "folder", item: folder }, idx, allOrderedItems)}
              onDoubleClick={() => onRowDoubleClick(folder, "folder")}
              onContextMenu={(e) => onRowContextMenu(e, folder, "folder")}
              onDotsClick={(e) => onRowDotsClick(e, folder, "folder")}
            />
          ))}

          {documents.map((doc, idx) => {
            const indexOffset = childFolders.length + idx;
            return (
              <DocumentRow
                key={doc._id}
                doc={doc}
                index={indexOffset}
                isSelected={selectedDocIds.includes(doc._id)}
                onToggleSelection={() => onRowClick({ ctrlKey: true, stopPropagation: () => {}, preventDefault: () => {} } as any, { type: "doc", item: doc }, indexOffset, allOrderedItems)}
                onClick={(e) => onRowClick(e, { type: "doc", item: doc }, indexOffset, allOrderedItems)}
                onDoubleClick={() => onRowDoubleClick(doc, "doc")}
                onContextMenu={(e) => onRowContextMenu(e, doc, "doc")}
                onDotsClick={(e) => onRowDotsClick(e, doc, "doc")}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  );
});
