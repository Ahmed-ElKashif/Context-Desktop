import { useState, useEffect, useRef } from "react";
import mammoth from "mammoth";
import DOMPurify from "dompurify";
import { Icon } from "../../../../components/ui/core/Icons";
import { handleDownload } from "../../shared/downloadUtils";

interface WordViewerProps {
  fileUrl: string | null;
  documentTitle: string;
  zoomLevel: number;
  isOldDoc: boolean;
  highlightQuery?: string;
}

/**
 * Renders a Word document (.docx) using mammoth for HTML conversion,
 * or shows a friendly fallback for legacy .doc files.
 */
export const WordViewer = ({
  fileUrl,
  documentTitle,
  zoomLevel,
  isOldDoc,
  highlightQuery,
}: WordViewerProps) => {
  // ── Legacy .doc fallback ──────────────────────────────────────────
  if (isOldDoc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center h-full">
        <Icon
          name="description"
          className="text-[64px] text-light-text/20 dark:text-white/10 mb-4"
        />
        <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
          Legacy Document Format
        </h3>
        <p className="text-light-text/60 dark:text-white/50 mb-6 max-w-sm">
          Browsers do not support rendering legacy .doc files directly. Please
          use the Extracted View or download the original file.
        </p>
        <button
          onClick={() => handleDownload(fileUrl, documentTitle)}
          className="px-6 py-3 bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-lg font-bold shadow-sm flex items-center gap-2 transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Icon name="download" className="text-[18px]" /> Download Original
        </button>
      </div>
    );
  }

  // ── .docx mammoth renderer ────────────────────────────────────────
  return <DocxPreview fileUrl={fileUrl} zoomLevel={zoomLevel} highlightQuery={highlightQuery} />;
};

// ─── Internal component ───────────────────────────────────────────────────────

interface DocxPreviewProps {
  fileUrl: string | null;
  zoomLevel: number;
  highlightQuery?: string;
}

const DocxPreview = ({ fileUrl, zoomLevel, highlightQuery }: DocxPreviewProps) => {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadWord = async () => {
      if (!fileUrl) return;
      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const cleanHtml = DOMPurify.sanitize(result.value);
        
        let finalHtml = cleanHtml;
        if (highlightQuery) {
          const query = highlightQuery.trim().toLowerCase();
          if (query) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(cleanHtml, 'text/html');
            const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
            let firstMark: HTMLElement | null = null;

            const nodesToReplace: Text[] = [];
            let node;
            while ((node = walker.nextNode())) {
              const textNode = node as Text;
              if (textNode.nodeValue?.toLowerCase().includes(query)) {
                nodesToReplace.push(textNode);
              }
            }

            for (const textNode of nodesToReplace) {
              const textContent = textNode.nodeValue || '';
              const regex = new RegExp(`(${query})`, 'gi');
              const parts = textContent.split(regex);

              if (parts.length <= 1) continue;

              const fragment = doc.createDocumentFragment();

              parts.forEach((part) => {
                if (part.toLowerCase() === query) {
                  const mark = doc.createElement('mark');
                  mark.id = !firstMark ? "word-highlight" : "";
                  mark.className = "search-highlight";
                  mark.textContent = part;
                  
                  fragment.appendChild(mark);
                  
                  if (!firstMark) firstMark = mark;
                } else if (part) {
                  fragment.appendChild(doc.createTextNode(part));
                }
              });

              const parent = textNode.parentNode;
              if (parent) {
                parent.replaceChild(fragment, textNode);
              }
            }
            finalHtml = doc.body.innerHTML;
          }
        }
        
        setHtml(finalHtml);
      } catch (err) {
        console.error("Failed to parse Word doc:", err);
        setHtml(
          "<p class='text-red-500 font-bold'>Failed to render document preview. The file might be corrupted or unsupported.</p>",
        );
      } finally {
        setLoading(false);
      }
    };
    loadWord();
  }, [fileUrl, highlightQuery]);

  // ── Auto-scroll to highlight ──────────────────────────────────────────────
  useEffect(() => {
    if (!loading && html) {
      const el = document.getElementById("word-highlight");
      if (el && containerRef.current) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [loading, html]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 w-full text-center">
        <Icon
          name="sync"
          className="text-[40px] text-light-primary/50 dark:text-dark-primary/50 animate-spin mb-4"
        />
        <p className="text-light-text/60 dark:text-white/50 font-medium">
          Rendering Word Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-full w-full overflow-auto bg-white dark:bg-[#18181B] rounded-xl shadow-sm border border-light-border dark:border-white/10">
      <div
        ref={containerRef}
        style={{ fontSize: `${Math.round(zoomLevel * 100)}%` }}
        className="w-full min-h-full p-4 md:p-10 text-light-text dark:text-white/90 leading-relaxed text-justify break-words transition-all duration-200
                   [&>*]:[content-visibility:auto] [&>*]:[contain-intrinsic-size:auto_100px]
                   [&>p]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:text-light-primary dark:[&>h1]:text-white
                   [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:text-light-primary dark:[&>h2]:text-white/90
                   [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3
                   [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul>li]:mb-1
                   [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol>li]:mb-1
                   [&>table]:w-full [&>table]:border-collapse [&>table]:mb-6
                   [&>table_td]:border [&>table_td]:border-light-border dark:[&>table_td]:border-white/10 [&>table_td]:p-3
                   [&>table_th]:border [&>table_th]:border-light-border dark:[&>table_th]:border-white/10 [&>table_th]:p-3 [&>table_th]:bg-light-bg dark:[&>table_th]:bg-white/5 [&>table_th]:font-bold"
        dangerouslySetInnerHTML={{
          __html: html || "<p>No content could be extracted.</p>",
        }}
      />
    </div>
  );
};
