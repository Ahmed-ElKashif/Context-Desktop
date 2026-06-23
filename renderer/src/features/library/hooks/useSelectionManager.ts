import { useDispatch, useSelector } from "react-redux";
import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import {
  selectSingle,
  selectRange,
  setSelection,
  toggleDocSelection,
  toggleFolderSelection,
} from "../../../store/library/selectionSlice";
import { RootState } from "../../../store/store";

export type LibraryItem =
  | { type: "doc"; item: DocumentData }
  | { type: "folder"; item: FolderData };

export const useSelectionManager = (
  selectedDocIds: string[],
  selectedFolderIds: string[],
) => {
  const dispatch = useDispatch();
  const anchorId = useSelector((state: RootState) => state.selection.anchorId);

  const handleItemClick = (
    e: React.MouseEvent,
    item: LibraryItem,
    index: number,
    allOrderedItems: LibraryItem[],
  ) => {
    e.stopPropagation();

    // Prevent default to avoid text selection on double-click
    if (e.detail > 1) {
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      // Range selection
      e.preventDefault();
      const anchorIndex = anchorId ? allOrderedItems.findIndex(w => w.item._id === anchorId) : 0;
      const fromIndex = anchorIndex !== -1 ? anchorIndex : 0;

      dispatch(
        selectRange({
          allItems: allOrderedItems,
          fromIndex: fromIndex,
          toIndex: index,
          clearOthers: !e.ctrlKey && !e.metaKey,
        })
      );
    } else if (e.ctrlKey || e.metaKey) {
      // Multi-select toggle
      if (item.type === "doc") {
        dispatch(toggleDocSelection(item.item as DocumentData));
      } else {
        dispatch(toggleFolderSelection(item.item as FolderData));
      }
    } else {
      // Single selection
      dispatch(selectSingle({ item: item.item, type: item.type }));
    }
  };

  const handleSelectAll = (visibleDocs: DocumentData[], visibleFolders: FolderData[]) => {
    const totalVisible = visibleDocs.length + visibleFolders.length;
    const totalSelected = selectedDocIds.length + selectedFolderIds.length;

    if (totalSelected === totalVisible && totalVisible > 0) {
      // If all are selected, clear selection
      dispatch(setSelection({ docs: [], folders: [] }));
    } else {
      // Select all visible
      dispatch(setSelection({ docs: visibleDocs, folders: visibleFolders }));
    }
  };

  const isAllSelected = (visibleDocs: DocumentData[], visibleFolders: FolderData[]) => {
    const totalVisible = visibleDocs.length + visibleFolders.length;
    if (totalVisible === 0) return false;
    return selectedDocIds.length + selectedFolderIds.length === totalVisible;
  };

  return {
    handleItemClick,
    handleSelectAll,
    isAllSelected,
  };
};
