import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Send,
  Trash2,
  Paperclip,
  Check,
  User,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import { type UserSession } from '../../types/auth';

interface FacultyLeaveRecord {
  id: number;
  leaveId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  attachmentUrl?: string;
  substituteFaculty?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Clarification Requested';
  approverName?: string;
  approverRemarks?: string;
  decisionDate?: string;
  createdAt: string;
}

interface FacultyLeaveApplicationsProps {
  session: UserSession;
  facultyName?: string;
  facultyEmail?: string;
  department?: string;
}

export const FacultyLeaveApplications: React.FC<FacultyLeaveApplicationsProps> = ({
  session,
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
  department = 'Computer Science & Engineering',
}) => {
  const [leaves, setLeaves] = useState<FacultyLeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [substituteFaculty, setSubstituteFaculty] = useState('Prof. Nitin Kumar');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/faculty/leaves/my-leaves`, {
        params: { email: facultyEmail },
      });
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err: any) {
      console.warn('Could not fetch leaves:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [facultyEmail]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Please fill in start date, end date, and reason.');
      return;
    }

    setLoading(true);
    setActionMsg(null);
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diffDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);

      const res = await axios.post(`${API_BASE}/faculty/leaves/apply`, {
        facultyEmail,
        facultyName,
        employeeId: session.id || (session as any).employee_id || 'EMP-CSE-101',
        department,
        leaveType,
        startDate,
        endDate,
        daysCount: diffDays,
        reason,
        attachmentUrl,
        substituteFaculty,
      });

      if (res.data.success) {
        setIsApplyModalOpen(false);
        setReason('');
        setActionMsg({
          type: 'success',
          text: `Leave application (${res.data.leaveId}) submitted successfully to Academic Dean & HOD!`,
        });
        fetchLeaves();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (leaveId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this pending leave request?')) return;
    try {
      const res = await axios.post(`${API_BASE}/faculty/leaves/withdraw`, {
        leaveId,
        facultyEmail,
      });
      if (res.data.success) {
        setActionMsg({ type: 'success', text: 'Leave request withdrawn.' });
        fetchLeaves();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <span>Faculty Leave Applications</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Apply for Casual, Duty, or Medical Leaves • Track Approval Status from HOD & Deans
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7c3aed] hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* LEAVE BALANCE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Casual Leave (CL)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">8</span>
            <span className="text-xs text-slate-400">/ 12 days left</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Duty Leave (OD)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">5</span>
            <span className="text-xs text-slate-400">approved YTD</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Medical Leave (ML)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">10</span>
            <span className="text-xs text-slate-400">/ 10 days left</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Earned Leave (EL)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">14</span>
            <span className="text-xs text-slate-400">accumulated</span>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* APPLICATIONS LIST */}
      <div className="bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
            <span>Your Submitted Applications:</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {leaves.length} records
            </span>
          </div>
          <button
            onClick={fetchLeaves}
            className="p-1 rounded-lg text-slate-400 hover:text-purple-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
              <tr>
                <th className="p-3">Leave ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Days</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Substitute</th>
                <th className="p-3">Status</th>
                <th className="p-3">Decision / Remarks</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    No leave applications found. Click "Apply for Leave" above.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.leaveId} className="hover:bg-purple-500/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{l.leaveId}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{l.leaveType}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                      {l.startDate} → {l.endDate}
                    </td>
                    <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">{l.daysCount} d</td>
                    <td className="p-3 max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={l.reason}>
                      {l.reason}
                    </td>
                    <td className="p-3 text-slate-500">{l.substituteFaculty || 'None'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : l.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : l.status === 'Clarification Requested'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {l.approverRemarks ? `${l.approverRemarks} (by ${l.approverName})` : 'Pending Review'}
                    </td>
                    <td className="p-3 text-right">
                      {l.status === 'Pending' ? (
                        <button
                          onClick={() => handleWithdraw(l.leaveId)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-500/10 text-[11px] font-bold transition-colors"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY FOR LEAVE MODAL */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Apply for Faculty Leave</h3>
                </div>
                <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Casual">Casual Leave (CL)</option>
                    <option value="Earned">Earned Leave (EL)</option>
                    <option value="Medical">Medical / Sick Leave (ML)</option>
                    <option value="On Duty (OD)">Duty Leave / On-Duty (OD)</option>
                    <option value="Compensatory">Compensatory Off</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Substitute Faculty / Class Arrangement</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Nitin Kumar (agreed to take 10 AM Agile lecture)"
                    value={substituteFaculty}
                    onChange={(e) => setSubstituteFaculty(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Detailed Reason</label>
                  <textarea
                    rows={3}
                    placeholder="Please specify the reason for leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Supporting Document / Medical Slip URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://nexus-campus.s3.amazonaws.com/leave_doc.pdf"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-[#7c3aed] hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
