import { useState, useCallback } from "react";
import { PrettifyResult } from "../../../../../services/prettify.service";
import { DocumentData } from "../../../../../store/library/librarySlice";
import {
  convertToExcel,
  convertToDocx,
  convertToMarkdown,
  downloadBlob,
  formatMarkdownAsPlainText,
} from "../../../utils/prettify-converters";
import { notify } from "../../../../../components/ui/feedback/ToastEngine";

export const usePrettifyDownloads = (
  result: PrettifyResult | null,
  document: DocumentData,
) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadExcel = useCallback(async () => {
    if (!result || result.type !== "spreadsheet") return;
    setIsDownloading(true);
    try {
      const blob = await convertToExcel(result);
      const title = document.title.replace(/\.[^/.]+$/, "");
      downloadBlob(blob, `${title} — Prettified.xlsx`);
      notify("Your prettified Excel is ready.", "success");
    } catch {
      notify("Failed to generate Excel file.", "error");
    } finally {
      setIsDownloading(false);
    }
  }, [result, document.title]);

  const handleDownloadDocx = useCallback(async () => {
    if (!result || result.type !== "document") return;
    setIsDownloading(true);
    try {
      const blob = await convertToDocx(result);
      const title = document.title.replace(/\.[^/.]+$/, "");
      downloadBlob(blob, `${title} — Prettified.docx`);
      notify("Your prettified document is ready.", "success");
    } catch {
      notify("Failed to generate Word file.", "error");
    } finally {
      setIsDownloading(false);
    }
  }, [result, document.title]);

  const generateMarkdownString = useCallback((res: any) => {
    const dateStr = new Date(document.createdAt).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const tagsStr = (document.tags || []).map(t => `#${t.replace(/^#/, '')}`).join(" ");
    const loadStr = document.cognitiveLoad || "Unknown";
    
    const header = `# ${document.title}\n\n**Extracted Date:** ${dateStr}\n**Cognitive Load:** ${loadStr}\n${tagsStr ? `**Tags:** ${tagsStr}\n` : ''}\n---\n\n`;
    
    const body = convertToMarkdown(res);
    return header + body;
  }, [document]);

  const handleCopyText = useCallback(async () => {
    if (!result || result.type !== "document") return;
    const text = generateMarkdownString(result);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    notify("Markdown copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  }, [result, generateMarkdownString]);

  const handleDownloadMarkdown = useCallback(() => {
    if (!result || result.type !== "document") return;
    const text = generateMarkdownString(result);
    const plainText = formatMarkdownAsPlainText(text);
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const title = document.title.replace(/\.[^/.]+$/, "");
    downloadBlob(blob, `${title} — Prettified.txt`);
    notify("Text file downloaded.", "success");
  }, [result, document.title, generateMarkdownString]);

  return {
    isDownloading,
    copied,
    handleDownloadExcel,
    handleDownloadDocx,
    handleCopyText,
    handleDownloadMarkdown,
  };
};
