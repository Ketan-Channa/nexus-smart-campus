import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Edit3,
  FileText,
  CheckSquare,
  Bell,
  BarChart3,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Users,
  Coffee,
  HeartHandshake,
  Compass,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Contact,
  Bus,
  CreditCard,
  Network,
} from 'lucide-react';
import axios from 'axios';
import { type FacultyTabType } from './FacultySidebar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FacultyDashboardProps {
  facultyName: string;
  department: string;
  designation: string;
  setActiveTab: (tab: FacultyTabType) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  facultyName,
  department,
  designation,
  setActiveTab,
}) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    todayLectures: [] as any[],
    assignedClassesCount: 0,
    totalStudentsCount: 0,
    pendingAttendanceCount: 0,
    publishedAssignmentsCount: 0,
    pendingSubmissionsCount: 0,
    pendingMedicalLeavesCount: 0,
    facultyLeavesCount: 0,
    activeSosAlertsCount: 0,
    upcomingAnnouncementsCount: 0,
    assessmentSchemesCount: 0,
    pendingApprovalsCount: 0,
    parentMeetingsCount: 0,
  });

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nexus_token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const [dashRes, appRes, meetRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/faculty/dashboard`, { headers: authHeader }),
        axios.get(`${API_BASE_URL}/api/faculty/approvals/overview`, { headers: authHeader }),
        axios.get(`${API_BASE_URL}/api/faculty/parent-connect/meetings`, { headers: authHeader }),
      ]);

      let s: any = {};
      let todayLecs: any[] = [];
      let pendingApps = 0;
      let parentMeets = 0;

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        s = dashRes.value.data.stats || {};
        todayLecs = dashRes.value.data.todayLectures || [];
      }

      if (appRes.status === 'fulfilled' && appRes.value.data?.success && appRes.value.data.overview) {
        pendingApps = appRes.value.data.overview.pendingRequests || 0;
      }

      if (meetRes.status === 'fulfilled' && meetRes.value.data?.success && Array.isArray(meetRes.value.data.meetings)) {
        parentMeets = meetRes.value.data.meetings.length;
      }

      setMetrics({
        todayLectures: todayLecs,
        assignedClassesCount: s.assignedClassesCount ?? 0,
        totalStudentsCount: s.totalStudents ?? 0,
        pendingAttendanceCount: s.pendingAttendanceCount ?? 0,
        publishedAssignmentsCount: s.activeAssignmentsCount ?? 0,
        pendingSubmissionsCount: s.submissionsToGradeCount ?? 0,
        pendingMedicalLeavesCount: s.pendingLeavesCount ?? 0,
        facultyLeavesCount: s.facultyPendingLeavesCount ?? 0,
        activeSosAlertsCount: s.activeEmergenciesCount ?? 0,
        upcomingAnnouncementsCount: s.announcementsCount ?? 0,
        assessmentSchemesCount: s.publishedExamsCount ?? 0,
        pendingApprovalsCount: pendingApps,
        parentMeetingsCount: parentMeets,
      });
    } catch (err) {
      console.warn('Dashboard metrics fetch error, keeping default counts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const topMetrics = [
    {
      title: "Today's Lectures",
      value: metrics.todayLectures.length,
      subtitle: `${metrics.assignedClassesCount} active classes assigned`,
      icon: Calendar,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      tab: 'timetable' as FacultyTabType,
    },
    {
      title: 'Enrolled Students',
      value: metrics.totalStudentsCount,
      subtitle: 'Across your teaching roster',
      icon: GraduationCap,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      tab: 'my-students-classes' as FacultyTabType,
    },
    {
      title: 'Submissions to Grade',
      value: metrics.pendingSubmissionsCount,
      subtitle: `${metrics.publishedAssignmentsCount} active assignments`,
      icon: FileText,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tab: 'assignments' as FacultyTabType,
    },
    {
      title: 'Medical Leaves to Review',
      value: metrics.pendingMedicalLeavesCount,
      subtitle: 'Pending student approvals',
      icon: CheckSquare,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tab: 'medical-leaves' as FacultyTabType,
    },
    {
      title: 'Emergency SOS Alerts',
      value: metrics.activeSosAlertsCount,
      subtitle: metrics.activeSosAlertsCount > 0 ? 'Urgent response needed' : 'All campus zones secure',
      icon: ShieldAlert,
      color:
        metrics.activeSosAlertsCount > 0
          ? 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse'
          : 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      tab: 'safety-response' as FacultyTabType,
    },
  ];

  const dashboardModules = [
    {
      id: 'student-approvals',
      name: 'Student Approvals Central',
      icon: CheckSquare,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badge: `${metrics.pendingApprovalsCount} Requests Pending`,
      preview: 'Central approval inbox to review and decision Medical Leaves, Digital ID Cards, Fest Passes, and Student Documents.',
      actionText: 'Review Approvals →',
    },
    {
      id: 'parent-connect',
      name: 'Parent Connect',
      icon: Contact,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badge: `${metrics.parentMeetingsCount} Meetings Scheduled`,
      preview: 'Communicate with authorized parents/guardians, schedule meetings, send event invitations, and review academic feedback.',
      actionText: 'Connect with Parents →',
    },
    {
      id: 'timetable',
      name: 'Academics & Timetable',
      icon: Calendar,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      badge: `${metrics.todayLectures.length} Slots Today`,
      preview:
        metrics.todayLectures.length > 0
          ? `Next: ${metrics.todayLectures[0].subject || 'Lecture'} (${metrics.todayLectures[0].time_slot || metrics.todayLectures[0].time || 'Schedule'})`
          : 'View weekly lecture schedules, vacant classrooms, and class assignments.',
      actionText: 'View Weekly Grid →',
    },
    {
      id: 'attendance',
      name: 'Attendance Register',
      icon: UserCheck,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      badge: `${metrics.pendingAttendanceCount} Sessions Due`,
      preview:
        metrics.pendingAttendanceCount > 0
          ? 'Mark live student attendance registers for today’s active lectures.'
          : 'Attendance registers are current and synchronized with student records.',
      actionText: 'Open Register →',
    },
    {
      id: 'assignments',
      name: 'Assignments & Coursework',
      icon: FileText,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      badge: `${metrics.pendingSubmissionsCount} Submissions Due`,
      preview: `${metrics.publishedAssignmentsCount} active assignments published across your assigned courses.`,
      actionText: 'Grade Submissions →',
    },
    {
      id: 'exams-analytics',
      name: 'Exams & Results Analytics',
      icon: BarChart3,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badge: `${metrics.assessmentSchemesCount} Schemes Configured`,
      preview: 'Flexible marks entry, free-text subject naming, MSE/Class Test scoring, and live publishing to Student Portals.',
      actionText: 'Manage Marks & Schemes →',
    },
    {
      id: 'medical-leaves',
      name: 'Medical Leave Approvals',
      icon: CheckSquare,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      badge: `${metrics.pendingMedicalLeavesCount} Pending Review`,
      preview: 'Review doctor prescriptions, verify hospital certificates, and update student attendance eligibility.',
      actionText: 'Review Medical Requests →',
    },
    {
      id: 'faculty-leaves',
      name: 'Faculty Leave Applications',
      icon: HeartHandshake,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      badge: `${metrics.facultyLeavesCount} Active Applications`,
      preview: 'Apply for Casual, Duty, or Medical leave, assign substitute teachers, and track department decisions.',
      actionText: 'Apply or View Status →',
    },
    {
      id: 'safety-response',
      name: 'Student Safety Response Centre',
      icon: ShieldAlert,
      color:
        metrics.activeSosAlertsCount > 0
          ? 'text-rose-400 bg-rose-500/20 border-rose-500/40'
          : 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      badge: metrics.activeSosAlertsCount > 0 ? `${metrics.activeSosAlertsCount} Active SOS` : 'Secure',
      preview: 'Campus rapid emergency response system with atomic first-5 faculty responder claiming.',
      actionText: 'Open Safety Dashboard →',
    },
    {
      id: 'my-students-classes',
      name: 'My Students & Classes',
      icon: Users,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
      badge: `${metrics.totalStudentsCount} Students`,
      preview: 'View student contact cards, academic progression, attendance percentages, and roll numbers.',
      actionText: 'View Roster →',
    },
    {
      id: 'announcements',
      name: 'Announcements & Alerts',
      icon: Bell,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      badge: `${metrics.upcomingAnnouncementsCount} Bulletins`,
      preview: 'Publish urgent circulars and broadcast academic notifications to your enrolled classes.',
      actionText: 'Broadcast Alert →',
    },
    {
      id: 'events-updates',
      name: 'Events & Updates',
      icon: Sparkles,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      badge: 'Campus Calendar',
      preview: 'Explore campus cultural events, guest lectures, hackathons, and publish faculty-led department workshops.',
      actionText: 'Explore Events →',
    },
    {
      id: 'canteen',
      name: 'Canteen & Cabin Delivery',
      icon: Coffee,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      badge: 'Cabin Delivery Active',
      preview: 'Order hot food and beverages delivered directly to your faculty office or department cabin.',
      actionText: 'Order Food →',
    },
    {
      id: 'hostel-transport',
      name: 'Hostel & Transport',
      icon: Bus,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      badge: 'Campus Transit',
      preview: 'Track campus shuttle timings, faculty transit routes, and campus accommodation facility statuses.',
      actionText: 'View Transit & Hostels →',
    },
    {
      id: 'payments',
      name: 'Payment & Transactions',
      icon: CreditCard,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      badge: 'Finance Desk',
      preview: 'Verify departmental reimbursements, institutional fee disbursements, and canteen billing histories.',
      actionText: 'Manage Payments →',
    },
    {
      id: 'research',
      name: 'Research & Collaborations',
      icon: Compass,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
      badge: 'Inter-College Hub',
      preview: 'Initiate research projects, invite peer collaborators, and review proposals across departments.',
      actionText: 'Explore Projects →',
    },
    {
      id: 'connections',
      name: 'Connections Network',
      icon: Network,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
      badge: 'Campus Community',
      preview: 'Collaborate with campus peers, share research updates, and mentor student projects in realtime.',
      actionText: 'Open Connections →',
    },
    {
      id: 'utilities',
      name: 'Quick Notes & Faculty Utilities',
      icon: Edit3,
      color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
      badge: 'Tools Ready',
      preview: 'GPA calculator, quick lecture notes, syllabus checklist, and campus room finder tools.',
      actionText: 'Launch Utilities →',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-900/70 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            NEXUS FACULTY COMMAND CENTER
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Welcome back, {facultyName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {designation} • {department} • All campus data synchronized in realtime.
          </p>
        </div>

        <button
          onClick={fetchDashboardMetrics}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* TOP LIVE METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {topMetrics.map((tm, idx) => {
          const Icon = tm.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(tm.tab)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-purple-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{tm.title}</span>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${tm.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="font-display font-black text-2xl text-slate-900 dark:text-white block">
                  {loading ? '...' : tm.value}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">{tm.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* TODAY'S LECTURE SCHEDULE TIMELINE */}
      {metrics.todayLectures.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Today's Teaching Schedule
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              View Full Timetable →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {metrics.todayLectures.map((lec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                    {lec.timeSlot || lec.time_slot || lec.time || '10:00 - 11:00 AM'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    Room {lec.room || lec.room_number || '304'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {lec.subject || 'Agile Software Development'}
                </h4>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Class: {lec.className || lec.class_name || lec.class || 'BTECH CSE 4A'}
                  </span>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="text-[10px] px-2.5 py-1 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors"
                  >
                    Take Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12 FULLY FUNCTIONAL SQUARE MODULE CARDS GRID */}
      <div className="space-y-3">
        <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-purple-500" />
          Campus Modules & Workspaces
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboardModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveTab(mod.id as FacultyTabType)}
                className="p-5 rounded-3xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800/90 shadow-xl flex flex-col justify-between space-y-4 text-left hover:border-purple-500/50 hover:shadow-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${mod.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                        {mod.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                        Workspace Active
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                    {mod.badge}
                  </span>
                </div>

                {/* REAL PREVIEW CONTENT */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 min-h-[90px] flex items-center">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{mod.preview}</p>
                </div>

                {/* INTERACTIVE LAUNCH BUTTON */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {mod.actionText}
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-purple-500/10 group-hover:bg-purple-600 group-hover:text-white text-purple-400 flex items-center justify-center transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
