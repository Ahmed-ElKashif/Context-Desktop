import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui/core/Icons";
import { DocumentData } from "../../../store/library/librarySlice";
import { ComparisonResponse } from "../api/comparisonService";
import { exportComparisonReport } from "../utils/comparisonUtils";
import { useAppSelector } from "../../../store/hooks";

interface ComparisonHeaderProps {
  baseDoc: DocumentData | null;
  compareDoc: DocumentData | null;
  comparisonData: ComparisonResponse | null;
}

export function ComparisonHeader({ baseDoc, compareDoc, comparisonData }: ComparisonHeaderProps) {
  const navigate = useNavigate();
  const { history, activeComparisonId } = useAppSelector((state) => state.comparison);

  const activeRecord = history.find(h => h._id === activeComparisonId);
  const reportName = activeRecord?.customTitle || `Comparison: ${baseDoc?.title} vs ${compareDoc?.title}`;

  return (
    <header className="h-16 border-b border-light-border dark:border-white/5 bg-light-surface dark:bg-dark-surface flex items-center justify-between px-8 shrink-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-light-primary dark:text-dark-text/70 uppercase tracking-widest hidden sm:flex">
          <button
            onClick={() => navigate("/library")}
            className="hover:text-light-text dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            Library
          </button>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-light-text dark:text-white">
            Comparison Engine
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          id="tour-compare-export"
          onClick={() => exportComparisonReport(baseDoc, compareDoc, comparisonData, reportName)}
          className="flex items-center gap-2 px-3 py-1.5 bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/10 rounded-lg text-xs font-bold text-light-text/80 dark:text-white/80 hover:text-light-primary dark:hover:text-white transition-colors shadow-sm"
        >
          <Icon name="download" className="text-[16px]" />
          Export Report
        </button>
      </div>
    </header>
  );
}
