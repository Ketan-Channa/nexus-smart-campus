import React, { useState, useEffect } from 'react';
import {
  Users,
  Network,
  MessageSquare,
  Award,
  Briefcase,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Plus,
  Send,
  Building2,
  GraduationCap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { type AlumniTabType } from './AlumniSidebar';

interface AlumniOverviewDashboardProps {
  session: any;
  onNavigateTab: (tab: AlumniTabType) => void;
  verificationStatus?: string;
  alumniId?: string | null;
}

export const AlumniOverviewDashboard: React.FC<AlumniOverviewDashboardProps> = ({
  session,
  onNavigateTab,
  verificationStatus = 'PENDING',
  alumniId = null,
}) => {
  const alumniEmail = session?.email || '';
  const alumniName = session?.name || 'Alumnus';

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [mentorshipRequestsCount, setMentorshipRequestsCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [alumniEmail]);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const profRes = await fetch(`http://localhost:5000/api/alumni/profile/${encodeURIComponent(alumniEmail)}`);
      const profData = await profRes.json();
      if (profData.status === 'success' && profData.alumni) {
        setProfileData(profData.alumni);
      }

      // 2. Fetch Connections & Requests
      const connRes = await fetch(`http://localhost:5000/api/connections/requests?userEmail=${encodeURIComponent(alumniEmail)}`);
      const connData = await connRes.json();
      if (connData.status === 'success') {
        setConnectionsCount((connData.friends || []).length);
        setPendingRequestsCount((connData.incomingRequests || []).length);
      }

      // 3. Fetch Mentorship Requests
      const mentorRes = await fetch(`http://localhost:5000/api/alumni/mentorship/requests?userEmail=${encodeURIComponent(alumniEmail)}`);
      const mentorData = await mentorRes.json();
      if (mentorData.status === 'success') {
        const pending = (mentorData.requests || []).filter((r: any) => r.status === 'PENDING');
        setMentorshipRequestsCount(pending.length);
      }

      // 4. Fetch Jobs
      const jobsRes = await fetch('http://localhost:5000/api/alumni/jobs');
      const jobsData = await jobsRes.json();
      if (jobsData.status === 'success') {
        setJobsCount((jobsData.jobs || []).length);
      }

      // 5. Fetch Referrals
      const refRes = await fetch(`http://localhost:5000/api/alumni/referrals?userEmail=${encodeURIComponent(alumniEmail)}`);
      const refData = await refRes.json();
      if (refData.status === 'success') {
        const pendingRef = (refData.referrals || []).filter((r: any) => r.status === 'PENDING');
        setReferralsCount(pendingRef.length);
      }

      // 6. Fetch Sessions
      const sessRes = await fetch(`http://localhost:5000/api/alumni/mentorship/sessions?userEmail=${encodeURIComponent(alumniEmail)}`);
      const sessData = await sessRes.json();
      if (sessData.status === 'success') {
        const scheduled = (sessData.sessions || []).filter((s: any) => s.status === 'SCHEDULED');
        setSessionsCount(scheduled.length);
      }

      // 7. Fetch Events
      const evRes = await fetch('http://localhost:5000/api/alumni/events');
      const evData = await evRes.json();
      if (evData.status === 'success') {
        setUpcomingEvents((evData.events || []).slice(0, 3));
      }
    } catch (e) {
      console.error('Error fetching dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Profile Completion Percentage
  const calculateProfileCompletion = () => {
    if (!profileData) return 50;
    let score = 20; // base registered
    if (profileData.current_company) score += 15;
    if (profileData.current_designation) score += 15;
    if (profileData.skills) score += 15;
    if (profileData.bio) score += 15;
    if (profileData.linkedin_url || profileData.github_url) score += 10;
    if (profileData.photograph_url) score += 10;
    return Math.min(score, 100);
  };

  const completionPercent = calculateProfileCompletion();
  const isVerified = verificationStatus === 'VERIFIED';

  const kpis = [
    {
      title: 'My Connections',
      value: connectionsCount,
      sub: 'Students & Alumni',
      icon: Network,
      color: 'from-blue-600 to-indigo-600',
      tab: 'connections' as AlumniTabType,
    },
    {
      title: 'Connection Requests',
      value: pendingRequestsCount,
      sub: pendingRequestsCount > 0 ? 'Action required' : 'Up to date',
      icon: Users,
      color: 'from-indigo-600 to-purple-600',
      badge: pendingRequestsCount > 0 ? 'Pending' : undefined,
      tab: 'connections' as AlumniTabType,
    },
    {
      title: 'Mentorship Requests',
      value: mentorshipRequestsCount,
      sub: mentorshipRequestsCount > 0 ? 'Awaiting response' : 'No pending',
      icon: Award,
      color: 'from-purple-600 to-pink-600',
      badge: mentorshipRequestsCount > 0 ? 'Action Needed' : undefined,
      tab: 'mentorship' as AlumniTabType,
    },
    {
      title: 'Scheduled Sessions',
      value: sessionsCount,
      sub: 'Active bookings',
      icon: Clock,
      color: 'from-pink-600 to-rose-600',
      tab: 'meetings' as AlumniTabType,
    },
    {
      title: 'Active Job Listings',
      value: jobsCount,
      sub: 'Campus board',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-600',
      tab: 'jobs' as AlumniTabType,
    },
    {
      title: 'Referral Requests',
      value: referralsCount,
      sub: referralsCount > 0 ? 'Students applied' : 'No new requests',
      icon: Share2,
      color: 'from-amber-600 to-orange-600',
      badge: referralsCount > 0 ? 'New' : undefined,
      tab: 'referrals' as AlumniTabType,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HERO BANNER */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden shadow-2xl border border-indigo-700/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/15">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />
              <span>NEXUS Alumni Portal • Class of {profileData?.graduation_year || session?.graduationYear || '2023'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight">
              Welcome back, {alumniName}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
              {profileData?.current_designation && profileData?.current_company
                ? `${profileData.current_designation} at ${profileData.current_company}`
                : 'Connect with students, mentor aspiring professionals, post job referrals, and stay engaged with NEXUS campus.'}
            </p>
          </div>

          {/* Verification Badge */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {isVerified ? (
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-2 text-xs font-bold shadow-lg backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified NEXUS Alumni</span>
                {alumniId && <span className="font-mono text-[11px] opacity-80">({alumniId})</span>}
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-2 text-xs font-bold shadow-lg backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Verification Pending Review</span>
              </div>
            )}

            <button
              onClick={() => onNavigateTab('profile')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <span>Edit Professional Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1 max-w-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-200">Profile Completeness</span>
              <span className="font-black text-white">{completionPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          {completionPercent < 100 && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-xs text-cyan-300 font-bold hover:underline shrink-0"
            >
              Add skills, experience & links to reach 100% →
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-purple-500 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                {kpi.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-pulse">
                    {kpi.badge}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="text-2xl font-display font-black text-slate-900 dark:text-white">
                  {kpi.value}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                  {kpi.title}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {kpi.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. QUICK ACTIONS & ENGAGEMENT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Quick Actions
            </h3>
            <span className="text-xs text-slate-400">One-click hubs</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('jobs')}
              className="w-full p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Post Job / Internship
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Share hiring openings with students</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('mentorship')}
              className="w-full p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-900/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Review Mentorship Requests
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Guide campus students towards career success</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('directory')}
              className="w-full p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Browse Alumni Directory
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Search batchmates and industry colleagues</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('guest-lectures')}
              className="w-full p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-100 dark:border-amber-900/60 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Propose Guest Lecture
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Host webinars or technical workshops</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Upcoming Events & Reunions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Upcoming Campus Events & Reunions
              </h3>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View All Events</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">No scheduled campus events currently published.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-purple-600 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {evt.category || 'Alumni Reunion'}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {evt.event_date || evt.start_date || 'Upcoming'}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                        {evt.event_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Venue: {evt.venue || 'Campus Auditorium'} • Attendees: {evt.registered_count || 1}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('events')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all shadow-sm"
                    >
                      RSVP / Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Synchronized across Student & Faculty Portals</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Realtime MySQL Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
