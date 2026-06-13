import { Icon } from "../core/Icons";

export const BatchEngineSkeleton = ({
  fileCount = 0,
}: {
  fileCount?: number;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full h-full min-h-[600px] animate-enter">
      {/* Cool radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(16,55,102,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_60%)] pointer-events-none z-0"></div>

      <div className="w-full max-w-3xl bg-white dark:bg-[#18181B] rounded-[2rem] border border-light-border dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row z-10">
        {/* Left Side: Directory Info & Scanner */}
        <div className="w-full md:w-1/3 bg-light-bg/50 dark:bg-[#121214]/50 border-b md:border-b-0 md:border-r border-light-border dark:border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          {/* The Scanning Laser - slightly faster for batch! */}
          <div
            className="absolute inset-x-0 h-0.5 bg-light-accent dark:bg-dark-secondary shadow-[0_0_15px_rgba(16,55,102,0.6)] dark:shadow-[0_0_15px_rgba(139,92,246,0.6)] z-20 animate-scan"
            style={{ animationDuration: "1.5s" }}
          ></div>

          <div className="w-24 h-20 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 rounded-lg flex items-center justify-center mb-6 relative z-10 shadow-sm transition-colors">
            <Icon
              name="folder_zip"
              className="text-5xl text-light-accent/40 dark:text-dark-secondary/40"
            />
          </div>

          <h3 className="text-sm font-mono font-bold text-light-text/80 dark:text-dark-text/80 text-center truncate w-full px-2">
            Directory_Sync.sys
          </h3>
          <p className="text-[10px] font-bold tracking-widest uppercase text-light-text/40 dark:text-dark-text/40 mt-2">
            Batch Job •{" "}
            {fileCount > 0 ? `${fileCount} Items` : "Multiple Items"}
          </p>
        </div>

        {/* Right Side: Terminal Output */}
        <div className="w-full md:w-2/3 p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-light-accent dark:bg-dark-secondary opacity-50 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-light-accent dark:bg-dark-secondary"></span>
            </div>
            <h2 className="text-xl font-bold text-light-text dark:text-white">
              Parallel Processing Active
            </h2>
          </div>

          <div className="bg-light-bg dark:bg-[#0B0B0D] rounded-xl p-5 border border-light-border dark:border-white/10 font-mono text-xs mb-6 shadow-inner w-full flex flex-col transition-colors duration-300">
            <div className="space-y-2.5 opacity-90 mb-4">
              <p className="text-light-text dark:text-white flex items-center gap-2 font-medium">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-[14px]">
                  ✓
                </span>
                <span>
                  Allocating memory threads...{" "}
                  <span className="text-light-accent dark:text-dark-secondary font-bold">
                    (OK)
                  </span>
                </span>
              </p>

              <p className="text-light-text dark:text-white flex items-center gap-2 font-medium">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-[14px]">
                  ✓
                </span>
                <span>
                  Queueing {fileCount > 0 ? fileCount : "discovered"} documents
                  for semantic extraction
                </span>
              </p>

              <p className="text-light-text dark:text-white font-medium mt-3 flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-primary font-bold text-[14px]">{`>`}</span>
                Running context mapping across directory...
              </p>

              <div className="pl-6 space-y-2 text-light-text/80 dark:text-white/80">
                {/* Simulated Batch Progress Bars */}
                <div className="w-full">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>File_01.pdf</span>
                    <span className="text-emerald-500">100%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full"></div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>Data_Img.png</span>
                    <span className="text-light-primary dark:text-dark-primary animate-pulse">
                      Running OCR...
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-light-primary dark:bg-dark-primary w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold border-t border-light-border dark:border-white/10 pt-3">
              <span className="text-light-primary dark:text-dark-secondary animate-pulse text-[14px]">{`>`}</span>
              <span className="text-light-text dark:text-white typing-effect tracking-tight">
                Awaiting batch completion...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
