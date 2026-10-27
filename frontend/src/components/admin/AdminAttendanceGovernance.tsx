import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Edit2,
  X,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';

export const AdminAttendanceGovernance: React.FC = () => {
  const [summary, setSummary] = useState<{ overall: any[]; shortageList: any[] }>({
    overall: [],
    shortageList: [],
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'shortage' | 'sessions'>('shortage');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Override Modal
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    newStatus: 'Present',
    reason: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, sesRes] = await Promise.all([
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/attendance/summary'),
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/attendance/sessions'),
      ]);
      const sumData = await sumRes.json();
      const sesData = await sesRes.json();
      if (sumData.status === 'success') setSummary(sumData);
      if (sesData.status === 'success') setSessions(sesData.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/attendance/override', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId: selectedRecord.id,
          rollNumber: selectedRecord.roll_number,
          newStatus: overrideForm.newStatus,
          reason: overrideForm.reason,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowOverrideModal(false);
        setSelectedRecord(null);
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
            <Clock className="w-5 h-5 text-indigo-400" />
            Attendance Policy & Administrative Correction Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor 75% attendance threshold adherence, debarment shortfalls, and record audited corrections.
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

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('shortage')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'shortage'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Attendance Shortage Debarment Roster ({summary.shortageList?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'sessions'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Session Registers ({sessions.length})
        </button>
      </div>

      {/* Shortage Roster */}
      {activeTab === 'shortage' ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Class & Department</th>
                  <th className="py-3 px-4">Lectures Attended</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4 text-right">Debarment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Analyzing attendance records...
                    </td>
                  </tr>
                ) : summary.shortageList?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                      All students currently maintain &gt; 75% attendance threshold!
                    </td>
                  </tr>
                ) : (
                  summary.shortageList.map((stu, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">{stu.student_name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">{stu.roll_number}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {stu.class_name} • {stu.department}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {stu.present_lectures} / {stu.total_lectures}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-rose-400 font-mono">{stu.percentage}%</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          Debarment Warning
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Student & Roll</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Faculty Recorder</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{rec.date}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.time_slot || '10:00 AM'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{rec.student_name}</div>
                      <div className="text-[11px] text-indigo-300 font-mono">{rec.roll_number}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {rec.subject || rec.subject_code}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          rec.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : rec.status === 'Absent'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {rec.faculty_name || 'Faculty'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRecord(rec);
                          setOverrideForm({ newStatus: rec.status === 'Present' ? 'Absent' : 'Present', reason: '' });
                          setShowOverrideModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/20 transition inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Audited Override
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {showOverrideModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Audited Attendance Correction
              </h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>Student: <strong className="text-white">{selectedRecord.student_name}</strong> ({selectedRecord.roll_number})</div>
              <div>Subject: <strong className="text-white">{selectedRecord.subject}</strong></div>
              <div>Current Status: <strong className="text-amber-400">{selectedRecord.status}</strong> on {selectedRecord.date}</div>
            </div>

            <form onSubmit={handleOverride} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Authoritative Status</label>
                <select
                  value={overrideForm.newStatus}
                  onChange={(e) => setOverrideForm({ ...overrideForm, newStatus: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="On Duty">On Duty (Authorized College Duty)</option>
                  <option value="Medical Leave">Medical Leave (Approved)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Audit Justification / Reason</label>
                <textarea
                  required
                  rows={3}
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="e.g. Authorized participating in Hackathon as verified by HOD memo #402"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Commit with Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
