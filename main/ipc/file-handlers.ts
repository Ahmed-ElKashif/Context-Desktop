import { ipcMain, dialog, shell, app } from "electron";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import FormData from "form-data";
import mime from "mime-types";
import { IPC_CHANNELS } from "../../shared/ipc-channels";
import { getMainWindow } from "../windows/window-manager";

const SUPPORTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function registerFileHandlers() {

  ipcMain.handle(IPC_CHANNELS.FILE.SHOW_ITEM_IN_FOLDER, (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle(IPC_CHANNELS.FILE.SELECT_DIRECTORY, async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE.EXPORT_ORGANIZED_FILES,
    async (_event, files: { url: string; relativePath: string; localSourcePath?: string }[]) => {
      try {
        const mainWindow = getMainWindow();
        if (!mainWindow) throw new Error("No main window");
        
        // Force explicit user consent by asking for the destination directory in the backend!
        const result = await dialog.showOpenDialog(mainWindow, {
          title: "Select Destination to Export Files",
          properties: ["openDirectory", "createDirectory"],
        });

        if (result.canceled || result.filePaths.length === 0) return null;
        const baseDir = result.filePaths[0];

        console.log(`[Main Process] Exporting ${files.length} files to ${baseDir}`);
        for (const file of files) {
          if (!file.url && !file.localSourcePath) continue;
          if (!file.relativePath) continue;
          
          const targetPath = path.resolve(baseDir, file.relativePath);
          const resolvedBaseDir = path.resolve(baseDir);
          
          // Security check: Prevent Path Traversal
          if (!targetPath.startsWith(resolvedBaseDir)) {
            throw new Error(`Security Exception: Path traversal attempt detected for ${file.relativePath}`);
          }
          
          const targetDir = path.dirname(targetPath);
          
          if (!fs.existsSync(targetDir)) {
            await fs.promises.mkdir(targetDir, { recursive: true });
          }
          
          if (file.localSourcePath && fs.existsSync(file.localSourcePath)) {
            await fs.promises.copyFile(file.localSourcePath, targetPath);
          } else if (file.url) {
            const response = await axios({
              method: 'GET',
              url: file.url,
              responseType: 'stream'
            });
            
            const writer = fs.createWriteStream(targetPath);
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });
          }
        }
        return { success: true };
      } catch (err: any) {
        console.error("[Main Process] ExportOrganizedFiles error:", err);
        throw err;
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.FILE.SELECT_BATCH_FOLDER, async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) return null;

    const folderPath = result.filePaths[0];
    const fileList: any[] = [];
    let iterations = 0;

    const walkAsync = async (dir: string) => {
      if (fileList.length >= 6) return;
      try {
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
          if (++iterations > 2000) return;
          if (fileList.length >= 6) break;
          if (file === "node_modules" || file === ".git") continue;
          
          const filepath = path.join(dir, file);
          const stat = await fs.promises.stat(filepath);
          if (stat.isDirectory()) {
            await walkAsync(filepath);
          } else {
            const fileMime = mime.lookup(filepath) || "";
            if (SUPPORTED_TYPES.includes(fileMime)) {
              const rootParent = path.dirname(folderPath);
              const clientPath = path.relative(rootParent, filepath).replace(/\\/g, '/');
              fileList.push({
                name: file,
                path: filepath,
                clientPath: clientPath,
                type: fileMime,
                mimeType: fileMime,
                size: stat.size,
              });
            }
          }
        }
      } catch (err) {
        console.error(`[Main Process] Error reading directory ${dir}:`, err);
      }
    };

    await walkAsync(folderPath);
    return { folderPath, files: fileList };
  });

  ipcMain.handle(IPC_CHANNELS.FILE.INGEST_BATCH_START, async (event, { token, apiUrl, files, clientPaths, folderId }) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return;

    // SECURITY CHECK: Lock down the API URL using strict hostname parsing to prevent subdomain bypasses
    try {
      const parsedUrl = new URL(apiUrl);
      const allowedHostnames = ['context-sfs.up.railway.app', 'localhost'];
      if (!allowedHostnames.includes(parsedUrl.hostname)) {
        throw new Error("Hostname not in allowed list");
      }
    } catch (err) {
      console.error(`[Security] Blocked unauthorized upload attempt to: ${apiUrl}`);
      throw new Error("Unauthorized API URL");
    }
    
    try {
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append("files", fs.createReadStream(file.path), file.name);
        
        // Use the explicit clientPaths array if provided (handles folder renaming!)
        if (clientPaths && clientPaths[i]) {
          formData.append("clientPaths", clientPaths[i]);
        } else if (file.clientPath) {
          formData.append("clientPaths", file.clientPath);
        } else {
          formData.append("clientPaths", file.name);
        }
      }

      if (folderId) {
        formData.append("folderId", folderId);
      }
      
      const response = await axios.post(`${apiUrl}/documents/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      return response.data;
    } catch (err: any) {
      console.error("[Main Process] Batch upload error:", err.message);
      throw err;
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE.PROCESS_DROPPED_PATHS, async (_event, paths: string[]) => {
    if (!paths || paths.length === 0) return null;

    const fileList: any[] = [];
    let iterations = 0;

    const walkAsync = async (dir: string, rootFolder: string) => {
      if (fileList.length >= 6) return;
      try {
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
          if (++iterations > 2000) return;
          if (fileList.length >= 6) break;
          if (file === "node_modules" || file === ".git") continue;
          
          const filepath = path.join(dir, file);
          const stat = await fs.promises.stat(filepath);
          if (stat.isDirectory()) {
            await walkAsync(filepath, rootFolder);
          } else {
            const fileMime = mime.lookup(filepath) || "";
            if (SUPPORTED_TYPES.includes(fileMime)) {
              const rootParent = path.dirname(rootFolder);
              const clientPath = path.relative(rootParent, filepath).replace(/\\/g, '/');
              fileList.push({
                name: file,
                path: filepath,
                clientPath: clientPath,
                type: fileMime,
                mimeType: fileMime,
                size: stat.size,
              });
            }
          }
        }
      } catch (err) {
        console.error(`[Main Process] Error reading dropped directory ${dir}:`, err);
      }
    };

    for (const itemPath of paths) {
      if (++iterations > 2000) break;
      if (fileList.length >= 6) break;
      try {
        if (!fs.existsSync(itemPath)) continue;
        const stat = await fs.promises.stat(itemPath);
        if (stat.isDirectory()) {
          await walkAsync(itemPath, itemPath);
        } else {
          const fileMime = mime.lookup(itemPath) || "";
          if (SUPPORTED_TYPES.includes(fileMime)) {
            fileList.push({
              name: path.basename(itemPath),
              path: itemPath,
              clientPath: path.basename(itemPath),
              type: fileMime,
              mimeType: fileMime,
              size: stat.size,
            });
          }
        }
      } catch (err) {
        console.error(`Failed to process path: ${itemPath}`, err);
      }
    }

    return { files: fileList };
  });


  ipcMain.handle(IPC_CHANNELS.FILE.SAVE_COMPARISON_REPORT, async (_event, content: string, defaultFilename: string) => {
    try {
      const mainWindow = getMainWindow();
      if (!mainWindow) throw new Error("Main window not found");
      
      const defaultPath = path.join(app.getPath("downloads"), defaultFilename);
      
      const result = await dialog.showSaveDialog(mainWindow, {
        title: "Save Comparison Report",
        defaultPath: defaultPath,
        filters: [{ name: "Markdown", extensions: ["md"] }, { name: "Text", extensions: ["txt"] }, { name: "All Files", extensions: ["*"] }]
      });
      
      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content, 'utf8');
        return { success: true, filePath: result.filePath };
      }
      return { success: false, canceled: true };
    } catch (err: any) {
      console.error("[Main Process] SaveComparisonReport error:", err);
      throw err;
    }
  });
}
