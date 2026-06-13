import { DocumentData } from "../../../store/library/librarySlice";
import { Icon } from "../core/Icons"; // Make sure your path to Icons is correct!

export const SnippetEngineSkeleton = ({
  activeDocument,
}: {
  activeDocument: DocumentData | null;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto mt-12 animate-enter">
      {/* Terminal Header */}
      <div className="flex items-center gap-3 mb-6 bg-light-bg/50 dark:bg-black/20 px-6 py-2 rounded-full border border-light-border dark:border-white/5">
        <Icon
          name="terminal"
          className="text-light-primary dark:text-dark-primary animate-pulse"
        />
        <span className="font-mono text-sm font-bold tracking-widest uppercase text-light-text/70 dark:text-white/70 truncate max-w-[250px]">
          {/* 🛠️ THE FIX: We are now using the activeDocument! */}
          Processing: {activeDocument?.title || "Raw_Text_Snippet"}
        </span>
      </div>

      {/* Code / Text Scanning Window */}
      <div className="w-full bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-2xl shadow-xl overflow-hidden relative">
        {/* The Scanning Laser Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-light-primary dark:bg-dark-primary shadow-[0_0_15px_rgba(139,92,246,0.8)] animate-[scan_2s_ease-in-out_infinite] z-10"></div>

        <div className="p-8 flex flex-col gap-4 opacity-50">
          {/* Simulated Text Lines */}
          <div className="h-4 w-3/4 bg-light-border dark:bg-white/10 rounded animate-pulse delay-75"></div>
          <div className="h-4 w-full bg-light-border dark:bg-white/10 rounded animate-pulse delay-100"></div>
          <div className="h-4 w-5/6 bg-light-border dark:bg-white/10 rounded animate-pulse delay-150"></div>
          <div className="h-4 w-2/3 bg-light-border dark:bg-white/10 rounded animate-pulse delay-200"></div>
          <div className="h-4 w-4/5 bg-light-border dark:bg-white/10 rounded animate-pulse delay-300"></div>
        </div>
      </div>

      {/* Status Output */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs font-mono font-bold text-light-primary dark:text-dark-primary animate-bounce">
          Extracting Entities...
        </p>
      </div>

      {/* Add the scan animation to your global CSS if you haven't! */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
