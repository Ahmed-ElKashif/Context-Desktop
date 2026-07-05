import { useState, useEffect } from "react";
import Papa from "papaparse";

export interface SheetData {
  name: string;
  data: string;
}

const HighlightedCell = ({ text, query }: { text: string, query: string }) => {
  if (!query) return <span>{text}</span>;

  // Split by the query (case-insensitive) to highlight all occurrences
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark 
            key={i}
            className="search-highlight"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export interface ColDef {
  field: string;
  headerName: string;
  sortable: boolean;
  filter: boolean;
  resizable: boolean;
  flex: number;
  minWidth: number;
  editable: false;
  suppressMovable: boolean;
}

export const useExcelData = (extractedText: string, highlightQuery?: string) => {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState<number>(0);
  const [rowData, setRowData] = useState<Record<string, string>[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [xAxisKey, setXAxisKey] = useState<string>("");
  const [yAxisKey, setYAxisKey] = useState<string>("");

  // ── Parse sheets ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!extractedText) return;
    const parsed = extractedText
      .split("--- Sheet: ")
      .filter(Boolean)
      .map((s) => {
        const lines = s.split("\n");
        return {
          name: lines[0].replace(" ---", "").trim(),
          data: lines.slice(1).join("\n").trim(),
        };
      });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSheets(parsed);
    
    // Smart Sheet Routing: Find which tab contains the query
    let targetSheetIndex = 0;
    if (highlightQuery) {
      const query = highlightQuery.trim().toLowerCase();
      const foundIndex = parsed.findIndex(sheet => sheet.data.toLowerCase().includes(query));
      if (foundIndex !== -1) {
        targetSheetIndex = foundIndex;
      }
    }
    
    setActiveSheet(targetSheetIndex);
  }, [extractedText, highlightQuery]);

  // ── Parse active sheet ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sheets[activeSheet]?.data) return;
    Papa.parse<Record<string, string>>(sheets[activeSheet].data, {
      header: true,
      skipEmptyLines: true,
      worker: false,
      complete: (result) => {
        setRowData(result.data);
        if (!result.meta.fields) return;
        setColumnDefs(
          result.meta.fields.map((f) => ({
            field: f,
            headerName: f,
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 130,
            editable: false,
            suppressMovable: false,
            cellRenderer: (params: any) => {
              if (!params.value) return params.value;
              const text = params.value.toString();
              if (!highlightQuery) return text;

              const query = highlightQuery.trim().toLowerCase();
              if (!query) return text;

              return (
                <HighlightedCell 
                  text={text} 
                  query={query} 
                />
              );
            }
          }) as any),
        );
        const numeric = result.meta.fields.filter((f) =>
          result.data.some((r) => r && !isNaN(parseFloat(r[f])) && r[f] !== ""),
        );
        const labels = result.meta.fields.filter((f) => !numeric.includes(f));
        setXAxisKey(labels[0] ?? result.meta.fields[0]);
        setYAxisKey(
          numeric[0] ?? result.meta.fields[1] ?? result.meta.fields[0],
        );
      },
    });
  }, [sheets, activeSheet, highlightQuery]);

  return {
    sheets,
    activeSheet,
    setActiveSheet,
    rowData,
    columnDefs,
    xAxisKey,
    setXAxisKey,
    yAxisKey,
    setYAxisKey,
  };
};
