import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  User,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminAuditLogsSecurity: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [marksLogs, setMarksLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'admin' | 'marks'>('admin');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [aRes, mRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/audit-logs'),
        fetch('http://localhost:5000/api/admin/audit-logs/marks'),
      ]);
      const aData = await aRes.json();
      const mData = await mRes.json();
      if (aData.status === 'success') setLogs(aData.logs || []);
      if (mData.status === 'success') setMarksLogs(mData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Security Monitoring & Immutable Audit Trails
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident logs of administrative overrides, grade adjustments, account provisioning, and security events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('admin')}
          className={`pb-2 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'admin'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Administrative Action Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`pb-2 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'marks'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Examination Marks Corrections Trail ({marksLogs.length})
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor email, or target..."
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'admin' ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.admin_name || 'Admin'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.admin_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                      {log.target_type}: {log.target_id || 'Global'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate">
                      {log.details || 'Operational update committed.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Corrected At</th>
                  <th className="py-3 px-4">Student Roll</th>
                  <th className="py-3 px-4">Subject & Component</th>
                  <th className="py-3 px-4">Shift (Previous → New)</th>
                  <th className="py-3 px-4">Mandatory Reason</th>
                  <th className="py-3 px-4">Corrected By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {marksLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No grade corrections recorded in audit log.
                    </td>
                  </tr>
                ) : (
                  marksLogs.map((ml) => (
                    <tr key={ml.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {ml.corrected_at ? new Date(ml.corrected_at).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">{ml.student_roll}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{ml.subject_code}</div>
                        <div className="text-[10px] text-slate-400">{ml.component_name}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className="text-rose-400">{ml.previous_marks}</span>
                        <span className="text-slate-500 mx-1.5">→</span>
                        <span className="text-emerald-400">{ml.new_marks}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{ml.reason}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{ml.corrected_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
