import { Icon } from "../../../components/ui/Icons";

// Extracting the complex SVG mesh into a local component to clean up the render block
const ConnectionMesh = () => (
  <>
    {/* Desktop Mesh */}
    <svg
      className="absolute inset-0 w-full h-full -z-10 hidden md:block opacity-60 dark:opacity-40"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        d="M 15 15 L 50 50"
        className="stroke-animate text-light-primary dark:text-dark-primary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 15 50 L 50 50"
        className="stroke-animate text-light-primary dark:text-dark-primary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 15 85 L 50 50"
        className="stroke-animate text-light-primary dark:text-dark-primary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 50 50 L 85 15"
        className="stroke-animate text-light-accent dark:text-dark-secondary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 50 50 L 85 50"
        className="stroke-animate text-light-accent dark:text-dark-secondary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 50 50 L 85 85"
        className="stroke-animate text-light-accent dark:text-dark-secondary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    </svg>

    {/* Mobile Mesh */}
    <svg
      className="absolute inset-0 w-full h-full -z-10 md:hidden opacity-60 dark:opacity-40"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        d="M 16 10 L 50 50"
        className="stroke-animate text-light-primary dark:text-dark-primary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 50 10 L 50 50"
        className="stroke-animate text-light-primary dark:text-dark-primary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 84 10 L 50 50"
        className="stroke-animate text-light-primary dark:text-dark-primary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 50 50 L 16 90"
        className="stroke-animate text-light-accent dark:text-dark-secondary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 50 50 L 50 90"
        className="stroke-animate text-light-accent dark:text-dark-secondary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d="M 50 50 L 84 90"
        className="stroke-animate text-light-accent dark:text-dark-secondary"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    </svg>
  </>
);

export const CapabilitiesSection = () => {
  return (
    <section
      id="capabilities"
      className="w-full min-h-screen py-24 px-6 relative border-t border-light-border dark:border-white/5 flex flex-col justify-center"
    >
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center h-full">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-light-text dark:text-white mb-4 tracking-tight">
            One Engine. Infinite Context.
          </h2>
          <p className="text-light-text/80 dark:text-white/70 max-w-xl mx-auto text-lg font-medium">
            Drop any data type into the system. Our multimodal AI instantly
            translates chaos into structured intelligence.
          </p>
        </div>

        {/* Neural Hub Diagram */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4 z-10">
          <ConnectionMesh />

          {/* Left Column (Input Formats) */}
          <div className="grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-4 w-full md:w-56 justify-items-center md:justify-center relative">
            <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-3 animate-float-slow group hover:border-red-500/50 transition-colors w-full text-center md:text-left">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon
                  name="picture_as_pdf"
                  className="text-[18px] md:text-[24px]"
                />
              </div>
              <div>
                <p className="text-[10px] md:text-sm font-bold text-light-text dark:text-white leading-tight">
                  Heavy PDFs
                </p>
                <p className="text-[8px] md:text-[10px] text-light-text/80 dark:text-white/60 font-medium hidden sm:block">
                  Layout parsing
                </p>
              </div>
            </div>

            <div
              className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-3 animate-float-medium group hover:border-emerald-500/50 transition-colors w-full text-center md:text-left"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon name="image" className="text-[18px] md:text-[24px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-sm font-bold text-light-text dark:text-white leading-tight">
                  Images
                </p>
                <p className="text-[8px] md:text-[10px] text-light-text/80 dark:text-white/60 font-medium hidden sm:block">
                  Visual OCR
                </p>
              </div>
            </div>

            <div
              className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-3 animate-float-slow group hover:border-gray-500/50 transition-colors w-full text-center md:text-left"
              style={{ animationDelay: "1s" }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-500/10 text-gray-700 dark:text-gray-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon
                  name="text_snippet"
                  className="text-[18px] md:text-[24px]"
                />
              </div>
              <div>
                <p className="text-[10px] md:text-sm font-bold text-light-text dark:text-white leading-tight">
                  Raw Text
                </p>
                <p className="text-[8px] md:text-[10px] text-light-text/80 dark:text-white/60 font-medium hidden sm:block">
                  Instant parse
                </p>
              </div>
            </div>
          </div>

          {/* Central Hub */}
          <div className="relative w-28 h-28 md:w-48 md:h-48 flex items-center justify-center shrink-0 group my-4 md:my-0">
            <div className="absolute inset-0 bg-light-primary/20 dark:bg-dark-primary/20 rounded-full blur-[20px] md:blur-[30px] animate-pulse-fast"></div>
            <div
              className="absolute inset-4 bg-light-accent/20 dark:bg-dark-secondary/20 rounded-full blur-[15px] md:blur-[20px] animate-pulse-fast"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="group relative w-20 h-20 md:w-32 md:h-32 bg-white dark:bg-[#1E1E22] border-2 border-light-primary/30 dark:border-dark-primary/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,55,102,0.2)] dark:shadow-[0_0_40px_rgba(139,92,246,0.2)] z-10 overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20 animate-[pan_20s_linear_infinite]"></div>
              <Icon
                name="neurology"
                className="text-light-primary dark:text-dark-primary !text-[30px] md:!text-[48px] group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="absolute w-full h-full animate-[spin_8s_linear_infinite] pointer-events-none">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-light-primary dark:bg-dark-primary rounded-full shadow-[0_0_10px_#8B5CF6]"></div>
            </div>
          </div>

          {/* Right Column (Output Capabilities) */}
          <div className="grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-4 w-full md:w-56 justify-items-center md:justify-center relative">
            <div
              className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-3 animate-float-medium group hover:border-purple-500/50 transition-colors w-full text-center md:text-left"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon name="sell" className="text-[18px] md:text-[24px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-sm font-bold text-light-text dark:text-white leading-tight">
                  Smart Tags
                </p>
                <p className="text-[8px] md:text-[10px] text-light-text/80 dark:text-white/60 font-medium hidden sm:block">
                  Auto-categorized
                </p>
              </div>
            </div>

            <div
              className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-3 animate-float-slow group hover:border-blue-500/50 transition-colors w-full text-center md:text-left"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon name="summarize" className="text-[18px] md:text-[24px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-sm font-bold text-light-text dark:text-white leading-tight">
                  Summaries
                </p>
                <p className="text-[8px] md:text-[10px] text-light-text/80 dark:text-white/60 font-medium hidden sm:block">
                  TL;DR generated
                </p>
              </div>
            </div>

            <div
              className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-light-border dark:border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-3 animate-float-medium group hover:border-orange-500/50 transition-colors w-full text-center md:text-left"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon name="warning" className="text-[18px] md:text-[24px]" />
              </div>
              <div>
                <p className="text-[10px] md:text-sm font-bold text-light-text dark:text-white leading-tight">
                  Risk Flags
                </p>
                <p className="text-[8px] md:text-[10px] text-light-text/80 dark:text-white/60 font-medium hidden sm:block">
                  Insights extracted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
