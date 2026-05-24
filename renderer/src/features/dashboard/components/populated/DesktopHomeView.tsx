import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../../store/hooks";
import { setActiveDocument } from "../../../../store/documentSlice";
import { Icon } from "../../../../components/ui/Icons";
import { BatchIngestionView } from "../../../library/components/upload-modal/views/BatchIngestionView";

const timeAgo = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const DesktopHomeView = () => {
  const dispatch = useAppDispatch();
  const { documentsList } = useAppSelector((state) => state.document);
  const { user } = useAppSelector((state) => state.auth);

  const [batchFolderPath, setBatchFolderPath] = useState<string | null>(null);
  const [batchFiles, setBatchFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handlePathsDropped = async (paths: string[]) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.localFiles?.processDroppedPaths) {
      try {
        const result = await electronAPI.localFiles.processDroppedPaths(paths);
        if (result && result.files && result.files.length > 0) {
          setBatchFolderPath("Dropped Context");
          setBatchFiles(result.files);
        }
      } catch (err) {
        console.error("Failed to process dropped paths natively:", err);
      }
    }
  };

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.localFiles?.onFilesDropped) {
      return electronAPI.localFiles.onFilesDropped((paths: string[]) => {
        handlePathsDropped(paths);
      });
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const paths = Array.from(e.dataTransfer.files)
      .map((f: any) => f.path)
      .filter(Boolean);
    if (paths.length > 0) {
      handlePathsDropped(paths);
    }
  };

  // Grab the 5 most recent files
  const recentFiles = [...documentsList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const [fileIcons, setFileIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchIcons = async () => {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.localFiles?.getFileIcon) return;

      const newIcons: Record<string, string> = {};
      for (const file of recentFiles) {
        if (file.originalClientPath && !fileIcons[file._id]) {
          try {
            const dataUrl = await electronAPI.localFiles.getFileIcon(file.originalClientPath);
            if (dataUrl) {
              newIcons[file._id] = dataUrl;
            }
          } catch (e) {
            console.error("Failed to load native icon for", file.title);
          }
        }
      }
      if (Object.keys(newIcons).length > 0) {
        setFileIcons(prev => ({ ...prev, ...newIcons }));
      }
    };

    fetchIcons();
  }, [recentFiles]);

  const focusCards = [
    { title: "Analyze Q3 Earnings", icon: "monitoring", color: "bg-blue-500/10 text-blue-500", desc: "Synthesize latest financial data." },
    { title: "Compare Invoices", icon: "difference", color: "bg-purple-500/10 text-purple-500", desc: "Cross-reference vendor billing." },
    { title: "Review Contract", icon: "gavel", color: "bg-emerald-500/10 text-emerald-500", desc: "Extract legal obligations." },
  ];

  return (
    <div 
      className="flex-1 flex flex-col h-full w-full relative overflow-y-auto animate-in fade-in zoom-in-95 duration-500"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-[1280px] mx-auto w-full p-8 lg:p-12 pb-24 flex-1 flex flex-col">
        
        {/* Welcome Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-black text-light-text dark:text-white tracking-tight mb-2">
            Welcome back, {(user as any)?.firstName || (user as any)?.name || "Explorer"}
          </h1>
          <p className="text-light-text/60 dark:text-white/60 text-lg">
            What would you like to focus on today?
          </p>
        </header>

        {/* 1280px Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Hero: Suggested Focus */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="auto_awesome" className="text-light-primary dark:text-dark-primary" />
              Suggested Focus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusCards.map((card, i) => (
                <button 
                  key={i} 
                  className="group flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-white/5 border border-light-border dark:border-white/10 hover:border-light-primary/50 dark:hover:border-dark-primary/50 transition-all hover:shadow-lg text-left"
                >
                  <div className={`p-3 rounded-xl mb-4 ${card.color}`}>
                    <Icon name={card.icon} className="text-2xl" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-light-text/60 dark:text-white/50">
                    {card.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Recent Files */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="history" className="text-light-text/50 dark:text-white/50" />
              Recent Files
            </h2>
            <div className="flex flex-col gap-2">
              {recentFiles.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-light-border dark:border-white/10 text-center text-sm text-light-text/50 dark:text-white/50">
                  No recent files. Upload something!
                </div>
              ) : (
                recentFiles.map(file => (
                  <button 
                    key={file._id}
                    onClick={() => dispatch(setActiveDocument(file))}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-light-bg dark:hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-light-bg dark:bg-black/20 border border-light-border dark:border-white/5 overflow-hidden">
                      {fileIcons[file._id] ? (
                        <img src={fileIcons[file._id]} alt="icon" className="w-6 h-6 object-contain" />
                      ) : (
                        <Icon name="description" className="text-xl text-light-text/40 dark:text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                        {file.title}
                      </p>
                      <p className="text-xs text-light-text/50 dark:text-white/40 truncate">
                        {timeAgo(file.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcut Reference Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 px-6 py-3 rounded-full bg-white/80 dark:bg-[#1E1E22]/80 backdrop-blur-md border border-light-border dark:border-white/10 shadow-xl z-50">
        <div className="flex items-center gap-2 text-xs font-medium text-light-text/60 dark:text-white/60">
          <kbd className="px-2 py-1 rounded bg-light-bg dark:bg-black/40 border border-light-border dark:border-white/10 font-mono text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 rounded bg-light-bg dark:bg-black/40 border border-light-border dark:border-white/10 font-mono text-[10px]">U</kbd>
          <span className="ml-1">Upload</span>
        </div>
        <div className="w-px h-4 bg-light-border dark:bg-white/10"></div>
        <div className="flex items-center gap-2 text-xs font-medium text-light-text/60 dark:text-white/60">
          <kbd className="px-2 py-1 rounded bg-light-bg dark:bg-black/40 border border-light-border dark:border-white/10 font-mono text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 rounded bg-light-bg dark:bg-black/40 border border-light-border dark:border-white/10 font-mono text-[10px]">/</kbd>
          <span className="ml-1">Search</span>
        </div>
        <div className="w-px h-4 bg-light-border dark:bg-white/10"></div>
        <div className="flex items-center gap-2 text-xs font-medium text-light-text/60 dark:text-white/60">
          <kbd className="px-2 py-1 rounded bg-light-bg dark:bg-black/40 border border-light-border dark:border-white/10 font-mono text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 rounded bg-light-bg dark:bg-black/40 border border-light-border dark:border-white/10 font-mono text-[10px]">K</kbd>
          <span className="ml-1">Command</span>
        </div>
      </div>

      {/* Batch Ingestion Modal */}
      {batchFolderPath && batchFiles.length > 0 && (
        <div className="absolute inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-[#0A0A0C] rounded-2xl border border-light-border dark:border-white/10 shadow-xl overflow-hidden">
            <BatchIngestionView
              folderPath={batchFolderPath}
              files={batchFiles}
              onBack={() => { setBatchFolderPath(null); setBatchFiles([]); }}
              onSuccess={() => { setBatchFolderPath(null); setBatchFiles([]); }}
            />
          </div>
        </div>
      )}

      {/* Dragging Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[150] bg-light-primary/10 dark:bg-dark-primary/10 backdrop-blur-sm border-4 border-dashed border-light-primary dark:border-dark-primary rounded-2xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200 m-4">
           <Icon name="upload_file" className="text-6xl text-light-primary dark:text-dark-primary animate-bounce mb-4" />
           <h2 className="text-2xl font-bold text-light-primary dark:text-dark-primary shadow-sm">Drop files or folders to ingest</h2>
        </div>
      )}
    </div>
  );
};
