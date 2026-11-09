import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
  X,
  FileCode,
  FileJson,
  FileSpreadsheet,
  PanelLeftClose,
} from 'lucide-react';
import { FileNode } from '../utils/fileSystem.ts';

interface FileExplorerProps {
  fileTree: FileNode[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string, initialContent?: string) => void;
  onCreateFolder: (path: string) => void;
  onRenamePath: (oldPath: string, newPath: string) => void;
  onDeletePath: (path: string) => void;
  onDuplicateFile: (path: string) => void;
  onToggleCollapse?: () => void;
  width?: number;
  onWidthChange?: (newWidth: number) => void;
  isMobile?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  fileTree,
  activeFile,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenamePath,
  onDeletePath,
  onDuplicateFile,
  onToggleCollapse,
  width = 250,
  onWidthChange,
  isMobile = false,
  onCloseMobileDrawer,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('maya_open_folders');
      return saved ? JSON.parse(saved) : { src: true, components: true };
    } catch {
      return { src: true, components: true };
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [targetParentPath, setTargetParentPath] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  // Persist open folders
  useEffect(() => {
    try {
      localStorage.setItem('maya_open_folders', JSON.stringify(openFolders));
    } catch {}
  }, [openFolders]);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const startCreate = (type: 'file' | 'folder', parent = '') => {
    setCreatingType(type);
    setTargetParentPath(parent);
    setNewItemName('');
  };

  const submitCreate = () => {
    if (!newItemName.trim()) {
      setCreatingType(null);
      return;
    }
    const fullPath = targetParentPath ? `${targetParentPath}/${newItemName.trim()}` : newItemName.trim();
    if (creatingType === 'file') {
      onCreateFile(fullPath, '// New file in Maya AI Studio\n');
      onSelectFile(fullPath);
      if (isMobile && onCloseMobileDrawer) {
        onCloseMobileDrawer();
      }
    } else if (creatingType === 'folder') {
      onCreateFolder(fullPath);
    }
    setCreatingType(null);
    setNewItemName('');
  };

  const startRename = (path: string, currentName: string) => {
    setRenamingPath(path);
    setRenameValue(currentName);
  };

  const submitRename = (oldPath: string) => {
    if (!renameValue.trim() || renameValue === oldPath.split('/').pop()) {
      setRenamingPath(null);
      return;
    }
    const parts = oldPath.split('/');
    parts.pop();
    const newPath = parts.length > 0 ? `${parts.join('/')}/${renameValue.trim()}` : renameValue.trim();
    onRenamePath(oldPath, newPath);
    setRenamingPath(null);
  };

  // Resize drag handle handlers (Desktop only)
  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const nextWidth = Math.min(480, Math.max(180, startWidthRef.current + delta));
      if (onWidthChange) {
        onWidthChange(nextWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <FileCode className="w-3.5 h-3.5 text-neutral-300 shrink-0" />;
      case 'json':
        return <FileJson className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
      case 'sql':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'css':
      case 'scss':
        return <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
    }
  };

  const renderNode = (node: FileNode, depth = 0) => {
    if (searchQuery && !node.path.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    const isFolder = node.isDirectory;
    const isOpen = openFolders[node.path] ?? false;
    const isSelected = activeFile === node.path;
    const isRenaming = renamingPath === node.path;

    return (
      <div key={node.path} className="flex flex-col">
        <div
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`group flex items-center justify-between py-1.5 px-2 rounded cursor-pointer text-xs transition ${
            isSelected
              ? 'bg-[#222222] text-white font-medium'
              : 'text-neutral-400 hover:text-white hover:bg-[#161616]'
          }`}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              onSelectFile(node.path);
              if (isMobile && onCloseMobileDrawer) {
                onCloseMobileDrawer();
              }
            }
          }}
        >
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            {isFolder ? (
              <>
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-neutral-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-neutral-500 shrink-0" />
                )}
                {isOpen ? (
                  <FolderOpen className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
              </>
            ) : (
              getFileIcon(node.name)
            )}

            {isRenaming ? (
              <div
                className="flex items-center space-x-1 flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRename(node.path);
                    if (e.key === 'Escape') setRenamingPath(null);
                  }}
                  autoFocus
                  className="bg-black border border-neutral-700 text-white px-1 py-0.5 rounded text-xs w-full focus:outline-none"
                />
                <button
                  onClick={() => submitRename(node.path)}
                  className="p-0.5 hover:text-emerald-400"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setRenamingPath(null)}
                  className="p-0.5 hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="truncate select-none">{node.name}</span>
            )}
          </div>

          {/* Node Actions */}
          <div
            className="hidden group-hover:flex items-center space-x-1 shrink-0 ml-1"
            onClick={(e) => e.stopPropagation()}
          >
            {isFolder && (
              <button
                onClick={() => startCreate('file', node.path)}
                className="p-1 hover:text-white text-neutral-500 rounded"
                title="New file in folder"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => startRename(node.path, node.name)}
              className="p-1 hover:text-white text-neutral-500 rounded"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {!isFolder && (
              <button
                onClick={() => onDuplicateFile(node.path)}
                className="p-1 hover:text-white text-neutral-500 rounded"
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => onDeletePath(node.path)}
              className="p-1 hover:text-rose-400 text-neutral-500 rounded"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Children if folder is expanded */}
        {isFolder && isOpen && node.children && (
          <div className="flex flex-col">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const containerStyle = isMobile
    ? { width: '85vw', maxWidth: '340px' }
    : { width: `${width}px` };

  return (
    <div
      style={containerStyle}
      className={`bg-[#0e0e0e] border-r border-[#222222] flex flex-col h-full select-none shrink-0 text-white relative transition-all duration-150 ${
        isResizing ? 'select-none pointer-events-none' : ''
      }`}
    >
      {/* Explorer Header */}
      <div className="p-3 border-b border-[#222222] flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
          Explorer
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => startCreate('file')}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#1f1f1f] transition"
            title="New File in root"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => startCreate('folder')}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#1f1f1f] transition"
            title="New Folder in root"
          >
            <Folder className="w-3.5 h-3.5" />
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#1f1f1f] transition"
              title="Hide Explorer (Ctrl+B)"
              aria-label="Hide Explorer"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
          {isMobile && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-[#1f1f1f] transition ml-1"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* File Search Input */}
      <div className="p-2 border-b border-[#1c1c1c] shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-[#141414] border border-[#262626] rounded text-xs pl-7 pr-2 py-1 text-white placeholder-neutral-500 focus:outline-none focus:border-[#444]"
          />
        </div>
      </div>

      {/* Inline Create Input */}
      {creatingType && (
        <div className="p-2 bg-[#161616] border-b border-[#2a2a2a] flex items-center space-x-1 shrink-0">
          {creatingType === 'folder' ? (
            <Folder className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          )}
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitCreate();
              if (e.key === 'Escape') setCreatingType(null);
            }}
            placeholder={
              creatingType === 'folder'
                ? 'folder name...'
                : 'filename.ts...'
            }
            autoFocus
            className="bg-black border border-[#333] text-white px-2 py-1 rounded text-xs flex-1 focus:outline-none"
          />
          <button onClick={submitCreate} className="p-1 hover:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setCreatingType(null)} className="p-1 hover:text-rose-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
        {fileTree.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 text-xs">No files in project</div>
        ) : (
          fileTree.map((node) => renderNode(node))
        )}
      </div>

      {/* Bottom Status */}
      <div className="p-2.5 border-t border-[#1c1c1c] text-[10px] text-neutral-500 flex items-center justify-between font-mono shrink-0">
        <span>{fileTree.length} root items</span>
        <span className="text-neutral-400">Cloud Synced</span>
      </div>

      {/* Draggable Resizer Bar (Desktop only) */}
      {!isMobile && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-neutral-600 active:bg-white transition-colors z-20"
          title="Drag to resize Explorer width"
        />
      )}
    </div>
  );
};
