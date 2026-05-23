import { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../../components/ui/Icons";
import { FolderData } from "../../../store/documentSlice";
import { useAppSelector } from "../../../store/hooks"; // 🛠️ Pulling the global tree directly
import { useClickOutside } from "../../../components/ui/hooks/useClickOutside";

interface LibrarySidebarProps {
  currentFolder: FolderData | null;
  onNavigate: (folderId?: string) => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDownloadFolder: (folderId: string) => void;
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  isMobileOpen: boolean; // 🛠️ NEW
  onCloseMobile: () => void; // 🛠️ NEW
}

// --- 🛠️ Helper Component for Recursive Windows-Style Folders ---
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
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}) => {
  // Find sub-folders belonging to this folder
  const children = allFolders.filter((f) => f.parentFolder === folder._id);
  const isActive = currentFolder?._id === folder._id;
  const isDescendantActive = currentFolder?.path.startsWith(`${folder.path}/`);

  // Auto-expand if the current folder is inside this branch
  const [isOpen, setIsOpen] = useState(isDescendantActive || false);

  return (
    <div className="w-full">
      <div
        className={`w-full flex items-center justify-between px-2 py-1 rounded-md group transition-colors ${isActive
            ? "bg-light-primary/10 dark:bg-dark-primary/15"
            : "hover:bg-light-bg dark:hover:bg-white/5"
          }`}
        style={{ paddingLeft: `${level * 10 + 6}px` }} // Indentation math
      >
        <button
          onClick={() => onNavigate(folder._id)}
          onContextMenu={(e) => onContextMenu(e, folder._id)}
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
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 shrink-0 text-light-text/40 dark:text-white/30"
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
  onRenameFolder,
  onDeleteFolder,
  onDownloadFolder,
  activeTag,
  onTagSelect,
  isMobileOpen,
  onCloseMobile,
}: LibrarySidebarProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => {
    if (openMenuId) {
      setOpenMenuId(null);
      setMenuRect(null);
    }
  });

  // 🛠️ Grab the global tree we added to Redux
  const { globalFolderTree } = useAppSelector((state) => state.document);

  const handleAllDocumentsClick = () => {
    onNavigate(undefined); // Go to Root
    onTagSelect(null);
  };

  const isAllActive = currentFolder === null && activeTag === null;

  // We only map the ROOT folders here. The recursive component handles the rest.
  const rootFolders = useMemo(() => {
    return globalFolderTree.filter((f) => !f.parentFolder);
  }, [globalFolderTree]);

  const openMenuFolder = useMemo(() => {
    return globalFolderTree.find((f) => f._id === openMenuId);
  }, [openMenuId, globalFolderTree]);

  return (
    <>
      {/* 🛠️ NEW: Mobile Backdrop (Clicking it closes the sidebar) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* 🛠️ UPDATED: The Sidebar Wrapper */}

      <aside
        className={`w-52 flex-shrink-0 bg-light-surface dark:bg-[#0A0A0C] flex flex-col z-50 transition-transform duration-300 absolute md:relative inset-y-0 left-0 h-full
        ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 border-b border-light-border dark:border-white/5 h-14 flex items-center shrink-0">
          <h2 className="text-[10px] font-black text-light-text/50 dark:text-white/40 uppercase tracking-widest flex items-center gap-2">
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

          {/* --- 🌳 The Windows-Style Recursive Tree --- */}
          {rootFolders.length > 0 && (
            <>
              <div className="h-px w-full bg-light-border/50 dark:bg-white/5 my-4"></div>
              <p className="px-4 text-[10px] font-bold text-light-text/40 dark:text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Icon
                  name="folder"
                  className="text-[12px] text-light-text/40 dark:text-white/30"
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
                    onContextMenu={(e, id) => {
                      e.preventDefault();
                      setOpenMenuId(id);
                      setMenuRect((e.currentTarget as HTMLElement).getBoundingClientRect());
                    }}
                  />
                ))}

                {/* RIGHT-CLICK MENU (Portal) */}
                {openMenuId && menuRect && (() => {
                  const isNearBottom = menuRect.bottom + 150 > window.innerHeight;
                  return createPortal(
                  <div 
                    ref={menuRef} 
                    className={`fixed z-[100] w-40 bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 text-left animate-in fade-in zoom-in-95 duration-100 ${
                      isNearBottom ? "origin-bottom-left" : "origin-top-left"
                    }`}
                    style={{
                      top: isNearBottom ? undefined : menuRect.top,
                      bottom: isNearBottom ? window.innerHeight - menuRect.bottom : undefined,
                      left: menuRect.right + 4 // Pop to the right of the sidebar item!
                    }}
                  >
                    {!openMenuFolder?.isAIGenerated && openMenuFolder?.name !== "Random Files" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRenameFolder(openMenuId);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-sm font-semibold text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <span className="material-symbols-rounded text-[16px] text-blue-500">
                              edit
                            </span>
                            Rename
                          </button>
                          <div className="h-px w-full bg-light-border dark:bg-white/10 my-1"></div>
                        </>
                      )}
                      {(openMenuFolder?.isAIGenerated || openMenuFolder?.name === "Random Files") && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownloadFolder(openMenuId);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-sm font-semibold text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <span className="material-symbols-rounded text-[16px] text-green-500">
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
                          onDeleteFolder(openMenuId);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                      >
                        <span className="material-symbols-rounded text-[18px]">
                          delete
                        </span>
                        Delete
                      </button>
                    </div>,
                    document.body
                  );
                })()}
              </div>
            </>
          )}

     
        
        </div>
      </aside>
    </>
  );
};
