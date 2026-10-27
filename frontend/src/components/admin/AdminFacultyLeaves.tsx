import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  X,
  Briefcase,
} from 'lucide-react';

export const AdminFacultyLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Decision Modal
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [decisionRemarks, setDecisionRemarks] = useState<string>('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/leaves/faculty');
      const data = await res.json();
      if (data.status === 'success') {
        setLeaves(data.leaves || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/leaves/faculty/process', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: selectedLeave.id || selectedLeave.leave_id,
          status: decisionStatus,
          remarks: decisionRemarks,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setSelectedLeave(null);
        setDecisionRemarks('');
        fetchLeaves();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-400" />
            Faculty Leave Applications & Approvals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit faculty leave quotas, substitute lecturer arrangements, and record authoritative institutional decisions.
          </p>
        </div>
        <button
          onClick={fetchLeaves}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Leaves Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Leave Type & Duration</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Reason / Substitute</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading faculty leave records...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                    No pending faculty leave applications!
                  </td>
                </tr>
              ) : (
                leaves.map((l) => {
                  const isPending = l.status === 'Pending' || l.status === 'Submitted';
                  return (
                    <tr key={l.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{l.faculty_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{l.faculty_email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-sky-300">{l.leave_type || 'Casual Leave'}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{l.days_count || 1} Days Total</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {l.start_date} to {l.end_date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 line-clamp-1">{l.reason || 'Personal Duty'}</div>
                        {l.substitute_faculty && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Sub: {l.substitute_faculty}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            l.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : l.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {l.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedLeave(l);
                                setDecisionStatus('Approved');
                                setDecisionRemarks('Approved by Dean of Faculty Affairs');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeave(l);
                                setDecisionStatus('Rejected');
                                setDecisionRemarks('Clash with scheduled exams');
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
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                Faculty Leave Decision: {decisionStatus}
              </h3>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>Faculty: <strong className="text-white">{selectedLeave.faculty_name}</strong></div>
              <div>Leave Type: <strong className="text-sky-300">{selectedLeave.leave_type}</strong> ({selectedLeave.days_count} days)</div>
              <div>Dates: {selectedLeave.start_date} to {selectedLeave.end_date}</div>
            </div>

            <form onSubmit={handleDecision} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Approver Remarks / Institutional Decision</label>
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
                  onClick={() => setSelectedLeave(null)}
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
