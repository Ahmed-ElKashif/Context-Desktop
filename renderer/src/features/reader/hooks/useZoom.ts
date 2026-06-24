import { useState, useEffect, useRef } from "react";

export const useZoom = (
  initialZoom: number = 1.0,
  minZoom: number = 0.25,
  maxZoom: number = 3.0,
  step: number = 0.1
) => {
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom);
  const [showPill, setShowPill] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger pill fade-in and auto fade-out
  const triggerPill = () => {
    setShowPill(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowPill(false);
    }, 1500);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoomLevel((prev) => {
          let newZoom = prev;
          if (e.deltaY < 0) {
            newZoom = Math.min(prev + step, maxZoom);
          } else {
            newZoom = Math.max(prev - step, minZoom);
          }
          if (newZoom !== prev) {
            triggerPill();
          }
          return newZoom;
        });
      }
    };

    // Attach to the container so that it doesn't leak globally if we don't want to. Wait, Ctrl+0 should ideally be global, or at least when focusing the container. Actually, binding to window makes it work even if the container loses focus, but might interfere with other components if they use Ctrl+0. We can attach to window.
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "0" || e.key === "Numpad0")) {
        e.preventDefault();
        setZoomLevel(initialZoom);
        triggerPill();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [initialZoom, minZoom, maxZoom, step]);

  return { zoomLevel, setZoomLevel, showPill, containerRef, triggerPill };
};
