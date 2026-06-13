import { notify } from "../../../components/ui/feedback/ToastEngine";
import { DocumentData } from "../../../store/library/librarySlice";
import { ComparisonResponse } from "../api/comparisonService";

export const exportComparisonReport = async (
  baseDoc: DocumentData | null,
  compareDoc: DocumentData | null,
  comparisonData: ComparisonResponse | null
) => {
  if (!baseDoc || !compareDoc || !comparisonData?.comparison) {
    notify("No comparison data available to export.", "error");
    return;
  }

  const { synthesis, similarities, uniqueToA, uniqueToB } = comparisonData.comparison;

  const reportContent = `# Comparison Report: ${baseDoc.title} vs ${compareDoc.title}

## AI Synthesis
${synthesis}

## Shared Concepts
${similarities.map((item) => `- ${item}`).join("\n")}

## Unique to ${baseDoc.title}
${uniqueToA.map((item) => `- ${item}`).join("\n")}

## Unique to ${compareDoc.title}
${uniqueToB.map((item) => `- ${item}`).join("\n")}
`;

  const defaultFilename = `comparison-report-${new Date().toISOString().split("T")[0]}.md`;

  if ((window as any).electronAPI?.localFiles?.saveComparisonReport) {
    try {
      const result = await (window as any).electronAPI.localFiles.saveComparisonReport(reportContent, defaultFilename);
      if (result.success) {
        notify("Report saved successfully!", "success");
      }
    } catch (e) {
      notify("Failed to save report natively.", "error");
    }
    return;
  }

  const blob = new Blob([reportContent], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = defaultFilename;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
