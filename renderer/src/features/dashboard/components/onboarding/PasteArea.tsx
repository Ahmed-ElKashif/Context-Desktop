import { useState } from "react";
import { Icon } from "../../../../components/ui/Icons";
import { notify } from "../../../../components/ui/ToastEngine";

// Redux Imports
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  uploadTextDocument, // 🛠️ THE FIX: Import the unified thunk!
  DocumentData,
} from "../../../../store/documentSlice";

// Shadcn Imports
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";

export const PasteArea = ({
  onUploadSuccess,
}: {
  onUploadSuccess: (doc: DocumentData) => void;
}) => {
  const [pastedText, setPastedText] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("");

  const dispatch = useAppDispatch();
  const { isUploading } = useAppSelector((state) => state.document);

  const handleTextSubmit = async () => {
    if (!snippetTitle.trim())
      return notify("Please enter a snippet title.", "warning");
    if (!pastedText.trim())
      return notify("Please paste some text first.", "warning");

    notify("Processing text snippet...", "info");

    try {
      const response = await dispatch(
        uploadTextDocument({
          text: pastedText,
          title: snippetTitle.trim() || undefined,
        }),
      ).unwrap();

      notify("Snippet analyzed successfully!", "success");

      // 🛠️ THE FIX: Safely extract the first document from the response array (or fallback to the object if it's not an array)
      const payload = response.data || response;
      const newDocument = Array.isArray(payload) ? payload[0] : payload;

      onUploadSuccess(newDocument);
    } catch (error: any) {
      notify(error || "Failed to process text.", "error");
    }
  };

  const wordCount = pastedText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-5 animate-enter">
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
          className="w-full px-5 py-3 rounded-xl border border-light-border dark:border-white/10 bg-light-surface dark:bg-[#121214] text-light-text dark:text-white text-sm outline-none placeholder:text-light-text/40 dark:placeholder:text-white/30 transition-colors focus:border-light-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-light-primary/20 dark:focus:ring-dark-primary/20 font-semibold"
        />
      </div>

      <div className="flex flex-col gap-1.5 relative">
        <label className="text-xs font-bold text-light-text/60 dark:text-white/60 uppercase tracking-wider">
          Text Content
        </label>
        <Textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          disabled={isUploading}
          placeholder="Paste raw text, meeting notes, or code snippets here for instant analysis..."
          className="w-full h-44 bg-light-surface dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl p-5 text-sm font-mono text-light-text dark:text-white focus-visible:ring-2 focus-visible:ring-light-primary/20 dark:focus-visible:ring-dark-primary/20 focus-visible:border-light-primary dark:focus-visible:border-dark-primary outline-none placeholder:text-light-text/60 dark:placeholder:text-dark-text/40 resize-none shadow-inner leading-relaxed disabled:opacity-50"
        />
      </div>
      <div className="flex justify-between items-center mt-6 px-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-light-primary dark:text-white/60 px-3 py-1.5 bg-light-bg dark:bg-white/5 rounded-md border border-light-border dark:border-white/10">
            {wordCount} Words
          </span>
          <span className="text-[10px] font-bold text-light-text/60 dark:text-dark-text/40 hidden md:block uppercase tracking-wider">
            Instant Virtual File Engine
          </span>
        </div>

        <Button
          onClick={handleTextSubmit}
          disabled={isUploading}
          className="bg-light-primary dark:bg-dark-primary text-white dark:text-black px-6 h-auto py-3 rounded-xl font-bold hover:bg-light-primary/90 dark:hover:bg-dark-primary/90 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-md dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)] disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
        >
          <Icon
            name={isUploading ? "sync" : "bolt"}
            className={`text-lg ${isUploading ? "animate-spin" : ""}`}
          />
          {isUploading ? "Analyzing..." : "Analyze Now"}
        </Button>
      </div>
    </div>
  );
};
