import { useState, useRef, useEffect } from "react";
import { Icon } from "../../../../components/ui/Icons";
import { DocumentData } from "../../../../store/documentSlice";
import { documentService, ChatMessage } from "../../api/documentService";
import { notify } from "../../../../components/ui/ToastEngine";
import { useAppDispatch } from "../../../../store/hooks";
import { fetchSettings } from "../../../../store/settingsSlice";
import ReactMarkdown from "react-markdown";

export const AIChatSidebar = ({
  activeDocument,
}: {
  activeDocument: DocumentData | null;
}) => {
  const dispatch = useAppDispatch();
  const [chatInput, setChatInput] = useState("");
  
  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const suggestions =
    activeDocument?.fileType === "Image"
      ? ["Extract all readable text.", "What is the main subject of this image?"]
      : ["Summarize the key takeaways.", "Are there any specific dates mentioned?"];

  // Fetch History on Mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!activeDocument) return;
      setIsLoadingHistory(true);
      try {
        const history = await documentService.getChatHistory(activeDocument._id);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [activeDocument]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Global Ctrl+S listener
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault(); // Prevent browser save dialog
        
        // Find the last assistant message
        const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
        if (lastAssistantMsg) {
          try {
            await documentService.processText(lastAssistantMsg.content, `AI Note: ${activeDocument?.title || 'Chat'}`);
            notify("Saved AI response to Library!", "success");
          } catch (error) {
            notify("Failed to save AI response.", "error");
          }
        } else {
          notify("No AI response to save.", "info");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messages, activeDocument]);

  const handleSendMessage = async (overrideText?: string) => {
    if (!activeDocument) return;
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim()) return;

    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Add User Message Optimistically
    const newUserMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const response = await documentService.askQuestion(activeDocument._id, textToSend);
      // Add AI Response
      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      dispatch(fetchSettings()); // Refresh AI budget!
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || "Context AI failed to respond.";
      notify(errMsg, "error");
      setMessages((prev) => prev.slice(0, -1)); // Revert if failed
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; 
  };

  if (!activeDocument) return null;

  return (
    <aside id="tour-ai-chat" className="w-full h-full flex flex-col">
      <div className="w-full h-full flex flex-col bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-light-border dark:border-white/5 bg-light-bg/50 dark:bg-[#121214]/50 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-light-primary dark:bg-dark-primary text-white dark:text-black flex items-center justify-center shadow-sm">
            <Icon name="smart_toy" className="text-[18px]" />
          </div>
          <div>
            <h4 className="font-bold text-light-text dark:text-white text-sm">
              Ask Context AI
            </h4>
            <p className="text-[10px] font-medium text-light-text/70 dark:text-white/50">
              Trained on {activeDocument.title}
            </p>
          </div>
        </div>

        <div
          className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-light-bg/30 dark:bg-black/20"
          ref={chatScrollRef}
        >
          {isLoadingHistory ? (
            <div className="flex justify-center py-4">
              <Icon name="sync" className="animate-spin text-light-primary" />
            </div>
          ) : messages.length === 0 ? (
            <>
              <div className="bg-light-bg dark:bg-[#121214] p-3.5 rounded-xl rounded-tl-sm border border-light-border dark:border-white/5 text-sm font-medium text-light-text dark:text-white/90 shadow-sm w-[90%]">
                Hello! I've fully analyzed this {activeDocument.title}. What
                would you like to know?
              </div>
              <div className="flex flex-col gap-2 w-[85%] mt-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-left text-xs font-semibold bg-white dark:bg-dark-surface px-3 py-2 rounded-lg border border-light-border dark:border-white/10 text-light-text/80 dark:text-dark-text/70 hover:border-light-primary dark:hover:border-dark-primary hover:text-light-primary dark:hover:text-dark-primary transition-colors shadow-sm flex justify-between items-center group"
                  >
                    "{suggestion}"
                    <Icon
                      name="arrow_forward"
                      className="text-[14px] opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[90%] p-3.5 rounded-xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "self-end bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-tr-sm"
                    : "self-start bg-light-bg dark:bg-[#121214] border border-light-border dark:border-white/5 text-light-text dark:text-white/90 rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : (
                  <div className="flex flex-col text-sm leading-relaxed overflow-hidden">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="mb-3 last:mb-0" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc ml-5 mb-3 flex flex-col gap-1.5" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal ml-5 mb-3 flex flex-col gap-1.5" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        h1: ({ node, ...props }) => (
                          <h1 className="text-lg font-black mb-3 mt-4 first:mt-0 text-light-text dark:text-white" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-base font-bold mb-2 mt-4 text-light-text dark:text-white" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-sm font-bold mb-2 mt-3 text-light-text dark:text-white" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-light-text dark:text-white" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a className="text-light-primary dark:text-dark-primary hover:underline font-bold" {...props} />
                        ),
                        code: ({ node, inline, ...props }: any) =>
                          inline ? (
                            <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono text-[13px] text-light-primary dark:text-dark-primary" {...props} />
                          ) : (
                            <div className="bg-black/80 dark:bg-[#18181b] text-gray-100 rounded-lg p-3 my-3 overflow-x-auto text-[13px] font-mono border border-black/10 dark:border-white/10 shadow-sm">
                              <code {...props} />
                            </div>
                          ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-2 border-light-primary dark:border-dark-primary pl-4 italic text-light-text/80 dark:text-white/80 my-3" {...props} />
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="self-start max-w-[80%] bg-light-bg dark:bg-[#121214] border border-light-border dark:border-white/5 text-light-text dark:text-white/90 p-3.5 rounded-xl rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-light-text/40 dark:bg-white/40 rounded-full animate-bounce"></span>
              <span
                className="w-1.5 h-1.5 bg-light-text/40 dark:bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="w-1.5 h-1.5 bg-light-text/40 dark:bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </div>
          )}
        </div>

        <div className="p-2 bg-white dark:bg-dark-surface border-t border-light-border dark:border-white/5 shrink-0">
          <div className="relative flex items-center bg-light-bg dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl transition-all shadow-inner focus-within:border-light-primary dark:focus-within:border-dark-primary focus-within:ring-1 focus-within:ring-light-primary/50 dark:focus-within:ring-dark-primary/50">
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={handleInputResize}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-transparent border-none text-sm font-medium py-1.5 px-3.5 max-h-32 h-[32px] leading-5 resize-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-light-text/50 dark:placeholder:text-dark-text/50 text-light-text dark:text-white"
              placeholder="Ask a question..."
              rows={1}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || isTyping}
              className="p-1 m-1 bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0 shadow-sm"
            >
              <Icon name="arrow_upward" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
