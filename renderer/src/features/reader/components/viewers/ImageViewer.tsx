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
    <div className="flex-1 min-h-0 w-full h-full overflow-auto flex items-center justify-center">
      <img
        style={{ transform: `scale(${zoomLevel})` }}
        src={fileUrl}
        alt={documentTitle}
        className="max-w-full max-h-full object-contain p-4 transition-transform duration-200"
      />
    </div>
  );
};
