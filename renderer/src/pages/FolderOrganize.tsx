import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AISplitScreenView } from "../features/library/components/upload-modal/views/AISplitScreenView";
import { DocumentData, SemanticUpdate } from "../store/documentSlice";
import { documentService } from "../features/dashboard/api/documentService";
import { notify } from "../components/ui/ToastEngine";

export const FolderOrganize = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const path = searchParams.get("path");

  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [documentsList, setDocumentsList] = useState<DocumentData[]>([]);
  const [proposedUpdates, setProposedUpdates] = useState<SemanticUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setError("No folder path provided.");
      setIsLoading(false);
      return;
    }

    const organizeLocalFolder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Read the local directory via IPC
        const files = await (window as any).electronAPI.localFiles.readDir(path);
        
        if (files.length === 0) {
          setError("This folder is empty or contains no valid files.");
          setIsLoading(false);
          return;
        }

        // 2. Map to mock documents
        const mockDocuments = files.map((f: any) => ({
          _id: f.name,
          title: f.name,
          originalClientPath: f.name, // Display original path correctly in AISplitScreenView
        }));
        
        setDocumentsList(mockDocuments);

        // 3. Send to backend AI to organize
        const response = await documentService.generateFolderStructure({ documents: mockDocuments });
        setProposedUpdates(response.data.updates);

      } catch (err: any) {
        console.error("Local organize error:", err);
        setError(err.message || "Failed to organize folder.");
      } finally {
        setIsLoading(false);
      }
    };

    organizeLocalFolder();
  }, [path]);

  const handleAcceptAI = async () => {
    if (!path || proposedUpdates.length === 0) return;
    
    try {
      setIsApplying(true);
      // 4. Send proposed updates back to the Main Process to execute native fs operations
      await (window as any).electronAPI.localFiles.apply(path, proposedUpdates);
      notify("Folder organized successfully!", "success");
      navigate("/");
    } catch (err: any) {
      console.error("Apply error:", err);
      notify(err.message || "Failed to apply changes to the filesystem.", "error");
    } finally {
      setIsApplying(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-light-bg dark:bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-light-text dark:text-white/70 mb-6">{error}</p>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-light-primary text-white rounded-lg hover:bg-light-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-light-bg dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-light-text dark:text-white">Analyzing Folder...</h2>
          <p className="text-light-text/70 dark:text-white/50">Our AI is reading your local files and structuring them logically.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black/50 p-6 overflow-hidden">
      <AISplitScreenView
        proposedFolderUpdates={proposedUpdates}
        documentsList={documentsList}
        globalFolderTree={[]} // Empty because this is local, no MongoDB folders
        isApplyingFolders={isApplying}
        handleAcceptAI={handleAcceptAI}
        handleClose={handleClose}
      />
    </div>
  );
};
