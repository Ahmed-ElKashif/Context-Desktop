import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import { 
  selectSingle, 
  selectRange, 
  setFocus, 
  toggleDocSelection, 
  toggleFolderSelection,
} from "../../../store/library/selectionSlice";
import { LibraryItem } from "./useSelectionManager";
import { RootState } from "../../../store/store";

export const useLibraryKeyboardShortcuts = (
  allOrderedItems: LibraryItem[],
  selectedDocIds: string[],
  selectedFolderIds: string[],
  onOpen: (item: DocumentData | FolderData, type: "doc" | "folder") => void,
  onDelete: () => void,
  onRename: (item: DocumentData | FolderData, type: "doc" | "folder") => void,
  onCreateFolder: () => void,
  onCopyClipboard: () => void,
  onPasteClipboard: () => void,
) => {
  const dispatch = useDispatch();
  const anchorId = useSelector((state: RootState) => state.selection.anchorId);
  const focusId = useSelector((state: RootState) => state.selection.focusId);

  const typeBufferRef = useRef<string>("");
  const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.isContentEditable
      ) {
        return;
      }

      if (document.querySelector('[role="dialog"]') || document.querySelector('.modal')) {
        return;
      }

      const totalItems = allOrderedItems.length;

      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        onCreateFolder();
        return;
      }

      if (totalItems === 0) return;

      // Handle Paste specifically before returning on empty folder
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        onPasteClipboard();
        return;
      }

      if (totalItems === 0) return;

      const anchorIndex = anchorId ? allOrderedItems.findIndex(w => w.item._id === anchorId) : -1;
      const focusIndex = focusId ? allOrderedItems.findIndex(w => w.item._id === focusId) : -1;
      
      const currentFocus = focusIndex !== -1 ? focusIndex : 0;
      const currentAnchor = anchorIndex !== -1 ? anchorIndex : currentFocus;

      const scrollToItem = (id: string) => {
        setTimeout(() => {
          const el = document.querySelector(`tr[data-item-id="${id}"]`);
          if (el) el.scrollIntoView({ block: "nearest" });
        }, 10);
      };

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Exclude Spacebar
        if (e.key === " ") return;

        if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
        
        typeBufferRef.current += e.key.toLowerCase();
        
        let foundIndex = -1;
        for (let i = 0; i < totalItems; i++) {
          const searchIndex = (currentFocus + i) % totalItems;
          const itemName = allOrderedItems[searchIndex].type === "folder" 
            ? (allOrderedItems[searchIndex].item as FolderData).name 
            : (allOrderedItems[searchIndex].item as DocumentData).title;
            
          if (itemName.toLowerCase().startsWith(typeBufferRef.current)) {
            foundIndex = searchIndex;
            break;
          }
        }

        if (foundIndex !== -1) {
          const foundItem = allOrderedItems[foundIndex];
          dispatch(selectSingle({ item: foundItem.item, type: foundItem.type }));
          scrollToItem(foundItem.item._id);
        }

        typeTimeoutRef.current = setTimeout(() => {
          typeBufferRef.current = "";
        }, 500);
        return;

      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIndex = Math.min(currentFocus + 1, totalItems - 1);
          const nextItem = allOrderedItems[nextIndex];
          
          if (e.shiftKey) {
            dispatch(selectRange({
              allItems: allOrderedItems,
              fromIndex: currentAnchor,
              toIndex: nextIndex,
              clearOthers: true
            }));
          } else if (e.ctrlKey || e.metaKey) {
            dispatch(setFocus(nextItem.item._id));
          } else {
            dispatch(selectSingle({ item: nextItem.item, type: nextItem.type }));
          }
          scrollToItem(nextItem.item._id);
          break;
        }
        
        case "ArrowUp": {
          e.preventDefault();
          const prevIndex = Math.max(currentFocus - 1, 0);
          const prevItem = allOrderedItems[prevIndex];
          
          if (e.shiftKey) {
            dispatch(selectRange({
              allItems: allOrderedItems,
              fromIndex: currentAnchor,
              toIndex: prevIndex,
              clearOthers: true
            }));
          } else if (e.ctrlKey || e.metaKey) {
            dispatch(setFocus(prevItem.item._id));
          } else {
            dispatch(selectSingle({ item: prevItem.item, type: prevItem.type }));
          }
          scrollToItem(prevItem.item._id);
          break;
        }

        case " ": {
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            if (focusIndex !== -1) {
              const focusedItem = allOrderedItems[focusIndex];
              if (focusedItem.type === "doc") {
                dispatch(toggleDocSelection(focusedItem.item as DocumentData));
              } else {
                dispatch(toggleFolderSelection(focusedItem.item as FolderData));
              }
            }
          }
          break;
        }

        case "Enter": {
          if (focusIndex !== -1) {
             e.preventDefault();
             const selectedCount = selectedDocIds.length + selectedFolderIds.length;
             if (selectedCount === 1) {
                const singleSelected = allOrderedItems.find(w => 
                  (w.type === "doc" && selectedDocIds.includes(w.item._id)) ||
                  (w.type === "folder" && selectedFolderIds.includes(w.item._id))
                );
                if (singleSelected) onOpen(singleSelected.item, singleSelected.type);
             } else {
                const focusedItem = allOrderedItems[focusIndex];
                onOpen(focusedItem.item, focusedItem.type);
             }
          }
          break;
        }

        case "Delete":
        case "Backspace": {
          const selectedCount = selectedDocIds.length + selectedFolderIds.length;
          if (selectedCount > 0) {
            e.preventDefault();
            onDelete();
          }
          break;
        }

        case "c":
        case "C": {
          if (e.ctrlKey || e.metaKey) {
            const selectedCount = selectedDocIds.length + selectedFolderIds.length;
            if (selectedCount > 0) {
              e.preventDefault();
              onCopyClipboard();
            }
          }
          break;
        }

        // Ctrl+V is handled earlier to support pasting into empty folders

        case "F2": {
          const selectedCount = selectedDocIds.length + selectedFolderIds.length;
          if (selectedCount === 1) {
            e.preventDefault();
            const singleSelected = allOrderedItems.find(w => 
              (w.type === "doc" && selectedDocIds.includes(w.item._id)) ||
              (w.type === "folder" && selectedFolderIds.includes(w.item._id))
            );
            if (singleSelected) {
              if (singleSelected.type === "folder") {
                const folder = singleSelected.item as FolderData;
                if (folder.isAIGenerated || folder.name.toLowerCase().startsWith("random files")) {
                  return;
                }
              }
              onRename(singleSelected.item, singleSelected.type);
            }
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allOrderedItems, selectedDocIds, selectedFolderIds, anchorId, focusId, dispatch, onOpen, onDelete, onRename, onCreateFolder, onCopyClipboard, onPasteClipboard]);
};
