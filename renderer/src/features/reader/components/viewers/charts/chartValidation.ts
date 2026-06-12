import { ChartType, ChartValidation, Validity } from "./chartTypes";

// ─── Full validation (shown as banner + blocks invalid chart) ─────────────────

export function validateChart(
  type: ChartType,
  rowData: Record<string, string>[],
  _xAxisKey: string,
  yAxisKey: string,
): ChartValidation {
  if (rowData.length === 0)
    return { status: "invalid", message: "No data rows found in this sheet." };

  const yValues      = rowData.map((r) => r?.[yAxisKey] ?? "");
  const numericVals  = yValues.filter((v) => v !== "" && !isNaN(parseFloat(v)));
  const numericRatio = numericVals.length / yValues.length;
  const parsedNums   = numericVals.map((v) => parseFloat(v));
  const allIdentical = parsedNums.length > 0 && parsedNums.every((v) => v === parsedNums[0]);
  const allZero      = parsedNums.length > 0 && parsedNums.every((v) => v === 0);

  if (type === "pie") {
    if (numericRatio < 0.5)
      return { status: "invalid", message: `"${yAxisKey}" contains mostly text or dates — a Pie chart needs numeric values to show proportions. Try selecting a numeric column as Value, or switch to the Grid view.` };
    if (rowData.length > 12)
      return { status: "warning", message: `Pie charts become hard to read with more than 12 slices. This sheet has ${rowData.length} rows — consider switching to a Bar chart for a clearer comparison.` };
    if (allIdentical || allZero)
      return { status: "warning", message: `All values in "${yAxisKey}" are identical, so every slice is the same size. The chart renders but carries no meaningful insight.` };
    return { status: "valid", message: "" };
  }

  // Bar / Line / Area
  if (numericRatio === 0) {
    const sample        = yValues.find((v) => v !== "") ?? "";
    const looksLikeDate = /^\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}$/.test(sample);
    const looksLikeText = isNaN(parseFloat(sample)) && sample !== "";
    const hint = looksLikeDate
      ? `"${yAxisKey}" appears to contain dates, which can't be plotted as a number.`
      : looksLikeText
      ? `"${yAxisKey}" contains text, not numbers.`
      : `"${yAxisKey}" has no numeric values.`;
    return { status: "invalid", message: `${hint} Select a numeric column (e.g. Sales, Count, Amount) as the Value to render this chart.` };
  }

  if (numericRatio < 0.5)
    return { status: "warning", message: `Only ${Math.round(numericRatio * 100)}% of values in "${yAxisKey}" are numeric — the chart may look incomplete or misleading. Consider choosing a more consistently numeric column.` };
  if (allZero)
    return { status: "warning", message: `All values in "${yAxisKey}" are zero. The chart will render as a flat baseline with no visual information.` };
  if (allIdentical)
    return { status: "warning", message: `All values in "${yAxisKey}" are identical (${parsedNums[0]}). The chart renders but shows no meaningful variation.` };
  if ((type === "line" || type === "area") && rowData.length < 3)
    return { status: "warning", message: `Line and Area charts need at least 3 data points to show a meaningful trend. This sheet only has ${rowData.length} row${rowData.length === 1 ? "" : "s"}.` };

  return { status: "valid", message: "" };
}

// ─── Quick per-button badge check ─────────────────────────────────────────────

export function quickValidate(
  type: ChartType,
  rowData: Record<string, string>[],
  yAxisKey: string,
): Validity {
  if (rowData.length === 0) return "invalid";
  const yValues     = rowData.map((r) => r?.[yAxisKey] ?? "");
  const numericVals = yValues.filter((v) => v !== "" && !isNaN(parseFloat(v)));
  const ratio       = numericVals.length / yValues.length;
  if (ratio === 0)                              return "invalid";
  if (ratio < 0.5)                              return "warning";
  if (type === "pie" && rowData.length > 12)    return "warning";
  return "valid";
}

// ─── Badge UI tokens ──────────────────────────────────────────────────────────

export const BADGE: Record<Validity, { dot: string }> = {
  valid:   { dot: ""                          },
  warning: { dot: "bg-amber-400 text-white"   },
  invalid: { dot: "bg-red-500   text-white"   },
};
