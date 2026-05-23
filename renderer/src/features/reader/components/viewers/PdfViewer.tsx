import { useState, useEffect, useRef } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Icon } from "../../../../components/ui/Icons";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  fileUrl: string;
  zoomLevel: number;
}

// ── Lazy Loading Components ──────────────────────────────────────────────────

const PageSkeleton = () => (
  <div className="w-[600px] h-[800px] bg-white dark:bg-[#121214] flex flex-col items-center justify-center gap-4 rounded-lg border border-light-border dark:border-white/10 shadow-sm animate-pulse">
    <Icon name="description" className="text-[48px] text-light-text/20 dark:text-white/10" />
    <div className="flex flex-col items-center gap-2">
      <div className="h-3 w-32 bg-light-border dark:bg-white/5 rounded-full"></div>
      <div className="h-2 w-48 bg-light-border dark:bg-white/5 rounded-full"></div>
      <div className="h-2 w-40 bg-light-border dark:bg-white/5 rounded-full"></div>
    </div>
  </div>
);

const ThumbnailSkeleton = () => (
  <div className="w-[160px] h-[220px] bg-white dark:bg-[#121214] flex flex-col items-center justify-center gap-3 rounded border border-light-border dark:border-white/10 animate-pulse">
    <Icon name="draft" className="text-[24px] text-light-text/20 dark:text-white/10" />
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-1.5 w-16 bg-light-border dark:bg-white/5 rounded-full"></div>
      <div className="h-1 w-20 bg-light-border dark:bg-white/5 rounded-full"></div>
    </div>
  </div>
);

const LazyPage = ({ pageNumber, zoomLevel }: { pageNumber: number; zoomLevel: number }) => {
  const [isRendered, setIsRendered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsRendered(true);
      },
      { rootMargin: "1500px 0px" } // Render when within 1500px of viewport
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[800px] flex justify-center items-center">
      {isRendered ? (
        <Page
          pageNumber={pageNumber}
          scale={zoomLevel}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          loading={<PageSkeleton />}
        />
      ) : (
        <PageSkeleton />
      )}
    </div>
  );
};

const LazyThumbnail = ({ pageNumber }: { pageNumber: number }) => {
  const [isRendered, setIsRendered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsRendered(true);
      },
      { rootMargin: "800px 0px" } // Render when within 800px of viewport
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[220px] w-[160px] flex justify-center items-center">
      {isRendered ? (
        <Page
          pageNumber={pageNumber}
          width={160}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={<ThumbnailSkeleton />}
        />
      ) : (
        <ThumbnailSkeleton />
      )}
    </div>
  );
};

/**
 * Renders a PDF document using react-pdf.
 * Includes:
 *  - Scrollable main canvas with per-page containers for scroll tracking
 *  - Sticky right-side thumbnail panel for quick page navigation
 */
export const PdfViewer = ({ fileUrl, zoomLevel }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const pdfScrollRef = useRef<HTMLDivElement>(null);

  // ── Active page detection on scroll ──────────────────────────────────────
  useEffect(() => {
    if (numPages === 0) return;
    const container = pdfScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      let closestPage = 1;
      let closestDist = Infinity;

      for (let i = 1; i <= numPages; i++) {
        const el = window.document.getElementById(`pdf-page-${i}`);
        if (!el) continue;
        const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
        if (dist < closestDist) {
          closestDist = dist;
          closestPage = i;
        }
      }
      setActivePage(closestPage);
    };

    handleScroll(); // Set correct page on mount
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [numPages]);

  // ── Thumbnail click → smooth scroll to page ──────────────────────────────
  const scrollToPage = (pageNum: number) => {
    setActivePage(pageNum);
    const container = pdfScrollRef.current;
    const el = window.document.getElementById(`pdf-page-${pageNum}`);
    if (container && el) {
      const containerTop = container.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      container.scrollBy({ top: elTop - containerTop, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-row w-full h-full overflow-hidden">
      {/* ── Main PDF Canvas ── */}
      <div
        ref={pdfScrollRef}
        className="flex-1 min-h-0 w-full h-full overflow-auto flex flex-col items-center gap-6 bg-light-bg dark:bg-[#0A0A0C] p-4 md:p-8"
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Icon
                name="sync"
                className="animate-spin text-4xl text-light-primary/50 dark:text-dark-primary/50"
              />
              <p className="text-light-text/60 dark:text-white/50 font-medium">
                Loading PDF Engine...
              </p>
            </div>
          }
          className="flex flex-col items-center gap-6"
        >
          {Array.from(new Array(numPages), (_, index) => (
            <div
              key={`page_${index + 1}`}
              id={`pdf-page-${index + 1}`}
              className="shadow-lg rounded overflow-hidden bg-white shrink-0 pdf-page-container transition-all"
            >
              <LazyPage pageNumber={index + 1} zoomLevel={zoomLevel} />
            </div>
          ))}
        </Document>
      </div>

      {/* ── Thumbnail Sidebar ── */}
      {numPages > 0 && (
        <aside className="w-64 shrink-0 h-full bg-white dark:bg-[#121214] border-l border-light-border dark:border-white/5 overflow-y-auto flex flex-col hide-scrollbar shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="text-xs font-bold text-light-text/40 dark:text-white/30 uppercase tracking-widest p-4 pb-2 mb-4 sticky top-0 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-sm z-20">
            Pages ({numPages})
          </div>
          <Document
            file={fileUrl}
            className="flex flex-col items-center gap-6 px-4 pb-6"
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`thumb_${index + 1}`}
                onClick={() => scrollToPage(index + 1)}
                className="relative flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`overflow-hidden rounded border transition-all duration-200 bg-white ${
                    activePage === index + 1
                      ? "border-light-primary dark:border-dark-primary ring-2 ring-light-primary/20 dark:ring-dark-primary/20 shadow-md"
                      : "border-light-border dark:border-white/10 opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:shadow-md"
                  }`}
                >
                  <LazyThumbnail pageNumber={index + 1} />
                </div>
                <span
                  className={`text-xs font-bold font-mono ${
                    activePage === index + 1
                      ? "text-light-primary dark:text-dark-primary"
                      : "text-light-text/60 dark:text-white/50"
                  }`}
                >
                  {index + 1}
                </span>
              </div>
            ))}
          </Document>
        </aside>
      )}
    </div>
  );
};
