import { useMemo, useState, useCallback } from "react";
import Papa from "papaparse";

export interface SheetData {
  name: string;
  headers: string[];
  rows: string[][];
  rawCsv: string; // the original CSV text for clipboard copy
}

export const useCsvData = (extractedText?: string) => {
  const [activeSheet, setActiveSheet] = useState(0);
  const [copied, setCopied] = useState(false);

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
        const name = lines[0].replace(" ---", "").trim();
        const csv = lines.slice(1).join("\n").trim();

        const result = Papa.parse<string[]>(csv, { skipEmptyLines: true });
        const allRows = result.data as string[][];
        const headers = allRows[0] ?? [];
        const rows = allRows.slice(1);

        return { name, headers, rows, rawCsv: csv };
      });
  }, [extractedText]);

  return {
    activeSheet,
    setActiveSheet,
    copied,
    copyToClipboard,
    sheets,
  };
};
