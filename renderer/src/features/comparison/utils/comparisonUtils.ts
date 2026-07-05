import { notify } from "../../../components/ui/feedback/ToastEngine";
import { DocumentData } from "../../../store/library/librarySlice";
import { ComparisonResponse } from "../api/comparisonService";
import { convertToDocx } from "../../reader/utils/docx-converter";
import { DocumentPrettifyResult } from "../../../services/prettify.service";

export const exportComparisonReport = async (
  baseDoc: DocumentData | null,
  compareDoc: DocumentData | null,
  comparisonData: ComparisonResponse | null,
  reportName: string
) => {
  if (!baseDoc || !compareDoc || !comparisonData?.comparison) {
    notify("No comparison data available to export.", "error");
    return;
  }

  const { synthesis, similarities, uniqueToA, uniqueToB } = comparisonData.comparison;

  try {
    const maxRows = Math.max(uniqueToA.length, similarities.length, uniqueToB.length);
    const tableRows: string[][] = [];
    
    for (let i = 0; i < maxRows; i++) {
      tableRows.push([
        uniqueToA[i] ? `• ${uniqueToA[i]}` : "",
        similarities[i] ? `• ${similarities[i]}` : "",
        uniqueToB[i] ? `• ${uniqueToB[i]}` : ""
      ]);
    }

    const payload: DocumentPrettifyResult = {
      type: "document",
      language: "en",
      direction: "ltr",
      blocks: [
        { type: "heading", level: 1, text: reportName },
        { type: "heading", level: 2, text: "AI Synthesis" },
        { type: "paragraph", text: synthesis },
        { type: "divider" },
        { type: "heading", level: 2, text: "Comparison Board" },
        { 
          type: "table", 
          headers: [`Unique to ${baseDoc.title}`, "Shared Concepts", `Unique to ${compareDoc.title}`], 
          rows: tableRows 
        }
      ]
    };

    const blob = await convertToDocx(payload);
    const url = URL.createObjectURL(blob);

    const safeName = reportName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.docx`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate DOCX:", error);
    notify("Failed to export DOCX report.", "error");
  }
};
