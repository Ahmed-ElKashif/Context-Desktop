import React, { useRef, useState } from "react";
import { ContextMarkdown } from "../../../components/ui/display/ContextMarkdown";
import { Icon } from "../../../components/ui/core/Icons";
import { ChatMessage } from "../api/chatService";

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
                  <ContextMarkdown content={msg.content} />
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
          <Icon name="smart_toy" className="p-1 px-2.5 text-[22px] text-light-text/60 dark:text-white/50 shrink-0" />
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent border-none text-sm font-medium py-2 px-3.5 max-h-32 h-[36px] leading-5 resize-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-light-text/60 dark:placeholder:text-white/60 text-light-text dark:text-white"
            placeholder="Ask Context to compare specific clauses or find contradictions..."
            rows={1}
            value={chatInput}
            onChange={handleInputResize}
            onFocus={() => setIsChatOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitMessage();
              }
            }}
          ></textarea>
          {/* Expand/collapse toggle — only visible when there is chat history */}
          {chatHistory.length > 0 && (
            <button
              onClick={() => setIsChatOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/60 dark:text-white/50 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-border/50 dark:hover:bg-white/5 transition-colors shrink-0 m-0.5"
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-light-text/60 dark:text-white/50 font-mono shrink-0 mr-1">
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
