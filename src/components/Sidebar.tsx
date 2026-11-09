import React from 'react';
import {
  FolderTree,
  Bot,
  MessageSquare,
  Cpu,
  Database,
  GitBranch,
  Wrench,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react';

export type ActiveNavTab =
  | 'explorer'
  | 'agents'
  | 'chat'
  | 'models'
  | 'database'
  | 'git'
  | 'repair'
  | 'templates'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveNavTab | null;
  onSelectTab: (tab: ActiveNavTab) => void;
  hasErrors?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  hasErrors,
}) => {
  const tabs = [
    { id: 'explorer', label: 'Project Explorer', icon: FolderTree },
    { id: 'agents', label: '8-Agent AI Team', icon: Bot },
    { id: 'chat', label: 'AI Coding Assistant', icon: MessageSquare },
    { id: 'repair', label: 'Autonomous AI Debugger', icon: Wrench, badge: hasErrors },
    { id: 'database', label: 'Cloud SQL PostgreSQL', icon: Database },
    { id: 'git', label: 'Version Control & Git', icon: GitBranch },
    { id: 'models', label: 'Model & API Registry', icon: Cpu },
    { id: 'templates', label: 'Starter Templates', icon: Layers },
    { id: 'settings', label: 'Settings & Memory', icon: Settings },
  ];

  return (
    <aside className="w-12 bg-[#090909] border-r border-[#222222] flex flex-col items-center py-3 justify-between select-none shrink-0 z-10">
      <div className="flex flex-col items-center space-y-1 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as ActiveNavTab)}
              className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition group ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#181818]'
              }`}
              title={tab.label}
              aria-label={tab.label}
            >
              <Icon className="w-4 h-4" />
              {tab.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              {/* Tooltip */}
              <span className="absolute left-14 bg-[#1a1a1a] border border-[#333] text-white text-[11px] px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <a
          href="https://ai.google.dev"
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-[#181818] transition"
          title="Google AI Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </a>
      </div>
    </aside>
  );
};
