import React, { useState, useEffect } from 'react';
import {
  Mic,
  Plus,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Video,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

interface AlumniGuestLecturesProps {
  session: any;
}

export const AlumniGuestLectures: React.FC<AlumniGuestLecturesProps> = ({ session }) => {
  const userEmail = session?.email || '';
  const userName = session?.name || 'Alumnus';

  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [topic, setTopic] = useState('');
  const [abstractDesc, setAbstractDesc] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('Computer Science');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('02:00 PM');
  const [mode, setMode] = useState('Online Webinar');
  const [venueOrLink, setVenueOrLink] = useState('Google Meet / Campus Auditorium');
  const [expectedAttendees, setExpectedAttendees] = useState(120);

  useEffect(() => {
    fetchLectures();
  }, [userEmail]);

  // Realtime listeners
  useEffect(() => {
    const handleLecUpdated = () => fetchLectures();
    window.addEventListener('alumni.guest_lecture.updated', handleLecUpdated);
    return () => window.removeEventListener('alumni.guest_lecture.updated', handleLecUpdated);
  }, []);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/guest-lectures?alumniEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setLectures(data.lectures || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/guest-lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniEmail: userEmail,
          alumniName: userName,
          alumniDesignation: session?.currentDesignation || 'Senior Software Engineer',
          alumniCompany: session?.currentCompany || 'Top Tech Enterprise',
          topic,
          abstractDesc,
          targetDepartment,
          proposedDate,
          proposedTime,
          mode,
          venueOrLink,
          expectedAttendees,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccessMsg('Guest lecture proposed and notified to Faculty coordinators in realtime!');
        setShowProposeModal(false);
        setTopic('');
        setAbstractDesc('');
        fetchLectures();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-amber-500" />
              Guest Lectures, Tech Talks & Campus Engagement
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Propose technical seminars, keynote sessions, and webinars to institutional faculty coordinators.
            </p>
          </div>

          <button
            onClick={() => setShowProposeModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Guest Lecture</span>
          </button>
        </div>
      </div>

      {/* Lecture List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading guest lecture proposals...</div>
      ) : lectures.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Mic className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">You have not proposed any guest lectures yet. Share your industry knowledge with campus students!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lectures.map((lec) => (
            <div
              key={lec.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-amber-400 transition-all"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                    {lec.topic}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lec.status === 'APPROVED' || lec.status === 'SCHEDULED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : lec.status === 'DECLINED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                    }`}
                  >
                    {lec.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lec.abstract_desc}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {lec.proposed_date} at {lec.proposed_time}
                  </span>
                  <span>Mode: <strong>{lec.mode}</strong></span>
                  <span>Target: <strong>{lec.target_department}</strong></span>
                  {lec.venue_or_link && (
                    <span className="text-indigo-600 font-semibold">{lec.venue_or_link}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-amber-500" />
                Propose Campus Guest Lecture
              </h3>
              <button onClick={() => setShowProposeModal(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProposeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lecture / Workshop Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Architecting Cloud-Native Microservices on Kubernetes"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Abstract & Key Takeaways
                </label>
                <textarea
                  rows={3}
                  value={abstractDesc}
                  onChange={(e) => setAbstractDesc(e.target.value)}
                  placeholder="Detail the concepts covered, live demo plans, and target student prerequisites..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Department
                  </label>
                  <select
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Computer Science">Computer Science & Engg</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Format / Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="Online Webinar">Online Webinar</option>
                    <option value="Offline Campus Session">Offline Campus Session</option>
                    <option value="Hands-on Workshop">Hands-on Workshop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proposed Date
                  </label>
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proposed Time
                  </label>
                  <input
                    type="text"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    placeholder="e.g. 02:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Attendees Capacity
                </label>
                <input
                  type="number"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
