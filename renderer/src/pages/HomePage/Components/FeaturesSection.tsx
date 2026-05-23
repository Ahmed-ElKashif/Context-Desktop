import { Icon } from "../../../components/ui/Icons";

export const FeaturesGridSection = () => {
  return (
    <section className="w-full py-24 md:py-32 px-6 relative border-t border-light-border dark:border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-light-text dark:text-white tracking-tight mb-4">
            Built for clarity.
          </h2>
          <p className="text-light-text/80 dark:text-white/70 max-w-xl mx-auto text-lg font-medium">
            Every feature is designed to reduce your cognitive load and surface
            what matters.
          </p>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Card 1: Semantic Search (Spans 2 columns) */}
          <div className="md:col-span-2 rounded-3xl bg-white/50 dark:bg-[#121214]/60 backdrop-blur-md border border-light-border dark:border-white/10 p-8 flex flex-col justify-between overflow-hidden relative group hover:border-light-primary/50 dark:hover:border-dark-primary/50 transition-colors min-h-[250px]">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-light-primary/5 dark:bg-dark-primary/10 rounded-full blur-[40px] group-hover:bg-light-primary/15 transition-colors duration-700"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center h-full">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-surface shadow-sm flex items-center justify-center text-light-primary dark:text-dark-primary mb-6">
                  <Icon name="manage_search" />
                </div>
                <h3 className="text-2xl font-extrabold text-light-text dark:text-white mb-3">
                  Semantic Search
                </h3>
                <p className="text-light-text/80 dark:text-white/70 font-medium max-w-sm leading-relaxed">
                  Stop searching for exact filenames. Search for concepts like{" "}
                  <span className="italic text-light-text dark:text-white">
                    "contracts about APIs"
                  </span>{" "}
                  and find them instantly.
                </p>
              </div>
              <div className="w-full md:w-64 bg-white dark:bg-[#0A0A0C] p-3 rounded-xl border border-light-border dark:border-white/10 shadow-inner flex items-center justify-between group-hover:-translate-y-1 transition-transform duration-500">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Icon
                    name="search"
                    className="text-light-primary dark:text-dark-primary text-[18px]"
                  />
                  <span className="text-xs text-light-primary dark:text-white/60 font-mono font-bold border-r-2 border-light-primary dark:border-dark-primary animate-pulse pr-1 whitespace-nowrap">
                    Q3 Marketing
                  </span>
                </div>
                <span className="text-[9px] bg-light-bg dark:bg-white/10 px-1.5 py-0.5 rounded font-mono font-bold text-light-primary dark:text-white/40">
                  ⌘K
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Tags */}
          <div className="rounded-3xl bg-white/50 dark:bg-[#121214]/60 backdrop-blur-md border border-light-border dark:border-white/10 p-8 flex flex-col justify-start group hover:border-blue-500/50 transition-colors relative overflow-hidden min-h-[250px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-surface shadow-sm flex items-center justify-center text-blue-500 mb-6">
                <Icon name="sell" />
              </div>
              <h3 className="text-xl font-extrabold text-light-text dark:text-white mb-3">
                Smart Tags
              </h3>
              <p className="text-sm text-light-text/80 dark:text-white/70 font-medium leading-relaxed mb-6">
                Documents are automatically categorized into intelligent
                concepts.
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-mono font-bold group-hover:-translate-y-1 transition-transform duration-300">
                  #Legal
                </span>
                <span className="text-[10px] px-2 py-1 rounded bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 font-mono font-bold group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                  #Urgent
                </span>
                <span className="text-[10px] px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono font-bold group-hover:-translate-y-1 transition-transform duration-300 delay-150">
                  #Strategy
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Cognitive Load */}
          <div className="rounded-3xl bg-white/50 dark:bg-[#121214]/60 backdrop-blur-md border border-light-border dark:border-white/10 p-8 flex flex-col justify-start group hover:border-orange-500/50 transition-colors relative overflow-hidden min-h-[250px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-surface shadow-sm flex items-center justify-center text-orange-500 mb-6">
                <Icon name="battery_charging_full" />
              </div>
              <h3 className="text-xl font-extrabold text-light-text dark:text-white mb-3">
                Cognitive Load
              </h3>
              <p className="text-sm text-light-text/80 dark:text-white/70 font-medium leading-relaxed mb-6">
                Know exactly how heavy a file is before you even open it.
              </p>
              <div className="mt-auto w-full">
                <div className="flex justify-between text-[10px] font-mono font-bold mb-1.5 text-light-primary dark:text-white/60">
                  <span>Load Status</span>
                  <span className="text-orange-600 dark:text-orange-400 group-hover:animate-pulse">
                    Heavy (24MB)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-light-border dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-0 group-hover:w-[85%] transition-all duration-1000 ease-out rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Semantic Comparisons (Spans 2 columns) */}
          <div className="md:col-span-2 rounded-3xl bg-white/50 dark:bg-[#121214]/60 backdrop-blur-md border border-light-border dark:border-white/10 p-8 flex flex-col justify-between overflow-hidden relative group hover:border-light-accent/50 dark:hover:border-dark-secondary/50 transition-colors min-h-[250px]">
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-light-accent/5 dark:bg-dark-secondary/10 rounded-full blur-[40px] group-hover:bg-light-accent/15 transition-colors duration-700"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center h-full">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-surface shadow-sm flex items-center justify-center text-light-accent dark:text-dark-secondary mb-6">
                  <Icon name="compare_arrows" />
                </div>
                <h3 className="text-2xl font-extrabold text-light-text dark:text-white mb-3">
                  Semantic Comparisons
                </h3>
                <p className="text-light-text/80 dark:text-white/70 font-medium max-w-sm leading-relaxed">
                  Select two documents and let the AI find the overlapping
                  topics, missing clauses, and key differences in seconds.
                </p>
              </div>
              <div className="w-full md:w-64 bg-white dark:bg-[#0A0A0C] rounded-xl border border-light-border dark:border-white/10 p-3 font-mono font-bold text-[10px] md:text-xs shadow-inner flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1.5 rounded w-fit group-hover:-translate-x-1 transition-transform duration-500">
                  <Icon name="remove" className="text-[14px]" />
                  <span>v1: Liability capped at 1.0x</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1.5 rounded w-fit self-end group-hover:translate-x-1 transition-transform duration-500">
                  <Icon name="add" className="text-[14px]" />
                  <span>v2: Liability capped at 1.5x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
