
// 1. Change the prop to accept the boolean from DashboardPage
export const BootSequence = ({ isComplete }: { isComplete: boolean }) => {
  // 2. We completely removed the hardcoded `useEffect` timers!
  // The parent component now fully controls when this fades out and unmounts.

  return (
    <div
      // 3. I updated the duration to 700ms so it finishes right before the parent
      // unmounts it at 800ms. I also added a subtle `blur` effect for extra polish!
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center w-full h-screen transition-all duration-700 ease-in-out overflow-hidden bg-light-bg dark:bg-dark-bg font-sans ${isComplete
          ? "opacity-0 pointer-events-none scale-110 blur-sm"
          : "opacity-100 scale-100 blur-0"
        }`}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-80 bg-grid-boot"></div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Main Animated SVG */}
        <div className="w-32 h-32 md:w-48 md:h-48 drop-shadow-xl dark:drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <circle
              cx="25"
              cy="25"
              r="7"
              className="fill-light-text/70 dark:fill-dark-text/80 boot-node boot-node-1"
            />
            <path
              d="M25 25 C 25 25, 40 45, 50 50"
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-light-primary/40 dark:stroke-dark-primary/50 boot-path-line boot-path-1"
            />

            <circle
              cx="75"
              cy="25"
              r="7"
              className="fill-light-text/70 dark:fill-dark-text/80 boot-node boot-node-2"
            />
            <path
              d="M75 25 C 75 25, 60 45, 50 50"
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-light-primary/40 dark:stroke-dark-primary/50 boot-path-line boot-path-2"
            />

            <circle
              cx="50"
              cy="80"
              r="7"
              className="fill-light-accent dark:fill-dark-secondary boot-node boot-node-3"
            />
            <path
              d="M50 80 C 50 80, 50 65, 50 50"
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-light-accent/70 dark:stroke-dark-secondary/80 boot-path-line boot-path-3"
            />

            <circle
              cx="50"
              cy="50"
              r="14"
              className="fill-light-primary dark:fill-dark-primary boot-core"
            />
            <circle
              cx="50"
              cy="50"
              r="22"
              strokeWidth="2"
              className="stroke-light-primary/15 dark:stroke-dark-primary/30 boot-ring"
            />
          </svg>
        </div>

        {/* Loading Text & Dots */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <span className="font-mono text-xs md:text-sm font-bold tracking-widest text-light-primary dark:text-dark-primary uppercase animate-pulse">
            {isComplete ? "Engine Ready" : "Initializing Context Engine"}
          </span>

          <div
            className={`flex gap-1.5 transition-opacity duration-300 ${isComplete ? "opacity-0" : "opacity-100"}`}
          >
            <div className="w-1.5 h-1.5 bg-light-primary dark:bg-dark-primary rounded-full boot-dot boot-dot-1"></div>
            <div className="w-1.5 h-1.5 bg-light-primary dark:bg-dark-primary rounded-full boot-dot boot-dot-2"></div>
            <div className="w-1.5 h-1.5 bg-light-primary dark:bg-dark-primary rounded-full boot-dot boot-dot-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
