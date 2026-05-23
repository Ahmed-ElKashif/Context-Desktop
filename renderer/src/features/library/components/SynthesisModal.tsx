import { useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icon } from "../../../components/ui/Icons";
import { notify } from "../../../components/ui/ToastEngine";

interface SynthesisModalProps {
  isOpen: boolean;
  isLoading: boolean;
  synthesisResult: string | null;
  onClose: () => void;
}

export const SynthesisModal = ({
  isOpen,
  isLoading,
  synthesisResult,
  onClose,
}: SynthesisModalProps) => {
  const [copied, setCopied] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setCopied(false);
    }
  }

  if (!isOpen) return null;

  const handleCopy = () => {
    if (synthesisResult) {
      navigator.clipboard.writeText(synthesisResult);
      setCopied(true);
      notify("Synthesis copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-light-border dark:border-white/5 shrink-0 bg-light-surface dark:bg-dark-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-light-primary/10 dark:bg-dark-primary/10 flex items-center justify-center text-light-primary dark:text-dark-primary">
              <Icon name="psychology" className="text-[24px]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-light-text dark:text-white leading-tight">
                AI Document Synthesis
              </h3>
              <p className="text-xs text-light-text/60 dark:text-white/50 font-medium">
                Aggregated insights from selected documents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/50 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10 hover:text-light-text dark:hover:text-white transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Icon
                name="sync"
                className="animate-spin text-[40px] text-light-primary dark:text-dark-primary"
              />
              <p className="text-sm font-semibold text-light-text/70 dark:text-white/60 animate-pulse">
                The Neural Cortex is synthesizing documents...
              </p>
            </div>
          ) : synthesisResult ? (
            <div className="flex flex-col text-sm md:text-base leading-relaxed overflow-hidden text-light-text dark:text-white/90">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node: _, ...props }) => (
                    <p className="mb-4 last:mb-0" {...props} />
                  ),
                  ul: ({ node: _, ...props }) => (
                    <ul
                      className="list-disc ml-6 mb-4 flex flex-col gap-2"
                      {...props}
                    />
                  ),
                  ol: ({ node: _, ...props }) => (
                    <ol
                      className="list-decimal ml-6 mb-4 flex flex-col gap-2"
                      {...props}
                    />
                  ),
                  li: ({ node: _, ...props }) => (
                    <li className="pl-1" {...props} />
                  ),
                  h1: ({ node: _, ...props }) => (
                    <h1
                      className="text-2xl font-black mb-4 mt-6 first:mt-0 text-light-text dark:text-white"
                      {...props}
                    />
                  ),
                  h2: ({ node: _, ...props }) => (
                    <h2
                      className="text-xl font-bold mb-3 mt-5 text-light-text dark:text-white"
                      {...props}
                    />
                  ),
                  h3: ({ node: _, ...props }) => (
                    <h3
                      className="text-lg font-bold mb-3 mt-4 text-light-text dark:text-white"
                      {...props}
                    />
                  ),
                  strong: ({ node: _, ...props }) => (
                    <strong
                      className="font-bold text-light-text dark:text-white"
                      {...props}
                    />
                  ),
                  a: ({ node: _, ...props }) => (
                    <a
                      className="text-light-primary dark:text-dark-primary hover:underline font-bold"
                      {...props}
                    />
                  ),
                  code: ({ node: _, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-[13px] text-light-primary dark:text-dark-primary"
                        {...props}
                      />
                    ) : (
                      <div className="bg-black/80 dark:bg-[#18181b] text-gray-100 rounded-lg p-4 my-4 overflow-x-auto text-[13px] font-mono border border-black/10 dark:border-white/10 shadow-sm">
                        <code {...props} />
                      </div>
                    ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-2 border-light-primary dark:border-dark-primary pl-4 italic text-light-text/80 dark:text-white/80 my-4"
                      {...props}
                    />
                  ),
                }}
              >
                {synthesisResult}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Icon
                name="error_outline"
                className="text-[40px] text-red-400 mb-3"
              />
              <p className="text-sm text-light-text/60 dark:text-white/50">
                Failed to generate synthesis. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-light-border dark:border-white/5 shrink-0 bg-light-surface dark:bg-dark-surface flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-light-bg dark:bg-white/5 text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {isLoading ? "Cancel" : "Close"}
          </button>
          {!isLoading && synthesisResult && (
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-light-primary dark:bg-dark-primary hover:opacity-90 text-white dark:text-black shadow-md flex items-center gap-2 transition-opacity"
            >
              <Icon
                name={copied ? "check" : "content_copy"}
                className="text-[18px]"
              />
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
