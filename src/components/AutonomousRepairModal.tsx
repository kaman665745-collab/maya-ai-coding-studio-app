import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Diff,
  FileCode,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';

interface AutonomousRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorTrace: string;
  activeFile: string;
  fileContent: string;
  files: Record<string, string>;
  onApplyFix: (targetFile: string, correctedContent: string) => void;
  onRestoreCheckpoint?: () => void;
  hasCheckpoint?: boolean;
}

export const AutonomousRepairModal: React.FC<AutonomousRepairModalProps> = ({
  isOpen,
  onClose,
  errorTrace,
  activeFile,
  fileContent,
  files,
  onApplyFix,
  onRestoreCheckpoint,
  hasCheckpoint,
}) => {
  const [repairMode, setRepairMode] = useState<'manual' | 'assisted' | 'autonomous'>('assisted');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [correctedCode, setCorrectedCode] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  if (!isOpen) return null;

  const handleStartRepair = async () => {
    setIsDiagnosing(true);
    setAnalysisResult(null);
    setCorrectedCode(null);
    setIsApplied(false);

    try {
      const resp = await fetch('/api/ai/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorTrace,
          activeFile,
          fileContent,
          projectFiles: files,
          repairMode,
        }),
      });

      const data = await resp.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);

        // Extract code block
        const match = data.analysis.match(/```(?:tsx|ts|jsx|js|html|css|json)?\n([\s\S]*?)```/);
        if (match) {
          const code = match[1];
          setCorrectedCode(code);

          // If Mode C: Autonomous, immediately apply the fix
          if (repairMode === 'autonomous') {
            onApplyFix(activeFile, code);
            setIsApplied(true);
          }
        }
      } else {
        setAnalysisResult(data.error || 'Diagnosis failed. Check network connection.');
      }
    } catch (err: any) {
      setAnalysisResult(`Error running repair: ${err.message}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleManualApply = () => {
    if (correctedCode && activeFile) {
      onApplyFix(activeFile, correctedCode);
      setIsApplied(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#101010] border border-[#2b2b2b] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#222] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide flex items-center space-x-2">
                <span>Autonomous AI Code Repair</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                  Mode: {repairMode.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Self-healing diagnostic loop with automated verification and rollback protection
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:text-white text-neutral-400 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Repair Mode Selector */}
        <div className="px-6 py-3 border-b border-[#222] bg-[#0c0c0c] flex items-center justify-between text-xs">
          <span className="text-neutral-400">Select Safeguard Mode:</span>
          <div className="flex bg-[#161616] border border-[#2b2b2b] rounded-lg p-1 space-x-1">
            <button
              onClick={() => setRepairMode('manual')}
              className={`px-3 py-1 rounded transition ${repairMode === 'manual' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              Manual Fix
            </button>
            <button
              onClick={() => setRepairMode('assisted')}
              className={`px-3 py-1 rounded transition ${repairMode === 'assisted' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              Assisted Auto Fix
            </button>
            <button
              onClick={() => setRepairMode('autonomous')}
              className={`px-3 py-1 rounded transition ${repairMode === 'autonomous' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              Autonomous Fix
            </button>
          </div>
        </div>

        {/* Error Trace & Target file */}
        <div className="p-5 border-b border-[#222] bg-[#0d0d0d] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center space-x-1.5">
              <FileCode className="w-3.5 h-3.5 text-neutral-300" />
              <span>Target File: <strong className="text-white font-mono">{activeFile}</strong></span>
            </span>
            {hasCheckpoint && onRestoreCheckpoint && (
              <button
                onClick={onRestoreCheckpoint}
                className="flex items-center space-x-1 text-neutral-400 hover:text-white font-mono text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Previous Checkpoint</span>
              </button>
            )}
          </div>

          <div className="bg-black border border-neutral-800 p-3 rounded-lg font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
            {errorTrace || 'No error trace provided. Analyzing file for defects.'}
          </div>

          {!analysisResult && (
            <button
              onClick={handleStartRepair}
              disabled={isDiagnosing}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition shadow disabled:opacity-50 text-xs"
            >
              {isDiagnosing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Diagnosing & Synthesizing Patch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Execute Diagnostic & Code Repair</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Analysis and Proposed Fix */}
        {analysisResult && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs bg-[#0b0b0b]">
            <div className="p-4 bg-[#141414] border border-[#262626] rounded-xl whitespace-pre-wrap font-mono text-neutral-200 leading-relaxed select-text">
              {analysisResult}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-neutral-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Checkpoint preserved. Reversible with 1-click.</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleStartRepair}
                  className="px-3 py-1.5 border border-[#333] hover:border-white rounded text-xs transition"
                >
                  Re-analyze
                </button>
                {isApplied ? (
                  <div className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Fix Applied & Workspace Updated!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleManualApply}
                    disabled={!correctedCode}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-white text-black font-bold hover:bg-neutral-200 rounded text-xs shadow transition disabled:opacity-50"
                  >
                    <span>Approve & Apply Patch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
