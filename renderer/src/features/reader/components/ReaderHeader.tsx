import { Link } from "react-router-dom";
import { Icon } from "../../../components/ui/core/Icons";
import { DocumentData } from "../../../store/library/librarySlice";
import { getTagColorClass } from "../../../lib/tagUtils";
import { handleDownload, downloadMarkdownAsFile, generateRawMarkdownString } from "../../../utils/downloadUtils";
import { handleShareClick } from "../../library/utils/tableUtils";
import { notify } from "../../../components/ui/feedback/ToastEngine";

interface ReaderHeaderProps {
  document: DocumentData;
  fileUrl: string | null;
  returnUrl?: string;
  aiStatus?: DocumentData["aiStatus"];
  onReanalyze?: () => void;
}

export const ReaderHeader = ({
  document,
  fileUrl,
  returnUrl = "/workspace",
  aiStatus,
  onReanalyze,
}: ReaderHeaderProps) => {

  const getLoadColor = (load?: string) => {
    switch (load) {
      case "Heavy":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Light":
        return "bg-emerald-500";
      default:
        return "bg-blue-500";
    }
  };

  const isImage = document.fileType === "Image";
  const isText =
    document.fileType === "TextSnippet" || document.fileType === "Word";
  const isExcel = document.fileType === "Excel";

  return (
    <header className="h-16 border-b border-light-border dark:border-white/5 bg-light-surface dark:bg-dark-surface flex items-center justify-between px-6 shrink-0 z-50 shadow-sm relative">
      <div className="flex items-center gap-4 overflow-hidden">
        <Link
          to={returnUrl}
          className="w-8 h-8 flex items-center justify-center shrink-0 text-light-text/60 dark:text-dark-text/50 hover:text-light-primary dark:hover:text-dark-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
          title="Back"
        >
          <Icon name="arrow_back" className="text-[20px]" />
        </Link>
        <div className="h-6 w-px bg-light-border dark:bg-white/10"></div>

        <div className="flex items-center gap-4">
          <div className="relative w-8 h-8 hidden sm:block">
            <div className="relative w-full h-full bg-light-bg dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
              <Icon
                name={
                  isExcel
                    ? "table_chart"
                    : isImage
                      ? "image"
                      : isText
                        ? "text_snippet"
                        : "picture_as_pdf"
                }
                className={`text-[20px] ${isExcel || isImage ? "text-emerald-500" : isText ? "text-light-primary dark:text-dark-primary" : "text-red-500"}`}
              />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-light-surface dark:border-dark-surface ${getLoadColor(document.cognitiveLoad)}`}
              title={`${document.cognitiveLoad || "Unknown"} Cognitive Load`}
            />
          </div>

          <div className="flex flex-col justify-center overflow-hidden">
            <h1 className="text-sm font-bold text-light-text dark:text-white truncate flex items-center gap-2">
              {document.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-light-text/60 dark:text-dark-text/50">
              <span className="font-mono text-light-primary dark:text-dark-primary font-bold">
                {document.fileType}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${getLoadColor(document.cognitiveLoad)}`}
                />
                {document.cognitiveLoad || "Unknown"} Load
              </span>
              <span>•</span>
              <span className="font-medium">
                Extracted {new Date(document.createdAt).toLocaleDateString()}
              </span>
              {aiStatus && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        aiStatus === "Analyzed"
                          ? "bg-emerald-500"
                          : aiStatus === "Failed"
                            ? "bg-red-500"
                            : "bg-amber-500"
                      }`}
                    />
                    <span className={
                      aiStatus === "Analyzed"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : aiStatus === "Failed"
                          ? "text-red-500"
                          : "text-amber-500"
                    }>
                      {aiStatus}
                    </span>
                    {aiStatus === "Failed" && onReanalyze && (
                      <button
                        onClick={onReanalyze}
                        className="ml-1 p-0.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Regenerate Analysis"
                      >
                        <Icon name="refresh" className="text-[14px]" />
                      </button>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {document.tags && document.tags.length > 0 && (
          <div className="hidden lg:flex items-center gap-2">
            {document.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className={`text-[10px] px-2 py-1 rounded border border-transparent font-mono font-bold tracking-wider ${getTagColorClass(tag)}`}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
            {document.tags.length > 2 && (
              <div className="group/tag relative">
                <span
                  tabIndex={0}
                  className="px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wider bg-light-bg dark:bg-white/5 text-light-text/70 dark:text-white/60 border border-light-border dark:border-white/10 cursor-pointer hover:bg-light-primary/10 dark:hover:bg-white/10 transition-colors inline-block"
                >
                  +{document.tags.length - 2}
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 z-[60] hidden group-hover/tag:flex group-focus-within/tag:flex pt-2">
                  <div className="flex flex-wrap gap-2 w-max max-w-[200px] bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-lg p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                    {document.tags.slice(2).map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-1 rounded border border-transparent font-mono font-bold tracking-wider ${getTagColorClass(tag)}`}
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-6 w-px bg-light-border dark:bg-white/10 mx-1 hidden md:block"></div>

        {/* Share Button: requires a physical cloudinary URL */}
        {fileUrl && document.fileType !== "TextSnippet" && (
          <button
            onClick={() => handleShareClick(fileUrl)}
            className="p-2 text-light-text/60 dark:text-dark-text/50 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-bg dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Share Document Link"
          >
            <Icon name="share" className="text-[20px]" />
          </button>
        )}

        {/* Share Button for TextSnippet (Copy Markdown to clipboard) */}
        {document.fileType === "TextSnippet" && document.extractedText && (
          <button
            onClick={async () => {
              const md = generateRawMarkdownString(document);
              await navigator.clipboard.writeText(md);
              notify("Markdown copied to clipboard.", "success");
            }}
            className="p-2 text-light-text/60 dark:text-dark-text/50 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-bg dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Copy Markdown"
          >
            <Icon name="share" className="text-[20px]" />
          </button>
        )}

        {/* TextSnippet: download extractedText as .md (no fileUrl needed) */}
        {document.fileType === "TextSnippet" && document.extractedText && (
          <button
            onClick={() => downloadMarkdownAsFile(generateRawMarkdownString(document), document.title)}
            className="p-2 text-light-text/60 dark:text-dark-text/50 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-bg dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Download Markdown"
          >
            <Icon name="download" className="text-[20px]" />
          </button>
        )}

        {/* All other file types: download from Cloudinary URL */}
        {fileUrl && document.fileType !== "TextSnippet" && (
          <button
            onClick={() => handleDownload(fileUrl, document.title)}
            className="p-2 text-light-text/60 dark:text-dark-text/50 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-bg dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Download Original File"
          >
            <Icon name="download" className="text-[20px]" />
          </button>
        )}
      </div>
    </header>
  );
};
