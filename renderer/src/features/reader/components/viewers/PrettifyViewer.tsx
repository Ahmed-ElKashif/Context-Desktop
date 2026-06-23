import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Icon } from "../../../../components/ui/core/Icons";
import { DocumentData } from "../../../../store/library/librarySlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  prettifyDocumentThunk,
  clearPrettifyError,
} from "../../../../store/workspace/prettifySlice";
import {
  type PrettifyResult,
  type DocumentPrettifyResult,
} from "../../../../services/prettify.service";

import { PrettifyExcelView } from "./PrettifyExcelView";
import { PrettifyDocumentView } from "./PrettifyDocumentView";

// ── Refactored Hooks & Components ─────────────────────────────────────────────
import { computeCapacity, getCapacityColor } from "./utils/capacityChecks";
import { usePrettifyDownloads } from "./hooks/usePrettifyDownloads";
import { PrettifyErrorState } from "./components/PrettifyErrorState";

type ViewerState = "initial" | "loading" | "error" | "result";

interface PrettifyViewerProps {
  document: DocumentData;
}

export const PrettifyViewer = ({ document: doc }: PrettifyViewerProps) => {
  const dispatch = useAppDispatch();
  const {
    isPrettifying,
    error: reduxError,
    limitError: reduxLimitError,
  } = useAppSelector((state) => state.prettify);

  const hasCachedResult = doc.prettifiedJson && typeof doc.prettifiedJson === "object";

  const [state, setState] = useState<ViewerState>(hasCachedResult ? "result" : "initial");
  const [result, setResult] = useState<PrettifyResult | null>(
    hasCachedResult ? (doc.prettifiedJson as PrettifyResult) : null
  );
  const [previousResult, setPreviousResult] = useState<PrettifyResult | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);

  // Sync Redux states to local component state
  useEffect(() => {
    if (isPrettifying) {
        setState("loading");
    } else if (reduxLimitError || reduxError) {
        setState("error");
    } else if (result) {
        setState("result");
    } else {
        setState("initial");
    }
  }, [isPrettifying, reduxLimitError, reduxError, result]);

  // Capacity check
  const capacity = useMemo(() => computeCapacity(doc), [doc]);

  // Check for cached result on mount or when doc updates
  useEffect(() => {
    if (doc.prettifiedJson && typeof doc.prettifiedJson === "object") {
      setResult(doc.prettifiedJson as PrettifyResult);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [doc.prettifiedJson, doc._id]);

  // ── Prettify action ──────────────────────────────────────────────────────
  const handlePrettify = useCallback(
    async (force = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (result) {
        setPreviousResult(result);
      }

      dispatch(clearPrettifyError());

      try {
        const unwrappedResult = await dispatch(
          prettifyDocumentThunk({ documentId: doc._id, force })
        ).unwrap();

        setResult(unwrappedResult.result);
        setPreviousResult(null);
      } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        if (
          err?.name === "CanceledError" ||
          err?.message === "canceled" ||
          err === "canceled"
        ) {
          return;
        }
      }
    },
    [doc._id, dispatch, result]
  );

  const {
    isDownloading,
    copied,
    handleDownloadExcel,
    handleDownloadDocx,
    handleCopyText,
    handleDownloadMarkdown,
  } = usePrettifyDownloads(result, doc);

  const restorePrevious = useCallback(() => {
    setResult(previousResult);
    setState("result");
    setPreviousResult(null);
  }, [previousResult]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Initial CTA
  // ═══════════════════════════════════════════════════════════════════════════
  if (state === "initial") {
    // ── AI Status Guard ─────────────────────────────────────────────────────
    if (doc.aiStatus !== "Analyzed") {
      const isFailed = doc.aiStatus === "Failed";
      return (
        <div className="flex-1 min-h-0 w-full h-full flex flex-col items-center justify-center gap-6 p-8">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg border ${
            isFailed 
              ? "bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20" 
              : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20"
          }`}>
            <Icon
              name={isFailed ? "error_outline" : "hourglass_empty"}
              className={`text-[40px] ${
                isFailed ? "text-red-500" : "text-amber-500 animate-pulse"
              }`}
            />
          </div>

          <div className="text-center max-w-md">
            <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
              {isFailed ? "Analysis Failed" : "Analysis in Progress"}
            </h3>
            <p className="text-sm text-light-text/60 dark:text-white/50 leading-relaxed">
              {isFailed
                ? "Analysis of this document encountered an error. Please click the Reanalyze button in the document header to try again."
                : "The Neural Cortex is still analyzing this document. Prettify will be available once the analysis is complete."}
            </p>
          </div>
        </div>
      );
    }

    const cap = capacity;
    const capColor = cap
      ? getCapacityColor(cap.percentage, cap.isOverLimit)
      : null;

    return (
      <div className="flex-1 min-h-0 w-full h-full flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-light-primary/10 to-light-accent/10 dark:from-dark-primary/10 dark:to-dark-secondary/10 flex items-center justify-center shadow-lg border border-light-primary/20 dark:border-dark-primary/20">
          <Icon
            name="auto_awesome"
            className="text-[40px] text-light-primary dark:text-dark-primary"
          />
        </div>

        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
            Prettify this Document
          </h3>
          <p className="text-sm text-light-text/60 dark:text-white/50 leading-relaxed">
            AI will prettify and structure your content into a clean, readable
            format — ready to preview and download.
          </p>
        </div>

        <button
          onClick={() => handlePrettify(false)}
          disabled={cap?.isOverLimit}
          className={`px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2.5 shadow-lg transition-all cursor-pointer ${
            cap?.isOverLimit
              ? "bg-light-border dark:bg-white/10 text-light-text/40 dark:text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-secondary text-white shadow-light-primary/25 hover:shadow-light-primary/40 dark:shadow-dark-primary/25 dark:hover:shadow-dark-primary/40 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          <Icon name="auto_awesome" className="text-[18px]" />
          Prettify ✨
        </button>

        {cap && capColor && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${capColor.bg} ${capColor.text}`}
          >
            <span>{capColor.icon}</span>
            <span>{cap.label}</span>
            <span className="font-mono">({cap.percentage}%)</span>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Loading
  // ═══════════════════════════════════════════════════════════════════════════
  if (state === "loading") {
    return (
      <div className="flex-1 min-h-0 w-full h-full flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-light-primary/10 to-light-accent/10 dark:from-dark-primary/10 dark:to-dark-secondary/10 flex items-center justify-center shadow-lg border border-light-primary/20 dark:border-dark-primary/20 animate-pulse">
          <Icon
            name="sync"
            className="text-[36px] text-light-primary dark:text-dark-primary animate-spin"
          />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-1">
            Prettifying your document…
          </h3>
          <p className="text-sm text-light-text/50 dark:text-white/40">
            AI is structuring your content. This usually takes 10–20 seconds.
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-light-primary dark:bg-dark-primary animate-pulse"
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Error
  // ═══════════════════════════════════════════════════════════════════════════
  if (state === "error") {
    return (
      <PrettifyErrorState
        reduxLimitError={reduxLimitError}
        reduxError={reduxError}
        handlePrettify={handlePrettify}
        previousResult={previousResult}
        restorePrevious={restorePrevious}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Result
  // ═══════════════════════════════════════════════════════════════════════════
  if (!result) return null;

  if (result.type === "spreadsheet") {
    return (
      <PrettifyExcelView
        result={result}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        handlePrettify={handlePrettify}
        handleDownloadExcel={handleDownloadExcel}
        isDownloading={isDownloading}
      />
    );
  }

  const docResult = result as DocumentPrettifyResult;
  const isSnippet = doc.fileType === "TextSnippet";

  return (
    <PrettifyDocumentView
      result={docResult}
      isSnippet={isSnippet}
      handlePrettify={handlePrettify}
      handleCopyText={handleCopyText}
      handleDownloadMarkdown={handleDownloadMarkdown}
      handleDownloadDocx={handleDownloadDocx}
      isDownloading={isDownloading}
      copied={copied}
    />
  );
};
