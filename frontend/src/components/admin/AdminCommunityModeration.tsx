import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ShieldAlert,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';

export const AdminCommunityModeration: React.FC = () => {
  const [data, setData] = useState<{ reports: any[]; posts: any[] }>({
    reports: [],
    posts: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchModeration = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/moderation/reports');
      const json = await res.json();
      if (json.status === 'success') {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModeration();
  }, []);

  const handleModerate = async (reportId: number, targetId: string, action: 'DELETE_POST' | 'DISMISS') => {
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/moderation/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          targetId,
          action,
          reason: action === 'DELETE_POST' ? 'Violated Community Guidelines' : 'Report dismissed by moderator',
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setActionMsg(`Action taken: ${json.message}`);
        fetchModeration();
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Connections, Community & Content Moderation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit user-reported posts, spam/abuse flags, and enforce campus digital safety guidelines.
          </p>
        </div>
        <button
          onClick={fetchModeration}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reports Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          User Abuse & Content Moderation Queue ({data.reports.length})
        </h3>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                      Zero abuse reports pending! Community feed is clean.
                    </td>
                  </tr>
                ) : (
                  data.reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-300">{rep.reporter_email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {rep.category || 'Inappropriate Content'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{rep.description}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{rep.target_id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300">
                          {rep.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleModerate(rep.id, rep.target_id, 'DELETE_POST')}
                          className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30 transition text-[11px] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Take Down
                        </button>
                        <button
                          onClick={() => handleModerate(rep.id, rep.target_id, 'DISMISS')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                        >
                          Dismiss
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
