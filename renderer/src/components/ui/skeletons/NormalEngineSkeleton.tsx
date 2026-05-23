import { Icon } from "../Icons";
import { DocumentData } from "../../../store/documentSlice";

export const NormalEngineSkeleton = ({
  activeDocument,
}: {
  activeDocument: DocumentData | null;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full h-full min-h-[600px] animate-enter">
      {/* Cool radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(16,55,102,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_60%)] pointer-events-none z-0"></div>

      <div className="w-full max-w-3xl bg-white dark:bg-[#18181B] rounded-[2rem] border border-light-border dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row z-10">
        {/* Left Side: File Info & Scanner */}
        <div className="w-full md:w-1/3 bg-light-bg/50 dark:bg-[#121214]/50 border-b md:border-b-0 md:border-r border-light-border dark:border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          {/* The Scanning Laser */}
          <div className="absolute inset-x-0 h-0.5 bg-light-primary dark:bg-dark-primary shadow-[0_0_15px_rgba(16,55,102,0.6)] dark:shadow-[0_0_15px_rgba(139,92,246,0.6)] z-20 animate-scan"></div>

          <div className="w-20 h-24 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 rounded-lg flex items-center justify-center mb-6 relative z-10 shadow-sm transition-colors">
            <Icon
              name="description"
              className="text-4xl text-light-text/20 dark:text-white/20"
            />
          </div>

          <h3 className="text-sm font-mono font-bold text-light-text/80 dark:text-dark-text/80 text-center truncate w-full px-2">
            {activeDocument?.title || "Processing_File.tmp"}
          </h3> 
          <p className="text-[10px] font-bold tracking-widest uppercase text-light-text/40 dark:text-dark-text/40 mt-2">
            {activeDocument?.fileType || "Document"} • Analyzing
          </p>
        </div>

        {/* Right Side: Terminal Output */}
        <div className="w-full md:w-2/3 p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-light-primary dark:bg-dark-primary opacity-50 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-light-primary dark:bg-dark-primary"></span>
            </div>
            <h2 className="text-xl font-bold text-light-text dark:text-white">
              Neural Engine Active
            </h2>
          </div>

          <div className="bg-light-bg dark:bg-[#0B0B0D] rounded-xl p-5 border border-light-border dark:border-white/10 font-mono text-xs mb-6 shadow-inner w-full flex flex-col transition-colors duration-300">
            <div className="space-y-2.5 opacity-90 mb-4">
              <p className="text-light-text dark:text-white flex items-center gap-2 font-medium">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-[14px]">
                  ✓
                </span>
                <span>
                  Text extraction complete{" "}
                  <span className="text-light-accent dark:text-dark-primary font-bold">
                    (14ms)
                  </span>
                </span>
              </p>

              <p className="text-light-text dark:text-white flex items-center gap-2 font-medium">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-[14px]">
                  ✓
                </span>
                <span>
                  Metadata parsed:{" "}
                  <span className="text-light-primary dark:text-dark-secondary font-bold">
                    Size={activeDocument?.cognitiveLoad || "Unknown"}
                  </span>
                </span>
              </p>

              <p className="text-light-text dark:text-white font-medium mt-3 flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-primary font-bold text-[14px]">{`>`}</span>
                Detecting semantic clusters...
              </p>

              <div className="pl-6 space-y-2 text-light-text/80 dark:text-white/80">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-light-primary dark:bg-dark-secondary shrink-0"></span>
                  "Context Analysis"
                  <span className="text-light-text/30 dark:text-white/20">
                    |
                  </span>
                  <span className="text-light-text/60 dark:text-white/50">
                    Confidence:
                  </span>
                  <span className="text-light-primary dark:text-dark-secondary font-bold">
                    98%
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-light-accent dark:bg-dark-primary shrink-0"></span>
                  "Entity Extraction"
                  <span className="text-light-text/30 dark:text-white/20">
                    |
                  </span>
                  <span className="text-light-text/60 dark:text-white/50">
                    Confidence:
                  </span>
                  <span className="text-light-accent dark:text-dark-primary font-bold">
                    85%
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold border-t border-light-border dark:border-white/10 pt-3">
              <span className="text-light-primary dark:text-dark-secondary animate-pulse text-[14px]">{`>`}</span>
              <span className="text-light-text dark:text-white typing-effect tracking-tight">
                Calculating Cognitive Load...
              </span>
            </div>
          </div>

          <div className="bg-light-primary/5 dark:bg-dark-primary/10 rounded-xl p-4 border border-light-primary/20 dark:border-dark-primary/20 transition-colors">
            <div className="flex items-start gap-3">
              <Icon
                name="folder_managed"
                className="text-light-primary dark:text-dark-primary mt-0.5"
              />
              <div>
                <h4 className="text-sm font-bold text-light-text dark:text-white tracking-tight">
                  Smart Classification
                </h4>
                <p className="text-xs text-light-text/70 dark:text-white/70 mt-1.5 leading-relaxed font-medium">
                  This document matches your
                  <strong className="text-light-primary dark:text-dark-primary font-bold bg-light-primary/10 dark:bg-dark-primary/20 px-1.5 py-0.5 rounded border border-light-primary/20 dark:border-dark-primary/30 mx-1">
                    /Analyzed/Recent
                  </strong>
                  folder. Automate move?
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4 ml-8">
              <button
                disabled
                className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white dark:text-black text-xs font-bold rounded-lg opacity-50 cursor-not-allowed shadow-sm"
              >
                Confirm Move
              </button>
              <button
                disabled
                className="px-4 py-2 border border-light-border dark:border-white/10 text-xs font-bold text-light-text/60 dark:text-dark-text/50 rounded-lg opacity-50 cursor-not-allowed transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
