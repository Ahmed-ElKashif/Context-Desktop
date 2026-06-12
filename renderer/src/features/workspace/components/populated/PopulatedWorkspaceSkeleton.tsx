export const PopulatedWorkspaceSkeleton = () => {
  return (
    <div className="flex-1 p-4 md:p-8 relative z-10 flex flex-col h-full animate-in fade-in w-full overflow-y-auto">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4 animate-pulse">
        <div>
          <div className="h-3 w-40 rounded bg-light-border dark:bg-white/10 mb-3"></div>
          <div className="h-8 w-72 rounded bg-light-border dark:bg-white/10"></div>
          <div className="mt-3 flex gap-2">
            <div className="h-4 w-28 rounded bg-light-border dark:bg-white/10"></div>
            <div className="h-4 w-20 rounded bg-light-border dark:bg-white/10"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-24 rounded-lg bg-light-border dark:bg-white/10"></div>
          <div className="h-9 w-32 rounded-lg bg-light-border dark:bg-white/10"></div>
          <div className="h-9 w-10 rounded-lg bg-light-border dark:bg-white/10"></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-2">
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-8 border border-light-border dark:border-white/5 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-light-border dark:bg-white/10"></div>
              <div className="h-5 w-48 rounded bg-light-border dark:bg-white/10"></div>
              <div className="ml-auto h-5 w-24 rounded-full bg-light-border dark:bg-white/10"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-4 w-[90%] rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-4 w-[60%] rounded bg-light-border dark:bg-white/10"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-white/5 shadow-sm space-y-4">
              <div className="h-5 w-32 rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-3 w-full rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-3 w-[85%] rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-2 w-full rounded-full bg-light-border dark:bg-white/10"></div>
            </div>
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-white/5 shadow-sm space-y-4">
              <div className="h-5 w-28 rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-3 w-[70%] rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-3 w-[60%] rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-3 w-[50%] rounded bg-light-border dark:bg-white/10"></div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0 relative">
          <div className="w-full h-full flex flex-col bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-white/5 shadow-sm overflow-hidden animate-pulse">
            <div className="p-4 border-b border-light-border dark:border-white/5 bg-light-bg/50 dark:bg-[#121214]/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-light-border dark:bg-white/10"></div>
                <div>
                  <div className="h-3 w-28 rounded bg-light-border dark:bg-white/10"></div>
                  <div className="h-2 w-20 rounded bg-light-border dark:bg-white/10 mt-2"></div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-5 space-y-3 bg-light-bg/30 dark:bg-black/20">
              <div className="h-4 w-[85%] rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-4 w-[70%] rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-4 w-[90%] rounded bg-light-border dark:bg-white/10"></div>
              <div className="h-4 w-[60%] rounded bg-light-border dark:bg-white/10"></div>
            </div>
            <div className="p-4 border-t border-light-border dark:border-white/5">
              <div className="h-10 w-full rounded-xl bg-light-border dark:bg-white/10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
