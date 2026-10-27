import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
  X,
  FileCheck2,
} from 'lucide-react';

export const AdminAssignmentsWork: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/assignments');
      const data = await res.json();
      if (data.status === 'success') {
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const inspectSubmissions = async (a: any) => {
    setSelectedAssignment(a);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/assignments/${a.assignment_id || a.id}/submissions`);
      const data = await res.json();
      if (data.status === 'success') {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Coursework, Assignments & Submissions Registry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor coursework deadlines, evaluate submission velocities, and inspect grading progress.
          </p>
        </div>
        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Assignments Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Topic & Subject</th>
                <th className="py-3 px-4">Publisher Faculty</th>
                <th className="py-3 px-4">Class & Type</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Submissions</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading assignments telemetry...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No coursework assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{a.topic_name || a.title || 'Coursework'}</div>
                      <div className="text-[11px] text-indigo-300 font-mono">{a.subject_name || a.subject}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{a.faculty_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{a.faculty_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {a.class_name || 'B.Tech CSE'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{a.assignment_type || 'Regular'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {a.deadline_date || 'Ongoing'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{a.submissions_count || 0} turn-ins</span>
                        <span className="text-[10px] text-emerald-400">({a.graded_count || 0} graded)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => inspectSubmissions(a)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/20 transition"
                      >
                        Submissions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-400" />
                  Submissions: {selectedAssignment.topic_name || selectedAssignment.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Subject: {selectedAssignment.subject_name || selectedAssignment.subject} • Total Turn-ins: {submissions.length}
                </p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2">Student</th>
                    <th className="py-2">Roll</th>
                    <th className="py-2">Turn-in Date</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No submissions recorded for this assignment yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30">
                        <td className="py-2 font-semibold text-white">{sub.student_name}</td>
                        <td className="py-2 font-mono text-indigo-300">{sub.roll_number}</td>
                        <td className="py-2 text-slate-400 font-mono">{sub.submitted_date || 'Turned in'}</td>
                        <td className="py-2 font-bold text-white">{sub.scored_marks || '—'}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.status === 'Graded'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {sub.status || 'Submitted'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
