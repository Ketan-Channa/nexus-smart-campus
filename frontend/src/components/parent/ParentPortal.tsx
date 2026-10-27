import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  User,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { CaptainChatbot } from '../ai/CaptainChatbot';
import { initializeSocket, getSocket } from '../../services/socketService';
import { type UserSession } from '../../types/auth';

// Navigation & Types
import { ParentSidebar, type ParentTabType, type LinkedStudent } from './ParentSidebar';

// 22 Master Ecosystem Modules
import { ParentOverviewDashboard } from './ParentOverviewDashboard';
import { ParentChildrenView } from './ParentChildrenView';
import { ParentAcademicsTimetable } from './ParentAcademicsTimetable';
import { ParentAttendanceView } from './ParentAttendanceView';
import { ParentExamsResults } from './ParentExamsResults';
import { ParentAssignmentsView } from './ParentAssignmentsView';
import { ParentConnectCentral } from './ParentConnectCentral';
import { ParentFacultyMeetings } from './ParentFacultyMeetings';
import { ParentStudentApprovals } from './ParentStudentApprovals';
import { ParentStudentSafety } from './ParentStudentSafety';
import { ParentEventsView } from './ParentEventsView';
import { ParentAnnouncementsView } from './ParentAnnouncementsView';
import { ParentPaymentsView } from './ParentPaymentsView';
import { ParentHostelTransport } from './ParentHostelTransport';
import { ParentAlumniCareer } from './ParentAlumniCareer';
import { ParentMessagingStudio } from './ParentMessagingStudio';
import { ParentFeedbackView } from './ParentFeedbackView';
import { ParentNotificationsCenter } from './ParentNotificationsCenter';
import { ParentDocumentsView } from './ParentDocumentsView';
import { ParentProfileManager } from './ParentProfileManager';
import { ParentSettingsPrivacy } from './ParentSettingsPrivacy';
import { ParentHelpAbout } from './ParentHelpAbout';

interface ParentPortalProps {
  session: UserSession;
  onLogout: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ParentTabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [childrenList, setChildrenList] = useState<LinkedStudent[]>([]);
  const [selectedChild, setSelectedChild] = useState<LinkedStudent | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  // Live badge counts
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [upcomingMeetingsCount, setUpcomingMeetingsCount] = useState(0);
  const [pendingFeesCount, setPendingFeesCount] = useState(0);

  // Realtime notification banner
  const [liveToast, setLiveToast] = useState<{ message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const parentEmail =
    session?.email ||
    (session as any)?.user?.email ||
    (session as any)?.loginId ||
    'Ravi@gmail.com';

  const parentName =
    session?.name ||
    (session as any)?.user?.name ||
    'Parent Guardian';

  // Fetch verified linked children
  const fetchChildren = useCallback(async () => {
    setLoadingChildren(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/parent/children?email=${encodeURIComponent(parentEmail)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.children)) {
        setChildrenList(json.children);
        // Retain current selection if valid, or pick the first child
        setSelectedChild((prev) => {
          if (prev && json.children.some((c: LinkedStudent) => c.roll_number === prev.roll_number)) {
            return prev;
          }
          return json.children[0] || null;
        });
      }
    } catch (err) {
      console.error('Failed to load linked children:', err);
    } finally {
      setLoadingChildren(false);
    }
  }, [parentEmail]);

  // Fetch pending badge counts for selected child
  const fetchBadgeCounts = useCallback(async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    try {
      const [apprRes, meetRes, payRes] = await Promise.all([
        fetch(
          `https://nexus-smart-campus-backend.onrender.com/api/parent/approvals?email=${encodeURIComponent(
            parentEmail
          )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
        ),
        fetch(
          `https://nexus-smart-campus-backend.onrender.com/api/parent/meetings?email=${encodeURIComponent(
            parentEmail
          )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
        ),
        fetch(
          `https://nexus-smart-campus-backend.onrender.com/api/parent/payments?email=${encodeURIComponent(
            parentEmail
          )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
        ),
      ]);

      const [apprJson, meetJson, payJson] = await Promise.all([
        apprRes.json(),
        meetRes.json(),
        payRes.json(),
      ]);

      if (apprJson.success) {
        const pendingCards = (apprJson.approvals?.cards || []).filter((c: any) => c.approval_status === 'Pending').length;
        const pendingMed = (apprJson.approvals?.medical || []).filter((m: any) => m.status === 'Pending' || m.approval_status === 'Pending').length;
        setPendingApprovalsCount(pendingCards + pendingMed);
      }

      if (meetJson.success && Array.isArray(meetJson.meetings)) {
        const upcoming = meetJson.meetings.filter(
          (m: any) => m.status === 'Scheduled' || m.status === 'Confirmed' || m.status === 'Pending'
        ).length;
        setUpcomingMeetingsCount(upcoming);
      }

      if (payJson.success && Array.isArray(payJson.feeBreakdown)) {
        const dues = payJson.feeBreakdown.filter((f: any) => f.status === 'Pending' || f.status === 'Due').length;
        setPendingFeesCount(dues);
      }
    } catch (err) {
      console.warn('Failed to refresh parent badge counts:', err);
    }
  }, [parentEmail, selectedChild]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    if (selectedChild) {
      fetchBadgeCounts();
    }
  }, [selectedChild, fetchBadgeCounts]);

  // Initialize Socket.IO Realtime connection and rooms
  useEffect(() => {
    const socket = initializeSocket(session);

    if (socket) {
      // Join guardian channel & user channel
      socket.emit('join', { room: `parent:${parentEmail}` });
      socket.emit('join', { room: `user:${parentEmail}` });
      if (selectedChild?.roll_number) {
        socket.emit('join', { room: `student:${selectedChild.roll_number}` });
      }

      // Realtime event listeners
      const handleMeetingEvent = (payload: any) => {
        setLiveToast({
          message: `Parent Connect: ${payload?.message || 'A meeting status was updated by faculty.'}`,
          type: 'info',
        });
        fetchBadgeCounts();
      };

      const handleMarksPublished = (payload: any) => {
        setLiveToast({
          message: `Exams & Results: New official marks published for ${payload?.subject || 'your child'}.`,
          type: 'success',
        });
      };

      const handleAttendanceUpdated = (payload: any) => {
        setLiveToast({
          message: `Attendance: Session recorded. Current status updated.`,
          type: 'info',
        });
      };

      const handleFeedbackReply = (payload: any) => {
        setLiveToast({
          message: `Liaison: Faculty responded to your feedback submission.`,
          type: 'info',
        });
      };

      const handleSafetyAlert = (payload: any) => {
        setLiveToast({
          message: `⚠️ Emergency Alert: Campus security dispatch received for ${payload?.student_name || 'student'}.`,
          type: 'alert',
        });
      };

      socket.on('parent:meeting_scheduled', handleMeetingEvent);
      socket.on('meeting:updated', handleMeetingEvent);
      socket.on('marks:published', handleMarksPublished);
      socket.on('attendance:updated', handleAttendanceUpdated);
      socket.on('parent:feedback_reply', handleFeedbackReply);
      socket.on('safety:alert', handleSafetyAlert);
      socket.on('parent:safety_alert', handleSafetyAlert);

      return () => {
        socket.off('parent:meeting_scheduled', handleMeetingEvent);
        socket.off('meeting:updated', handleMeetingEvent);
        socket.off('marks:published', handleMarksPublished);
        socket.off('attendance:updated', handleAttendanceUpdated);
        socket.off('parent:feedback_reply', handleFeedbackReply);
        socket.off('safety:alert', handleSafetyAlert);
        socket.off('parent:safety_alert', handleSafetyAlert);
      };
    }
  }, [parentEmail, selectedChild, fetchBadgeCounts, session]);

  // Auto-dismiss live toast after 6 seconds
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => setLiveToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans">
      {/* Realtime Toast Banner */}
      {liveToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slideIn">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-sm backdrop-blur-md ${
              liveToast.type === 'alert'
                ? 'bg-rose-500/90 text-white border-rose-600'
                : liveToast.type === 'success'
                ? 'bg-emerald-600/90 text-white border-emerald-700'
                : 'bg-indigo-600/90 text-white border-indigo-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <p className="font-medium text-xs leading-snug">{liveToast.message}</p>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Responsive Sidebar */}
      <ParentSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        onLogout={onLogout}
        parentName={parentName}
        childrenList={childrenList}
        selectedChild={selectedChild}
        onSelectChild={(child) => setSelectedChild(child)}
        pendingApprovalsCount={pendingApprovalsCount}
        upcomingMeetingsCount={upcomingMeetingsCount}
        pendingFeesCount={pendingFeesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 flex-shrink-0 bg-white/95 dark:bg-[#0b1222]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Platform Brand Title */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  NEXUS Parent Portal
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Live Ecosystem
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Guardian Academic & Administrative Governance</p>
              </div>
            </div>
          </div>

          {/* Child Switcher & Quick Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Active Child Context Switcher Dropdown */}
            {childrenList.length > 0 && selectedChild && (
              <div className="relative">
                <button
                  onClick={() => setChildDropdownOpen(!childDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-all text-left shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-bold text-xs flex-shrink-0">
                    {selectedChild.photograph_url ? (
                      <img
                        src={selectedChild.photograph_url}
                        alt={selectedChild.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedChild.full_name.charAt(0)
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                      {selectedChild.full_name}
                    </p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium leading-none">
                      Roll: {selectedChild.roll_number} • {selectedChild.class || 'CSE-A'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500 ml-1" />
                </button>

                {childDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3 py-1.5">
                      Switch Active Ward
                    </p>
                    <div className="space-y-1">
                      {childrenList.map((child) => (
                        <button
                          key={child.roll_number}
                          onClick={() => {
                            setSelectedChild(child);
                            setChildDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                            selectedChild.roll_number === child.roll_number
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                            {child.photograph_url ? (
                              <img src={child.photograph_url} alt={child.full_name} className="w-full h-full object-cover" />
                            ) : (
                              child.full_name.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{child.full_name}</p>
                            <p className="text-[10px] text-slate-500 truncate">Roll: {child.roll_number} • {child.department}</p>
                          </div>
                          {selectedChild.roll_number === child.roll_number && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setActiveTab('children');
                          setChildDropdownOpen(false);
                        }}
                        className="w-full text-center py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Manage / Link Another Child
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Notifications shortcut */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications Center"
            >
              <Bell className="w-5 h-5" />
              {(pendingApprovalsCount > 0 || upcomingMeetingsCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>

            {/* Captain AI Assistant */}
            <CaptainChatbot
              session={session}
              studentRoll={selectedChild?.roll_number}
              variant="header"
            />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Guardian Profile shortcut */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              title="My Guardian Profile"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {parentName.charAt(0)}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[120px]">
                  {parentName}
                </p>
                <p className="text-[10px] text-slate-500 leading-none">Guardian Account</p>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Secure Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <ParentOverviewDashboard
                parentEmail={parentEmail}
                selectedChild={selectedChild}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'children' && (
              <ParentChildrenView
                parentEmail={parentEmail}
                childrenList={childrenList}
                selectedChild={selectedChild}
                onSelectChild={setSelectedChild}
                onRefreshChildren={fetchChildren}
              />
            )}

            {activeTab === 'academics' && (
              <ParentAcademicsTimetable
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'attendance' && (
              <ParentAttendanceView
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'exams' && (
              <ParentExamsResults
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'assignments' && (
              <ParentAssignmentsView
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'parent-connect' && (
              <ParentConnectCentral
                parentEmail={parentEmail}
                selectedChild={selectedChild}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'meetings' && (
              <ParentFacultyMeetings
                parentEmail={parentEmail}
                parentName={parentName}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'approvals' && (
              <ParentStudentApprovals
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'safety' && (
              <ParentStudentSafety
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'events' && (
              <ParentEventsView
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'announcements' && (
              <ParentAnnouncementsView
                parentEmail={parentEmail}
              />
            )}

            {activeTab === 'payments' && (
              <ParentPaymentsView
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'hostel-transport' && (
              <ParentHostelTransport
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'alumni-career' && (
              <ParentAlumniCareer
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'messages' && (
              <ParentMessagingStudio
                parentEmail={parentEmail}
                parentName={parentName}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'feedback' && (
              <ParentFeedbackView
                parentEmail={parentEmail}
                parentName={parentName}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'notifications' && (
              <ParentNotificationsCenter
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'documents' && (
              <ParentDocumentsView
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'profile' && (
              <ParentProfileManager
                parentEmail={parentEmail}
                childrenList={childrenList}
              />
            )}

            {activeTab === 'settings' && (
              <ParentSettingsPrivacy
                parentEmail={parentEmail}
                selectedChild={selectedChild}
              />
            )}

            {activeTab === 'about-us' && (
              <ParentHelpAbout />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
