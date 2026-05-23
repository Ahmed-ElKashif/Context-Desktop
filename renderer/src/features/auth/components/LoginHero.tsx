import { Icon } from "../../../components/ui/Icons";

export const LoginHero = () => {
  return (
    <div className="hidden lg:flex w-7/12 sticky top-0 h-screen flex-col justify-center items-center p-16 z-10 overflow-hidden">
      <div className="relative w-[700px] h-[700px] flex items-center justify-center shrink-0">
        <div className="absolute z-20 w-32 h-32 bg-white/80 dark:bg-dark-surface/80 border border-light-primary/30 dark:border-dark-primary/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,55,102,0.15)] dark:shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-pulse-glow backdrop-blur-sm">
          <Icon
            name="neurology"
            className="text-light-primary dark:text-dark-primary text-5xl"
          />
        </div>
        <div
          className="absolute top-24 left-24 w-16 h-16 bg-white/90 dark:bg-dark-surface/90 border border-light-border dark:border-white/10 rounded-2xl flex items-center justify-center animate-float shadow-lg backdrop-blur-md z-10"
          style={{ animationDelay: "0s" }}
        >
          <Icon
            name="description"
            className="text-light-text/70 dark:text-white/60 text-2xl"
          />
        </div>
        <div
          className="absolute bottom-32 right-24 w-16 h-16 bg-white/90 dark:bg-dark-surface/90 border border-light-border dark:border-white/10 rounded-2xl flex items-center justify-center animate-float shadow-lg backdrop-blur-md z-10"
          style={{ animationDelay: "1.5s" }}
        >
          <Icon
            name="gavel"
            className="text-light-text/70 dark:text-white/60 text-2xl"
          />
        </div>
        <div
          className="absolute top-32 right-16 w-12 h-12 bg-white/90 dark:bg-dark-surface/90 border border-light-border dark:border-white/10 rounded-xl flex items-center justify-center animate-float shadow-lg backdrop-blur-md z-10"
          style={{ animationDelay: "3s" }}
        >
          <Icon
            name="image"
            className="text-light-text/70 dark:text-white/60 text-xl"
          />
        </div>
        <svg
          className="absolute inset-0 w-full h-full opacity-30 stroke-light-primary dark:stroke-dark-primary pointer-events-none"
          style={{ strokeWidth: "1px", strokeDasharray: "4, 4" }}
        >
          <line x1="50%" y1="50%" x2="20%" y2="20%" />
          <line x1="50%" y1="50%" x2="80%" y2="75%" />
          <line x1="50%" y1="50%" x2="85%" y2="25%" />
        </svg>
      </div>

      <div className="absolute bottom-16 left-16 z-30 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-light-primary/5 dark:bg-white/5 border border-light-primary/20 dark:border-white/10 rounded-full text-[10px] font-mono mb-4 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-light-primary dark:bg-dark-primary animate-pulse"></span>
          <span className="text-light-primary dark:text-white/80 uppercase tracking-widest font-bold">
            System Online
          </span>
        </div>
        <h1 className="text-6xl font-black text-light-text dark:text-white leading-tight mb-4 tracking-tight">
          <span className="relative block w-fit text-light-text/50 dark:text-white/40 cursor-default group transition-colors duration-300 hover:text-light-text/30 dark:hover:text-white/20">
            Stop organizing.
            <span className="absolute left-0 top-[55%] -translate-y-1/2 w-0 h-2 md:h-2.5 bg-light-primary dark:bg-dark-primary group-hover:w-full transition-all duration-300 ease-out rounded-full opacity-90"></span>
          </span>
          <span className="block gradient-text mt-1">Start understanding.</span>
        </h1>
        <p className="text-lg text-light-text/80 dark:text-white/70 leading-relaxed max-w-xl border-l-2 border-light-primary/30 dark:border-dark-primary/30 pl-6">
          Context replaces folders with neural connections, turning your
          scattered documents into a searchable second brain.
        </p>
      </div>
    </div>
  );
};
