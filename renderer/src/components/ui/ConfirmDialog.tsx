import { Icon } from "./Icons";
import { Button } from "@/components/ui/Button";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // If true, makes the confirm button red
  isLoading?: boolean; // Shows a spinner on the confirm button
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Icon & Title */}
        <div className="p-6 flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              isDestructive
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "bg-light-primary/10 text-light-primary dark:bg-dark-primary/10 dark:text-dark-primary"
            }`}
          >
            <Icon
              name={isDestructive ? "warning" : "info"}
              className="text-[28px]"
            />
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-light-text/70 dark:text-white/60 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0 flex items-center justify-center gap-3 w-full">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-semibold text-light-text/70 dark:text-white/70 hover:bg-light-border/50 dark:hover:bg-white/10 rounded-xl"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 text-sm font-bold text-white shadow-sm transition-all rounded-xl ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-light-primary hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Icon name="sync" className="animate-spin text-lg" />
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
