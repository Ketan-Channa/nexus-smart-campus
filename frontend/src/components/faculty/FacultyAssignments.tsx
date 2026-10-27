import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FileText, Plus, CheckCircle2, FileSpreadsheet, FileCode, Award } from 'lucide-react';

export const FacultyAssignments: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [activeSubmissionModal, setActiveSubmissionModal] = useState<any | null>(null);
  const [gradingForm, setGradingForm] = useState({ scoredMarks: 45, facultyRemarks: 'Evaluated by faculty.' });
  const [publishedAssignments, setPublishedAssignments] = useState<any[]>([]);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: 'Blockchain Technologies',
    subjectCode: 'CSE-405',
    className: 'BTECH CSE 4A',
    assignmentType: 'Subjective' as 'Objective' | 'Subjective',
    totalMarks: 50,
    deadlineDate: '2026-09-01',
    deadlineTime: '11:59 PM',
    description: '',
  });

  // Fetch published assignments
  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/faculty/assignments');
      if (res.data && res.data.assignments) {
        setPublishedAssignments(res.data.assignments);
      } else {
        setPublishedAssignments([]);
      }
    } catch (err) {
      setPublishedAssignments([]);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Fetch submissions for active assignment modal
  useEffect(() => {
    if (!activeSubmissionModal) return;
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/faculty/submissions?assignmentId=${encodeURIComponent(activeSubmissionModal.assignment_id || activeSubmissionModal.id)}`);
        if (res.data && res.data.submissions) {
          setSubmissionsList(res.data.submissions);
        } else {
          setSubmissionsList([]);
        }
      } catch (err) {
        setSubmissionsList([]);
      }
    };
    fetchSubmissions();
  }, [activeSubmissionModal]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsgn = {
      id: `asgn-${Date.now()}`,
      title: assignmentForm.title,
      subject: assignmentForm.subject,
      subjectCode: assignmentForm.subjectCode,
      className: assignmentForm.className,
      assignmentType: assignmentForm.assignmentType,
      totalMarks: assignmentForm.assignmentType === 'Objective' ? 25 : 50,
      deadlineDate: assignmentForm.deadlineDate,
      deadlineTime: assignmentForm.deadlineTime,
      submissionsCount: 0,
      totalStudents: 45,
      gradedCount: 0,
    };

    setPublishedAssignments([newAsgn, ...publishedAssignments]);
    setShowCreateModal(false);
    alert(`Assignment "${assignmentForm.title}" published to ${assignmentForm.className}!`);
  };

  const getFileTypeIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="w-4 h-4 text-rose-400" />;
    if (type === 'docx') return <FileCode className="w-4 h-4 text-blue-400" />;
    if (type === 'xlsx') return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    return <FileText className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            Assignments & Submission Grading Suite
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Publish objective (25 Mks) or subjective (50 Mks) tasks, view submitted documents, and grade with remarks</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create & Publish Assignment</span>
        </button>
      </div>

      {/* PUBLISHED ASSIGNMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {publishedAssignments.map((a) => (
          <motion.div
            key={a.id}
            whileHover={{ y: -3 }}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30">
                {a.subjectCode} • {a.className}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                a.assignmentType === 'Objective' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {a.assignmentType} ({a.totalMarks} Marks)
              </span>
            </div>

            <div>
              <h3 className="font-display font-black text-base text-white">{a.title}</h3>
              <span className="text-xs text-slate-400 block mt-0.5">Deadline: <strong className="text-white">{a.deadlineDate} ({a.deadlineTime})</strong></span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">Submissions: {a.submissionsCount} / {a.totalStudents}</span>
              <span className="text-emerald-400 font-bold">Graded: {a.gradedCount}</span>
            </div>

            <button
              onClick={() => setActiveSubmissionModal(a)}
              className="w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold text-xs transition-colors border border-purple-500/30 flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Review Submissions & Grade</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Create Assignment for Class
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Assignment Title</label>
                  <input type="text" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} placeholder="e.g. Smart Contract Vulnerability Audit" className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Target Class</label>
                    <select value={assignmentForm.className} onChange={(e) => setAssignmentForm({ ...assignmentForm, className: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">
                      <option value="BTECH CSE 4A">BTECH CSE 4A</option>
                      <option value="BTECH CSE 4B">BTECH CSE 4B</option>
                      <option value="BCA 3B">BCA 3B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Type & Marking Standard</label>
                    <select value={assignmentForm.assignmentType} onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentType: e.target.value as any, totalMarks: e.target.value === 'Objective' ? 25 : 50 })} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">
                      <option value="Objective">Objective (25 Marks)</option>
                      <option value="Subjective">Subjective (50 Marks)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Deadline Date</label>
                    <input type="date" value={assignmentForm.deadlineDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, deadlineDate: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Deadline Time</label>
                    <input type="text" value={assignmentForm.deadlineTime} onChange={(e) => setAssignmentForm({ ...assignmentForm, deadlineTime: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono" />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold shadow-md hover:bg-purple-500">Publish Assignment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBMISSION REVIEW & GRADING MODAL */}
      <AnimatePresence>
        {activeSubmissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSubmissionModal(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">{activeSubmissionModal.subjectCode} • {activeSubmissionModal.className}</span>
                  <h3 className="font-display font-black text-base text-white">{activeSubmissionModal.title}</h3>
                </div>
                <button onClick={() => setActiveSubmissionModal(null)} className="text-slate-400 hover:text-slate-200 font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Student Submissions Roster ({submissionsList.length})</h4>

                {submissionsList.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-bold bg-slate-800/40 rounded-2xl">No student submissions received for this assignment yet.</div>
                ) : (
                  submissionsList.map((sub: any) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-white font-bold block">{sub.studentName} ({sub.rollNumber})</strong>
                        <span className="text-[10px] text-slate-400">Submitted: {sub.submittedDate}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                        {sub.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {getFileTypeIcon(sub.fileType)}
                        <span className="font-bold text-slate-200 truncate">{sub.fileName}</span>
                        <span className="text-[10px] text-slate-400">({sub.fileSize})</span>
                      </div>
                      <button onClick={() => alert(`Opening submitted document: ${sub.fileName}`)} className="px-2.5 py-1 rounded bg-purple-600/30 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                        View Document
                      </button>
                    </div>

                    {/* Grading Entry */}
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <label className="font-bold text-slate-300">Marks (Max {activeSubmissionModal.totalMarks}):</label>
                        <input
                          type="number"
                          max={activeSubmissionModal.totalMarks}
                          value={sub.scoredMarks || gradingForm.scoredMarks}
                          onChange={(e) => setGradingForm({ ...gradingForm, scoredMarks: parseInt(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                        />
                      </div>
                      <button
                        onClick={() => alert(`Saved Marks ${gradingForm.scoredMarks}/${activeSubmissionModal.totalMarks} for ${sub.studentName}!`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Grade</span>
                      </button>
                    </div>
                  </div>
                )))}
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setActiveSubmissionModal(null)} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-500">
                  Close Reviewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
