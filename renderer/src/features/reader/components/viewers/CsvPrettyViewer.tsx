import { useMemo, useState, useCallback } from "react";
import Papa from "papaparse";
import { Icon } from "../../../../components/ui/Icons";

interface CsvPrettyViewerProps {
  extractedText?: string;
}

interface SheetData {
  name: string;
  headers: string[];
  rows: string[][];
  rawCsv: string;   // the original CSV text for clipboard copy
}

/**
 * A premium, read-only styled table view of raw CSV / Excel data.
 * Parses each sheet from the backend's "--- Sheet: Name ---\n<CSV>" format
 * and renders it as a beautiful data table with sticky headers, row numbers,
 * alternating stripes, and per-sheet tab navigation.
 */
export const CsvPrettyViewer = ({ extractedText }: CsvPrettyViewerProps) => {
  const [activeSheet, setActiveSheet] = useState(0);
  const [copied,      setCopied     ] = useState(false);

  // ── Copy active sheet CSV to clipboard ─────────────────────────────────────────
  const copyToClipboard = useCallback((rawCsv: string) => {
    navigator.clipboard.writeText(rawCsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // ── Parse all sheets ────────────────────────────────────────────────────────
  const sheets = useMemo<SheetData[]>(() => {
    if (!extractedText) return [];
    return extractedText
      .split("--- Sheet: ")
      .filter(Boolean)
      .map((raw) => {
        const lines = raw.split("\n");
        const name  = lines[0].replace(" ---", "").trim();
        const csv   = lines.slice(1).join("\n").trim();

        const result = Papa.parse<string[]>(csv, { skipEmptyLines: true });
        const allRows = result.data as string[][];
        const headers = allRows[0] ?? [];
        const rows    = allRows.slice(1);

        return { name, headers, rows, rawCsv: csv };
      });
  }, [extractedText]);

  if (sheets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-3 text-light-text/50 dark:text-white/40">
        <Icon name="table_view" className="text-[40px] opacity-30" />
        <p className="text-sm font-medium">No CSV data could be parsed from this file.</p>
      </div>
    );
  }

  const sheet = sheets[activeSheet];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-light-bg dark:bg-[#0A0A0C]">

      {/* ── Sheet tabs ── */}
      {sheets.length > 1 && (
        <div className="flex gap-1 px-4 pt-3 shrink-0 overflow-x-auto no-scrollbar border-b border-light-border dark:border-white/8">
          {sheets.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSheet(i)}
              className={`px-4 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all border-t border-l border-r ${
                activeSheet === i
                  ? "bg-white dark:bg-[#18181B] border-light-border dark:border-white/10 text-light-primary dark:text-dark-primary shadow-sm"
                  : "bg-transparent border-transparent text-light-text/60 dark:text-white/40 hover:text-light-text dark:hover:text-white"
              }`}
            >
              <Icon name="table_view" className="text-[12px] inline mr-1.5 align-text-bottom opacity-70" />
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 shrink-0 border-b border-light-border dark:border-white/5 bg-white dark:bg-[#18181B]">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-light-text/50 dark:text-white/30">
          <Icon name="dataset" className="text-[13px]" />
          {sheet.rows.length} rows
        </div>
        <span className="text-light-border dark:text-white/10 text-xs">·</span>
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-light-text/50 dark:text-white/30">
          <Icon name="view_column" className="text-[13px]" />
          {sheet.headers.length} columns
        </div>
        <div className="ml-auto text-[10px] font-mono font-bold uppercase tracking-widest text-light-text/30 dark:text-white/20">
          {sheet.name}
        </div>

        {/* Copy CSV button */}
        <button
          onClick={() => copyToClipboard(sheet.rawCsv)}
          title="Copy raw CSV to clipboard"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            copied
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-light-bg dark:bg-[#0A0A0C] border-light-border dark:border-white/8 text-light-text/50 dark:text-white/40 hover:text-light-text dark:hover:text-white hover:border-emerald-500/40"
          }`}
        >
          <Icon name={copied ? "check" : "content_copy"} className="text-[13px]" />
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy CSV"}</span>
        </button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full border-collapse text-xs font-medium table-auto min-w-max">

          {/* Sticky header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-light-bg dark:bg-[#111113] border-b border-light-border dark:border-white/8">
              {/* Row number column */}
              <th className="w-10 px-3 py-2.5 text-right text-[10px] font-bold font-mono uppercase tracking-widest text-light-text/30 dark:text-white/20 border-r border-light-border dark:border-white/5 select-none">
                #
              </th>
              {sheet.headers.map((h, ci) => (
                <th
                  key={ci}
                  className="px-4 py-2.5 text-left font-bold tracking-tight text-light-text dark:text-white/90 whitespace-nowrap border-r border-light-border dark:border-white/5 last:border-r-0"
                >
                  {h || <span className="text-light-text/30 dark:text-white/20 italic">Column {ci + 1}</span>}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body rows */}
          <tbody>
            {sheet.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={sheet.headers.length + 1}
                  className="px-4 py-8 text-center text-light-text/40 dark:text-white/30 font-medium"
                >
                  No data rows in this sheet.
                </td>
              </tr>
            ) : (
              sheet.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={`border-b border-light-border/50 dark:border-white/4 transition-colors group hover:bg-light-primary/5 dark:hover:bg-dark-primary/5 ${
                    ri % 2 === 0
                      ? "bg-white dark:bg-[#18181B]"
                      : "bg-light-bg/60 dark:bg-[#111113]"
                  }`}
                >
                  {/* Row number */}
                  <td className="px-3 py-2 text-right text-[10px] font-mono font-bold text-light-text/25 dark:text-white/15 border-r border-light-border dark:border-white/5 select-none w-10 shrink-0">
                    {ri + 1}
                  </td>
                  {sheet.headers.map((_, ci) => {
                    const cell = row[ci] ?? "";
                    const isNumeric = cell !== "" && !isNaN(Number(cell));
                    const isEmpty   = cell === "" || cell === null || cell === undefined;
                    return (
                      <td
                        key={ci}
                        className={`px-4 py-2 whitespace-nowrap border-r border-light-border/40 dark:border-white/4 last:border-r-0 ${
                          isEmpty
                            ? "text-light-text/20 dark:text-white/15 italic"
                            : isNumeric
                            ? "text-emerald-700 dark:text-emerald-400 font-mono font-semibold tabular-nums"
                            : "text-light-text dark:text-white/80"
                        }`}
                      >
                        {isEmpty ? "—" : cell}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
