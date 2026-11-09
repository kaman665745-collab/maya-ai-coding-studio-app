import React, { useState } from 'react';
import {
  Compass,
  Code,
  Bug,
  CheckCircle,
  Palette,
  TestTube,
  ShieldAlert,
  Zap,
  Sparkles,
  Play,
  Search,
  RotateCcw,
  Clock,
  Layers,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import { AgentRole, AGENT_SYSTEM_PROMPTS } from '../lib/gemini.ts';

interface AgentTeamPanelProps {
  files: Record<string, string>;
  activeFile: string;
  onApplyCode: (targetFile: string, newCode: string) => void;
  onClose: () => void;
}

export const AgentTeamPanel: React.FC<AgentTeamPanelProps> = ({
  files,
  activeFile,
  onApplyCode,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<AgentRole>('coding');
  const [prompt, setPrompt] = useState('');
  const [useSearch, setUseSearch] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<
    { role: AgentRole; prompt: string; result: string; timestamp: number }[]
  >([]);

  const agents: { id: AgentRole; name: string; title: string; icon: any; desc: string }[] = [
    {
      id: 'architect',
      name: 'Architect Agent',
      title: 'System Design & Decomposition',
      icon: Compass,
      desc: 'Plans modular component architecture, schemas, and task sequences.',
    },
    {
      id: 'coding',
      name: 'Coding Agent',
      title: 'Full-Stack Implementation',
      icon: Code,
      desc: 'Writes clean TypeScript, React components, and functional modules.',
    },
    {
      id: 'debugging',
      name: 'Debugging Agent',
      title: 'Autonomous Bug Diagnosis',
      icon: Bug,
      desc: 'Traces runtime exceptions, compiler defects, and broken imports.',
    },
    {
      id: 'review',
      name: 'Code Review Agent',
      title: 'Clean Code & Audit',
      icon: CheckCircle,
      desc: 'Evaluates maintainability, SOLID principles, and scores code health.',
    },
    {
      id: 'uiux',
      name: 'UI/UX Agent',
      title: 'Design Systems & Accessibility',
      icon: Palette,
      desc: 'Polishes layouts, WCAG 2.1 contrast, responsive views, and typography.',
    },
    {
      id: 'testing',
      name: 'Testing Agent',
      title: 'QA & Regression Verification',
      icon: TestTube,
      desc: 'Generates unit tests and validates user journeys and edge conditions.',
    },
    {
      id: 'security',
      name: 'Security Agent',
      title: 'Vulnerability & Secret Audit',
      icon: ShieldAlert,
      desc: 'Audits OWASP threats, token leaks, input sanitization, and auth rules.',
    },
    {
      id: 'performance',
      name: 'Performance Agent',
      title: 'Latency & Bundle Optimization',
      icon: Zap,
      desc: 'Eliminates redundant renders, optimizes asset weights, and boosts speed.',
    },
  ];

  const currentAgent = agents.find((a) => a.id === selectedRole)!;

  const handleRunAgent = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsRunning(true);
    setAgentOutput(null);

    try {
      const resp = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          prompt: finalPrompt,
          projectContext: {
            activeFile,
            activeCode: files[activeFile] || '',
            files,
          },
          useSearch,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setAgentOutput(data.response);
        setHistory((prev) => [
          { role: selectedRole, prompt: finalPrompt, result: data.response, timestamp: Date.now() },
          ...prev.slice(0, 10),
        ]);
      } else {
        setAgentOutput(`Error from ${currentAgent.name}: ${data.error || 'Failed to complete task'}`);
      }
    } catch (err: any) {
      setAgentOutput(`Network error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (agentOutput) {
      navigator.clipboard.writeText(agentOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyToActiveFile = () => {
    if (!agentOutput || !activeFile) return;
    // Extract code block if markdown present
    const match = agentOutput.match(/```(?:tsx|ts|jsx|js|html|css)?\n([\s\S]*?)```/);
    const codeToApply = match ? match[1] : agentOutput;
    onApplyCode(activeFile, codeToApply);
  };

  return (
    <div className="w-full sm:w-96 bg-[#0c0c0c] border-l border-[#222222] flex flex-col h-full select-none text-white shrink-0 z-10">
      {/* Header */}
      <div className="p-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs">
            8
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">MAYA AGENT TEAM</h2>
            <p className="text-[10px] text-neutral-400">Autonomous Engineering Squad</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:text-white text-neutral-500 rounded text-xs">
          Close
        </button>
      </div>

      {/* Agents Selection Grid */}
      <div className="p-2 border-b border-[#1f1f1f] bg-[#090909]">
        <div className="grid grid-cols-4 gap-1">
          {agents.map((ag) => {
            const Icon = ag.icon;
            const isSelected = selectedRole === ag.id;
            return (
              <button
                key={ag.id}
                onClick={() => setSelectedRole(ag.id)}
                className={`flex flex-col items-center justify-center p-2 rounded transition text-center ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'bg-[#141414] text-neutral-400 hover:text-white hover:bg-[#1c1c1c] border border-[#222]'
                }`}
                title={ag.title}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[9px] truncate w-full">{ag.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Bio */}
      <div className="p-3 bg-[#121212] border-b border-[#222222] flex items-start space-x-2.5">
        <div className="p-2 bg-black border border-neutral-800 rounded-lg shrink-0">
          <currentAgent.icon className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">{currentAgent.name}</h3>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-400">
              Active
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{currentAgent.desc}</p>
        </div>
      </div>

      {/* Prompt Input Form */}
      <div className="p-3 border-b border-[#222222] space-y-2.5 bg-[#0e0e0e]">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Target: <strong className="text-white">{activeFile || 'Workspace'}</strong></span>
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={useSearch}
              onChange={(e) => setUseSearch(e.target.checked)}
              className="rounded bg-[#1a1a1a] border-neutral-700 text-white"
            />
            <Search className="w-3 h-3 text-neutral-400" />
            <span>Search Grounding</span>
          </label>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Instruct the ${currentAgent.name} (e.g. ${
            selectedRole === 'architect'
              ? 'Plan database & component architecture for this app...'
              : selectedRole === 'coding'
              ? 'Implement responsive user profile modal...'
              : selectedRole === 'review'
              ? 'Audit this file for code smells & performance bottlenecks...'
              : 'Analyze and optimize this code...'
          })`}
          rows={3}
          className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={() => handleRunAgent()}
            disabled={isRunning || !prompt.trim()}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-white text-black hover:bg-neutral-200 font-bold rounded-lg text-xs shadow transition disabled:opacity-50"
          >
            {isRunning ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Agent Executing...</span>
              </span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Execute {currentAgent.name}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Canvas */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0a0a0a]">
        <div className="p-2 border-b border-[#1c1c1c] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>AGENT EXECUTION REPORT</span>
          {agentOutput && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleCopy}
                className="hover:text-white flex items-center space-x-1 p-1 rounded hover:bg-[#1a1a1a]"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleApplyToActiveFile}
                className="hover:text-white bg-[#1c1c1c] text-white px-2 py-0.5 rounded border border-[#333] hover:border-white transition"
                title="Apply generated code directly to active file"
              >
                Apply to File
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed custom-scrollbar font-mono text-neutral-200 whitespace-pre-wrap select-text">
          {agentOutput ? (
            agentOutput
          ) : isRunning ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500 space-y-3">
              <Sparkles className="w-8 h-8 animate-spin text-white" />
              <p className="font-sans text-xs">{currentAgent.name} is synthesizing solution...</p>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-600 font-sans space-y-2">
              <p className="text-xs">No active agent task.</p>
              <p className="text-[11px]">Type instructions above and click Execute to engage Maya AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
