import { MenuAction, ActionContext } from './types';
import { DocumentData, FolderData } from '../../../../store/library/librarySlice';
import { handleDownload, downloadMarkdownAsFile, generateRawMarkdownString } from '../../../../utils/downloadUtils';

const isSingleDoc = (ctx: ActionContext) => {
  return (
    (ctx.clickedItem?.type === 'doc' && !ctx.selectedDocIds.includes(ctx.clickedItem.item._id) && ctx.totalSelected <= 1) ||
    (ctx.clickedItem?.type === 'doc' && ctx.selectedDocIds.includes(ctx.clickedItem.item._id) && ctx.totalSelected === 1)
  );
};

const isSingleFolder = (ctx: ActionContext) => {
  return (
    (ctx.clickedItem?.type === 'folder' && !ctx.selectedFolderIds.includes(ctx.clickedItem.item._id) && ctx.totalSelected <= 1) ||
    (ctx.clickedItem?.type === 'folder' && ctx.selectedFolderIds.includes(ctx.clickedItem.item._id) && ctx.totalSelected === 1)
  );
};

const isMultiSelect = (ctx: ActionContext) => ctx.totalSelected > 1;

export const ACTION_FOLDER_COLOR: MenuAction = {
  id: "folder_color",
  label: () => "Folder color",
  icon: "palette",
  group: "modify",
  isColorPicker: true,
  isVisible: (ctx) =>
    ctx.selectedFolderIds.length === 1 && ctx.selectedDocIds.length === 0,
  execute: () => {}, // Handled directly by the custom component in ContextMenu
};

export const ALL_ACTIONS: MenuAction[] = [
  // ==========================================
  // PRIMARY GROUP
  // ==========================================
  {
    id: 'open_reader',
    label: () => "Open in Reader",
    icon: "menu_book",
    shortcut: "Enter",
    group: 'primary',
    isVisible: isSingleDoc,
    execute: (ctx) => ctx.handlers.onOpenDocReader(ctx.clickedItem!.item as DocumentData),
  },
  {
    id: 'open_workspace',
    label: () => "Open in Workspace",
    icon: "space_dashboard",
    group: 'primary',
    isVisible: isSingleDoc,
    execute: (ctx) => ctx.handlers.onOpenDocWorkspace(ctx.clickedItem!.item as DocumentData),
  },
  {
    id: 'open_folder',
    label: () => "Open",
    icon: "folder_open",
    shortcut: "Enter",
    group: 'primary',
    isVisible: isSingleFolder,
    execute: (ctx) => ctx.handlers.onOpenFolder(ctx.clickedItem!.item as FolderData),
  },

  // ==========================================
  // DOWNLOAD GROUP
  // ==========================================
  {
    id: 'download_doc',
    label: () => "Download",
    icon: "download",
    group: 'download',
    isVisible: isSingleDoc,
    execute: (ctx) => {
      const doc = ctx.clickedItem!.item as DocumentData;
      if (doc.fileType === "TextSnippet") {
        downloadMarkdownAsFile(generateRawMarkdownString(doc), doc.title);
      } else {
        handleDownload(doc.cloudinaryUrl || null, doc.title);
      }
    },
  },
  {
    id: 'download_folder',
    label: () => "Download Folder (ZIP)",
    icon: "download",
    group: 'download',
    isVisible: isSingleFolder,
    execute: (ctx) => {
      const folder = ctx.clickedItem!.item as FolderData;
      ctx.handlers.onDownloadFolder(folder._id, folder.name);
    },
  },
  {
    id: 'download_bulk',
    label: (ctx) => `Download All (${ctx.totalSelected})`,
    icon: "download",
    group: 'download',
    isVisible: isMultiSelect,
    execute: (ctx) => ctx.handlers.onBulkDownload(),
  },

  // ==========================================
  // AI GROUP
  // ==========================================
  {
    id: 'organize_ai',
    label: () => "Organize With AI",
    icon: "account_tree",
    iconColor: "text-green-500",
    group: 'ai',
    isVisible: (ctx) => {
      if (isSingleDoc(ctx)) return true;
      if (isMultiSelect(ctx) && ctx.selectedDocIds.length > 0) return true; // Docs only or Mixed
      if (isSingleFolder(ctx)) {
        return !(ctx.clickedItem!.item as FolderData).isAIGenerated;
      }
      return false;
    },
    execute: (ctx) => {
      if (isSingleFolder(ctx)) {
        ctx.handlers.onOrganizeAI((ctx.clickedItem!.item as FolderData)._id);
      } else {
        ctx.handlers.onOrganizeAI();
      }
    },
  },
  {
    id: 'synthesize_ai',
    label: () => "Synthesize With AI",
    icon: "psychology",
    iconColor: "text-purple-500",
    group: 'ai',
    isVisible: (ctx) => {
      if (isSingleFolder(ctx)) return true;
      if (isMultiSelect(ctx) && ctx.selectedDocIds.length > 0) return true; // Docs only or Mixed
      return false;
    },
    execute: (ctx) => {
      if (isSingleFolder(ctx)) {
        ctx.handlers.onSynthesizeAI((ctx.clickedItem!.item as FolderData)._id);
      } else {
        ctx.handlers.onSynthesizeAI();
      }
    },
  },

  // ==========================================
  // MODIFY GROUP
  // ==========================================
  {
    id: 'move',
    label: (ctx) => {
      if (isSingleDoc(ctx) || isSingleFolder(ctx)) return "Move to...";
      if (isMultiSelect(ctx) && ctx.selectedDocIds.length === 0) return `Move ${ctx.totalSelected} folders...`;
      if (isMultiSelect(ctx) && ctx.selectedFolderIds.length === 0) return `Move ${ctx.totalSelected} items...`;
      return `Move ${ctx.totalSelected} items...`; // mixed
    },
    icon: "drive_file_move",
    group: 'modify',
    isVisible: (ctx) => !!ctx.clickedItem || isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onMove(),
  },
  {
    id: 'copy',
    label: (ctx) => {
      if (isSingleDoc(ctx) || isSingleFolder(ctx)) return "Copy to...";
      if (isMultiSelect(ctx) && ctx.selectedDocIds.length === 0) return `Copy ${ctx.totalSelected} folders...`;
      if (isMultiSelect(ctx) && ctx.selectedFolderIds.length === 0) return `Copy ${ctx.totalSelected} items...`;
      return `Copy ${ctx.totalSelected} items...`; // mixed
    },
    icon: "content_copy",
    group: 'modify',
    isVisible: (ctx) => !!ctx.clickedItem || isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onCopy(),
  },
  {
    id: 'copy_clipboard',
    label: () => "Copy",
    icon: "file_copy",
    shortcut: "Ctrl+C",
    group: 'modify',
    isVisible: (ctx) => !!ctx.clickedItem || isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onCopyClipboard(),
  },
  {
    id: 'duplicate',
    label: () => "Make a copy",
    icon: "control_point_duplicate",
    group: 'modify',
    isVisible: (ctx) => !!ctx.clickedItem || isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onDuplicate(),
  },
  {
    id: 'rename',
    label: () => "Rename",
    icon: "edit",
    shortcut: "F2",
    group: 'modify',
    isVisible: (ctx) => {
      if (isSingleDoc(ctx)) return true;
      if (isSingleFolder(ctx)) {
        const folder = ctx.clickedItem!.item as FolderData;
        return !folder.isAIGenerated && folder.name.toLowerCase() !== "random files";
      }
      return false;
    },
    execute: (ctx) => {
      if (ctx.clickedItem?.type === 'doc') {
        ctx.handlers.onRenameDoc(ctx.clickedItem.item as DocumentData);
      } else if (ctx.clickedItem?.type === 'folder') {
        ctx.handlers.onRenameFolder((ctx.clickedItem.item as FolderData).path);
      }
    },
  },
  ACTION_FOLDER_COLOR,

  // ==========================================
  // DANGER GROUP
  // ==========================================
  {
    id: 'delete_single',
    label: () => "Delete",
    icon: "delete",
    destructive: true,
    shortcut: "Del",
    group: 'danger',
    isVisible: (ctx) => isSingleDoc(ctx) || isSingleFolder(ctx),
    execute: (ctx) => {
      if (ctx.clickedItem?.type === 'doc') {
        ctx.handlers.onDeleteDoc(ctx.clickedItem.item as DocumentData);
      } else if (ctx.clickedItem?.type === 'folder') {
        ctx.handlers.onDeleteFolder((ctx.clickedItem.item as FolderData).path);
      }
    },
  },
  {
    id: 'delete_bulk',
    label: (ctx) => {
      if (ctx.selectedDocIds.length === 0 && ctx.selectedFolderIds.length > 0) return `Delete ${ctx.totalSelected} folders`;
      return `Delete ${ctx.totalSelected} items`;
    },
    icon: "delete",
    destructive: true,
    shortcut: "Del",
    group: 'danger',
    isVisible: isMultiSelect,
    execute: (ctx) => ctx.handlers.onBulkDelete(),
  },

  // ==========================================
  // EMPTY AREA GROUP
  // ==========================================
  {
    id: 'new_folder',
    label: () => "New Folder",
    icon: "create_new_folder",
    shortcut: "Ctrl+Shift+N",
    group: 'empty_area',
    isVisible: (ctx) => !ctx.clickedItem && !isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onCreateFolder(),
  },
  {
    id: 'select_all',
    label: () => "Select All",
    icon: "select_all",
    shortcut: "Ctrl+A",
    group: 'empty_area',
    isVisible: (ctx) => !ctx.clickedItem && !isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onSelectAll(),
  },
  {
    id: 'paste_clipboard',
    label: () => "Paste",
    icon: "content_paste",
    shortcut: "Ctrl+V",
    group: 'empty_area',
    isVisible: (ctx) => !ctx.clickedItem && !isMultiSelect(ctx) && (ctx.handlers.clipboardState.documentIds.length > 0 || ctx.handlers.clipboardState.folderIds.length > 0),
    execute: (ctx) => ctx.handlers.onPasteClipboard(),
  },
  {
    id: 'upload_files',
    label: () => "Files upload",
    icon: "upload_file",
    group: 'empty_area',
    isVisible: (ctx) => !ctx.clickedItem && !isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onUploadFilesInCurrentDir(),
  },
  {
    id: 'upload_folder',
    label: () => "Folder upload",
    icon: "drive_folder_upload",
    group: 'empty_area',
    isVisible: (ctx) => !ctx.clickedItem && !isMultiSelect(ctx),
    execute: (ctx) => ctx.handlers.onUploadFolderInCurrentDir(),
  },
];
