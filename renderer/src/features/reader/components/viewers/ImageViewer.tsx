interface ImageViewerProps {
  fileUrl: string;
  documentTitle: string;
  zoomLevel: number;
}

/**
 * Renders an image file with zoom support.
 */
export const ImageViewer = ({
  fileUrl,
  documentTitle,
  zoomLevel,
}: ImageViewerProps) => {
  return (
    <div className="flex-1 min-h-0 w-full h-full overflow-auto bg-black/5 dark:bg-white/5 rounded-xl text-center flex items-start justify-center">
      <img
        style={{ 
          height: `${Math.round(zoomLevel * 100)}%`,
          width: "auto",
        }}
        src={fileUrl}
        alt={documentTitle}
        className="max-w-none object-contain p-4 transition-all duration-200 shadow-sm rounded-lg origin-top"
      />
    </div>
  );
};
