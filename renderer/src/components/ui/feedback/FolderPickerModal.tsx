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
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedFolderId === folder._id;
  const isInvalid = invalidDestinationIds.has(folder._id);

  return (
    <div className={`w-full ${isInvalid ? "opacity-50 pointer-events-none" : ""}`}>
      <div
        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md group transition-colors cursor-pointer ${
          isSelected
            ? "bg-light-primary/10 dark:bg-dark-primary/15"
            : "hover:bg-light-bg dark:hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(folder._id);
        }}
      >
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <Icon
            name={isOpen && children.length > 0 ? "folder_open" : "folder"}
            className={`text-[18px] shrink-0 ${
              isSelected
                ? "text-light-primary dark:text-dark-primary"
                : "text-yellow-500"
            }`}
          />
          <span
            className={`truncate text-sm font-semibold ${
              isSelected
                ? "text-light-primary dark:text-dark-primary"
                : "text-light-text dark:text-white"
            }`}
          >
            {folder.name}
          </span>
        </div>

        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 shrink-0 text-light-text/60 dark:text-white/50"
          >
            <Icon
              name={isOpen ? "expand_more" : "chevron_right"}
              className="text-[16px]"
            />
          </button>
        )}
      </div>

      {isOpen && children.length > 0 && (
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

  const rootFolders = useMemo(() => {
    return globalFolderTree.filter((f) => !f.parentFolder);
  }, [globalFolderTree]);

  const invalidDestinationIds = useMemo(() => {
    if (!disabledFolderIds || disabledFolderIds.length === 0) return new Set<string>();
    
    const invalidSet = new Set<string>(disabledFolderIds);
    let added = true;
    while (added) {
      added = false;
      globalFolderTree.forEach(f => {
        if (f.parentFolder && invalidSet.has(f.parentFolder) && !invalidSet.has(f._id)) {
          invalidSet.add(f._id);
          added = true;
        }
      });
    }
    return invalidSet;
  }, [disabledFolderIds, globalFolderTree]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />
      <div className="relative bg-white dark:bg-[#1C1C1E] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-white/5">
          <h3 className="text-lg font-bold text-light-text dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <span className="material-symbols-rounded text-[18px] text-light-text/50 dark:text-white/50">
              close
            </span>
          </button>
        </div>

        {/* Scrollable Tree Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[250px]">
          <div
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
              selectedFolderId === null
                ? "bg-light-primary/10 dark:bg-dark-primary/15"
                : "hover:bg-light-bg dark:hover:bg-white/5"
            }`}
            onClick={() => setSelectedFolderId(null)}
          >
            <Icon
              name="folder_special"
              className={`text-[18px] ${
                selectedFolderId === null
                  ? "text-light-primary dark:text-dark-primary"
                  : "text-light-text/70 dark:text-white/60"
              }`}
            />
            <span
              className={`text-sm font-bold ${
                selectedFolderId === null
                  ? "text-light-primary dark:text-dark-primary"
                  : "text-light-text/80 dark:text-white/80"
              }`}
            >
              My files
            </span>
          </div>

          {rootFolders.length > 0 && (
            <div className="h-px w-full bg-light-border/50 dark:bg-white/5 my-2"></div>
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-light-border dark:border-white/5 bg-light-surface dark:bg-[#151515] rounded-b-2xl">
          <Button 
            variant="ghost" 
            onClick={() => onCreateNewFolder(selectedFolderId)} 
            disabled={isLoading}
            className="flex items-center gap-1 text-light-text/70 dark:text-white/70"
          >
            <Icon name="create_new_folder" className="text-[18px]" />
            New folder
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(selectedFolderId)}
              disabled={isLoading}
            >
              {isLoading ? <Icon name="sync" className="animate-spin" /> : `${actionLabel} here`}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
