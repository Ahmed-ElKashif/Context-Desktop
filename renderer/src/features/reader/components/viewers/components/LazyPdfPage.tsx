import { useState, useEffect, useRef } from "react";
import { Page } from "react-pdf";
import { PageSkeleton, ThumbnailSkeleton } from "./PdfSkeletons";

export const LazyPage = ({
  pageNumber,
  zoomLevel,
  highlightQuery,
}: {
  pageNumber: number;
  zoomLevel: number;
  highlightQuery?: string;
}) => {
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
          customTextRenderer={({ str }) => {
            if (!highlightQuery) return str;

            const query = highlightQuery.trim();
            if (!query) return str;

            // Remove non-alphanumeric chars (excluding spaces) to extract just the words
            // \p{L} = any language letter, \p{N} = any number
            const cleanQuery = query.replace(/[^\p{L}\p{N}\s]/gu, '');
            let queryWords = cleanQuery.split(/\s+/).filter(w => w.length >= 3).slice(0, 6);
            if (queryWords.length === 0) {
              queryWords = [cleanQuery]; 
            }

            // Kerning spaces fallback
            const cleanStr = str.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

            for (const word of queryWords) {
              if (word.length < 3) continue;
              
              const regex = new RegExp(`(${word})`, 'gi');
              if (regex.test(str)) {
                // String Injection for react-pdf
                const parts = str.split(regex);
                return parts.map(part => 
                  part.toLowerCase() === word.toLowerCase() 
                    ? `<mark class="search-highlight">${part}</mark>`
                    : part
                ).join("");
              } else if (cleanStr.includes(word.toLowerCase())) {
                return `<mark class="search-highlight">${str}</mark>`;
              }
            }

            return str;
          }}
        />
      ) : (
        <PageSkeleton />
      )}
    </div>
  );
};

export const LazyThumbnail = ({ pageNumber }: { pageNumber: number }) => {
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
    <div
      ref={ref}
      className="min-h-[220px] w-[160px] flex justify-center items-center"
    >
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
