
import { Icon } from "../../../../components/ui/core/Icons";
import type { ExcelPrettifyResult } from "../../../../services/prettify.service";

interface PrettifyExcelViewProps {
  result: ExcelPrettifyResult;
  activeSheet: number;
  setActiveSheet: (index: number) => void;
  handlePrettify: (force: boolean) => void;
  handleDownloadExcel: () => void;
  isDownloading: boolean;
}

export const PrettifyExcelView = ({
  result,
  activeSheet,
  setActiveSheet,
  handlePrettify,
  handleDownloadExcel,
  isDownloading,
}: PrettifyExcelViewProps) => {
  const sheet = result.sheets[activeSheet] || result.sheets[0];
  const isRtl = result.direction === "rtl";

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-light-bg dark:bg-[#0A0A0C]" dir={isRtl ? "rtl" : "ltr"}>
      {/* Action bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center px-5 py-3 shrink-0 border-b border-light-border dark:border-white/5 bg-white dark:bg-[#18181B] gap-3">
        {/* Label + Stats + Badges + Sheet Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold gradient-text shrink-0">
            <Icon name="auto_awesome" className="text-[14px] text-light-primary dark:text-dark-primary" />
            Prettified — {sheet.rows.length} rows · {sheet.headers.length} cols
            
            {/* Language badge */}
            {result.language && (
              <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                {result.language} · {isRtl ? "RTL" : "LTR"}
              </span>
            )}
            
            {/* Detected Type Badge */}
            {result.metadata?.detectedType && (
              <span
                className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest"
                title={
                  result.metadata.patterns?.length > 0
                    ? `Detected patterns: ${result.metadata.patterns.join(", ")}`
                    : undefined
                }
              >
                Detected: {result.metadata.detectedType}
              </span>
            )}
          </div>
          
          {/* Sheet tabs */}
          {result.sheets.length > 1 && (
            <div className="flex items-center ml-2 border-l border-light-border dark:border-white/10 pl-3 gap-1">
              {result.sheets.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSheet(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    activeSheet === i
                      ? "bg-light-primary/10 dark:bg-dark-primary/20 border-light-primary/30 dark:border-dark-primary/30 text-light-primary dark:text-dark-primary shadow-sm"
                      : "bg-transparent border-transparent text-light-text/70 dark:text-white/60 hover:bg-light-bg dark:hover:bg-white/5 hover:text-light-text dark:hover:text-white"
                  }`}
                >
                  <Icon name="table_view" className="text-[12px] inline mr-1.5 align-text-bottom opacity-70" />
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats + download */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handlePrettify(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-light-bg dark:bg-[#0A0A0C] border border-light-border dark:border-white/8 text-light-text/70 dark:text-white/70 hover:text-light-text dark:hover:text-white hover:border-light-primary/40 dark:hover:border-dark-primary/40 transition-all cursor-pointer mr-1"
            title="Re-run AI (bypasses cache)"
          >
            <Icon name="refresh" className="text-[14px]" />
            Re-prettify
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Icon name={isDownloading ? "sync" : "download"} className={`text-[14px] ${isDownloading ? "animate-spin" : ""}`} />
            Download .xlsx
          </button>
        </div>
      </div>

      {/* Table container with shadow and rounded corners */}
      <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-[#0A0A0C] p-4">
        <div className="rounded-xl border border-light-border dark:border-white/10 overflow-hidden shadow-sm h-full">
          <div className="overflow-auto h-full relative no-scrollbar">
            <table className="w-full border-collapse text-xs table-auto min-w-max">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#111827] dark:bg-[#18181B]">
                  <th className={`w-12 px-3 py-3 text-center text-[10px] font-bold font-mono uppercase tracking-widest text-white/50 border-r border-white/10 select-none sticky ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} bg-[#111827] dark:bg-[#18181B] z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]`}>
                    #
                  </th>
              {sheet.headers.map((h, ci) => (
                <th
                  key={ci}
                  className="px-5 py-3 font-semibold tracking-wide text-white/90 whitespace-nowrap border-r border-white/10 last:border-r-0 text-left"
                >
                  {h || <span className="text-white/40 italic">Column {ci + 1}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={sheet.headers.length + 1}
                  className="px-4 py-8 text-center text-light-text/60 dark:text-white/50 font-medium"
                >
                  No data rows in this sheet.
                </td>
              </tr>
            ) : (
              sheet.rows.map((row, ri) => {
                const isEvenRow = ri % 2 === 0;
                
                return (
                  <tr
                    key={ri}
                    className={`border-b border-light-border/40 dark:border-white/5 transition-colors hover:bg-light-primary/5 dark:hover:bg-dark-primary/10 ${
                      isEvenRow ? "bg-[#F9FAFB] dark:bg-[#111113]" : "bg-white dark:bg-[#0A0A0C]"
                    }`}
                  >
                    <td className={`px-3 py-2.5 text-center text-[10px] font-mono font-medium text-light-text/60 dark:text-white/50 border-r border-light-border/40 dark:border-white/5 select-none w-12 shrink-0 sticky ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} ${
                      isEvenRow ? "bg-[#F9FAFB] dark:bg-[#111113]" : "bg-white dark:bg-[#0A0A0C]"
                    } z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                      {ri + 1}
                    </td>
                    {sheet.headers.map((_, ci) => {
                      const cell = row[ci] ?? "";
                      const isNumeric = cell !== "" && (!isNaN(Number(cell)) || /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(cell));
                      const isEmpty = !cell;

                      return (
                        <td
                          key={ci}
                          className={`px-5 py-2.5 whitespace-nowrap border-r border-light-border/40 dark:border-white/5 last:border-r-0 ${
                            isEmpty
                              ? "text-light-text/50 dark:text-white/40 italic text-center"
                              : isNumeric
                                ? "text-slate-700 dark:text-slate-300 font-mono text-[11px] tabular-nums text-right"
                                : `text-light-text/90 dark:text-white/80 ${isRtl ? "text-right" : "text-left"}`
                          }`}
                        >
                          {isEmpty ? "—" : cell.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
        </div>
      </div>
    </div>
  );
};
