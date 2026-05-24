import { useState, useRef, useEffect } from "react";
import { Icon } from "../ui/Icons";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { GlobalSearch } from "../../features/search/components/GlobalSearch";
import { ContextLogo } from "../ui/ContextLogo";
import {
  addNotification,
  loadNotifications,
  markAllAsRead,
} from "../../store/notificationSlice";

export const TopNav = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ── Dropdown state ────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Notification Dropdown state ───────────────────────────────────────────
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const { notifications } = useAppSelector((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    dispatch(loadNotifications());

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.notifications?.onAIComplete) {
      return electronAPI.notifications.onAIComplete(
        (payload: { message: string }) => {
          dispatch(addNotification(payload.message));
        },
      );
    }
  }, [dispatch]);

  // Close dropdowns when clicking anywhere outside the wrappers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <header
      className={`${isAdmin ? "h-14" : "h-20"} bg-light-surface/80 dark:bg-[#121214]/80 backdrop-blur-md border-b border-light-border dark:border-white/5 flex items-center justify-between px-8 sticky top-0 z-[100] transition-all duration-300 [webkit-app-region:drag]`}
    >
      {/* Semantic Search Component (Hidden for Admin, Logo instead) */}
      {!isAdmin ? (
        <div id="tour-global-search" className="[webkit-app-region:no-drag]">
          <GlobalSearch />
        </div>
      ) : (
        <Link
          to="/admin"
          className="flex items-center gap-3 focus:outline-none group [webkit-app-region:no-drag]"
        >
          <div className="w-8 h-8 bg-light-surface dark:bg-dark-surface/80 border border-light-border dark:border-white/10 rounded-lg flex items-center justify-center shadow-sm group-hover:border-light-primary/50 dark:group-hover:border-dark-primary/50 transition-colors">
            <div className="scale-[0.7]">
              <ContextLogo />
            </div>
          </div>
          <span className="font-black text-xs tracking-widest text-light-text dark:text-white uppercase opacity-80 group-hover:opacity-100 transition-opacity">
            Context Admin
          </span>
        </Link>
      )}

      <div className="flex items-center gap-5">
        {/* ── Notification Dropdown ─────────────────────────────────────── */}
        <div
          ref={notifDropdownRef}
          className="relative [webkit-app-region:no-drag]"
        >
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`relative p-2 rounded-full transition-colors ${
              isNotifOpen
                ? "bg-black/5 dark:bg-white/10"
                : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Icon
              name="notifications"
              className="text-light-text/60 dark:text-white/60 text-[22px]"
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-light-surface dark:border-[#121214]"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col max-h-[400px]">
              <div className="px-4 py-2 border-b border-light-border dark:border-white/10 flex items-center justify-between shrink-0">
                <span className="font-bold text-sm text-light-text dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllAsRead())}
                    className="text-xs text-light-primary dark:text-dark-primary font-bold hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto overflow-x-hidden flex-1 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-light-text/50 dark:text-white/50">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-light-border dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!n.isRead ? "bg-light-primary/5 dark:bg-dark-primary/5" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-light-primary dark:bg-dark-primary mt-1.5 shrink-0"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm text-light-text dark:text-white ${!n.isRead ? "font-bold" : "font-medium"}`}
                          >
                            {n.message}
                          </p>
                          <p className="text-xs text-light-text/50 dark:text-white/40 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Profile Dropdown ─────────────────────────────────────── */}
        <div
          ref={dropdownRef}
          className="relative [webkit-app-region:no-drag]"
          id="tour-profile-menu"
        >
          {/* Trigger Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-300 border group ${
              isOpen
                ? "bg-white dark:bg-[#1E1E22] border-light-border dark:border-white/10 shadow-sm"
                : "bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-[#1E1E22]/60 hover:border-light-border/50 dark:hover:border-white/5"
            }`}
            title="Manage Node Profile"
          >
            <div
              className={`w-10 h-10 rounded-full bg-light-surface dark:bg-[#18181B] border-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden transition-all duration-300 ${isOpen ? "border-light-primary dark:border-dark-primary scale-105" : "border-light-border dark:border-white/10 group-hover:border-light-primary/40 dark:group-hover:border-dark-primary/40"}`}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  name="person"
                  className={`transition-colors duration-300 text-[20px] ${isOpen ? "text-light-primary dark:text-dark-primary" : "text-light-text/50 dark:text-white/50 group-hover:text-light-text/80 dark:group-hover:text-white/80"}`}
                />
              )}
            </div>

            <div className="flex flex-col items-start text-left hidden sm:flex pr-1">
              <span className="text-sm font-bold text-light-text dark:text-white truncate max-w-[120px] group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                {user ? `@${user.username}` : "System Admin"}
              </span>
              <span className="text-[10px] font-mono text-light-text/50 dark:text-white/40 capitalize flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                {user ? `Ready • ${user.persona}` : "Ready • v1.0-beta"}
              </span>
            </div>
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              {/* Profile */}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2.5 text-sm font-semibold text-light-text dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-rounded text-[18px] text-light-primary dark:text-dark-primary">
                  manage_accounts
                </span>
                Profile
              </Link>

              <div className="h-px w-full bg-light-border dark:bg-white/10 my-1" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-rounded text-[18px]">
                  logout
                </span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
