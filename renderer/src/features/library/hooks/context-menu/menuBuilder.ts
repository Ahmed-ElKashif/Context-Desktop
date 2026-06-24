import { ActionContext } from './types';
import { ALL_ACTIONS } from './actionRegistry';
import { ContextMenuItem } from '../../../../components/ui/feedback/ContextMenu';

export const buildContextMenu = (ctx: ActionContext): ContextMenuItem[] => {
  // 1. Filter out actions that should not be visible in this context
  const visibleActions = ALL_ACTIONS.filter((action) => action.isVisible(ctx));

  // 2. Group the actions
  const groupedActions: Record<string, typeof visibleActions> = {
    primary: [],
    download: [],
    ai: [],
    modify: [],
    danger: [],
    empty_area: [],
  };

  visibleActions.forEach((action) => {
    groupedActions[action.group].push(action);
  });

  // 3. Assemble the final array with separators
  const finalItems: ContextMenuItem[] = [];
  const groupsToRender = ['primary', 'download', 'ai', 'modify', 'danger', 'empty_area'];

  groupsToRender.forEach((groupKey) => {
    const groupItems = groupedActions[groupKey];
    if (groupItems.length > 0) {
      // Add separator before a new group if we already have items
      if (finalItems.length > 0) {
        finalItems.push({ isSeparator: true });
      }

      // Map MenuAction to ContextMenuItem
      groupItems.forEach((action) => {
        finalItems.push({
          label: action.label(ctx),
          icon: action.icon,
          iconColor: action.iconColor,
          shortcut: action.shortcut,
          destructive: action.destructive,
          isColorPicker: action.isColorPicker,
          folderColor: action.isColorPicker && ctx.clickedItem?.type === "folder" 
            ? (ctx.clickedItem.item as any).color 
            : undefined,
          onColorSelect: action.isColorPicker
            ? (colorHex: string) => {
                const targetId = ctx.clickedItem?.type === "folder"
                  ? ctx.clickedItem.item._id
                  : ctx.selectedFolderIds[0];
                if (targetId) {
                  ctx.handlers.onChangeFolderColor(targetId, colorHex);
                }
              }
            : undefined,
          onClick: () => action.execute(ctx),
        });
      });
    }
  });

  return finalItems;
};
