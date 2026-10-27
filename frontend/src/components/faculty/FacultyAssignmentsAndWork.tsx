import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRealtimeEvent } from '../../context/RealtimeContext';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  FileCheck,
  Search,
  ExternalLink,
  BookOpen,
  Users,
  ShieldCheck,
  Send,
  X,
  FileUp,
} from 'lucide-react';

interface FacultyAssignmentsAndWorkProps {
  facultyName?: string;
  facultyEmail?: string;
  inchargeClass?: string;
}

export const FacultyAssignmentsAndWork: React.FC<FacultyAssignmentsAndWorkProps> = ({
  facultyName = 'Dr. S. M. Bhatnagar',
  facultyEmail = 'dr_smb_incharge@nexus.edu',
  inchargeClass = 'B.TECH CSE 2023 A',
}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalAssignments: 0,
    publishedCount: 0,
    pastDeadlineCount: 0,
    totalSubmissions: 0,
    pendingEvaluation: 0,
    gradedCount: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<any | null>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<string>('ALL');
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);

  // Grade Evaluator Modal State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<any | null>(null);
  const [scoredMarksInput, setScoredMarksInput] = useState<string>('');
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState<boolean>(false);

  // New Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Blockchain Technologies');
  const [newSubjectCode, setNewSubjectCode] = useState('CS-501');
  const [newClass, setNewClass] = useState(inchargeClass || 'B.TECH CSE 2023 A');
  const [newType, setNewType] = useState('Subjective');
  const [newTotalMarks, setNewTotalMarks] = useState('50');
  const [newDeadlineDate, setNewDeadlineDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [newDeadlineTime, setNewDeadlineTime] = useState('11:59 PM');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // 1. Fetch Assignments and Stats
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const clsQuery = selectedClassFilter !== 'ALL' ? selectedClassFilter : '';
      const [asgnRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/faculty/assignments?email=${encodeURIComponent(facultyEmail)}&className=${encodeURIComponent(clsQuery)}`),
        axios.get(`http://localhost:5000/api/faculty/assignments/stats?email=${encodeURIComponent(facultyEmail)}&className=${encodeURIComponent(clsQuery)}`),
      ]);

      if (asgnRes.data && asgnRes.data.success) {
        const raw = asgnRes.data.assignments || [];
        const formatted = raw.map((a: any) => ({
          id: a.id,
          assignmentId: a.assignmentId || a.assignment_id || `asgn_${a.id}`,
          title: a.title || a.topic_name || 'Assignment Title',
          subject: a.subject || a.subject_name || 'Computer Science',
          subjectCode: a.subjectCode || a.subject_code || 'CS-501',
          className: a.className || a.class_name || 'B.TECH CSE 2023 A',
          description: a.description || '',
          assignmentType: a.assignmentType || a.assignment_type || 'Subjective',
          totalMarks: a.totalMarks || a.total_marks || 50,
          deadlineDate: a.deadlineDate || (a.deadline_date ? String(a.deadline_date).substring(0, 10) : '2026-09-30'),
          deadlineTime: a.deadlineTime || a.deadline_time || '11:59 PM',
          facultyEmail: a.facultyEmail || a.faculty_email || facultyEmail,
          facultyName: a.facultyName || a.faculty_name || facultyName,
          attachmentUrl: a.attachmentUrl || a.attachment_url || '',
          status: a.status || 'Published',
          totalSubmissions: a.totalSubmissions !== undefined ? a.totalSubmissions : (a.total_submissions || 0),
          gradedCount: a.gradedCount !== undefined ? a.gradedCount : (a.graded_count || 0),
          pendingEvaluation: a.pendingEvaluation !== undefined ? a.pendingEvaluation : (a.pending_evaluation || 0),
        }));
        setAssignments(formatted);
      }
      if (statsRes.data && statsRes.data.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [facultyEmail, selectedClassFilter, facultyName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime Socket Event Subscriptions for Faculty Portal
  useRealtimeEvent('assignment.submission.created', (data) => {
    console.log('⚡ [Realtime Faculty UI] New student assignment submission received!', data);
    fetchData();
    if (selectedAssignmentForSubmissions) {
      fetchSubmissions(selectedAssignmentForSubmissions, submissionFilter);
    }
  });

  // 2. Fetch Submissions for an Assignment
  const fetchSubmissions = useCallback(async (asgn: any, filter: string = 'ALL') => {
    if (!asgn) return;
    setLoadingSubmissions(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/faculty/submissions?assignmentId=${asgn.assignmentId}&className=${encodeURIComponent(asgn.className)}&status=${filter}`
      );
      if (res.data && res.data.success) {
        setSubmissionsList(res.data.submissions || []);
      }
    } catch (err) {
      setSubmissionsList([]);
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  const openSubmissionsModal = (asgn: any) => {
    setSelectedAssignmentForSubmissions(asgn);
    setSubmissionFilter('ALL');
    fetchSubmissions(asgn, 'ALL');
  };

  // 3. Create & Publish Assignment Action
  const handlePublishAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSubject || !newClass || !newDeadlineDate) {
      alert('Please fill out all required fields (Title, Subject, Class, Deadline Date).');
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        title: newTitle,
        topic_name: newTitle,
        topicName: newTitle,
        subject: newSubject,
        subject_name: newSubject,
        subjectName: newSubject,
        subjectCode: newSubjectCode,
        className: newClass,
        assignmentType: newType,
        totalMarks: Number(newTotalMarks) || 50,
        deadlineDate: newDeadlineDate,
        deadlineTime: newDeadlineTime,
        facultyEmail,
        facultyName,
        attachmentUrl: newAttachmentUrl,
        description: newDescription,
      };

      const res = await axios.post('http://localhost:5000/api/faculty/assignments/create', payload);
      if (res.data && res.data.success) {
        alert(res.data.message || '✓ Assignment created and published!');
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewAttachmentUrl('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setIsPublishing(false);
    }
  };

  // 4. Submit Evaluation Action with Marks Validation
  const handleSaveEvaluation = async () => {
    if (!evaluatingSubmission || scoredMarksInput === '') {
      alert('Please enter scored marks.');
      return;
    }

    const marksNum = Number(scoredMarksInput);
    const maxMarks = selectedAssignmentForSubmissions?.totalMarks || 50;

    if (isNaN(marksNum) || marksNum < 0 || marksNum > maxMarks) {
      alert(`Invalid Marks: Scored marks must be a number between 0 and maximum total marks (${maxMarks}).`);
      return;
    }

    setSubmittingGrade(true);
    try {
      const res = await axios.put('http://localhost:5000/api/faculty/submissions/grade', {
        submissionId: evaluatingSubmission.submission_id || evaluatingSubmission.submissionId,
        scoredMarks: marksNum,
        facultyRemarks: remarksInput,
      });

      if (res.data && res.data.success) {
        alert(res.data.message || '✓ Evaluation saved successfully!');
        setEvaluatingSubmission(null);
        setScoredMarksInput('');
        setRemarksInput('');
        fetchSubmissions(selectedAssignmentForSubmissions, submissionFilter);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to grade submission.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Edit Assignment Form State
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editType, setEditType] = useState('Subjective');
  const [editTotalMarks, setEditTotalMarks] = useState('50');
  const [editDeadlineDate, setEditDeadlineDate] = useState('');
  const [editDeadlineTime, setEditDeadlineTime] = useState('11:59 PM');
  const [editAttachmentUrl, setEditAttachmentUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openEditModal = (a: any) => {
    setEditingAssignment(a);
    setEditTitle(a.title || '');
    setEditSubject(a.subject || '');
    setEditSubjectCode(a.subjectCode || 'CS-501');
    setEditClass(a.className || 'B.TECH CSE 2023 A');
    setEditType(a.assignmentType || 'Subjective');
    setEditTotalMarks(String(a.totalMarks || 50));
    setEditDeadlineDate(a.deadlineDate || '');
    setEditDeadlineTime(a.deadlineTime || '11:59 PM');
    setEditAttachmentUrl(a.attachmentUrl || '');
    setEditDescription(a.description || '');
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    setIsUpdating(true);
    try {
      const payload = {
        title: editTitle,
        subject: editSubject,
        subjectCode: editSubjectCode,
        className: editClass,
        assignmentType: editType,
        totalMarks: Number(editTotalMarks) || 50,
        deadlineDate: editDeadlineDate,
        deadlineTime: editDeadlineTime,
        attachmentUrl: editAttachmentUrl,
        description: editDescription,
      };

      const res = await axios.put(`http://localhost:5000/api/faculty/assignments/${editingAssignment.assignmentId}`, payload);
      if (res.data && res.data.success) {
        alert(res.data.message || '✓ Assignment updated successfully!');
        setEditingAssignment(null);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update assignment.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAssignment = async (a: any) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${a.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await axios.delete(`http://localhost:5000/api/faculty/assignments/${a.assignmentId}`);
      if (res.data && res.data.success) {
        alert(res.data.message || '✓ Assignment deleted!');
        fetchData();
      }
    } catch (err: any) {
      alert('Failed to delete assignment.');
    }
  };

  const filteredAssignments = (assignments || []).filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      (a.title && String(a.title).toLowerCase().includes(q)) ||
      (a.subject && String(a.subject).toLowerCase().includes(q)) ||
      (a.className && String(a.className).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span>ASSIGNMENTS, SUBMISSIONS & GRADING</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publish, Edit, Delete Class Coursework & Evaluate Student Submissions in Real-Time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-left">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Published</span>
          <strong className="font-display font-black text-xl text-slate-900 dark:text-white">{stats.totalAssignments}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-500" /> Active Coursework
          </span>
          <strong className="font-display font-black text-xl text-purple-600 dark:text-purple-400">{stats.publishedCount}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 block uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> Past Deadline
          </span>
          <strong className="font-display font-black text-xl text-amber-600 dark:text-amber-300">{stats.pastDeadlineCount}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300 block uppercase">Submissions</span>
          <strong className="font-display font-black text-xl text-cyan-600 dark:text-cyan-300">{stats.totalSubmissions}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-500" /> Pending Eval
          </span>
          <strong className="font-display font-black text-xl text-rose-600 dark:text-rose-400">{stats.pendingEvaluation}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-500" /> Graded & Saved
          </span>
          <strong className="font-display font-black text-xl text-emerald-600 dark:text-emerald-400">{stats.gradedCount}</strong>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Class Filter:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="ALL">All Classes</option>
            <option value="B.TECH CSE 2023 A">B.TECH CSE 2023 A</option>
            <option value="BTECH CSE 4B">BTECH CSE 4B</option>
            <option value="BCA 3B">BCA 3B</option>
          </select>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Title / Subject / Class..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* ASSIGNMENTS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-mono font-bold">
            Loading published assignments from MySQL...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-mono font-bold">
            No published assignments found matching selected criteria.
          </div>
        ) : (
          filteredAssignments.map((a) => (
            <div
              key={a.assignmentId}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-4 text-left hover:border-purple-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                    {a.className}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(a)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                      title="Edit Assignment"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(a)}
                      className="px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold"
                      title="Delete Assignment"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3 className="font-display font-black text-base text-slate-900 dark:text-white leading-snug">
                  {a.title}
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-300 font-extrabold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{a.subject} ({a.subjectCode})</span>
                </p>

                {a.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {a.description}
                  </p>
                )}
              </div>

              {/* STATS & ACTIONS FOOTER */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Due: {a.deadlineDate}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Submissions: {a.totalSubmissions}
                  </span>
                </div>

                <button
                  onClick={() => openSubmissionsModal(a)}
                  className="w-full py-2.5 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center justify-center gap-2 transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Manage Submissions & Evaluate</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT ASSIGNMENT MODAL */}
      <AnimatePresence>
        {editingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingAssignment(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Edit Assignment</span>
                </h3>
                <button onClick={() => setEditingAssignment(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleUpdateAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Target Class *</label>
                    <select
                      value={editClass}
                      onChange={(e) => setEditClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="B.TECH CSE 2023 A">B.TECH CSE 2023 A</option>
                      <option value="BTECH CSE 4B">BTECH CSE 4B</option>
                      <option value="BCA 3B">BCA 3B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Subject Code</label>
                    <input
                      type="text"
                      value={editSubjectCode}
                      onChange={(e) => setEditSubjectCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Total Marks *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editTotalMarks}
                      onChange={(e) => setEditTotalMarks(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Deadline Date *</label>
                    <input
                      type="date"
                      required
                      value={editDeadlineDate}
                      onChange={(e) => setEditDeadlineDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingAssignment(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                  >
                    {isUpdating ? 'Saving...' : 'Update Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE & PUBLISH ASSIGNMENT MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-500" />
                  <span>Create & Publish Assignment</span>
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handlePublishAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Smart Contract Architecture & Verification"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Target Class *</label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="B.TECH CSE 2023 A">B.TECH CSE 2023 A</option>
                      <option value="BTECH CSE 4B">BTECH CSE 4B</option>
                      <option value="BCA 3B">BCA 3B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Taught Subject *</label>
                    <input
                      type="text"
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Subject Code</label>
                    <input
                      type="text"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Total Marks *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newTotalMarks}
                      onChange={(e) => setNewTotalMarks(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Deadline Date *</label>
                    <input
                      type="date"
                      required
                      value={newDeadlineDate}
                      onChange={(e) => setNewDeadlineDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Attachment File URL (Optional)</label>
                  <input
                    type="url"
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or document link"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Assignment Problem Statement / Guidelines</label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Enter instructions, questions, or submission rules..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish to Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBMISSION MANAGEMENT & EVALUATION DRAWER */}
      <AnimatePresence>
        {selectedAssignmentForSubmissions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAssignmentForSubmissions(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div>
                  <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {selectedAssignmentForSubmissions.className} • Max: {selectedAssignmentForSubmissions.totalMarks} Marks
                  </span>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                    {selectedAssignmentForSubmissions.title}
                  </h3>
                </div>
                <button onClick={() => setSelectedAssignmentForSubmissions(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
              </div>

              {/* FILTER TABS */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 shrink-0">
                {['ALL', 'SUBMITTED', 'NOT_SUBMITTED', 'GRADED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setSubmissionFilter(f);
                      fetchSubmissions(selectedAssignmentForSubmissions, f);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                      submissionFilter === f
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* SUBMISSIONS TABLE */}
              <div className="overflow-y-auto flex-1 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] bg-slate-100 dark:bg-slate-950 sticky top-0">
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Submitted Date</th>
                      <th className="p-3">File / Link</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Scored Marks</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {loadingSubmissions ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-mono font-bold">
                          Loading submissions from MySQL...
                        </td>
                      </tr>
                    ) : submissionsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-mono font-bold">
                          No submissions found for selected filter.
                        </td>
                      </tr>
                    ) : (
                      submissionsList.map((sub) => (
                        <tr key={sub.submission_id || sub.roll_number} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {sub.roll_number}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{sub.student_name}</td>
                          <td className="p-3 font-mono text-slate-500">{sub.submitted_date || 'N/A'}</td>
                          <td className="p-3">
                            {sub.uploaded_file_url ? (
                              <a
                                href={sub.uploaded_file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 dark:text-purple-400 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <span>Attachment</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400">No Attachment</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                sub.status === 'Graded'
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : sub.status === 'Submitted'
                                  ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-300">
                            {sub.scored_marks !== null && sub.scored_marks !== undefined
                              ? `${sub.scored_marks} / ${selectedAssignmentForSubmissions.totalMarks}`
                              : 'Pending'}
                          </td>
                          <td className="p-3 text-right">
                            {sub.status !== 'Not Submitted' && (
                              <button
                                onClick={() => {
                                  setEvaluatingSubmission(sub);
                                  setScoredMarksInput(sub.scored_marks !== null ? String(sub.scored_marks) : '');
                                  setRemarksInput(sub.faculty_remarks || '');
                                }}
                                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-sm"
                              >
                                Evaluate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GRADE EVALUATOR MODAL */}
      <AnimatePresence>
        {evaluatingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEvaluatingSubmission(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span>Evaluate Submission</span>
                </h4>
                <button onClick={() => setEvaluatingSubmission(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">{evaluatingSubmission.student_name} ({evaluatingSubmission.roll_number})</span>
                  <span className="text-slate-500 block">Assignment: {selectedAssignmentForSubmissions?.title}</span>
                  <span className="text-purple-600 dark:text-purple-300 font-mono block">Max Allowable Marks: {selectedAssignmentForSubmissions?.totalMarks}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Scored Marks (0 to {selectedAssignmentForSubmissions?.totalMarks}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedAssignmentForSubmissions?.totalMarks || 50}
                    value={scoredMarksInput}
                    onChange={(e) => setScoredMarksInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Faculty Assessment Remarks</label>
                  <textarea
                    rows={3}
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                    placeholder="Enter feedback for student..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button onClick={() => setEvaluatingSubmission(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                  Cancel
                </button>
                <button
                  disabled={submittingGrade}
                  onClick={handleSaveEvaluation}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  {submittingGrade ? 'Saving Grade...' : 'Save Evaluation'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
