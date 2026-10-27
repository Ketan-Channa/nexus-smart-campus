import React, { useState, useEffect } from 'react';
import {
  User, Briefcase, GraduationCap, ShieldCheck, Plus, Edit3, Save, Clock,
  Sparkles, Building2, FileText, Calendar, Users, ExternalLink,
  Check, X, AlertCircle, RefreshCw
} from 'lucide-react';

interface AlumniDashboardProps {
  user: any;
}

export const AlumniDashboard: React.FC<AlumniDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'mentorship' | 'jobs' | 'events' | 'collaborations' | 'ai'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile State
  const [profile, setProfile] = useState<any>({
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    department: user?.department || 'Computer Science',
    degree: 'B.Tech',
    graduationYear: '2023',
    currentCompany: user?.currentCompany || 'Software Solutions Inc.',
    currentDesignation: user?.currentDesignation || 'Senior Software Engineer',
    industry: 'Software & Technology',
    currentCity: 'New Delhi',
    currentCountry: 'India',
    skills: 'React.js, Node.js, Python, System Design, Cloud Computing',
    bio: 'Passionate software engineer with 3+ years of experience building scalable enterprise solutions. Enthusiastic about mentoring students and hosting tech webinars.',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    otherLinks: '',
    photoUrl: user?.photoUrl || null,
    coverPhotoUrl: user?.coverPhotoUrl || null,
    mentorshipAvailable: true,
    jobProvider: true,
    privacyLevel: 'CAMPUS_ONLY',
    alumniId: user?.alumniId || null,
    verificationStatus: user?.verificationStatus || 'PENDING',
  });

  // Experiences, Achievements, Events & Collaborations
  const [experiences, setExperiences] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);

  // New Job Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    jobTitle: '',
    company: profile.currentCompany,
    location: profile.currentCity,
    workMode: 'Hybrid',
    employmentType: 'Full-Time',
    experienceLevel: 'Entry / Junior Level',
    requiredSkills: '',
    description: '',
    applicationLink: '',
    deadline: '',
  });

  // AI Assistant State
  const [aiPromptType, setAiPromptType] = useState('BIO_GENERATOR');
  const [aiTopic, setAiTopic] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchMentorshipRequests();
    fetchMyJobs();
    fetchEvents();
    fetchCollaborations();
  }, [user?.email]);

  const fetchProfileData = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/profile/${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.status === 'success' && data.alumni) {
        const a = data.alumni;
        setProfile({
          fullName: a.full_name || user.name,
          email: a.email,
          mobile: a.mobile || '',
          department: a.department || 'Computer Science',
          degree: a.degree || 'B.Tech',
          graduationYear: a.graduation_year || '2023',
          currentCompany: a.current_company || '',
          currentDesignation: a.current_designation || '',
          industry: a.industry || 'Software & Technology',
          currentCity: a.current_city || 'New Delhi',
          currentCountry: a.current_country || 'India',
          skills: a.skills || '',
          bio: a.bio || '',
          linkedinUrl: a.linkedin_url || '',
          githubUrl: a.github_url || '',
          otherLinks: a.other_links || '',
          photoUrl: a.photograph_url || null,
          coverPhotoUrl: a.cover_photo_url || null,
          mentorshipAvailable: a.mentorship_available === 1,
          jobProvider: a.job_provider === 1,
          privacyLevel: a.privacy_level || 'CAMPUS_ONLY',
          alumniId: a.alumni_id || null,
          verificationStatus: a.verification_status || 'PENDING',
        });
        setExperiences(a.experiences || []);
        setAchievements(a.achievements || []);
      }
    } catch (e) {
      console.error('Error fetching alumni profile:', e);
    }
  };

  const fetchMentorshipRequests = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/requests?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setMentorshipRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Error fetching mentorship requests:', e);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/jobs`);
      const data = await res.json();
      if (data.status === 'success') {
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Error fetching jobs:', e);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/events`);
      const data = await res.json();
      if (data.status === 'success') {
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error('Error fetching events:', e);
    }
  };

  const fetchCollaborations = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/collaborations?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCollaborations(data.collaborations || []);
      }
    } catch (e) {
      console.error('Error fetching collaborations:', e);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          fullName: profile.fullName,
          mobile: profile.mobile,
          department: profile.department,
          degree: profile.degree,
          graduationYear: profile.graduationYear,
          currentCompany: profile.currentCompany,
          currentDesignation: profile.currentDesignation,
          industry: profile.industry,
          currentCity: profile.currentCity,
          currentCountry: profile.currentCountry,
          skills: profile.skills,
          bio: profile.bio,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          otherLinks: profile.otherLinks,
          photoUrl: profile.photoUrl,
          coverPhotoUrl: profile.coverPhotoUrl,
          mentorshipAvailable: profile.mentorshipAvailable,
          jobProvider: profile.jobProvider,
          privacyLevel: profile.privacyLevel,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatusMessage({ type: 'success', text: 'Alumni profile saved successfully to MySQL database!' });
        setIsEditing(false);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to save profile.' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Server connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRespondMentorship = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchMentorshipRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateJob = async () => {
    if (!newJob.jobTitle || !newJob.company || !newJob.description) return;
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postedByEmail: profile.email,
          postedByName: profile.fullName,
          alumniId: profile.alumniId,
          ...newJob,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowJobModal(false);
        fetchMyJobs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAssistant = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: aiPromptType,
          name: profile.fullName,
          company: profile.currentCompany,
          designation: profile.currentDesignation,
          skills: profile.skills,
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

  // Completion calculation
  const completionItems = [
    Boolean(profile.fullName),
    Boolean(profile.currentCompany),
    Boolean(profile.currentDesignation),
    Boolean(profile.skills),
    Boolean(profile.bio),
    Boolean(profile.linkedinUrl),
    Boolean(profile.photoUrl),
  ];
  const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-500/20 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.fullName} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-purple-500/40 shadow-xl" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-black shadow-xl ring-4 ring-purple-500/40">
                  {profile.fullName.substring(0, 2).toUpperCase()}
                </div>
              )}
              {profile.verificationStatus === 'VERIFIED' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-slate-900" title="Verified Alumni">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile.fullName}</h1>
                {profile.verificationStatus === 'VERIFIED' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ALUMNI • {profile.alumniId || 'ALM-2023-CSE-001'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> PENDING ADMIN VERIFICATION
                  </span>
                )}
              </div>
              <p className="text-purple-200/80 text-sm mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" /> {profile.currentDesignation || 'Alumnus'} at <span className="font-bold text-white">{profile.currentCompany || 'NEXUS Network'}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
                <span>🎓 {profile.degree} ({profile.department})</span>
                <span>•</span>
                <span>📅 Class of {profile.graduationYear}</span>
                <span>•</span>
                <span>📍 {profile.currentCity}, {profile.currentCountry}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
            )}
          </div>
        </div>

        {/* PROFILE COMPLETION BAR */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full max-w-xl">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-purple-200">Alumni Profile Strength</span>
              <span className="text-emerald-400 font-black">{completionPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.mentorshipAvailable}
                onChange={(e) => setProfile({ ...profile, mentorshipAvailable: e.target.checked })}
                className="rounded border-purple-500 text-purple-600 focus:ring-purple-500"
              />
              <span className="font-semibold text-slate-200">Available for Mentorship</span>
            </label>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'}`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {statusMessage.text}
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'profile' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <User className="w-4 h-4" /> My Profile & Experience
        </button>
        <button
          onClick={() => setActiveTab('mentorship')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'mentorship' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <GraduationCap className="w-4 h-4" /> Mentorship Requests ({mentorshipRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'jobs' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Briefcase className="w-4 h-4" /> Job & Internship Studio ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'events' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Calendar className="w-4 h-4" /> Alumni Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('collaborations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'collaborations' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Users className="w-4 h-4" /> Collaborations ({collaborations.length})
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'ai' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'}`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" /> AI Career Assistant
        </button>
      </div>

      {/* TAB 1: PROFILE & EXPERIENCE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio & Details */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" /> Professional Summary & Bio
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Full Bio</label>
                    <textarea
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Current Company</label>
                      <input
                        type="text"
                        value={profile.currentCompany}
                        onChange={(e) => setProfile({ ...profile, currentCompany: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Designation</label>
                      <input
                        type="text"
                        value={profile.currentDesignation}
                        onChange={(e) => setProfile({ ...profile, currentDesignation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Technical & Professional Skills (Comma separated)</label>
                    <input
                      type="text"
                      value={profile.skills}
                      onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-2">Skills & Expertise</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills ? (
                        profile.skills.split(',').map((skill: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold">
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No skills listed.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Experience List */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-500" /> Work History ({experiences.length + 1}) & Achievements ({achievements.length})
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{profile.currentDesignation || 'Senior Engineer'}</h4>
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{profile.currentCompany || 'Tech Corp'}</p>
                      <p className="text-[11px] text-slate-400 mt-1">2023 - Present • {profile.currentCity}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Current Role</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Social */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Social & Contact Links
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><ExternalLink className="w-4 h-4 text-blue-600" /> LinkedIn Profile</span>
                  {profile.linkedinUrl ? (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-purple-600 font-bold hover:underline flex items-center gap-1">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-slate-400">Not linked</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><ExternalLink className="w-4 h-4 text-slate-800 dark:text-slate-200" /> GitHub Repository</span>
                  {profile.githubUrl ? (
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-purple-600 font-bold hover:underline flex items-center gap-1">
                      View GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-slate-400">Not linked</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENTORSHIP REQUESTS */}
      {activeTab === 'mentorship' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Mentorship Requests</h3>
              <p className="text-xs text-slate-500">Incoming requests from current NEXUS students seeking career guidance</p>
            </div>
          </div>

          {mentorshipRequests.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-2xl">
              <GraduationCap className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No mentorship requests pending</p>
              <p className="text-xs text-slate-400 mt-1">Make sure your "Available for Mentorship" toggle is enabled!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mentorshipRequests.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.student_name}</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{req.student_department} • Roll No: {req.student_roll_number}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600' : req.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border text-xs space-y-1">
                    <p><strong>Goal:</strong> {req.career_goal || 'General Career Guidance'}</p>
                    <p><strong>Topic:</strong> {req.preferred_topic || 'System Design & Interview Prep'}</p>
                    <p className="text-slate-600 dark:text-slate-400 pt-1 italic">"{req.message}"</p>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRespondMentorship(req.request_id, 'ACCEPTED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Mentorship
                      </button>
                      <button
                        onClick={() => handleRespondMentorship(req.request_id, 'REJECTED')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: JOB & INTERNSHIP STUDIO */}
      {activeTab === 'jobs' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Alumni Job & Referral Studio</h3>
              <p className="text-xs text-slate-500">Post jobs, internships, and referral opportunities for NEXUS students</p>
            </div>
            <button
              onClick={() => setShowJobModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" /> Post New Opportunity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.job_title}</h4>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{job.company} • {job.location}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                    {job.employment_type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{job.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Work Mode: {job.work_mode}</span>
                  <span className="text-emerald-500 font-bold">Status: {job.moderation_status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* POST JOB MODAL */}
          {showJobModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-500" /> Post Opportunity for Students
                  </h3>
                  <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Job Title</label>
                    <input type="text" placeholder="e.g. Software Engineer Intern" value={newJob.jobTitle} onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Company</label>
                      <input type="text" value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Location</label>
                      <input type="text" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Work Mode</label>
                      <select value={newJob.workMode} onChange={(e) => setNewJob({ ...newJob, workMode: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs">
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Type</label>
                      <select value={newJob.employmentType} onChange={(e) => setNewJob({ ...newJob, employmentType: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs">
                        <option value="Full-Time">Full-Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Referral">Referral</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Description & Requirements</label>
                    <textarea rows={3} value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Application / Referral Link</label>
                    <input type="text" placeholder="https://careers.company.com/job/123" value={newJob.applicationLink} onChange={(e) => setNewJob({ ...newJob, applicationLink: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button onClick={() => setShowJobModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
                  <button onClick={handleCreateJob} disabled={loading} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs">
                    {loading ? 'Posting...' : 'Publish Job'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI CAREER ASSISTANT */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Alumni Career Assistant</h3>
              <p className="text-xs text-slate-500">Powered by Google Gemini AI Engine for bio generation, mentorship pitches, and job descriptions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">AI Task Type</label>
                <select value={aiPromptType} onChange={(e) => setAiPromptType(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800">
                  <option value="BIO_GENERATOR">Generate Professional Bio</option>
                  <option value="NETWORKING_MESSAGE">Draft Connection Note</option>
                  <option value="JOB_DESCRIPTION">Generate Job Post Template</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Target Topic / Role</label>
                <input type="text" placeholder="e.g. AI Research Engineer" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800" />
              </div>

              <button
                onClick={handleRunAiAssistant}
                disabled={aiLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
              >
                {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? 'Generating...' : 'Run AI Generator'}
              </button>
            </div>

            <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-[200px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-2">AI Generated Result:</span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {aiResult || 'Select a prompt type and click "Run AI Generator" to generate tailored career copy.'}
                </p>
              </div>

              {aiResult && (
                <div className="pt-4 flex justify-end">
                  <button onClick={() => navigator.clipboard.writeText(aiResult)} className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-bold">
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
