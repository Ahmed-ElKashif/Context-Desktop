import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import { Icon } from "../core/Icons"; // Adjusted import based on your path

export const ContextToaster = () => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    const TOAST_LIMIT = 3;
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= TOAST_LIMIT) // Grab the ones beyond our limit
      .forEach((t) => toast.dismiss(t.id)); // Dismiss them
  }, [toasts]);

  return (
    <Toaster
      position="bottom-right"
      reverseOrder={true}
      containerStyle={{ zIndex: 99999 }}
      // THE FIX 1: Prevent the screen from being taken over by a wall of toasts
      toastOptions={{ duration: 6000 }}
    />
  );
};

type ToastType = "success" | "error" | "info" | "warning";

// THE FIX 2: Added an optional 'id' parameter to enable Toast Replacement
// Deduplicate by defaulting id to message.
export const notify = (
  message: string,
  type: ToastType = "info",
  id: string = message,
) => {
  // Dispatch globally to sync with Notification Center
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-notify", { detail: { message, type } }));
  }

  const config = {
    success: {
      icon: "check_circle",
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      bar: "bg-emerald-500",
    },
    error: {
      icon: "error",
      bg: "bg-red-100 dark:bg-red-500/20",
      text: "text-red-600 dark:text-red-400",
      bar: "bg-red-500",
    },
    info: {
      icon: "info",
      bg: "bg-blue-100 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      bar: "bg-blue-500",
    },
    warning: {
      icon: "warning",
      bg: "bg-yellow-100 dark:bg-yellow-500/20",
      text: "text-yellow-600 dark:text-yellow-400",
      bar: "bg-yellow-500",
    },
  };

  const style = config[type];
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();

  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col pointer-events-auto group`}
      >
        <div className="px-4 py-3 flex items-start gap-3">
          <div
            className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${style.bg} ${style.text}`}
          >
            <Icon name={style.icon} className="text-[16px]" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-light-text dark:text-white tracking-tight capitalize">
                System {type}
              </h4>
              <span className="font-mono text-[10px] text-light-text/40 dark:text-white/30 bg-light-bg dark:bg-white/5 px-1.5 rounded border border-light-border dark:border-white/5">
                ID:{hash}
              </span>
            </div>
            <p className="text-sm text-light-text/80 dark:text-dark-text/80 leading-relaxed font-medium">
              {message}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-light-text/40 dark:text-dark-text/50 hover:text-light-text dark:hover:text-white transition-colors p-1 bg-light-bg dark:bg-white/5 rounded-lg border border-transparent hover:border-light-border dark:hover:border-white/10"
          >
            <Icon name="close" className="text-sm" />
          </button>
        </div>
        <div className="h-1 w-full bg-light-border dark:bg-white/5 overflow-hidden relative">
          <div
            className={`absolute top-0 left-0 h-full w-full ${style.bar} origin-left animate-shrink group-hover:[animation-play-state:paused]`}
            style={{ animationDuration: `${t.duration || 2000}ms` }} // Sync animation with actual toast duration
          ></div>
        </div>
      </div>
    ),
    { duration: 2000, ...(id ? { id } : {}) }, // Pass the ID to react-hot-toast here!
  );
};
