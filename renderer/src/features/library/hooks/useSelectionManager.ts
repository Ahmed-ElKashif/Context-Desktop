import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import {
  selectSingle,
  toggleDocSelection,
  toggleFolderSelection,
  selectRange,
  toggleAllVisibleSelection,
} from "../../../store/library/selectionSlice";
import { RootState } from "../../../store/store";

export type LibraryItem =
  | { type: "doc"; item: DocumentData }
  | { type: "folder"; item: FolderData };

export const useSelectionManager = (
  selectedDocs: DocumentData[],
  selectedFolders: FolderData[],
) => {
  const dispatch = useDispatch();
  const anchorId = useSelector((state: RootState) => state.selection.anchorId);

  const handleItemClick = useCallback(
    (
      e: React.MouseEvent,
      itemWrapper: LibraryItem,
      index: number,
      allOrderedItems: LibraryItem[]
    ) => {
      e.stopPropagation();

      const { item, type } = itemWrapper;

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
        // Toggle selection
        if (type === "doc") {
          dispatch(toggleDocSelection(item as DocumentData));
        } else {
          dispatch(toggleFolderSelection(item as FolderData));
        }
      } else {
        // Single selection
        dispatch(selectSingle({ item, type }));
      }
    },
    [dispatch, anchorId]
  );

  const handleSelectAll = useCallback(
    (docs: DocumentData[], folders: FolderData[]) => {
      // Check if all visible items are selected
      const isAllDocsSelected = docs.every((d) =>
        selectedDocs.some((sd) => sd._id === d._id)
      );
      const isAllFoldersSelected = folders.every((f) =>
        selectedFolders.some((sf) => sf._id === f._id)
      );

      const isAllVisibleSelected =
        docs.length + folders.length > 0 &&
        isAllDocsSelected &&
        isAllFoldersSelected;

      dispatch(
        toggleAllVisibleSelection({
          docs,
          folders,
          isAllVisibleSelected,
        })
      );
    },
    [dispatch, selectedDocs, selectedFolders]
  );

  return {
    handleItemClick,
    handleSelectAll,
  };
};
