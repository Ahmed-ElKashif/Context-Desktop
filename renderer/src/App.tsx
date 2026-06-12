import { Suspense, useState, useEffect, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthGuard } from "./features/auth/components/AuthGuard";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import { ContextToaster } from "./components/ui/feedback/ToastEngine";
import AdminGuard from "./features/auth/components/AdminGuard";
import { useAnalytics } from "./features/analytics/hooks/useAnalytics";
import { ServerErrorPage } from "./pages/ServerErrorPage";
import { PageLoader } from "./components/ui/loaders/PageLoader";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store/store";
import { initializeAuth, logout } from "./store/auth/authSlice";
import { BootSequence } from "./components/layout/BootSequence";

const Workspace = lazy(() => import("./pages/workspace"));
const Library = lazy(() => import("./pages/Smartlibrary"));
const Reader = lazy(() => import("./pages/Reader"));
const Compare = lazy(() => import("./pages/compare"));
const Settings = lazy(() => import("./pages/settings"));
const Profile = lazy(() => import("./pages/profile"));
const AdminPage = lazy(() => import("./pages/admin"));
// Smart root redirect: desktop apps never show a landing page
const DesktopRoot = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return <Navigate to={isAuthenticated ? "/workspace" : "/login"} replace />;
};

function App() {
  useAnalytics(); // ← ADD THIS LINE (auto-tracks pageviews)
  const [isServerDown, setIsServerDown] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [minBootTimeMet, setMinBootTimeMet] = useState(false);

  useEffect(() => {
    // 1. Resolve Auth state from IPC store
    dispatch(initializeAuth());
    
    // 2. Enforce a minimum boot time so the animation can play
    const minTimer = setTimeout(() => setMinBootTimeMet(true), 2000);
    return () => clearTimeout(minTimer);
  }, [dispatch]);

  const isBootComplete = authStatus !== "loading" && minBootTimeMet;

  useEffect(() => {
    if (isBootComplete) {
      const timer = setTimeout(() => setShowBootSequence(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isBootComplete]);

  useEffect(() => {
    const handleServerDown = () => setIsServerDown(true);
    const handleAuthExpired = () => {
      dispatch(logout());
      navigate("/login");
    };

    const handleApiError = (e: Event) => {
      const msg = (e as CustomEvent).detail?.message;
      if (msg) {
        import("./components/ui/feedback/ToastEngine").then(({ notify }) => {
          notify(msg, "error");
        });
      }
    };

    const handleAppNotify = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail || {};
      // Filter out transient info toasts like "Authenticating..."
      if (message && type && type !== "info") {
        import("./store/ui/notificationSlice").then(({ addNotification }) => {
          dispatch(addNotification({ message, type, silent: true }));
        });
      }
    };

    window.addEventListener("server-down", handleServerDown);
    window.addEventListener("auth-expired", handleAuthExpired);
    window.addEventListener("api-error", handleApiError);
    window.addEventListener("app-notify", handleAppNotify);

    // 1. Fetch any CLI args from cold start
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
          navigate("/library");
          
          // Fire event for cold starts since LibraryDropzone might have already mounted
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("external-upload", { detail: [filePath] })
            );
          }, 500);
        }
      }).catch(console.error);
    }

    // 2. Listen for CLI args if app is already running
    const cleanupCLI = (window as any).electronAPI?.app?.onCLIArgs?.(
      (action: string, filePath: string) => {
        if (action === "upload") {
          if (!(window as any).pendingExternalUpload) {
            (window as any).pendingExternalUpload = [];
          }
          if (!(window as any).pendingExternalUpload.includes(filePath)) {
            (window as any).pendingExternalUpload.push(filePath);
          }
          
          navigate("/library");
          
          // Debounce the event dispatch to batch rapid OS calls
          if ((window as any).externalUploadTimeout) {
            clearTimeout((window as any).externalUploadTimeout);
          }
          
          if (!(window as any).batchedExternalUploads) {
            (window as any).batchedExternalUploads = [];
          }
          if (!(window as any).batchedExternalUploads.includes(filePath)) {
            (window as any).batchedExternalUploads.push(filePath);
          }
          
          (window as any).externalUploadTimeout = setTimeout(() => {
            const pathsToUpload = [...(window as any).batchedExternalUploads];
            (window as any).batchedExternalUploads = [];
            
            // Also append to pendingExternalUpload just in case Library is currently unmounted
            // so it can pick it up on mount.
            if (!(window as any).pendingExternalUpload) {
               (window as any).pendingExternalUpload = [];
            }
            pathsToUpload.forEach(p => {
               if (!(window as any).pendingExternalUpload.includes(p)) {
                 (window as any).pendingExternalUpload.push(p);
               }
            });

            window.dispatchEvent(
              new CustomEvent("external-upload", { detail: pathsToUpload }),
            );
          }, 350);
        }
      },
    );

    const cleanupNotificationClick = (
      window as any
    ).electronAPI?.app?.onNotificationClicked?.((payload: any) => {
      if (payload && payload.route) {
        navigate(payload.route);
      }
    });

    return () => {
      window.removeEventListener("server-down", handleServerDown);
      window.removeEventListener("auth-expired", handleAuthExpired);
      window.removeEventListener("api-error", handleApiError);
      window.removeEventListener("app-notify", handleAppNotify);
      if (cleanupCLI) cleanupCLI();
      if (cleanupNotificationClick) cleanupNotificationClick();
    };
  }, [dispatch, navigate]);

  if (isServerDown) {
    return <ServerErrorPage />;
  }

  return (
    <>
      <ContextToaster />

      {showBootSequence && (
        <BootSequence isComplete={isBootComplete} />
      )}

      {authStatus !== "loading" && (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<DesktopRoot />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<AuthGuard />}>
              <Route element={<MainLayout />}>
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/library" element={<Library />} />
                <Route path="/read/:id" element={<Reader />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route element={<AdminGuard />}>
              <Route element={<MainLayout />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default App;
