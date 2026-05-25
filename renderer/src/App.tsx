import { Suspense, useState, useEffect, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthGuard } from "./features/auth/components/AuthGuard";
import Home from "./pages/HomePage/HomePage";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import { ContextToaster } from "./components/ui/ToastEngine";
import AdminGuard from "./features/auth/components/AdminGuard";
import { useAnalytics } from "./features/analytics/hooks/useAnalytics";
import { ServerErrorPage } from "./pages/ServerErrorPage";
import { PageLoader } from "./components/ui/PageLoader";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Library = lazy(() => import("./pages/Smartlibrary"));
const Reader = lazy(() => import("./pages/read/Reader"));
const Compare = lazy(() => import("./pages/compare"));
const Settings = lazy(() => import("./pages/settings"));
const QuickCapture = lazy(() => import("./pages/QuickCapture"));
const Profile = lazy(() => import("./pages/profile"));
const AdminPage = lazy(() => import("./pages/admin"));
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth, logout } from "./store/authSlice";
import type { AppDispatch, RootState } from "./store/store";
import { BootSequence } from "./components/layout/BootSequence";

function App() {
  useAnalytics();  // ← ADD THIS LINE (auto-tracks pageviews)
  const [isServerDown, setIsServerDown] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const [showBootSequence, setShowBootSequence] = useState(true);

  useEffect(() => {
    // 1. Resolve Auth state from IPC store
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (authStatus !== "loading") {
      const timer = setTimeout(() => setShowBootSequence(false), 700);
      return () => clearTimeout(timer);
    }
  }, [authStatus]);

  useEffect(() => {
    const handleServerDown = () => setIsServerDown(true);
    const handleAuthExpired = () => {
      dispatch(logout());
      navigate("/login");
    };

    window.addEventListener("server-down", handleServerDown);
    window.addEventListener("auth-expired", handleAuthExpired);

    const cleanupCLI = (window as any).electronAPI?.app?.onCLIArgs?.((action: string, filePath: string) => {
      if (action === "upload") {
        window.dispatchEvent(new CustomEvent('external-upload', { detail: [filePath] }));
        navigate("/dashboard");
      }
    });

    const cleanupNotificationClick = (window as any).electronAPI?.app?.onNotificationClicked?.((payload: any) => {
      if (payload && payload.route) {
        navigate(payload.route);
      }
    });

    return () => {
      window.removeEventListener("server-down", handleServerDown);
      window.removeEventListener("auth-expired", handleAuthExpired);
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
        <BootSequence isComplete={authStatus !== "loading"} />
      )}

      {authStatus !== "loading" && (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<AuthGuard />}>
              <Route path="/quick-capture" element={<QuickCapture />} />
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
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