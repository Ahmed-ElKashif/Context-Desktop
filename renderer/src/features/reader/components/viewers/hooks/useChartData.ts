import { useMemo } from "react";
import { isDateColumn, toTimestamp } from "../charts/chartTypes";
import { PieSlice } from "../charts/PieChartView";
import { ColDef } from "./useExcelData";

export const useChartData = (
  rowData: Record<string, string>[],
  columnDefs: ColDef[],
  xAxisKey: string,
  yAxisKey: string
) => {
  const yIsDate = useMemo(
    () => isDateColumn(rowData, yAxisKey),
    [rowData, yAxisKey]
  );

  const chartData = useMemo(
    () =>
      rowData.slice(0, 30).map((r) => {
        if (!r) return {};
        return {
          ...r,
          [yAxisKey]: yIsDate
            ? toTimestamp(r[yAxisKey])
            : parseFloat(r[yAxisKey]) || 0,
        };
      }),
    [rowData, yAxisKey, yIsDate]
  );

  const pieData = useMemo<PieSlice[]>(
    () =>
      rowData.slice(0, 30).map((r, i) => {
        if (!r) return { name: `Row ${i + 1}`, rawValue: "", value: 0 };
        return {
          name: String(r[xAxisKey] ?? `Row ${i + 1}`).slice(0, 20),
          rawValue: r[yAxisKey] ?? "",
          value: yIsDate
            ? toTimestamp(r[yAxisKey])
            : parseFloat(r[yAxisKey]) || 0,
        };
      }),
    [rowData, xAxisKey, yAxisKey, yIsDate]
  );

  const numericColumns = useMemo(
    () =>
      columnDefs.filter((c) =>
        rowData.some(
          (r) => r && !isNaN(parseFloat(r[c.field])) && r[c.field] !== ""
        )
      ),
    [columnDefs, rowData]
  );

  return { yIsDate, chartData, pieData, numericColumns };
};
