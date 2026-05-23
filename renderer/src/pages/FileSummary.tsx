import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DocumentData } from "../store/documentSlice";
import { documentService } from "../features/dashboard/api/documentService";
import { ExecutiveSummary } from "../features/dashboard/components/populated/ExecutiveSummary";
import { Button } from "@/components/ui/Button";
import { Icon } from "../components/ui/Icons";

const getLoadColor = (load?: string) => {
  switch (load?.toLowerCase()) {
    case "low":
      return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    case "medium":
      return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    case "high":
      return "bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]";
    default:
      return "bg-gray-500";
  }
};

export const FileSummary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No document ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Using documentService.getDocument to fetch the detailed file data from DB
        const data = await documentService.getDocument(id);
        setDocument(data);
      } catch (err: any) {
        console.error("Failed to fetch document summary:", err);
        setError("Failed to retrieve document summary. It may still be processing.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-light-bg dark:bg-black p-6">
        <div className="text-center max-w-md bg-white dark:bg-[#0A0A0C] p-8 rounded-2xl border border-light-border dark:border-white/10 shadow-xl">
          <Icon name="error_outline" className="text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-light-text dark:text-white mb-2">Error</h2>
          <p className="text-light-text/70 dark:text-white/70 mb-6">{error}</p>
          <Button onClick={() => navigate("/")} className="w-full">
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !document) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-light-bg dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-primary dark:border-dark-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-light-text dark:text-white">Analyzing Document...</h2>
          <p className="text-light-text/70 dark:text-white/50 mt-2">Extracting key insights and cognitive load metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-light-bg dark:bg-[#050505] p-6 lg:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-light-primary/10 dark:bg-dark-primary/10 rounded-xl">
              <Icon name="insert_drive_file" className="text-3xl text-light-primary dark:text-dark-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-light-text dark:text-white leading-tight mb-2">
                {document.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Cognitive Load Badge */}
                <div className="flex items-center gap-2 bg-light-bg dark:bg-white/5 px-3 py-1 rounded-full border border-light-border dark:border-white/10">
                  <div className={`w-2 h-2 rounded-full ${getLoadColor(document.cognitiveLoad)} animate-pulse-slow`} />
                  <span className="text-xs font-bold text-light-text dark:text-white">
                    {document.cognitiveLoad || "Unknown"} Load
                  </span>
                </div>

                {/* Tags */}
                {document.tags && document.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs font-semibold px-2 py-1 bg-light-bg dark:bg-white/5 text-light-text/70 dark:text-white/70 rounded-md border border-light-border dark:border-white/10">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:flex-none"
              onClick={() => navigate("/")} // Already saved to library implicitly by uploading
            >
              <Icon name="check" className="mr-2" />
              Save to Library
            </Button>
            <Button
              className="flex-1 md:flex-none bg-light-primary dark:bg-dark-primary text-white dark:text-black"
              onClick={() => navigate(`/read/${document._id}`)}
            >
              <Icon name="menu_book" className="mr-2" />
              Read Mode
            </Button>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="flex-1 min-h-[400px]">
          <ExecutiveSummary activeDocument={document} />
        </div>

      </div>
    </div>
  );
};
