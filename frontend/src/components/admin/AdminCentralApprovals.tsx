import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  HeartPulse,
  Calendar,
  X,
  FileCheck2,
} from 'lucide-react';

export const AdminCentralApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Decision Modal
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [decisionRemarks, setDecisionRemarks] = useState<string>('');

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/approvals/central');
      const data = await res.json();
      if (data.status === 'success') {
        setApprovals(data.approvals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/approvals/central/process', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedApproval.category,
          id: selectedApproval.id,
          status: decisionStatus,
          remarks: decisionRemarks,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setSelectedApproval(null);
        setDecisionRemarks('');
        fetchApprovals();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const filtered = approvals.filter(
    (a) => categoryFilter === 'All' || a.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Central Student Approvals Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidated administrative workflow for Student ID Cards, Fest Passes, Medical Leaves, and Academic Approvals.
          </p>
        </div>
        <button
          onClick={fetchApprovals}
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Digital Card', 'Medical Certificate', 'Student Leave'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Approvals Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Request & Category</th>
                <th className="py-3 px-4">Student & Roll</th>
                <th className="py-3 px-4">Details / Title</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading central approvals queue...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                    All student approval requests have been processed!
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isPending = item.status === 'Pending' || item.status === 'Submitted';
                  const catIcons: any = {
                    'Digital Card': CreditCard,
                    'Medical Certificate': HeartPulse,
                    'Student Leave': Calendar,
                  };
                  const Icon = catIcons[item.category] || FileText;

                  return (
                    <tr key={`${item.category}-${item.id}`} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-indigo-400" />
                          <span className="font-semibold text-white">{item.category}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.request_id || `#${item.id}`}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{item.student_name}</div>
                        <div className="text-[11px] text-indigo-300 font-mono">{item.roll_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300 font-medium">{item.title || 'General Request'}</div>
                        <div className="text-[11px] text-slate-400">{item.class_name || 'B.Tech CSE'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : item.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {item.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedApproval(item);
                                setDecisionStatus('Approved');
                                setDecisionRemarks('Approved by Central Administration');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApproval(item);
                                setDecisionStatus('Rejected');
                                setDecisionRemarks('Incomplete documentation');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30 transition text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                Process {selectedApproval.category}: {decisionStatus}
              </h3>
              <button onClick={() => setSelectedApproval(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>Student: <strong className="text-white">{selectedApproval.student_name}</strong> ({selectedApproval.roll_number})</div>
              <div>Item: <strong className="text-white">{selectedApproval.title}</strong></div>
            </div>

            <form onSubmit={handleDecision} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Administrative Remarks / Decision Reason</label>
                <textarea
                  required
                  rows={3}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApproval(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-white font-semibold shadow-lg ${
                    decisionStatus === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {decisionStatus}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
