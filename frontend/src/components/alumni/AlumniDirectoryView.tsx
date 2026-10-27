import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
  Award,
  UserPlus,
  MessageSquare,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  X,
} from 'lucide-react';
import { AlumniProfileViewModal } from './AlumniProfileViewModal';

interface AlumniDirectoryViewProps {
  session: any;
  onOpenChatWithUser?: (targetEmail: string, targetName: string) => void;
}

export const AlumniDirectoryView: React.FC<AlumniDirectoryViewProps> = ({
  session,
  onOpenChatWithUser,
}) => {
  const currentEmail = session?.email || '';

  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [graduationYear, setGraduationYear] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [mentorshipOnly, setMentorshipOnly] = useState(false);
  const [jobProviderOnly, setJobProviderOnly] = useState(false);

  // Selected Profile for Modal View
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Connection Request Modal
  const [connectingAlumni, setConnectingAlumni] = useState<any | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('I would love to connect with you on the NEXUS Alumni Network!');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  // Mentorship Request Modal
  const [mentoringAlumni, setMentoringAlumni] = useState<any | null>(null);
  const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineering');
  const [preferredTopic, setPreferredTopic] = useState('System Design & Interview Prep');
  const [mentorshipMessage, setMentorshipMessage] = useState('Hello! I would be grateful for your career guidance and mentorship.');
  const [mentorshipStatus, setMentorshipStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchDirectory();
  }, [search, department, graduationYear, industry, mentorshipOnly, jobProviderOnly]);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department !== 'All') params.append('department', department);
      if (graduationYear !== 'All') params.append('graduationYear', graduationYear);
      if (industry !== 'All') params.append('industry', industry);
      if (mentorshipOnly) params.append('mentorshipOnly', 'true');
      if (jobProviderOnly) params.append('jobProviderOnly', 'true');

      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/directory?${params.toString()}`);
      const data = await res.json();
      if (data.status === 'success') {
        setAlumni(data.alumni || []);
      }
    } catch (e) {
      console.error('Error fetching directory:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingAlumni) return;

    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentEmail,
          receiverEmail: connectingAlumni.email,
          message: connectionMessage,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRequestStatus(`Connection request sent to ${connectingAlumni.full_name}!`);
        setTimeout(() => {
          setRequestStatus(null);
          setConnectingAlumni(null);
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMentorshipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentoringAlumni) return;

    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: currentEmail,
          studentName: session?.name || 'Student / Alumni Peer',
          studentDepartment: session?.department || 'Computer Science',
          alumniEmail: mentoringAlumni.email,
          alumniName: mentoringAlumni.full_name,
          careerGoal,
          preferredTopic,
          message: mentorshipMessage,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMentorshipStatus(`Mentorship request sent to ${mentoringAlumni.full_name}!`);
        setTimeout(() => {
          setMentorshipStatus(null);
          setMentoringAlumni(null);
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Filter Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Verified Alumni Directory & Network Discovery
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discover and connect with verified graduates, mentors, and industry pioneers.
            </p>
          </div>
          <button
            onClick={fetchDirectory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs pt-2">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, designation, skills, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science & Engg</option>
            <option value="CSE">CSE</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Comm">Electronics & Comm</option>
            <option value="Mechanical Engg">Mechanical Engineering</option>
            <option value="Civil Engg">Civil Engineering</option>
          </select>

          {/* Graduation Year */}
          <select
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="All">All Graduation Years</option>
            <option value="2025">Class of 2025</option>
            <option value="2024">Class of 2024</option>
            <option value="2023">Class of 2023</option>
            <option value="2022">Class of 2022</option>
            <option value="2021">Class of 2021</option>
            <option value="2020">Class of 2020 & Earlier</option>
          </select>

          {/* Industry Filter */}
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="All">All Industries</option>
            <option value="Software & Technology">Software & Technology</option>
            <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
            <option value="Cloud & DevOps">Cloud & DevOps</option>
            <option value="Financial Technology (FinTech)">Financial Technology</option>
            <option value="Consulting & Strategy">Consulting & Strategy</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mentorshipOnly}
              onChange={(e) => setMentorshipOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Open for Mentorship Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={jobProviderOnly}
              onChange={(e) => setJobProviderOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Hiring / Job Providers Only</span>
          </label>

          <div className="ml-auto text-slate-400 text-[11px]">
            Found <strong className="text-slate-900 dark:text-white">{alumni.length}</strong> verified alumni
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading alumni directory from MySQL database...</div>
      ) : alumni.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No alumni match your search filters</h3>
          <p className="text-xs text-slate-500">Try adjusting your keywords or clearing the industry and graduation year filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {alumni.map((alm) => {
            const isSelf = alm.email === currentEmail;
            return (
              <div
                key={alm.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-400 dark:hover:border-purple-600 transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Header Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0 overflow-hidden">
                      {alm.photograph_url ? (
                        <img src={alm.photograph_url} alt={alm.full_name} className="w-full h-full object-cover" />
                      ) : (
                        alm.full_name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-black text-sm text-slate-900 dark:text-white truncate">
                          {alm.full_name}
                        </h3>
                        <span title="Verified Alumni"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                      </div>

                      <p className="text-xs font-semibold text-indigo-600 dark:text-purple-400 truncate">
                        {alm.current_designation || 'Software Professional'}
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>{alm.current_company || 'Leading Tech Firm'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Academic & Location details */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      Class of {alm.graduation_year} • {alm.department}
                    </span>
                    {alm.current_city && (
                      <span className="flex items-center gap-1 shrink-0">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {alm.current_city}
                      </span>
                    )}
                  </div>

                  {/* Badges: Mentorship & Skills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {alm.mentorship_available === 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Mentor
                      </span>
                    )}
                    {alm.job_provider === 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        Hiring
                      </span>
                    )}
                    {alm.skills && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold truncate max-w-[150px]">
                        {typeof alm.skills === 'string' && alm.skills.startsWith('[')
                          ? JSON.parse(alm.skills).slice(0, 2).join(', ')
                          : alm.skills.slice(0, 30)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setSelectedAlumni(alm);
                      setShowProfileModal(true);
                    }}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>

                  {!isSelf ? (
                    <>
                      <button
                        onClick={() => setConnectingAlumni(alm)}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800/50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>

                      {alm.mentorship_available === 1 ? (
                        <button
                          onClick={() => setMentoringAlumni(alm)}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Mentor</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (onOpenChatWithUser) {
                              onOpenChatWithUser(alm.email, alm.full_name);
                            }
                          }}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="col-span-2 text-center text-[11px] font-semibold text-slate-400 py-1">
                      Your Profile
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Detail View Modal */}
      {showProfileModal && selectedAlumni && (
        <AlumniProfileViewModal
          alumni={selectedAlumni}
          connectionStatus="NOT_SENT"
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSendRequest={() => {
            setShowProfileModal(false);
            setConnectingAlumni(selectedAlumni);
          }}
          onRequestMentorship={() => {
            setShowProfileModal(false);
            setMentoringAlumni(selectedAlumni);
          }}
          onOpenChat={() => {
            setShowProfileModal(false);
            if (onOpenChatWithUser) onOpenChatWithUser(selectedAlumni.email, selectedAlumni.full_name);
          }}
        />
      )}

      {/* Connect Request Modal */}
      {connectingAlumni && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Connect with {connectingAlumni.full_name}
              </h3>
              <button onClick={() => setConnectingAlumni(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestStatus ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                {requestStatus}
              </div>
            ) : (
              <form onSubmit={handleSendConnection} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Send a personalized connection request. They will receive a realtime notification in their portal.
                </p>
                <textarea
                  rows={3}
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConnectingAlumni(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                  >
                    Send Connection Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mentorship Request Modal */}
      {mentoringAlumni && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Request Mentorship from {mentoringAlumni.full_name}
              </h3>
              <button onClick={() => setMentoringAlumni(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {mentorshipStatus ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                {mentorshipStatus}
              </div>
            ) : (
              <form onSubmit={handleSendMentorshipRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Primary Career Goal
                  </label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Mentorship Topic
                  </label>
                  <input
                    type="text"
                    value={preferredTopic}
                    onChange={(e) => setPreferredTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Personalized Message
                  </label>
                  <textarea
                    rows={3}
                    value={mentorshipMessage}
                    onChange={(e) => setMentorshipMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMentoringAlumni(null)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                  >
                    Submit Mentorship Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
