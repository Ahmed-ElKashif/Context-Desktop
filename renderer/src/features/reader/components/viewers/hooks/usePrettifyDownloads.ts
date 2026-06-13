import { useState, useCallback } from "react";
import { PrettifyResult } from "../../../../../services/prettify.service";
import {
  convertToExcel,
  convertToDocx,
  convertToPlainText,
  downloadBlob,
} from "../../../utils/prettify-converters";
import { notify } from "../../../../../components/ui/feedback/ToastEngine";

export const usePrettifyDownloads = (
  result: PrettifyResult | null,
  docTitle: string,
) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadExcel = useCallback(async () => {
    if (!result || result.type !== "spreadsheet") return;
    setIsDownloading(true);
    try {
      const blob = await convertToExcel(result);
      const title = docTitle.replace(/\.[^/.]+$/, "");
      downloadBlob(blob, `${title} — Prettified.xlsx`);
      notify("Your prettified Excel is ready.", "success");
    } catch {
      notify("Failed to generate Excel file.", "error");
    } finally {
      setIsDownloading(false);
    }
  }, [result, docTitle]);

  const handleDownloadDocx = useCallback(async () => {
    if (!result || result.type !== "document") return;
    setIsDownloading(true);
    try {
      const blob = await convertToDocx(result);
      const title = docTitle.replace(/\.[^/.]+$/, "");
      downloadBlob(blob, `${title} — Prettified.docx`);
      notify("Your prettified document is ready.", "success");
    } catch {
      notify("Failed to generate Word file.", "error");
    } finally {
      setIsDownloading(false);
    }
  }, [result, docTitle]);

  const handleCopyText = useCallback(async () => {
    if (!result || result.type !== "document") return;
    const text = convertToPlainText(result);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    notify("Text copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleDownloadText = useCallback(() => {
    if (!result || result.type !== "document") return;
    const text = convertToPlainText(result);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const title = docTitle.replace(/\.[^/.]+$/, "");
    downloadBlob(blob, `${title} — Prettified.txt`);
    notify("Text file downloaded.", "success");
  }, [result, docTitle]);

  return {
    isDownloading,
    copied,
    handleDownloadExcel,
    handleDownloadDocx,
    handleCopyText,
    handleDownloadText,
  };
};
