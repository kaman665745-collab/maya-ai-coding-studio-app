import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Columns2,
  Wrench,
  X,
} from 'lucide-react';
import { generatePreviewHtml } from '../utils/previewSandbox.ts';

export interface ConsoleMessage {
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
  timestamp: number;
}

interface LivePreviewProps {
  files: Record<string, string>;
  projectName: string;
  onTriggerRepair?: (errorTrace: string) => void;
  workspaceMode?: 'split' | 'fullscreen';
  onToggleFullscreen?: () => void;
  onSetSplitMode?: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  projectName,
  onTriggerRepair,
  workspaceMode = 'split',
  onToggleFullscreen,
  onSetSplitMode,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<ConsoleMessage[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate html content
  const previewHtml = generatePreviewHtml({
    files,
    title: `${projectName} - Maya Runtime Preview`,
    theme: 'dark',
  });

  // Listen for console messages and runtime errors from inside the sandbox iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MAYA_PREVIEW_CONSOLE') {
        const { level, text, timestamp } = event.data;
        setLogs((prev) => [...prev.slice(-100), { level, text, timestamp }]);
        if (level === 'error') {
          setRuntimeError(text);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleReload = () => {
    setRuntimeError(null);
    setKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-full max-w-[375px]';
      case 'tablet':
        return 'w-full max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080808] border-l border-[#222222] min-w-0 overflow-hidden select-none">
      {/* Top Preview Bar */}
      <div className="h-9 bg-[#0e0e0e] border-b border-[#222222] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1.5 flex-1 min-w-0 max-w-xs sm:max-w-sm">
          <button
            onClick={handleReload}
            className="p-1 hover:text-white text-neutral-400 rounded hover:bg-[#1c1c1c] transition shrink-0"
            title="Reload Preview Sandbox"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Simulated address bar */}
          <div className="flex items-center px-2 py-0.5 bg-[#141414] border border-[#262626] rounded text-[11px] text-neutral-400 font-mono flex-1 min-w-0 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
            <span className="truncate">localhost:3000/preview</span>
          </div>

          {/* Live Synchronized Status Badge */}
          <div className="hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-[10px] text-emerald-300 font-mono shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Sync</span>
          </div>
        </div>

        {/* Viewport Presets & Tools */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <div className="flex items-center bg-[#141414] border border-[#262626] rounded p-0.5">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded transition ${viewport === 'desktop' ? 'bg-[#262626] text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded transition ${viewport === 'tablet' ? 'bg-[#262626] text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded transition ${viewport === 'mobile' ? 'bg-[#262626] text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] border transition ${
              showConsole ? 'bg-[#262626] text-white border-[#444]' : 'bg-[#141414] text-neutral-400 border-[#262626] hover:text-white'
            }`}
            title="Inspect Sandbox Console"
          >
            <Terminal className="w-3 h-3" />
            <span>Console ({logs.length})</span>
          </button>

          <button
            onClick={handleOpenExternal}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1c1c1c] transition"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Dual Workspace Mode Switcher */}
          <div className="h-4 w-[1px] bg-[#222] mx-0.5 sm:mx-1" />
          {workspaceMode === 'fullscreen' ? (
            <button
              onClick={onSetSplitMode}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#262626] text-white hover:bg-[#333] transition text-[11px] font-medium"
              title="Return to Split Screen Mode (columns-2)"
              aria-label="Split Screen Mode"
            >
              <Columns2 className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Split</span>
            </button>
          ) : (
            <button
              onClick={onToggleFullscreen}
              className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 rounded text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition text-[11px]"
              title="Maximize Preview to Full Screen (maximize-2)"
              aria-label="Full Screen Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full</span>
            </button>
          )}
        </div>
      </div>

      {/* Runtime Error Alert Banner */}
      {runtimeError && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center space-x-2 truncate mr-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-mono truncate">{runtimeError}</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {onTriggerRepair && (
              <button
                onClick={() => onTriggerRepair(runtimeError)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white text-black font-semibold rounded text-xs hover:bg-neutral-200 transition"
              >
                <Wrench className="w-3 h-3" />
                <span>Fix with AI</span>
              </button>
            )}
            <button
              onClick={() => setRuntimeError(null)}
              className="p-1 hover:text-white text-rose-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Frame Container */}
      <div className="flex-1 min-h-0 bg-[#080808] flex items-center justify-center p-2 overflow-auto">
        <div
          className={`${getViewportWidth()} h-full transition-all duration-200 flex flex-col bg-black rounded-lg overflow-hidden border border-[#222222] shadow-2xl relative`}
        >
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={previewHtml}
            title="Maya Live Application Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-none bg-black"
          />
        </div>
      </div>

      {/* Expandable Sandbox Console Inspector */}
      {showConsole && (
        <div className="h-44 bg-[#0a0a0a] border-t border-[#222222] flex flex-col font-mono text-xs shrink-0">
          <div className="h-7 bg-[#0f0f0f] border-b border-[#1f1f1f] px-3 flex items-center justify-between text-neutral-400">
            <span>SANDBOX CONSOLE LOGS</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setLogs([])} className="hover:text-white text-[10px]">
                Clear
              </button>
              <button onClick={() => setShowConsole(false)} className="hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {logs.length === 0 ? (
              <div className="text-neutral-600 text-center py-4">No console logs recorded.</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`py-0.5 px-1.5 rounded flex items-start space-x-2 ${
                    log.level === 'error'
                      ? 'bg-rose-950/30 text-rose-300'
                      : log.level === 'warn'
                      ? 'bg-amber-950/30 text-amber-300'
                      : 'text-neutral-300'
                  }`}
                >
                  <span className="text-[10px] text-neutral-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="uppercase text-[9px] px-1 rounded border border-neutral-700 font-bold shrink-0">
                    {log.level}
                  </span>
                  <span className="break-all whitespace-pre-wrap">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
