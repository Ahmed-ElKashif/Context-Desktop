import { useAppSelector } from "../../../store/hooks";

export const IntelligenceSection = () => {
  const { aiUsage } = useAppSelector((state) => state.settings);

  // --- Daily Math ---
  const dailyLimit = aiUsage?.dailyLimit || 50000;
  const dailyUsed = aiUsage?.tokensUsed || 0;
  const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
  const dailyPercent = Math.min(100, Math.round((dailyUsed / dailyLimit) * 100));
  const isDailyLimitReached = dailyUsed >= dailyLimit;

  // --- Monthly Math ---
  const monthlyLimit = aiUsage?.monthlyLimit || 1500000;
  const monthlyUsed = aiUsage?.monthlyUsed || 0;
  const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
  const monthlyPercent = Math.min(100, Math.round((monthlyUsed / monthlyLimit) * 100));
  const isMonthlyLimitReached = monthlyUsed >= monthlyLimit;

  // Dynamic colors based on usage
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.8)]";
    if (percent > 90) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]";
    if (percent > 75) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]";
    return "bg-light-primary dark:bg-dark-primary shadow-[0_0_10px_rgba(139,92,246,0.4)]";
  };

  return (
    <section>
      <h2 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-6 border-b border-light-border dark:border-white/5 pb-2">
        AI Intelligence
      </h2>
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-white/5 shadow-sm">

        {/* ── Daily Token Budget ─────────────────────────────────────── */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-extrabold text-sm text-light-text dark:text-white">Daily Token Budget</p>
              <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
                Your AI processing budget resets every 8 hours.
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-black tracking-tight ${isDailyLimitReached ? 'text-red-500' : 'text-light-text dark:text-white'}`}>
                {dailyPercent}%
              </p>
            </div>
          </div>

          {/* Limit Reached Warning Message */}
          {isDailyLimitReached && (
            <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <span className="material-symbols-rounded text-red-500 text-[20px] shrink-0">error</span>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                You have reached your limit of {dailyLimit.toLocaleString()} tokens for this 8-hour period. AI features will be temporarily paused until the budget resets.
              </p>
            </div>
          )}

          {/* Track */}
          <div className="h-2 w-full bg-light-border/50 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(dailyPercent)}`}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-3 text-xs font-semibold text-light-text/70 dark:text-white/70">
            <span>{dailyUsed.toLocaleString()} used</span>
            <span>{dailyRemaining.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-light-border dark:bg-white/5" />

        {/* ── Monthly Token Budget ────────────────────────────────────── */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-extrabold text-sm text-light-text dark:text-white">Monthly Token Budget</p>
              <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
                Your monthly allowance resets at the start of next month.
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-black tracking-tight ${isMonthlyLimitReached ? 'text-red-500' : 'text-light-text dark:text-white'}`}>
                {monthlyPercent}%
              </p>
            </div>
          </div>

          {/* Limit Reached Warning Message */}
          {isMonthlyLimitReached && (
            <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <span className="material-symbols-rounded text-red-500 text-[20px] shrink-0">error</span>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                You have reached your monthly limit of {monthlyLimit.toLocaleString()} tokens. AI features will be temporarily paused.
              </p>
            </div>
          )}

          {/* Track */}
          <div className="h-2 w-full bg-light-border/50 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(monthlyPercent)}`}
              style={{ width: `${monthlyPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-3 text-xs font-semibold text-light-text/70 dark:text-white/70">
            <span>{monthlyUsed.toLocaleString()} used</span>
            <span>{monthlyRemaining.toLocaleString()} remaining</span>
          </div>
        </div>

      </div>
    </section>
  );
};