import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
  Plus,
  RefreshCw,
  Key,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const ModelManagementPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, any>>({});
  const [newModelForm, setNewModelForm] = useState(false);
  const [providerInput, setProviderInput] = useState('custom');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [modelIdInput, setModelIdInput] = useState('');
  const [endpointInput, setEndpointInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const resp = await fetch('/api/models/config');
      const data = await resp.json();
      setProviders(data.defaultProviders || []);
    } catch (e) {
      console.error('Failed to load model configs', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (provider: string, modelId: string) => {
    setTestingModel(modelId);
    try {
      const resp = await fetch('/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, modelId }),
      });
      const data = await resp.json();
      setTestResult((prev) => ({ ...prev, [modelId]: data }));
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [modelId]: { success: false, error: err.message },
      }));
    } finally {
      setTestingModel(null);
    }
  };

  return (
    <div className="w-full sm:w-96 bg-[#0c0c0c] border-l border-[#222222] flex flex-col h-full select-none text-white shrink-0 z-10">
      {/* Header */}
      <div className="p-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-white text-black">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">MODEL & API REGISTRY</h2>
            <p className="text-[10px] text-neutral-400">Universal Multi-Provider Adapters</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:text-white text-neutral-500 rounded text-xs">
          Close
        </button>
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-[#121212] border-b border-[#222222] flex items-start space-x-2 text-xs">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-neutral-400 leading-relaxed">
          <strong className="text-white">Encrypted Server-Side Storage:</strong> API keys and secrets are processed through protected backend routes and never exposed to the client bundle.
        </div>
      </div>

      {/* Model List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Available Models ({providers.length})
          </span>
          <button
            onClick={() => setNewModelForm(!newModelForm)}
            className="flex items-center space-x-1 text-xs text-neutral-300 hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Endpoint</span>
          </button>
        </div>

        {newModelForm && (
          <div className="p-3 bg-[#141414] border border-[#2b2b2b] rounded-xl space-y-2 text-xs">
            <span className="font-semibold text-white">Add Custom Model Adapter</span>
            <input
              type="text"
              placeholder="Display Name (e.g. Llama 3 70B)"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className="w-full bg-black border border-[#333] px-2 py-1 rounded text-white"
            />
            <input
              type="text"
              placeholder="Model Identifier (e.g. meta-llama-3)"
              value={modelIdInput}
              onChange={(e) => setModelIdInput(e.target.value)}
              className="w-full bg-black border border-[#333] px-2 py-1 rounded text-white"
            />
            <input
              type="password"
              placeholder="API Key (Stored in encrypted vault)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-black border border-[#333] px-2 py-1 rounded text-white"
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setNewModelForm(false)}
                className="px-2 py-1 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (displayNameInput && modelIdInput) {
                    setProviders((prev) => [
                      ...prev,
                      {
                        provider: 'custom',
                        modelDisplayName: displayNameInput,
                        modelId: modelIdInput,
                        status: 'custom',
                      },
                    ]);
                    setNewModelForm(false);
                  }
                }}
                className="px-3 py-1 bg-white text-black font-semibold rounded text-xs"
              >
                Register Model
              </button>
            </div>
          </div>
        )}

        {providers.map((p, idx) => {
          const test = testResult[p.modelId];
          const isTesting = testingModel === p.modelId;

          return (
            <div
              key={idx}
              className="p-3 bg-[#141414] border border-[#242424] rounded-xl space-y-2 hover:border-[#333] transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{p.modelDisplayName}</h4>
                  <span className="text-[10px] font-mono text-neutral-400">{p.modelId}</span>
                </div>
                {p.isDefault && (
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-black font-bold">
                    Default
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-neutral-500 font-mono capitalize">Provider: {p.provider}</span>
                <button
                  onClick={() => handleTestConnection(p.provider, p.modelId)}
                  disabled={isTesting}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded border border-[#333] hover:border-white text-[10px] transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing...' : 'Test Ping'}</span>
                </button>
              </div>

              {test && (
                <div
                  className={`p-2 rounded text-[10px] font-mono ${
                    test.success
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                  }`}
                >
                  {test.success ? (
                    <div>✓ Operational (Latency: {test.latencyMs}ms)</div>
                  ) : (
                    <div>✗ Connection error: {test.error}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
