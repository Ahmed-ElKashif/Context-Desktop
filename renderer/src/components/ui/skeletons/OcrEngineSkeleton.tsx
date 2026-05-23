import { Icon } from "../Icons";
import { DocumentData } from "../../../store/documentSlice";

export const OcrEngineSkeleton = ({
  activeDocument,
}: {
  activeDocument: DocumentData | null;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full h-full min-h-[600px] animate-enter">
      {/* Cool radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(16,55,102,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_60%)] pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl bg-white dark:bg-[#18181B] rounded-[2rem] border border-light-border dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row z-10">
        {/* Left Side: Image Preview & Scan Laser */}
        <div className="w-full md:w-1/2 bg-light-bg/50 dark:bg-[#121214]/50 border-b md:border-b-0 md:border-r border-light-border dark:border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="relative w-full max-w-sm shadow-md rounded-2xl overflow-hidden border border-light-border dark:border-white/10 bg-white dark:bg-black group-hover:border-light-primary/30 dark:group-hover:border-dark-primary/30 transition-colors">
            {/* Placeholder Image for the OCR engine */}
            <img
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop"
              alt="Scanned Document"
              className="w-full h-auto opacity-90 dark:opacity-80 grayscale contrast-125 mix-blend-multiply dark:mix-blend-normal"
            />

            <div className="absolute inset-x-0 h-1 bg-light-primary dark:bg-dark-primary shadow-[0_0_50px_20px_rgba(16,55,102,0.4)] dark:shadow-[0_0_50px_20px_rgba(139,92,246,0.4)] z-20 animate-scan pointer-events-none"></div>

            <div className="absolute top-1/4 left-1/4 w-1/2 h-12 border border-light-primary/50 dark:border-dark-primary/50 bg-light-primary/10 dark:bg-dark-primary/10 rounded animate-pulse pointer-events-none"></div>
            <div
              className="absolute bottom-1/3 right-1/4 w-1/3 h-8 border border-light-accent/50 dark:border-dark-secondary/50 bg-light-accent/10 dark:bg-dark-secondary/10 rounded animate-pulse pointer-events-none"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          <div className="mt-8 flex items-center gap-3 bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 px-4 py-2 rounded-full shadow-sm">
            <Icon
              name="autorenew"
              className="text-light-primary dark:text-dark-primary text-sm animate-spin"
            />
            <span className="text-sm font-bold text-light-text dark:text-white">
              Running OCR on{" "}
              <span className="text-light-primary dark:text-dark-secondary font-mono bg-light-primary/5 dark:bg-dark-primary/10 px-1.5 py-0.5 rounded truncate max-w-[120px] inline-block align-bottom">
                {activeDocument?.title || "image.png"}
              </span>
            </span>
          </div>
        </div>

        {/* Right Side: OCR Terminal Output */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-4 h-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-light-primary dark:bg-dark-primary opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-light-primary dark:bg-dark-primary shadow-[0_0_10px_currentColor] text-light-primary dark:text-dark-primary"></span>
            </div>
            <h2 className="text-xl font-black text-light-text dark:text-white animate-pulse-fast tracking-tight">
              Extracting Text...
            </h2>
          </div>

          <div className="bg-light-bg dark:bg-[#0B0B0D] rounded-xl p-5 border border-light-border dark:border-white/10 font-mono text-xs mb-6 shadow-inner w-full flex flex-col transition-colors duration-300">
            <div className="space-y-2.5 opacity-90 mb-4">
              <p className="text-light-text dark:text-white flex items-center gap-2 font-medium">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-[14px]">
                  ✓
                </span>
                <span>
                  Image loaded{" "}
                  <span className="text-light-accent dark:text-dark-primary font-bold">
                    (High-Res)
                  </span>
                </span>
              </p>
              <p className="text-light-text dark:text-white flex items-center gap-2 font-medium">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-[14px]">
                  ✓
                </span>
                <span>Deskew and contrast enhancement applied</span>
              </p>
              <p className="text-light-text dark:text-white font-medium mt-3 flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-primary font-bold text-[14px]">{`>`}</span>
                <span>
                  Identifying handwritten glyphs... Confidence:{" "}
                  <span className="text-light-primary dark:text-dark-secondary font-bold">
                    94%
                  </span>
                </span>
              </p>
              <div className="bg-white/60 dark:bg-white/5 border-l-2 border-light-primary dark:border-dark-primary pl-3 py-2 text-light-text dark:text-white/90 italic mt-2 rounded-r-md shadow-sm">
                "Action items for Q4: 1. Finalize Cloud Migration 2. Review SaaS
                vendor contracts."
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold border-t border-light-border dark:border-white/10 pt-3">
              <span className="text-light-primary dark:text-dark-secondary animate-pulse text-[14px]">{`>`}</span>
              <span className="text-light-text dark:text-white typing-effect tracking-tight">
                Structuring extracted data...
              </span>
            </div>
          </div>

          <div className="bg-light-primary/5 dark:bg-dark-primary/10 rounded-xl p-5 border border-light-primary/20 dark:border-dark-primary/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-light-primary dark:bg-dark-primary text-white dark:text-black flex items-center justify-center shrink-0 shadow-md">
                <Icon name="text_snippet" className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-black text-light-text dark:text-white tracking-tight">
                  Extraction Ready
                </h4>
                <p className="text-xs font-medium text-light-text/70 dark:text-white/70 mt-1.5 leading-relaxed">
                  Context successfully converted the image into searchable text.
                  Proceed to analysis?
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-5 ml-14">
              <button
                disabled
                className="px-5 py-2.5 bg-light-primary dark:bg-dark-primary text-white dark:text-black text-xs font-bold rounded-lg opacity-50 cursor-not-allowed shadow-md flex items-center gap-2"
              >
                <Icon name="analytics" className="text-[16px]" /> Analyze Text
              </button>
              <button
                disabled
                className="px-4 py-2 border border-light-border dark:border-white/10 text-xs font-bold text-light-text/60 dark:text-dark-text/50 rounded-lg opacity-50 cursor-not-allowed transition-all"
              >
                Retake Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
