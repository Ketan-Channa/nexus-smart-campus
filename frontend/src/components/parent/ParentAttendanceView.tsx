import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Clock,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentAttendanceViewProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentAttendanceView: React.FC<ParentAttendanceViewProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  const fetchAttendance = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nexus-smart-campus-backend.onrender.com/api/parent/academics/attendance?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [parentEmail, selectedChild?.roll_number]);

  const summary = data?.summary || {};
  const subjectWise = data?.subjectWise || [];
  const records = (data?.records || []).filter((r: any) => {
    if (selectedFilter === 'All') return true;
    return r.status === selectedFilter;
  });

  const isShortage = summary.shortageWarning;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Attendance Tracker & Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verified session attendance for {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Percentage Card */}
        <div
          className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
            isShortage
              ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cumulative Attendance
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isShortage ? 'bg-rose-500 text-white' : 'bg-teal-500 text-white'
              }`}
            >
              {isShortage ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {summary.overallPercentage != null ? `${summary.overallPercentage}%` : '--'}
            </div>
            <div className="text-xs font-semibold mt-1">
              {isShortage ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                  ⚠️ Attendance Shortage (&lt; 75% required by Senate)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  ✓ Eligible for Mid-term & Semester Examinations
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isShortage ? 'bg-rose-500' : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(Number(summary.overallPercentage || 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Sessions Attended Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sessions Breakdown
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
              TOTAL
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {summary.attendedClasses || 0}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold">Attended Lectures</div>
            </div>
            <div>
              <div className="text-2xl font-black text-rose-500">
                {summary.absentClasses || 0}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold">Absences Recorded</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            Total Conducted Sessions: <strong>{summary.totalClasses || 0}</strong>
          </div>
        </div>

        {/* Campus Policy Alert */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800/60 dark:to-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Institutional Policy
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              University guidelines mandate a minimum of <strong>75% attendance</strong> in every course to qualify for end-semester exams. Medical leaves must be approved by the Class Incharge.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-200/50 dark:border-teal-800/40 text-[11px] text-teal-800 dark:text-teal-300 font-bold">
            Threshold: 75.0% Required • Policy v2026.1
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Subject-Wise Attendance Distribution
        </h3>

        {subjectWise.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Subject Name</th>
                  <th className="py-3 px-4">Conducted</th>
                  <th className="py-3 px-4">Attended</th>
                  <th className="py-3 px-4">Absent</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {subjectWise.map((sub: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {sub.subject}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                      {sub.totalClasses}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {sub.attendedClasses}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-500">
                      {sub.absentClasses}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sub.isShortage ? 'bg-rose-500' : 'bg-teal-500'}`}
                            style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-xs">{sub.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          sub.isShortage
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {sub.isShortage ? 'Shortage Warning' : 'Safe / Eligible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No subject-wise attendance logs available yet.
          </div>
        )}
      </div>

      {/* Session History Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Session Attendance History
          </h3>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {(['All', 'Present', 'Absent'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === filter
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Date</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Recorded Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {r.subject}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.class_name || 'B.Tech CSE'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No attendance records matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
