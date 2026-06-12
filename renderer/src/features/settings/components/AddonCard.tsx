export interface AddonCardProps {
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  checkClass: string;
  title: string;
  description: string;
  priceText: string;
  cycleText: string;
  features: string[];
  onAction: () => void;
}

export const AddonCard = ({
  icon,
  iconBgClass,
  iconTextClass,
  checkClass,
  title,
  description,
  priceText,
  cycleText,
  features,
  onAction,
}: AddonCardProps) => {
  return (
    <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-light-primary/30 dark:hover:border-dark-primary/30 hover:shadow-[0_4px_20px_rgba(16,55,102,0.04)] dark:hover:shadow-[0_4px_20px_rgba(139,92,246,0.05)] transition-all duration-300">
      <div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBgClass}`}
        >
          <span
            className={`material-symbols-rounded text-[22px] ${iconTextClass}`}
          >
            {icon}
          </span>
        </div>
        <h3 className="text-lg font-bold text-light-text dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-xs text-light-text/60 dark:text-dark-text/60 mb-4 min-h-8">
          {description}
        </p>
        <div className="mb-4">
          <span className="text-2xl font-black text-light-text dark:text-white">
            {priceText}
          </span>
          <span className="text-xs font-semibold text-light-text/70 dark:text-dark-text/70 ml-1">
            {cycleText}
          </span>
        </div>
        <div className="border-t border-light-border/50 dark:border-white/5 pt-4 space-y-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs font-medium text-light-text/80 dark:text-dark-text/80"
            >
              <span
                className={`material-symbols-rounded text-[14px] ${checkClass}`}
              >
                check
              </span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={onAction}
          className="w-full py-2 bg-light-primary dark:bg-dark-primary hover:opacity-90 text-white font-bold text-xs rounded-lg flex justify-center items-center gap-1 shadow-sm transition-all duration-300"
        >
          Get Started{" "}
          <span className="material-symbols-rounded text-[14px]">
            arrow_outward
          </span>
        </button>
      </div>
    </div>
  );
};
