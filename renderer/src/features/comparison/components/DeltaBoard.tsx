import { Icon } from "../../../components/ui/Icons";

interface DeltaBoardProps {
  uniqueToBase: string[];
  sharedConcepts: string[];
  uniqueToCompare: string[];
}

export const DeltaBoard = ({
  uniqueToBase,
  sharedConcepts,
  uniqueToCompare,
}: DeltaBoardProps) => {
  return (
    <div className="w-full">
      {/* Podium row: uniform height via CSS grid, with top padding to accommodate the middle card's upward shift */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 lg:pt-6">

        {/* ── LEFT: Unique to Base ── */}
        <div className="flex flex-col h-full bg-light-primary/5 dark:bg-dark-secondary/5 rounded-2xl border border-light-primary/15 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-light-primary/10 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-light-primary/10 dark:bg-dark-secondary/20 flex items-center justify-center">
                <Icon
                  name="remove_circle_outline"
                  className="text-light-primary dark:text-dark-secondary text-[14px]"
                />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-light-primary dark:text-dark-secondary font-mono">
                Unique to Base
              </h4>
            </div>
            <span className="text-[10px] font-bold font-mono text-light-primary/50 dark:text-dark-secondary/50 bg-light-primary/10 dark:bg-dark-secondary/10 px-2 py-0.5 rounded-full">
              {uniqueToBase.length}
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {uniqueToBase.length > 0 ? (
              uniqueToBase.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-light-border dark:border-white/5 shadow-sm"
                >
                  <p className="text-sm text-light-text/90 dark:text-white/90 leading-relaxed font-medium">
                    {item}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-light-text/50 dark:text-white/40 italic">
                No unique points found.
              </p>
            )}
          </div>
        </div>

        {/* ── CENTER: Shared Concepts (Softer Dark Mode, High Contrast Light Mode) ── */}
        <div className="flex flex-col h-full bg-light-primary dark:bg-dark-primary/10 rounded-2xl border border-light-primary-dark/20 dark:border-dark-primary/30 shadow-xl shadow-light-primary/20 dark:shadow-[0_0_15px_rgba(139,92,246,0.1)] overflow-hidden relative z-10 lg:-translate-y-6">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/20 dark:border-dark-primary/20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white/20 dark:bg-dark-primary/20 flex items-center justify-center">
                <Icon
                  name="done_all"
                  className="text-white dark:text-dark-primary text-[14px]"
                />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white dark:text-white font-mono">
                Shared Concepts
              </h4>
            </div>
            <span className="text-[10px] font-bold font-mono text-white/90 dark:text-dark-primary/80 bg-white/20 dark:bg-dark-primary/20 px-2 py-0.5 rounded-full">
              {sharedConcepts.length}
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {sharedConcepts.length > 0 ? (
              sharedConcepts.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 dark:bg-dark-surface/80 p-4 rounded-xl border border-white/20 dark:border-dark-primary/10 shadow-sm flex items-start gap-3 backdrop-blur-sm"
                >
                  <Icon
                    name="all_match"
                    className="text-[18px] text-white dark:text-dark-primary mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-white dark:text-white/90 leading-relaxed font-medium">
                    {item}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/70 dark:text-white/40 italic">
                No shared concepts found.
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Unique to Compare ── */}
        <div className="flex flex-col h-full bg-light-accent/5 dark:bg-dark-primary/5 rounded-2xl border border-light-accent/15 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-light-accent/10 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-light-accent/10 dark:bg-dark-primary/20 flex items-center justify-center">
                <Icon
                  name="add_circle_outline"
                  className="text-light-accent dark:text-dark-primary text-[14px]"
                />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-light-accent dark:text-dark-primary font-mono">
                Unique to Comparison
              </h4>
            </div>
            <span className="text-[10px] font-bold font-mono text-light-accent/50 dark:text-dark-primary/50 bg-light-accent/10 dark:bg-dark-primary/10 px-2 py-0.5 rounded-full">
              {uniqueToCompare.length}
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {uniqueToCompare.length > 0 ? (
              uniqueToCompare.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-light-accent/30 dark:border-dark-primary/30 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-light-accent dark:bg-dark-primary" />
                  <p className="text-sm text-light-text/90 dark:text-white/90 leading-relaxed font-medium pl-2">
                    {item}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-light-text/50 dark:text-white/40 italic">
                No unique points found.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};