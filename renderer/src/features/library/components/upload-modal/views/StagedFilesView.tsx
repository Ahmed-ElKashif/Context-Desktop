import { Button } from "../../../../../components/ui/Button";
import { buildFileTree, FileTreeViewer } from "../fileTreeUtils";
import { createPortal } from "react-dom";
import { Icon } from "../../../../../components/ui/Icons";

interface StagedFilesViewProps {
  activeFiles: File[];
  activePaths: string[];
  handleClose: () => void;
  handleUploadToYourFolders: () => void;
}

export const StagedFilesView = ({
  activeFiles,
  activePaths,
  handleClose,
  handleUploadToYourFolders,
}: StagedFilesViewProps) => {
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center border-b border-light-border dark:border-white/5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-light-primary/10 text-light-primary dark:bg-dark-primary/10 dark:text-dark-primary">
            <Icon name="cloud_upload" className="text-[28px]" />
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
            Confirm Upload
          </h3>
          <p className="text-sm text-light-text/70 dark:text-white/60 leading-relaxed">
            You are about to add {activeFiles.length} item(s) to Context.
          </p>
        </div>

        <div className="p-4 overflow-y-auto max-h-64 h-[256px] bg-light-bg/30 dark:bg-black/20">
          <FileTreeViewer tree={buildFileTree(activePaths)} />
        </div>

        <div className="p-4 border-t border-light-border dark:border-white/5 flex justify-end gap-3 bg-light-bg dark:bg-[#121214]">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadToYourFolders}
            className="bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold"
          >
            Upload to Context
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
