import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FOLDER_COLORS, FolderColorKey } from "../../../features/library/utils/folderColors";
import { Button } from "../core/Button";
import { Icon } from "../core/Icons";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, color: string) => Promise<void>;
  isLoading?: boolean;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [folderName, setFolderName] = useState("New Folder");
  const [selectedColor, setSelectedColor] = useState<FolderColorKey>("yellow");

  useEffect(() => {
    if (isOpen) {
      setFolderName("New Folder");
      setSelectedColor("yellow");
    }
  }, [isOpen]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />
      <div className="relative bg-white dark:bg-[#1C1C1E] border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text dark:text-white">
            Create a folder
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <span className="material-symbols-rounded text-[18px] text-light-text/50 dark:text-white/50">
              close
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-light-text dark:text-white">
            Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && folderName.trim() && !isLoading)
                onConfirm(folderName.trim(), selectedColor);
            }}
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-white/10 bg-light-bg dark:bg-[#0A0A0C] text-sm text-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-light-text dark:text-white">
            Folder color
          </label>
          <div className="grid grid-cols-8 gap-2">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color.key}
                title={color.label}
                onClick={() => setSelectedColor(color.key as FolderColorKey)}
                className={`w-7 h-7 rounded-full transition-all hover:scale-110 focus:outline-none
                  ${
                    selectedColor === color.key
                      ? "ring-2 ring-offset-2 ring-white dark:ring-offset-[#1C1C1E] scale-110"
                      : ""
                  }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(folderName.trim(), selectedColor)}
            disabled={isLoading || !folderName.trim()}
          >
            {isLoading ? <Icon name="sync" className="animate-spin" /> : "Create"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
