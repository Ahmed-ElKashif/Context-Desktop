import { DropEvent } from "react-dropzone";

const VALID_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
  ".xlsx",
  ".xls",
  ".csv",
]);

const isValidExtension = (name: string) => {
  const ext = name.slice(((name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
  return VALID_EXTENSIONS.has(`.${ext}`);
};

/**
 * A custom interceptor for react-dropzone that uses "Early Termination".
 * If the user drops a folder with 50,000 files, this instantly aborts the
 * recursive file system walk the exact millisecond it finds 5 valid files,
 * completely preventing the browser tab from freezing.
 */
export async function customGetFilesFromEvent(
  e: DropEvent
): Promise<(File | DataTransferItem)[]> {
  const files: File[] = [];
  const event = e as any; // Cast to access native properties

  // 1. Fallback for standard <input type="file" /> clicks
  if (event.target && event.target.files) {
    return Array.from(event.target.files);
  }

  // 2. Process Drag and Drop Events
  if (event.dataTransfer && event.dataTransfer.items) {
    const items = Array.from(event.dataTransfer.items) as DataTransferItem[];
    let validCount = 0;
    let iterationCount = 0;
    const MAX_ITERATIONS = 2000; // Safety fallback
    const MAX_VALID_FILES = 6; // Early termination target

    const readEntry = async (entry: any, path = ""): Promise<void> => {
      iterationCount++;
      // Early Termination: Stop recursion instantly
      if (validCount >= MAX_VALID_FILES || iterationCount > MAX_ITERATIONS) return;
      
      // Skip large unnecessary directories
      if (entry.name === "node_modules" || entry.name === ".git") return;

      if (entry.isFile) {
        return new Promise<void>((resolve) => {
          entry.file((file: File) => {
            if (isValidExtension(file.name)) {
              // Map the relative path to support folder-structures natively
              Object.defineProperty(file, "path", {
                value: path + file.name,
                writable: true,
                enumerable: true,
                configurable: true,
              });
              files.push(file);
              validCount++;
            }
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        return new Promise<void>((resolve) => {
          const readBatch = () => {
            dirReader.readEntries(async (entries: any[]) => {
              if (entries.length === 0) {
                resolve();
              } else {
                for (const child of entries) {
                  if (validCount >= MAX_VALID_FILES || iterationCount > MAX_ITERATIONS) {
                    resolve();
                    return;
                  }
                  await readEntry(child, path + entry.name + "/");
                }
                // Call readBatch again because readEntries only returns up to 100 entries at a time
                readBatch();
              }
            });
          };
          readBatch();
        });
      }
    };

    for (const item of items) {
      if (validCount >= MAX_VALID_FILES || iterationCount > MAX_ITERATIONS) break;
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) {
          await readEntry(entry);
        } else {
          // Fallback if webkitGetAsEntry is not supported
          const file = item.getAsFile();
          if (file && isValidExtension(file.name)) {
            files.push(file);
            validCount++;
          }
        }
      }
    }
  } else if (event.dataTransfer && event.dataTransfer.files) {
    return Array.from(event.dataTransfer.files);
  }

  return files;
}

export async function handleWebNativeFolderSelect(): Promise<File[] | null> {
  try {
    // @ts-expect-error: TypeScript might not recognize showDirectoryPicker
    const dirHandle = await window.showDirectoryPicker();
    const files: File[] = [];
    let iterations = 0;
    const MAX_ITERATIONS = 20000;
    const MAX_VALID_FILES = 6;

    const walkAsync = async (handle: any, path: string) => {
      if (files.length >= MAX_VALID_FILES) return;
      for await (const entry of handle.values()) {
        if (++iterations > MAX_ITERATIONS) return;
        if (files.length >= MAX_VALID_FILES) break;
        if (entry.name === "node_modules" || entry.name === ".git") continue;

        if (entry.kind === "file") {
          if (isValidExtension(entry.name)) {
            const file = await entry.getFile();
            Object.defineProperty(file, "path", { value: path + entry.name });
            Object.defineProperty(file, "webkitRelativePath", { value: path + entry.name });
            files.push(file);
          }
        } else if (entry.kind === "directory") {
          await walkAsync(entry, path + entry.name + "/");
        }
      }
    };

    await walkAsync(dirHandle, dirHandle.name + "/");
    return files;
  } catch (err: any) {
    // User cancelled the picker
    if (err.name === 'AbortError') return null;
    throw err;
  }
}
