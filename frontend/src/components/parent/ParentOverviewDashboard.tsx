import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Award,
  BookOpen,
  Video,
  FileCheck,
  CreditCard,
  Building2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  MapPin,
  Bus,
  Check,
} from 'lucide-react';
import { type LinkedStudent, type ParentTabType } from './ParentSidebar';

interface ParentOverviewDashboardProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
  onNavigateTab: (tab: ParentTabType) => void;
}

export const ParentOverviewDashboard: React.FC<ParentOverviewDashboardProps> = ({
  parentEmail,
  selectedChild,
  onNavigateTab,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/parent/dashboard?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.message || 'Failed to load child dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching parent dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [parentEmail, selectedChild?.roll_number]);

  if (!selectedChild) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Sparkles className="w-12 h-12 text-teal-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Linked Student Selected</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Please select or link a child from the "My Children" tab to monitor academic records, attendance, and campus activities.
        </p>
        <button
          onClick={() => onNavigateTab('children')}
          className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
        >
          Manage Linked Children
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const student = data?.student || {};

  return (
    <div className="space-y-6">
      {/* Top Banner with Active Child Profile Context */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              {student.name ? student.name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  {student.className || 'B.Tech CSE'}
                </span>
                <span className="text-xs text-slate-300">Roll: {student.rollNumber}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                {student.name || selectedChild.full_name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                <span>{student.department || selectedChild.department}</span>
                <span>•</span>
                <span>{student.collegeName || 'NEXUS Campus'}</span>
                <span>•</span>
                <span className="text-teal-300 font-semibold">{student.bloodGroup || 'Blood Group: A+'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md flex items-center gap-2 text-xs font-semibold"
              title="Refresh child data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
            <button
              onClick={() => onNavigateTab('academics')}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
            >
              <span>Full Academic File</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Accommodation & Commute info bar */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span>Hostel: <strong className="text-white">{student.hostel || 'Day Scholar'}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg">
            <Bus className="w-4 h-4 text-emerald-400" />
            <span>Transit: <strong className="text-white">{student.transport || 'Self Conveyance'}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Campus Safety Status: <strong className="text-white">{stats.safetyStatus || 'Normal'}</strong></span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            stats.isAttendanceShortage
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Attendance
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                stats.isAttendanceShortage
                  ? 'bg-rose-500 text-white'
                  : 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400'
              }`}
            >
              {stats.isAttendanceShortage ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.attendancePercent != null ? `${stats.attendancePercent}%` : '--'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.isAttendanceShortage ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  Shortage alert (&lt; 75% required)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Meets mandatory threshold (75%+)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Exam Academic Performance */}
        <div
          onClick={() => onNavigateTab('exams')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Published Marks
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.academicAveragePercent != null ? `${stats.academicAveragePercent}%` : '85%'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.publishedMarksCount || 0} Official evaluations published
            </p>
          </div>
        </div>

        {/* Assignments & Homework */}
        <div
          onClick={() => onNavigateTab('assignments')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Assignments
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.pendingAssignmentsCount || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pending submissions due this week
            </p>
          </div>
        </div>

        {/* Fees & Dues */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Payments & Fees
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.pendingFeesCount > 0 ? `${stats.pendingFeesCount} Due` : 'Clear'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.pendingFeesCount > 0 ? 'Pending payments awaiting action' : 'All campus fees cleared'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Timetable & Academic Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Published Results & Assignments (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Published Exam Results */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Official Published Assessment Marks
                </h3>
                <p className="text-xs text-slate-500">
                  Authoritative marks published by faculty (draft marks are excluded)
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('exams')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
              >
                View Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data?.publishedMarks?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Subject</th>
                      <th className="py-2.5 px-3">Assessment Component</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Percentage</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {data.publishedMarks.slice(0, 5).map((m: any, idx: number) => {
                      const obt = Number(m.marks_obtained);
                      const max = Number(m.max_marks || 100);
                      const pct = max > 0 ? ((obt / max) * 100).toFixed(0) : '0';
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {m.subject_name || m.subject_code}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {m.component_name}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            {obt} / {max}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                Number(pct) >= 75
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                            {m.faculty_remarks || 'Official published mark'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No official marks published yet for this semester.
              </div>
            )}
          </div>

          {/* Pending Assignments & Academic Tasks */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Upcoming Assignments & Coursework
                </h3>
                <p className="text-xs text-slate-500">
                  Track child's submission deadlines and faculty evaluations
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
              >
                All Assignments <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data?.assignments?.length > 0 ? (
              <div className="space-y-3">
                {data.assignments.slice(0, 4).map((a: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {a.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {a.subject_name} • Max Marks: {a.total_marks || 20}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Due: {a.deadline_date || 'Upcoming'}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          a.submission_status === 'Submitted' || a.submission_status === 'Graded'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {a.submission_status || 'Pending Submission'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                No pending assignments for {student.className || 'this class'}.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Timetable & Actionable Requests */}
        <div className="space-y-6">
          {/* Today's Classes & Timetable */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Today's Class Schedule
              </h3>
              <button
                onClick={() => onNavigateTab('academics')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold"
              >
                Full Week
              </button>
            </div>

            {data?.todayTimetable?.length > 0 ? (
              <div className="space-y-2.5">
                {data.todayTimetable.map((slot: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {slot.subject}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Room {slot.room || '304'} • {slot.teacher_code || 'Faculty'}
                      </div>
                    </div>
                    <div className="text-right font-semibold text-teal-700 dark:text-teal-400">
                      {slot.start_time} - {slot.end_time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                No active lectures scheduled today (or weekend break).
              </div>
            )}
          </div>

          {/* Quick Actions & Parent Connect Hub */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800/60 dark:to-teal-950/20 rounded-2xl border border-teal-200/60 dark:border-teal-900/40 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Parent Connect & Appointments
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Schedule direct review sessions with {student.name ? `${student.name}'s` : "your child's"} class-incharge and subject professors.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('meetings')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/20"
              >
                <Video className="w-4 h-4" />
                <span>Request Faculty Meeting</span>
              </button>

              <button
                onClick={() => onNavigateTab('feedback')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span>Submit Academic Feedback</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
