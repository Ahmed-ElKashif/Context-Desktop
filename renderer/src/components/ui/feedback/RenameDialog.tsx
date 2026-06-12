import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/core/Icons"; // Ensure lowercase
import { Button } from "@/components/ui/core/Button"; // Ensure lowercase
import { createPortal } from "react-dom";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => Promise<void>;
  currentName: string;
  isLoading?: boolean;
}

export const RenameDialog = ({
  isOpen,
  onClose,
  onConfirm,
  currentName,
  isLoading = false,
}: RenameDialogProps) => {
  const lastDotIndex = currentName.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0;
  const originalBaseName = hasExtension ? currentName.substring(0, lastDotIndex) : currentName;
  const extension = hasExtension ? currentName.substring(lastDotIndex) : "";

  const [newName, setNewName] = useState(originalBaseName);

  // Reset the input when the modal opens with a new document
  useEffect(() => {
    if (isOpen) {
      setNewName(originalBaseName);
    }
  }, [isOpen, originalBaseName]);

  // Allow pressing Enter to save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      newName.trim() &&
      newName.trim() !== originalBaseName &&
      !isLoading
    ) {
      onConfirm(newName.trim() + extension);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      <div className="relative bg-white dark:bg-[#0A0A0C] border border-light-border dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 pb-2 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Icon name="edit" className="text-[28px]" />
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-2">
            Rename Document
          </h3>
          <p className="text-sm text-light-text/70 dark:text-white/60">
            Enter a new name for this file.
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center w-full bg-light-bg dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-light-primary dark:focus-within:ring-dark-primary transition-all">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
              className="w-full px-4 py-3 bg-transparent text-sm text-light-text dark:text-white font-medium border-none ring-0 focus:ring-0 focus:border-transparent outline-none focus:outline-none disabled:opacity-50 text-center"
            />
            {extension && (
              <span className="pr-4 py-3 text-sm text-light-text/50 dark:text-white/40 font-mono select-none pointer-events-none">
                {extension}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 pt-0 flex items-center justify-center gap-3 w-full">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-semibold text-light-text/70 dark:text-white/70 hover:bg-light-border/50 dark:hover:bg-white/10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(newName.trim() + extension)}
            disabled={isLoading || !newName.trim() || newName.trim() === originalBaseName}
            className="flex-1 py-2.5 text-sm font-bold text-white shadow-sm transition-all bg-light-primary hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 rounded-xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Icon name="sync" className="animate-spin text-lg" />
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
