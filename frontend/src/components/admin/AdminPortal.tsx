import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  X,
  Bell,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
  Radio,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { CaptainChatbot } from '../ai/CaptainChatbot';
import { initializeSocket, getSocket } from '../../services/socketService';
import { type UserSession } from '../../types/auth';

// Navigation & Sidebar
import { AdminSidebar, type AdminTabType } from './AdminSidebar';

// 34 Modular Views
import { AdminOverviewDashboard } from './AdminOverviewDashboard';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminStudentManagement } from './AdminStudentManagement';
import { AdminFacultyManagement } from './AdminFacultyManagement';
import { AdminParentManagement } from './AdminParentManagement';
import { AdminAlumniManagement } from './AdminAlumniManagement';
import { AdminDepartmentsClasses } from './AdminDepartmentsClasses';
import { AdminSubjectsCurriculum } from './AdminSubjectsCurriculum';
import { AdminTimetableManagement } from './AdminTimetableManagement';
import { AdminAttendanceGovernance } from './AdminAttendanceGovernance';
import { AdminAssignmentsWork } from './AdminAssignmentsWork';
import { AdminExamsResultsGovernance } from './AdminExamsResultsGovernance';
import { AdminCentralApprovals } from './AdminCentralApprovals';
import { AdminFacultyLeaves } from './AdminFacultyLeaves';
import { AdminParentConnectGovernance } from './AdminParentConnectGovernance';
import { AdminSafetyGovernance } from './AdminSafetyGovernance';
import { AdminAnnouncementsEvents } from './AdminAnnouncementsEvents';
import { AdminCommunityModeration } from './AdminCommunityModeration';
import { AdminAlumniCareerResearch } from './AdminAlumniCareerResearch';
import { AdminCampusServices } from './AdminCampusServices';
import { AdminPaymentsFinance } from './AdminPaymentsFinance';
import { AdminDocumentsCertificates } from './AdminDocumentsCertificates';
import { AdminReportsAnalytics } from './AdminReportsAnalytics';
import { AdminUtilitiesAi } from './AdminUtilitiesAi';
import { AdminRolesPermissions } from './AdminRolesPermissions';
import { AdminSystemHealthSettings } from './AdminSystemHealthSettings';
import { AdminAuditLogsSecurity } from './AdminAuditLogsSecurity';
import { AdminProfileView } from './AdminProfileView';
import { AdminHelpAbout } from './AdminHelpAbout';

interface AdminPortalProps {
  session: UserSession;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Overview Data & Badges
  const [overviewData, setOverviewData] = useState<any>({
    stats: {},
    charts: {},
  });

  // Realtime toast alert
  const [liveToast, setLiveToast] = useState<{ message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const adminEmail =
    session?.email ||
    (session as any)?.user?.email ||
    'admin@nexus.edu';

  const adminName =
    session?.name ||
    (session as any)?.user?.name ||
    'Super Administrator';

  const adminAccessLevel =
    (session as any)?.access_level ||
    (session as any)?.user?.access_level ||
    'Super Admin';

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/overview-stats');
      const data = await res.json();
      if (data.status === 'success') {
        setOverviewData(data);
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Realtime Socket.IO Subscriptions
  useEffect(() => {
    let socket: any = null;
    try {
      socket = initializeSocket(session);
    } catch (e) {
      socket = getSocket();
    }

    if (socket) {
      socket.emit('join_room', 'role:Administrator');

      const handleEmergencySos = (payload: any) => {
        setLiveToast({
          message: `🚨 Emergency Alert: ${payload.emergencyType || 'SOS Alert'} triggered by ${payload.studentName || 'Student'}!`,
          type: 'alert',
        });
        fetchOverview();
      };

      const handleApprovalEvent = (payload: any) => {
        setLiveToast({
          message: `📋 Approval Event: ${payload.category || 'Request'} processed.`,
          type: 'info',
        });
        fetchOverview();
      };

      const handleUserEvent = (payload: any) => {
        setLiveToast({
          message: `👤 Account Event: ${payload.role || 'User'} (${payload.name || ''}) account updated.`,
          type: 'success',
        });
        fetchOverview();
      };

      socket.on('emergency_sos:alert', handleEmergencySos);
      socket.on('sos:updated', handleEmergencySos);
      socket.on('approval:processed', handleApprovalEvent);
      socket.on('user:created', handleUserEvent);
      socket.on('user:status_changed', handleUserEvent);

      return () => {
        socket.off('emergency_sos:alert', handleEmergencySos);
        socket.off('sos:updated', handleEmergencySos);
        socket.off('approval:processed', handleApprovalEvent);
        socket.off('user:created', handleUserEvent);
        socket.off('user:status_changed', handleUserEvent);
      };
    }
  }, [session, fetchOverview]);

  // Auto-dismiss toast
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => setLiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  const stats = overviewData?.stats || {};

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 34-Module Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        badgeCounts={{
          pendingApprovals: stats.pendingApprovals,
          pendingAlumni: stats.totalAlumni ? 0 : 0,
          activeSos: stats.systemAlerts,
        }}
      />

      {/* Main Administrative Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#07090E]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden transition"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Central Governance Matrix</span>
              <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Realtime Live Mesh Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Realtime Mesh Synced</span>
            </div>

            {/* Notifications Shortcut */}
            <button
              onClick={() => setActiveTab('announcements')}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              title="Announcements & Notices"
            >
              <Bell className="w-4 h-4" />
              {Number(stats.systemAlerts) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            {/* CAPTAIN AI Assistant */}
            <CaptainChatbot session={session} variant="header" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Administrator Profile Chip */}
            <button
              onClick={() => setActiveTab('admin_profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {adminName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                  {adminName}
                </div>
                <div className="text-[10px] text-indigo-400 font-bold leading-tight">
                  {adminAccessLevel}
                </div>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Log Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Live Toast Banner */}
        {liveToast && (
          <div
            className={`mx-4 sm:mx-6 mt-4 p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
              liveToast.type === 'alert'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : liveToast.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="font-semibold">{liveToast.message}</span>
            </div>
            <button onClick={() => setLiveToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Workspace Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <AdminOverviewDashboard
              onNavigateTab={(tab) => setActiveTab(tab)}
              overviewData={overviewData}
              loading={loading}
              onRefresh={fetchOverview}
            />
          )}

          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'students' && <AdminStudentManagement />}
          {activeTab === 'faculty' && <AdminFacultyManagement />}
          {activeTab === 'parents' && <AdminParentManagement />}
          {activeTab === 'alumni' && <AdminAlumniManagement />}

          {activeTab === 'departments_classes' && <AdminDepartmentsClasses />}
          {activeTab === 'subjects_curriculum' && <AdminSubjectsCurriculum />}
          {activeTab === 'timetable' && <AdminTimetableManagement />}
          {activeTab === 'attendance' && <AdminAttendanceGovernance />}
          {activeTab === 'assignments' && <AdminAssignmentsWork />}
          {activeTab === 'exams_results' && <AdminExamsResultsGovernance />}

          {activeTab === 'student_approvals' && <AdminCentralApprovals />}
          {activeTab === 'faculty_leaves' && <AdminFacultyLeaves />}
          {activeTab === 'parent_connect' && <AdminParentConnectGovernance />}
          {activeTab === 'safety_voice' && <AdminSafetyGovernance />}

          {activeTab === 'announcements' && <AdminAnnouncementsEvents />}
          {activeTab === 'events' && <AdminAnnouncementsEvents />}
          {activeTab === 'messaging_governance' && <AdminCommunityModeration />}

          {activeTab === 'alumni_connect' && <AdminAlumniCareerResearch />}
          {activeTab === 'jobs_careers' && <AdminAlumniCareerResearch />}
          {activeTab === 'research_collab' && <AdminAlumniCareerResearch />}

          {activeTab === 'canteen_services' && <AdminCampusServices />}
          {activeTab === 'hostel_transport' && <AdminCampusServices />}
          {activeTab === 'payments_finance' && <AdminPaymentsFinance />}
          {activeTab === 'documents_certs' && <AdminDocumentsCertificates />}

          {activeTab === 'reports_analytics' && <AdminReportsAnalytics />}
          {activeTab === 'admin_utilities_ai' && <AdminUtilitiesAi />}
          {activeTab === 'roles_permissions' && <AdminRolesPermissions />}
          {activeTab === 'system_health' && <AdminSystemHealthSettings />}
          {activeTab === 'system_settings' && <AdminSystemHealthSettings />}
          {activeTab === 'audit_security' && <AdminAuditLogsSecurity />}
          {activeTab === 'admin_profile' && <AdminProfileView session={session} />}
          {activeTab === 'help_about' && <AdminHelpAbout />}
        </main>
      </div>
    </div>
  );
};
