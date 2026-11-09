import React, { useRef, useState, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  X,
  FileCode,
  RotateCcw,
  RotateCw,
  AlignLeft,
  ZoomIn,
  ZoomOut,
  WrapText,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  Columns2,
} from 'lucide-react';
import { getMonacoLanguage } from '../utils/fileSystem.ts';

interface CodeEditorProps {
  openTabs: string[];
  activeFile: string;
  files: Record<string, string>;
  dirtyFiles: Record<string, boolean>;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onChangeContent: (path: string, newContent: string) => void;
  onFormat?: () => void;
  isExplorerCollapsed?: boolean;
  onRestoreExplorer?: () => void;
  isMobile?: boolean;
  workspaceMode?: 'split' | 'fullscreen';
  onToggleFullscreen?: () => void;
  onSetSplitMode?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  openTabs,
  activeFile,
  files,
  dirtyFiles,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  isExplorerCollapsed = false,
  onRestoreExplorer,
  isMobile = false,
  workspaceMode = 'split',
  onToggleFullscreen,
  onSetSplitMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [fontSize, setFontSize] = useState(isMobile ? 12 : 13);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [showMinimap, setShowMinimap] = useState(!isMobile);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const currentContent = files[activeFile] ?? '';
  const currentLanguage = getMonacoLanguage(activeFile);

  // ResizeObserver to ensure Monaco adjusts layout immediately when panels resize or toggle
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define ultra-clean dark theme for Monaco
    monaco.editor.defineTheme('maya-black', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '666666', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
        { token: 'string', foreground: 'a3e635' },
        { token: 'number', foreground: 'f87171' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'function', foreground: 'e2e8f0' },
      ],
      colors: {
        'editor.background': '#0c0c0c',
        'editor.foreground': '#f4f4f5',
        'editorCursor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#141414',
        'editorLineNumber.foreground': '#444444',
        'editorLineNumber.activeForeground': '#ffffff',
        'editorIndentGuide.background': '#1a1a1a',
        'editorIndentGuide.activeBackground': '#333333',
      },
    });
    monaco.editor.setTheme('maya-black');

    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });

    // Force layout calculation
    setTimeout(() => {
      editor.layout();
    }, 100);
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleUndo = () => {
    editorRef.current?.trigger('source', 'undo', null);
  };

  const handleRedo = () => {
    editorRef.current?.trigger('source', 'redo', null);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col h-full bg-[#0c0c0c] min-w-0 w-full overflow-hidden text-white select-none relative"
    >
      {/* Tab Bar */}
      <div className="flex items-center justify-between bg-[#0a0a0a] border-b border-[#222222] overflow-x-auto custom-scrollbar shrink-0 h-9">
        <div className="flex items-center space-x-0.5 px-1 h-full min-w-0">
          {/* Restore Explorer button if collapsed */}
          {isExplorerCollapsed && onRestoreExplorer && (
            <button
              onClick={onRestoreExplorer}
              className="px-2 py-1.5 h-full text-neutral-400 hover:text-white hover:bg-[#181818] border-r border-[#222] transition flex items-center space-x-1"
              title="Show Explorer (Ctrl+B)"
              aria-label="Show Explorer"
            >
              <PanelLeftOpen className="w-4 h-4 text-neutral-300" />
            </button>
          )}

          {openTabs.map((tabPath) => {
            const isActive = tabPath === activeFile;
            const isDirty = dirtyFiles[tabPath];
            const name = tabPath.split('/').pop() || tabPath;

            return (
              <div
                key={tabPath}
                onClick={() => onSelectTab(tabPath)}
                className={`group flex items-center space-x-1.5 px-3 py-1.5 h-full cursor-pointer text-xs border-r border-[#1a1a1a] transition shrink-0 ${
                  isActive
                    ? 'bg-[#0c0c0c] text-white border-t-2 border-t-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#121212]'
                }`}
              >
                <span className="truncate max-w-[120px] sm:max-w-[150px]">{name}</span>
                {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tabPath);
                  }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[#222] transition text-neutral-400 hover:text-white"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {openTabs.length === 0 && (
            <span className="text-xs text-neutral-500 px-3 py-1">No open tabs</span>
          )}
        </div>

        {/* Editor Quick Actions */}
        <div className="flex items-center space-x-0.5 sm:space-x-1 px-2 text-neutral-400 shrink-0">
          <button
            onClick={handleUndo}
            className="p-1 hover:text-white rounded hover:bg-[#181818]"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            className="p-1 hover:text-white rounded hover:bg-[#181818]"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFormat}
            className="p-1 hover:text-white rounded hover:bg-[#181818]"
            title="Format Code"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWordWrap(wordWrap === 'on' ? 'off' : 'on')}
            className={`p-1 rounded hover:bg-[#181818] ${wordWrap === 'on' ? 'text-white' : 'text-neutral-500'}`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
            className="hidden sm:inline-block p-1 hover:text-white rounded hover:bg-[#181818]"
            title="Decrease Font Size"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFontSize(Math.min(22, fontSize + 1))}
            className="hidden sm:inline-block p-1 hover:text-white rounded hover:bg-[#181818]"
            title="Increase Font Size"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Dual Workspace Mode Switcher */}
          <div className="h-4 w-[1px] bg-[#222] mx-0.5 sm:mx-1" />
          {workspaceMode === 'fullscreen' ? (
            <button
              onClick={onSetSplitMode}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#262626] text-white hover:bg-[#333] transition text-[11px] font-medium"
              title="Return to Split Screen Mode (columns-2)"
              aria-label="Split Screen Mode"
            >
              <Columns2 className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Split</span>
            </button>
          ) : (
            <button
              onClick={onToggleFullscreen}
              className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition text-[11px]"
              title="Maximize Editor to Full Screen (maximize-2)"
              aria-label="Full Screen Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 min-h-0 w-full relative">
        {activeFile ? (
          <Editor
            height="100%"
            width="100%"
            language={currentLanguage}
            value={currentContent}
            theme="vs-dark"
            onMount={handleEditorMount}
            onChange={(val) => {
              if (val !== undefined) {
                onChangeContent(activeFile, val);
              }
            }}
            options={{
              fontSize,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              fontLigatures: true,
              wordWrap,
              minimap: { enabled: showMinimap && !isMobile },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              lineNumbers: isMobile ? 'off' : 'on',
              lineNumbersMinChars: 3,
              folding: !isMobile,
              glyphMargin: false,
              bracketPairColorization: { enabled: true },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              scrollbar: {
                horizontal: 'auto',
                vertical: 'auto',
                useShadows: false,
              },
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2 p-4 text-center">
            <FileCode className="w-12 h-12 stroke-[1.2] text-neutral-700" />
            <p className="text-sm font-medium">Select a file from the explorer to begin editing</p>
            <p className="text-xs text-neutral-600">Supports TypeScript, React, HTML, CSS, SQL, Python, JSON</p>
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#090909] border-t border-[#1c1c1c] px-3 flex items-center justify-between text-[11px] text-neutral-500 font-mono shrink-0">
        <div className="flex items-center space-x-3 truncate">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="hidden sm:inline">{currentLanguage.toUpperCase()}</span>
          <span className="hidden md:inline">UTF-8</span>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <span>{fontSize}px</span>
          {!isMobile && (
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className="hover:text-white transition"
            >
              Minimap: {showMinimap ? 'On' : 'Off'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
