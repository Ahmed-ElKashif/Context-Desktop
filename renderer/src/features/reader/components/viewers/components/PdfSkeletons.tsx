import { Icon } from "../../../../../components/ui/core/Icons";

export const PageSkeleton = () => (
  <div className="w-[600px] h-[800px] bg-white dark:bg-[#121214] flex flex-col items-center justify-center gap-4 rounded-lg border border-light-border dark:border-white/10 shadow-sm animate-pulse">
    <Icon
      name="description"
      className="text-[48px] text-light-text/20 dark:text-white/10"
    />
    <div className="flex flex-col items-center gap-2">
      <div className="h-3 w-32 bg-light-border dark:bg-white/5 rounded-full"></div>
      <div className="h-2 w-48 bg-light-border dark:bg-white/5 rounded-full"></div>
      <div className="h-2 w-40 bg-light-border dark:bg-white/5 rounded-full"></div>
    </div>
  </div>
);

export const ThumbnailSkeleton = () => (
  <div className="w-[160px] h-[220px] bg-white dark:bg-[#121214] flex flex-col items-center justify-center gap-3 rounded border border-light-border dark:border-white/10 animate-pulse">
    <Icon
      name="draft"
      className="text-[24px] text-light-text/20 dark:text-white/10"
    />
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-1.5 w-16 bg-light-border dark:bg-white/5 rounded-full"></div>
      <div className="h-1 w-20 bg-light-border dark:bg-white/5 rounded-full"></div>
    </div>
  </div>
);
