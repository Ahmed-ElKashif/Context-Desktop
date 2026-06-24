import { useState } from "react";
import { DocumentData } from "../../../store/library/librarySlice";
import { useZoom } from "../hooks/useZoom";
import { ZoomPill } from "./ZoomPill";

// ── Viewer sub-components ────────────────────────────────────────────────────
import { PdfViewer }        from "./viewers/PdfViewer";
import { WordViewer }       from "./viewers/WordViewer";
import { ExcelViewer }      from "./viewers/ExcelViewer";
import { ImageViewer }      from "./viewers/ImageViewer";
import { TextViewer }       from "./viewers/TextViewer";
import { CsvPrettyViewer }  from "./viewers/CsvPrettyViewer";
import { PrettifyViewer }   from "./viewers/PrettifyViewer";
import { ControlStrip }     from "./ControlStrip";

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




  // ── View mode (extracted text vs original vs prettify) ─────────────────────
  // Images and Excel have extracted/original toggle; Word/Excel/TextSnippet also get "prettify"
  const isSupportedForPrettify = isExcel || isWord || isTextSnippet;
  const [viewMode, setViewMode] = useState<"extracted" | "original" | "prettify">("original");

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const { zoomLevel, showPill, containerRef } = useZoom(1.0, 0.25, 3.0, 0.1);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="w-full h-full flex flex-row overflow-hidden bg-light-bg dark:bg-[#0A0A0C]">
      {/* Left: Main viewer area */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
        <ControlStrip
          viewMode={viewMode}
          setViewMode={setViewMode}
          isImage={isImage}
          isExcel={isExcel}
          isWord={isWord}
          isTextSnippet={isTextSnippet}
          isSupportedForPrettify={isSupportedForPrettify}
        />

        {/* Document canvas */}
        <div
          ref={containerRef}
          className="flex-1 w-full min-h-0 bg-white dark:bg-[#121214] shadow-sm overflow-hidden flex flex-col relative"
        >
          {/* Global transient zoom indicator */}
          {(!isExcel && viewMode !== "prettify") && (
            <ZoomPill zoomLevel={zoomLevel} showPill={showPill} />
          )}
          {/* ── Prettify view ── */}
          {viewMode === "prettify" && isSupportedForPrettify ? (
            <PrettifyViewer document={document} />

          /* ── Extracted / raw text view ── */
          ) : viewMode === "extracted" ? (
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

          /* ── TextSnippet (original = extracted, no file to load) ── */
          ) : isTextSnippet ? (
            <TextViewer
              extractedText={document.extractedText}
              zoomLevel={zoomLevel}
              isExcel={false}
            />

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
