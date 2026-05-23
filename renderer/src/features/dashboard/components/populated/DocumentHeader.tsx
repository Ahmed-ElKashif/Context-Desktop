import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import navigation
import { useAppDispatch } from "../../../../store/hooks";
import {
  clearActiveDocument,
  DocumentData,
  deleteDocumentThunk,
} from "../../../../store/documentSlice";
import { Icon } from "../../../../components/ui/Icons";
import { notify } from "../../../../components/ui/ToastEngine"; // 2. Import your toast
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { handleShareClick } from "../../../library/utils/tableUtils";

import { getTagColorClass } from "../../../../lib/tagUtils";

export const DocumentHeader = ({
  activeDocument,
}: {
  activeDocument: DocumentData | null;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // Hook for routing
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Track delete loading state

  const getLoadColor = (load?: string) => {
    switch (load) {
      case "Heavy":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Light":
        return "bg-emerald-500";
      default:
        return "bg-blue-500";
    }
  };

  if (!activeDocument) return null;

  const analyzedTime = activeDocument.updatedAt
    ? new Date(activeDocument.updatedAt).toLocaleString("en-GB", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  // --- NEW ACTIONS --- //

  const handleShare = () => {
    handleShareClick(activeDocument.cloudinaryUrl);
  };

  const handleOpenReader = () => {
    // Navigates to the Reader page using the document's Mongo ID
    navigate(`/read/${activeDocument._id}`);
  };

  const executeDelete = async () => {
    if (!activeDocument) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteDocumentThunk(activeDocument._id)).unwrap();
      notify("Document permanently deleted.", "success");
      //eslint-disable-next-line
    } catch (error: any) {
      notify(error || "Failed to delete document.", "error");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false); // Close modal on fail so they can try again
    }
  };

  return (
    <>
      <div id="tour-doc-header" className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          {/* Breadcrumb Area */}
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-light-primary dark:text-dark-text/50 mb-2 uppercase tracking-widest">
            <button
              onClick={() => {
                dispatch(clearActiveDocument());
                navigate("/library");
              }}
              className="hover:text-light-text dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Icon name="arrow_back" className="text-[14px]" /> Library
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-light-text dark:text-white">
              Intelligence View
            </span>
          </div>

          {/* Title and Load Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-light-text dark:text-white truncate max-w-xl">
              {activeDocument.title}
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-dark-surface border border-light-border dark:border-white/5 rounded-md shadow-sm shrink-0">
              <span
                className={`w-2 h-2 rounded-full ${getLoadColor(activeDocument.cognitiveLoad)} animate-pulse-slow`}
              ></span>
              <span className="text-[10px] font-bold text-light-text/70 dark:text-white uppercase tracking-wider">
                {activeDocument.cognitiveLoad} Load
              </span>
            </div>
          </div>

          {/* Metadata and Tags */}
          <div className="flex items-center gap-2 mt-3 flex-wrap relative">
            <span className="text-xs font-mono font-semibold text-light-text/70 dark:text-dark-text/60 border-r border-light-border dark:border-white/10 pr-3">
              Analyzed {analyzedTime}
            </span>
            {activeDocument.tags && activeDocument.tags.length > 0 ? (
              <>
                {activeDocument.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono tracking-wide border border-transparent ${getTagColorClass(tag)}`}
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
                {activeDocument.tags.length > 5 && (
                  <div className="group relative">
                    <span 
                      tabIndex={0}
                      className="text-[10px] px-2 py-0.5 rounded font-bold font-mono tracking-wide bg-light-bg dark:bg-white/5 text-light-text/70 dark:text-white/60 border border-light-border dark:border-white/10 cursor-pointer hover:bg-light-primary/10 dark:hover:bg-white/10 transition-colors inline-block"
                    >
                      +{activeDocument.tags.length - 5}
                    </span>
                    <div className="absolute top-full left-0 z-50 hidden group-hover:flex group-focus-within:flex pt-2">
                      <div className="flex flex-wrap gap-2 w-max max-w-[250px] bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-lg p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                        {activeDocument.tags.slice(5).map((tag, index) => (
                          <span
                            key={index}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono tracking-wide border border-transparent ${getTagColorClass(tag)}`}
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 rounded font-bold uppercase font-mono italic">
                No Tags Generated
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 lg:mt-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-lg text-sm font-bold text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 transition-colors shadow-sm cursor-pointer"
          >
            <Icon name="share" className="text-[18px]" /> Share
          </button>
          <button
            onClick={handleOpenReader}
            className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-sm dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] cursor-pointer"
          >
            <Icon name="open_in_new" className="text-[18px]" /> Open Reader
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Icon
              name={isDeleting ? "sync" : "delete"}
              className={`text-[18px] ${isDeleting ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
      {/*  the Dialog component  */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Delete Intelligence Record"
        message={`Are you sure you want to permanently delete "${activeDocument.title}"? This will remove all AI analysis and metadata from our servers. This action cannot be undone.`}
        confirmText="Delete Document"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};
