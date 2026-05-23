import { notify } from "../../../components/ui/ToastEngine";
import { DocumentData } from "../../../store/documentSlice";
import { ComparisonResponse } from "../api/comparisonService";

export const exportComparisonReport = (
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

  const blob = new Blob([reportContent], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `comparison-report-${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
