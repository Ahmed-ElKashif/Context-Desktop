import { useState, useEffect, useRef } from "react";
import { DocumentData, reanalyzeDocumentThunk } from "../../../store/documentSlice";
import { useAppDispatch } from "../../../store/hooks";
import { Icon } from "../../../components/ui/Icons";
import { notify } from "../../../components/ui/ToastEngine";

// ── Viewer sub-components ────────────────────────────────────────────────────
import { PdfViewer }        from "./viewers/PdfViewer";
import { WordViewer }       from "./viewers/WordViewer";
import { ExcelViewer }      from "./viewers/ExcelViewer";
import { ImageViewer }      from "./viewers/ImageViewer";
import { TextViewer }       from "./viewers/TextViewer";
import { CsvPrettyViewer }  from "./viewers/CsvPrettyViewer";

interface DocumentViewerProps {
  document: DocumentData;
  fileUrl: string | null;
}

export const DocumentViewer = ({ document, fileUrl }: DocumentViewerProps) => {
  // ── File type detection ───────────────────────────────────────────────────
  const isImage =
    document.fileType === "Image" ||
    !!document.title.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isWord = document.fileType === "Word";
  const isExcel = document.fileType === "Excel";
  const isTextSnippet = document.fileType === "TextSnippet";
  const isOldDoc =
    isWord &&
    !!document.title.match(/\.doc$/i) &&
    !document.title.match(/\.docx$/i);
  const isDocx = isWord && !isOldDoc;
  const isPdf =
    document.fileType === "PDF" ||
    (!isImage && !isWord && !isTextSnippet && !isExcel);

  const dispatch = useAppDispatch();

  // ── Re-analyze ────────────────────────────────────────────────────────────
  const handleRegenerate = async () => {
    try {
      notify("Re-analyzing document...", "info");
      await dispatch(reanalyzeDocumentThunk(document._id)).unwrap();
      notify("Document analysis triggered successfully.", "success");
    } catch (error: unknown) {
      notify(
        error instanceof Error ? error.message : "Failed to trigger analysis.",
        "error",
      );
    }
  };

  // ── View mode (extracted text vs original) ────────────────────────────────
  // Images and Excel both have a toggle; all others start in "original"
  const [viewMode, setViewMode] = useState<"extracted" | "original">(
    isTextSnippet ? "extracted" : "original",
  );

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const handleZoomIn = () => setZoomLevel((p) => Math.min(p + 0.1, 2.0));
  const handleZoomOut = () => setZoomLevel((p) => Math.max(p - 0.1, 0.25));

  const viewerRef = useRef<HTMLDivElement>(null);

  // Ctrl+scroll to zoom
  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoomLevel((p) =>
          e.deltaY < 0 ? Math.min(p + 0.1, 2.0) : Math.max(p - 0.1, 0.25),
        );
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="w-full h-full flex flex-row overflow-hidden bg-light-bg dark:bg-[#0A0A0C]">
      {/* Left: Main viewer area */}
      <div className="flex-1 h-full flex flex-col min-w-0 p-4 md:p-6 overflow-hidden relative">

        {/* View toggle pill — images have Extracted Text / Original Image
                            — excel has Raw Data (CSV) / Interactive Grid      */}
        {(isImage || isExcel) && (
          <div className="w-full mx-auto flex justify-center mb-4 shrink-0 z-20">
            <div className="flex bg-white/80 dark:bg-[#18181B]/80 p-1.5 rounded-full border border-light-border dark:border-white/10 shadow-sm backdrop-blur-md">
              <button
                onClick={() => setViewMode("extracted")}
                className={`px-5 py-2 rounded-full shadow-sm text-xs font-bold flex items-center gap-2 transition-all ${
                  viewMode === "extracted"
                    ? "bg-light-primary dark:bg-dark-primary text-white dark:text-black"
                    : "hover:bg-light-border dark:hover:bg-white/5 text-light-text/70 dark:text-dark-text/70"
                }`}
              >
                <Icon name="subject" className="text-[16px]" />
                {isExcel ? "Raw Data (CSV)" : "Extracted Text"}
              </button>
              <button
                onClick={() => setViewMode("original")}
                className={`px-5 py-2 rounded-full shadow-sm text-xs font-bold flex items-center gap-2 transition-all ${
                  viewMode === "original"
                    ? "bg-light-primary dark:bg-dark-primary text-white dark:text-black"
                    : "hover:bg-light-border dark:hover:bg-white/5 text-light-text/70 dark:text-dark-text/70"
                }`}
              >
                <Icon
                  name={isExcel ? "table_view" : "image"}
                  className="text-[16px]"
                />
                {isExcel ? "Interactive Grid" : "Original Image"}
              </button>
            </div>
          </div>
        )}

        {/* Document header */}
        <div className="mb-4 shrink-0 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight font-sans text-light-text dark:text-white/90">
              {document.title.replace(/\.[^/.]+$/, "")}
            </h2>
            <p className="text-xs font-mono font-semibold text-light-text/60 dark:text-white/50 flex items-center gap-2">
              Source: {document.title}
              <span className="text-light-border dark:text-white/20">|</span> AI Status:
              <span
                className={
                  document.aiStatus === "Analyzed"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : document.aiStatus === "Failed"
                      ? "text-red-500"
                      : "text-amber-500"
                }
              >
                {document.aiStatus}
              </span>
              {document.aiStatus === "Failed" && (
                <button
                  onClick={handleRegenerate}
                  className="ml-1 p-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors flex items-center justify-center"
                  title="Regenerate Analysis"
                >
                  <Icon name="refresh" className="text-[14px]" />
                </button>
              )}
            </p>
          </div>

          {/* Zoom controls — hidden for PDF (has its own) and Excel (no zoom needed) */}
          {!isPdf && !isExcel && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 rounded-lg p-1 shadow-sm shrink-0 z-20">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-light-bg dark:hover:bg-white/5 rounded text-light-text dark:text-white transition-colors"
                title="Zoom Out"
              >
                <Icon name="remove" className="text-[18px]" />
              </button>
              <span className="text-xs font-mono font-bold w-12 text-center text-light-text dark:text-white">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-light-bg dark:hover:bg-white/5 rounded text-light-text dark:text-white transition-colors"
                title="Zoom In"
              >
                <Icon name="add" className="text-[18px]" />
              </button>
            </div>
          )}
        </div>

        {/* Document canvas */}
        <div
          ref={viewerRef}
          className="flex-1 w-full min-h-0 bg-white dark:bg-[#121214] rounded-xl shadow-sm border border-light-border dark:border-white/10 overflow-hidden flex flex-col"
        >
          {/* ── Extracted / raw text view ── */}
          {viewMode === "extracted" ? (
            isExcel ? (
              // Excel: show a beautiful parsed CSV table instead of raw text
              <CsvPrettyViewer extractedText={document.extractedText} />
            ) : (
              <TextViewer
                extractedText={document.extractedText}
                zoomLevel={zoomLevel}
                isExcel={false}
              />
            )

          /* ── Excel interactive grid ── */
          ) : isExcel ? (
            <div className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden">
              <ExcelViewer extractedText={document.extractedText || ""} />
            </div>

          /* ── Word (.docx or legacy .doc) ── */
          ) : (isDocx || isOldDoc) ? (
            <div className="flex-1 min-h-0 w-full h-full flex flex-col overflow-auto">
              <WordViewer
                fileUrl={fileUrl}
                documentTitle={document.title}
                zoomLevel={zoomLevel}
                isOldDoc={isOldDoc}
              />
            </div>

          /* ── Image (original) ── */
          ) : isImage && fileUrl ? (
            <ImageViewer
              fileUrl={fileUrl}
              documentTitle={document.title}
              zoomLevel={zoomLevel}
            />

          /* ── PDF ── */
          ) : fileUrl ? (
            <PdfViewer fileUrl={fileUrl} zoomLevel={zoomLevel} />

          ) : (
            <div className="flex h-full items-center justify-center text-light-text/50 dark:text-white/40">
              Original file could not be loaded.
            </div>
          )}
        </div>
      </div>

      {/* Right: PDF thumbnail sidebar is self-contained inside PdfViewer */}
    </section>
  );
};
