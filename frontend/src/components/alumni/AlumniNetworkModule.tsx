import React, { useState, useEffect } from 'react';
import {
  Search, Filter, ShieldCheck, Briefcase, GraduationCap, Building2,
  ExternalLink, Send, CheckCircle, Users, X, RefreshCw,
  UserPlus, UserCheck, Eye, Bell, Clock, Sparkles
} from 'lucide-react';
import { AlumniProfileViewModal, type ConnectionStatusType } from './AlumniProfileViewModal';

interface AlumniNetworkModuleProps {
  userRole: 'Student' | 'Faculty' | 'Administrator' | 'Alumni';
  currentUser: any;
}

export const AlumniNetworkModule: React.FC<AlumniNetworkModuleProps> = ({ userRole, currentUser }) => {
  const [alumniList, setAlumniList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters & Tabs
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [graduationYear, setGraduationYear] = useState('All');
  const [mentorshipOnly, setMentorshipOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'directory' | 'requests_alerts' | 'my_connections' | 'jobs'>('directory');

  // Selected Alumni for Profile Modal
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mentorship Modal State
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [mentorshipForm, setMentorshipForm] = useState({
    careerGoal: 'Software Development & AI',
    preferredTopic: 'System Design & Interview Preparation',
    message: 'Hello! I am a student at NEXUS. I would love to get your mentorship and advice for career growth.',
  });
  const [mentorshipSent, setMentorshipSent] = useState(false);

  // --- CONNECTION REQUEST & NOTIFICATION STATES ---
  // 1. Accepted Connections List (Persisted)
  const [connectedAlumniList, setConnectedAlumniList] = useState<any[]>([]);
  const [pendingSentRequests, setPendingSentRequests] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  // Jobs Board
  const [jobsList, setJobsList] = useState<any[]>([]);

  const currentUserEmail = currentUser?.email || 'student@nexus.campus.edu';

  useEffect(() => {
    fetchAlumniDirectory();
    fetchAlumniJobs();
    fetchConnectionRequestsData();
  }, [department, graduationYear, mentorshipOnly]);

  const fetchConnectionRequestsData = async () => {
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/connections/requests?userEmail=${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setIncomingRequests(data.incomingRequests || []);
        setPendingSentRequests(data.sentRequests || []);
        setConnectedAlumniList(data.friends || []);
      }
    } catch (e) {
      console.warn('Backend requests fetch warning, using live fallback state.');
    }
  };

  const fetchAlumniDirectory = async () => {
    setLoading(true);
    try {
      let url = `https://nexus-smart-campus-backend.onrender.com/api/alumni/directory?department=${encodeURIComponent(department)}&graduationYear=${encodeURIComponent(graduationYear)}`;
      const userCollege = currentUser?.collegeName || currentUser?.college_name;
      if (userCollege) {
        url += `&collegeName=${encodeURIComponent(userCollege)}`;
      }
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (mentorshipOnly) url += `&mentorshipOnly=true`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') {
        setAlumniList(data.alumni || []);
      }
    } catch (e) {
      console.error('Error fetching alumni directory:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlumniJobs = async () => {
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/jobs');
      const data = await res.json();
      if (data.status === 'success') {
        setJobsList(data.jobs || []);
      }
    } catch (e) {
      console.error('Error fetching alumni jobs:', e);
    }
  };

  // Helper to determine the EXACT connection status state for any alumnus
  const getAlumniConnectionStatus = (alumnus: any): ConnectionStatusType => {
    if (!alumnus) return 'NOT_SENT';
    const email = alumnus.email;
    const isAccepted = connectedAlumniList.some((c) => c.email === email || (c.id && c.id === alumnus.id));
    if (isAccepted) return 'ACCEPTED';

    const isPendingSent = pendingSentRequests.some((p) => p.email === email || (p.id && p.id === alumnus.id));
    if (isPendingSent) return 'PENDING';

    const isIncoming = incomingRequests.some((inc) => inc.email === email || inc.sender_email === email);
    if (isIncoming) return 'INCOMING_PENDING';

    return 'NOT_SENT';
  };

  // 1. ACTION: Send Connection Request (State: NOT_SENT -> PENDING via REST API)
  const handleSendConnectionRequest = async (alumnus: any) => {
    const targetEmail = alumnus.email;
    const newPending = {
      id: alumnus.id,
      email: targetEmail,
      full_name: alumnus.full_name,
      current_designation: alumnus.current_designation,
      current_company: alumnus.current_company,
      department: alumnus.department,
      graduation_year: alumnus.graduation_year,
      photograph_url: alumnus.photograph_url,
      sentAt: 'Just now',
    };

    const updatedSent = [newPending, ...pendingSentRequests];
    setPendingSentRequests(updatedSent);
    localStorage.setItem('nexus_pending_sent_requests', JSON.stringify(updatedSent));

    try {
      await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUserEmail,
          receiverEmail: targetEmail,
          message: 'Hi! I would love to connect with you on NEXUS Alumni Network.',
        }),
      });
    } catch (e) {}

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'SENT',
      title: 'Connection Request Sent',
      description: `Your connection request was sent to ${alumnus.full_name} (${alumnus.current_designation || 'Alumni'} at ${alumnus.current_company || 'Tech Leader'}). Pending alumni acceptance.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotificationsList([newNotif, ...notificationsList]);

    alert(`📩 Connection Request sent to ${alumnus.full_name}! Status updated to Pending Acceptance.`);
    fetchConnectionRequestsData();
  };

  // 2. ACTION: Cancel Pending Sent Request via REST API
  const handleCancelConnectionRequest = async (alumnus: any) => {
    const targetEmail = alumnus.email;
    const updatedSent = pendingSentRequests.filter((p) => p.email !== targetEmail && p.id !== alumnus.id);
    setPendingSentRequests(updatedSent);
    localStorage.setItem('nexus_pending_sent_requests', JSON.stringify(updatedSent));

    const updatedConn = connectedAlumniList.filter((c) => c.email !== targetEmail && c.id !== alumnus.id);
    setConnectedAlumniList(updatedConn);
    localStorage.setItem('nexus_connected_alumni', JSON.stringify(updatedConn));

    try {
      await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/requests/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUserEmail,
          targetEmail,
        }),
      });
    } catch (e) {}

    fetchConnectionRequestsData();
  };

  // 3. ACTION: Accept Connection Request via REST API
  const handleAcceptConnectionRequest = async (alumnus: any) => {
    const targetEmail = alumnus.email || alumnus.sender_email;
    const connObj = {
      id: alumnus.id,
      email: targetEmail,
      full_name: alumnus.full_name || alumnus.name,
      name: alumnus.full_name || alumnus.name,
      username: alumnus.username || `@${(alumnus.full_name || '').toLowerCase().replace(/\s+/g, '_')}`,
      department: alumnus.department,
      graduation_year: alumnus.graduation_year,
      current_company: alumnus.current_company,
      current_designation: alumnus.current_designation,
      photograph_url: alumnus.photograph_url || alumnus.avatar,
      avatar: alumnus.photograph_url || alumnus.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      college_name: alumnus.college_name || 'NEXUS Partner Campus',
      college: alumnus.college_name || 'NEXUS Partner Campus',
      course: `Alumni (${alumnus.graduation_year || '2023'}) • ${alumnus.current_designation || 'Specialist'}`,
      status: 'Connected',
      isAlumni: true,
      connectedAt: new Date().toLocaleDateString(),
    };

    const updatedConn = [connObj, ...connectedAlumniList];
    setConnectedAlumniList(updatedConn);
    localStorage.setItem('nexus_connected_alumni', JSON.stringify(updatedConn));

    setPendingSentRequests(pendingSentRequests.filter((p) => p.email !== targetEmail));
    setIncomingRequests(incomingRequests.filter((inc) => inc.email !== targetEmail));

    try {
      await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUserEmail,
          senderEmail: targetEmail,
          requestId: alumnus.request_id,
          action: 'ACCEPT',
        }),
      });
    } catch (e) {}

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: 'ACCEPTANCE',
      title: 'Connection Accepted! 🤝',
      description: `You and ${alumnus.full_name || alumnus.name} are now connected friends. Direct chat is enabled.`,
      timestamp: 'Just now',
      read: false,
    };
    setNotificationsList([newNotif, ...notificationsList]);

    window.dispatchEvent(new CustomEvent('nexus:alumni-connected', { detail: alumnus }));
    window.dispatchEvent(new Event('storage'));

    alert(`🎉 Connected with ${alumnus.full_name || alumnus.name}! Request Accepted.`);
    fetchConnectionRequestsData();
  };

  // 4. ACTION: Decline Connection Request via REST API
  const handleDeclineConnectionRequest = async (alumnus: any) => {
    const targetEmail = alumnus.email || alumnus.sender_email;
    setIncomingRequests(incomingRequests.filter((inc) => inc.email !== targetEmail));

    try {
      await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUserEmail,
          senderEmail: targetEmail,
          requestId: alumnus.request_id,
          action: 'DECLINE',
        }),
      });
    } catch (e) {}

    fetchConnectionRequestsData();
  };

  const handleSendMentorshipRequest = async () => {
    if (!selectedAlumni) return;
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: currentUser?.email || 'student@nexus.edu',
          studentName: currentUser?.name || 'Student',
          studentRollNumber: currentUser?.rollNumber || '2023CSE001',
          studentDepartment: currentUser?.department || 'Computer Science',
          alumniEmail: selectedAlumni.email,
          alumniName: selectedAlumni.full_name,
          careerGoal: mentorshipForm.careerGoal,
          preferredTopic: mentorshipForm.preferredTopic,
          message: mentorshipForm.message,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMentorshipSent(true);
        setTimeout(() => {
          setMentorshipSent(false);
          setShowMentorshipModal(false);
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-left">
      {/* MODULE HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-purple-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              🎓 Single Source of Truth Alumni Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">NEXUS Alumni Network</h1>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Connect with verified alumni leaders, track connection request statuses, manage pending requests & alerts, and build your professional network.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-center">
              <span className="text-xl font-black block text-amber-400">{pendingSentRequests.length + incomingRequests.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-purple-200 font-semibold">Pending Requests</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-center">
              <span className="text-xl font-black block text-emerald-400">{connectedAlumniList.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-purple-200 font-semibold">Connected Friends</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS WITH NOTIFICATIONS BADGE */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'directory'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Alumni Directory & Search
        </button>

        <button
          onClick={() => setActiveTab('requests_alerts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition relative ${
            activeTab === 'requests_alerts'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Pending Requests & Notifications</span>
          {(pendingSentRequests.length > 0 || incomingRequests.length > 0) && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-black">
              {pendingSentRequests.length + incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my_connections')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'my_connections'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" /> My Connected Alumni ({connectedAlumniList.length})
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'jobs'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Alumni Job Board ({jobsList.length})
        </button>
      </div>

      {/* TAB 1: ALUMNI DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alumni by name, company, designation, skills, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAlumniDirectory()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <button
                onClick={fetchAlumniDirectory}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Filter className="w-4 h-4" /> Filter Results
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 mb-1 block">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Management Studies">Management Studies</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1 block">Graduation Year</label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="All">All Batches</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mentorshipOnly}
                    onChange={(e) => setMentorshipOnly(e.target.checked)}
                    className="rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Mentors Available Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* ALUMNI CARDS GRID */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-500" /> Searching verified alumni records...
            </div>
          ) : alumniList.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-3xl space-y-2">
              <Users className="w-10 h-10 text-purple-400 mx-auto opacity-60" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Alumni found matching criteria</p>
              <p className="text-xs text-slate-400">Try adjusting your department or search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {alumniList.map((alumnus) => {
                const statusState = getAlumniConnectionStatus(alumnus);

                return (
                  <div
                    key={alumnus.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-purple-500/40 transition shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      {/* Header - Click to open full profile */}
                      <div
                        onClick={() => {
                          setSelectedAlumni(alumnus);
                          setShowProfileModal(true);
                        }}
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        {alumnus.photograph_url ? (
                          <img
                            src={alumnus.photograph_url}
                            alt={alumnus.full_name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30 flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                            {alumnus.full_name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {alumnus.full_name}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold line-clamp-1">
                            {alumnus.current_designation || 'Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" /> {alumnus.current_company || 'Tech Org'}
                          </p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span>🎓 {alumnus.department}</span>
                          <span className="font-bold text-purple-600">Batch {alumnus.graduation_year}</span>
                        </div>
                        {alumnus.skills && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {alumnus.skills.split(',').slice(0, 3).map((s: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-semibold"
                              >
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions (Exact 4 Status Button States) */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAlumni(alumnus);
                          setShowProfileModal(true);
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1 shrink-0"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4 text-indigo-500" />
                        <span className="hidden sm:inline">Profile</span>
                      </button>

                      {/* STATE 1: ACCEPTED / CONNECTED */}
                      {statusState === 'ACCEPTED' && (
                        <button
                          onClick={() => handleCancelConnectionRequest(alumnus)}
                          className="flex-1 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Connected
                        </button>
                      )}

                      {/* STATE 2: PENDING OUTGOING REQUEST SENT */}
                      {statusState === 'PENDING' && (
                        <button
                          onClick={() => handleCancelConnectionRequest(alumnus)}
                          className="flex-1 py-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-500/20 transition-colors"
                          title="Click to cancel pending request"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> Request Sent
                        </button>
                      )}

                      {/* STATE 3: PENDING INCOMING REQUEST RECEIVED */}
                      {statusState === 'INCOMING_PENDING' && (
                        <button
                          onClick={() => handleAcceptConnectionRequest(alumnus)}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Accept Request
                        </button>
                      )}

                      {/* STATE 4: NOT SENT (DEFAULT) */}
                      {statusState === 'NOT_SENT' && (
                        <button
                          onClick={() => handleSendConnectionRequest(alumnus)}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Add Connection
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING REQUESTS & NOTIFICATIONS HUB (3-COLUMN LAYOUT) */}
      {activeTab === 'requests_alerts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Connection Requests & Real-Time Alerts Hub
              </h3>
              <p className="text-xs text-slate-500">Track pending sent requests, manage incoming invites, and view live notification logs</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* COLUMN 1: OUTGOING SENT REQUESTS (PENDING APPROVAL) */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/40 pb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" /> Sent Requests (Pending Acceptance)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                    {pendingSentRequests.length} Pending
                  </span>
                </div>

                {pendingSentRequests.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs space-y-1">
                    <CheckCircle className="w-8 h-8 mx-auto text-amber-400 opacity-60" />
                    <p className="font-bold">No Pending Sent Requests</p>
                    <p className="text-[10px]">All your sent connection requests have been responded to.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSentRequests.map((req) => (
                      <div
                        key={req.email || req.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 space-y-2 shadow-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={req.photograph_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={req.full_name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/30 shrink-0"
                          />
                          <div className="truncate">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{req.full_name}</h5>
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate">
                              {req.current_designation || 'Alumni Specialist'}
                            </p>
                            <span className="text-[9px] text-slate-400 font-mono">Sent {req.sentAt || 'Recently'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[9px]">
                            ⏳ Pending Approval
                          </span>
                          <button
                            onClick={() => handleCancelConnectionRequest(req)}
                            className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-[10px] transition"
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 2: INCOMING CONNECTION REQUESTS */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/40 pb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-500" /> Incoming Requests
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">
                    {incomingRequests.length} Received
                  </span>
                </div>

                {incomingRequests.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs space-y-1">
                    <UserCheck className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
                    <p className="font-bold">No Incoming Requests</p>
                    <p className="text-[10px]">When students or alumni send you a connection invite, it will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((inc) => (
                      <div
                        key={inc.id || inc.email}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/30 space-y-2 shadow-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={inc.photograph_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
                            alt={inc.full_name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                          />
                          <div className="truncate">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{inc.full_name}</h5>
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate">
                              {inc.current_designation || 'Alumni Leader'}
                            </p>
                          </div>
                        </div>

                        {inc.message && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border">
                            "{inc.message}"
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleDeclineConnectionRequest(inc)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold text-[10px]"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptConnectionRequest(inc)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow"
                          >
                            Accept Request
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 3: REAL-TIME NOTIFICATIONS FEED */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-900/40 pb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Notifications Feed
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                    {notificationsList.length} Alerts
                  </span>
                </div>

                <div className="space-y-3">
                  {notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/30 space-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{notif.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {notif.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY CONNECTED ALUMNI FRIENDS */}
      {activeTab === 'my_connections' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-500" /> My Connected Alumni Friends ({connectedAlumniList.length})
              </h3>
              <p className="text-xs text-slate-500">Alumni who have accepted your connection request</p>
            </div>
          </div>

          {connectedAlumniList.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-3xl space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
              <UserPlus className="w-10 h-10 text-purple-400 mx-auto opacity-60" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Alumni Connections Added Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore the Alumni Directory and click "Add Connection" to send requests to NEXUS graduates.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow"
              >
                Browse Alumni Directory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {connectedAlumniList.map((conn) => (
                <div
                  key={conn.email || conn.id}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={conn.avatar || conn.photograph_url}
                        alt={conn.name || conn.full_name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{conn.name || conn.full_name}</h4>
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                          {conn.current_designation || 'Alumni Specialist'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" /> {conn.current_company || conn.college || 'NEXUS Network'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 p-2 rounded-xl bg-white dark:bg-slate-900 border text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between font-mono">
                      <span>🎓 {conn.department || 'Computer Science'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Request Accepted ✓</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAlumni(conn);
                        setShowProfileModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-500" /> View Profile
                    </button>

                    <button
                      onClick={() => handleCancelConnectionRequest(conn)}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs transition"
                      title="Remove Connection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: JOB BOARD */}
      {activeTab === 'jobs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Verified Alumni Opportunities & Referrals</h3>
            <p className="text-xs text-slate-500">Explore career opportunities posted directly by NEXUS alumni</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobsList.map((j) => (
              <div key={j.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{j.job_title}</h4>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{j.company} • {j.location}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-bold">
                    {j.employment_type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{j.description}</p>
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-slate-400 text-[11px]">Posted by {j.posted_by_name}</span>
                  {j.application_link ? (
                    <a href={j.application_link} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                      Apply Now <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-xs text-slate-400 font-semibold">Contact Poster</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL ALUMNI PROFILE VIEW MODAL WITH 4-STATE STATUS WORKFLOW */}
      <AlumniProfileViewModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        alumni={selectedAlumni}
        connectionStatus={getAlumniConnectionStatus(selectedAlumni)}
        onSendRequest={handleSendConnectionRequest}
        onCancelRequest={handleCancelConnectionRequest}
        onAcceptRequest={handleAcceptConnectionRequest}
        onDeclineRequest={handleDeclineConnectionRequest}
        onRequestMentorship={() => {
          setShowProfileModal(false);
          setShowMentorshipModal(true);
        }}
        userRole={userRole}
      />

      {/* MENTORSHIP REQUEST MODAL */}
      {showMentorshipModal && selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" /> Request Mentorship from {selectedAlumni.full_name}
              </h3>
              <button onClick={() => setShowMentorshipModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {mentorshipSent ? (
              <div className="p-8 text-center text-emerald-500 space-y-2">
                <CheckCircle className="w-10 h-10 mx-auto" />
                <p className="font-bold text-sm">Mentorship Request Sent Successfully!</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Career Goal</label>
                  <input type="text" value={mentorshipForm.careerGoal} onChange={(e) => setMentorshipForm({ ...mentorshipForm, careerGoal: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Preferred Discussion Topic</label>
                  <input type="text" value={mentorshipForm.preferredTopic} onChange={(e) => setMentorshipForm({ ...mentorshipForm, preferredTopic: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Introduction Message</label>
                  <textarea rows={3} value={mentorshipForm.message} onChange={(e) => setMentorshipForm({ ...mentorshipForm, message: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button onClick={() => setShowMentorshipModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
                  <button onClick={handleSendMentorshipRequest} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" /> Submit Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

