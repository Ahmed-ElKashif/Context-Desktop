import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthGuard } from "./features/auth/components/AuthGuard";
import Home from "./pages/HomePage/HomePage";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Dashboard from "./pages/dashboard";
import Library from "./pages/Smartlibrary";
import Reader from "./pages/read/Reader";
import Compare from "./pages/compare";
import Settings from "./pages/settings";
import QuickCapture from "./pages/QuickCapture";
import { ContextToaster } from "./components/ui/ToastEngine";
import Profile from "./pages/profile";
import AdminPage from "./pages/admin";
import { FolderOrganize } from "./pages/FolderOrganize";
import { FileSummary } from "./pages/FileSummary";
import AdminGuard from "./features/auth/components/AdminGuard";
import { useAnalytics } from "./features/analytics/hooks/useAnalytics";  // ← ADD THIS IMPORT
import { ServerErrorPage } from "./pages/ServerErrorPage";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth, logout } from "./store/authSlice";
import type { AppDispatch, RootState } from "./store/store";

function App() {
  useAnalytics();  // ← ADD THIS LINE (auto-tracks pageviews)
  const [isServerDown, setIsServerDown] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authStatus = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    // 1. Resolve Auth state from IPC store
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const handleServerDown = () => setIsServerDown(true);
    const handleAuthExpired = () => {
      dispatch(logout());
      navigate("/login");
    };

    window.addEventListener("server-down", handleServerDown);
    window.addEventListener("auth-expired", handleAuthExpired);

    const cleanupContextMenu = (window as any).electronAPI?.app?.onContextMenuOrganize?.((filePath: string) => {
      navigate(`/organize-local?path=${encodeURIComponent(filePath)}`);
    });

    const cleanupSummarizeMenu = (window as any).electronAPI?.app?.onContextMenuSummarize?.((documentId: string) => {
      navigate(`/summary-local?id=${encodeURIComponent(documentId)}`);
    });

    const cleanupNotificationClick = (window as any).electronAPI?.app?.onNotificationClicked?.((payload: any) => {
      if (payload && payload.route) {
        navigate(payload.route);
      }
    });

    return () => {
      window.removeEventListener("server-down", handleServerDown);
      window.removeEventListener("auth-expired", handleAuthExpired);
      if (cleanupContextMenu) cleanupContextMenu();
      if (cleanupSummarizeMenu) cleanupSummarizeMenu();
      if (cleanupNotificationClick) cleanupNotificationClick();
    };
  }, [dispatch, navigate]);

  if (isServerDown) {
    return <ServerErrorPage />;
  }

  // Block rendering until the initial IPC token fetch resolves
  if (authStatus === "loading") {
    return <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">Authenticating...</div>;
  }

  return (
    <>
      <ContextToaster />

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

        {/* Local Folder Organization */}
        <Route path="/organize-local" element={<FolderOrganize />} />
        <Route path="/summary-local" element={<FileSummary />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;