import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { reloadDocumentThunk } from '../../store/library/librarySlice';
import { fetchSettings } from '../../store/settings/settingsSlice';
import { notify } from '../ui/feedback/ToastEngine';
import { ProductTour } from '../../features/tour/ProductTour';
import { PopulatedTour } from '../../features/tour/PopulatedTour';
import { LibraryTour } from '../../features/tour/LibraryTour';
import { ComparisonTour } from '../../features/tour/ComparisonTour';
import { useGlobalShortcuts } from '../../hooks/useGlobalShortcuts';


export const MainLayout = () => {
  useGlobalShortcuts();
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);
  const { documentsList } = useAppSelector((state) => state.library);
  const { activeDocument } = useAppSelector((state) => state.workspace);

  const { token } = useAppSelector((state) => state.auth);

  // We gather pending docs to know if we should keep SSE open
  const pendingDocs = [
    ...(activeDocument ? [activeDocument] : []),
    ...documentsList,
  ].filter(
    (doc) => doc.aiStatus === "Pending" || doc.aiStatus === "Processing"
  );

  const hasPendingDocs = pendingDocs.length > 0;

  // We use a ref so the event listener doesn't need to be recreated on every doc change
  const pendingDocsRef = useRef(pendingDocs);
  useEffect(() => {
    pendingDocsRef.current = pendingDocs;
  }, [pendingDocs]);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!hasPendingDocs) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    if (!eventSourceRef.current) {
      const authToken = token;
      if (!authToken) return;

      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const sseUrl = `${baseURL}/documents/status/stream?token=${authToken}`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.connected) return;

          const match = pendingDocsRef.current.find((d) => d._id === parsed.documentId);
          if (match && match.aiStatus !== parsed.aiStatus) {
            if (parsed.aiStatus === "Analyzed") {
              const successMsg = `Orchestrator finished analyzing "${parsed.document?.title || "Document"}"!`;
              notify(successMsg, "success");
              dispatch(reloadDocumentThunk(parsed.documentId));
              dispatch(fetchSettings()); // Refresh AI budget/usage
            } else if (parsed.aiStatus === "Failed") {
              const failMsg = `Analysis failed for "${parsed.document?.title || "Document"}".`;
              notify(failMsg, "error");
              dispatch(reloadDocumentThunk(parsed.documentId));
              dispatch(fetchSettings()); // Refresh AI budget/usage
            }
          }
        } catch (err) {
          console.error("Failed to parse SSE data", err);
        }
      };

      es.onerror = (error) => {
        console.error("SSE connection error", error);
      };
    }

    return () => {
      // Intentionally not closing the stream on re-renders while hasPendingDocs is true
    };
  }, [hasPendingDocs, dispatch, token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex h-screen w-full min-w-[1024px] bg-light-bg dark:bg-dark-bg overflow-hidden font-sans text-light-text dark:text-dark-text selection:bg-light-primary/20 dark:selection:bg-dark-primary/30 transition-colors">

      {/* 2. The Fixed Sidebar */}
      <Sidebar />

      {/* Onboarding Product Tour (renders nothing — side-effect only) */}
      <ProductTour />
      
      {/* Post-Upload Populated Tour (renders nothing — side-effect only) */}
      <PopulatedTour />

      {/* Library Tour (renders nothing — side-effect only) */}
      <LibraryTour />

      {/* Comparison Tour (renders nothing — side-effect only) */}
      <ComparisonTour />

      {/* 3. The Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navigation */}
        <TopNav />

        {/* Scrollable Page Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};
