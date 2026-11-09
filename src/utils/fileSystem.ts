export interface FileNode {
  path: string; // e.g. "src/App.tsx"
  name: string; // e.g. "App.tsx"
  isDirectory: boolean;
  content?: string;
  children?: FileNode[];
}

// Convert flat path map { "src/App.tsx": "..." } into nested tree
export function buildFileTree(files: Record<string, string>): FileNode[] {
  const root: Record<string, any> = {};

  for (const [fullPath, content] of Object.entries(files)) {
    const parts = fullPath.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          __node: {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            isDirectory: !isFile,
            content: isFile ? content : undefined,
            childrenMap: isFile ? undefined : {},
          },
        };
      } else if (isFile) {
        current[part].__node.content = content;
        current[part].__node.isDirectory = false;
      }

      if (!isFile) {
        current = current[part].__node.childrenMap;
      }
    }
  }

  function mapChildren(obj: Record<string, any>): FileNode[] {
    const list: FileNode[] = [];
    for (const key of Object.keys(obj).sort()) {
      const node = obj[key].__node;
      const fileNode: FileNode = {
        name: node.name,
        path: node.path,
        isDirectory: node.isDirectory,
        content: node.content,
      };
      if (node.childrenMap) {
        fileNode.children = mapChildren(node.childrenMap);
        // Sort folders first, then files alphabetically
        fileNode.children.sort((a, b) => {
          if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
          }
          return a.isDirectory ? -1 : 1;
        });
      }
      list.push(fileNode);
    }
    return list.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });
  }

  return mapChildren(root);
}

// Map file extensions to Monaco editor languages
export function getMonacoLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'py':
      return 'python';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'xml':
    case 'svg':
      return 'xml';
    case 'java':
      return 'java';
    case 'c':
    case 'h':
      return 'c';
    case 'cpp':
    case 'hpp':
      return 'cpp';
    case 'php':
      return 'php';
    default:
      return 'plaintext';
  }
}

// Validate file path
export function isValidFilePath(path: string): boolean {
  if (!path || path.trim() === '') return false;
  if (path.includes('..')) return false;
  if (/^[/\\]/.test(path)) return false;
  if (/[<>:"|?*]/.test(path)) return false;
  return true;
}

// Rename file or folder in files map
export function renamePathInFiles(
  files: Record<string, string>,
  oldPath: string,
  newPath: string
): Record<string, string> {
  const updated: Record<string, string> = {};
  for (const [path, content] of Object.entries(files)) {
    if (path === oldPath) {
      updated[newPath] = content;
    } else if (path.startsWith(`${oldPath}/`)) {
      const rest = path.slice(oldPath.length);
      updated[`${newPath}${rest}`] = content;
    } else {
      updated[path] = content;
    }
  }
  return updated;
}

// Delete file or folder in files map
export function deletePathInFiles(
  files: Record<string, string>,
  targetPath: string
): Record<string, string> {
  const updated: Record<string, string> = {};
  for (const [path, content] of Object.entries(files)) {
    if (path !== targetPath && !path.startsWith(`${targetPath}/`)) {
      updated[path] = content;
    }
  }
  return updated;
}
