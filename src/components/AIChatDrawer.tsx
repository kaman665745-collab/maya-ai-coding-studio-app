import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Search,
  Copy,
  Check,
  Code,
  X,
  FileCode,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

interface AIChatDrawerProps {
  files: Record<string, string>;
  activeFile: string;
  onApplyCode: (targetFile: string, code: string) => void;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  files,
  activeFile,
  onApplyCode,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `Hello! I am Maya, your autonomous AI development partner.\nI can assist you with architecture planning, generating components, refactoring code, or debugging errors across your project.\nHow can I help you today?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', text: userText, timestamp: Date.now() },
    ];
    setMessages(newMessages);
    setIsSending(true);

    try {
      // Build context
      const context = `Active File: ${activeFile}\nCode in ${activeFile}:\n\`\`\`\n${files[activeFile] || ''}\n\`\`\`\nProject Files: ${Object.keys(files).join(', ')}`;

      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: newMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          context,
          useSearch,
        }),
      });

      const data = await resp.json();
      if (data.success && data.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.response, timestamp: Date.now() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Error from Maya engine: ${data.error || 'Failed to process request.'}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Network error: ${err.message}`, timestamp: Date.now() },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleExtractAndApply = (text: string) => {
    const match = text.match(/```(?:tsx|ts|jsx|js|html|css|json)?\n([\s\S]*?)```/);
    const code = match ? match[1] : text;
    onApplyCode(activeFile, code);
  };

  return (
    <div className="w-full sm:w-96 bg-[#0c0c0c] border-l border-[#222222] flex flex-col h-full select-none text-white shrink-0 z-10">
      {/* Header */}
      <div className="p-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-white text-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider">MAYA AI ASSISTANT</h2>
            <p className="text-[10px] text-neutral-400">Context-Aware Autonomous Partner</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:text-white text-neutral-500 rounded text-xs">
          Close
        </button>
      </div>

      {/* Target File & Search Grounding Bar */}
      <div className="px-3 py-2 bg-[#121212] border-b border-[#1f1f1f] flex items-center justify-between text-xs">
        <span className="text-neutral-400 truncate max-w-[170px] flex items-center space-x-1">
          <FileCode className="w-3 h-3 text-neutral-500 shrink-0" />
          <span className="truncate">{activeFile || 'No file selected'}</span>
        </span>
        <label className="flex items-center space-x-1.5 cursor-pointer hover:text-white text-[11px] text-neutral-400">
          <input
            type="checkbox"
            checked={useSearch}
            onChange={(e) => setUseSearch(e.target.checked)}
            className="rounded bg-black border-neutral-700 text-white"
          />
          <Search className="w-3 h-3" />
          <span>Search Grounding</span>
        </label>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[90%] whitespace-pre-wrap leading-relaxed select-text font-mono text-[11px] ${
                m.role === 'user'
                  ? 'bg-white text-black font-sans font-medium'
                  : 'bg-[#141414] border border-[#242424] text-neutral-200'
              }`}
            >
              {m.text}
            </div>

            {m.role === 'assistant' && idx > 0 && (
              <div className="flex items-center space-x-2 text-[10px] text-neutral-500 px-1">
                <button
                  onClick={() => handleCopy(m.text, idx)}
                  className="hover:text-white flex items-center space-x-1"
                >
                  {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                </button>
                {activeFile && m.text.includes('```') && (
                  <button
                    onClick={() => handleExtractAndApply(m.text)}
                    className="hover:text-white text-neutral-400 flex items-center space-x-1"
                  >
                    <Code className="w-3 h-3" />
                    <span>Apply to {activeFile.split('/').pop()}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex items-center space-x-2 text-neutral-400 text-xs py-2 px-3 bg-[#141414] border border-[#222] rounded-lg max-w-[70%]">
            <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Maya is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#222222] bg-[#0e0e0e] flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Maya (e.g. build a navbar, fix state bug)..."
          className="flex-1 bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="p-2 bg-white text-black hover:bg-neutral-200 rounded-lg disabled:opacity-50 transition shadow"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5 fill-black" />
        </button>
      </form>
    </div>
  );
};
