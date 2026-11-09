import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Play,
  Save,
  Download,
  Upload,
  Wrench,
  Sparkles,
  Layout,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
  LogIn,
  LogOut,
  MoreHorizontal,
  X,
  Database,
  Check,
  Maximize2,
  Columns2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { WorkspaceMode, FullscreenTarget, SplitOrientation } from '../types/workspace.ts';
import { WorkspaceSwitcher } from './WorkspaceSwitcher.tsx';

interface NavbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  isDirty: boolean;
  onSave: () => void;
  onRunPreview: () => void;
  onOpenRepair: () => void;
  onExportZip: () => void;
  onImportZip: () => void;
  onOpenWorkspaceTools: () => void;
  onOpenTemplates: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  workspaceMode: WorkspaceMode;
  fullscreenTarget: FullscreenTarget;
  splitOrientation: SplitOrientation;
  onSelectWorkspaceMode: (mode: WorkspaceMode, target?: FullscreenTarget) => void;
  onToggleSplitOrientation?: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  showAgentPanel: boolean;
  onToggleAgentPanel: () => void;
  isSaving: boolean;
  hasErrors: boolean;
  isMobile?: boolean;
  mobileActiveView?: 'split' | 'editor' | 'preview' | 'files' | 'terminal' | 'agents';
  onSelectMobileView?: (view: 'split' | 'editor' | 'preview' | 'files' | 'terminal' | 'agents') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectName,
  onProjectNameChange,
  isDirty,
  onSave,
  onRunPreview,
  onOpenRepair,
  onExportZip,
  onImportZip,
  onOpenWorkspaceTools,
  onOpenTemplates,
  selectedModel,
  onModelChange,
  user,
  onSignIn,
  onSignOut,
  workspaceMode,
  fullscreenTarget,
  splitOrientation,
  onSelectWorkspaceMode,
  onToggleSplitOrientation,
  showTerminal,
  onToggleTerminal,
  showAgentPanel,
  onToggleAgentPanel,
  isSaving,
  hasErrors,
  isMobile = false,
  mobileActiveView = 'editor',
  onSelectMobileView,
}) => {
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close overflow menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
    };
    if (showOverflowMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOverflowMenu]);

  return (
    <header className="h-13 bg-[#0a0a0a] border-b border-[#222222] px-2 sm:px-3 flex items-center justify-between select-none z-30 shrink-0 w-full overflow-hidden">
      {/* Brand & Project Name */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white text-black rounded font-bold text-xs tracking-wider">
          <Code2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          <span className="tracking-widest">MAYA</span>
        </div>

        <div className="hidden sm:block h-4 w-[1px] bg-[#222]" />

        {/* Project Name Input */}
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium text-white px-1.5 py-1 rounded hover:bg-[#161616] focus:bg-[#161616] focus:outline-none border border-transparent focus:border-[#333] transition w-24 sm:w-36 md:w-48 truncate"
            title="Click to rename project"
          />
          {isDirty ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Saved to cloud" />
          )}
        </div>

        {/* Desktop Templates Opener */}
        <button
          onClick={onOpenTemplates}
          className="hidden lg:flex items-center space-x-1 text-xs text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-[#161616] border border-transparent hover:border-[#2a2a2a] transition"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Templates</span>
        </button>
      </div>

      {/* Middle Action Controls */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Model Selector (Desktop) */}
        <div className="hidden xl:flex items-center space-x-1 bg-[#141414] border border-[#262626] rounded-md px-2 py-1 text-xs text-neutral-300">
          <Cpu className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="gemini-3.8-flash" className="bg-[#141414]">Gemini 3.8 Flash (Search & Balanced)</option>
            <option value="gemini-4-argon" className="bg-[#141414]">Gemini 4 Argon (Deep Reasoning)</option>
            <option value="gemini-3.1-flash-lite" className="bg-[#141414]">Gemini 3.1 Flash Lite (Low-Latency)</option>
          </select>
        </div>

        {/* Run / Preview Refresh Button */}
        <button
          onClick={() => {
            onRunPreview();
            if (isMobile && onSelectMobileView) {
              onSelectMobileView('preview');
            }
          }}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-white text-black hover:bg-neutral-200 rounded text-xs font-semibold shadow-sm transition active:scale-95 touch-manipulation"
          title="Run live application preview"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span className="hidden sm:inline">Run Preview</span>
        </button>

        {/* Autonomous AI Repair Button */}
        <button
          onClick={onOpenRepair}
          className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded text-xs border transition active:scale-95 touch-manipulation ${
            hasErrors
              ? 'bg-rose-950/60 text-rose-300 border-rose-600 animate-pulse'
              : 'bg-[#141414] text-neutral-300 border-[#2b2b2b] hover:text-white hover:border-[#444]'
          }`}
          title="Autonomous AI Debugger & Code Repair"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden md:inline">AI Repair</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 hover:text-white rounded text-xs border border-[#2b2b2b] transition disabled:opacity-50 active:scale-95 touch-manipulation"
          title="Save project changes"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        {/* Secondary Action Icons (Desktop) */}
        <div className="hidden md:flex items-center space-x-1">
          <button
            onClick={onExportZip}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#161616] rounded border border-transparent hover:border-[#262626] transition"
            title="Export complete project as ZIP"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onImportZip}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#161616] rounded border border-transparent hover:border-[#262626] transition"
            title="Import ZIP project archive"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenWorkspaceTools}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#161616] rounded border border-transparent hover:border-[#262626] transition"
            title="Google Workspace & Cloud integrations"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Controls: Workspace Switcher, Terminal, Agents, Auth */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Persistent Dual Workspace Switcher */}
        <WorkspaceSwitcher
          mode={workspaceMode}
          fullscreenTarget={fullscreenTarget}
          splitOrientation={splitOrientation}
          onSelectMode={onSelectWorkspaceMode}
          onToggleOrientation={onToggleSplitOrientation}
          compact={false}
          className="hidden md:inline-flex"
        />

        {/* Toggle Terminal Button (Desktop) */}
        <button
          onClick={onToggleTerminal}
          className={`hidden sm:flex p-1.5 rounded border transition ${showTerminal ? 'bg-[#262626] text-white border-[#444]' : 'text-neutral-400 hover:text-white border-transparent hover:bg-[#161616]'}`}
          title="Toggle Terminal drawer"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Toggle AI Agent Panel */}
        <button
          onClick={onToggleAgentPanel}
          className={`hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs border transition ${
            showAgentPanel
              ? 'bg-white text-black font-semibold border-white'
              : 'bg-[#141414] text-neutral-300 border-[#262626] hover:text-white hover:border-[#444]'
          }`}
          title="Toggle 8-Agent AI Team"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Agents</span>
        </button>

        {/* User Account / Google Sign-In */}
        {user ? (
          <div className="flex items-center space-x-1.5 pl-1">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-[#333]" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#262626] flex items-center justify-center text-[10px] font-bold text-white">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
            )}
            <button
              onClick={onSignOut}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#181818] rounded"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center space-x-1 px-2 py-1.5 bg-[#181818] hover:bg-[#222] text-white border border-[#333] rounded text-xs transition active:scale-95 touch-manipulation"
            title="Sign In with Google"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Overflow Menu Button (Mobile & Narrow Screens) */}
        <div className="relative" ref={overflowRef}>
          <button
            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
            className="p-1.5 text-neutral-300 hover:text-white rounded bg-[#141414] border border-[#282828] transition active:scale-95 touch-manipulation"
            title="More actions and settings"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Overflow Dropdown Card */}
          {showOverflowMenu && (
            <div className="absolute right-0 top-10 w-64 bg-[#141414] border border-[#2c2c2c] rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                <span className="font-semibold text-white">Workspace Actions</span>
                <button
                  onClick={() => setShowOverflowMenu(false)}
                  className="p-1 hover:text-white text-neutral-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile Model Selector */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500">Active AI Model</span>
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full bg-black border border-[#333] text-white p-1.5 rounded text-xs"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Grounded)</option>
                  <option value="gemini-4-argon">Gemini 4 Argon (Reasoning)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
                </select>
              </div>

              {/* Workspace Mode Quick Switcher in Overflow */}
              <div className="space-y-1 pt-1 border-t border-[#222]">
                <span className="text-[10px] uppercase font-bold text-neutral-500">Workspace Mode</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      onSelectWorkspaceMode('split');
                      setShowOverflowMenu(false);
                    }}
                    className={`flex items-center justify-center space-x-1.5 p-1.5 rounded text-xs border transition ${
                      workspaceMode === 'split'
                        ? 'bg-[#262626] text-white border-white font-semibold'
                        : 'bg-[#121212] text-neutral-400 border-[#282828] hover:text-white'
                    }`}
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>Split Screen</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectWorkspaceMode('fullscreen', fullscreenTarget);
                      setShowOverflowMenu(false);
                    }}
                    className={`flex items-center justify-center space-x-1.5 p-1.5 rounded text-xs border transition ${
                      workspaceMode === 'fullscreen'
                        ? 'bg-[#262626] text-white border-white font-semibold'
                        : 'bg-[#121212] text-neutral-400 border-[#282828] hover:text-white'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Full Screen</span>
                  </button>
                </div>
              </div>

              {/* Menu action items */}
              <div className="space-y-0.5 pt-1 border-t border-[#222]">
                <button
                  onClick={() => {
                    onOpenTemplates();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-[#202020] text-left text-neutral-300 hover:text-white"
                >
                  <Layers className="w-4 h-4" />
                  <span>Browse Templates</span>
                </button>

                <button
                  onClick={() => {
                    onExportZip();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-[#202020] text-left text-neutral-300 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Project ZIP</span>
                </button>

                <button
                  onClick={() => {
                    onImportZip();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-[#202020] text-left text-neutral-300 hover:text-white"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Project ZIP</span>
                </button>

                <button
                  onClick={() => {
                    onOpenWorkspaceTools();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-[#202020] text-left text-neutral-300 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Google Workspace Exports</span>
                </button>

                <button
                  onClick={() => {
                    onToggleTerminal();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-[#202020] text-left text-neutral-300 hover:text-white sm:hidden"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Toggle Terminal ({showTerminal ? 'Open' : 'Closed'})</span>
                </button>

                <button
                  onClick={() => {
                    onToggleAgentPanel();
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-[#202020] text-left text-neutral-300 hover:text-white sm:hidden"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Toggle 8-Agent Squad</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
