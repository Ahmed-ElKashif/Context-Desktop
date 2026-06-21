import { Icon } from "../../../../../components/ui/core/Icons";
import { Button } from "@/components/ui/core/Button";
import { DropzoneState } from "react-dropzone";

interface DefaultDropzoneViewProps {
  activeTab: "file" | "text";
  setActiveTab: (tab: "file" | "text") => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  snippetTitle: string;
  setSnippetTitle: (title: string) => void;
  isUploading: boolean;
  wordCount: number;
  handleTextSubmit: () => void;
  handleClose: () => void;
  dropzone: DropzoneState;
  hiddenFolderInputRef: React.RefObject<HTMLInputElement | null>;
  handleManualFolderSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNativeFolderSelect?: () => void;
}

export const DefaultDropzoneView = ({
  activeTab,
  setActiveTab,
  pastedText,
  setPastedText,
  snippetTitle,
  setSnippetTitle,
  isUploading,
  wordCount,
  handleTextSubmit,
  handleClose,
  dropzone,
  hiddenFolderInputRef,
  handleManualFolderSelect,
  handleNativeFolderSelect,
}: DefaultDropzoneViewProps) => {
  const { getRootProps, getInputProps, isDragActive, open } = dropzone;

  return (
    <div className="relative bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-white/5">
        <div>
          <h3 className="text-xl font-black text-light-text dark:text-white tracking-tight">
            Add to Context
          </h3>
          <p className="text-sm text-light-text/70 dark:text-white/70 mt-1">
            Upload a folder, document, or paste raw text.
          </p>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-bg dark:hover:bg-white/10 transition-colors"
        >
          <Icon name="close" className="text-xl" />
        </button>
      </div>

      <div className="flex px-6 pt-4 gap-6 border-b border-light-border dark:border-white/5">
        <button
          onClick={() => setActiveTab("file")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors focus-ring-standard rounded-md px-2 ${
            activeTab === "file"
              ? "border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary"
              : "border-transparent text-light-text/60 hover:text-light-text dark:text-white/60 dark:hover:text-white"
          }`}
        >
          Folder Upload
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors focus-ring-standard rounded-md px-2 ${
            activeTab === "text"
              ? "border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary"
              : "border-transparent text-light-text/60 hover:text-light-text dark:text-white/60 dark:hover:text-white"
          }`}
        >
          Paste Text Snippet
        </button>
      </div>

      <div className="p-6">
        {activeTab === "file" ? (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 transition-colors group/drop relative ${isDragActive ? "border-light-primary bg-light-primary/10" : "border-light-border"}`}
          >
            <input {...getInputProps()} />
            <input
              type="file"
              ref={hiddenFolderInputRef}
              onChange={handleManualFolderSelect}
              className="hidden"
              multiple
              {...({ webkitdirectory: "true", directory: "true" } as any)}
            />

            <div className="w-16 h-16 shadow-sm rounded-full flex items-center justify-center mb-4 bg-white dark:bg-dark-surface text-light-primary dark:text-dark-primary">
              <Icon name="create_new_folder" className="text-3xl" />
            </div>
            <h3 className="text-lg font-extrabold text-light-text dark:text-white mb-2 text-center">
              Drop your content here
            </h3>
            <p className="text-xs font-semibold text-light-text/60 dark:text-white/60 mb-6 text-center max-w-[250px]">
              Drag & drop files or folders directly into this zone. Max 5 items.
            </p>

            <div className="flex gap-3 z-10">
              <Button
                variant="outline"
                className="bg-white dark:bg-[#1E1E22] text-xs font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  open();
                }}
              >
                Browse Files
              </Button>
              <Button
                variant="outline"
                className="bg-white dark:bg-[#1E1E22] text-xs font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  if (handleNativeFolderSelect) {
                    handleNativeFolderSelect();
                  } else {
                    hiddenFolderInputRef.current?.click();
                  }
                }}
              >
                Browse Folders
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-light-text/60 dark:text-white/60 uppercase tracking-wider">
                Snippet Title
              </label>
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                disabled={isUploading}
                placeholder="Enter a descriptive title for this snippet..."
                className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-white/10 bg-light-surface dark:bg-[#121214] text-light-text dark:text-white text-sm outline-none placeholder:text-light-text/60 dark:placeholder:text-white/50 transition-colors focus:border-light-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-light-primary/20 dark:focus:ring-dark-primary/20 font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-light-text/60 dark:text-white/60 uppercase tracking-wider">
                Text Content
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={isUploading}
                placeholder="Paste your text here..."
                className="w-full h-36 p-4 rounded-xl border border-light-border dark:border-white/10 bg-light-surface dark:bg-[#121214] text-light-text dark:text-white text-sm outline-none resize-none placeholder:text-light-text/60 dark:placeholder:text-white/50 transition-colors focus:border-light-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-light-primary/20 dark:focus:ring-dark-primary/20 leading-relaxed"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-light-primary dark:text-white/60 px-3 py-1.5 bg-light-bg dark:bg-white/5 rounded-md border border-light-border dark:border-white/10">
                  {wordCount} Words
                </span>
              </div>
              <Button
                onClick={handleTextSubmit}
                disabled={isUploading || !pastedText.trim() || !snippetTitle.trim()}
                className="bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold h-auto py-2.5 px-5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Add to Context
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
