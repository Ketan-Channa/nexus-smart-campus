import React from 'react';
import {
  LayoutDashboard,
  User,
  Search,
  Network,
  MessageSquare,
  Award,
  Compass,
  Briefcase,
  Share2,
  Atom,
  Users2,
  Calendar,
  Bell,
  Mic,
  HeartHandshake,
  Clock,
  FileCheck,
  BellRing,
  Activity,
  Shield,
  Info,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export type AlumniTabType =
  | 'dashboard'
  | 'profile'
  | 'directory'
  | 'connections'
  | 'messages'
  | 'mentorship'
  | 'career-guidance'
  | 'jobs'
  | 'referrals'
  | 'research'
  | 'community'
  | 'events'
  | 'announcements'
  | 'guest-lectures'
  | 'contributions'
  | 'meetings'
  | 'documents'
  | 'notifications'
  | 'activity'
  | 'settings'
  | 'about-us';

interface AlumniSidebarProps {
  activeTab: AlumniTabType;
  setActiveTab: (tab: AlumniTabType) => void;
  onLogout: () => void;
  alumniName?: string;
  department?: string;
  graduationYear?: string;
  alumniId?: string | null;
  verificationStatus?: string;
  unreadMessagesCount?: number;
  pendingRequestsCount?: number;
  pendingMentorshipCount?: number;
  referralsCount?: number;
}

export const AlumniSidebar: React.FC<AlumniSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  alumniName = 'Alumnus',
  department = 'Computer Science',
  graduationYear = '2023',
  alumniId = null,
  verificationStatus = 'PENDING',
  unreadMessagesCount = 0,
  pendingRequestsCount = 0,
  pendingMentorshipCount = 0,
  referralsCount = 0,
}) => {
  const isVerified = verificationStatus === 'VERIFIED';

  const navSections = [
    {
      title: 'CORE & IDENTITY',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'Alumni Profile', icon: User },
        { id: 'directory', label: 'Alumni Directory', icon: Search },
        {
          id: 'connections',
          label: 'Connections',
          icon: Network,
          badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined,
          badgeColor: 'bg-indigo-500 text-white font-bold',
        },
        {
          id: 'messages',
          label: 'Messages & Chat',
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
          badgeColor: 'bg-emerald-500 text-white font-bold',
        },
      ],
    },
    {
      title: 'STUDENT & CAREER ENGAGEMENT',
      items: [
        {
          id: 'mentorship',
          label: 'Student Mentorship',
          icon: Award,
          badge: pendingMentorshipCount > 0 ? `${pendingMentorshipCount}` : undefined,
          badgeColor: 'bg-purple-500 text-white font-bold',
        },
        { id: 'career-guidance', label: 'Career Guidance', icon: Compass },
        { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
        {
          id: 'referrals',
          label: 'Referrals',
          icon: Share2,
          badge: referralsCount > 0 ? `${referralsCount}` : undefined,
          badgeColor: 'bg-amber-500 text-white font-bold',
        },
      ],
    },
    {
      title: 'CAMPUS LIFE & COLLABORATION',
      items: [
        { id: 'research', label: 'Research & Collaborations', icon: Atom },
        { id: 'community', label: 'Alumni Community', icon: Users2 },
        { id: 'events', label: 'Events & Invitations', icon: Calendar },
        { id: 'announcements', label: 'Announcements & Updates', icon: Bell },
        { id: 'guest-lectures', label: 'Guest Lectures & Engagement', icon: Mic },
        { id: 'contributions', label: 'Contributions & Volunteering', icon: HeartHandshake },
        { id: 'meetings', label: 'Meetings & Appointments', icon: Clock },
      ],
    },
    {
      title: 'RECORDS & ACCOUNT',
      items: [
        { id: 'documents', label: 'Documents & Achievements', icon: FileCheck },
        { id: 'notifications', label: 'Notifications', icon: BellRing },
        { id: 'activity', label: 'My Activity', icon: Activity },
        { id: 'settings', label: 'Privacy & Settings', icon: Shield },
        { id: 'about-us', label: 'Help & About Us', icon: Info },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-[#0a0d16] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 text-slate-700 dark:text-slate-300 select-none overflow-hidden shrink-0 transition-colors">
      <div className="p-4 space-y-3 overflow-hidden flex flex-col pt-3 flex-1 min-h-0">
        {/* Alumni Profile Header Badge */}
        <div
          onClick={() => setActiveTab('profile')}
          className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0">
              {alumniName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                  {alumniName}
                </span>
                {isVerified ? (
                  <span title="Verified Alumni"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /></span>
                ) : (
                  <span title="Verification Pending"><AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /></span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Class of {graduationYear} • {department}
              </p>
              {alumniId && (
                <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {alumniId}
                </span>
              )}
            </div>
          </div>
          <div className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
            Alumni
          </div>
        </div>

        {/* Verification Status Warning if Pending */}
        {!isVerified && (
          <div
            onClick={() => setActiveTab('settings')}
            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center gap-2 text-[11px] cursor-pointer hover:bg-amber-500/15 transition-all shrink-0"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="font-semibold truncate">
              {verificationStatus === 'UNDER_REVIEW'
                ? 'Profile Under Review'
                : verificationStatus === 'CLARIFICATION_REQUIRED'
                ? 'Clarification Needed'
                : 'Pending Institutional Verification'}
            </span>
          </div>
        )}

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AlumniTabType)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-purple-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-indigo-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Footer Button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Alumni Portal</span>
        </button>
      </div>
    </aside>
  );
};
