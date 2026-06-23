import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { notify } from "../../../components/ui/feedback/ToastEngine";
import { ENV } from "../../../config/env";
import { setActiveDocument } from "../../../store/workspace/workspaceSlice";
import { readerService } from "../index";
import { playNotificationSound } from "../../../utils/audioUtils";

export const useReaderSSE = (id: string | undefined, aiStatus: string | undefined) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const isProcessing = aiStatus === "Pending" || aiStatus === "Processing";
    if (!id || !isProcessing) return;

    const baseURL = ENV.API_BASE_URL;
    const token = localStorage.getItem("context_token");
    const sseUrl = `${baseURL}/documents/status/stream${token ? `?token=${token}` : ""}`;

    const es = new EventSource(sseUrl, { withCredentials: true });

    es.onmessage = async (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.connected) return;

        if (parsed.documentId === id) {
          if (parsed.aiStatus === "Analyzed" && parsed.document) {
            dispatch(setActiveDocument(parsed.document));
            playNotificationSound("success");
            const title = parsed.document?.title || "Document";
            notify(`"${title}" analyzed successfully!`, "success", "ai-success");
            es.close();
          } else if (parsed.aiStatus === "Failed") {
            // Reload from backend so we have the latest data
            const docData = await readerService.getDocumentDetails(id);
            dispatch(setActiveDocument(docData));
            playNotificationSound("error");
            const title = docData?.title || "Document";
            notify(`Analysis failed for "${title}". Please try again.`, "error", "ai-failed");
            es.close();
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE event", err);
      }
    };

    es.onerror = (error) => {
      console.error("Reader SSE connection error", error);
    };

    return () => es.close();
  }, [id, aiStatus, dispatch]);
};
