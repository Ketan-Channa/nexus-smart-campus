import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle2, AlertCircle, RefreshCw, FileText, User } from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentAssignmentsViewProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentAssignmentsView: React.FC<ParentAssignmentsViewProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Submitted'>('All');

  const fetchAssignments = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nexus-smart-campus-backend.onrender.com/api/parent/academics/assignments?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setAssignments(json.assignments || []);
      }
    } catch (err) {
      console.error('Fetch assignments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [parentEmail, selectedChild?.roll_number]);

  const filtered = assignments.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Submitted') return a.submission_status === 'Submitted' || a.submission_status === 'Graded';
    if (filter === 'Pending') return !a.submission_status || a.submission_status === 'Pending';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Coursework & Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking submission milestones & coursework feedback for {selectedChild?.full_name}
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['All', 'Pending', 'Submitted'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-500/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item: any) => {
            const isDone = item.submission_status === 'Submitted' || item.submission_status === 'Graded';
            return (
              <div
                key={item.assignment_id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.subject_code || 'CSE'}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {item.submission_status || 'Pending Submission'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">{item.subject_name}</div>

                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: <strong>{item.deadline_date || 'N/A'}</strong></span>
                  </div>

                  <div className="text-right font-bold text-teal-600 dark:text-teal-400">
                    {item.marks_obtained != null ? (
                      <span>Score: {item.marks_obtained} / {item.total_marks || 20}</span>
                    ) : (
                      <span className="text-slate-400">Max: {item.total_marks || 20} pts</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Assignments Found</h3>
          <p className="text-xs text-slate-400 mt-1">No coursework matching the selected criteria.</p>
        </div>
      )}
    </div>
  );
};
