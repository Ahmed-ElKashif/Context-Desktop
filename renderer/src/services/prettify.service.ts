import { api } from "../lib/axios";

// ── Types matching the backend Zod schemas exactly ───────────────────────────

export interface ExcelPrettifyResult {
  type: "spreadsheet";
  language: string;
  direction: "rtl" | "ltr";
  sheets: Array<{
    name: string;
    headers: string[];
    rows: string[][];
  }>;
  metadata?: {
    detectedType: string;
    patterns: string[];
  };
}

export interface DocumentPrettifyResult {
  type: "document";
  language: string;
  direction: "rtl" | "ltr";
  sections: Array<{
    heading: string;
    level: 1 | 2 | 3 | 4 | 5;
    content?: string | null;
    bulletItems?: string[] | null;
    numberedItems?: string[] | null;
    /** @deprecated Legacy field from pre-enterprise schema. Treated as bullet items. */
    items?: string[] | null;
  }>;
  metadata?: {
    detectedType: string;
    patterns: string[];
  };
}

export type PrettifyResult = ExcelPrettifyResult | DocumentPrettifyResult;

export interface PrettifyLimitError {
  error: "PRETTIFY_LIMIT_EXCEEDED";
  fileType: string;
  limit: Record<string, number>;
  actual: Record<string, number>;
  message: string;
  suggestion: string;
}

// ── Type guard ───────────────────────────────────────────────────────────────

export const isPrettifyLimitError = (
  data: unknown
): data is PrettifyLimitError => {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as PrettifyLimitError).error === "PRETTIFY_LIMIT_EXCEEDED"
  );
};

// ── Service ──────────────────────────────────────────────────────────────────

export const prettifyService = {
  prettifyDocument: async (documentId: string, force: boolean = false, signal?: AbortSignal): Promise<PrettifyResult> => {
    const response = await api.post(`/prettify/${documentId}${force ? "?force=true" : ""}`, {}, { signal });
    return response.data.data;
  },
};
