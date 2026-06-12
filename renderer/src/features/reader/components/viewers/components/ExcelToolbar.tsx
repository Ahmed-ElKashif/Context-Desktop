import { Icon } from "../../../../../components/ui/core/Icons";
import { SheetData } from "../hooks/useExcelData";

interface ExcelToolbarProps {
  sheets: SheetData[];
  activeSheet: number;
  setActiveSheet: (index: number) => void;
  activeTab: "grid" | "chart";
  setActiveTab: (tab: "grid" | "chart") => void;
}

export const ExcelToolbar = ({
  sheets,
  activeSheet,
  setActiveSheet,
  activeTab,
  setActiveTab,
}: ExcelToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 pt-3 pb-0 bg-light-bg dark:bg-[#0A0A0C] border-b border-light-border dark:border-white/8 gap-3">
      {/* Sheet tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar items-end">
        {sheets.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSheet(i)}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all border-t border-l border-r ${
              activeSheet === i
                ? "bg-white dark:bg-[#18181B] border-light-border dark:border-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "bg-transparent border-transparent text-light-text/60 dark:text-white/40 hover:text-light-text dark:hover:text-white hover:bg-light-border/20 dark:hover:bg-white/5"
            }`}
          >
            <Icon
              name="table_view"
              className="text-[12px] inline mr-1.5 align-text-bottom opacity-70"
            />
            {s.name}
          </button>
        ))}
      </div>
      {/* Grid / Chart toggle */}
      <div className="flex bg-light-border/30 dark:bg-white/5 p-1 rounded-lg shrink-0 mb-2">
        {(["grid", "chart"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab
                ? "bg-white dark:bg-[#18181B] shadow-sm text-light-text dark:text-white"
                : "text-light-text/60 dark:text-white/50 hover:text-light-text dark:hover:text-white"
            }`}
          >
            <Icon
              name={tab === "grid" ? "table_view" : "bar_chart"}
              className="text-[14px]"
            />
            {tab === "grid" ? "Grid" : "Charts"}
          </button>
        ))}
      </div>
    </div>
  );
};
