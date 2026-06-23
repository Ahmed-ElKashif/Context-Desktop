import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icon } from "../../../../components/ui/core/Icons";
import { MarkdownComponents } from "../../../../components/ui/display/ContextMarkdown";
import { getListItems } from "../../utils/prettify-converters";
import type { DocumentPrettifyResult } from "../../../../services/prettify.service";

interface PrettifyDocumentViewProps {
  result: DocumentPrettifyResult;
  isSnippet: boolean;
  handlePrettify: (force: boolean) => void;
  handleCopyText: () => void;
  handleDownloadMarkdown: () => void;
  handleDownloadDocx: () => void;
  isDownloading: boolean;
  copied: boolean;
}

export const PrettifyDocumentView = ({
  result,
  isSnippet,
  handlePrettify,
  handleCopyText,
  handleDownloadMarkdown,
  handleDownloadDocx,
  isDownloading,
  copied,
}: PrettifyDocumentViewProps) => {
  const isRtl = result.direction === "rtl";

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-light-bg dark:bg-[#0A0A0C]">
      {/* Action bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-light-border dark:border-white/5 bg-white dark:bg-[#18181B]">
        <div className="flex items-center gap-2 text-xs font-bold gradient-text">
          <Icon name="auto_awesome" className="text-[14px] text-light-primary dark:text-dark-primary" />
          Prettified — {result.sections.length} sections
          {/* Language badge */}
          {result.language && (
            <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              {result.language} · {isRtl ? "RTL" : "LTR"}
            </span>
          )}
          {/* Document Type Badge */}
          {result.metadata?.detectedType && (
            <span
              className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest"
              title={
                result.metadata.patterns?.length > 0
                  ? `Detected patterns: ${result.metadata.patterns.join(", ")}`
                  : undefined
              }
            >
              Detected: {result.metadata.detectedType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePrettify(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-light-bg dark:bg-[#0A0A0C] border border-light-border dark:border-white/8 text-light-text/70 dark:text-white/70 hover:text-light-text dark:hover:text-white hover:border-light-primary/40 dark:hover:border-dark-primary/40 transition-all cursor-pointer mr-1"
            title="Re-run AI (bypasses cache)"
          >
            <Icon name="refresh" className="text-[14px]" />
            Re-prettify
          </button>

          {isSnippet ? (
            <>
              <button
                onClick={handleCopyText}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  copied
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-light-bg dark:bg-[#0A0A0C] border-light-border dark:border-white/8 text-light-text/70 dark:text-white/70 hover:text-light-text dark:hover:text-white hover:border-light-primary/40 dark:hover:border-dark-primary/40"
                }`}
              >
                <Icon
                  name={copied ? "check" : "content_copy"}
                  className="text-[13px]"
                />
                {copied ? "Copied!" : "Copy Text"}
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <Icon name="download" className="text-[14px]" />
                Download .md
              </button>
            </>
          ) : (
            <button
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Icon
                name={isDownloading ? "sync" : "download"}
                className={`text-[14px] ${isDownloading ? "animate-spin" : ""}`}
              />
              Download .docx
            </button>
          )}
        </div>
      </div>

      {/* Rendered Document Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div
          className="w-full min-h-full p-4 md:p-10 bg-white dark:bg-[#18181B]"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="max-w-none">
            {result.sections.map((section, si) => {
              const listData = getListItems(section);

              // Heading element based on level
              const HeadingTag = `h${Math.min(section.level, 6)}` as any;

              // Heading style classes per level
              const headingClasses: Record<number, string> = {
                1: "text-3xl font-extrabold tracking-tight text-light-text dark:text-white mb-6 mt-8 first:mt-0 pb-3 border-b-2 border-light-border dark:border-white/15",
                2: "text-xl font-extrabold tracking-tight text-light-text dark:text-white/95 mb-5 mt-12 pt-8 border-t-4 border-light-border dark:border-white/20 first:mt-0 first:border-t-0 first:pt-0",
                3: "text-lg font-bold text-light-text dark:text-white/90 mb-3 mt-8 pt-6 border-t-[1.5px] border-light-border/60 dark:border-white/15 first:mt-0 first:border-t-0 first:pt-0",
                4: "text-base font-semibold text-light-text/90 dark:text-white/80 mb-2 mt-4",
                5: "text-sm font-semibold text-light-text/80 dark:text-white/70 mb-1.5 mt-3 uppercase tracking-wide",
              };

              return (
                <div key={si} className="mb-4">
                  {/* Heading */}
                  <HeadingTag
                    className={
                      headingClasses[section.level] || headingClasses[3]
                    }
                  >
                    {section.heading}
                  </HeadingTag>

                  {/* Content paragraph using ReactMarkdown */}
                  {section.content && (
                    <div
                      className={`leading-relaxed mb-4 ${
                        section.level === 3
                          ? "text-lg sm:text-xl font-bold text-light-text/95 dark:text-white/90"
                          : "text-sm sm:text-base text-light-text/80 dark:text-white/70"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Bullet items (unordered list) */}
                  {listData && listData.type === "bullet" && (
                    <ul
                      className={`${isRtl ? "pr-5" : "pl-5"} space-y-1 mb-3 ${
                        listData.items.length > 0 &&
                        /^(?:\*\*.*?\*\*|#)?\s*[A-Z][.)]/i.test(listData.items[0].trim())
                          ? "list-none"
                          : "list-disc"
                      }`}
                    >
                      {listData.items.map((item, ii) => (
                        <li key={ii} className="text-light-text/80 dark:text-white/70 text-sm sm:text-base leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                            {item}
                          </ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Numbered items (ordered list) */}
                  {listData && listData.type === "numbered" && (
                    <ol
                      className={`${isRtl ? "pr-5" : "pl-5"} space-y-1 mb-3 list-none`}
                    >
                      {listData.items.map((item, ii) => (
                        <li key={ii} className="text-light-text/80 dark:text-white/70 text-sm sm:text-base leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                            {item}
                          </ReactMarkdown>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
