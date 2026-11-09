import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  FolderTree,
  Code,
  Play,
  Terminal,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Columns2,
  Maximize2,
  Split,
} from 'lucide-react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, ActiveNavTab } from './components/Sidebar.tsx';
import { FileExplorer } from './components/FileExplorer.tsx';
import { CodeEditor } from './components/CodeEditor.tsx';
import { LivePreview } from './components/LivePreview.tsx';
import { WorkspaceDivider } from './components/WorkspaceDivider.tsx';
import { WorkspaceMode, FullscreenTarget, SplitOrientation } from './types/workspace.ts';
import { AgentTeamPanel } from './components/AgentTeamPanel.tsx';
import { AutonomousRepairModal } from './components/AutonomousRepairModal.tsx';
import { TerminalPanel } from './components/TerminalPanel.tsx';
import { ModelManagementPanel } from './components/ModelManagementPanel.tsx';
import { DatabasePanel } from './components/DatabasePanel.tsx';
import { GitPanel, CommitEntry } from './components/GitPanel.tsx';
import { AIChatDrawer } from './components/AIChatDrawer.tsx';
import { TemplatesModal } from './components/TemplatesModal.tsx';
import { WorkspaceToolsModal } from './components/WorkspaceToolsModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { STARTER_TEMPLATES, ProjectTemplate } from './data/templates.ts';
import {
  buildFileTree,
  renamePathInFiles,
  deletePathInFiles,
  isValidFilePath,
} from './utils/fileSystem.ts';
import { packProjectToZip, unpackProjectFromZip } from './utils/zipService.ts';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
} from './lib/firebase.ts';

export default function App() {
  // Screen size and orientation detection
  const [windowDimensions, setWindowDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1200, height: 800 };
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isLandscape = windowWidth > windowHeight;

  // Centralized Dual Workspace System State
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(() => {
    try {
      const saved = localStorage.getItem('maya_workspace_mode');
      return saved === 'fullscreen' ? 'fullscreen' : 'split';
    } catch {
      return 'split';
    }
  });

  const [fullscreenTarget, setFullscreenTarget] = useState<FullscreenTarget>(() => {
    try {
      const saved = localStorage.getItem('maya_fullscreen_target');
      return saved === 'preview' ? 'preview' : 'editor';
    } catch {
      return 'editor';
    }
  });

  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>(() => {
    try {
      const saved = localStorage.getItem('maya_split_orientation');
      return saved === 'vertical' ? 'vertical' : saved === 'horizontal' ? 'horizontal' : 'auto';
    } catch {
      return 'auto';
    }
  });

  const [splitRatio, setSplitRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('maya_split_ratio');
      return saved ? parseFloat(saved) : 0.5;
    } catch {
      return 0.5;
    }
  });

  const [isSwapped, setIsSwapped] = useState<boolean>(() => {
    try {
      return localStorage.getItem('maya_split_swapped') === 'true';
    } catch {
      return false;
    }
  });

  // Persist Workspace preferences
  useEffect(() => {
    try {
      localStorage.setItem('maya_workspace_mode', workspaceMode);
      localStorage.setItem('maya_fullscreen_target', fullscreenTarget);
      localStorage.setItem('maya_split_orientation', splitOrientation);
      localStorage.setItem('maya_split_ratio', String(splitRatio));
      localStorage.setItem('maya_split_swapped', String(isSwapped));
    } catch {}
  }, [workspaceMode, fullscreenTarget, splitOrientation, splitRatio, isSwapped]);

  // Compute effective split orientation based on screen dimensions and user preference
  const effectiveOrientation: 'horizontal' | 'vertical' = useMemo(() => {
    if (splitOrientation === 'horizontal') return 'horizontal';
    if (splitOrientation === 'vertical') return 'vertical';
    // 'auto' orientation:
    // Narrow portrait mobile screens (< 768 portrait, or < 640): always VERTICAL split
    if (windowWidth < 640 || (windowWidth < 768 && !isLandscape)) {
      return 'vertical';
    }
    // Landscape mobile (>= 640 landscape) and desktop/tablet: HORIZONTAL split
    return 'horizontal';
  }, [splitOrientation, windowWidth, isLandscape]);

  const splitWorkspaceRef = useRef<HTMLDivElement>(null);

  // Active Project & Filesystem state
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState<string>('Maya AI Studio App');
  const [files, setFiles] = useState<Record<string, string>>(STARTER_TEMPLATES[0].files);
  const [activeFile, setActiveFile] = useState<string>('src/App.tsx');
  const [openTabs, setOpenTabs] = useState<string[]>(['src/App.tsx', 'index.html']);
  const [dirtyFiles, setDirtyFiles] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Explorer Visibility and Resizing Persistence
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('maya_explorer_visible') === 'false';
    } catch {
      return false;
    }
  });

  const [explorerWidth, setExplorerWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('maya_explorer_width');
      return saved ? parseInt(saved, 10) : 260;
    } catch {
      return 260;
    }
  });

  // Mobile Workspace Active Tab ('split' | 'editor' | 'preview' | 'files' | 'terminal' | 'agents')
  const [mobileActiveView, setMobileActiveView] = useState<
    'split' | 'editor' | 'preview' | 'files' | 'terminal' | 'agents'
  >('split');

  // Layout & Navigation State
  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab | null>('explorer');
  const [showTerminal, setShowTerminal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');

  // Modals & Panels State
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Diagnostics & Checkpoints
  const [activeErrorTrace, setActiveErrorTrace] = useState<string>('');
  const [checkpointFiles, setCheckpointFiles] = useState<Record<string, string> | null>(null);
  const [projectMemory, setProjectMemory] = useState<string>(
    'Maya AI Coding Studio application. Standard: React 19, TypeScript, Tailwind CSS, Cloud SQL PostgreSQL persistence, 8-agent autonomous workflows.'
  );
  const [commits, setCommits] = useState<CommitEntry[]>([
    {
      hash: 'init-001',
      message: 'Initial project scaffold and architecture',
      timestamp: Date.now() - 3600000,
      filesSnapshot: STARTER_TEMPLATES[0].files,
    },
  ]);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Hidden file input for ZIP import
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser, token) => {
      setUser(currentUser);
      setIdToken(token);
    });
    return () => unsubscribe();
  }, []);

  // Keyboard shortcut listener (Ctrl/Cmd + S to save, Ctrl/Cmd + B to toggle Explorer, Ctrl/Cmd + ` for terminal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleExplorer();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setShowTerminal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files, projectName, idToken, projectId, isExplorerCollapsed]);

  // Build tree from files
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  // Toggle Explorer Visibility with Persistence
  const handleToggleExplorer = () => {
    setIsExplorerCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('maya_explorer_visible', next ? 'false' : 'true');
      } catch {}
      return next;
    });
  };

  const handleWidthChange = (newWidth: number) => {
    setExplorerWidth(newWidth);
    try {
      localStorage.setItem('maya_explorer_width', String(newWidth));
    } catch {}
  };

  // File Operations
  const handleSelectFile = (path: string) => {
    setActiveFile(path);
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
    if (isMobile) {
      setMobileActiveView('editor');
    }
  };

  const handleCloseTab = (path: string) => {
    const nextTabs = openTabs.filter((t) => t !== path);
    setOpenTabs(nextTabs);
    if (activeFile === path) {
      setActiveFile(nextTabs[nextTabs.length - 1] || '');
    }
  };

  const handleChangeContent = (path: string, newContent: string) => {
    setFiles((prev) => ({ ...prev, [path]: newContent }));
    setDirtyFiles((prev) => ({ ...prev, [path]: true }));
  };

  const handleCreateFile = (path: string, initialContent = '') => {
    if (!isValidFilePath(path)) return;
    setFiles((prev) => ({ ...prev, [path]: initialContent }));
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
    setActiveFile(path);
    if (isMobile) {
      setMobileActiveView('editor');
    }
  };

  const handleCreateFolder = (path: string) => {
    if (!isValidFilePath(path)) return;
    const placeholder = `${path}/.keep`;
    setFiles((prev) => ({ ...prev, [placeholder]: '' }));
  };

  const handleRenamePath = (oldPath: string, newPath: string) => {
    if (!isValidFilePath(newPath)) return;
    setFiles((prev) => renamePathInFiles(prev, oldPath, newPath));
    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab === oldPath ? newPath : tab.startsWith(`${oldPath}/`) ? tab.replace(oldPath, newPath) : tab
      )
    );
    if (activeFile === oldPath || activeFile.startsWith(`${oldPath}/`)) {
      setActiveFile(activeFile.replace(oldPath, newPath));
    }
  };

  const handleDeletePath = (path: string) => {
    setFiles((prev) => deletePathInFiles(prev, path));
    setOpenTabs((prev) => prev.filter((t) => t !== path && !t.startsWith(`${path}/`)));
    if (activeFile === path || activeFile.startsWith(`${path}/`)) {
      const remaining = Object.keys(files).filter((k) => k !== path && !k.startsWith(`${path}/`));
      setActiveFile(remaining[0] || '');
    }
  };

  const handleDuplicateFile = (path: string) => {
    const parts = path.split('.');
    const ext = parts.length > 1 ? `.${parts.pop()}` : '';
    const newPath = `${parts.join('.')}-copy${ext}`;
    setFiles((prev) => ({ ...prev, [newPath]: prev[path] || '' }));
    handleSelectFile(newPath);
  };

  // Autonomous Code Repair handlers
  const handleTriggerRepair = (errorTrace: string) => {
    setCheckpointFiles({ ...files }); // Preserve recovery point before repair
    setActiveErrorTrace(errorTrace);
    setShowRepairModal(true);
  };

  const handleApplyFix = (targetFile: string, correctedContent: string) => {
    setCheckpointFiles({ ...files });
    setFiles((prev) => ({ ...prev, [targetFile]: correctedContent }));
    setDirtyFiles((prev) => ({ ...prev, [targetFile]: true }));
    setActiveErrorTrace('');
  };

  const handleRestoreCheckpoint = () => {
    if (checkpointFiles) {
      setFiles({ ...checkpointFiles });
      setCheckpointFiles(null);
      setActiveErrorTrace('');
    }
  };

  // Save Project to Cloud SQL
  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      if (user && idToken) {
        if (projectId) {
          await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              name: projectName,
              filesJson: files,
              memoryJson: { memory: projectMemory },
            }),
          });
        } else {
          const resp = await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              name: projectName,
              filesJson: files,
              memoryJson: { memory: projectMemory },
            }),
          });
          const data = await resp.json();
          if (data.id) setProjectId(data.id);
        }
      }
      setDirtyFiles({});
    } catch (e) {
      console.warn('Could not save to Cloud SQL backend:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Git Commit Handler
  const handleCommit = (message: string) => {
    const hash = Math.random().toString(36).substring(2, 9);
    const newCommit: CommitEntry = {
      hash,
      message,
      timestamp: Date.now(),
      filesSnapshot: { ...files },
    };
    setCommits((prev) => [newCommit, ...prev]);
    setDirtyFiles({});

    if (user && idToken && projectId) {
      fetch(`/api/projects/${projectId}/commits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message,
          filesSnapshot: files,
        }),
      }).catch(console.warn);
    }
  };

  const handleRestoreCommit = (commit: CommitEntry) => {
    setCheckpointFiles({ ...files });
    setFiles({ ...commit.filesSnapshot });
    setDirtyFiles({});
  };

  // ZIP Export & Import Handlers
  const handleExportZip = async () => {
    try {
      const blob = await packProjectToZip(files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export ZIP', err);
    }
  };

  const handleImportZipClick = () => {
    zipInputRef.current?.click();
  };

  const handleZipFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const unpacked = await unpackProjectFromZip(file);
      if (Object.keys(unpacked.files).length > 0) {
        setCheckpointFiles({ ...files });
        setFiles(unpacked.files);
        if (unpacked.manifest?.name) {
          setProjectName(unpacked.manifest.name);
        }
        const fileKeys = Object.keys(unpacked.files);
        setActiveFile(fileKeys[0] || '');
        setOpenTabs(fileKeys.slice(0, 3));
        setDirtyFiles({});
      }
    } catch (err) {
      console.error('Failed to unpack ZIP archive', err);
    }
    e.target.value = '';
  };

  // Starter Template Loader
  const handleSelectTemplate = (template: ProjectTemplate) => {
    setCheckpointFiles({ ...files });
    setFiles(template.files);
    setProjectName(template.name);
    setActiveFile(template.activeFile);
    setOpenTabs([
      template.activeFile,
      ...Object.keys(template.files).filter((f) => f !== template.activeFile).slice(0, 2),
    ]);
    setDirtyFiles({});
  };

  const isDirty = Object.keys(dirtyFiles).some((k) => dirtyFiles[k]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080808] text-white font-sans antialiased">
      {/* Hidden ZIP file input */}
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        onChange={handleZipFileChange}
        className="hidden"
      />

      {/* Top Navbar */}
      <Navbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        isDirty={isDirty}
        onSave={handleSaveProject}
        onRunPreview={() => {
          setActiveErrorTrace('');
        }}
        onOpenRepair={() => handleTriggerRepair(activeErrorTrace || 'Manual AI Diagnostic Inspection')}
        onExportZip={handleExportZip}
        onImportZip={handleImportZipClick}
        onOpenWorkspaceTools={() => setShowWorkspaceModal(true)}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
        workspaceMode={workspaceMode}
        fullscreenTarget={fullscreenTarget}
        splitOrientation={splitOrientation}
        onSelectWorkspaceMode={(mode, target) => {
          setWorkspaceMode(mode);
          if (target) setFullscreenTarget(target);
          if (isMobile) {
            if (mode === 'split') setMobileActiveView('split');
            else if (target === 'preview') setMobileActiveView('preview');
            else setMobileActiveView('editor');
          }
        }}
        onToggleSplitOrientation={() =>
          setSplitOrientation(effectiveOrientation === 'vertical' ? 'horizontal' : 'vertical')
        }
        showTerminal={showTerminal}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showAgentPanel={activeNavTab === 'agents'}
        onToggleAgentPanel={() => setActiveNavTab(activeNavTab === 'agents' ? null : 'agents')}
        isSaving={isSaving}
        hasErrors={Boolean(activeErrorTrace)}
        isMobile={isMobile}
        mobileActiveView={mobileActiveView}
        onSelectMobileView={setMobileActiveView}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Navigation Sidebar (Desktop/Tablet) */}
        {!isMobile && (
          <Sidebar
            activeTab={activeNavTab}
            onSelectTab={(tab) => {
              if (tab === 'repair') {
                handleTriggerRepair(activeErrorTrace || 'Manual AI Code Diagnostic');
              } else if (tab === 'templates') {
                setShowTemplatesModal(true);
              } else if (tab === 'settings') {
                setShowSettingsModal(true);
              } else {
                setActiveNavTab(activeNavTab === tab ? null : tab);
                if (tab === 'explorer' && isExplorerCollapsed) {
                  setIsExplorerCollapsed(false);
                }
              }
            }}
            hasErrors={Boolean(activeErrorTrace)}
          />
        )}

        {/* Collapsible / Resizable Explorer Panel (Desktop/Tablet) */}
        {!isMobile && !isExplorerCollapsed && activeNavTab === 'explorer' && (
          <FileExplorer
            fileTree={fileTree}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onRenamePath={handleRenamePath}
            onDeletePath={handleDeletePath}
            onDuplicateFile={handleDuplicateFile}
            onToggleCollapse={handleToggleExplorer}
            width={explorerWidth}
            onWidthChange={handleWidthChange}
          />
        )}

        {/* Mobile File Explorer Workspace View */}
        {isMobile && mobileActiveView === 'files' && (
          <div className="flex-1 h-full w-full bg-[#0e0e0e] flex flex-col min-w-0 overflow-hidden">
            <FileExplorer
              fileTree={fileTree}
              activeFile={activeFile}
              onSelectFile={(path) => {
                handleSelectFile(path);
                setMobileActiveView('editor');
              }}
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              onRenamePath={handleRenamePath}
              onDeletePath={handleDeletePath}
              onDuplicateFile={handleDuplicateFile}
              isMobile={true}
              onCloseMobileDrawer={() => setMobileActiveView('editor')}
            />
          </div>
        )}

        {/* Conditional Secondary Drawer Panels (Desktop/Tablet or Mobile) */}
        {((!isMobile && activeNavTab === 'agents') || (isMobile && mobileActiveView === 'agents')) && (
          <AgentTeamPanel
            files={files}
            activeFile={activeFile}
            onApplyCode={(target, code) => {
              handleChangeContent(target, code);
            }}
            onClose={() => {
              if (isMobile) setMobileActiveView('editor');
              else setActiveNavTab(null);
            }}
          />
        )}

        {!isMobile && activeNavTab === 'chat' && (
          <AIChatDrawer
            files={files}
            activeFile={activeFile}
            onApplyCode={(target, code) => {
              handleChangeContent(target, code);
            }}
            onClose={() => setActiveNavTab(null)}
          />
        )}

        {!isMobile && activeNavTab === 'models' && (
          <ModelManagementPanel onClose={() => setActiveNavTab(null)} />
        )}

        {!isMobile && activeNavTab === 'database' && (
          <DatabasePanel onClose={() => setActiveNavTab(null)} />
        )}

        {!isMobile && activeNavTab === 'git' && (
          <GitPanel
            files={files}
            dirtyFiles={dirtyFiles}
            commits={commits}
            onCommit={handleCommit}
            onRestoreCommit={handleRestoreCommit}
            onClose={() => setActiveNavTab(null)}
          />
        )}

        {/* Center / Right Working Panes - Dual Workspace Engine */}
        <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
          {/* Main Workspace Canvas (Split / Fullscreen) */}
          <div className="flex-1 flex min-h-0 w-full overflow-hidden relative">
            {/* Case A: Mobile Dedicated Single View when not in split mode */}
            {isMobile && mobileActiveView === 'editor' && (
              <div className="flex-1 flex min-h-0 w-full h-full overflow-hidden">
                <CodeEditor
                  openTabs={openTabs}
                  activeFile={activeFile}
                  files={files}
                  dirtyFiles={dirtyFiles}
                  onSelectTab={handleSelectFile}
                  onCloseTab={handleCloseTab}
                  onChangeContent={handleChangeContent}
                  isExplorerCollapsed={isExplorerCollapsed}
                  onRestoreExplorer={handleToggleExplorer}
                  isMobile={isMobile}
                  workspaceMode="fullscreen"
                  onToggleFullscreen={() => {
                    setWorkspaceMode('split');
                    setMobileActiveView('split');
                  }}
                  onSetSplitMode={() => {
                    setWorkspaceMode('split');
                    setMobileActiveView('split');
                  }}
                />
              </div>
            )}

            {isMobile && mobileActiveView === 'preview' && (
              <div className="flex-1 flex min-h-0 w-full h-full overflow-hidden">
                <LivePreview
                  files={files}
                  projectName={projectName}
                  onTriggerRepair={handleTriggerRepair}
                  workspaceMode="fullscreen"
                  onToggleFullscreen={() => {
                    setWorkspaceMode('split');
                    setMobileActiveView('split');
                  }}
                  onSetSplitMode={() => {
                    setWorkspaceMode('split');
                    setMobileActiveView('split');
                  }}
                />
              </div>
            )}

            {/* Case B: Mobile Split Mode OR Desktop / Tablet Workspaces */}
            {((isMobile && mobileActiveView === 'split') || !isMobile) && (
              <>
                {/* Full Screen Mode on Desktop/Tablet */}
                {!isMobile && workspaceMode === 'fullscreen' ? (
                  <div className="flex-1 flex min-h-0 w-full h-full overflow-hidden">
                    {fullscreenTarget === 'editor' ? (
                      <CodeEditor
                        openTabs={openTabs}
                        activeFile={activeFile}
                        files={files}
                        dirtyFiles={dirtyFiles}
                        onSelectTab={handleSelectFile}
                        onCloseTab={handleCloseTab}
                        onChangeContent={handleChangeContent}
                        isExplorerCollapsed={isExplorerCollapsed}
                        onRestoreExplorer={handleToggleExplorer}
                        isMobile={isMobile}
                        workspaceMode="fullscreen"
                        onToggleFullscreen={() => setWorkspaceMode('split')}
                        onSetSplitMode={() => setWorkspaceMode('split')}
                      />
                    ) : (
                      <LivePreview
                        files={files}
                        projectName={projectName}
                        onTriggerRepair={handleTriggerRepair}
                        workspaceMode="fullscreen"
                        onToggleFullscreen={() => setWorkspaceMode('split')}
                        onSetSplitMode={() => setWorkspaceMode('split')}
                      />
                    )}
                  </div>
                ) : (
                  /* Split Screen Mode (Mobile Vertical Split or Desktop/Tablet Horizontal/Vertical Split) */
                  <div
                    ref={splitWorkspaceRef}
                    className={`flex-1 flex min-h-0 w-full h-full overflow-hidden relative ${
                      effectiveOrientation === 'vertical' ? 'flex-col' : 'flex-row'
                    }`}
                  >
                    {/* Panel 1 */}
                    <div
                      style={
                        effectiveOrientation === 'vertical'
                          ? { height: `${Math.round(splitRatio * 100)}%`, minHeight: '130px' }
                          : { width: `${Math.round(splitRatio * 100)}%`, minWidth: '180px' }
                      }
                      className="flex min-w-0 min-h-0 overflow-hidden"
                    >
                      {isSwapped ? (
                        <LivePreview
                          files={files}
                          projectName={projectName}
                          onTriggerRepair={handleTriggerRepair}
                          workspaceMode="split"
                          onToggleFullscreen={() => {
                            setWorkspaceMode('fullscreen');
                            setFullscreenTarget('preview');
                            if (isMobile) setMobileActiveView('preview');
                          }}
                          onSetSplitMode={() => setWorkspaceMode('split')}
                        />
                      ) : (
                        <CodeEditor
                          openTabs={openTabs}
                          activeFile={activeFile}
                          files={files}
                          dirtyFiles={dirtyFiles}
                          onSelectTab={handleSelectFile}
                          onCloseTab={handleCloseTab}
                          onChangeContent={handleChangeContent}
                          isExplorerCollapsed={isExplorerCollapsed}
                          onRestoreExplorer={handleToggleExplorer}
                          isMobile={isMobile}
                          workspaceMode="split"
                          onToggleFullscreen={() => {
                            setWorkspaceMode('fullscreen');
                            setFullscreenTarget('editor');
                            if (isMobile) setMobileActiveView('editor');
                          }}
                          onSetSplitMode={() => setWorkspaceMode('split')}
                        />
                      )}
                    </div>

                    {/* Resizable / Draggable Divider with Preset Controls */}
                    <WorkspaceDivider
                      orientation={effectiveOrientation}
                      splitRatio={splitRatio}
                      onSplitRatioChange={setSplitRatio}
                      isSwapped={isSwapped}
                      onToggleSwap={() => setIsSwapped(!isSwapped)}
                      onToggleOrientation={() =>
                        setSplitOrientation(effectiveOrientation === 'vertical' ? 'horizontal' : 'vertical')
                      }
                      onResetSplit={() => setSplitRatio(0.5)}
                      containerRef={splitWorkspaceRef}
                      isMobile={isMobile}
                    />

                    {/* Panel 2 */}
                    <div
                      style={
                        effectiveOrientation === 'vertical'
                          ? { height: `${100 - Math.round(splitRatio * 100)}%`, minHeight: '130px' }
                          : { width: `${100 - Math.round(splitRatio * 100)}%`, minWidth: '180px' }
                      }
                      className="flex min-w-0 min-h-0 overflow-hidden"
                    >
                      {isSwapped ? (
                        <CodeEditor
                          openTabs={openTabs}
                          activeFile={activeFile}
                          files={files}
                          dirtyFiles={dirtyFiles}
                          onSelectTab={handleSelectFile}
                          onCloseTab={handleCloseTab}
                          onChangeContent={handleChangeContent}
                          isExplorerCollapsed={isExplorerCollapsed}
                          onRestoreExplorer={handleToggleExplorer}
                          isMobile={isMobile}
                          workspaceMode="split"
                          onToggleFullscreen={() => {
                            setWorkspaceMode('fullscreen');
                            setFullscreenTarget('editor');
                            if (isMobile) setMobileActiveView('editor');
                          }}
                          onSetSplitMode={() => setWorkspaceMode('split')}
                        />
                      ) : (
                        <LivePreview
                          files={files}
                          projectName={projectName}
                          onTriggerRepair={handleTriggerRepair}
                          workspaceMode="split"
                          onToggleFullscreen={() => {
                            setWorkspaceMode('fullscreen');
                            setFullscreenTarget('preview');
                            if (isMobile) setMobileActiveView('preview');
                          }}
                          onSetSplitMode={() => setWorkspaceMode('split')}
                        />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Integrated Terminal & Diagnostics */}
          {((!isMobile && showTerminal) || (isMobile && mobileActiveView === 'terminal')) && (
            <TerminalPanel
              onClose={() => {
                if (isMobile) setMobileActiveView('split');
                else setShowTerminal(false);
              }}
              compilerErrors={activeErrorTrace ? [activeErrorTrace] : []}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Workspace Navigation Rail */}
      {isMobile && (
        <nav className="h-12 bg-[#0c0c0c] border-t border-[#222222] px-2 flex items-center justify-around select-none z-50 shrink-0">
          <button
            onClick={() => setMobileActiveView('files')}
            className={`flex flex-col items-center justify-center p-1 rounded transition text-[10px] ${
              mobileActiveView === 'files' ? 'text-white font-bold' : 'text-neutral-500'
            }`}
          >
            <FolderTree className="w-4 h-4 mb-0.5" />
            <span>Files</span>
          </button>

          <button
            onClick={() => {
              setWorkspaceMode('split');
              setMobileActiveView('split');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded transition text-[10px] ${
              mobileActiveView === 'split' ? 'text-white font-bold' : 'text-neutral-500'
            }`}
          >
            <Columns2 className="w-4 h-4 mb-0.5" />
            <span>Split</span>
          </button>

          <button
            onClick={() => {
              setWorkspaceMode('fullscreen');
              setFullscreenTarget('editor');
              setMobileActiveView('editor');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded transition text-[10px] ${
              mobileActiveView === 'editor' ? 'text-white font-bold' : 'text-neutral-500'
            }`}
          >
            <Code className="w-4 h-4 mb-0.5" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => {
              setWorkspaceMode('fullscreen');
              setFullscreenTarget('preview');
              setMobileActiveView('preview');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded transition text-[10px] ${
              mobileActiveView === 'preview' ? 'text-white font-bold' : 'text-neutral-500'
            }`}
          >
            <Play className="w-4 h-4 mb-0.5 fill-current" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => setMobileActiveView('terminal')}
            className={`flex flex-col items-center justify-center p-1 rounded transition text-[10px] ${
              mobileActiveView === 'terminal' ? 'text-white font-bold' : 'text-neutral-500'
            }`}
          >
            <Terminal className="w-4 h-4 mb-0.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setMobileActiveView('agents')}
            className={`flex flex-col items-center justify-center p-1 rounded transition text-[10px] ${
              mobileActiveView === 'agents' ? 'text-white font-bold' : 'text-neutral-500'
            }`}
          >
            <Bot className="w-4 h-4 mb-0.5" />
            <span>Agents</span>
          </button>
        </nav>
      )}

      {/* Autonomous AI Code Repair Modal */}
      <AutonomousRepairModal
        isOpen={showRepairModal}
        onClose={() => setShowRepairModal(false)}
        errorTrace={activeErrorTrace}
        activeFile={activeFile}
        fileContent={files[activeFile] || ''}
        files={files}
        onApplyFix={handleApplyFix}
        onRestoreCheckpoint={handleRestoreCheckpoint}
        hasCheckpoint={Boolean(checkpointFiles)}
      />

      {/* Starter Templates Modal */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Google Workspace & Cloud Tools Modal */}
      <WorkspaceToolsModal
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        projectName={projectName}
        files={files}
        onExportZip={handleExportZip}
      />

      {/* Settings & Project Memory Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        projectMemory={projectMemory}
        onSaveMemory={setProjectMemory}
      />
    </div>
  );
}
