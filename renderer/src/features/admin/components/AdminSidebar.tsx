import React from "react";
import { Icon } from "../../../components/ui/core/Icons";
import { useAppSelector } from "../../../store/hooks";

import { paymentService } from "../../settings/api/paymentService";

interface AdminSidebarProps {
  activeTab: "dashboard" | "users" | "top-ai" | "ai" | "profile" | "settings" | "payments";
  setActiveTab: (tab: "dashboard" | "users" | "top-ai" | "ai" | "profile" | "settings" | "payments") => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const data = await paymentService.getPaymentRequests({ status: "pending", limit: 1 });
        setPendingCount(data.counts.pending);
      } catch (error) {
        console.error("Failed to fetch pending payments count in sidebar:", error);
      }
    };
    fetchPendingCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "grid_view" },
    { id: "users", label: "User Management", icon: "manage_accounts" },
    { id: "payments", label: "Payments", icon: "payments" },
    { id: "top-ai", label: "Top AI Users", icon: "stars" },
    { id: "ai", label: "AI Analytics", icon: "auto_awesome" },
    { id: "profile", label: "Profile", icon: "person" },
    { id: "settings", label: "Settings", icon: "settings" },
  ] as const;

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-[#121214] border-r border-light-border dark:border-white/5 flex flex-col shrink-0 transition-all z-20">

      {/* ── Admin User Card (Mockup Style) ────────────────────────────────── */}
      <div className="p-6">
        <button 
          onClick={() => setActiveTab("profile")}
          className="w-full text-left flex items-center gap-3 p-4 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl border border-light-border dark:border-white/5 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors focus-ring-standard"
        >
          <div className="w-10 h-10 rounded-full bg-light-primary/10 dark:bg-dark-primary/15 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon
                name="person"
                className="text-light-primary dark:text-dark-primary text-xl"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-light-text dark:text-white truncate">
              {user ? `@${user.username}` : "System Admin"}
            </span>
            <span className="text-[10px] font-bold text-light-text/50 dark:text-white/40 uppercase tracking-wider mt-0.5">
              {user?.role || "Administrator"}
            </span>
          </div>
        </button>
      </div>

      {/* ── Sub Navigation Links ─────────────────────────────────────────── */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200 text-left focus-ring-standard ${isActive
                  ? "bg-light-primary/10 dark:bg-dark-primary/15 text-light-primary dark:text-dark-primary shadow-sm border-l-4 border-light-primary dark:border-dark-primary pl-3"
                  : "text-light-text/55 dark:text-white/45 hover:bg-black/[0.03] dark:hover:bg-white/5 hover:text-light-text dark:hover:text-white"
                }`}
            >
              <Icon
                name={item.icon}
                filled={isActive}
                className="text-[20px]"
              />
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="truncate">{item.label}</span>
                {item.id === "payments" && pendingCount > 0 && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Version footer */}
      <div className="p-6 border-t border-light-border dark:border-white/5">
        <p className="text-[10px] font-bold text-light-text/40 dark:text-white/30 font-mono tracking-widest text-center">
          PORTAL V1.0.0-BETA
        </p>
      </div>
    </aside>
  );
};
