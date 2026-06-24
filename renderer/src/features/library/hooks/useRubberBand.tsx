import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import { setSelection } from "../../../store/library/selectionSlice";
import { LibraryItem } from "./useSelectionManager";

interface Point {
  x: number;
  y: number;
}

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export const useRubberBand = (
  containerRef: React.RefObject<HTMLDivElement>,
  allOrderedItems: LibraryItem[],
  selectedDocIds: string[],
  selectedFolderIds: string[],
) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [initialSelectedDocs, setInitialSelectedDocs] = useState<DocumentData[]>([]);
  const [initialSelectedFolders, setInitialSelectedFolders] = useState<FolderData[]>([]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Ignore right clicks or middle clicks
    if (e.button !== 0) return;

    // Ignore if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.modal') || // don't start drag from a modal
      target.closest('[role="menu"]') // don't start drag from context menu
    ) {
      return;
    }

    // Only start dragging if clicking inside the container
    if (containerRef.current && containerRef.current.contains(target)) {
      setStartPoint({ x: e.clientX, y: e.clientY });
      setCurrentPoint({ x: e.clientX, y: e.clientY });
      
      // Save current selection state if shift is held (additive selection)
      if (e.shiftKey) {
        const currentDocs = allOrderedItems
          .filter(w => w.type === "doc" && selectedDocIds.includes(w.item._id))
          .map(w => w.item as DocumentData);
        const currentFolders = allOrderedItems
          .filter(w => w.type === "folder" && selectedFolderIds.includes(w.item._id))
          .map(w => w.item as FolderData);
        
        setInitialSelectedDocs(currentDocs);
        setInitialSelectedFolders(currentFolders);
      } else {
        setInitialSelectedDocs([]);
        setInitialSelectedFolders([]);
      }
    }
  }, [containerRef, allOrderedItems, selectedDocIds, selectedFolderIds]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!startPoint) return;

    // Only set dragging if we've moved past a small threshold
    // This prevents accidental drags when trying to click
    const threshold = 5;
    const dx = Math.abs(e.clientX - startPoint.x);
    const dy = Math.abs(e.clientY - startPoint.y);

    if (!isDragging && (dx > threshold || dy > threshold)) {
      setIsDragging(true);
      // Clear text selection
      window.getSelection()?.removeAllRanges();
    }

    if (isDragging) {
      setCurrentPoint({ x: e.clientX, y: e.clientY });

      // Calculate intersection frame
      const rubberBandRect: Rect = {
        top: Math.min(startPoint.y, e.clientY),
        bottom: Math.max(startPoint.y, e.clientY),
        left: Math.min(startPoint.x, e.clientX),
        right: Math.max(startPoint.x, e.clientX),
      };

      // Find intersecting elements
      const newlySelectedDocs = new Set<string>();
      const newlySelectedFolders = new Set<string>();
      const docsData: DocumentData[] = [...initialSelectedDocs];
      const foldersData: FolderData[] = [...initialSelectedFolders];

      // Add initially selected items to the sets to prevent duplicates
      initialSelectedDocs.forEach(d => newlySelectedDocs.add(d._id));
      initialSelectedFolders.forEach(f => newlySelectedFolders.add(f._id));

      const rowElements = containerRef.current?.querySelectorAll('tr[data-item-id]');
      if (rowElements) {
        rowElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          
          // Check collision
          const isIntersecting = !(
            rect.right < rubberBandRect.left ||
            rect.left > rubberBandRect.right ||
            rect.bottom < rubberBandRect.top ||
            rect.top > rubberBandRect.bottom
          );

          if (isIntersecting) {
            const id = el.getAttribute('data-item-id');
            const type = el.getAttribute('data-item-type');
            
            if (id && type) {
              const item = allOrderedItems.find(i => i.type === type && i.item._id === id);
              if (item) {
                if (type === 'doc' && !newlySelectedDocs.has(id)) {
                  newlySelectedDocs.add(id);
                  docsData.push(item.item as DocumentData);
                } else if (type === 'folder' && !newlySelectedFolders.has(id)) {
                  newlySelectedFolders.add(id);
                  foldersData.push(item.item as FolderData);
                }
              }
            }
          }
        });
      }

      dispatch(setSelection({ docs: docsData, folders: foldersData }));
    }
  }, [isDragging, startPoint, containerRef, allOrderedItems, initialSelectedDocs, initialSelectedFolders, dispatch]);

  const isDraggingRef = React.useRef(isDragging);
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      // Prevent the immediate click event from firing and clearing the selection
      const preventClick = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        window.removeEventListener('click', preventClick, true);
      };
      window.addEventListener('click', preventClick, true);
      setTimeout(() => {
        window.removeEventListener('click', preventClick, true);
      }, 50);
    }
    setIsDragging(false);
    setStartPoint(null);
    setCurrentPoint(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const getRubberBandStyle = () => {
    if (!isDragging || !startPoint || !currentPoint) return { display: 'none' };

    return {
      left: Math.min(startPoint.x, currentPoint.x),
      top: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y),
    };
  };

  const rubberBandOverlay = isDragging && (
    <div
      className="fixed z-50 pointer-events-none border border-light-primary/50 bg-light-primary/10 dark:border-dark-primary/50 dark:bg-dark-primary/20 backdrop-blur-[1px]"
      style={getRubberBandStyle()}
    />
  );

  return { isDragging, rubberBandOverlay };
};
