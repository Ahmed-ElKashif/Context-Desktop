import { useState, useRef, useEffect } from "react";
import { Icon } from "../core/Icons";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import {
  loadNotifications,
  markAllAsRead,
  clearAllNotifications,
  removeNotification,
  markAsRead,
} from "../../../store/ui/notificationSlice";

export const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoaded } = useAppSelector(
    (state) => state.notifications,
  );

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications on mount
  useEffect(() => {
    if (!isLoaded) {
      dispatch(loadNotifications());
    }
  }, [dispatch, isLoaded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(clearAllNotifications());
    setIsOpen(false);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "error":
        return {
          icon: "error",
          colorClass: "text-red-500",
          bgClass: "bg-red-500/10",
        };
      case "success":
        return {
          icon: "check_circle",
          colorClass: "text-emerald-500",
          bgClass: "bg-emerald-500/10",
        };
      case "warning":
        return {
          icon: "warning",
          colorClass: "text-yellow-500",
          bgClass: "bg-yellow-500/10",
        };
      default:
        return {
          icon: "info",
          colorClass: "text-light-primary dark:text-dark-primary",
          bgClass: "bg-light-primary/10 dark:bg-dark-primary/10",
        };
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-light-surface dark:bg-[#1E1E22] border border-light-border dark:border-white/10 shadow-sm"
            : "hover:bg-white/60 dark:hover:bg-[#1E1E22]/60 hover:shadow-sm"
        }`}
        title="Notifications"
      >
        <Icon
          name="notifications"
          className={`text-[20px] transition-colors ${
            isOpen
              ? "text-light-primary dark:text-dark-primary"
              : "text-light-text/60 dark:text-white/60"
          }`}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-[#121214] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col max-h-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-white/10 shrink-0">
            <h3 className="font-bold text-sm text-light-text dark:text-white">
              Notifications
            </h3>
            {notifications.length > 0 && (
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllAsRead())}
                    className="p-1.5 rounded-md text-light-text/50 dark:text-white/40 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                    title="Mark all as read"
                  >
                    <Icon name="done_all" className="text-[18px]" />
                  </button>
                )}
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-md text-light-text/50 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Clear all"
                >
                  <Icon name="delete_sweep" className="text-[18px]" />
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-light-surface dark:bg-dark-surface flex items-center justify-center mb-3">
                  <Icon
                    name="notifications_off"
                    className="text-light-text/20 dark:text-white/20 text-2xl"
                  />
                </div>
                <p className="text-sm font-semibold text-light-text/60 dark:text-white/60">
                  No notifications
                </p>
                <p className="text-[11px] text-light-text/40 dark:text-white/40 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) {
                        dispatch(markAsRead(notif.id));
                      }
                    }}
                    className={`relative group flex items-start gap-3 p-4 border-b border-light-border/50 dark:border-white/5 last:border-0 hover:bg-light-surface dark:hover:bg-dark-surface/50 transition-colors cursor-pointer ${
                      !notif.isRead
                        ? "bg-light-primary/5 dark:bg-dark-primary/5"
                        : ""
                    }`}
                  >
                    <div className="relative shrink-0 pt-0.5">
                      <div
                        className={`w-8 h-8 rounded-full border border-light-border dark:border-white/10 flex items-center justify-center ${getNotificationIcon(notif.type).bgClass}`}
                      >
                        <Icon
                          name={getNotificationIcon(notif.type).icon}
                          className={`text-[16px] ${getNotificationIcon(notif.type).colorClass}`}
                        />
                      </div>
                      {!notif.isRead && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#1E1E22]"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm text-light-text dark:text-white/90 leading-snug break-words ${
                          !notif.isRead ? "font-bold" : "font-medium"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <span className="text-[11px] font-mono text-light-text/50 dark:text-white/40 mt-1.5 block">
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>
                    {/* Delete button (shows on hover) */}
                    <button
                      onClick={(e) => handleRemove(e, notif.id)}
                      className="absolute right-3 top-3.5 w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-[#2A2A2E] hover:bg-red-50 dark:hover:bg-red-500/20 text-light-text/50 dark:text-white/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-light-border dark:border-white/10"
                      title="Clear notification"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
