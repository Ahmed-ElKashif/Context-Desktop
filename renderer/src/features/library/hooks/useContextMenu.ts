import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import { useLibraryContextMenu } from "../../../contexts/ContextMenuContext";
import { UseContextMenuOptions, ActionContext } from "./context-menu/types";
import { buildContextMenu } from "./context-menu/menuBuilder";

export const useContextMenu = (handlers: UseContextMenuOptions) => {
  const { showMenu } = useLibraryContextMenu();

  const openMenu = (
    e: React.MouseEvent,
    clickedItem?: { type: "doc" | "folder"; item: DocumentData | FolderData },
    type?: "doc" | "folder"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Standardize the payload
    if (!clickedItem && type) {
      console.warn("useContextMenu: Provided type without item payload.");
    }

    const ctx: ActionContext = {
      clickedItem: clickedItem || undefined, // Fallback if type is passed but not packed
      totalSelected: handlers.selectedDocIds.length + handlers.selectedFolderIds.length,
      selectedDocIds: handlers.selectedDocIds,
      selectedFolderIds: handlers.selectedFolderIds,
      selectedDocs: handlers.selectedDocs,
      handlers,
    };

    const items = buildContextMenu(ctx);
    
    if (items.length > 0) {
      showMenu(items, { x: e.clientX, y: e.clientY });
    }
  };

  return { openMenu };
};
