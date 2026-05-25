import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Icon } from "../../../components/ui/Icons";
import { ChatMessage } from "../api/chatService";
import { documentService } from "../../dashboard/api/documentService";
import { notify } from "../../../components/ui/ToastEngine";

interface ComparisonChatProps {
  chatHistory: ChatMessage[];
  isChatting: boolean;
  onSendMessage: (text: string) => Promise<void>;
  isVisible: boolean;
}

export const ComparisonChat: React.FC<ComparisonChatProps> = ({
  chatHistory,
  isChatting,
  onSendMessage,
  isVisible,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isVisible) return null;

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        
        const lastAssistantMsg = [...chatHistory].reverse().find(m => m.role === 'assistant');
        if (lastAssistantMsg) {
          try {
            await documentService.processText(lastAssistantMsg.content, `AI Comparison Note`);
            notify("Saved comparison to Library!", "success");
          } catch (error) {
            notify("Failed to save comparison.", "error");
          }
        } else {
          notify("No AI response to save.", "info");
        }
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatHistory, isVisible]);

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  const submitMessage = async (text: string = chatInput) => {
    if (!text.trim() || isChatting) return;

    const currentText = text.trim();
    setChatInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsChatOpen(true); // Open history so user can see what they just sent

    await onSendMessage(currentText);
  };

  return (
    <div id="tour-compare-chat" className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-30 animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Chat thread — slides up smoothly above the input bar */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isChatOpen && chatHistory.length > 0
            ? "max-h-[300px] opacity-100 mb-2"
            : "max-h-0 opacity-0 mb-0 pointer-events-none"
        }`}
      >
        <div className="max-h-[300px] overflow-y-auto bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-3 space-y-3 break-words text-sm">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-br-none"
                    : "bg-light-bg dark:bg-white/5 text-light-text dark:text-white rounded-bl-none border border-light-border dark:border-white/10"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                      ul: ({ ...props }) => <ul className="list-disc ml-5 mb-3 flex flex-col gap-1.5" {...props} />,
                      ol: ({ ...props }) => <ol className="list-decimal ml-5 mb-3 flex flex-col gap-1.5" {...props} />,
                      li: ({ ...props }) => <li className="pl-1" {...props} />,
                      h1: ({ ...props }) => <h1 className="text-lg font-black mb-3 mt-4 first:mt-0 text-light-text dark:text-white" {...props} />,
                      h2: ({ ...props }) => <h2 className="text-base font-bold mb-2 mt-4 text-light-text dark:text-white" {...props} />,
                      h3: ({ ...props }) => <h3 className="text-sm font-bold mb-2 mt-3 text-light-text dark:text-white" {...props} />,
                      strong: ({ ...props }) => <strong className="font-bold text-light-text dark:text-white" {...props} />,
                      a: ({ ...props }) => <a className="text-light-primary dark:text-dark-primary hover:underline font-bold" {...props} />,
                      code: ({ inline, ...props }: any) =>
                        inline ? (
                          <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-[13px] text-light-primary dark:text-dark-primary" {...props} />
                        ) : (
                          <div className="bg-black/80 dark:bg-[#18181b] text-gray-100 rounded-lg p-3 my-3 overflow-x-auto text-[13px] font-mono border border-black/10 dark:border-white/10 shadow-sm">
                            <code {...props} />
                          </div>
                        ),
                      blockquote: ({ ...props }) => <blockquote className="border-l-2 border-light-primary dark:border-dark-primary pl-4 italic text-light-text/80 dark:text-white/80 my-3" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-light-bg dark:bg-white/5 rounded-bl-none border border-light-border dark:border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-light-primary/60 dark:bg-dark-primary/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-light-primary/60 dark:bg-dark-primary/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-light-primary/60 dark:bg-dark-primary/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Original input bar — never changes shape ── */}
      <div className="bg-white dark:bg-[#18181B] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col transition-all focus-within:ring-2 focus-within:ring-light-primary/20 dark:focus-within:ring-dark-primary/20 focus-within:border-light-primary dark:focus-within:border-dark-primary">
        <div className="flex items-center bg-light-bg dark:bg-[#0B0B0D] rounded-xl border border-light-border dark:border-white/5 p-1">
          <Icon name="smart_toy" className="p-1 px-2.5 text-[22px] text-light-text/40 dark:text-white/30 shrink-0" />
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent border-none text-sm font-medium py-2 px-3.5 max-h-32 h-[36px] leading-5 resize-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-light-text/50 dark:placeholder:text-dark-text/50 text-light-text dark:text-white"
            placeholder="Ask Context to compare specific clauses or find contradictions..."
            rows={1}
            value={chatInput}
            onChange={handleInputResize}
            onFocus={() => setIsChatOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                submitMessage();
              }
            }}
          ></textarea>
          {/* Expand/collapse toggle — only visible when there is chat history */}
          {chatHistory.length > 0 && (
            <button
              onClick={() => setIsChatOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-white/30 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-border/50 dark:hover:bg-white/5 transition-colors shrink-0 m-0.5"
              title={isChatOpen ? "Collapse history" : "Expand history"}
            >
              <Icon
                name={isChatOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
                className="text-[18px]"
              />
            </button>
          )}
          <button
            onClick={() => submitMessage()}
            disabled={isChatting || !chatInput.trim()}
            className="w-8 h-8 flex items-center justify-center bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-sm m-0.5"
          >
            <Icon name="arrow_upward" className="text-[16px]" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 pt-2 pb-1 overflow-x-auto no-scrollbar mask-gradient">
          <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/40 dark:text-white/30 font-mono shrink-0 mr-1">
            Suggested
          </span>
          {["Summarize key differences", "Find shared topics", "What contradictions exist?"].map((prompt) => (
            <button
              key={prompt}
              onClick={() => submitMessage(prompt)}
              disabled={isChatting}
              className="text-[10px] font-semibold bg-light-bg dark:bg-white/5 px-2.5 py-1 rounded-md border border-light-border dark:border-white/10 text-light-text/70 dark:text-dark-text/70 hover:border-light-primary dark:hover:border-dark-primary disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
