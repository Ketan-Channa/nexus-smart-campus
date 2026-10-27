import React, { useState, useEffect } from 'react';
import { FacultySidebar, type FacultyTabType } from './FacultySidebar';
import { FacultyDashboard } from './FacultyDashboard';
import { FacultyMyStudentsAndClasses } from './FacultyMyStudentsAndClasses';
import { FacultyAttendanceRegister } from './FacultyAttendanceRegister';
import { FacultyMedicalLeaveManager } from './FacultyMedicalLeaveManager';
import { FacultyAssignmentsAndWork } from './FacultyAssignmentsAndWork';
import { FacultyAnnouncementsManager } from './FacultyAnnouncementsManager';
import { FacultyUtilities } from './FacultyUtilities';
import { FacultyTimetableSchedule } from './FacultyTimetableSchedule';
import { FacultyExamsAndAnalytics } from './FacultyExamsAndAnalytics';
import { FacultyLeaveApplications } from './FacultyLeaveApplications';
import { FacultySafetyResponseCentre } from './FacultySafetyResponseCentre';
import { FacultyResearchCollaborations } from './FacultyResearchCollaborations';
import { FacultyProfile } from './FacultyProfile';
import { FacultyAboutUs } from './FacultyAboutUs';
import { FacultyParentConnect } from './FacultyParentConnect';
import { FacultyStudentApprovalsCentral } from './FacultyStudentApprovalsCentral';

// Shared Campus Life & Network Modules
import { EventsAndUpdates } from '../academics/EventsAndUpdates';
import { CanteenAndOffers } from '../academics/CanteenAndOffers';
import { HostelAndTransport } from '../academics/HostelAndTransport';
import { PaymentAndTransactions } from '../academics/PaymentAndTransactions';
import { ConnectionsModule } from '../academics/ConnectionsModule';
import { AlumniNetworkModule } from '../alumni/AlumniNetworkModule';

import { type UserSession } from '../../types/auth';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationBell } from '../notifications/NotificationBell';
import { CaptainChatbot } from '../ai/CaptainChatbot';
import { ChevronLeft, GraduationCap } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nexus-smart-campus-backend.onrender.com';

interface FacultyPortalProps {
  session: UserSession;
  onLogout: () => void;
}

export const FacultyPortal: React.FC<FacultyPortalProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<FacultyTabType>('dashboard');
  const [activeSosCount, setActiveSosCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const facultyName = session.name || 'Dr. SMB';
  const facultyEmail = session.email || 'faculty@nexus.edu';
  const facultyCode = (session as any).facultyCode || (session as any).teacherCode || (session as any).employeeId || 'SMB';
  const department = (session as any).department || 'Computer Science & Engineering';
  const designation = (session as any).designation || 'Associate Professor';
  const isClassIncharge = session.isClassIncharge || (session as any).is_class_incharge || 'No';
  const inchargeClass = session.inchargeClass || (session as any).incharge_class || 'BTECH CSE 4A';

  // Check for active Emergency SOS alerts periodically & update badge
  useEffect(() => {
    let isMounted = true;
    const fetchSosCount = async () => {
      try {
        const token = localStorage.getItem('nexus_token');
        const res = await axios.get(`${API_BASE_URL}/api/faculty/safety/active-alerts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (isMounted && res.data?.success && Array.isArray(res.data.alerts)) {
          setActiveSosCount(res.data.alerts.length);
        }
      } catch (err) {
        // Fallback gracefully
      }
    };

    const fetchApprovalsCount = async () => {
      try {
        const token = localStorage.getItem('nexus_token');
        const res = await axios.get(`${API_BASE_URL}/api/faculty/approvals/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (isMounted && res.data?.success && res.data.overview) {
          setPendingApprovalsCount(res.data.overview.pendingRequests || 0);
        }
      } catch (err) {}
    };

    fetchSosCount();
    fetchApprovalsCount();
    const interval = setInterval(() => {
      fetchSosCount();
      fetchApprovalsCount();
    }, 15000);

    const handleSosEvent = () => fetchSosCount();
    const handleApprovalEvent = () => fetchApprovalsCount();

    window.addEventListener('nexus:emergency_created', handleSosEvent);
    window.addEventListener('nexus:emergency_resolved', handleSosEvent);
    window.addEventListener('nexus:approval_updated', handleApprovalEvent);
    window.addEventListener('approval.decision_updated', handleApprovalEvent);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('nexus:emergency_created', handleSosEvent);
      window.removeEventListener('nexus:emergency_resolved', handleSosEvent);
      window.removeEventListener('nexus:approval_updated', handleApprovalEvent);
      window.removeEventListener('approval.decision_updated', handleApprovalEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* STATIC NON-SCROLLABLE SIDEBAR WITH ALL MODULES */}
      <FacultySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        facultyName={facultyName}
        department={department}
        isClassIncharge={isClassIncharge}
        inchargeClass={inchargeClass}
        activeSosCount={activeSosCount}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* MAIN CONTAINER (WITH TOP NAVBAR) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-14 px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0a0d16]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="Back to Dashboard"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-600/30 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>

            <h1 className="font-display font-black text-base tracking-tight text-slate-900 dark:text-white">
              NEXUS Faculty Portal
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell variant="circular" />
            <ThemeToggle />
            <CaptainChatbot session={session} variant="header" />
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT VIEW */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <FacultyDashboard
              facultyName={facultyName}
              department={department}
              designation={designation}
              setActiveTab={setActiveTab}
            />
          )}

          {/* 2. ACADEMICS & TIMETABLE */}
          {activeTab === 'timetable' && (
            <FacultyTimetableSchedule
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              facultyCode={facultyCode}
              inchargeClass={inchargeClass}
              onNavigateToAttendance={() => setActiveTab('attendance')}
              onNavigateToAssignments={() => setActiveTab('assignments')}
              onNavigateToStudents={() => setActiveTab('my-students-classes')}
            />
          )}

          {/* 3. MY STUDENTS & CLASSES */}
          {activeTab === 'my-students-classes' && (
            <FacultyMyStudentsAndClasses
              isClassIncharge={isClassIncharge}
              inchargeClass={inchargeClass}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
            />
          )}

          {/* 4. ATTENDANCE REGISTER */}
          {activeTab === 'attendance' && (
            <FacultyAttendanceRegister
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              inchargeClass={inchargeClass}
            />
          )}

          {/* 5. ASSIGNMENTS & WORK */}
          {activeTab === 'assignments' && (
            <FacultyAssignmentsAndWork
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              inchargeClass={inchargeClass}
            />
          )}

          {/* 6. EXAMS & RESULTS ANALYTICS */}
          {activeTab === 'exams-analytics' && (
            <FacultyExamsAndAnalytics
              session={session}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              inchargeClass={inchargeClass}
            />
          )}

          {/* STUDENT APPROVALS CENTRAL WORKSPACE */}
          {(activeTab === 'student-approvals' || (activeTab as any) === 'medical-leaves') && (
            <FacultyStudentApprovalsCentral
              session={session}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              department={department}
            />
          )}

          {/* 8. FACULTY LEAVE APPLICATIONS */}
          {activeTab === 'faculty-leaves' && (
            <FacultyLeaveApplications
              session={session}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              department={department}
            />
          )}

          {/* 9. STUDENT SAFETY RESPONSE CENTRE */}
          {activeTab === 'safety-response' && (
            <FacultySafetyResponseCentre
              session={session}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
            />
          )}

          {/* 10. ANNOUNCEMENTS & ALERTS */}
          {activeTab === 'announcements' && (
            <FacultyAnnouncementsManager session={session} />
          )}

          {/* 11. EVENTS & UPDATES */}
          {activeTab === 'events-updates' && (
            <EventsAndUpdates session={session} />
          )}

          {/* 12. CANTEEN & OFFERS (WITH CABIN DELIVERY) */}
          {activeTab === 'canteen' && (
            <CanteenAndOffers session={session} />
          )}

          {/* 13. HOSTEL & TRANSPORT */}
          {activeTab === 'hostel-transport' && (
            <HostelAndTransport session={session} />
          )}

          {/* 14. PAYMENT & TRANSACTIONS */}
          {activeTab === 'payments' && (
            <PaymentAndTransactions session={session} />
          )}

          {/* 15. FACULTY UTILITIES */}
          {activeTab === 'utilities' && (
            <FacultyUtilities
              session={session}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              department={department}
            />
          )}

          {/* PARENT CONNECT WORKSPACE */}
          {activeTab === 'parent-connect' && (
            <FacultyParentConnect
              session={session}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              department={department}
              inchargeClass={inchargeClass}
            />
          )}

          {/* 16. CONNECTIONS NETWORK */}
          {activeTab === 'connections' && (
            <ConnectionsModule session={session} />
          )}

          {/* 17. COLLEGE ALUMNI CONNECT */}
          {activeTab === 'alumni-connect' && (
            <AlumniNetworkModule userRole="Faculty" currentUser={session} />
          )}

          {/* 18. RESEARCH & COLLABORATIONS */}
          {activeTab === 'research' && (
            <FacultyResearchCollaborations
              session={session}
              facultyName={facultyName}
              facultyEmail={facultyEmail}
              department={department}
            />
          )}

          {/* 19. MY FACULTY PROFILE */}
          {activeTab === 'profile' && (
            <FacultyProfile
              session={session}
              facultyName={facultyName}
              department={department}
              designation={designation}
              email={facultyEmail}
            />
          )}

          {/* 20. ABOUT NEXUS PLATFORM */}
          {activeTab === 'about-us' && (
            <FacultyAboutUs />
          )}
        </main>
      </div>
    </div>
  );
};
