import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  RotateCcw,
  Plus,
  Check,
  Clock,
  Diff,
  FileCode,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export interface CommitEntry {
  hash: string;
  message: string;
  timestamp: number;
  filesSnapshot: Record<string, string>;
}

interface GitPanelProps {
  files: Record<string, string>;
  dirtyFiles: Record<string, boolean>;
  commits: CommitEntry[];
  onCommit: (message: string) => void;
  onRestoreCommit: (commit: CommitEntry) => void;
  onClose: () => void;
}

export const GitPanel: React.FC<GitPanelProps> = ({
  files,
  dirtyFiles,
  commits,
  onCommit,
  onRestoreCommit,
  onClose,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedCommit, setSelectedCommit] = useState<CommitEntry | null>(null);

  const modifiedList = Object.keys(dirtyFiles).filter((f) => dirtyFiles[f]);

  const handleCommitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    onCommit(commitMessage.trim());
    setCommitMessage('');
  };

  return (
    <div className="w-full sm:w-96 bg-[#0c0c0c] border-l border-[#222222] flex flex-col h-full select-none text-white shrink-0 z-10">
      {/* Header */}
      <div className="p-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-white text-black">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">VERSION CONTROL & GIT</h2>
            <p className="text-[10px] text-neutral-400">Branch: main (Clean Head)</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:text-white text-neutral-500 rounded text-xs">
          Close
        </button>
      </div>

      {/* Commit Creator */}
      <div className="p-3 bg-[#121212] border-b border-[#222222] space-y-2">
        <span className="text-xs font-semibold text-neutral-300">Working Tree Changes ({modifiedList.length})</span>

        {modifiedList.length > 0 ? (
          <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar font-mono text-[11px]">
            {modifiedList.map((f) => (
              <div key={f} className="flex items-center justify-between px-2 py-1 bg-black rounded border border-neutral-800 text-neutral-300">
                <span className="truncate">{f}</span>
                <span className="text-amber-400 text-[10px]">modified</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-neutral-500 italic py-1">Working tree is clean.</div>
        )}

        <form onSubmit={handleCommitSubmit} className="space-y-2 pt-1">
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message (e.g. feat: add live preview)..."
            className="w-full bg-[#181818] border border-[#2e2e2e] rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            disabled={!commitMessage.trim()}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white text-black font-semibold rounded text-xs hover:bg-neutral-200 transition disabled:opacity-50"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit to Checkpoint History</span>
          </button>
        </form>
      </div>

      {/* Commit History Timeline */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Commit Timeline ({commits.length})
        </span>

        {commits.length === 0 ? (
          <div className="text-center py-10 text-neutral-600 text-xs">
            No commits recorded yet. Make changes and create a commit above.
          </div>
        ) : (
          commits.map((c) => (
            <div
              key={c.hash}
              className="p-3 bg-[#141414] border border-[#242424] rounded-xl space-y-2 hover:border-[#333] transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{c.message}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-500 font-mono mt-1">
                    <span>{c.hash}</span>
                    <span>•</span>
                    <span>{new Date(c.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRestoreCommit(c)}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1c1c1c] border border-[#333] hover:border-white text-[10px] text-neutral-300 hover:text-white transition"
                  title="Checkout / Rollback files to this commit state"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Rollback</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
