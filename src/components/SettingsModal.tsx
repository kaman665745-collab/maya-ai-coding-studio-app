import React, { useState } from 'react';
import { Settings, Brain, Keyboard, X, Check, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectMemory: string;
  onSaveMemory: (memory: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  projectMemory,
  onSaveMemory,
}) => {
  const [memoryInput, setMemoryInput] = useState(projectMemory);
  const [activeTab, setActiveTab] = useState<'memory' | 'shortcuts' | 'general'>('memory');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveMemory(memoryInput);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const shortcuts = [
    { key: 'Ctrl / Cmd + S', desc: 'Save workspace changes & sync' },
    { key: 'Ctrl / Cmd + Enter', desc: 'Run live preview reload' },
    { key: 'Ctrl / Cmd + B', desc: 'Toggle left sidebar panel' },
    { key: 'Ctrl / Cmd + `', desc: 'Toggle integrated terminal' },
    { key: 'Shift + Alt + F', desc: 'Format active code document' },
    { key: 'Ctrl / Cmd + P', desc: 'Quick open file search' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#101010] border border-[#2b2b2b] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-white select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#222] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white text-black font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">STUDIO SETTINGS & AI MEMORY</h2>
              <p className="text-xs text-neutral-400">Context retention, editor keys, and preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:text-white text-neutral-400 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 py-3 border-b border-[#222] bg-[#0c0c0c] flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'memory' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            AI Project Memory
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'shortcuts' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            Keyboard Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded transition ${activeTab === 'general' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs bg-[#0e0e0e] max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'memory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>Technical Context & Architectural Decisions</span>
                </span>
                {savedNotice && (
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Memory Saved</span>
                  </span>
                )}
              </div>
              <p className="text-neutral-400 leading-relaxed">
                The Maya multi-agent system references this memory on every task. Document architectural patterns, state standards, branding rules, or API endpoints below.
              </p>
              <textarea
                value={memoryInput}
                onChange={(e) => setMemoryInput(e.target.value)}
                placeholder="Example: Always use functional React components with Tailwind CSS. Database queries must use Drizzle with sanitized error wrappers. Target brand palette: pure monochrome (#080808, #ffffff)."
                rows={6}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white leading-relaxed"
              />
              <button
                onClick={handleSave}
                className="flex items-center space-x-1.5 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Project Memory</span>
              </button>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <Keyboard className="w-4 h-4 text-neutral-300" />
                <span>Studio Keyboard Navigation</span>
              </span>
              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                {shortcuts.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#141414] border border-[#242424] rounded-lg flex items-center justify-between"
                  >
                    <span className="text-neutral-300">{s.desc}</span>
                    <span className="bg-black border border-neutral-700 px-2 py-1 rounded text-white font-bold text-[11px]">
                      {s.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#141414] border border-[#242424] rounded-xl">
                <div>
                  <h4 className="font-semibold text-white">Default Theme</h4>
                  <p className="text-neutral-400 text-[11px]">High-contrast monochrome dark mode</p>
                </div>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-black border border-neutral-700 text-neutral-300">
                  Maya Dark (#080808)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#141414] border border-[#242424] rounded-xl">
                <div>
                  <h4 className="font-semibold text-white">Cloud SQL Auto-Sync</h4>
                  <p className="text-neutral-400 text-[11px]">Save project files to PostgreSQL automatically</p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Enabled</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
