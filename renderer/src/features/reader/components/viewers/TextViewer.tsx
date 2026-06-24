interface TextViewerProps {
  extractedText?: string;
  zoomLevel: number;
  isExcel?: boolean;
}

/**
 * Renders the extracted text / raw CSV content of a document.
 * Used for TextSnippet documents, as well as the "Raw Data (CSV)"
 * tab of Excel files.
 */
export const TextViewer = ({
  extractedText,
  zoomLevel,
  isExcel = false,
}: TextViewerProps) => {
  return (
    <div className="flex-1 min-h-full w-full flex flex-col overflow-auto bg-white dark:bg-[#18181B] rounded-xl">
      <div
        style={{
          fontSize: isExcel ? undefined : `${Math.round(zoomLevel * 100)}%`,
        }}
        className={`w-full flex-1 p-4 md:p-10 space-y-6 leading-relaxed font-medium whitespace-pre-wrap text-justify transition-all duration-200 ${
          isExcel
            ? "font-mono text-sm text-light-text/80 dark:text-white/70"
            : "font-sans text-light-text dark:text-white/90"
        }`}
      >
        {extractedText || "No text could be extracted from this document."}
      </div>
    </div>
  );
};
