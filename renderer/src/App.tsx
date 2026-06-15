import { useState, useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { ContextToaster } from "./components/ui/feedback/ToastEngine";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store/store";
import { initializeAuth } from "./store/auth/authSlice";
import { BootSequence } from "./components/layout/BootSequence";
import { AppRouter } from "./AppRouter";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  
  const [minBootTimeMet, setMinBootTimeMet] = useState(false);
  const [cliProcessed, setCliProcessed] = useState(() => !!(window as any).initialCliProcessed);
  const [initialRoute, setInitialRoute] = useState("/");
  const [showBootSequence, setShowBootSequence] = useState(true);

  // 1. Resolve Auth state from IPC store
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // 2. Enforce a minimum boot time so the animation can play
  useEffect(() => {
    const minTimer = setTimeout(() => setMinBootTimeMet(true), 2000);
    return () => clearTimeout(minTimer);
  }, []);

  // 3. Fetch any CLI args from cold start
  useEffect(() => {
    if (!(window as any).initialCliProcessed && (window as any).electronAPI?.app?.getInitialCLIArgs) {
      (window as any).initialCliProcessed = true;
      (window as any).electronAPI.app.getInitialCLIArgs().then((args: any) => {
        if (args && args.action === "upload") {
          const filePath = args.path;
          if (!(window as any).pendingExternalUpload) {
            (window as any).pendingExternalUpload = [];
          }
          if (!(window as any).pendingExternalUpload.includes(filePath)) {
            (window as any).pendingExternalUpload.push(filePath);
          }
          
          // Enterprise Architecture: Save the route instead of manually navigating
          setInitialRoute("/library");
          
          // Fire event for cold starts since LibraryDropzone might have already mounted
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("external-upload", { detail: [filePath] })
            );
          }, 500);
        }
      }).catch(console.error).finally(() => {
        setCliProcessed(true);
      });
    } else {
      setCliProcessed(true);
    }
  }, []);

  const isBootComplete = authStatus !== "loading" && minBootTimeMet && cliProcessed;

  useEffect(() => {
    if (isBootComplete) {
      const timer = setTimeout(() => setShowBootSequence(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isBootComplete]);

  // If we haven't finished the initial asynchronous IPC fetches, block the MemoryRouter from mounting.
  if (authStatus === "loading" || !cliProcessed) {
    return (
      <>
        <ContextToaster />
        <BootSequence isComplete={false} />
      </>
    );
  }

  // Once initialized, provide the computed initial route dynamically to the router.
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppRouter showBootSequence={showBootSequence} isBootComplete={isBootComplete} />
    </MemoryRouter>
  );
}
