import { DocumentData, FolderData } from "../../../../store/library/librarySlice";

export interface UseContextMenuOptions {
  onOpenDocReader: (doc: DocumentData) => void;
  onOpenDocWorkspace: (doc: DocumentData) => void;
  onOpenFolder: (folder: FolderData) => void;
  onRenameDoc: (doc: DocumentData) => void;
  onRenameFolder: (folderPath: string) => void;
  onDeleteDoc: (doc: DocumentData) => void;
  onDeleteFolder: (folderPath: string) => void;
  onBulkDelete: () => void;
  onDownloadFolder: (folderId: string, folderName: string) => void;
  onBulkDownload: () => void;
  onOrganizeAI: (folderId?: string) => void;
  onSynthesizeAI: (folderId?: string) => void;
  onSelectAll: () => void;
  selectedDocIds: string[];
  selectedFolderIds: string[];
  onCreateFolder: () => void;
  onUploadFilesInCurrentDir: () => void;
  onUploadFolderInCurrentDir: () => void;
  onMove: () => void;
  onCopy: () => void;
  onChangeFolderColor: (folderId: string, color: string) => void;
  clipboardState: { action: "copy" | null; documentIds: string[]; folderIds: string[] };
  onDuplicate: () => void;
  onCopyClipboard: () => void;
  onPasteClipboard: () => void;
}

export interface ActionContext {
  clickedItem?: { type: "doc" | "folder"; item: DocumentData | FolderData };
  totalSelected: number;
  selectedDocIds: string[];
  selectedFolderIds: string[];
  handlers: UseContextMenuOptions;
}

export type ActionGroup = 'primary' | 'download' | 'ai' | 'modify' | 'danger' | 'empty_area';

export interface MenuAction {
  id: string;
  label: (ctx: ActionContext) => string;
  icon: string;
  iconColor?: string;
  shortcut?: string;
  destructive?: boolean;
  group: ActionGroup;
  isVisible: (ctx: ActionContext) => boolean;
  execute: (ctx: ActionContext) => void;
  isColorPicker?: boolean;
}
