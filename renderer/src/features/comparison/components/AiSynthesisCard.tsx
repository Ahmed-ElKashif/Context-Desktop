import { Icon } from "../../../components/ui/core/Icons";
import { ComparisonData } from "../api/comparisonService";

interface AiSynthesisCardProps {
  isLoading: boolean;
  hasData: boolean;
  data?: ComparisonData;
}

export const AiSynthesisCard = ({
  isLoading,
  hasData,
  data,
}: AiSynthesisCardProps) => {
  if (!isLoading && !hasData) return null;

  const similarity = data?.similarityPercentage ?? 0;

  return (
    <div className="bg-gradient-to-br from-white to-light-bg dark:from-dark-surface dark:to-[#121214] rounded-2xl p-6 md:p-8 border border-light-primary/20 dark:border-dark-primary/20 shadow-md mb-6 relative overflow-hidden z-20">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Icon
            name="sync"
            className="animate-spin text-light-primary dark:text-dark-primary text-[32px] mb-4"
          />
          <p className="text-sm font-bold text-light-text dark:text-white">
            Analyzing cross-document conceptual overlaps...
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 border-b border-light-border dark:border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-light-primary dark:bg-dark-primary flex items-center justify-center text-white dark:text-black shadow-sm">
              <Icon name="auto_awesome" className="text-[18px]" />
            </div>
            <h3 className="text-lg font-black text-light-text dark:text-white tracking-tight">
              AI Synthesis
            </h3>
          </div>

          {/* Real synthesis text from backend */}
          <p className="text-light-text/90 dark:text-white/90 leading-relaxed text-sm md:text-base font-medium">
            {data?.synthesis || "Analysis complete. No synthesis available."}
          </p>

          {/* Footer: Similarity pill styled with primary theme colors */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-light-border dark:border-white/5">
            <span className="px-3 py-1.5 rounded-lg bg-light-primary/10 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20 text-xs font-bold font-mono text-light-primary dark:text-dark-primary shadow-sm flex items-center gap-1.5">
              <Icon name="percent" className="text-[14px]" />
              Similarity: {similarity}%
            </span>
          </div>
        </>
      )}
    </div>
  );
};
