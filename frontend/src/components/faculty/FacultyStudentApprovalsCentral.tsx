import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  CreditCard,
  Ticket,
  FileText,
  User,
  GraduationCap,
  X,
  RefreshCw,
  Eye,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import { type UserSession } from '../../types/auth';
import { useRealtimeEvent } from '../../context/RealtimeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FacultyStudentApprovalsCentralProps {
  session?: UserSession | null;
  facultyName?: string;
  facultyEmail?: string;
  department?: string;
  inchargeClass?: string;
}

export const FacultyStudentApprovalsCentral: React.FC<FacultyStudentApprovalsCentralProps> = ({
  session,
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stats State
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalPending: 0,
    inReview: 0,
    awaitingClarification: 0,
    approved: 0,
    rejected: 0,
    categoryCounts: {
      medical: 0,
      cardsAndPasses: 0,
      documents: 0,
    },
  });

  // Approvals List State
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Overview Stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/approvals/overview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (e) {
      console.warn('Approvals stats error:', e);
    }
  };

  // Fetch Approvals Requests List
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/approvals/requests`, {
        params: {
          category: selectedCategory,
          status: selectedStatus,
          search: searchQuery,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      }
    } catch (e) {
      console.warn('Approvals requests error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, [selectedCategory, selectedStatus]);

  // Realtime updates when students submit passes/cards or when approvals change
  useRealtimeEvent('approval.submission_created', (data) => {
    console.log('⚡ [Faculty Approvals] Realtime new request submitted:', data);
    fetchStats();
    fetchRequests();
  });

  useRealtimeEvent('approval.decision_updated', () => {
    fetchStats();
    fetchRequests();
  });

  // Execute Approval Decision
  const handleDecision = async (decision: 'Approved' | 'Rejected' | 'Clarification Requested' | 'In Review') => {
    if (!selectedRequest) return;
    if (decision === 'Rejected' && !decisionReason.trim()) {
      alert('Please provide a mandatory reason for rejecting this student request.');
      return;
    }
    if (decision === 'Clarification Requested' && !decisionReason.trim()) {
      alert('Please provide details regarding what clarification is required from the student.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('nexus_token');
      const res = await axios.post(
        `${API_BASE_URL}/api/faculty/approvals/decision`,
        {
          id: selectedRequest.id,
          requestId: selectedRequest.requestId,
          category: selectedRequest.category,
          decision,
          reason: decisionReason,
          internalNotes,
          facultyName,
          facultyEmail,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.success) {
        setFeedback({ type: 'success', text: `Request "${selectedRequest.requestId}" marked as ${decision}!` });
        setSelectedRequest(null);
        setDecisionReason('');
        setInternalNotes('');
        fetchStats();
        fetchRequests();
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to update request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'All', label: 'All Categories' },
    { id: 'Medical Leave', label: 'Medical Leave Certificates', icon: Stethoscope },
    { id: 'Digital Cards & Passes', label: 'ID Cards & Fest Passes', icon: CreditCard },
    { id: 'Document Verification', label: 'Document Verification', icon: FileCheck },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-900/80 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            NEXUS UNIFIED STUDENT APPROVALS WORKSPACE
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Central Approval & Verification Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Single authoritative inbox for reviewing medical leaves, student digital ID cards, SPANDAN fest entry passes,
            and institutional document verifications without switching between disjointed screens.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchRequests();
          }}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* COUNTERS DASHBOARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div
          onClick={() => setSelectedStatus('All')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'All'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[10px] opacity-80 uppercase tracking-wider block font-bold">Total Inbound</span>
          <span className="font-display font-black text-2xl block">{stats.totalRequests}</span>
          <span className="text-[9px] opacity-75">All categories</span>
        </div>

        <div
          onClick={() => setSelectedStatus('Pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'Pending'
              ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Pending Review</span>
          <span className="font-display font-black text-2xl block text-amber-500 dark:text-amber-400">
            {stats.totalPending}
          </span>
          <span className="text-[9px] opacity-75">Action needed</span>
        </div>

        <div
          onClick={() => setSelectedStatus('In Review')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'In Review'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Under Review</span>
          <span className="font-display font-black text-2xl block text-blue-500 dark:text-blue-400">
            {stats.inReview}
          </span>
          <span className="text-[9px] opacity-75">Faculty inspecting</span>
        </div>

        <div
          onClick={() => setSelectedStatus('Clarification Requested')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'Clarification Requested'
              ? 'bg-cyan-600 text-white border-cyan-500 shadow-md ring-2 ring-cyan-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider block">Clarification</span>
          <span className="font-display font-black text-2xl block text-cyan-500 dark:text-cyan-400">
            {stats.awaitingClarification}
          </span>
          <span className="text-[9px] opacity-75">Awaiting student</span>
        </div>

        <div
          onClick={() => setSelectedStatus('Approved')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'Approved'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block">Approved</span>
          <span className="font-display font-black text-2xl block text-emerald-500 dark:text-emerald-400">
            {stats.approved}
          </span>
          <span className="text-[9px] opacity-75">Granted passes</span>
        </div>

        <div
          onClick={() => setSelectedStatus('Rejected')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'Rejected'
              ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">Rejected</span>
          <span className="font-display font-black text-2xl block text-rose-500 dark:text-rose-400">
            {stats.rejected}
          </span>
          <span className="text-[9px] opacity-75">With feedback</span>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === c.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
            placeholder="Search roll, student, request ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* UNIFIED REQUESTS LIST / TABLE */}
      {requests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <FileCheck className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">All Clear! No Requests Pending</h4>
          <p className="text-xs text-slate-500">
            No student verification requests match the selected category or status criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Request Ref</th>
                  <th className="py-3 px-4">Category & Pass Type</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Class & Dept</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {req.requestId}
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 dark:text-white block">{req.requestType}</strong>
                      <span className="text-[10px] text-slate-400">{req.category}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 dark:text-white block">{req.studentName}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{req.studentRoll}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>{req.className}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{req.department}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {req.submissionDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          req.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : req.status === 'Rejected'
                            ? 'bg-rose-500/15 text-rose-500'
                            : req.status === 'In Review'
                            ? 'bg-blue-500/15 text-blue-500'
                            : req.status === 'Clarification Requested'
                            ? 'bg-cyan-500/15 text-cyan-500'
                            : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                        }}
                        className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-colors shadow-xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUEST REVIEW & DECISION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
                  {selectedRequest.category}
                </span>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white mt-1">
                  {selectedRequest.requestType} ({selectedRequest.requestId})
                </h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Class Snapshot */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Student Name:</span>
                <strong className="text-slate-900 dark:text-white">{selectedRequest.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Roll Number:</span>
                <span className="font-mono text-purple-400 font-bold">{selectedRequest.studentRoll}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Class & Section:</span>
                <span>{selectedRequest.className}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Department:</span>
                <span>{selectedRequest.department}</span>
              </div>
            </div>

            {/* Category-Specific Details */}
            {selectedRequest.category === 'Medical Leave' && selectedRequest.details && (
              <div className="space-y-2 p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Medical Diagnosis:</span>
                  <strong className="text-rose-600 dark:text-rose-400">{selectedRequest.details.illness}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hospital / Doctor:</span>
                  <span>
                    {selectedRequest.details.doctorName} ({selectedRequest.details.hospitalName})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Leave Duration:</span>
                  <span className="font-mono font-bold">
                    {selectedRequest.details.startDate} to {selectedRequest.details.endDate} ({selectedRequest.details.totalDays} Days)
                  </span>
                </div>
                {selectedRequest.details.prescriptionDocUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedRequest.details.prescriptionDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Doctor Prescription Document
                    </a>
                  </div>
                )}
              </div>
            )}

            {selectedRequest.category === 'Digital Cards & Passes' && selectedRequest.details && (
              <div className="space-y-2 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Event / Pass Reference:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {selectedRequest.details.eventName || 'Annual Pass Clearance'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Validity:</span>
                  <span>{selectedRequest.details.duration || 'Annual Academic Session'}</span>
                </div>
              </div>
            )}

            {selectedRequest.category === 'Document Verification' && selectedRequest.details && (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Title:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedRequest.details.documentTitle}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Info:</span>
                  <span>
                    {selectedRequest.details.filename} ({selectedRequest.details.fileSize})
                  </span>
                </div>
                {selectedRequest.details.fileDataUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedRequest.details.fileDataUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Uploaded Verification File
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Decision Notes & Remarks Form */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Verification Remarks / Reason (Sent to Student)
              </label>
              <textarea
                rows={2}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Required if rejecting or requesting clarification..."
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              />

              <label className="block text-slate-700 dark:text-slate-300 font-bold pt-1">
                Internal Approver Notes (Confidential)
              </label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Notes for faculty records / audit log..."
                className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Clarification Requested')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
                >
                  Need Clarification
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Rejected')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
                >
                  Reject Request
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('Approved')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
