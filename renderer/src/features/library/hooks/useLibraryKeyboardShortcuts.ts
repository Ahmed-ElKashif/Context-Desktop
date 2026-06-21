import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import { setSelection } from "../../../store/library/selectionSlice";
import { LibraryItem } from "./useSelectionManager";

export const useLibraryKeyboardShortcuts = (
  allOrderedItems: LibraryItem[],
  selectedDocIds: string[],
  selectedFolderIds: string[],
  onOpen: (item: DocumentData | FolderData, type: "doc" | "folder") => void,
  onDelete: () => void,
  onRename: (item: DocumentData | FolderData, type: "doc" | "folder") => void,
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const activeEl = document.activeElement as HTMLElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.isContentEditable
      ) {
        return;
      }

      // Ignore if a modal is open (dialogs typically have role="dialog" or class="modal")
      if (document.querySelector('[role="dialog"]') || document.querySelector('.modal')) {
        return;
      }

      const totalItems = allOrderedItems.length;
      if (totalItems === 0) return;

      const getSelectedIndexes = () => {
        const indexes: number[] = [];
        allOrderedItems.forEach((w, i) => {
          if (w.type === "doc" && selectedDocIds.includes(w.item._id)) {
            indexes.push(i);
          } else if (w.type === "folder" && selectedFolderIds.includes(w.item._id)) {
            indexes.push(i);
          }
        });
        return indexes;
      };

      const selectedIndexes = getSelectedIndexes();
      const lastSelected = selectedIndexes.length > 0 ? Math.max(...selectedIndexes) : -1;
      const firstSelected = selectedIndexes.length > 0 ? Math.min(...selectedIndexes) : -1;

      // Helper to scroll item into view
      const scrollToItem = (id: string) => {
        // Small delay to ensure state update has rendered
        setTimeout(() => {
          const el = document.querySelector(`tr[data-item-id="${id}"]`);
          if (el) {
            el.scrollIntoView({ block: "nearest" });
          }
        }, 10);
      };

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          let nextIndex = 0;
          if (selectedIndexes.length > 0) {
            nextIndex = Math.min(lastSelected + 1, totalItems - 1);
          }
          const nextItem = allOrderedItems[nextIndex];
          
          if (e.shiftKey && selectedIndexes.length > 0) {
            // Expand selection downwards
            const currentSelectedDocs = allOrderedItems.filter((w, i) => selectedIndexes.includes(i) && w.type === "doc").map(w => w.item as DocumentData);
            const currentSelectedFolders = allOrderedItems.filter((w, i) => selectedIndexes.includes(i) && w.type === "folder").map(w => w.item as FolderData);
            
            if (!selectedIndexes.includes(nextIndex)) {
              if (nextItem.type === "doc") currentSelectedDocs.push(nextItem.item as DocumentData);
              if (nextItem.type === "folder") currentSelectedFolders.push(nextItem.item as FolderData);
            }
            dispatch(setSelection({ docs: currentSelectedDocs, folders: currentSelectedFolders }));
          } else {
            // Single select
            dispatch(setSelection({
              docs: nextItem.type === "doc" ? [nextItem.item as DocumentData] : [],
              folders: nextItem.type === "folder" ? [nextItem.item as FolderData] : [],
            }));
          }
          scrollToItem(nextItem.item._id);
          break;
        }
        
        case "ArrowUp": {
          e.preventDefault();
          let prevIndex = totalItems - 1;
          if (selectedIndexes.length > 0) {
            prevIndex = Math.max(firstSelected - 1, 0);
          }
          const prevItem = allOrderedItems[prevIndex];
          
          if (e.shiftKey && selectedIndexes.length > 0) {
            // Expand selection upwards
            const currentSelectedDocs = allOrderedItems.filter((w, i) => selectedIndexes.includes(i) && w.type === "doc").map(w => w.item as DocumentData);
            const currentSelectedFolders = allOrderedItems.filter((w, i) => selectedIndexes.includes(i) && w.type === "folder").map(w => w.item as FolderData);
            
            if (!selectedIndexes.includes(prevIndex)) {
              if (prevItem.type === "doc") currentSelectedDocs.push(prevItem.item as DocumentData);
              if (prevItem.type === "folder") currentSelectedFolders.push(prevItem.item as FolderData);
            }
            dispatch(setSelection({ docs: currentSelectedDocs, folders: currentSelectedFolders }));
          } else {
            // Single select
            dispatch(setSelection({
              docs: prevItem.type === "doc" ? [prevItem.item as DocumentData] : [],
              folders: prevItem.type === "folder" ? [prevItem.item as FolderData] : [],
            }));
          }
          scrollToItem(prevItem.item._id);
          break;
        }

        case "Enter": {
          if (selectedIndexes.length === 1) {
            e.preventDefault();
            const singleItem = allOrderedItems[selectedIndexes[0]];
            onOpen(singleItem.item, singleItem.type);
          }
          break;
        }

        case "Delete":
        case "Backspace": {
          if (selectedIndexes.length > 0) {
            e.preventDefault();
            onDelete();
          }
          break;
        }

        case "F2": {
          if (selectedIndexes.length === 1) {
            e.preventDefault();
            const singleItem = allOrderedItems[selectedIndexes[0]];
            if (singleItem.type === "folder") {
              const folder = singleItem.item as FolderData;
              if (folder.isAIGenerated || folder.name.toLowerCase().startsWith("random files")) {
                return;
              }
            }
            onRename(singleItem.item, singleItem.type);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allOrderedItems, selectedDocIds, selectedFolderIds, dispatch, onOpen, onDelete, onRename]);
};
