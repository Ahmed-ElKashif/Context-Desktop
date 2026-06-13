import { createPortal } from "react-dom";
import { Icon } from "../../../../../components/ui/core/Icons";
import { Button } from "@/components/ui/core/Button";
import { buildFileTree, FileTreeViewer } from "../fileTreeUtils";
import { SemanticUpdate, DocumentData, FolderData } from "../../../../../store/library/librarySlice";

interface AISplitScreenViewProps {
  proposedFolderUpdates: SemanticUpdate[];
  documentsList: DocumentData[];
  globalFolderTree: FolderData[];
  isApplyingFolders: boolean;
  handleClose: () => void;
  handleAcceptAI: () => void;
  handleAcceptLocal?: () => void;
}

export const AISplitScreenView = ({
  proposedFolderUpdates,
  documentsList,
  globalFolderTree,
  isApplyingFolders,
  handleClose,
  handleAcceptAI,
  handleAcceptLocal,
}: AISplitScreenViewProps) => {
  const originalTreePaths = proposedFolderUpdates.map((update) => {
    // Use the enriched originalPath from the backend first!
    if (update.originalPath) return update.originalPath;

    const doc = documentsList.find((d) => d._id === update.documentId);
    if (!doc) return update.title || update.documentId;

    if (doc.semanticPath && doc.semanticPath !== "/") {
      return `${doc.semanticPath}/${doc.title}`;
    }

    if (doc.folder) {
      // Folder might be populated by the backend
      const folderId =
        typeof doc.folder === "object" ? (doc.folder as any)._id : doc.folder;
      const folder = globalFolderTree.find((f) => f._id === folderId);

      if (folder && (folder.path || folder.name)) {
        const folderPath = folder.path || folder.name;
        return `${folderPath}/${doc.title}`;
      } else if (typeof doc.folder === "object" && (doc.folder as any).name) {
        return `${(doc.folder as any).name}/${doc.title}`;
      }
    }

    if (doc.originalClientPath && doc.originalClientPath !== doc.title) {
      return doc.originalClientPath;
    }

    return doc.title;
  });

  const proposedTreePaths = proposedFolderUpdates.map((update) => {
    const doc = documentsList.find((d) => d._id === update.documentId);
    const title =
      update.title ||
      doc?.title ||
      `File ID: ${update.documentId.substring(0, 6)}...`;
    return update.newPath && update.newPath !== "/"
      ? `${update.newPath}/${title}`
      : title;
  });

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-light-border dark:border-white/5 flex justify-between items-center shrink-0 bg-light-surface dark:bg-dark-surface">
          <div>
            <h3 className="text-xl font-black text-light-text dark:text-white flex items-center gap-2">
              <Icon
                name="auto_awesome"
                className="text-light-primary dark:text-dark-primary"
              />
              AI Organization Complete
            </h3>
            <p className="text-sm text-light-text/70 dark:text-white/70 mt-1">
              Review the proposed folder structure before applying.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-light-border dark:divide-white/5 h-[400px]">
          <div className="p-4 overflow-y-auto bg-light-bg/30 dark:bg-black/20">
            <h4 className="text-xs font-bold text-light-text/60 dark:text-white/60 uppercase tracking-wider mb-4 px-2">
              Original (Messy)
            </h4>
            <FileTreeViewer tree={buildFileTree(originalTreePaths)} />
          </div>

          <div className="p-4 overflow-y-auto">
            <h4 className="text-xs font-bold text-light-primary dark:text-dark-primary uppercase tracking-wider mb-4 px-2">
              Proposed (Clean)
            </h4>
            <FileTreeViewer tree={buildFileTree(proposedTreePaths)} />
          </div>
        </div>

        <div className="p-4 border-t border-light-border dark:border-white/5 flex justify-end gap-3 bg-light-bg dark:bg-[#121214]">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isApplyingFolders}
          >
            Discard AI (Keep Original)
          </Button>
          <Button
            onClick={handleAcceptAI}
            disabled={isApplyingFolders}
            className="bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold"
          >
            {isApplyingFolders ? "Applying..." : "Save to Context"}
          </Button>
          {handleAcceptLocal && (
            <Button
              onClick={handleAcceptLocal}
              disabled={isApplyingFolders}
              variant="outline"
              className="border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary font-bold flex items-center gap-2"
            >
              <Icon name="save_alt" className="text-[18px]" />
              Export Local
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
