import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Calendar, Bell, ShieldAlert,
  ShieldCheck, RefreshCw, Search, Plus, X, Sparkles
} from 'lucide-react';

interface AdminDashboardStudioProps {
  session?: any;
  activeNavTab?: string;
  onNavigateTab?: (tabName: string) => void;
}

export const AdminDashboardStudio: React.FC<AdminDashboardStudioProps> = ({ session, activeNavTab, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<string>(activeNavTab || 'Overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Synchronize with external nav tab if passed
  useEffect(() => {
    if (activeNavTab) {
      setActiveTab(activeNavTab);
    }
  }, [activeNavTab]);

  // Overview Stats & Charts State
  const [overviewData, setOverviewData] = useState<{
    stats: {
      totalStudents: number;
      totalFaculty: number;
      totalAlumni: number;
      totalActiveUsers: number;
      totalClasses: number;
      totalDepartments: number;
      pendingApprovals: number;
      pendingComplaints: number;
      pendingLeaves: number;
      activeEvents: number;
      paymentDues: number;
      systemAlerts: number;
    };
    charts: {
      studentsByDept: any[];
      studentsByYear: any[];
      facultyByDept: any[];
      alumniByYear: any[];
      attendanceDist: any[];
      complaintDist: any[];
    };
  }>({
    stats: {
      totalStudents: 0,
      totalFaculty: 0,
      totalAlumni: 0,
      totalActiveUsers: 0,
      totalClasses: 0,
      totalDepartments: 0,
      pendingApprovals: 0,
      pendingComplaints: 0,
      pendingLeaves: 0,
      activeEvents: 0,
      paymentDues: 0,
      systemAlerts: 0,
    },
    charts: {
      studentsByDept: [],
      studentsByYear: [],
      facultyByDept: [],
      alumniByYear: [],
      attendanceDist: [],
      complaintDist: [],
    },
  });

  // Users Directory State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  // Class Incharge Modal State
  const [showInchargeModal, setShowInchargeModal] = useState<boolean>(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedClassCode, setSelectedClassCode] = useState<string>('');

  // Create Admin Modal State
  const [showCreateAdminModal, setShowCreateAdminModal] = useState<boolean>(false);
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    department: 'Central Administration',
    accessLevel: 'Super Admin',
    designation: 'System Administrator',
    address: 'Main Admin Block, Room 101',
    password: '',
  });

  // Attendance Override Modal State
  const [attendanceShortageList, setAttendanceShortageList] = useState<any[]>([]);

  // Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnModal, setShowAnnModal] = useState<boolean>(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    description: '',
    category: 'Academic',
    targetAudience: 'ALL',
    priority: 'NORMAL',
  });

  // Audit Logs & Settings
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({
    collegeName: 'NEXUS Smart Campus Platform',
    academicYear: '2026-27',
    activeSemester: 'Odd Semester 2026',
    attendanceThreshold: '75',
  });

  // AI Assistant State
  const [aiPromptType, setAiPromptType] = useState('NOTICE_GENERATOR');
  const [aiTopic, setAiTopic] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Pending Alumni Verification State
  const [pendingAlumniList, setPendingAlumniList] = useState<any[]>([]);

  // Pending Parent Relationship & Identity Requests State
  const [pendingParentRequests, setPendingParentRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchOverviewStats();
    fetchUsersDirectory();
    fetchPendingAlumni();
    fetchParentGovernance();
    fetchFacultyList();
    fetchClassList();
    fetchAttendanceSummary();
    fetchAnnouncements();
    fetchAuditLogs();
    fetchSystemSettings();
  }, []);

  const fetchOverviewStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/overview-stats');
      const data = await res.json();
      if (data.status === 'success') {
        setOverviewData(data);
      }
    } catch (e) {
      console.error('Error fetching admin overview stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersDirectory = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users?role=${userRoleFilter}&search=${encodeURIComponent(userSearchTerm)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const fetchPendingAlumni = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/alumni/pending');
      const data = await res.json();
      if (data.status === 'success') {
        setPendingAlumniList(data.pendingAlumni || []);
      }
    } catch (e) {
      console.error('Error fetching pending alumni:', e);
    }
  };

  const handleUpdateStatus = async (userId: number, role: string, newStatus: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role,
          newStatus,
          adminEmail: session?.email || 'admin@nexus.edu',
          adminName: session?.name || 'Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✓ ${role} account status updated to ${newStatus}!`);
        fetchUsersDirectory();
        fetchPendingAlumni();
        fetchOverviewStats();
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const fetchParentGovernance = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/parent-governance');
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.relationshipRequests)) {
        setPendingParentRequests(data.relationshipRequests);
      }
    } catch (e) {
      console.error('Error fetching parent governance:', e);
    }
  };

  const handleUpdateParentRelationship = async (linkId: string, status: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/parent-relationship/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          status,
          adminEmail: session?.email || 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✓ Parent-Student relationship status updated to ${status}!`);
        fetchParentGovernance();
        fetchUsersDirectory();
        fetchOverviewStats();
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (err: any) {
      setActionMsg(`Failed to update parent relationship: ${err.message}`);
    }
  };

  const fetchFacultyList = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/faculty');
      const data = await res.json();
      if (data.status === 'success') {
        setFacultyList(data.faculty || []);
      }
    } catch (e) {
      console.error('Error fetching faculty:', e);
    }
  };

  const fetchClassList = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/classes');
      const data = await res.json();
      if (data.status === 'success') {
        setClassList(data.classes || []);
      }
    } catch (e) {
      console.error('Error fetching classes:', e);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/attendance/summary');
      const data = await res.json();
      if (data.status === 'success') {
        setAttendanceShortageList(data.shortageList || []);
      }
    } catch (e) {
      console.error('Error fetching attendance summary:', e);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/announcements');
      const data = await res.json();
      if (data.status === 'success') {
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error('Error fetching announcements:', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/audit-logs');
      const data = await res.json();
      if (data.status === 'success') {
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/system-settings');
      const data = await res.json();
      if (data.status === 'success' && data.settings) {
        setSystemSettings(data.settings);
      }
    } catch (e) {
      console.error('Error fetching system settings:', e);
    }
  };

  const handleAssignIncharge = async () => {
    if (!selectedFacultyId || !selectedClassCode) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/faculty/assign-class-incharge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFacultyId,
          classCode: selectedClassCode,
          adminEmail: session?.email || 'admin@nexus.edu',
          adminName: session?.name || 'Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✓ ${data.message}`);
        setShowInchargeModal(false);
        fetchFacultyList();
        fetchClassList();
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminForm.fullName || !newAdminForm.email || !newAdminForm.password) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Administrator',
          ...newAdminForm,
          collegeName: systemSettings.collegeName || 'NEXUS Smart Campus Platform',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✓ Created Administrator account for ${newAdminForm.fullName} (${newAdminForm.email})!`);
        setShowCreateAdminModal(false);
        fetchUsersDirectory();
        fetchOverviewStats();
        setTimeout(() => setActionMsg(null), 4000);
      } else {
        alert(data.message || 'Error creating administrator.');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handlePublishAnnouncement = async () => {
    if (!newAnn.title || !newAnn.description) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisherName: session?.name || 'Admin Command',
          publisherEmail: session?.email || 'admin@nexus.edu',
          ...newAnn,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowAnnModal(false);
        fetchAnnouncements();
        setActionMsg('✓ Campus Announcement published successfully!');
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAiAssistant = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/alumni/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: aiPromptType,
          name: session?.name || 'Campus Administrator',
          company: systemSettings.collegeName,
          designation: 'Administrator',
          topic: aiTopic,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAiResult(data.generatedContent);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* COMMAND CENTER HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> NEXUS Administrative Command Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Central Campus Management Studio</h1>
            <p className="text-indigo-200/80 text-xs sm:text-sm mt-1 max-w-3xl">
              Single Source of Truth control center. Monitor multi-department analytics, assign Class Incharges with 2-way cross-portal sync, manage safety emergency SOS alerts, and control academic operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateAdminModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs flex items-center gap-2 transition shadow-lg text-white"
            >
              <Plus className="w-4 h-4" /> Create Administrator
            </button>
            <button
              onClick={() => setShowInchargeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs flex items-center gap-2 transition shadow-lg text-white"
            >
              <Users className="w-4 h-4" /> Assign Class Incharge
            </button>
            <button
              onClick={fetchOverviewStats}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/15 text-white"
              title="Refresh Live Database Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* OVERVIEW MODULE */}
      {(activeTab === 'Overview' || activeTab === 'System Dashboard') && (
        <div className="space-y-6">
          {/* LIVE METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{overviewData.stats.totalStudents}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Faculty</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{overviewData.stats.totalFaculty}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified Alumni</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{overviewData.stats.totalAlumni}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Approvals</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{overviewData.stats.pendingApprovals}</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Pending Complaints</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{overviewData.stats.pendingComplaints}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Events</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{overviewData.stats.activeEvents}</div>
            </div>
          </div>

          {/* EMERGENCY ALERT SOS BANNER IF ACTIVE */}
          {overviewData.stats.systemAlerts > 0 && (
            <div className="p-5 rounded-2xl bg-rose-600 text-white flex items-center justify-between shadow-xl animate-pulse">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6" />
                <div>
                  <h4 className="font-bold text-sm">Emergency SOS Active Alerts ({overviewData.stats.systemAlerts})</h4>
                  <p className="text-xs text-rose-100">Student safety dispatch required immediately.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab ? onNavigateTab('Safety & Student Voice') : setActiveTab('Safety & Student Voice')}
                className="px-4 py-2 rounded-xl bg-white text-rose-600 font-bold text-xs transition"
              >
                Review Safety Dispatch
              </button>
            </div>
          )}

          {/* ANALYTICS CHARTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dept Student Distribution */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Student Distribution by Department
              </h3>
              <div className="space-y-2">
                {overviewData.charts.studentsByDept.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{item.department}</span>
                      <span className="font-mono font-bold text-indigo-600">{item.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (item.count / (overviewData.stats.totalStudents || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Distribution */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Attendance Distribution Overview
              </h3>
              <div className="space-y-2">
                {overviewData.charts.attendanceDist.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.status}</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">{item.count} Records</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Complaints Overview */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Safety Complaints Resolution Status
              </h3>
              <div className="space-y-2">
                {overviewData.charts.complaintDist.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.status}</span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono">{item.count} Cases</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS & ACCOUNTS / ALUMNI VERIFICATION MODULE */}
      {(activeTab === 'Users & Accounts' || activeTab === 'Students' || activeTab === 'Faculty' || activeTab === 'Student Management' || activeTab === 'Faculty Management' || activeTab === 'Alumni' || activeTab === 'Alumni Connect' || activeTab === 'Alumni Management' || activeTab === 'Pending Approvals') && (
        <div className="space-y-6">
          {/* PENDING ALUMNI VERIFICATION QUEUE CARD */}
          {pendingAlumniList.length > 0 && (
            <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Pending Alumni Verification Requests ({pendingAlumniList.length})
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    The following graduated students registered for an Alumni Account and are awaiting Admin Verification to sync across Student, Faculty & Admin portals.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs animate-pulse">
                  Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAlumniList.map((alm: any) => (
                  <div key={alm.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 space-y-3 shadow-sm text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{alm.full_name}</h4>
                        <p className="text-slate-500 font-mono">{alm.email} • {alm.mobile}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300">
                        {alm.verification_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                      <div><strong className="text-slate-900 dark:text-white">Degree:</strong> {alm.degree || 'B.Tech'} ({alm.department})</div>
                      <div><strong className="text-slate-900 dark:text-white">Graduated:</strong> {alm.graduation_year}</div>
                      <div><strong className="text-slate-900 dark:text-white">Company:</strong> {alm.current_company || 'Not Specified'}</div>
                      <div><strong className="text-slate-900 dark:text-white">Designation:</strong> {alm.current_designation || 'Not Specified'}</div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleUpdateStatus(alm.id, 'Alumni', 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 font-bold text-xs hover:bg-rose-100"
                      >
                        ✕ Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(alm.id, 'Alumni', 'VERIFIED')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        ✓ Approve & Issue Alumni ID
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PENDING PARENT RELATIONSHIP VERIFICATION QUEUE CARD */}
          {pendingParentRequests.filter((r) => r.verification_status === 'Pending').length > 0 && (
            <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" /> Pending Parent-Student Linking Requests ({pendingParentRequests.filter((r) => r.verification_status === 'Pending').length})
                  </h3>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400">
                    Verify legal guardians and authorize access to their children&apos;s academic, attendance, and fee records.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs">
                  Parent Governance
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingParentRequests
                  .filter((r) => r.verification_status === 'Pending')
                  .map((req: any) => (
                    <div key={req.link_id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 space-y-3 shadow-sm text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Guardian: {req.parent_email}</h4>
                          <p className="text-slate-500 font-mono">Claimed Relationship: {req.relationship || 'Parent'}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300">
                          {req.verification_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                        <div><strong className="text-slate-900 dark:text-white">Student:</strong> {req.student_name}</div>
                        <div><strong className="text-slate-900 dark:text-white">Roll Number:</strong> {req.student_roll}</div>
                        <div><strong className="text-slate-900 dark:text-white">Class:</strong> {req.class || 'N/A'}</div>
                        <div><strong className="text-slate-900 dark:text-white">Department:</strong> {req.department || 'Engineering'}</div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleUpdateParentRelationship(req.link_id, 'Rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 font-bold text-xs hover:bg-rose-100"
                        >
                          ✕ Reject Link
                        </button>
                        <button
                          onClick={() => handleUpdateParentRelationship(req.link_id, 'Verified')}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                        >
                          ✓ Authorize & Link Ward
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* MAIN UNIFIED DIRECTORY TABLE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" /> Unified Users & Accounts Directory
                </h3>
                <p className="text-xs text-slate-500">View and manage authenticated Student, Faculty, Parent, Alumni & Admin accounts</p>
              </div>

              <div className="flex items-center gap-3">
                <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold">
                  <option value="All">All Roles</option>
                  <option value="Student">Students Only</option>
                  <option value="Faculty">Faculty Only</option>
                  <option value="Parent">Parents Only</option>
                  <option value="Alumni">Alumni Only</option>
                  <option value="Administrator">Admins Only</option>
                </select>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">User Name</th>
                    <th className="p-4">Identifier / ID</th>
                    <th className="p-4">Role & Dept</th>
                    <th className="p-4">Class / Year</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No users found matching query.</td>
                    </tr>
                  ) : (
                    usersList.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                        <td className="p-4 font-mono text-purple-600 dark:text-purple-400 font-bold">{u.identifier || u.email}</td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{u.role}</span>
                          <div className="text-[11px] text-slate-400">{u.department}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{u.class || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' :
                            u.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                            'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {u.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {u.role === 'Alumni' && u.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'Alumni', 'VERIFIED')}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'Alumni', 'REJECTED')}
                                className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-600 font-bold text-[11px]"
                              >
                                ✕ Reject
                              </button>
                            </>
                          ) : (
                            <button className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-600 dark:text-slate-300">
                              Edit Access
                            </button>
                          )}
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

      {/* ATTENDANCE SHORTAGE & MONITORING MODULE */}
      {activeTab === 'Attendance' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Shortage Warning List (&lt;75%)</h3>
            <p className="text-xs text-slate-500">Students with low attendance across campus classes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b text-slate-500 font-bold uppercase text-[11px]">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Present / Total</th>
                  <th className="p-3">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceShortageList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">No attendance shortage records flagged.</td>
                  </tr>
                ) : (
                  attendanceShortageList.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.student_name}</td>
                      <td className="p-3 font-mono">{s.roll_number}</td>
                      <td className="p-3 font-semibold">{s.class_name}</td>
                      <td className="p-3 font-mono">{s.present_lectures} / {s.total_lectures}</td>
                      <td className="p-3 font-bold text-rose-600">{s.percentage}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS & EVENTS MODULE */}
      {(activeTab === 'Announcements & Events' || activeTab === 'Announcements Management') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Campus Official Announcements</h3>
              <p className="text-xs text-slate-500">Publish targeted official notices to Students, Faculty, Alumni, or All Users</p>
            </div>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Publish Announcement
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ann.title}</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Target: {ann.target_audience} • Category: {ann.category}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                    {ann.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGS & ROLES MODULE */}
      {(activeTab === 'Roles & Permissions' || activeTab === 'System & Audit Logs') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Administrative Audit Trail Logs</h3>
            <p className="text-xs text-slate-500">Historical trail of all administrative actions in the system</p>
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-600">{log.action}</span> - <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                  <div className="text-[10px] text-slate-400">By {log.admin_name} ({log.admin_email})</div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN UTILITIES & AI ASSISTANT MODULE */}
      {activeTab === 'Admin Utilities' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> AI Admin Assistant (Gemini Powered)
            </h3>
            <p className="text-xs text-slate-500">Draft official notices, circulars, emails, and report summaries</p>
          </div>

          <div className="space-y-3 max-w-xl text-xs">
            <div>
              <label className="font-bold text-slate-500 mb-1 block">Assistant Action</label>
              <select value={aiPromptType} onChange={(e) => setAiPromptType(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold">
                <option value="NOTICE_GENERATOR">Official Campus Notice Generator</option>
                <option value="SUMMARY">Executive Campus Report Summarizer</option>
                <option value="EMAIL">Professional Administrative Email Draft</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-500 mb-1 block">Topic / Key Points</label>
              <input type="text" placeholder="Topic details..." value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="w-full p-2.5 rounded-xl border text-xs" />
            </div>

            <button onClick={handleRunAiAssistant} disabled={aiLoading} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {aiLoading ? 'Generating content...' : 'Generate with AI'}
            </button>

            {aiResult && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
                {aiResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLASS INCHARGE MODAL */}
      {showInchargeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Assign Faculty as Class Incharge
              </h3>
              <button onClick={() => setShowInchargeModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 mb-1 block">Select Class / Section</label>
                <select value={selectedClassCode} onChange={(e) => setSelectedClassCode(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold">
                  <option value="">-- Choose Class --</option>
                  {classList.map((c) => (
                    <option key={c.id} value={c.class_code || c.class_name}>{c.class_name} ({c.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1 block">Select Faculty Member</label>
                <select value={selectedFacultyId} onChange={(e) => setSelectedFacultyId(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold">
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.faculty_name} ({f.department}) - Emp ID: {f.employee_id}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowInchargeModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
              <button onClick={handleAssignIncharge} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1">
                Assign Class Incharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH ANNOUNCEMENT MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" /> Publish Campus Announcement
              </h3>
              <button onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 mb-1 block">Notice Title</label>
                <input type="text" placeholder="Title..." value={newAnn.title} onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1 block">Description</label>
                <textarea rows={3} placeholder="Notice details..." value={newAnn.description} onChange={(e) => setNewAnn({ ...newAnn, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowAnnModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
              <button onClick={handlePublishAnnouncement} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CREATE ADMINISTRATOR MODAL */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-500" /> Create Administrator Credential
              </h3>
              <button onClick={() => setShowCreateAdminModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Admin Official Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. SMB"
                    value={newAdminForm.fullName}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Official Admin Email *</label>
                  <input
                    type="email"
                    placeholder="admin@nexus.edu"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newAdminForm.mobile}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Admin Department</label>
                  <select
                    value={newAdminForm.department}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="Central Administration">Central Administration</option>
                    <option value="Academic Affairs & Deanship">Academic Affairs & Deanship</option>
                    <option value="Student Safety & Welfare Cell">Student Safety & Welfare Cell</option>
                    <option value="IT Infrastructure & Systems">IT Infrastructure & Systems</option>
                    <option value="Finance & Accounts Office">Finance & Accounts Office</option>
                    <option value="Examination & Evaluation Cell">Examination & Evaluation Cell</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Access Privilege Level</label>
                  <select
                    value={newAdminForm.accessLevel}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, accessLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Academic Admin">Academic Admin</option>
                    <option value="Safety Authority">Safety Authority</option>
                    <option value="Finance Admin">Finance Admin</option>
                    <option value="Standard Admin">Standard Admin</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Account Password *</label>
                  <input
                    type="password"
                    placeholder="Password..."
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowCreateAdminModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
              <button onClick={handleCreateAdmin} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs">
                Create Administrator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
