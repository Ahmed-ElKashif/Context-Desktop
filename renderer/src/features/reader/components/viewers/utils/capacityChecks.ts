import { DocumentData } from "../../../../../store/library/librarySlice";

export const LIMITS = {
  Excel: { maxCells: 750, maxColumns: 20 },
  Word: { maxChars: 15000 },
  TextSnippet: { maxChars: 8000 },
} as const;

export interface CapacityInfo {
  label: string;
  percentage: number;
  isOverLimit: boolean;
}

export function computeCapacity(doc: DocumentData): CapacityInfo | null {
  const text = doc.extractedText;
  if (!text) return null;

  if (doc.fileType === "Excel") {
    const lines = text.split("\n").filter((l) => {
      const t = l.trim();
      return t && !t.startsWith("--- Sheet:");
    });
    if (lines.length === 0) return null;
    const columns = lines[0].split(",").length;
    const rows = lines.length;
    const cells = rows * columns;
    const pct = Math.round((cells / LIMITS.Excel.maxCells) * 100);
    return {
      label: `${rows} rows × ${columns} cols (${cells.toLocaleString()} cells) / ${LIMITS.Excel.maxCells} limit`,
      percentage: pct,
      isOverLimit:
        cells > LIMITS.Excel.maxCells || columns > LIMITS.Excel.maxColumns,
    };
  }

  if (doc.fileType === "Word") {
    const chars = text.length;
    const pct = Math.round((chars / LIMITS.Word.maxChars) * 100);
    return {
      label: `${chars.toLocaleString()} chars / ${LIMITS.Word.maxChars.toLocaleString()} limit`,
      percentage: pct,
      isOverLimit: chars > LIMITS.Word.maxChars,
    };
  }

  if (doc.fileType === "TextSnippet") {
    const chars = text.length;
    const pct = Math.round((chars / LIMITS.TextSnippet.maxChars) * 100);
    return {
      label: `${chars.toLocaleString()} chars / ${LIMITS.TextSnippet.maxChars.toLocaleString()} limit`,
      percentage: pct,
      isOverLimit: chars > LIMITS.TextSnippet.maxChars,
    };
  }

  return null;
}

export function getCapacityColor(pct: number, isOverLimit: boolean) {
  if (isOverLimit || pct >= 100)
    return { text: "text-red-500", icon: "🚫", bg: "bg-red-500/10" };
  if (pct > 80)
    return { text: "text-amber-500", icon: "⚠️", bg: "bg-amber-500/10" };
  return { text: "text-emerald-500", icon: "✓", bg: "bg-emerald-500/10" };
}
