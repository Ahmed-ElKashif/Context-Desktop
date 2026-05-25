import React from "react";

export const PageLoader: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[400px] animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Subtle spinning ring with brand colors */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-light-bg dark:border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-light-primary dark:border-dark-primary rounded-full border-t-transparent dark:border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-light-text/50 dark:text-white/50 animate-pulse">
          Loading view...
        </p>
      </div>
    </div>
  );
};
