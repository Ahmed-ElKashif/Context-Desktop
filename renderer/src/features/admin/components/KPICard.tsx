/**
 * KPICard.tsx
 * A premium, animated KPI widget for the admin overview section.
 * Supports trend indicators, sparkline-style mini bars, and loading skeleton.
 */

import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string; // Material Symbols icon name
  theme?: "primary" | "secondary" | "accent" | "slate";
  isLoading?: boolean;
}

// Simple format for large numbers
const formatNumber = (n: string | number) => {
  const num = Number(n);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(n);
};

const SkeletonPulse = () => (
  <div className="animate-pulse flex flex-col items-center">
    <div className="w-12 h-12 bg-light-border dark:bg-white/10 rounded-full mb-4" />
    <div className="h-8 bg-light-border dark:bg-white/10 rounded w-1/2 mb-3" />
    <div className="h-4 bg-light-border dark:bg-white/10 rounded w-3/4 mb-2" />
    <div className="h-3 bg-light-border dark:bg-white/10 rounded w-1/3" />
  </div>
);

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  theme = "primary",
  isLoading = false,
}) => {
  // Theme styling definitions aligned with brand colors
  const themeClasses = {
    primary: {
      card: "bg-light-primary/[0.04] dark:bg-dark-primary/10 border-light-primary/10 dark:border-dark-primary/20",
      textPrimary: "text-light-primary dark:text-[#a78bfa]",
      textSecondary: "text-light-primary/80 dark:text-[#a78bfa]/80",
      iconBg: "bg-light-primary/10 dark:bg-dark-primary/25",
      iconText: "text-light-primary dark:text-dark-primary"
    },
    secondary: {
      card: "bg-[#3b82f6]/[0.04] dark:bg-[#3b82f6]/10 border-[#3b82f6]/10 dark:border-[#3b82f6]/20",
      textPrimary: "text-[#1d4ed8] dark:text-[#93c5fd]",
      textSecondary: "text-[#1d4ed8]/80 dark:text-[#93c5fd]/80",
      iconBg: "bg-[#3b82f6]/10 dark:bg-[#3b82f6]/25",
      iconText: "text-[#3b82f6] dark:text-[#60a5fa]"
    },
    accent: {
      card: "bg-[#ff7e5f]/[0.04] dark:bg-[#ff7e5f]/10 border-[#ff7e5f]/10 dark:border-[#ff7e5f]/25",
      textPrimary: "text-[#b43e26] dark:text-[#ffa085]",
      textSecondary: "text-[#b43e26]/80 dark:text-[#ffa085]/80",
      iconBg: "bg-[#ff7e5f]/10 dark:bg-[#ff7e5f]/25",
      iconText: "text-[#ff7e5f] dark:text-[#ffa38a]"
    },
    slate: {
      card: "bg-slate-500/[0.04] dark:bg-slate-500/10 border-slate-500/10 dark:border-slate-500/20",
      textPrimary: "text-slate-700 dark:text-slate-300",
      textSecondary: "text-slate-700/80 dark:text-slate-300/80",
      iconBg: "bg-slate-500/10 dark:bg-slate-500/25",
      iconText: "text-slate-600 dark:text-slate-450"
    }
  };

  const selectedTheme = themeClasses[theme];

  return (
    <div className={`relative border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden ${selectedTheme.card}`}>
      {isLoading ? (
        <SkeletonPulse />
      ) : (
        <div className="flex flex-col items-center text-center">
          
          {/* Centered Circular Icon Container */}
          <div className={`w-14 h-14 rounded-full ${selectedTheme.iconBg} flex items-center justify-center mb-5 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <span className={`material-symbols-rounded text-2xl ${selectedTheme.iconText}`}>{icon}</span>
          </div>

          {/* Huge Centered Value */}
          <p className={`text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 ${selectedTheme.textPrimary}`}>
            {formatNumber(value)}
          </p>

          {/* Bold Centered Title */}
          <p className={`text-xs font-black uppercase tracking-wider mb-1 ${selectedTheme.textSecondary}`}>
            {title}
          </p>

          {/* Subtitle / trend info */}
          {subtitle && (
            <p className={`text-[11px] font-bold mt-1 ${selectedTheme.textSecondary}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
