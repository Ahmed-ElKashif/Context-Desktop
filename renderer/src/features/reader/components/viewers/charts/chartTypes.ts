// ─── Shared types, constants, and helpers for all chart components ────────────

export type ChartType = "bar" | "line" | "area" | "pie";
export type Validity  = "valid" | "warning" | "invalid";

export interface ChartValidation { status: Validity; message: string; }

// ─── Colour palette ───────────────────────────────────────────────────────────

export const CHART_COLORS = [
  "#10b981", "#6366f1", "#f59e0b", "#ec4899",
  "#3b82f6", "#8b5cf6", "#14b8a6", "#f97316",
];
export const ACCENT = CHART_COLORS[0];

// ─── Recharts shared style objects ────────────────────────────────────────────

export const DarkTooltipStyle = {
  backgroundColor: "#18181b",
  borderColor:     "rgba(255,255,255,0.08)",
  borderRadius:    "10px",
  color:           "#fff",
  fontSize:        "12px",
  fontWeight:      600,
  boxShadow:       "0 8px 32px rgba(0,0,0,0.4)",
};

export const TickStyle = { fontSize: 11, fill: "#888", fontWeight: 500 };

// ─── Chart type meta (used in the selector UI) ────────────────────────────────

export const CHART_TYPES: { type: ChartType; label: string; icon: string; desc: string }[] = [
  { type: "bar",  label: "Bar",  icon: "bar_chart",  desc: "Column comparison"  },
  { type: "line", label: "Line", icon: "show_chart", desc: "Trend over rows"    },
  { type: "area", label: "Area", icon: "area_chart", desc: "Cumulative view"    },
  { type: "pie",  label: "Pie",  icon: "pie_chart",  desc: "Proportional share" },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** True if the value looks like a common date string (M/D/YY, YYYY-MM-DD, etc.) */
export function looksLikeDate(value: string): boolean {
  return /^\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(value.trim());
}

/** True if >50% of non-empty values in a column are dates */
export function isDateColumn(rows: Record<string, string>[], key: string): boolean {
  const vals = rows.map((r) => r?.[key] ?? "").filter((v) => v !== "");
  if (vals.length === 0) return false;
  return vals.filter(looksLikeDate).length / vals.length > 0.5;
}

/** Converts a date string to a Unix timestamp (ms). Falls back to 0. */
export function toTimestamp(value: string): number {
  const d = new Date(value);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

/** Formats a Unix timestamp (ms) back to a short readable date string. */
export function formatDateTick(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
}
