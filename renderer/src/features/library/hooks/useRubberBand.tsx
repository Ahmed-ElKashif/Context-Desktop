import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import { setSelection } from "../../../store/library/selectionSlice";
import { LibraryItem } from "./useSelectionManager";

interface Point {
  x: number;
  y: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const useRubberBand = (
  containerRef: React.RefObject<HTMLElement | null>,
  allOrderedItems: LibraryItem[],
  selectedDocs: DocumentData[],
  selectedFolders: FolderData[],
) => {
  const dispatch = useDispatch();
  const [isLassoing, setIsLassoing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 });

  // Store the initial selection state before shift-lasso
  const initialSelection = useRef<{ docs: DocumentData[]; folders: FolderData[] }>({
    docs: [],
    folders: [],
  });

  const handleMouseDown = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      // Only trigger on left click
      if (e.button !== 0) return;

      // Ensure we are clicking on the container or its immediate children, 
      // but NOT on interactive elements like buttons, inputs, checkboxes, or existing selected rows (maybe? actually we want lasso over rows).
      // A robust way: check if target is an interactive element
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('a')
      ) {
        return;
      }

      // Record initial selection for additive lasso (Shift)
      initialSelection.current = {
        docs: e.shiftKey ? [...selectedDocs] : [],
        folders: e.shiftKey ? [...selectedFolders] : [],
      };

      setStartPoint({ x: e.clientX, y: e.clientY });
      setCurrentPoint({ x: e.clientX, y: e.clientY });

      // Don't set isLassoing immediately, wait for a small drag threshold
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startPoint.x;
        const dy = moveEvent.clientY - startPoint.y;
        if (!isLassoing && Math.sqrt(dx * dx + dy * dy) > 5) {
          setIsLassoing(true);
        }

        setCurrentPoint({ x: moveEvent.clientX, y: moveEvent.clientY });

        // Calculate intersection
        if (containerRef.current) {
          const lassoRect: Rect = {
            left: Math.min(startPoint.x, moveEvent.clientX),
            top: Math.min(startPoint.y, moveEvent.clientY),
            right: Math.max(startPoint.x, moveEvent.clientX),
            bottom: Math.max(startPoint.y, moveEvent.clientY),
          };

          const rowElements = containerRef.current.querySelectorAll("tr[data-item-id]");
          
          const newSelectedDocs = new Map<string, DocumentData>(
            initialSelection.current.docs.map(d => [d._id, d])
          );
          const newSelectedFolders = new Map<string, FolderData>(
            initialSelection.current.folders.map(f => [f._id, f])
          );

          rowElements.forEach((row) => {
            const rect = row.getBoundingClientRect();
            // AABB collision detection
            const intersects = !(
              lassoRect.right < rect.left ||
              lassoRect.left > rect.right ||
              lassoRect.bottom < rect.top ||
              lassoRect.top > rect.bottom
            );

            if (intersects) {
              const id = row.getAttribute("data-item-id");
              const type = row.getAttribute("data-item-type");
              if (id && type) {
                const itemWrapper = allOrderedItems.find(w => w.item._id === id);
                if (itemWrapper) {
                  if (type === "doc") {
                    newSelectedDocs.set(id, itemWrapper.item as DocumentData);
                  } else {
                    newSelectedFolders.set(id, itemWrapper.item as FolderData);
                  }
                }
              }
            }
          });

          dispatch(setSelection({
            docs: Array.from(newSelectedDocs.values()),
            folders: Array.from(newSelectedFolders.values()),
          }));
        }
      };

      const handleMouseUp = () => {
        setIsLassoing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [dispatch, startPoint, isLassoing, containerRef, allOrderedItems, selectedDocs, selectedFolders]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousedown", handleMouseDown);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, [containerRef, handleMouseDown]);

  const rubberBandStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(startPoint.x, currentPoint.x),
    top: Math.min(startPoint.y, currentPoint.y),
    width: Math.abs(currentPoint.x - startPoint.x),
    height: Math.abs(currentPoint.y - startPoint.y),
    pointerEvents: "none",
    zIndex: 50,
  };

  const rubberBandOverlay = isLassoing ? (
    <div
      style={rubberBandStyle}
      className="bg-light-primary/10 dark:bg-dark-primary/10 border border-light-primary/40 dark:border-dark-primary/40"
    />
  ) : null;

  return {
    isLassoing,
    rubberBandOverlay,
  };
};
