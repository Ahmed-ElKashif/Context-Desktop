import React, { useState, useEffect } from "react";
import { Icon } from "../../../../../components/ui/Icons";
import { useAppSelector } from "../../../../../store/hooks";

interface BatchFile {
  name: string;
  path: string;
  clientPath: string;
  mimeType: string;
  size: number;
}

interface BatchIngestionViewProps {
  folderPath: string;
  files: BatchFile[];
  onBack: () => void;
  onSuccess: () => void;
}

export const BatchIngestionView: React.FC<BatchIngestionViewProps> = ({
  folderPath,
  files,
  onBack,
  onSuccess,
}) => {
  const token = useAppSelector((state: any) => state.auth.token);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(
    new Set(files.map((f) => f.path))
  );

  const [isIngesting, setIsIngesting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState<
    Record<string, { status: "pending" | "success" | "failed"; error?: string }>
  >({});

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.localFiles?.onBatchProgress) return;

    const handleProgress = (_event: any, data: { fileId: string; status: "success" | "failed"; error?: string }) => {
      setProgress((prev) => ({
        ...prev,
        [data.fileId]: { status: data.status, error: data.error },
      }));
    };

    electronAPI.localFiles.onBatchProgress(handleProgress);
    return () => {
      electronAPI.localFiles.offBatchProgress(handleProgress);
    };
  }, []);

  useEffect(() => {
    if (!isIngesting || isComplete) return;

    // Check if all selected files have a terminal status
    const allDone = Array.from(selectedPaths).every(
      (path) => progress[path]?.status === "success" || progress[path]?.status === "failed"
    );

    if (allDone && selectedPaths.size > 0) {
      setIsComplete(true);
      setIsIngesting(false);
    }
  }, [progress, isIngesting, isComplete, selectedPaths]);

  const handleToggle = (path: string) => {
    if (isIngesting || isComplete) return;
    const newSet = new Set(selectedPaths);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setSelectedPaths(newSet);
  };

  const handleIngest = async () => {
    if (selectedPaths.size === 0) return;
    setIsIngesting(true);
    const filesToUpload = files.filter((f) => selectedPaths.has(f.path));
    
    // Initialize progress state for selected files
    const initialProgress: Record<string, any> = {};
    filesToUpload.forEach(f => {
      initialProgress[f.path] = { status: "pending" };
    });
    setProgress(initialProgress);

    const electronAPI = (window as any).electronAPI;
    if (electronAPI) {
      const apiUrl = import.meta.env.VITE_API_URL || "https://context-sfs.up.railway.app/api";
      await electronAPI.localFiles.startBatchIngest({
        token,
        apiUrl,
        files: filesToUpload,
      });
    }
  };

  const succeededCount = Object.values(progress).filter((p) => p.status === "success").length;
  const failedCount = Object.values(progress).filter((p) => p.status === "failed").length;

  return (
    <div className="w-full flex flex-col h-[500px] animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-white/10 shrink-0 bg-light-bg/50 dark:bg-white/[0.02]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 flex items-center justify-center">
            <Icon name="folder_open" className="text-xl text-light-primary dark:text-dark-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-light-text dark:text-white leading-tight truncate max-w-xs">
              {folderPath.split(/[/\\]/).pop()}
            </h2>
            <p className="text-xs text-light-text/60 dark:text-white/50 truncate max-w-xs" title={folderPath}>
              {folderPath}
            </p>
          </div>
        </div>
        {!isIngesting && !isComplete && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Icon name="close" className="text-xl text-light-text/70 dark:text-white/70" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-black/5 dark:bg-black/20">
        {files.map((file) => {
          const isSelected = selectedPaths.has(file.path);
          const fileProgress = progress[file.path];
          
          return (
            <div
              key={file.path}
              onClick={() => handleToggle(file.path)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isSelected
                  ? "bg-white dark:bg-white/5 border-light-primary/30 dark:border-dark-primary/30"
                  : "bg-white/50 dark:bg-white/[0.02] border-transparent opacity-60 hover:opacity-100 cursor-pointer"
              } ${isIngesting || isComplete ? "pointer-events-none" : ""}`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-light-primary dark:bg-dark-primary border-transparent"
                      : "border-light-text/20 dark:border-white/20"
                  }`}
                >
                  {isSelected && <Icon name="check" className="text-sm text-white dark:text-black font-bold" />}
                </div>
                <Icon name="description" className="text-light-text/40 dark:text-white/30 text-lg shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-light-text dark:text-white truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-light-text/50 dark:text-white/40 truncate">
                    {file.clientPath}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              {isSelected && fileProgress && (
                <div className="flex items-center shrink-0 ml-4">
                  {fileProgress.status === "pending" && (
                    <Icon name="sync" className="text-light-primary dark:text-dark-primary animate-spin" />
                  )}
                  {fileProgress.status === "success" && (
                    <Icon name="check_circle" className="text-green-500" />
                  )}
                  {fileProgress.status === "failed" && (
                    <div title={fileProgress.error}>
                      <Icon name="error" className="text-red-500" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-light-bg dark:bg-black/40 border-t border-light-border dark:border-white/10 shrink-0">
        {isComplete ? (
          <div className="flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex space-x-6">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-green-500">{succeededCount}</span>
                <span className="text-xs text-light-text/60 dark:text-white/50 uppercase tracking-wider font-semibold">Succeeded</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-red-500">{failedCount}</span>
                <span className="text-xs text-light-text/60 dark:text-white/50 uppercase tracking-wider font-semibold">Failed</span>
              </div>
            </div>
            <button
              onClick={onSuccess}
              className="px-6 py-2.5 bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-light-text/70 dark:text-white/70">
              <span className="font-bold text-light-text dark:text-white">{selectedPaths.size}</span> / {files.length} selected
            </div>
            <button
              onClick={handleIngest}
              disabled={isIngesting || selectedPaths.size === 0}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
                isIngesting || selectedPaths.size === 0
                  ? "bg-light-text/10 dark:bg-white/10 text-light-text/40 dark:text-white/40 cursor-not-allowed"
                  : "bg-light-primary dark:bg-dark-primary text-white dark:text-black shadow-lg shadow-light-primary/20 dark:shadow-dark-primary/20 hover:-translate-y-0.5"
              }`}
            >
              {isIngesting ? (
                <>
                  <Icon name="sync" className="animate-spin text-lg" />
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <Icon name="upload" className="text-lg" />
                  <span>Ingest Selected</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
