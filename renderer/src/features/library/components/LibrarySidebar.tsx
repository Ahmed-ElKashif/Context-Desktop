import { useState, useMemo } from "react";
import { Icon } from "../../../components/ui/core/Icons";
import { FolderData } from "../../../store/library/librarySlice";
import { useAppSelector } from "../../../store/hooks"; 

interface LibrarySidebarProps {
  currentFolder: FolderData | null;
  onNavigate: (folderId?: string) => void;
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  isMobileOpen: boolean; 
  onCloseMobile: () => void; 
  onContextMenu: (e: React.MouseEvent, folder: FolderData, type: "doc" | "folder") => void;
}

const FolderTreeItem = ({
  folder,
  allFolders,
  level = 0,
  currentFolder,
  onNavigate,
  onContextMenu,
}: {
  folder: FolderData;
  allFolders: FolderData[];
  level?: number;
  currentFolder: FolderData | null;
  onNavigate: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, folder: FolderData, type: "doc" | "folder") => void;
}) => {
  const children = allFolders.filter((f) => f.parentFolder === folder._id);
  const isActive = currentFolder?._id === folder._id;
  const isDescendantActive = currentFolder?.path.startsWith(`${folder.path}/`);

  const [isOpen, setIsOpen] = useState(isDescendantActive || false);

  return (
    <div className="w-full">
      <div
        className={`w-full flex items-center justify-between px-2 py-1 rounded-md group transition-colors ${isActive
            ? "bg-light-primary/10 dark:bg-dark-primary/15"
            : "hover:bg-light-bg dark:hover:bg-white/5"
          }`}
        style={{ paddingLeft: `${level * 10 + 6}px` }} 
      >
        <button
          onClick={() => onNavigate(folder._id)}
          onContextMenu={(e) => onContextMenu(e, folder, "folder")}
          className="flex items-center gap-2 flex-1 overflow-hidden"
        >
          <Icon
            name={isOpen && children.length > 0 ? "folder_open" : "folder"}
            className={`text-[16px] shrink-0 ${isActive
                ? "text-light-primary dark:text-dark-primary"
                : "text-yellow-500"
              }`}
          />
          <span
            className={`truncate text-sm font-semibold ${isActive
                ? "text-light-primary dark:text-dark-primary"
                : "text-light-text/70 dark:text-white/60 group-hover:text-light-text dark:group-hover:text-white"
              }`}
          >
            {folder.name}
          </span>
        </button>

        {children.length > 0 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
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
            <FolderTreeItem
              key={child._id}
              folder={child}
              allFolders={allFolders}
              level={level + 1}
              currentFolder={currentFolder}
              onNavigate={onNavigate}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LibrarySidebar = ({
  currentFolder,
  onNavigate,
  activeTag,
  onTagSelect,
  isMobileOpen,
  onCloseMobile,
  onContextMenu,
}: LibrarySidebarProps) => {
  const { globalFolderTree } = useAppSelector((state) => state.library);

  const handleAllDocumentsClick = () => {
    onNavigate(undefined); 
    onTagSelect(null);
  };

  const isAllActive = currentFolder === null && activeTag === null;

  const rootFolders = useMemo(() => {
    return globalFolderTree.filter((f) => !f.parentFolder);
  }, [globalFolderTree]);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`w-52 flex-shrink-0 bg-light-surface dark:bg-[#0A0A0C] flex flex-col z-50 transition-transform duration-300 absolute md:relative inset-y-0 left-0 h-full
        ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 border-b border-light-border dark:border-white/5 h-14 flex items-center shrink-0">
          <h2 className="text-[10px] font-black text-light-text/70 dark:text-white/60 uppercase tracking-widest flex items-center gap-2">
            <Icon name="grid_view" className="text-[14px]" />
            Spaces
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <div className="px-2 mb-2">
            <button
              onClick={handleAllDocumentsClick}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${isAllActive
                  ? "bg-light-primary/10 dark:bg-dark-primary/15 text-light-primary dark:text-dark-primary shadow-sm"
                  : "text-light-text/70 dark:text-white/60 hover:bg-light-bg dark:hover:bg-white/5 hover:text-light-text dark:hover:text-white"
                }`}
            >
              <Icon
                name={isAllActive ? "folder_open" : "folder"}
                className="text-base"
              />
              All Documents
            </button>
          </div>

          {rootFolders.length > 0 && (
            <>
              <div className="h-px w-full bg-light-border/50 dark:bg-white/5 my-4"></div>
              <p className="px-4 text-[10px] font-bold text-light-text/60 dark:text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Icon
                  name="folder"
                  className="text-[12px] text-light-text/60 dark:text-white/50"
                />
                Your Folders
              </p>

              <div className="px-2 space-y-0.5 relative">
                {rootFolders.map((folder) => (
                  <FolderTreeItem
                    key={folder._id}
                    folder={folder}
                    allFolders={globalFolderTree}
                    currentFolder={currentFolder}
                    onNavigate={onNavigate}
                    onContextMenu={onContextMenu}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
