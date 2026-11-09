import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Columns2,
  Rows2,
  ScreenShare,
  Code,
  Play,
  ChevronDown,
} from 'lucide-react';
import { WorkspaceMode, FullscreenTarget, SplitOrientation } from '../types/workspace.ts';

interface WorkspaceSwitcherProps {
  mode: WorkspaceMode;
  fullscreenTarget: FullscreenTarget;
  splitOrientation: SplitOrientation;
  onSelectMode: (mode: WorkspaceMode, target?: FullscreenTarget) => void;
  onToggleOrientation?: () => void;
  compact?: boolean;
  className?: string;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  mode,
  fullscreenTarget,
  splitOrientation,
  onSelectMode,
  onToggleOrientation,
  compact = false,
  className = '',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showDropdown]);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser fullscreen not supported or permitted; in-app fullscreen mode handles full viewport
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-flex items-center bg-[#111111] border border-[#282828] rounded-md p-0.5 text-xs select-none ${className}`}
    >
      {/* Split Screen Mode Button */}
      <button
        type="button"
        onClick={() => onSelectMode('split')}
        className={`flex items-center space-x-1 px-2 py-1 rounded transition text-xs ${
          mode === 'split'
            ? 'bg-[#262626] text-white font-semibold shadow-sm'
            : 'text-neutral-400 hover:text-white hover:bg-[#1a1a1a]'
        }`}
        title="Split Screen Mode (columns-2)"
        aria-label="Split Screen Mode"
      >
        <Columns2 className="w-3.5 h-3.5 stroke-[2.2]" />
        {!compact && <span>Split Screen</span>}
      </button>

      {/* Full Screen Mode Button with Target Selector */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onSelectMode('fullscreen', fullscreenTarget)}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition text-xs ${
            mode === 'fullscreen'
              ? 'bg-[#262626] text-white font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-[#1a1a1a]'
          }`}
          title={`Full Screen Mode (maximize-2) - ${fullscreenTarget === 'editor' ? 'Editor' : 'Preview'}`}
          aria-label="Full Screen Mode"
        >
          <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
          {!compact && (
            <span>
              {mode === 'fullscreen'
                ? fullscreenTarget === 'editor'
                  ? 'Full Editor'
                  : 'Full Preview'
                : 'Full Screen'}
            </span>
          )}
        </button>

        {/* Dropdown trigger for choosing Fullscreen Target & Orientation */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1a1a1a] transition"
          title="Workspace Options (Target & Orientation)"
          aria-label="Workspace Options"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Dropdown Menu for Fullscreen Target & Options */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-1.5 w-56 bg-[#0e0e0e] border border-[#2d2d2d] rounded-lg shadow-2xl p-1.5 z-50 text-xs flex flex-col space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            WORKSPACE MODE
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectMode('split');
              setShowDropdown(false);
            }}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              mode === 'split' ? 'bg-[#222222] text-white font-semibold' : 'text-neutral-300 hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Columns2 className="w-4 h-4 text-neutral-400" />
              <span>Split Screen</span>
            </div>
            {mode === 'split' && <span className="text-[10px] text-emerald-400">Active</span>}
          </button>

          <div className="h-[1px] bg-[#222] my-1" />

          <div className="px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            FULL SCREEN TARGET
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectMode('fullscreen', 'editor');
              setShowDropdown(false);
            }}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              mode === 'fullscreen' && fullscreenTarget === 'editor'
                ? 'bg-[#222222] text-white font-semibold'
                : 'text-neutral-300 hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-neutral-400" />
              <span>Editor Full Screen</span>
            </div>
            {mode === 'fullscreen' && fullscreenTarget === 'editor' && (
              <span className="text-[10px] text-emerald-400">Active</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectMode('fullscreen', 'preview');
              setShowDropdown(false);
            }}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
              mode === 'fullscreen' && fullscreenTarget === 'preview'
                ? 'bg-[#222222] text-white font-semibold'
                : 'text-neutral-300 hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4 text-neutral-400 fill-current" />
              <span>Live Preview Full Screen</span>
            </div>
            {mode === 'fullscreen' && fullscreenTarget === 'preview' && (
              <span className="text-[10px] text-emerald-400">Active</span>
            )}
          </button>

          {onToggleOrientation && (
            <>
              <div className="h-[1px] bg-[#222] my-1" />
              <div className="px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                SPLIT ORIENTATION
              </div>
              <button
                type="button"
                onClick={() => {
                  onToggleOrientation();
                  setShowDropdown(false);
                }}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded text-neutral-300 hover:bg-[#1a1a1a] transition"
              >
                {splitOrientation === 'vertical' ? (
                  <>
                    <Columns2 className="w-4 h-4 text-neutral-400" />
                    <span>Switch to Horizontal Split</span>
                  </>
                ) : (
                  <>
                    <Rows2 className="w-4 h-4 text-neutral-400" />
                    <span>Switch to Vertical Split</span>
                  </>
                )}
              </button>
            </>
          )}

          <div className="h-[1px] bg-[#222] my-1" />

          <button
            type="button"
            onClick={() => {
              toggleBrowserFullscreen();
              setShowDropdown(false);
            }}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded text-neutral-300 hover:bg-[#1a1a1a] transition"
          >
            <ScreenShare className="w-4 h-4 text-neutral-400" />
            <span>Toggle Browser Fullscreen</span>
          </button>
        </div>
      )}
    </div>
  );
};
