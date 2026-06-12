import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { notify } from "../../../components/ui/feedback/ToastEngine";
import { ChatMessage, chatService } from "../api/chatService";

import {
  fetchComparisonChatHistory,
  addUserMessage,
  removeLastMessage,
  appendChunkToLastMessage,
  setIsChatting,
} from "../../../store/comparison/comparisonSlice";

export function useComparisonChat() {
  const dispatch = useAppDispatch();
  const { baseDoc, compareDoc, chatHistory, isChatting } = useAppSelector(
    (state) => state.comparison,
  );

  const hasRequestedChat = useRef(false);

  // ─── Effect 1: Fetch chat history when documents are set ────────────────────
  useEffect(() => {
    if (
      baseDoc &&
      compareDoc &&
      chatHistory.length === 0 &&
      !isChatting &&
      !hasRequestedChat.current
    ) {
      hasRequestedChat.current = true;
      dispatch(fetchComparisonChatHistory());
    }

    if (!baseDoc || !compareDoc) {
      hasRequestedChat.current = false;
    }
  }, [baseDoc, compareDoc, chatHistory.length, isChatting, dispatch]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSendMessage = async (text: string) => {
    if (!baseDoc || !compareDoc) return;

    // ── AI Status Guard ──────────────────────────────────────────────────────
    // Check both documents are fully analyzed before attempting the chat.
    const notReadyDoc = [baseDoc, compareDoc].find(
      (d) => d.aiStatus !== "Analyzed",
    );
    if (notReadyDoc) {
      const guardMsg: ChatMessage = {
        role: "assistant",
        content:
          notReadyDoc.aiStatus === "Failed"
            ? `⚠️ The analysis of **"${notReadyDoc.title}"** failed and didn't complete. Please reanalyze it first — I'll be ready to compare both documents once it's done!`
            : `⏳ **"${notReadyDoc.title}"** is still being processed by the orchestrator. Please wait for the analysis to finish before starting a comparison chat!`,
      };
      dispatch(addUserMessage({ role: "user", content: text }));
      dispatch(addUserMessage(guardMsg));
      return;
    }

    let firstChunkReceived = false;
    try {
      dispatch(setIsChatting(true));
      dispatch(addUserMessage({ role: "user", content: text }));

      await chatService.sendMessageStream(
        baseDoc._id,
        compareDoc._id,
        text,
        (chunk) => {
          if (!firstChunkReceived) {
            firstChunkReceived = true;
            dispatch(setIsChatting(false)); // Hide bounce loader when text starts flowing
            dispatch(addUserMessage({ role: "assistant", content: chunk }));
          } else {
            dispatch(appendChunkToLastMessage(chunk));
          }
        },
      );
    } catch (error: unknown) {
      notify(
        (error as Error)?.message ||
          (error as string) ||
          "Failed to send message",
        "error",
      );
      if (firstChunkReceived) {
        dispatch(removeLastMessage()); // remove AI msg
      }
      dispatch(removeLastMessage()); // remove User msg
    } finally {
      dispatch(setIsChatting(false));
    }
  };

  return {
    chatHistory,
    isChatting,
    handleSendMessage,
  };
}
