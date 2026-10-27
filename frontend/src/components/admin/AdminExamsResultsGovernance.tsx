import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  X,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminExamsResultsGovernance: React.FC = () => {
  const [marks, setMarks] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Correction Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [selectedMark, setSelectedMark] = useState<any | null>(null);
  const [newScore, setNewScore] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(`https://nexus-smart-campus-backend.onrender.com/api/admin/exams/marks?search=${encodeURIComponent(searchTerm)}`),
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/exams/schemes'),
      ]);
      const mData = await mRes.json();
      const sData = await sRes.json();
      if (mData.status === 'success') setMarks(mData.marks || []);
      if (sData.status === 'success') setSchemes(sData.schemes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCorrectMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMark || !newScore || !correctionReason) return;
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/exams/marks/correct', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markId: selectedMark.id,
          newScore: Number(newScore),
          reason: correctionReason,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowCorrectionModal(false);
        setSelectedMark(null);
        setNewScore('');
        setCorrectionReason('');
        fetchData();
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
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Exams, Assessment Schemes & Results Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit subject assessment components, publish authoritative results, and execute audited marks corrections.
          </p>
        </div>
        <button
          onClick={fetchData}
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

      {/* Search and Filters */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className="relative w-full max-w-sm"
        >
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name or roll number..."
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
          />
        </form>
        <span className="text-xs text-slate-400 font-mono">{marks.length} Score Records</span>
      </div>

      {/* Marks Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject & Component</th>
                <th className="py-3 px-4">Exam Marks</th>
                <th className="py-3 px-4">Attendance Bonus</th>
                <th className="py-3 px-4">Total Score & Grade</th>
                <th className="py-3 px-4 text-right">Audited Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading examination marks...
                  </td>
                </tr>
              ) : marks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No examination marks matching criteria.
                  </td>
                </tr>
              ) : (
                marks.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{m.student_name}</div>
                      <div className="text-[11px] text-indigo-300 font-mono">{m.student_roll}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{m.subject_name || m.subject_code}</div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px] mt-0.5 inline-block">
                        {m.component_name || 'Mid-Sem Exam'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {m.marks_obtained} / {m.max_marks || 30}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      +{m.attendance_marks || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-indigo-300 text-sm">{m.total_score || m.marks_obtained}</span>
                      {m.grade && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                          {m.grade}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedMark(m);
                          setNewScore(String(m.marks_obtained));
                          setShowCorrectionModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/20 transition inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Correct Mark
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correction Modal */}
      {showCorrectionModal && selectedMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Audited Examination Mark Correction
              </h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>Student: <strong className="text-white">{selectedMark.student_name}</strong> ({selectedMark.student_roll})</div>
              <div>Subject: <strong className="text-white">{selectedMark.subject_name || selectedMark.subject_code}</strong></div>
              <div>Component: <strong className="text-indigo-300">{selectedMark.component_name}</strong></div>
              <div>Current Score: <strong className="text-amber-400">{selectedMark.marks_obtained}</strong> / {selectedMark.max_marks || 30}</div>
            </div>

            <form onSubmit={handleCorrectMark} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Authoritative Marks</label>
                <input
                  type="number"
                  required
                  step="0.5"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mandatory Audit Justification / Reason</label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Scrutiny re-evaluation of Q4 approved by Academic Dean"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Save & Log to marks_audit_log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
