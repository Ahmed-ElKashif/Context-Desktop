import { useState } from "react";
import { notify } from "../../../components/ui/ToastEngine";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
export const DangerZoneSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClearCache = () => {
    // Wipes ALL local storage, including auth tokens
    localStorage.clear();
    sessionStorage.clear();

    notify("Local Storage Cleared. Reloading...", "success");
    
    // Force a hard reload so React/Redux drops all in-memory state
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <section>
      <h2 className="text-sm font-mono font-bold text-red-600 dark:text-red-500 uppercase tracking-widest mb-6 border-b border-red-500/10 pb-2">
        Danger Zone
      </h2>
      <div className="bg-red-50/30 dark:bg-red-500/5 rounded-2xl border border-red-200/50 dark:border-red-500/10 divide-y divide-red-200/50 dark:divide-red-500/10 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-8">
          <div>
            <p className="font-extrabold text-sm text-light-text dark:text-white">Clear Local Storage</p>
            <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1 max-w-xl">
              This will completely wipe your browser's local storage (including your login session) and force the app to reload. 
              <strong> Your files in the cloud will not be deleted.</strong>
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white dark:bg-dark-surface border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-bold transition-colors self-start sm:self-auto shadow-sm"
          >
            Clear Index
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setIsModalOpen(false);
          handleClearCache();
        }}
        title="Clear Local Storage"
        message="This will completely wipe your browser's local storage, log you out, and force the app to reload. Your files in the cloud will not be deleted."
        confirmText="Clear Storage"
        isDestructive
      />
    </section>
  );
};