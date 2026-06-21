import { DocumentData, FolderData } from "../../../store/library/librarySlice";
import { useLibraryContextMenu } from "../../../contexts/ContextMenuContext";
import { ContextMenuItem } from "../../../components/ui/feedback/ContextMenu";
import { handleDownload, downloadTextAsFile } from "../../../utils/downloadUtils";

interface UseContextMenuOptions {
  onOpenDoc: (doc: DocumentData) => void;
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
  onUploadClick: () => void;
  onSelectAll: () => void;
  selectedDocIds: string[];
  selectedFolderIds: string[];
}

export const useContextMenu = ({
  onOpenDoc,
  onOpenFolder,
  onRenameDoc,
  onRenameFolder,
  onDeleteDoc,
  onDeleteFolder,
  onBulkDelete,
  onDownloadFolder,
  onBulkDownload,
  onOrganizeAI,
  onSynthesizeAI,
  onUploadClick,
  onSelectAll,
  selectedDocIds,
  selectedFolderIds,
}: UseContextMenuOptions) => {
  const { showMenu } = useLibraryContextMenu();

  const openMenu = (
    e: React.MouseEvent,
    clickedItem?: { type: "doc" | "folder"; item: DocumentData | FolderData },
    type?: "doc" | "folder"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const position = { x: e.clientX, y: e.clientY };
    const items: ContextMenuItem[] = [];

    const isDoc = clickedItem?.type === "doc" || type === "doc";
    const isFolder = clickedItem?.type === "folder" || type === "folder";
    const doc = isDoc ? (clickedItem?.item as DocumentData) : undefined;
    const folder = isFolder ? (clickedItem?.item as FolderData) : undefined;

    const totalSelected = selectedDocIds.length + selectedFolderIds.length;

    // --- CASE 1: Single item clicked that is NOT part of a multi-selection
    // (If it IS part of a multi-selection, we show bulk actions instead)
    if (
      (isDoc && doc && !selectedDocIds.includes(doc._id) && totalSelected <= 1) ||
      (isDoc && doc && selectedDocIds.includes(doc._id) && totalSelected === 1)
    ) {
      items.push(
        {
          label: "Open in Reader",
          icon: "menu_book",
          shortcut: "Enter",
          onClick: () => onOpenDoc(doc),
        },
        {
          label: "Open in Workspace",
          icon: "space_dashboard",
          onClick: () => onOpenDoc(doc),
        },
        { isSeparator: true },
        {
          label: "Download",
          icon: "download",
          onClick: () => {
            if (doc.fileType === "TextSnippet") {
              downloadTextAsFile(doc.extractedText || "", doc.title);
            } else {
              handleDownload(doc.cloudinaryUrl || null, doc.title);
            }
          },
        },
        /*{
          label: "Share",
          icon: "share",
          onClick: () => handleShareClick(doc.fileUrl),
        },*/
        { isSeparator: true },
        {
          label: "Organize With AI",
          icon: "account_tree",
          iconColor: "text-green-500",
          onClick: () => onOrganizeAI(),
        },
        { isSeparator: true },
        {
          label: "Rename",
          icon: "edit",
          shortcut: "F2",
          onClick: () => onRenameDoc(doc),
        },
        {
          label: "Delete",
          icon: "delete",
          destructive: true,
          shortcut: "Del",
          onClick: () => onDeleteDoc(doc),
        }
      );
    } 
    
    // --- CASE 2: Single folder clicked
    else if (
      (isFolder && folder && !selectedFolderIds.includes(folder._id) && totalSelected <= 1) ||
      (isFolder && folder && selectedFolderIds.includes(folder._id) && totalSelected === 1)
    ) {
      items.push({
        label: "Open",
        icon: "folder_open",
        shortcut: "Enter",
        onClick: () => onOpenFolder(folder),
      });

      items.push({
        label: "Download Folder (ZIP)",
        icon: "download",
        onClick: () => onDownloadFolder(folder._id, folder.name),
      });

      if (!folder.isAIGenerated) {
        items.push({
          label: "Organize With AI",
          icon: "account_tree",
          iconColor: "text-green-500",
          onClick: () => onOrganizeAI(folder._id),
        });
      }

      items.push({
        label: "Synthesize With AI",
        icon: "psychology",
        iconColor: "text-purple-500",
        onClick: () => onSynthesizeAI(folder._id),
      });

      items.push({ isSeparator: true });

      // Random files and AI generated folders cannot be renamed
      if (!folder.isAIGenerated && folder.name.toLowerCase() !== "random files") {
        items.push({
          label: "Rename",
          icon: "edit",
          shortcut: "F2",
          onClick: () => onRenameFolder(folder.path),
        });
      }

      // Delete is available for all folders
      items.push({
        label: "Delete",
        icon: "delete",
        destructive: true,
        shortcut: "Del",
        onClick: () => onDeleteFolder(folder.path),
      });
    } 
    
    // --- CASE 3: Multiple Documents ONLY
    else if (totalSelected > 1 && selectedDocIds.length > 0 && selectedFolderIds.length === 0) {
      items.push(
        {
          label: `Download All (${totalSelected})`,
          icon: "download",
          onClick: onBulkDownload,
        },
        { isSeparator: true },
        {
          label: "Organize With AI",
          icon: "account_tree",
          iconColor: "text-green-500",
          onClick: () => onOrganizeAI(),
        },
        {
          label: "Synthesize With AI",
          icon: "psychology",
          iconColor: "text-purple-500",
          onClick: () => onSynthesizeAI(),
        },
        { isSeparator: true },
        {
          label: `Delete ${totalSelected} items`,
          icon: "delete",
          destructive: true,
          shortcut: "Del",
          onClick: onBulkDelete,
        }
      );
    }

    // --- CASE 4: Multiple Folders ONLY
    else if (totalSelected > 1 && selectedDocIds.length === 0 && selectedFolderIds.length > 0) {
      items.push(
        {
          label: `Download All (${totalSelected})`,
          icon: "download",
          onClick: onBulkDownload,
        },
        { isSeparator: true },
        {
          label: `Delete ${totalSelected} folders`,
          icon: "delete",
          destructive: true,
          shortcut: "Del",
          onClick: onBulkDelete,
        }
      );
    }

    // --- CASE 5: Mixed Documents AND Folders
    else if (totalSelected > 1 && selectedDocIds.length > 0 && selectedFolderIds.length > 0) {
      items.push(
        {
          label: `Download All (${totalSelected})`,
          icon: "download",
          onClick: onBulkDownload,
        },
        { isSeparator: true },
        {
          label: "Organize With AI",
          icon: "account_tree",
          iconColor: "text-green-500",
          onClick: () => onOrganizeAI(),
        },
        {
          label: "Synthesize With AI",
          icon: "psychology",
          iconColor: "text-purple-500",
          onClick: () => onSynthesizeAI(),
        },
        { isSeparator: true },
        {
          label: `Delete ${totalSelected} items`,
          icon: "delete",
          destructive: true,
          shortcut: "Del",
          onClick: onBulkDelete,
        }
      );
    }

    // --- CASE 6: Empty Area (No Selection)
    else if (!clickedItem) {
      items.push(
        {
          label: "Select All",
          icon: "select_all",
          shortcut: "Ctrl+A",
          onClick: onSelectAll,
        },
        { isSeparator: true },
        {
          label: "Upload Files",
          icon: "upload_file",
          onClick: onUploadClick,
        }
      );
    }

    if (items.length > 0) {
      showMenu(items, position);
    }
  };

  return { openMenu };
};
