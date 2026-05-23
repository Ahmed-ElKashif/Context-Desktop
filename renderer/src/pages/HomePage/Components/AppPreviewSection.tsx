import { Icon } from "../../../components/ui/Icons";

export const AppPreviewSection = () => {
  return (
    <section className="w-full py-24 md:py-32 px-4 md:px-12 relative overflow-hidden border-t border-light-border dark:border-white/5">
      <div className="text-center mb-20 relative z-10">
        <h2 className="text-4xl md:text-6xl font-black text-light-text dark:text-white tracking-tight mb-4">
          Your Second Brain, Visualized.
        </h2>
        <p className="text-light-text/80 dark:text-white/70 max-w-xl mx-auto text-lg font-medium">
          A workspace designed to highlight connections, not hide them in
          folders.
        </p>
      </div>

      <div className="w-full max-w-5xl mx-auto relative perspective-container">
        {/* Floating Context Labels */}
        <div className="absolute -top-12 -left-4 md:-left-12 z-30 animate-float hidden sm:flex items-start gap-3 bg-white/95 dark:bg-dark-surface/95 border border-light-border dark:border-white/10 p-4 rounded-2xl shadow-xl backdrop-blur-md">
          <Icon
            name="auto_awesome"
            className="text-light-primary dark:text-dark-primary mt-1"
          />
          <div>
            <p className="text-sm font-bold text-light-text dark:text-white">
              Context AI Found a Link
            </p>
            <p className="text-xs font-semibold text-light-primary dark:text-white/60">
              This relates to "Q3 Strategy"
            </p>
          </div>
        </div>
        <div
          className="absolute -bottom-8 -right-4 md:-right-8 z-30 animate-float hidden sm:flex items-center gap-3 bg-white/95 dark:bg-dark-surface/95 border border-light-border dark:border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md"
          style={{ animationDelay: "-3s" }}
        >
          <div className="flex -space-x-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 border-2 border-white dark:border-dark-surface">
              #Legal
            </span>
            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-700 border-2 border-white dark:border-dark-surface">
              #Urgent
            </span>
          </div>
          <p className="text-xs font-bold text-light-text dark:text-white pr-2">
            Auto-Tagged
          </p>
        </div>

        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-secondary rounded-[2rem] blur-2xl opacity-10 dark:opacity-20 -z-10"></div>

        {/* Fake Dashboard Window */}
        <div className="tilt-effect relative w-full aspect-[4/3] md:aspect-video overflow-hidden rounded-2xl md:rounded-[2rem] border border-light-border dark:border-white/10 bg-white/90 dark:bg-[#121214]/90 backdrop-blur-md shadow-2xl flex flex-col">
          {/* Fake Browser Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-light-bg/80 dark:bg-[#0A0A0C]/80 border-b border-light-border dark:border-white/5 shrink-0 z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-light-primary dark:text-white/60 font-bold bg-white dark:bg-white/5 px-4 py-1.5 rounded-md shadow-sm">
              <Icon name="lock" className="text-[12px]" />
              context://dashboard
            </div>
            <div className="w-10"></div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Fake Sidebar */}
            <div className="w-48 md:w-56 border-r border-light-border dark:border-white/5 p-4 hidden sm:flex flex-col gap-6 bg-light-bg/30 dark:bg-[#18181B]/30 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 bg-light-primary/10 dark:bg-dark-primary/10 rounded-lg text-sm font-bold text-light-primary dark:text-dark-primary">
                  <Icon name="home" className="text-[18px]" /> Dashboard
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-light-primary dark:text-white/60">
                  <Icon name="folder_open" className="text-[18px]" /> Library
                </div>
              </div>
            </div>

            {/* Fake Dashboard Body */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-grid relative">
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-black text-light-text dark:text-white mb-2 tracking-tight">
                  Good afternoon, Ahmed.
                </h3>
                <p className="text-sm font-medium text-light-text/80 dark:text-white/60">
                  Context analyzed 3 new sources today.
                </p>
              </div>

              {/* Fake File Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* PDF Card */}
                <div className="p-4 rounded-xl border border-light-border dark:border-white/5 bg-white/50 dark:bg-[#1E1E22]/80 backdrop-blur-sm shadow-sm">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                      <Icon name="picture_as_pdf" className="text-[20px]" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold dark:text-white truncate">
                        Q3_Report_Final.pdf
                      </div>
                      <div className="text-xs font-semibold text-light-primary dark:text-white/50">
                        24MB • Heavy Load
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-light-bg/50 dark:bg-black/30 text-[11px] md:text-xs text-light-text/80 dark:text-white/70 font-medium leading-relaxed">
                    <span className="text-light-primary dark:text-dark-primary font-bold">
                      Summary:
                    </span>{" "}
                    Revenue up 12% YoY. Supply chain risks identified.
                  </div>
                </div>

                {/* Image Card */}
                <div className="p-4 rounded-xl border border-light-border dark:border-white/5 bg-white/50 dark:bg-[#1E1E22]/80 backdrop-blur-sm shadow-sm">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <Icon name="image" className="text-[20px]" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold dark:text-white truncate">
                        Whiteboard.jpg
                      </div>
                      <div className="text-xs font-semibold text-light-primary dark:text-white/50">
                        OCR Parsed
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-light-bg/50 dark:bg-black/30 text-[11px] md:text-xs text-light-text/80 dark:text-white/70 font-medium leading-relaxed">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      Extracted:
                    </span>{" "}
                    3 Action Items & 1 Critical Blocker.
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom fade out gradient */}
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white/90 dark:from-[#121214]/90 to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};
