// Removed ENV import as it will use import.meta.env
import { notify } from "../../../components/ui/feedback/ToastEngine";
import { reloadDocumentThunk } from "./documentThunks";
import { fetchSettings } from "../../settings/settingsSlice";
import { DocumentData } from "../librarySlice";
import { playNotificationSound } from "../../../utils/audioUtils";

// Singleton for SSE
let statusEventSource: EventSource | null = null;

export const pollDocumentStatusThunk = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const activeDocument = state.workspace.activeDocument;
  const documentsList = state.library.documentsList;

  const pendingDocs = [
    ...(activeDocument ? [activeDocument] : []),
    ...documentsList,
  ].filter(
    (doc) => doc.aiStatus === "Pending" || doc.aiStatus === "Processing",
  );

  const hasPendingDocs = pendingDocs.length > 0;

  if (!hasPendingDocs) {
    if (statusEventSource) {
      statusEventSource.close();
      statusEventSource = null;
    }
    return;
  }

  if (!statusEventSource) {
    console.log(
      `[pollDocumentStatusThunk] Starting global SSE stream for pending documents.`,
    );

    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const token = await (window as any).electronAPI.store.get("context_token");
    const sseUrl = `${baseURL}/documents/status/stream${token ? `?token=${token}` : ""}`;

    statusEventSource = new EventSource(sseUrl, { withCredentials: true });

    statusEventSource.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
      if (parsed.connected) return;

      const freshState = getState();
      const freshPendingDocs = [
    ...(freshState.workspace.activeDocument
      ? [freshState.workspace.activeDocument]
      : []),
    ...freshState.library.documentsList,
      ].filter(
    (doc: DocumentData) =>
      doc.aiStatus === "Pending" || doc.aiStatus === "Processing",
      );

      const match = freshPendingDocs.find(
    (d: DocumentData) => d._id === parsed.documentId,
      );

      if (match && match.aiStatus !== parsed.aiStatus) {
        // If the completed doc is the activeDocument, useReaderSSE handles
        // the notification — skip here to avoid duplicate toasts.
        const isHandledByReader = freshState.workspace.activeDocument?._id === parsed.documentId;

    if (parsed.aiStatus === "Analyzed") {
          if (!isHandledByReader) {
            const msg = `Orchestrator finished analyzing "${parsed.document?.title || "Document"}"!`;
            notify(msg, "success");
            playNotificationSound("success");
          }
      dispatch(reloadDocumentThunk(parsed.documentId));
      dispatch(fetchSettings());
    } else if (parsed.aiStatus === "Failed") {
          if (!isHandledByReader) {
            const msg = `Analysis failed for "${parsed.document?.title || "Document"}".`;
            notify(msg, "error");
            playNotificationSound("error");
          }
      dispatch(reloadDocumentThunk(parsed.documentId));
      dispatch(fetchSettings());
    }
      }
    };

    statusEventSource.onerror = (error) => {
      console.error(`[pollDocumentStatusThunk] SSE connection error:`, error);
    };
  }
};

export const stopDocumentStatusPollingThunk = () => () => {
  if (statusEventSource) {
    statusEventSource.close();
    statusEventSource = null;
  }
};
