import React, { useState } from "react";
import { DocumentData, FolderData } from "../../../../store/documentSlice";
import { FolderRow } from "./components/FolderRow";
import { DocumentRow } from "./components/DocumentRow";

interface LibraryTableProps {
  documents: DocumentData[];
  childFolders?: FolderData[];
  currentPage?: number;
  isAllSelected: boolean;
  onFolderDoubleClick: (folderId: string) => void;
  onFolderRenameClick?: (folderId: string) => void;
  onFolderDeleteClick?: (folderId: string) => void;
  onFolderDownloadClick?: (folderId: string) => void;
  onRowClick: (doc: DocumentData) => void;
  onRowDoubleClick: (doc: DocumentData) => void;
  onShareClick: (doc: DocumentData) => void;
  onRenameClick: (doc: DocumentData) => void;
  onDeleteClick: (doc: DocumentData) => void;
  onSummarizeClick?: (doc: DocumentData) => void;
  onCompareClick?: (doc: DocumentData) => void;
  onRevealClick?: (doc: DocumentData) => void;
  onOrganizeFolderClick?: (folderId: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  selectedDocIds: string[];
  selectedFolderIds: string[];
  onToggleSelection: (id: string, type: "document" | "folder") => void;
  onToggleAll: (docIds: string[], folderIds: string[]) => void;
  onSelectRange: (docs: DocumentData[], folders: FolderData[]) => void;
}

export const LibraryTable = ({
  documents,
  childFolders = [],
  currentPage = 1,
  isAllSelected,
  onFolderDoubleClick,
  onFolderRenameClick,
  onFolderDeleteClick,
  onFolderDownloadClick,
  onRowClick,
  onRowDoubleClick,
  onShareClick,
  onRenameClick,
  onDeleteClick,
  onSummarizeClick,
  onCompareClick,
  onRevealClick,
  onOrganizeFolderClick,
  sortBy,
  sortOrder,
  onSort,
  selectedDocIds,
  selectedFolderIds,
  onToggleSelection,
  onToggleAll,
  onSelectRange,
}: LibraryTableProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleRowClick = (e: React.MouseEvent | undefined, id: string, type: 'document' | 'folder') => {
    const flatList = [
      ...childFolders.map(f => ({ id: f._id, type: 'folder' as const, item: f })),
      ...documents.map(d => ({ id: d._id, type: 'document' as const, item: d }))
    ];

    if (e?.shiftKey && lastSelectedId) {
      const currentIndex = flatList.findIndex(i => i.id === id);
      const lastIndex = flatList.findIndex(i => i.id === lastSelectedId);
      
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const range = flatList.slice(start, end + 1);
        
        const newDocs = range.filter(i => i.type === 'document').map(i => i.item as DocumentData);
        const newFolders = range.filter(i => i.type === 'folder').map(i => i.item as FolderData);
        
        onSelectRange(newDocs, newFolders);
        return; // Don't update lastSelectedId on shift-click
      }
    }
    
    if (e?.ctrlKey || e?.metaKey) {
      onToggleSelection(id, type);
    } else {
      // Normal click: select ONLY this item
      const item = flatList.find(i => i.id === id);
      if (item) {
        if (item.type === 'document') {
          onSelectRange([item.item as DocumentData], []);
        } else {
          onSelectRange([], [item.item as FolderData]);
        }
      }
    }
    setLastSelectedId(id);
  };

  const renderSortArrow = (column: string) => {
    if (sortBy !== column) {
      return (
        <span className="material-symbols-rounded text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">
          arrow_downward
        </span>
      );
    }
    return (
      <span className="material-symbols-rounded text-[14px] text-light-primary dark:text-dark-primary transition-transform duration-200">
        {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
      </span>
    );
  };

  const totalRows = childFolders.length + documents.length;

  if (totalRows === 0) {
    if (currentPage > 1) {
      return (
        <div
          className="h-64 flex flex-col items-center justify-center text-light-text/50 dark:text-white/40"
          onClick={() => setOpenMenuId(null)}
        >
          <span className="material-symbols-rounded text-4xl mb-2">
            find_in_page
          </span>
          <p className="font-bold">No more files to display.</p>
          <p className="text-sm">Your folders are pinned to Page 1.</p>
        </div>
      );
    }

    return (
      <div
        className="h-64 flex flex-col items-center justify-center text-light-text/50 dark:text-white/40 px-4 text-center"
        onClick={() => setOpenMenuId(null)}
      >
        <span className="material-symbols-rounded text-4xl mb-2">inbox</span>
        <p className="font-bold">This folder is empty.</p>
        <p className="text-sm">Drop files here to add them.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-auto hide-scrollbar">
      <table
        className="w-full text-left border-collapse min-w-[650px]"
        onClick={() => setOpenMenuId(null)}
      >
        <thead className="sticky top-0 bg-light-surface/95 dark:bg-[#121214]/95 backdrop-blur-md z-20 border-b border-light-border dark:border-white/5 shadow-sm">
          <tr className="text-xs font-mono font-bold text-light-text/70 dark:text-dark-text/60 uppercase tracking-widest">
            {/* Checkbox Column */}
            <th className="py-1.5 pl-3 pr-1 w-8">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => onToggleAll(documents.map(d => d._id), childFolders.map(f => f._id))}
                className="w-3.5 h-3.5 cursor-pointer rounded border-gray-400 dark:border-gray-500 bg-transparent text-black dark:text-white accent-black dark:accent-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary transition-colors"
                aria-label="Select all files"
              />
            </th>

            <th
              className="py-1.5 group cursor-pointer hover:text-light-text dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary rounded-sm"
              onClick={() => onSort("title")}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort("title"); } }}
            >
              <div className="flex items-center gap-1 pointer-events-none">
                Name {renderSortArrow("title")}
              </div>
            </th>

            <th className="py-1.5 w-32 sm:w-40">Tags</th>

            <th
              className="py-1.5 w-40 sm:w-48 group cursor-pointer hover:text-light-text dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary rounded-sm"
              onClick={() => onSort("cognitiveLoad")}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort("cognitiveLoad"); } }}
            >
              <div className="flex items-center gap-1 pointer-events-none">
                Cognitive Load {renderSortArrow("cognitiveLoad")}
              </div>
            </th>

            <th
              className="py-1.5 w-40 sm:w-48 group cursor-pointer hover:text-light-text dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary rounded-sm"
              onClick={() => onSort("updatedAt")}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort("updatedAt"); } }}
            >
              <div className="flex items-center gap-1 pointer-events-none">
                Last Modified {renderSortArrow("updatedAt")}
              </div>
            </th>

            <th className="py-1.5 w-10 pr-2 sticky right-0 z-30 bg-light-surface/95 dark:bg-[#121214]/95 shadow-[-4px_0_4px_rgba(0,0,0,0.05)] dark:shadow-none"></th>
          </tr>
        </thead>

        <tbody className="text-sm text-light-text dark:text-white font-medium relative z-0">
          {childFolders.map((folder) => (
            <FolderRow
              key={folder._id}
              folder={folder}
              isMenuOpen={openMenuId === `folder-${folder._id}`}
              isSelected={selectedFolderIds.includes(folder._id)}
              onToggleSelection={() => onToggleSelection(folder._id, "folder")}
              onToggleMenu={(e) => toggleMenu(e, `folder-${folder._id}`)}
              onCloseMenu={() => setOpenMenuId(null)}
              onClick={(e) => handleRowClick(e, folder._id, "folder")}
              onDoubleClick={() => onFolderDoubleClick(folder._id)}
              onRename={() => {
                onFolderRenameClick?.(folder._id);
                setOpenMenuId(null);
              }}
              onDelete={() => {
                onFolderDeleteClick?.(folder._id);
                setOpenMenuId(null);
              }}
              onDownload={() => {
                onFolderDownloadClick?.(folder._id);
                setOpenMenuId(null);
              }}
              onOrganizeFolder={() => {
                onOrganizeFolderClick?.(folder._id);
                setOpenMenuId(null);
              }}
            />
          ))}

          {documents.map((doc) => (
            <DocumentRow
              key={doc._id}
              doc={doc}
              isSelected={selectedDocIds.includes(doc._id)}
              isMenuOpen={openMenuId === `doc-${doc._id}`}
              onToggleMenu={(e) => toggleMenu(e, `doc-${doc._id}`)}
              onCloseMenu={() => setOpenMenuId(null)}
              onToggleSelection={() => onToggleSelection(doc._id, "document")}
              onClick={(e) => {
                handleRowClick(e, doc._id, "document");
                onRowClick(doc);
              }}
              onDoubleClick={() => onRowDoubleClick(doc)}
              onShare={() => {
                onShareClick(doc);
                setOpenMenuId(null);
              }}
              onRename={() => {
                onRenameClick(doc);
                setOpenMenuId(null);
              }}
              onDelete={() => {
                onDeleteClick(doc);
                setOpenMenuId(null);
              }}
              onSummarize={() => {
                onSummarizeClick?.(doc);
                setOpenMenuId(null);
              }}
              onCompare={() => {
                onCompareClick?.(doc);
                setOpenMenuId(null);
              }}
              onReveal={() => {
                onRevealClick?.(doc);
                setOpenMenuId(null);
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
