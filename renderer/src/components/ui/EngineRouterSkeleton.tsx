import { NormalEngineSkeleton } from "./skeletons/NormalEngineSkeleton";
import { OcrEngineSkeleton } from "./skeletons/OcrEngineSkeleton";
import { SnippetEngineSkeleton } from "./skeletons/SnippetEngineSkeleton";
import { BatchEngineSkeleton } from "./skeletons/BatchEngineSkeleton";
import { Icon } from "./Icons"; // Adjust path to your Icons component

interface EngineRouterSkeletonProps {
  isBatch?: boolean;
  fileCount?: number;
  fileType?: string; // e.g., "Image", "TextSnippet", "Document"
  title?: string;
  onAbort?: () => void; // Optional escape hatch
}

export const EngineRouterSkeleton = ({
  isBatch,
  fileCount = 0,
  fileType = "Document",
  title = "Processing...",
  onAbort,
}: EngineRouterSkeletonProps) => {
  // Mock an activeDocument object to pass down to your existing skeletons
  // so you don't have to rewrite them!
  const mockDoc = { title, fileType, cognitiveLoad: "Calculating" } as any;

  return (
    <div className="w-full h-full relative flex flex-col animate-enter bg-transparent z-50">
      {/* THE 4-WAY ENGINE ROUTER */}
      {isBatch || fileCount > 1 ? (
        <BatchEngineSkeleton fileCount={fileCount} />
      ) : fileType === "Image" ? (
        <OcrEngineSkeleton activeDocument={mockDoc} />
      ) : fileType === "TextSnippet" ? (
        <SnippetEngineSkeleton activeDocument={mockDoc} />
      ) : (
        <NormalEngineSkeleton activeDocument={mockDoc} />
      )}

      {/* THE ESCAPE HATCH */}
      {onAbort && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={onAbort}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 px-6 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
          >
            <Icon name="cancel" className="text-[16px]" />
            Abort Engine Process
          </button>
        </div>
      )}
    </div>
  );
};
