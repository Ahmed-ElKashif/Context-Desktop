import { Icon } from "../../../../components/ui/Icons";

export interface UploadTreeNode {
  name: string;
  isFolder: boolean;
  children: Record<string, UploadTreeNode>;
}

export const buildFileTree = (paths: string[]): Record<string, UploadTreeNode> => {
  const root: Record<string, UploadTreeNode> = {};

  paths.forEach((path) => {
    // Clean up paths that start with "./" or "/"
    const cleanPath = path.replace(/^\.?\//, "");
    const segments = cleanPath.split("/").filter(Boolean);

    let currentLevel = root;

    segments.forEach((segment, index) => {
      const isFile = index === segments.length - 1;
      if (!currentLevel[segment]) {
        currentLevel[segment] = {
          name: segment,
          isFolder: !isFile,
          children: {},
        };
      }
      currentLevel = currentLevel[segment].children;
    });
  });

  return root;
};

export const FileTreeViewer = ({
  tree,
  level = 0,
}: {
  tree: Record<string, UploadTreeNode>;
  level?: number;
}) => {
  // Sort folders first, then alphabetically
  const sortedNodes = Object.values(tree).sort((a, b) => {
    if (a.isFolder === b.isFolder) {
      return a.name.localeCompare(b.name);
    }
    return a.isFolder ? -1 : 1;
  });

  return (
    <div className="w-full">
      {sortedNodes.map((node, index) => (
        <div key={`${node.name}-${index}`}>
          <div
            className="flex items-center gap-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md pr-2 w-full overflow-hidden"
            style={{ paddingLeft: `${level * 20 + 8}px` }}
          >
            <Icon
              name={node.isFolder ? "folder" : "description"}
              className={`text-sm shrink-0 ${
                node.isFolder
                  ? "text-yellow-500"
                  : "text-light-text/50 dark:text-white/40"
              }`}
            />
            <span className="font-mono text-sm font-medium text-light-text/80 dark:text-white/70 truncate flex-1 min-w-0">
              {node.name}
            </span>
          </div>
          {node.isFolder && (
            <FileTreeViewer tree={node.children} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  );
};
