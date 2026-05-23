/**
 * pages/admin.tsx
 * Admin page entry point. Mirrors the pattern of pages/dashboard.tsx.
 * AdminGuard (in App.tsx wrapping this route) handles role protection.
 */

import React from "react";
import AdminDashboard from "../features/admin/components/AdminDashboard";

const AdminPage: React.FC = () => {
  return <AdminDashboard />;
};

export default AdminPage;