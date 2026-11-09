import React from 'react';
import { Layers, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { STARTER_TEMPLATES, ProjectTemplate } from '../data/templates.ts';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#101010] border border-[#2b2b2b] rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden text-white select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#222] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white text-black font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">PROJECT TEMPLATES</h2>
              <p className="text-xs text-neutral-400">Production-ready starting foundations with live previews</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:text-white text-neutral-400 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
          {STARTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 bg-[#141414] border border-[#242424] rounded-xl flex flex-col justify-between hover:border-neutral-500 transition group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 px-2 py-0.5 rounded border border-neutral-800">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {Object.keys(tmpl.files).length} files
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-white transition">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-[#1f1f1f] group-hover:bg-white group-hover:text-black font-semibold rounded-lg text-xs transition"
              >
                <span>Load Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
