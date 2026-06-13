import { getApiError } from "@/lib/errorHandler";
import { useState, useRef, useEffect } from "react";
import { Icon } from "../../../../components/ui/core/Icons";
import { DocumentData } from "../../../../store/library/librarySlice";
import { aiService, ChatMessage } from "../../../library/api/aiService";
import { notify } from "../../../../components/ui/feedback/ToastEngine";
import { useAppDispatch } from "../../../../store/hooks";
import { fetchSettings } from "../../../../store/settings/settingsSlice";
import { ContextMarkdown } from "../../../../components/ui/display/ContextMarkdown";

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
        const history = await aiService.getChatHistory(activeDocument._id);
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

  const handleSendMessage = async (overrideText?: string) => {
    if (!activeDocument) return;
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim()) return;

    // ── AI Status Guard ─────────────────────────────────────────────────────
    // Don't hit the backend if the document isn't ready — inject a friendly
    // inline message instead of wasting a round-trip or getting a gibberish reply.
    if (activeDocument.aiStatus !== "Analyzed") {
      const guardMsg: ChatMessage = {
        role: "assistant",
        content:
          activeDocument.aiStatus === "Failed"
            ? `⚠️ My analysis of **"${activeDocument.title}"** encountered an error and didn't complete. Please click the **Reanalyze** button in the document header to try again — I'll be ready to chat once it finishes!`
            : `⏳ I'm still being trained on **"${activeDocument.title}"**. The orchestrator is processing it right now — please wait a moment and try again once the analysis is complete!`,
      };
      setMessages((prev) => [...prev, guardMsg]);
      setChatInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      return;
    }

    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Add User Message Optimistically
    const newUserMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      let firstChunkReceived = false;

      await aiService.askQuestionStream(activeDocument._id, textToSend, (chunk) => {
        if (!firstChunkReceived) {
          firstChunkReceived = true;
          setIsTyping(false); // Hide bounce loader when text starts flowing
          setMessages((prev) => [...prev, { role: "assistant", content: chunk }]);
        } else {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: newMessages[lastIndex].content + chunk
            };
            return newMessages;
          });
        }
      });
      dispatch(fetchSettings()); // Refresh AI budget!
    } catch (error: unknown) {
      const errMsg = getApiError(error, );
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
            <p className="text-[10px] font-medium text-light-text/70 dark:text-white/70">
              Your personal assistant for {activeDocument.title}
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
                      <ContextMarkdown content={msg.content} />
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="self-start max-w-[80%] bg-light-bg dark:bg-[#121214] border border-light-border dark:border-white/5 text-light-text dark:text-white/90 p-3.5 rounded-xl rounded-tl-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-light-text/80 dark:bg-white/80 rounded-full animate-bounce"></span>
              <span
                className="w-1.5 h-1.5 bg-light-text/80 dark:bg-white/80 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="w-1.5 h-1.5 bg-light-text/80 dark:bg-white/80 rounded-full animate-bounce"
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-transparent border-none text-sm font-medium py-1.5 px-3.5 max-h-32 h-[32px] leading-5 resize-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-light-text/60 dark:placeholder:text-white/60 text-light-text dark:text-white"
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
