import React, { useState, useEffect } from 'react';
import {
  Award,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  FileText,
} from 'lucide-react';

interface AlumniMentorshipCentralProps {
  session: any;
  onOpenChatWithUser?: (targetEmail: string, targetName: string) => void;
}

export const AlumniMentorshipCentral: React.FC<AlumniMentorshipCentralProps> = ({
  session,
  onOpenChatWithUser,
}) => {
  const userEmail = session?.email || '';
  const userName = session?.name || 'Alumnus';

  const [activeTab, setActiveTab] = useState<'requests' | 'sessions' | 'active_mentees'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Schedule Session Modal
  const [schedulingReq, setSchedulingReq] = useState<any | null>(null);
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('04:00 PM');
  const [meetingMode, setMeetingMode] = useState('Online (Google Meet)');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/nex-alm-guidance');
  const [sessionAgenda, setSessionAgenda] = useState('Discuss career roadmap, resume review, and interview prep');

  useEffect(() => {
    fetchMentorshipData();
  }, [userEmail]);

  // Realtime listeners
  useEffect(() => {
    const handleReq = () => fetchMentorshipData();
    const handleSess = () => fetchMentorshipData();

    window.addEventListener('mentorship.requested', handleReq);
    window.addEventListener('mentorship.session.updated', handleSess);

    return () => {
      window.removeEventListener('mentorship.requested', handleReq);
      window.removeEventListener('mentorship.session.updated', handleSess);
    };
  }, []);

  const fetchMentorshipData = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      // 1. Fetch requests
      const reqRes = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/requests?userEmail=${encodeURIComponent(userEmail)}`);
      const reqData = await reqRes.json();
      if (reqData.status === 'success') {
        setRequests(reqData.requests || []);
      }

      // 2. Fetch sessions
      const sessRes = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/sessions?userEmail=${encodeURIComponent(userEmail)}`);
      const sessData = await sessRes.json();
      if (sessData.status === 'success') {
        setSessions(sessData.sessions || []);
      }
    } catch (e) {
      console.error('Error fetching mentorship data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatusMsg(`Mentorship request ${status.toLowerCase()}!`);
        fetchMentorshipData();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingReq) return;

    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: schedulingReq.request_id,
          alumniEmail: userEmail,
          alumniName: userName,
          studentEmail: schedulingReq.student_email,
          studentName: schedulingReq.student_name,
          topic: sessionTopic || schedulingReq.preferred_topic || 'Mentorship Guidance Session',
          scheduledDate: sessionDate,
          scheduledTime: sessionTime,
          meetingMode,
          meetingLinkOrVenue: meetingLink,
          agenda: sessionAgenda,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatusMsg('Mentorship session scheduled and shared in realtime!');
        setSchedulingReq(null);
        fetchMentorshipData();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatusMsg(`Session marked as ${newStatus}!`);
        fetchMentorshipData();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header and SubTabs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Student Mentorship & Career Guidance Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Empower aspiring campus engineers through personalized guidance, mock interviews, and scheduled mentoring sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800/60">
              {pendingRequests.length} Pending Inquiries
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mentorship Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Scheduled Sessions ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('active_mentees')}
            className={`pb-3 flex items-center gap-2 ${
              activeTab === 'active_mentees'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Active Mentees ({acceptedRequests.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REQUESTS VIEW */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No mentorship requests received yet. Students browsing the directory will find you here.</p>
            </div>
          ) : (
            requests.map((r) => {
              const isPending = r.status === 'PENDING';
              return (
                <div
                  key={r.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                        {r.student_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({r.student_roll_number || r.student_department})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : r.status === 'DECLINED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Career Goal</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">{r.career_goal}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Preferred Topic</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">{r.preferred_topic}</p>
                      </div>
                    </div>

                    {r.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        "{r.message}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleRespond(r.request_id, 'ACCEPTED')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Accept Mentee
                        </button>
                        <button
                          onClick={() => handleRespond(r.request_id, 'DECLINED')}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-all"
                        >
                          Decline
                        </button>
                      </>
                    ) : r.status === 'ACCEPTED' ? (
                      <button
                        onClick={() => {
                          setSchedulingReq(r);
                          setSessionTopic(r.preferred_topic || 'Mentorship Guidance');
                          setSessionDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Session</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => {
                        if (onOpenChatWithUser) onOpenChatWithUser(r.student_email, r.student_name);
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all"
                      title="Open Direct Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SCHEDULED SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No mentoring sessions scheduled yet.</p>
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      {sess.meeting_mode}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {sess.scheduled_date} at {sess.scheduled_time}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {sess.status}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {sess.topic}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mentee: <strong className="text-slate-800 dark:text-slate-200">{sess.student_name}</strong> ({sess.student_email})
                  </p>
                  {sess.agenda && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                      Agenda: {sess.agenda}
                    </p>
                  )}
                  {sess.meeting_link_or_venue && (
                    <a
                      href={sess.meeting_link_or_venue}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline pt-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{sess.meeting_link_or_venue}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {sess.status === 'SCHEDULED' && (
                    <>
                      <button
                        onClick={() => handleUpdateSessionStatus(sess.session_id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateSessionStatus(sess.session_id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-xl border text-slate-600 hover:text-rose-600 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ACTIVE MENTEES */}
      {activeTab === 'active_mentees' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {acceptedRequests.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No active mentees yet. Accept incoming requests to start mentoring.</p>
            </div>
          ) : (
            acceptedRequests.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      {m.student_name}
                    </h4>
                    <p className="text-xs text-slate-500">{m.student_department}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Active Mentee
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Focus Area</span>
                  <p className="text-slate-800 dark:text-slate-200">{m.preferred_topic}</p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (onOpenChatWithUser) onOpenChatWithUser(m.student_email, m.student_name);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                  <button
                    onClick={() => {
                      setSchedulingReq(m);
                      setSessionTopic(m.preferred_topic);
                      setSessionDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Session</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SCHEDULE SESSION MODAL */}
      {schedulingReq && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Schedule Mentoring Session with {schedulingReq.student_name}
            </h3>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Session Topic
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    placeholder="e.g. 05:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Mode
                </label>
                <select
                  value={meetingMode}
                  onChange={(e) => setMeetingMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                >
                  <option value="Online (Google Meet)">Online (Google Meet)</option>
                  <option value="Online (Zoom)">Online (Zoom)</option>
                  <option value="In-Person (Campus)">In-Person (Campus)</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Video Link or Campus Venue
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agenda & Focus
                </label>
                <textarea
                  rows={2}
                  value={sessionAgenda}
                  onChange={(e) => setSessionAgenda(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingReq(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Confirm & Send Session Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
