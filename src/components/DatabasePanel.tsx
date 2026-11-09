import React, { useState } from 'react';
import {
  Database,
  Table,
  CheckCircle2,
  RefreshCw,
  Server,
  Layers,
  Code,
  Shield,
  ExternalLink,
} from 'lucide-react';

export const DatabasePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedTable, setSelectedTable] = useState<'projects' | 'users' | 'agent_tasks' | 'project_history' | 'api_configurations'>('projects');

  const tables = [
    {
      id: 'projects',
      name: 'projects',
      rows: 'Dynamic',
      desc: 'Stores project files map, virtual filesystem JSON, settings, and memory',
      columns: ['id (serial)', 'user_id (text)', 'name (text)', 'files_json (jsonb)', 'created_at (timestamp)'],
    },
    {
      id: 'users',
      name: 'users',
      rows: 'Dynamic',
      desc: 'Firebase Auth verified user accounts and OAuth profiles',
      columns: ['id (serial)', 'uid (text unique)', 'email (text)', 'display_name (text)', 'created_at (timestamp)'],
    },
    {
      id: 'project_history',
      name: 'project_history',
      rows: 'Dynamic',
      desc: 'Immutable version control commit history and rollback snapshots',
      columns: ['id (serial)', 'project_id (int)', 'commit_hash (text)', 'message (text)', 'files_snapshot (jsonb)'],
    },
    {
      id: 'agent_tasks',
      name: 'agent_tasks',
      rows: 'Dynamic',
      desc: 'Orchestrator telemetry and autonomous task execution logs',
      columns: ['id (serial)', 'agent_type (text)', 'status (text)', 'prompt (text)', 'model_used (text)'],
    },
    {
      id: 'api_configurations',
      name: 'api_configurations',
      rows: 'Dynamic',
      desc: 'User registered model providers and encrypted keys',
      columns: ['id (serial)', 'provider (text)', 'model_display_name (text)', 'model_id (text)', 'is_default (bool)'],
    },
  ];

  const activeTableData = tables.find((t) => t.id === selectedTable)!;

  return (
    <div className="w-full sm:w-96 bg-[#0c0c0c] border-l border-[#222222] flex flex-col h-full select-none text-white shrink-0 z-10">
      {/* Header */}
      <div className="p-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-white text-black">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">CLOUD SQL POSTGRESQL</h2>
            <p className="text-[10px] text-neutral-400">Instance: ai-studio-b2276002</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:text-white text-neutral-500 rounded text-xs">
          Close
        </button>
      </div>

      {/* Instance Connection Health Card */}
      <div className="p-3 bg-[#121212] border-b border-[#222222] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Connection Active</span>
          </span>
          <span className="text-[10px] font-mono bg-black border border-neutral-800 px-2 py-0.5 rounded text-neutral-300">
            asia-southeast1
          </span>
        </div>
        <div className="text-[11px] text-neutral-400 leading-relaxed font-mono">
          Engine: PostgreSQL 16 (Cloud SQL Developer Edition)<br />
          ORM: Drizzle Kit & pg connection pool
        </div>
      </div>

      {/* Table Selector */}
      <div className="p-2 border-b border-[#1c1c1c] bg-[#090909]">
        <span className="text-[10px] uppercase font-bold text-neutral-400 px-1 mb-1 block">
          Relational Schema Tables ({tables.length})
        </span>
        <div className="grid grid-cols-2 gap-1">
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTable(t.id as any)}
              className={`p-2 rounded text-left transition flex items-center space-x-1.5 text-xs ${
                selectedTable === t.id
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#222]'
              }`}
            >
              <Table className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Table Inspector */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white font-mono">{activeTableData.name}</h4>
            <span className="text-[10px] text-neutral-500 font-mono">Drizzle Schema</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">{activeTableData.desc}</p>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Columns & Data Types</span>
          <div className="space-y-1 font-mono text-[11px]">
            {activeTableData.columns.map((col, idx) => (
              <div
                key={idx}
                className="p-2 bg-[#121212] border border-neutral-800 rounded flex items-center justify-between text-neutral-300"
              >
                <span>{col.split(' ')[0]}</span>
                <span className="text-[10px] text-neutral-500">{col.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
