/**
 * AdminGuard.tsx
 * Route-level guard for admin-only pages.
 * Uses <Outlet /> so it works as a layout wrapper in App.tsx:
 *
 *   <Route element={<AdminGuard />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 *
 * Redirect chain:
 *  - Not logged in           → /login
 *  - Logged in, not admin    → /workspace
 *  - Logged in, is admin     → renders child route via <Outlet />
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";

const AdminGuard: React.FC = () => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/workspace" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
