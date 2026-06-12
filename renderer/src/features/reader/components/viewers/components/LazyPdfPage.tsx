import { useState, useEffect, useRef } from "react";
import { Page } from "react-pdf";
import { PageSkeleton, ThumbnailSkeleton } from "./PdfSkeletons";

export const LazyPage = ({
  pageNumber,
  zoomLevel,
}: {
  pageNumber: number;
  zoomLevel: number;
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
