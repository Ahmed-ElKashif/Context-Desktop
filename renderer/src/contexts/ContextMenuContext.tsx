import React, { createContext, useContext, useState, useCallback } from "react";
import { ContextMenu, ContextMenuItem } from "../components/ui/feedback/ContextMenu";

interface ContextMenuContextType {
  showMenu: (items: ContextMenuItem[], position: { x: number; y: number }) => void;
  closeMenu: () => void;
  isOpen: boolean;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export const useLibraryContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useLibraryContextMenu must be used within a ContextMenuProvider");
  }
  return context;
};

export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  const showMenu = useCallback((newItems: ContextMenuItem[], newPosition: { x: number; y: number }) => {
    setItems(newItems);
    setPosition(newPosition);
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ContextMenuContext.Provider value={{ showMenu, closeMenu, isOpen }}>
      {children}
      <ContextMenu
        isOpen={isOpen}
        position={position}
        items={items}
        onClose={closeMenu}
      />
    </ContextMenuContext.Provider>
  );
};
