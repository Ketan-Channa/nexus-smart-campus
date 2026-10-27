import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  FileText,
  CheckSquare,
  Copy,
  Check,
  Send,
  RefreshCw,
} from 'lucide-react';

export const AdminUtilitiesAi: React.FC = () => {
  const [taskType, setTaskType] = useState<string>('NOTICE_DRAFT');
  const [promptInput, setPromptInput] = useState<string>('');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/utilities/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType, contextPrompt: promptInput }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAiOutput(data.output || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-slate-900/60 border border-purple-500/30 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              COGNITIVE ADMINISTRATIVE COPILOT
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            AI Assistant & Governance Administrative Utilities
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accelerate executive notice drafting, generate campus operational summaries, and build institutional checklists.
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Select Administrative Utility
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'NOTICE_DRAFT', label: 'Draft Notice', desc: 'Official Circulars' },
              { id: 'REPORT_SUMMARY', label: 'Audit Summary', desc: 'Campus Health' },
              { id: 'CHECKLIST', label: 'Checklist Maker', desc: 'Compliance' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTaskType(t.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  taskType === t.id
                    ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-xs">{t.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                Context & Administrative Instructions
              </label>
              <textarea
                required
                rows={5}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={
                  taskType === 'NOTICE_DRAFT'
                    ? 'e.g. Announce end-semester examination dates starting November 25th for all 7th semester engineering batches.'
                    : taskType === 'REPORT_SUMMARY'
                    ? 'e.g. Summarize academic attendance and emergency incident resolution performance for Q3 2026.'
                    : 'e.g. Create a verification checklist for student graduation clearance and fee settlement.'
                }
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Administrative Draft...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Draft
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Generated Output Draft
              </h3>
              {aiOutput && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            {aiOutput ? (
              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 max-h-[380px] overflow-y-auto">
                {aiOutput}
              </pre>
            ) : (
              <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Bot className="w-8 h-8 text-slate-600" />
                Awaiting input instructions. Selected utility output will render here.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 mt-4">
            Notice: AI-generated administrative output requires explicit review and confirmation before official issuance.
          </div>
        </div>
      </div>
    </div>
  );
};
