import { useEffect, useRef } from "react";
// Adjust these import paths based on your folder structure
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  reloadDocumentThunk,
  setActiveDocument,
  setDocumentError,
} from "../../../store/documentSlice";
import { addNotification } from "../../../store/notificationSlice";
import { notify } from "../../../components/ui/ToastEngine";
import { api } from "../../../lib/axios";

export const useDocumentStatusPolling = () => {
  const dispatch = useAppDispatch();
  const { activeDocument } = useAppSelector((state) => state.document);
  const { token } = useAppSelector((state) => state.auth);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // 1. Safety Check: If there's no active document, do nothing
    if (!activeDocument?._id) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // 2. State Check: We only poll if the AI is currently working (Pending or Processing)
    const needsPolling =
      activeDocument.aiStatus === "Pending" ||
      activeDocument.aiStatus === "Processing";

    if (needsPolling && !eventSourceRef.current) {
      console.log(
        `[useDocumentStatusPolling] Starting SSE stream for document: ${activeDocument._id}`,
      );

      const authToken = token;
      if (!authToken) return;

      const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
      const sseUrl = `${baseURL}/documents/status/stream?token=${authToken}`;

      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.connected) {
            console.log(`[useDocumentStatusPolling] SSE stream connected.`);
            return;
          }

          if (parsed.documentId === activeDocument._id) {
            console.log(`[useDocumentStatusPolling] SSE Update:`, parsed);

            if (parsed.aiStatus === "Analyzed" && parsed.document) {
              const successMsg = "AI analysis is complete. Your dashboard is ready.";
              notify(successMsg, "success");
              dispatch(addNotification(successMsg));
              dispatch(reloadDocumentThunk(parsed.document._id));
              dispatch(setActiveDocument(parsed.document));

              es.close();
              eventSourceRef.current = null;
            } else if (parsed.aiStatus === "Failed") {
              console.error(`[useDocumentStatusPolling] AI Analysis failed.`);
              const errorMsg = "AI analysis failed to process this document.";
              notify(errorMsg, "error");
              dispatch(addNotification(errorMsg));
              dispatch(setDocumentError("AI analysis failed."));

              es.close();
              eventSourceRef.current = null;
            }
          }
        } catch (error) {
          console.error(`[useDocumentStatusPolling] Failed to parse SSE event:`, error);
        }
      };

      es.onerror = (error) => {
        console.error(`[useDocumentStatusPolling] SSE connection error:`, error);
      };

    } else if (!needsPolling && eventSourceRef.current) {
      // 4. Cleanup Check: If the document is ready (Analyzed), stop any existing SSE
      console.log(
        `[useDocumentStatusPolling] Analysis already complete or failed, clearing SSE.`,
      );
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 5. Ultimate Cleanup: Stop SSE if the component unmounts
    return () => {
      if (eventSourceRef.current) {
        console.log(
          `[useDocumentStatusPolling] Component unmounting, closing SSE.`,
        );
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [
    activeDocument?._id,
    activeDocument?.aiStatus,
    dispatch,
    token,
  ]);
};
