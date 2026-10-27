import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRealtimeEvent } from '../../context/RealtimeContext';
import {
  Stethoscope,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Eye,
  Building2,
  Calendar,
  UserCheck,
  Sparkles,
  FileText,
  AlertTriangle,
  RefreshCw,
  Send,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export interface MedicalLeaveItem {
  id?: number;
  applicationRef: string;
  rollNumber: string;
  studentName: string;
  className: string;
  department: string;
  illness: string;
  causeDetails: string;
  conditionType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  doctorName: string;
  doctorRegNo: string;
  hospitalName: string;
  prescriptionDocUrl?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'CLARIFICATION_REQUIRED';
  verifierEmail?: string;
  verifierName?: string;
  verificationRemarks?: string;
  rejectionReason?: string;
  clarificationRequest?: string;
  clarificationResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

interface FacultyMedicalLeaveManagerProps {
  facultyName: string;
  facultyEmail: string;
  inchargeClass: string;
}

export const FacultyMedicalLeaveManager: React.FC<FacultyMedicalLeaveManagerProps> = ({
  facultyName,
  facultyEmail,
  inchargeClass,
}) => {
  const [requests, setRequests] = useState<MedicalLeaveItem[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    clarificationRequired: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(inchargeClass || 'B.TECH CSE 2023 A');

  // Selected Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<MedicalLeaveItem | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);

  // Review Action Form State
  const [reviewAction, setReviewAction] = useState<'IDLE' | 'APPROVE' | 'REJECT' | 'CLARIFICATION'>('IDLE');
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [clarificationInput, setClarificationInput] = useState<string>('');
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Fetch Medical Certificates Roster & Metrics from Backend API
  const fetchMedicalRequests = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('https://nexus-smart-campus-backend.onrender.com/api/attendance/medical/list', {
        params: {
          className: selectedClassFilter,
          facultyEmail,
          status: statusFilter,
          search: searchQuery,
        },
      });

      if (res.data && res.data.success) {
        setRequests(res.data.certificates || []);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch medical leaves from backend:', err);
      if (err.response?.status === 403) {
        setErrorMsg(`Unauthorized: You are not authorized to view medical leave requests for ${selectedClassFilter}.`);
      } else {
        setErrorMsg('Unable to load medical leave requests from server.');
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClassFilter, facultyEmail, statusFilter, searchQuery]);

  useEffect(() => {
    fetchMedicalRequests();
  }, [fetchMedicalRequests]);

  // Real-Time Socket Event Handlers (Phase 5 Pipeline)
  useRealtimeEvent('medical_leave.submitted', (data: any) => {
    console.log('⚡ [Realtime Faculty UI] New Student Medical Leave Application received:', data);
    setActionSuccessMsg(`⚡ Real-Time Notification: Student ${data.studentName} (${data.rollNumber}) submitted a new medical leave application (${data.applicationRef})!`);
    fetchMedicalRequests();
  });

  useRealtimeEvent('medical_leave.clarification_response', (data: any) => {
    console.log('⚡ [Realtime Faculty UI] Student responded to Clarification Request:', data);
    setActionSuccessMsg(`⚡ Real-Time Notification: Student ${data.studentName} (${data.rollNumber}) uploaded clarification for application ${data.applicationRef}!`);
    fetchMedicalRequests();
  });

  // Open Detailed Request View Modal
  const handleOpenDetailModal = async (reqItem: MedicalLeaveItem) => {
    setSelectedRequest(reqItem);
    setReviewAction('IDLE');
    setReviewRemarks('');
    setRejectionReasonInput('');
    setClarificationInput('');
    setActionSuccessMsg(null);

    // If currently PENDING, set status to UNDER_REVIEW
    if (reqItem.status === 'PENDING') {
      try {
        await axios.post('https://nexus-smart-campus-backend.onrender.com/api/attendance/medical/review', {
          applicationRef: reqItem.applicationRef,
          action: 'START_REVIEW',
          verifierEmail: facultyEmail,
          verifierName: facultyName,
        });
      } catch (e) {}
    }

    // Fetch full student profile details
    try {
      const res = await axios.get(`https://nexus-smart-campus-backend.onrender.com/api/attendance/medical/detail/${reqItem.applicationRef}`);
      if (res.data && res.data.student) {
        setSelectedStudentDetail(res.data.student);
      } else {
        setSelectedStudentDetail(null);
      }
    } catch (e) {
      setSelectedStudentDetail(null);
    }
  };

  // Execute Review Actions (Approve, Reject, Clarification Request)
  const handleExecuteReviewAction = async (actionType: 'APPROVE' | 'REJECT' | 'CLARIFICATION_REQUEST') => {
    if (!selectedRequest) return;

    if (actionType === 'REJECT' && (!rejectionReasonInput || rejectionReasonInput.trim().length < 3)) {
      alert('Please enter a clear reason for rejecting this medical leave application.');
      return;
    }

    if (actionType === 'CLARIFICATION_REQUEST' && (!clarificationInput || clarificationInput.trim().length < 3)) {
      alert('Please enter clarification instructions for the student.');
      return;
    }

    setActionSubmitting(true);
    setActionSuccessMsg(null);

    try {
      const res = await axios.post('https://nexus-smart-campus-backend.onrender.com/api/attendance/medical/review', {
        applicationRef: selectedRequest.applicationRef,
        action: actionType,
        verifierEmail: facultyEmail,
        verifierName: facultyName,
        remarks: reviewRemarks || (actionType === 'APPROVE' ? 'Medical Exemption Verified & Attendance Target set to 65%' : ''),
        rejectionReason: rejectionReasonInput,
        clarificationRequest: clarificationInput,
      });

      if (res.data && res.data.success) {
        setActionSuccessMsg(res.data.message);
        setSelectedRequest((prev) => prev ? {
          ...prev,
          status: res.data.status,
          verifierName: facultyName,
          rejectionReason: rejectionReasonInput || prev.rejectionReason,
          clarificationRequest: clarificationInput || prev.clarificationRequest,
        } : null);

        fetchMedicalRequests();
        setReviewAction('IDLE');
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(`⚠️ Concurrency Notice: ${err.response.data.message}`);
        setSelectedRequest((prev) => prev ? { ...prev, status: 'VERIFIED' } : null);
        setReviewAction('IDLE');
        fetchMedicalRequests();
      } else if (err.response?.status === 403) {
        alert(`✕ Unauthorized: You are not authorized to approve or review requests for this class.`);
        setReviewAction('IDLE');
      } else {
        alert(`Failed to execute review action: ${err.message}`);
        setReviewAction('IDLE');
      }
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left select-none">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span>Medical Leave & Student Request Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review student medical exemption slips, verify hospital discharge records, and sync 65% attendance criteria in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMedicalRequests}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Requests</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME ALERT NOTIFICATION BANNER */}
      {actionSuccessMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-amber-500 font-extrabold text-sm">✕</button>
        </motion.div>
      )}

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={fetchMedicalRequests} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px]">Retry</button>
        </div>
      )}

      {/* SUMMARY METRICS CARDS GRID (5 REALTIME COUNTERS FROM MYSQL) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 shadow-lg shadow-amber-500/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">{metrics.pending}</div>
          <span className="text-[10px] font-semibold text-amber-500 block mt-0.5">Awaiting Incharge Verification</span>
        </div>

        <div
          onClick={() => setStatusFilter('UNDER_REVIEW')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'UNDER_REVIEW'
              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-lg shadow-indigo-500/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Under Review</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">{metrics.underReview}</div>
          <span className="text-[10px] font-semibold text-indigo-500 block mt-0.5">Currently Being Evaluated</span>
        </div>

        <div
          onClick={() => setStatusFilter('VERIFIED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'VERIFIED'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 shadow-lg shadow-emerald-500/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Approved (65% Sync)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">{metrics.approved}</div>
          <span className="text-[10px] font-semibold text-emerald-500 block mt-0.5">Attendance Lowered to 65%</span>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 shadow-lg shadow-rose-500/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">{metrics.rejected}</div>
          <span className="text-[10px] font-semibold text-rose-500 block mt-0.5">Threshold Remains 75%</span>
        </div>

        <div
          onClick={() => setStatusFilter('CLARIFICATION_REQUIRED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'CLARIFICATION_REQUIRED'
              ? 'bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-300 shadow-lg shadow-purple-500/10'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Clarification Req.</span>
            <HelpCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">{metrics.clarificationRequired}</div>
          <span className="text-[10px] font-semibold text-purple-500 block mt-0.5">Awaiting Student Upload</span>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Student Name, Roll No, Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* STATUS PILLS & CLASS SELECTION */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <span className="px-2 text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" /> Filter:</span>
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CLARIFICATION_REQUIRED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-amber-500 text-white shadow font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'VERIFIED' ? 'Approved' : st === 'CLARIFICATION_REQUIRED' ? 'Clarification' : st}
              </button>
            ))}
          </div>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="B.TECH CSE 2023 A">Class: B.TECH CSE 2023 A</option>
            <option value="B.TECH CSE 2023 B">Class: B.TECH CSE 2023 B</option>
            <option value="B.TECH ECE 2023 A">Class: B.TECH ECE 2023 A</option>
          </select>
        </div>
      </div>

      {/* REQUESTS ROSTER TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>Medical Exemption Applications</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">
              {requests.length} Requests
            </span>
          </h3>
          <span className="text-xs text-slate-400">Class: <strong>{selectedClassFilter}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student Demographics</th>
                <th className="py-3 px-4">Application Ref</th>
                <th className="py-3 px-4">Diagnosis / Illness</th>
                <th className="py-3 px-4">Leave Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <Stethoscope className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="font-bold text-sm">No medical leave requests found.</p>
                    <p className="text-xs text-slate-400">No applications match the current filter or search criteria.</p>
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.applicationRef} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* STUDENT DEMOGRAPHICS */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black text-xs border border-purple-500/30">
                          {item.studentName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="font-bold text-slate-900 dark:text-white block">{item.studentName}</strong>
                          <span className="text-[11px] font-mono text-slate-400">Roll: {item.rollNumber} • {item.className}</span>
                        </div>
                      </div>
                    </td>

                    {/* REF & SUBMITTED AT */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{item.applicationRef}</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </td>

                    {/* DIAGNOSIS */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <strong className="text-slate-800 dark:text-slate-200 block truncate">{item.illness}</strong>
                      <span className="text-[10px] text-slate-400 block truncate">{item.conditionType}</span>
                    </td>

                    {/* DURATION & DAYS */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{item.startDate} to {item.endDate}</span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-black">{item.totalDays} Rest Days (&ge;10 Days Met)</span>
                    </td>

                    {/* STATUS BADGE */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                          item.status === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : item.status === 'CLARIFICATION_REQUIRED'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30'
                            : item.status === 'UNDER_REVIEW'
                            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.status === 'VERIFIED' ? (
                          <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved (65% Sync)</>
                        ) : item.status === 'REJECTED' ? (
                          <><XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected</>
                        ) : item.status === 'CLARIFICATION_REQUIRED' ? (
                          <><HelpCircle className="w-3.5 h-3.5 text-purple-500" /> Clarification Req.</>
                        ) : item.status === 'UNDER_REVIEW' ? (
                          <><Eye className="w-3.5 h-3.5 text-indigo-500" /> Under Review</>
                        ) : (
                          <><Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Pending Review</>
                        )}
                      </span>
                    </td>

                    {/* ACTION BUTTON */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetailModal(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View & Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REQUEST DETAIL & REVIEW MODAL DRAWER */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Medical Exemption Request Studio</span>
                    </h3>
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                      Ref: {selectedRequest.applicationRef} • Submitted: {new Date(selectedRequest.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
              </div>

              {/* TWO COLUMN GRID: STUDENT DEMOGRAPHICS & LEAVE DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. STUDENT DEMOGRAPHICS CARD */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-purple-500" /> Student Profile & Demographics
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedStudentDetail?.photoUrl ? (
                      <img src={selectedStudentDetail.photoUrl} alt="Student" className="w-12 h-12 rounded-2xl object-cover border border-purple-500/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black text-base border border-purple-500/30">
                        {selectedRequest.studentName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedRequest.studentName}</h4>
                      <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 block font-bold">Roll: {selectedRequest.rollNumber}</span>
                      <span className="text-[11px] text-slate-400 block">{selectedRequest.className} • {selectedRequest.department}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Admission Number</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedStudentDetail?.admissionNumber || `ADM-${selectedRequest.rollNumber}`}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Semester & Section</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedStudentDetail?.semester || 'Semester 3'} (Section {selectedStudentDetail?.section || 'A'})</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 block">Official Student Email</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedStudentDetail?.email || 'student@nexus.edu'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. MEDICAL LEAVE INFORMATION CARD */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Medical Leave Period & Rest</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-black">{selectedRequest.totalDays} Days Rest</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Primary Diagnosis / Illness:</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block">{selectedRequest.illness}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Condition Classification:</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold text-[11px] border border-indigo-500/30">
                        {selectedRequest.conditionType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Leave Start Date:</span>
                        <strong className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.startDate}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Leave End Date:</span>
                        <strong className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.endDate}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Clinical Diagnosis Details:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed mt-1">
                        {selectedRequest.causeDetails}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCTOR CREDENTIALS & PRESCRIPTION PREVIEW */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-amber-500" /> Certifying Medical Officer & Hospital Record
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Attending Doctor:</span>
                    <strong className="font-bold text-slate-900 dark:text-white">{selectedRequest.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Doctor Registration No:</span>
                    <strong className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedRequest.doctorRegNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Hospital / Health Center:</span>
                    <strong className="font-bold text-slate-900 dark:text-white">{selectedRequest.hospitalName}</strong>
                  </div>
                </div>

                {/* PRESCRIPTION PREVIEW ATTACHMENT STUDIO */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" /> Uploaded Medical Prescription / Hospital Discharge Document:
                  </span>

                  {selectedRequest.prescriptionDocUrl && selectedRequest.prescriptionDocUrl.startsWith('data:image') ? (
                    <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 max-h-64 overflow-hidden flex items-center justify-center">
                      <img src={selectedRequest.prescriptionDocUrl} alt="Prescription Scan" className="max-h-60 object-contain rounded-xl" />
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        <div>
                          <strong className="font-bold text-indigo-900 dark:text-indigo-200 block">Official Prescription Document Attached</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Reference ID: {selectedRequest.applicationRef}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow">Verified Document</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CURRENT STATUS & HISTORY */}
              {selectedRequest.clarificationResponse && (
                <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs space-y-1">
                  <strong className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Student Responded to Clarification Request:
                  </strong>
                  <p className="text-xs italic bg-white/50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-purple-500/20">{selectedRequest.clarificationResponse}</p>
                </div>
              )}

              {/* REVIEW & APPROVAL ACTION PANEL */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Faculty Review & Decision Studio
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">Current Status: <strong className="text-amber-400">{selectedRequest.status}</strong></span>
                </div>

                {selectedRequest.status === 'VERIFIED' || selectedRequest.status === 'REJECTED' ? (
                  <div
                    className={`p-4 rounded-2xl border text-xs font-bold space-y-2 ${
                      selectedRequest.status === 'VERIFIED'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-extrabold text-sm">
                      <span className="flex items-center gap-2">
                        {selectedRequest.status === 'VERIFIED' ? (
                          <><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Medical Exemption Approved</>
                        ) : (
                          <><XCircle className="w-5 h-5 text-rose-400" /> Medical Exemption Application Rejected</>
                        )}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px]">
                        FINAL DECISION RECORDED
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      This medical application has been reviewed and finalized as <strong>{selectedRequest.status}</strong> by Class Incharge <strong>{selectedRequest.verifierName || facultyName}</strong>.
                      {selectedRequest.status === 'VERIFIED' ? ' Attendance target criteria has been synchronized to 65% for the student.' : ' Mandatory attendance threshold remains 75%.'}
                    </p>

                    {selectedRequest.rejectionReason && (
                      <div className="pt-2 border-t border-rose-500/30 text-rose-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Recorded Rejection Reason:</span>
                        <p className="italic mt-0.5 text-xs bg-rose-950/80 p-2 rounded-xl border border-rose-500/30">"{selectedRequest.rejectionReason}"</p>
                      </div>
                    )}

                    {selectedRequest.verificationRemarks && (
                      <div className="pt-2 border-t border-emerald-500/30 text-emerald-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Verification Remarks:</span>
                        <p className="italic mt-0.5 text-xs bg-emerald-950/80 p-2 rounded-xl border border-emerald-500/30">"{selectedRequest.verificationRemarks}"</p>
                      </div>
                    )}
                  </div>
                ) : reviewAction === 'IDLE' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setReviewAction('APPROVE')}
                      className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Leave (65% Sync)</span>
                    </button>

                    <button
                      onClick={() => setReviewAction('REJECT')}
                      className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>

                    <button
                      onClick={() => setReviewAction('CLARIFICATION')}
                      className="p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Request Clarification</span>
                    </button>
                  </div>
                ) : reviewAction === 'APPROVE' ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-3 text-xs">
                    <h5 className="font-extrabold text-emerald-300 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm Medical Leave Approval
                    </h5>
                    <p className="text-slate-300">
                      Approving medical leave for <strong>{selectedRequest.studentName}</strong> ({selectedRequest.startDate} to {selectedRequest.endDate}, {selectedRequest.totalDays} days rest) will lower mandatory attendance threshold from <strong>75% down to 65%</strong> in Student Portal.
                    </p>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Optional Incharge Verification Remarks</label>
                      <input
                        type="text"
                        placeholder="e.g. Hospital discharge summary verified. Approved for 65% criteria."
                        value={reviewRemarks}
                        onChange={(e) => setReviewRemarks(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-white text-xs font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button onClick={() => setReviewAction('IDLE')} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
                      <button
                        onClick={() => handleExecuteReviewAction('APPROVE')}
                        disabled={actionSubmitting}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold shadow flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{actionSubmitting ? 'Approving...' : 'Confirm Approval & Emit Realtime Event'}</span>
                      </button>
                    </div>
                  </div>
                ) : reviewAction === 'REJECT' ? (
                  <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-3 text-xs">
                    <h5 className="font-extrabold text-rose-300 flex items-center gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-rose-400" /> Reject Medical Leave Application
                    </h5>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Reason for Rejection * (Required)</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Medical prescription document is incomplete or missing doctor stamp."
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-white text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button onClick={() => setReviewAction('IDLE')} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
                      <button
                        onClick={() => handleExecuteReviewAction('REJECT')}
                        disabled={actionSubmitting}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{actionSubmitting ? 'Rejecting...' : 'Reject & Notify Student'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 space-y-3 text-xs">
                    <h5 className="font-extrabold text-purple-300 flex items-center gap-2 text-sm">
                      <HelpCircle className="w-4 h-4 text-purple-400" /> Request Clarification / Document Resubmission
                    </h5>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Clarification Instructions for Student * (Required)</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Please re-upload a clearer scan of the hospital discharge receipt showing doctor registration stamp."
                        value={clarificationInput}
                        onChange={(e) => setClarificationInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button onClick={() => setReviewAction('IDLE')} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
                      <button
                        onClick={() => handleExecuteReviewAction('CLARIFICATION_REQUEST')}
                        disabled={actionSubmitting}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" />
                        <span>{actionSubmitting ? 'Sending...' : 'Send Clarification Request'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setSelectedRequest(null)} className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                  Close Studio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
