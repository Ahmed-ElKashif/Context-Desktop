import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "../../../components/ui/hooks/useClickOutside";
import { FOLDER_COLORS } from "../../../features/library/utils/folderColors";

export interface ContextMenuItem {
  label?: string;
  icon?: string;
  iconColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  shortcut?: string;
  isSeparator?: boolean;
  isColorPicker?: boolean;
  folderColor?: string;
  onColorSelect?: (colorHex: string) => void;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [activeSubmenuIndex, setActiveSubmenuIndex] = useState<number | null>(null);

  useClickOutside(menuRef, onClose);

  // Reset focus when opened
  useEffect(() => {
    if (isOpen) {
      // Find first non-separator item
      const firstFocusable = items.findIndex((item) => !item.isSeparator && !item.disabled);
      setFocusedIndex(firstFocusable !== -1 ? firstFocusable : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, items]);

  // Smart positioning: prevent menu from going off-screen
  useLayoutEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // Adjust X if it goes off the right edge
      if (x + rect.width > viewportWidth) {
        x = x - rect.width;
      }
      // Ensure X is not negative
      if (x < 0) x = 0;

      // Adjust Y if it goes off the bottom edge
      if (y + rect.height > viewportHeight) {
        y = y - rect.height;
      }
      // Ensure Y is not negative
      if (y < 0) y = 0;

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]);

  // Handle Keyboard Navigation (A11y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        const direction = e.key === "ArrowDown" ? 1 : -1;
        let nextIndex = focusedIndex + direction;

        // Loop around and skip separators/disabled
        while (
          nextIndex >= 0 &&
          nextIndex < items.length &&
          (items[nextIndex].isSeparator || items[nextIndex].disabled)
        ) {
          nextIndex += direction;
        }

        if (nextIndex >= 0 && nextIndex < items.length) {
          setFocusedIndex(nextIndex);
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          const item = items[focusedIndex];
          if (!item.isSeparator && !item.disabled && item.onClick) {
            item.onClick();
            onClose();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown, { capture: true });
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isOpen, items, focusedIndex, onClose]);

  // Handle scroll to close menu
  useLayoutEffect(() => {
    const handleScroll = () => {
      if (isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, {
        passive: true,
        capture: true,
      });
    }
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      className="fixed z-[100] w-64 py-1.5 rounded-xl bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 shadow-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col outline-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {items.map((item, index) => {
        if (item.isSeparator) {
          return (
            <div key={index} role="separator" className="h-px w-full bg-light-border dark:bg-white/10 my-1.5" />
          );
        }

        const isFocused = index === focusedIndex;

        return (
          <button
            key={index}
            role="menuitem"
            tabIndex={isFocused ? 0 : -1}
            onClick={(e) => {
              if (item.disabled) return;
              e.stopPropagation();
              if (item.isColorPicker) {
                setActiveSubmenuIndex(activeSubmenuIndex === index ? null : index);
                return; // Do not close on click if it's a submenu toggle
              }
              if (item.onClick) item.onClick();
              onClose();
            }}
            onMouseEnter={() => {
              if (!item.disabled) {
                setFocusedIndex(index);
                if (item.isColorPicker) {
                  setActiveSubmenuIndex(index);
                } else {
                  setActiveSubmenuIndex(null);
                }
              }
            }}
            disabled={item.disabled}
            className={`
              relative w-full flex items-center gap-3 px-3 py-1.5 text-sm text-left transition-colors outline-none
              ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${isFocused && !item.disabled ? "bg-light-primary/10 dark:bg-white/5" : ""}
              ${item.destructive && !item.disabled ? "text-red-600 dark:text-red-400 hover:!bg-red-500/10" : "text-light-text dark:text-white/90"}
            `}
          >
            {item.icon && !item.isColorPicker && (
              <span
                className={`material-symbols-rounded text-[18px] ${item.iconColor || ""}`}
              >
                {item.icon}
              </span>
            )}
            {item.isColorPicker && (
              <div
                className="w-[18px] h-[18px] rounded-full border border-black/10 dark:border-white/20 flex-shrink-0"
                style={{ backgroundColor: item.folderColor || "#F5C518" }}
              />
            )}
            {!item.icon && !item.isColorPicker && <span className="w-[18px]"></span>}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && !item.isColorPicker && (
              <span className="text-xs text-light-text/50 dark:text-white/40 ml-4 tracking-widest">
                {item.shortcut}
              </span>
            )}
            {item.isColorPicker && (
              <span className="material-symbols-rounded text-[18px] text-light-text/50 dark:text-white/50 ml-4">
                chevron_right
              </span>
            )}

            {/* Color Picker Submenu */}
            {item.isColorPicker && activeSubmenuIndex === index && (
              <div
                className="absolute top-0 right-[-210px] w-[200px] bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 shadow-xl rounded-xl p-2 animate-in fade-in slide-in-from-left-2 duration-100 z-[101]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs font-semibold text-light-text/60 dark:text-white/50 mb-2 px-1">
                  Folder color
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {FOLDER_COLORS.map((color) => {
                    const isSelected = color.hex === (item.folderColor || "#F5C518");
                    return (
                      <div
                        key={color.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.onColorSelect) item.onColorSelect(color.key);
                          onClose();
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                          isSelected ? "ring-2 ring-offset-2 ring-light-primary dark:ring-dark-primary dark:ring-offset-[#1E1E22]" : ""
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>,
    document.body,
  );
};
