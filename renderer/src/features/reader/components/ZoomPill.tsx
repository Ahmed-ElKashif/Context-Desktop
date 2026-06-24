interface ZoomPillProps {
  zoomLevel: number;
  showPill: boolean;
}

export const ZoomPill = ({ zoomLevel, showPill }: ZoomPillProps) => {
  return (
    <div
      className={`absolute bottom-6 right-6 px-3 py-1.5 rounded-full bg-black/70 dark:bg-black/80 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold shadow-lg transition-opacity duration-300 pointer-events-none z-50 ${
        showPill ? "opacity-100" : "opacity-0"
      }`}
    >
      {Math.round(zoomLevel * 100)}%
    </div>
  );
};
