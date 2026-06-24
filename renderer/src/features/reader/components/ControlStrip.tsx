import { Icon } from "../../../components/ui/core/Icons";

interface ControlStripProps {
  viewMode: "extracted" | "original" | "prettify";
  setViewMode: (mode: "extracted" | "original" | "prettify") => void;
  isImage: boolean;
  isExcel: boolean;
  isWord: boolean;
  isTextSnippet: boolean;
  isSupportedForPrettify: boolean;
}

export const ControlStrip = ({
  viewMode,
  setViewMode,
  isImage,
  isExcel,
  isWord,
  isTextSnippet,
  isSupportedForPrettify,
}: ControlStripProps) => {
  if (!isImage && !isExcel && !isWord && !isTextSnippet) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-12 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md border-b border-light-border dark:border-white/5 sticky top-0 z-20 shrink-0">
      <div className="flex bg-light-bg/50 dark:bg-[#18181B]/50 p-1 rounded-full border border-light-border dark:border-white/10 shadow-sm backdrop-blur-md">
        {/* Original / Extracted button */}
        {(isImage || isExcel) && (
          <button
            onClick={() => setViewMode("extracted")}
            className={`px-4 py-1.5 rounded-full shadow-sm text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === "extracted"
                ? "bg-light-primary dark:bg-dark-primary text-white dark:text-black"
                : "hover:bg-light-border dark:hover:bg-white/5 text-light-text/70 dark:text-dark-text/70"
            }`}
          >
            <Icon name="subject" className="text-[16px]" />
            {isExcel ? "Raw Data (CSV)" : "Extracted Text"}
          </button>
        )}
        <button
          onClick={() => setViewMode("original")}
          className={`px-4 py-1.5 rounded-full shadow-sm text-xs font-bold flex items-center gap-2 transition-all ${
            viewMode === "original"
              ? "bg-light-primary dark:bg-dark-primary text-white dark:text-black"
              : "hover:bg-light-border dark:hover:bg-white/5 text-light-text/70 dark:text-dark-text/70"
          }`}
        >
          <Icon
            name={
              isExcel
                ? "table_view"
                : isImage
                  ? "image"
                  : isWord
                    ? "description"
                    : "text_snippet"
            }
            className="text-[16px]"
          />
          {isExcel
            ? "Interactive Grid"
            : isImage
              ? "Original Image"
              : isWord
                ? "Original Document"
                : "Original Text"}
        </button>
        {/* Prettify toggle — only for Excel, Word, TextSnippet */}
        {isSupportedForPrettify && (
          <button
            onClick={() => setViewMode("prettify")}
            className={`px-4 py-1.5 rounded-full shadow-sm text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === "prettify"
                ? "bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-secondary text-white shadow-light-primary/25 dark:shadow-dark-primary/25"
                : "hover:bg-light-border dark:hover:bg-white/5 text-light-text/80 dark:text-white/80"
            }`}
          >
            <Icon name="auto_awesome" className="text-[16px]" />
            Prettify
          </button>
        )}
      </div>
    </div>
  );
};
