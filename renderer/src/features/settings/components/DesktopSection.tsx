import { useState, useEffect } from "react";
import { Icon } from "../../../components/ui/Icons";
import { notify } from "../../../components/ui/ToastEngine";

export const DesktopSection = () => {
  const [startupEnabled, setStartupEnabled] = useState(false);
  const [contextMenuEnabled, setContextMenuEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [version, setVersion] = useState("Unknown");
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "available" | "downloaded">("idle");

  const electronAPI = (window as any).electronAPI;
  const isDesktop = !!electronAPI;

  const [isUpdatingContextMenu, setIsUpdatingContextMenu] = useState(false);

  useEffect(() => {
    if (!isDesktop) return;

    // Load initial states
    electronAPI.app.getStartup().then((val: boolean) => setStartupEnabled(!!val)).catch(console.error);
    electronAPI.app.getContextMenuStatus().then((val: boolean) => setContextMenuEnabled(!!val)).catch(console.error);
    electronAPI.app.getVersion().then((v: string) => setVersion(v || "Unknown")).catch(console.error);
    electronAPI.store.get('notificationsEnabled').then((val: boolean) => {
      if (val !== undefined) setNotificationsEnabled(!!val);
    }).catch(console.error);

    // Listen for updater events
    const unsubAvailable = electronAPI.updater.onUpdateAvailable(() => {
      setUpdateStatus("available");
      notify("Update available! Downloading in background...", "success");
    });

    const unsubNotAvailable = electronAPI.updater.onUpdateNotAvailable(() => {
      setUpdateStatus("idle");
      notify("You're on the latest version ✓", "success");
    });
    
    const unsubDownloaded = electronAPI.updater.onUpdateDownloaded(() => {
      setUpdateStatus("downloaded");
      notify("Update downloaded! Click 'Install & Restart' to apply.", "success");
    });

    const unsubError = electronAPI.updater.onUpdateError((message: string) => {
      setUpdateStatus("idle");
      notify(`Update check failed: ${message}`, "error");
    });

    return () => {
      unsubAvailable();
      unsubNotAvailable();
      unsubDownloaded();
      unsubError();
    };
  }, [isDesktop]);

  const toggleStartup = async () => {
    if (!isDesktop) return;
    const newVal = !startupEnabled;
    setStartupEnabled(newVal);
    await electronAPI.app.setStartup(newVal);
    notify(newVal ? "App will launch on startup" : "Auto-launch disabled", "success");
  };

  const toggleContextMenu = async () => {
    if (!isDesktop || isUpdatingContextMenu) return;
    setIsUpdatingContextMenu(true);
    try {
      if (contextMenuEnabled) {
        await electronAPI.app.unregisterContextMenu();
        setContextMenuEnabled(false);
        notify("Context menu removed", "success");
      } else {
        await electronAPI.app.registerContextMenu();
        setContextMenuEnabled(true);
        notify("Context menu added", "success");
      }
    } catch (err) {
      console.error(err);
      notify("Failed to update context menu.", "error");
    } finally {
      setIsUpdatingContextMenu(false);
    }
  };

  const toggleNotifications = async () => {
    if (!isDesktop) return;
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    await electronAPI.store.set('notificationsEnabled', newVal);
    notify(newVal ? "Desktop notifications enabled" : "Desktop notifications disabled", "success");
  };

  const checkForUpdates = async () => {
    if (!isDesktop) return;
    setUpdateStatus("checking");
    try {
      // Fire-and-forget — results come back via the event listeners
      await electronAPI.updater.checkForUpdates();
    } catch (err) {
      setUpdateStatus("idle");
      notify("Failed to check for updates", "error");
    }
  };

  const installAndRestart = async () => {
    if (!isDesktop) return;
    try {
      await electronAPI.updater.quitAndInstall();
    } catch (err) {
      notify("Failed to install update", "error");
    }
  };

  if (!isDesktop) return null;

  return (
    <section>
      <h2 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-6 border-b border-light-border dark:border-white/5 pb-2">
        Desktop Integration
      </h2>
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-white/5 overflow-hidden shadow-sm divide-y divide-light-border dark:divide-white/5">
        
        {/* Startup Toggle */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-light-text dark:text-white">Launch on Startup</p>
            <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
              Automatically start Context when you log in to Windows.
            </p>
          </div>
          <button
            onClick={toggleStartup}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              startupEnabled ? "bg-light-primary dark:bg-dark-primary" : "bg-light-border dark:bg-white/10"
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              startupEnabled ? "translate-x-6" : "translate-x-0"
            }`} />
          </button>
        </div>

        {/* Context Menu Toggle */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-light-text dark:text-white">Windows Context Menu</p>
            <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
              Add "Upload to Context" when you right-click files and folders.
            </p>
          </div>
          <button
            onClick={toggleContextMenu}
            disabled={isUpdatingContextMenu}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isUpdatingContextMenu ? "opacity-50 cursor-not-allowed" : ""
            } ${
              contextMenuEnabled ? "bg-light-primary dark:bg-dark-primary" : "bg-light-border dark:bg-white/10"
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              contextMenuEnabled ? "translate-x-6" : "translate-x-0"
            }`} />
          </button>
        </div>

        {/* Notifications Toggle */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-light-text dark:text-white">System Notifications</p>
            <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
              Show native OS alerts when background tasks finish.
            </p>
          </div>
          <button
            onClick={toggleNotifications}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notificationsEnabled ? "bg-light-primary dark:bg-dark-primary" : "bg-light-border dark:bg-white/10"
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              notificationsEnabled ? "translate-x-6" : "translate-x-0"
            }`} />
          </button>
        </div>

        {/* System Updates */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-light-text dark:text-white">Application Updates</p>
            <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
              Current version: v{version}
            </p>
          </div>
          <button
            onClick={updateStatus === "downloaded" ? installAndRestart : checkForUpdates}
            disabled={updateStatus === "checking" || updateStatus === "available"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors border disabled:opacity-50 ${
              updateStatus === "downloaded"
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600"
                : "bg-light-bg dark:bg-white/5 border-light-border dark:border-white/10 hover:bg-light-border/50 dark:hover:bg-white/10 text-light-text dark:text-white"
            }`}
          >
            {updateStatus === "checking" ? (
              <><Icon name="sync" className="text-sm animate-spin" /> Checking...</>
            ) : updateStatus === "available" ? (
              <><Icon name="download" className="text-sm animate-bounce" /> Downloading...</>
            ) : updateStatus === "downloaded" ? (
              <><Icon name="restart_alt" className="text-sm" /> Install &amp; Restart</>
            ) : (
              <><Icon name="update" className="text-sm" /> Check for Updates</>
            )}
          </button>
        </div>

      </div>
    </section>
  );
};
