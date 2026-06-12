import { Icon } from "../core/Icons"; // تأكد إن مسار الأيقونة صح بالنسبة لمكان الملف

export const ComparisonResultSkeleton = () => {
  return (
    <div className="animate-in fade-in duration-500 relative">
      
      {/* 🚀 AI Processing Badge - اللمسة الجديدة */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3 px-4 py-2 bg-light-primary/10 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20 rounded-full shadow-sm">
          <Icon name="memory" className="text-light-primary dark:text-dark-primary animate-pulse text-[18px]" />
          <span className="text-xs font-bold text-light-primary dark:text-dark-primary font-mono tracking-widest uppercase animate-pulse">
            Context AI Synthesizing Overlaps...
          </span>
        </div>
      </div>

      <div className="animate-pulse">
        {/* AI Synthesis Skeleton */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 md:p-8 border border-light-border dark:border-white/5 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-5 border-b border-light-border dark:border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-light-border dark:bg-white/10"></div>
            <div className="h-4 w-32 bg-light-border dark:bg-white/10 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-light-border dark:bg-white/10 rounded"></div>
            <div className="h-4 w-[90%] bg-light-border dark:bg-white/10 rounded"></div>
            <div className="h-4 w-[40%] bg-light-border dark:bg-white/10 rounded"></div>
          </div>
        </div>

        {/* Delta Board Skeleton (3 Columns) */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-light-border dark:divide-white/10">
            {[1, 2, 3].map((col) => (
              <div key={col} className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-white/10">
                  <div className="h-3 w-20 bg-light-border dark:bg-white/10 rounded"></div>
                  <div className="w-4 h-4 rounded bg-light-border dark:bg-white/10"></div>
                </div>
                {[1, 2].map((card) => (
                  <div key={card} className="bg-light-bg dark:bg-[#121214] p-4 rounded-xl border border-light-border dark:border-white/5 space-y-2">
                    <div className="h-4 w-[70%] bg-light-border dark:bg-white/10 rounded"></div>
                    <div className="h-3 w-full bg-light-border dark:bg-white/10 rounded opacity-50"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};