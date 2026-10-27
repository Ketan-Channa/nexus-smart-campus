import React, { useState, useEffect } from 'react';
import { AlumniSidebar, type AlumniTabType } from './AlumniSidebar';
import { AlumniOverviewDashboard } from './AlumniOverviewDashboard';
import { AlumniProfileManager } from './AlumniProfileManager';
import { AlumniDirectoryView } from './AlumniDirectoryView';
import { AlumniConnectionsCentral } from './AlumniConnectionsCentral';
import { AlumniMessagingStudio } from './AlumniMessagingStudio';
import { AlumniMentorshipCentral } from './AlumniMentorshipCentral';
import { AlumniCareerGuidance } from './AlumniCareerGuidance';
import { AlumniJobBoardCentral } from './AlumniJobBoardCentral';
import { AlumniReferralsStudio } from './AlumniReferralsStudio';
import { AlumniResearchCollaborations } from './AlumniResearchCollaborations';
import { AlumniCommunityFeed } from './AlumniCommunityFeed';
import { AlumniEventsAndReunions } from './AlumniEventsAndReunions';
import { AlumniAnnouncementsView } from './AlumniAnnouncementsView';
import { AlumniGuestLectures } from './AlumniGuestLectures';
import { AlumniContributionsManager } from './AlumniContributionsManager';
import { AlumniMeetingsScheduler } from './AlumniMeetingsScheduler';
import { AlumniDocumentsVault } from './AlumniDocumentsVault';
import { AlumniNotificationsCentre } from './AlumniNotificationsCentre';
import { AlumniMyActivity } from './AlumniMyActivity';
import { AlumniSettingsAndPrivacy } from './AlumniSettingsAndPrivacy';
import { AlumniHelpAndAbout } from './AlumniHelpAndAbout';

import { ThemeToggle } from '../ThemeToggle';
import { NotificationBell } from '../notifications/NotificationBell';
import { CaptainChatbot } from '../ai/CaptainChatbot';
import { ChevronLeft, GraduationCap, ShieldCheck, AlertCircle } from 'lucide-react';
import { type UserSession } from '../../types/auth';

interface AlumniPortalProps {
  session: UserSession;
  onLogout: () => void;
}

export const AlumniPortal: React.FC<AlumniPortalProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AlumniTabType>('dashboard');
  const [chatTargetEmail, setChatTargetEmail] = useState<string | null>(null);
  const [chatTargetName, setChatTargetName] = useState<string | null>(null);

  // Verification & Counters
  const [verificationStatus, setVerificationStatus] = useState<string>(
    (session as any).verificationStatus || 'PENDING'
  );
  const [alumniId, setAlumniId] = useState<string | null>(
    (session as any).alumniId || null
  );

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingMentorshipCount, setPendingMentorshipCount] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);

  const alumniEmail = session?.email || '';
  const alumniName = session?.name || 'Alumnus';
  const department = (session as any).department || 'Computer Science';
  const graduationYear = (session as any).graduationYear || '2023';

  // Check verification and badges
  useEffect(() => {
    fetchStatusAndBadges();
  }, [alumniEmail]);

  // Realtime Listeners for dynamic updates
  useEffect(() => {
    const handleVerifUpdated = (e: any) => {
      const data = e.detail || e;
      if (data.email && data.email.toLowerCase() === alumniEmail.toLowerCase()) {
        if (data.status) setVerificationStatus(data.status);
        if (data.alumniId) setAlumniId(data.alumniId);
      }
      fetchStatusAndBadges();
    };

    const handleReq = () => fetchStatusAndBadges();
    const handleMsg = () => fetchStatusAndBadges();
    const handleMtr = () => fetchStatusAndBadges();

    window.addEventListener('alumni.verification.updated', handleVerifUpdated);
    window.addEventListener('connection.requested', handleReq);
    window.addEventListener('message.created', handleMsg);
    window.addEventListener('mentorship.requested', handleMtr);

    return () => {
      window.removeEventListener('alumni.verification.updated', handleVerifUpdated);
      window.removeEventListener('connection.requested', handleReq);
      window.removeEventListener('message.created', handleMsg);
      window.removeEventListener('mentorship.requested', handleMtr);
    };
  }, [alumniEmail]);

  const fetchStatusAndBadges = async () => {
    if (!alumniEmail) return;
    try {
      // 1. Verification status
      const vRes = await fetch(`http://localhost:5000/api/alumni/verification-status/${encodeURIComponent(alumniEmail)}`);
      const vData = await vRes.json();
      if (vData.status === 'success' && vData.verification) {
        setVerificationStatus(vData.verification.verification_status);
        setAlumniId(vData.verification.alumni_id);
      }

      // 2. Connections count
      const cRes = await fetch(`http://localhost:5000/api/connections/requests?userEmail=${encodeURIComponent(alumniEmail)}`);
      const cData = await cRes.json();
      if (cData.status === 'success') {
        setPendingRequestsCount((cData.incomingRequests || []).length);
      }

      // 3. Mentorship count
      const mRes = await fetch(`http://localhost:5000/api/alumni/mentorship/requests?userEmail=${encodeURIComponent(alumniEmail)}`);
      const mData = await mRes.json();
      if (mData.status === 'success') {
        const pending = (mData.requests || []).filter((r: any) => r.status === 'PENDING');
        setPendingMentorshipCount(pending.length);
      }

      // 4. Referrals count
      const rRes = await fetch(`http://localhost:5000/api/alumni/referrals?userEmail=${encodeURIComponent(alumniEmail)}`);
      const rData = await rRes.json();
      if (rData.status === 'success') {
        const pendingRef = (rData.referrals || []).filter((r: any) => r.status === 'PENDING');
        setReferralsCount(pendingRef.length);
      }
    } catch (e) {
      // Ignore network errors
    }
  };

  const handleOpenChat = (targetEmail: string, targetName: string) => {
    setChatTargetEmail(targetEmail);
    setChatTargetName(targetName);
    setActiveTab('messages');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* 1. DEDICATED ALUMNI SIDEBAR (21 MODULES) */}
      <AlumniSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        alumniName={alumniName}
        department={department}
        graduationYear={graduationYear}
        alumniId={alumniId}
        verificationStatus={verificationStatus}
        unreadMessagesCount={unreadMessagesCount}
        pendingRequestsCount={pendingRequestsCount}
        pendingMentorshipCount={pendingMentorshipCount}
        referralsCount={referralsCount}
      />

      {/* 2. MAIN CONTAINER */}
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

            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>

            <h1 className="font-display font-black text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>NEXUS Alumni Portal</span>
              {verificationStatus === 'VERIFIED' && (
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Verified
                </span>
              )}
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
          {/* MODULE 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <AlumniOverviewDashboard
              session={session}
              onNavigateTab={setActiveTab}
              verificationStatus={verificationStatus}
              alumniId={alumniId}
            />
          )}

          {/* MODULE 2: ALUMNI PROFILE */}
          {activeTab === 'profile' && (
            <AlumniProfileManager session={session} />
          )}

          {/* MODULE 3: ALUMNI DIRECTORY */}
          {activeTab === 'directory' && (
            <AlumniDirectoryView
              session={session}
              onOpenChatWithUser={handleOpenChat}
            />
          )}

          {/* MODULE 4: CONNECTIONS */}
          {activeTab === 'connections' && (
            <AlumniConnectionsCentral
              session={session}
              onOpenChatWithUser={handleOpenChat}
            />
          )}

          {/* MODULE 5: MESSAGES & CHAT */}
          {activeTab === 'messages' && (
            <AlumniMessagingStudio
              session={session}
              initialChatTargetEmail={chatTargetEmail}
              initialChatTargetName={chatTargetName}
            />
          )}

          {/* MODULE 6: STUDENT MENTORSHIP */}
          {activeTab === 'mentorship' && (
            <AlumniMentorshipCentral
              session={session}
              onOpenChatWithUser={handleOpenChat}
            />
          )}

          {/* MODULE 7: CAREER GUIDANCE */}
          {activeTab === 'career-guidance' && (
            <AlumniCareerGuidance session={session} />
          )}

          {/* MODULE 8: JOBS & INTERNSHIPS */}
          {activeTab === 'jobs' && (
            <AlumniJobBoardCentral
              session={session}
              onOpenReferralsTab={() => setActiveTab('referrals')}
            />
          )}

          {/* MODULE 9: REFERRALS */}
          {activeTab === 'referrals' && (
            <AlumniReferralsStudio
              session={session}
              onOpenChatWithUser={handleOpenChat}
            />
          )}

          {/* MODULE 10: RESEARCH & COLLABORATIONS */}
          {activeTab === 'research' && (
            <AlumniResearchCollaborations session={session} />
          )}

          {/* MODULE 11: ALUMNI COMMUNITY */}
          {activeTab === 'community' && (
            <AlumniCommunityFeed session={session} />
          )}

          {/* MODULE 12: EVENTS & INVITATIONS */}
          {activeTab === 'events' && (
            <AlumniEventsAndReunions session={session} />
          )}

          {/* MODULE 13: ANNOUNCEMENTS & UPDATES */}
          {activeTab === 'announcements' && (
            <AlumniAnnouncementsView />
          )}

          {/* MODULE 14: GUEST LECTURES & CAMPUS ENGAGEMENT */}
          {activeTab === 'guest-lectures' && (
            <AlumniGuestLectures session={session} />
          )}

          {/* MODULE 15: CONTRIBUTIONS & VOLUNTEERING */}
          {activeTab === 'contributions' && (
            <AlumniContributionsManager session={session} />
          )}

          {/* MODULE 16: MEETINGS & APPOINTMENTS */}
          {activeTab === 'meetings' && (
            <AlumniMeetingsScheduler session={session} />
          )}

          {/* MODULE 17: DOCUMENTS & ACHIEVEMENTS */}
          {activeTab === 'documents' && (
            <AlumniDocumentsVault session={session} />
          )}

          {/* MODULE 18: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <AlumniNotificationsCentre session={session} />
          )}

          {/* MODULE 19: MY ACTIVITY */}
          {activeTab === 'activity' && (
            <AlumniMyActivity session={session} />
          )}

          {/* MODULE 20: PRIVACY & SETTINGS */}
          {activeTab === 'settings' && (
            <AlumniSettingsAndPrivacy session={session} />
          )}

          {/* MODULE 21: HELP & ABOUT US */}
          {activeTab === 'about-us' && (
            <AlumniHelpAndAbout />
          )}
        </main>
      </div>
    </div>
  );
};
