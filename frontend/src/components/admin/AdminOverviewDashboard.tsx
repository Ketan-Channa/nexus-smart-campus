import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Award,
  Building2,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { type AdminTabType } from './AdminSidebar';

interface AdminOverviewDashboardProps {
  onNavigateTab: (tab: AdminTabType) => void;
  overviewData: any;
  loading: boolean;
  onRefresh: () => void;
}

export const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({
  onNavigateTab,
  overviewData,
  loading,
  onRefresh,
}) => {
  const stats = overviewData?.stats || {};
  const charts = overviewData?.charts || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-sky-950/60 border border-indigo-500/20 p-6 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CAMPUS GOVERNANCE MATRIX
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Mesh Active
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Central Administration Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authoritative governance hub synchronizing Student, Faculty, Parent, Alumni, and Admin operations in realtime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700/60 transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Telemetry
            </button>
            <button
              onClick={() => onNavigateTab('announcements')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Broadcast Notice
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => onNavigateTab('students')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition-all hover:border-indigo-500/40 shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Students</span>
            <GraduationCap className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalStudents || 0}</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" /> Active Enrollments
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('faculty')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition-all hover:border-sky-500/40 shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Faculty</span>
            <Briefcase className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalFaculty || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Professors & Incharges</div>
        </div>

        <div
          onClick={() => onNavigateTab('parents')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition-all hover:border-emerald-500/40 shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Parents</span>
            <HeartHandshake className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalParents || 0}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Verified Guardians</div>
        </div>

        <div
          onClick={() => onNavigateTab('alumni')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition-all hover:border-amber-500/40 shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Alumni</span>
            <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalAlumni || 0}</div>
          <div className="text-[10px] text-amber-400 mt-1">Global Network</div>
        </div>

        <div
          onClick={() => onNavigateTab('student_approvals')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition-all hover:border-purple-500/40 shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Approvals</span>
            <FileCheck2 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{stats.pendingApprovals || 0}</div>
          <div className="text-[10px] text-purple-400 mt-1">Pending Action</div>
        </div>

        <div
          onClick={() => onNavigateTab('safety_voice')}
          className="cursor-pointer group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition-all hover:border-rose-500/40 shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Safety Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats.systemAlerts || 0}</div>
          <div className="text-[10px] text-rose-300 mt-1">Active SOS Incidents</div>
        </div>
      </div>

      {/* Distribution & Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Department Enrollment */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Enrollment by Department
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {charts.studentsByDept?.length || 0} Departments
            </span>
          </div>

          <div className="space-y-3">
            {charts.studentsByDept && charts.studentsByDept.length > 0 ? (
              charts.studentsByDept.map((item: any, idx: number) => {
                const total = stats.totalStudents || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[180px]">
                        {item.department || 'General'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">No department data recorded</div>
            )}
          </div>
        </div>

        {/* Attendance Health Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Attendance Breakdown
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              75% Required
            </span>
          </div>

          <div className="space-y-3">
            {charts.attendanceDist && charts.attendanceDist.length > 0 ? (
              charts.attendanceDist.map((item: any, idx: number) => {
                const colorMap: any = {
                  Present: 'from-emerald-500 to-teal-400',
                  Absent: 'from-rose-500 to-red-400',
                  'On Duty': 'from-blue-500 to-sky-400',
                  'Medical Leave': 'from-amber-500 to-yellow-400',
                };
                const gradient = colorMap[item.status] || 'from-indigo-500 to-purple-400';
                return (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${gradient}`} />
                      <span className="text-xs text-slate-200 font-semibold">{item.status}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{item.count} sessions</span>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">No attendance records today</div>
            )}
          </div>
        </div>

        {/* Safety & Incident Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Safety Case Resolution
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {stats.pendingComplaints || 0} Open
            </span>
          </div>

          <div className="space-y-3">
            {charts.complaintDist && charts.complaintDist.length > 0 ? (
              charts.complaintDist.map((item: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-slate-200">{item.status}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{item.count} cases</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-emerald-400 flex flex-col items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                All student safety reports resolved!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Center Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('users')}
          className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-indigo-500/40 flex items-center gap-3 text-left transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Create Account</div>
            <div className="text-[10px] text-slate-400">Student, Faculty, Alumni</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('timetable')}
          className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-sky-500/40 flex items-center gap-3 text-left transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Activate Timetable</div>
            <div className="text-[10px] text-slate-400">Sync all class schedules</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('student_approvals')}
          className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-purple-500/40 flex items-center gap-3 text-left transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Approval Queue</div>
            <div className="text-[10px] text-slate-400">Digital cards & medicals</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('system_health')}
          className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-emerald-500/40 flex items-center gap-3 text-left transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">System Diagnostics</div>
            <div className="text-[10px] text-slate-400">Live DB & socket health</div>
          </div>
        </button>
      </div>
    </div>
  );
};
