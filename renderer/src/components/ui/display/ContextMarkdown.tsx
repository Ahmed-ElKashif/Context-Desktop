import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Shared Premium Markdown Components ─────────────────────────────────────
// These are used by ContextMarkdown (for Chat/Synthesis) and also exported
// for use in PrettifyDocumentView.tsx
export const MarkdownComponents: any = {
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-5 rounded-xl border border-light-border/40 dark:border-white/10 shadow-sm">
      <table className="w-full text-sm text-left border-collapse" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-[#111827] dark:bg-[#18181B] text-white/90 font-mono text-[11px] uppercase tracking-widest" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="px-5 py-3 border-b border-white/10 font-semibold whitespace-nowrap" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="px-5 py-3 border-b border-light-border/20 dark:border-white/5 last:border-b-0 text-light-text/90 dark:text-white/80" {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="bg-white dark:bg-[#0A0A0C] even:bg-[#F9FAFB] even:dark:bg-[#111113] hover:bg-violet-500/5 dark:hover:bg-violet-500/10 transition-colors" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    if (!inline && match) {
      return (
        <pre className="bg-light-border/20 dark:bg-white/5 p-4 rounded-xl border border-light-border/50 dark:border-white/10 font-mono text-sm overflow-x-auto text-light-text/90 dark:text-white/80 my-4 shadow-sm">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code
        className="bg-light-border/30 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-[0.9em] text-violet-600 dark:text-violet-400 font-bold tracking-tight"
        {...props}
      >
        {children}
      </code>
    );
  },
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-violet-500/50 pl-4 py-2 my-4 text-light-text/70 dark:text-white/60 italic bg-violet-500/5 rounded-r-xl shadow-sm" {...props} />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-8 border-t-2 border-light-border/40 dark:border-white/10 border-dashed" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a
      className="text-violet-600 dark:text-violet-400 hover:underline font-bold transition-all"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  p: ({ node, ...props }: any) => <p className="mb-4 last:mb-0" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-extrabold text-light-text dark:text-white" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic text-light-text/90 dark:text-white/80" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc ml-5 mb-3 flex flex-col gap-1.5" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal ml-5 mb-3 flex flex-col gap-1.5" {...props} />,
  li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
  h1: ({ node, ...props }: any) => <h1 className="text-lg font-black mb-3 mt-4 first:mt-0 text-light-text dark:text-white" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-base font-bold mb-2 mt-4 text-light-text dark:text-white" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-sm font-bold mb-2 mt-3 text-light-text dark:text-white" {...props} />,
  h4: ({ node, ...props }: any) => <h4 className="text-[13px] font-bold mb-1.5 mt-3 text-light-text/90 dark:text-white/90" {...props} />,
  h5: ({ node, ...props }: any) => <h5 className="text-[12px] font-bold mb-1 mt-2 text-light-text/80 dark:text-white/80 uppercase tracking-wide" {...props} />,
  h6: ({ node, ...props }: any) => <h6 className="text-[11px] font-bold mt-2 text-light-text/70 dark:text-white/70 uppercase tracking-widest" {...props} />,
  del: ({ node, ...props }: any) => <del className="line-through opacity-70" {...props} />,
};

interface ContextMarkdownProps {
  content: string;
}

export const ContextMarkdown = ({ content }: ContextMarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={MarkdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
};
