import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../../components/ui/Icons";
import { DocumentData } from "../../../store/documentSlice";

interface DocumentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (doc: DocumentData) => void;
  documents: DocumentData[];
  title?: string;
}

export const DocumentSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  documents,
  title = "Select Document",
}: DocumentSelectorModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const lowerQuery = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }, [documents, searchQuery]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-light-border dark:border-white/5 shrink-0">
          <h3 className="font-bold text-lg text-light-text dark:text-white flex items-center gap-2">
            <Icon
              name="description"
              className="text-light-primary dark:text-dark-primary"
            />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-light-text/50 dark:text-white/40 hover:text-light-text dark:hover:text-white transition-colors"
          >
            <Icon name="close" className="text-[24px]" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-light-border dark:border-white/5 shrink-0 bg-light-bg/50 dark:bg-white/5">
          <div className="relative flex items-center">
            <Icon
              name="search"
              className="absolute left-3 text-[20px] text-light-text/40 dark:text-white/30"
            />
            <input
              type="text"
              placeholder="Search documents by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-light-primary dark:focus:border-dark-primary transition-colors text-light-text dark:text-white placeholder:text-light-text/40 dark:placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredDocs.length > 0 ? (
            <div className="space-y-1">
              {filteredDocs.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => {
                    onSelect(doc);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-light-bg dark:hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-light-primary/10 dark:bg-white/5 text-light-primary dark:text-white/60 flex items-center justify-center shrink-0">
                    <Icon
                      name={
                        doc.fileType === "Image"
                          ? "image"
                          : doc.fileType === "Excel"
                            ? "table_chart"
                            : doc.fileType === "TextSnippet"
                              ? "text_snippet"
                              : doc.fileType === "PDF"
                                ? "picture_as_pdf"
                                : "description"
                      }
                      className="text-[20px]"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-light-text dark:text-white truncate group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-light-text/50 dark:text-white/40 mt-0.5 truncate font-mono">
                      {doc.semanticPath || "Uncategorized"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Icon
                name="search_off"
                className="text-light-text/30 dark:text-white/20 text-[32px] mb-2"
              />
              <p className="text-sm font-medium text-light-text/60 dark:text-white/50">
                No documents found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
