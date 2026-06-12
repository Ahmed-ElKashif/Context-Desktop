import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Icon } from "../../components/ui/core/Icons";
import { readerService } from ".";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setActiveDocument, clearActiveDocument } from "../../store/workspace/workspaceSlice";

// Imported Components
import { ReaderHeader } from "./components/ReaderHeader";
import { DocumentViewer } from "./components/DocumentViewer";
import { useReaderSSE } from "./hooks/useReaderSSE";

export function ReaderFeature() {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  // Pull the active document directly from Redux now!
  const activeDocument = useAppSelector(state => state.workspace.activeDocument);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Toggle for mobile

  useEffect(() => {
    const fetchDocumentAndFile = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // 1. Fetch Metadata
        const docData = await readerService.getDocumentDetails(id);

        // 2. Dispatch to Redux so the whole app knows!
        dispatch(setActiveDocument(docData));

        // 3. Use the Cloudinary URL directly! No more slow RAM-heavy Blobs.
        if (docData.fileType !== "TextSnippet" && docData.cloudinaryUrl) {
          setFileUrl(docData.cloudinaryUrl);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load document.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentAndFile();

    // Cleanup when leaving the reader
    return () => {
      dispatch(clearActiveDocument());
    };
  }, [id, dispatch]);

  // SSE: Real-time status updates instead of polling
  useReaderSSE(id, activeDocument?.aiStatus);
  if (error || (!id && !isLoading)) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-light-bg dark:bg-[#0A0A0C]">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <Icon name="error" className="text-red-500 text-[32px]" />
        </div>
        <h2 className="text-2xl font-bold text-light-text dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm font-medium text-light-text/70 dark:text-white/70 mb-6 max-w-md">{error}</p>
        <Link to="/workspace" className="flex items-center gap-2 px-5 py-2.5 bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
          <Icon name="arrow_back" className="text-[18px]" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  if (isLoading || !activeDocument) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-light-bg dark:bg-[#0A0A0C]">
        <Icon name="sync" className="text-light-primary dark:text-dark-primary text-[40px] animate-spin mb-4" />
        <h2 className="text-xl font-bold text-light-text dark:text-white">Decrypting File...</h2>
        <p className="text-sm text-light-text/70 dark:text-white/60 mt-2">Loading secure reading environment</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-light-bg dark:bg-[#0A0A0C] overflow-hidden">

      {/* 1. Header Component */}
      <ReaderHeader
        document={activeDocument}
        fileUrl={fileUrl}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden relative">

        {/* 2. Document Viewer Component */}
        <DocumentViewer
          document={activeDocument}
          fileUrl={fileUrl}
        />



      </div>
    </div>
  );
}
