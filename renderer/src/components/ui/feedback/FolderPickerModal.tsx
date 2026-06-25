import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../core/Icons";
import { Button } from "../core/Button";
import { FolderData } from "../../../store/library/librarySlice";

interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetFolderId: string | null) => void;
  title: string;
  actionLabel: string;
  globalFolderTree: FolderData[];
  onCreateNewFolder: (parentFolderId: string | null) => void;
  disabledFolderIds?: string[];
  isLoading?: boolean;
}

const PickerTreeItem = ({
  folder,
  allFolders,
  level = 0,
  selectedFolderId,
  invalidDestinationIds,
  onSelect,
}: {
  folder: FolderData;
  allFolders: FolderData[];
  level?: number;
  selectedFolderId: string | null;
  invalidDestinationIds: Set<string>;
  onSelect: (id: string | null) => void;
}) => {
  const children = allFolders.filter((f) => f.parentFolder === folder._id);
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedFolderId === folder._id;
  const isInvalid = invalidDestinationIds.has(folder._id);

  return (
    <div className={`w-full ${isInvalid ? "opacity-40 pointer-events-none" : ""}`}>
      <div
        className={`w-full flex items-center justify-between px-2 py-[7px] rounded-lg group transition-colors cursor-pointer ${
          isSelected
            ? "bg-light-primary/10 dark:bg-dark-primary/15 ring-1 ring-light-primary/20 dark:ring-dark-primary/20"
            : "hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${level * 20 + 10}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(folder._id);
        }}
      >
        <div className="flex items-center gap-2.5 flex-1 overflow-hidden min-w-0">
          {/* Expand chevron — always reserved so names align */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (children.length > 0) setIsExpanded(!isExpanded);
            }}
            className={`w-5 h-5 flex items-center justify-center rounded shrink-0 transition-colors ${
              children.length > 0
                ? "text-light-text/50 dark:text-white/40 hover:text-light-text dark:hover:text-white"
                : "pointer-events-none opacity-0"
            }`}
          >
            <Icon
              name={isExpanded ? "expand_more" : "chevron_right"}
              className="text-[16px]"
            />
          </button>

          <Icon
            name={isExpanded && children.length > 0 ? "folder_open" : "folder"}
            className={`text-[20px] shrink-0 ${
              isSelected
                ? "text-light-primary dark:text-dark-primary"
                : "text-yellow-500"
            }`}
          />
          <span
            className={`truncate text-sm font-medium ${
              isSelected
                ? "text-light-primary dark:text-dark-primary font-semibold"
                : "text-light-text dark:text-white/90"
            }`}
          >
            {folder.name}
          </span>
        </div>

        {isSelected && (
          <Icon
            name="check"
            className="text-[16px] text-light-primary dark:text-dark-primary shrink-0 ml-2"
          />
        )}
      </div>

      {isExpanded && children.length > 0 && (
        <div className="mt-0.5">
          {children.map((child) => (
            <PickerTreeItem
              key={child._id}
              folder={child}
              allFolders={allFolders}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              invalidDestinationIds={invalidDestinationIds}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  actionLabel,
  globalFolderTree,
  onCreateNewFolder,
  disabledFolderIds,
  isLoading = false,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const rootFolders = useMemo(
    () => globalFolderTree.filter((f) => !f.parentFolder),
    [globalFolderTree]
  );

  const invalidDestinationIds = useMemo(() => {
    if (!disabledFolderIds || disabledFolderIds.length === 0)
      return new Set<string>();
    const invalidSet = new Set<string>(disabledFolderIds);
    let added = true;
    while (added) {
      added = false;
      globalFolderTree.forEach((f) => {
        if (
          f.parentFolder &&
          invalidSet.has(f.parentFolder) &&
          !invalidSet.has(f._id)
        ) {
          invalidSet.add(f._id);
          added = true;
        }
      });
    }
    return invalidSet;
  }, [disabledFolderIds, globalFolderTree]);

  // Filtered flat list for search results
  const filteredFolders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return globalFolderTree.filter(
      (f) =>
        f.name.toLowerCase().includes(q) && !invalidDestinationIds.has(f._id)
    );
  }, [search, globalFolderTree, invalidDestinationIds]);

  // Resolve the display name of the selected destination
  const selectedFolderName = useMemo(() => {
    if (selectedFolderId === null) return "My files";
    return (
      globalFolderTree.find((f) => f._id === selectedFolderId)?.name ?? "My files"
    );
  }, [selectedFolderId, globalFolderTree]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-[#1e1e1e] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-[620px] flex flex-col max-h-[78vh] animate-in zoom-in-95 duration-150">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h3 className="text-[17px] font-semibold text-light-text dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-light-text/50 dark:text-white/40 mt-0.5">
              Choose a destination folder
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/8 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-rounded text-[18px] text-light-text/50 dark:text-white/50">
              close
            </span>
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 bg-light-bg dark:bg-white/6 border border-light-border dark:border-white/8 rounded-xl px-3 py-2">
            <Icon name="search" className="text-[18px] text-light-text/40 dark:text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="Search folders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-light-text dark:text-white placeholder:text-light-text/35 dark:placeholder:text-white/30 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="shrink-0 text-light-text/40 dark:text-white/30 hover:text-light-text dark:hover:text-white transition-colors">
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
        </div>

        {/* ── Tree / Search results ── */}
        <div className="flex-1 overflow-y-auto px-3 pb-1 space-y-0.5 min-h-[280px]">
          {filteredFolders ? (
            // ── Search results ──
            filteredFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-light-text/40 dark:text-white/30">
                <Icon name="search_off" className="text-[32px]" />
                <span className="text-sm">No folders found</span>
              </div>
            ) : (
              filteredFolders.map((folder) => (
                <div
                  key={folder._id}
                  className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg cursor-pointer transition-colors ${
                    selectedFolderId === folder._id
                      ? "bg-light-primary/10 dark:bg-dark-primary/15 ring-1 ring-light-primary/20 dark:ring-dark-primary/20"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  onClick={() => setSelectedFolderId(folder._id)}
                >
                  <Icon name="folder" className="text-[20px] text-yellow-500 shrink-0" />
                  <span className={`text-sm font-medium truncate ${selectedFolderId === folder._id ? "text-light-primary dark:text-dark-primary font-semibold" : "text-light-text dark:text-white/90"}`}>
                    {folder.name}
                  </span>
                  {selectedFolderId === folder._id && (
                    <Icon name="check" className="text-[16px] text-light-primary dark:text-dark-primary shrink-0 ml-auto" />
                  )}
                </div>
              ))
            )
          ) : (
            // ── Full tree ──
            <>
              {/* My files root */}
              <div
                className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg cursor-pointer transition-colors ${
                  selectedFolderId === null
                    ? "bg-light-primary/10 dark:bg-dark-primary/15 ring-1 ring-light-primary/20 dark:ring-dark-primary/20"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                onClick={() => setSelectedFolderId(null)}
              >
                {/* indent spacer to match tree items */}
                <span className="w-5 shrink-0" />
                <Icon
                  name="folder_special"
                  className={`text-[20px] shrink-0 ${
                    selectedFolderId === null
                      ? "text-light-primary dark:text-dark-primary"
                      : "text-light-text/60 dark:text-white/50"
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    selectedFolderId === null
                      ? "text-light-primary dark:text-dark-primary"
                      : "text-light-text/80 dark:text-white/80"
                  }`}
                >
                  My files
                </span>
                {selectedFolderId === null && (
                  <Icon name="check" className="text-[16px] text-light-primary dark:text-dark-primary shrink-0 ml-auto" />
                )}
              </div>

              {rootFolders.length > 0 && (
                <div className="h-px w-full bg-light-border/60 dark:bg-white/6 my-1.5" />
              )}

              {rootFolders.map((folder) => (
                <PickerTreeItem
                  key={folder._id}
                  folder={folder}
                  allFolders={globalFolderTree}
                  selectedFolderId={selectedFolderId}
                  invalidDestinationIds={invalidDestinationIds}
                  onSelect={setSelectedFolderId}
                />
              ))}
            </>
          )}
        </div>

        {/* ── Selected destination strip ── */}
        <div className="px-6 py-3 border-t border-light-border dark:border-white/6 flex items-center gap-2 bg-light-bg/60 dark:bg-white/[0.03]">
          <Icon name="folder" className="text-[16px] text-light-text/40 dark:text-white/30 shrink-0" />
          <span className="text-xs text-light-text/50 dark:text-white/40 shrink-0">Destination:</span>
          <span className="text-xs font-semibold text-light-text dark:text-white truncate">
            {selectedFolderName}
          </span>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-light-border dark:border-white/6 rounded-b-2xl">
          <Button
            variant="ghost"
            onClick={() => onCreateNewFolder(selectedFolderId)}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-light-text/60 dark:text-white/60 text-sm"
          >
            <Icon name="create_new_folder" className="text-[18px]" />
            New folder
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-sm">
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(selectedFolderId)}
              disabled={isLoading}
              className="text-sm px-5"
            >
              {isLoading ? (
                <Icon name="sync" className="animate-spin" />
              ) : (
                `${actionLabel} here`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
