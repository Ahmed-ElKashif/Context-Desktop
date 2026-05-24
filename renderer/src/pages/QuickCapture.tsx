import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { uploadTextDocument, uploadBatchDocuments } from "../store/documentSlice";
import { Icon } from "../components/ui/Icons";
import toast from "react-hot-toast";

export default function QuickCapture() {
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);

  // Close the window on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const electronAPI = (window as any).electronAPI;
        electronAPI?.window?.closeQuickCapture();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClose = () => {
    const electronAPI = (window as any).electronAPI;
    electronAPI?.window?.closeQuickCapture();
  };

  const processUpload = async (action: any) => {
    setIsUploading(true);
    try {
      await dispatch(action).unwrap();
      toast.success("Captured successfully!");
      // Wait for toast then close
      setTimeout(handleClose, 750);
    } catch (e) {
      toast.error("Failed to capture");
      setIsUploading(false);
    }
  };

  // Handle Paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text");
      if (text) {
        e.preventDefault();
        await processUpload(uploadTextDocument({ text, title: "Quick Capture" }));
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [dispatch]);

  // Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const electronAPI = (window as any).electronAPI;
      let paths: string[] = [];

      // Extract raw paths from Electron File object
      if (electronAPI) {
        paths = filesArray.map((f: any) => f.path).filter(Boolean);
      }

      await processUpload(uploadBatchDocuments({ files: filesArray, clientPaths: paths }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="w-screen h-screen bg-[#1E1E22]/90 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden rounded-xl text-white select-none app-region-drag"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Top right close button */}
      <button 
        onClick={handleClose}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors app-region-no-drag"
      >
        <Icon name="close" className="text-xl text-white/50 hover:text-white" />
      </button>

      {isUploading ? (
        <div className="flex flex-col items-center animate-in fade-in zoom-in">
          <Icon name="sync" className="text-4xl text-dark-primary animate-spin mb-4" />
          <h2 className="text-lg font-bold">Uploading...</h2>
        </div>
      ) : (
        <div className="flex flex-col items-center pointer-events-none">
          <div className="w-16 h-16 bg-dark-primary/20 rounded-full flex items-center justify-center mb-4 border border-dark-primary/30">
            <Icon name="bolt" className="text-3xl text-dark-primary" />
          </div>
          <h2 className="text-xl font-bold mb-1">Quick Capture</h2>
          <p className="text-sm text-white/50 text-center max-w-[250px]">
            Paste text (<kbd className="font-mono text-xs">Ctrl+V</kbd>) or drag & drop files here.
          </p>
        </div>
      )}
    </div>
  );
}
