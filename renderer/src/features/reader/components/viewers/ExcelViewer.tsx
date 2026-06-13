import { useState, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

import { Icon } from "../../../../components/ui/core/Icons";

// ─── Charts sub-system ────────────────────────────────────────────────────────
import { ChartType, CHART_TYPES } from "./charts/chartTypes";
import { validateChart, quickValidate, BADGE } from "./charts/chartValidation";
import { BarChartView } from "./charts/BarChartView";
import { LineChartView } from "./charts/LineChartView";
import { AreaChartView } from "./charts/AreaChartView";
import { PieChartView } from "./charts/PieChartView";

// ─── Refactored Hooks & Utils ─────────────────────────────────────────────────
import { useExcelData } from "./hooks/useExcelData";
import { useChartData } from "./hooks/useChartData";
import { downloadSvg, downloadPng } from "./utils/chartExport";
import { ExcelToolbar } from "./components/ExcelToolbar";

interface ExcelViewerProps {
  extractedText: string;
}

export const ExcelViewer = ({ extractedText }: ExcelViewerProps) => {
  const [activeTab, setActiveTab] = useState<"grid" | "chart">("grid");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const {
    sheets,
    activeSheet,
    setActiveSheet,
    rowData,
    columnDefs,
    xAxisKey,
    setXAxisKey,
    yAxisKey,
    setYAxisKey,
  } = useExcelData(extractedText);

  const { yIsDate, chartData, pieData, numericColumns } = useChartData(
    rowData,
    columnDefs,
    xAxisKey,
    yAxisKey
  );

  const validation = useMemo(
    () => validateChart(chartType, rowData, xAxisKey, yAxisKey),
    [chartType, rowData, xAxisKey, yAxisKey]
  );

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (sheets.length === 0)
    return (
      <div className="flex h-full items-center justify-center flex-col gap-3 text-light-text/50 dark:text-white/40">
        <Icon name="table_view" className="text-[48px] opacity-30" />
        <p className="text-sm font-medium">
          No spreadsheet data could be parsed.
        </p>
      </div>
    );

  const activeChartMeta = CHART_TYPES.find((c) => c.type === chartType)!;

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-[#18181B] overflow-hidden">
      <ExcelToolbar
        sheets={sheets}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* ── Content ── */}
      {activeTab === "grid" ? (
        /* ── Read-Only AG Grid ── */
        <div className="flex-1 w-full min-h-0 ag-theme-alpine dark:ag-theme-alpine-dark">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={100}
            suppressClickEdit
            suppressCellFocus
            enableCellTextSelection
            domLayout="normal"
            theme="legacy"
          />
        </div>
      ) : (
        /* ── Chart View ── */
        <div className="flex-1 w-full min-h-0 overflow-y-auto flex flex-col bg-light-bg/50 dark:bg-[#0A0A0C]">
          {/* Chart controls bar */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-light-border dark:border-white/8 bg-white dark:bg-[#18181B] shrink-0">
            {/* Chart type selector with validity badges */}
            <div className="flex items-center gap-1 bg-light-bg dark:bg-[#0A0A0C] p-1 rounded-xl border border-light-border dark:border-white/8">
              {CHART_TYPES.map(({ type, label, icon }) => {
                const q = quickValidate(type, rowData, yAxisKey);
                const isActive = chartType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    title={label}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-white dark:bg-[#18181B] shadow-sm text-emerald-600 dark:text-emerald-400 border border-light-border dark:border-white/10"
                        : "text-light-text/50 dark:text-white/40 hover:text-light-text dark:hover:text-white"
                    }`}
                  >
                    <Icon name={icon} className="text-[16px]" />
                    <span className="hidden sm:inline">{label}</span>
                    {q !== "valid" && (
                      <span
                        className={`absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] leading-none ${BADGE[q].dot}`}
                      >
                        {q === "invalid" ? "✕" : "!"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Axis selectors */}
            {chartType !== "pie" && (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/50 dark:text-white/40 font-mono">
                    Label
                  </span>
                  <select
                    value={xAxisKey}
                    onChange={(e) => setXAxisKey(e.target.value)}
                    className="bg-light-bg dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-light-text dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  >
                    {columnDefs.map((c) => (
                      <option key={c.field} value={c.field}>
                        {c.field}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/50 dark:text-white/40 font-mono">
                    Value
                  </span>
                  <select
                    value={yAxisKey}
                    onChange={(e) => setYAxisKey(e.target.value)}
                    className="bg-light-bg dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-light-text dark:text-white outline-none focus:border-emerald-500 transition-colors"
                  >
                    {(numericColumns.length > 0
                      ? numericColumns
                      : columnDefs
                    ).map((c) => (
                      <option key={c.field} value={c.field}>
                        {c.field}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Stats + Export dropdown */}
            <div className="ml-auto flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-light-text/40 dark:text-white/30 uppercase tracking-widest">
                <Icon name="query_stats" className="text-[14px]" />
                {rowData.length} rows · {columnDefs.length} cols
              </div>

              {validation.status !== "invalid" && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu((v) => !v)}
                    title="Export chart"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-light-bg dark:bg-[#0A0A0C] border border-light-border dark:border-white/8 text-light-text/60 dark:text-white/50 hover:text-light-text dark:hover:text-white hover:border-emerald-500/40 transition-all"
                  >
                    <Icon name="download" className="text-[14px]" />
                    <span className="hidden sm:inline">Export</span>
                    <Icon name="expand_more" className="text-[12px]" />
                  </button>

                  {showExportMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowExportMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-white dark:bg-[#1c1c1f] border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-light-border dark:border-white/5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-light-text/40 dark:text-white/30">
                            Export As
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            downloadPng(chartContainerRef, chartType);
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-light-text dark:text-white/80 hover:bg-light-bg dark:hover:bg-white/5 transition-colors text-left"
                        >
                          <span className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Icon
                              name="image"
                              className="text-[13px] text-blue-500"
                            />
                          </span>
                          <div>
                            <p className="leading-none">PNG Image</p>
                            <p className="text-[10px] text-light-text/40 dark:text-white/30 mt-0.5">
                              High-quality raster
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            downloadSvg(chartContainerRef, chartType);
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-light-text dark:text-white/80 hover:bg-light-bg dark:hover:bg-white/5 transition-colors text-left"
                        >
                          <span className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
                            <Icon
                              name="polyline"
                              className="text-[13px] text-violet-500"
                            />
                          </span>
                          <div>
                            <p className="leading-none">SVG Vector</p>
                            <p className="text-[10px] text-light-text/40 dark:text-white/30 mt-0.5">
                              Scalable, editable
                            </p>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chart canvas */}
          <div
            className="flex-1 flex flex-col min-h-0 p-6"
            ref={chartContainerRef}
          >
            {/* Chart title */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center">
                <Icon
                  name={activeChartMeta.icon}
                  className="text-[16px] text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-light-text dark:text-white leading-none">
                  {activeChartMeta.label} Chart
                </p>
                <p className="text-[10px] font-medium text-light-text/50 dark:text-white/40 mt-0.5">
                  {activeChartMeta.desc}
                  {chartType !== "pie" && " · showing up to 30 rows"}
                </p>
              </div>
            </div>

            {/* Validation banner */}
            {validation.status !== "valid" && (
              <div
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border mb-4 text-sm font-medium shrink-0 ${
                  validation.status === "invalid"
                    ? "bg-red-50 dark:bg-red-500/8 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                    : "bg-amber-50 dark:bg-amber-500/8 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                }`}
              >
                <Icon
                  name={validation.status === "invalid" ? "block" : "warning"}
                  className="text-[18px] shrink-0 mt-0.5"
                />
                <p className="leading-snug">{validation.message}</p>
              </div>
            )}

            {/* Chart or invalid empty state */}
            {validation.status === "invalid" ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center min-h-[200px]">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <Icon
                    name={activeChartMeta.icon}
                    className="text-[32px] text-red-300 dark:text-red-500/60"
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-light-text dark:text-white">
                    Chart unavailable
                  </p>
                  <p className="text-xs font-medium text-light-text/50 dark:text-white/40 mt-1 max-w-xs">
                    Fix the issue above to render this chart, or switch to a
                    different chart type or the Grid view.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-[300px]">
                {chartType === "bar" && (
                  <BarChartView
                    chartData={chartData}
                    xAxisKey={xAxisKey}
                    yAxisKey={yAxisKey}
                    yIsDate={yIsDate}
                  />
                )}
                {chartType === "line" && (
                  <LineChartView
                    chartData={chartData}
                    xAxisKey={xAxisKey}
                    yAxisKey={yAxisKey}
                    yIsDate={yIsDate}
                  />
                )}
                {chartType === "area" && (
                  <AreaChartView
                    chartData={chartData}
                    xAxisKey={xAxisKey}
                    yAxisKey={yAxisKey}
                    yIsDate={yIsDate}
                  />
                )}
                {chartType === "pie" && (
                  <PieChartView
                    pieData={pieData}
                    yAxisKey={yAxisKey}
                    yIsDate={yIsDate}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
