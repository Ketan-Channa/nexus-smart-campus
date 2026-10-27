import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Video,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AlumniMeetingsSchedulerProps {
  session: any;
}

export const AlumniMeetingsScheduler: React.FC<AlumniMeetingsSchedulerProps> = ({ session }) => {
  const userEmail = session?.email || '';

  const [sessions, setSessions] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [userEmail]);

  const fetchSchedule = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const [sessRes, lecRes] = await Promise.all([
        fetch(`http://localhost:5000/api/alumni/mentorship/sessions?userEmail=${encodeURIComponent(userEmail)}`),
        fetch(`http://localhost:5000/api/alumni/guest-lectures?alumniEmail=${encodeURIComponent(userEmail)}`),
      ]);

      const sessData = await sessRes.json();
      const lecData = await lecRes.json();

      if (sessData.status === 'success') setSessions(sessData.sessions || []);
      if (lecData.status === 'success') setLectures(lecData.lectures || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Meetings, Appointments & Sessions Calendar
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Consolidated schedule of your scheduled student mentoring appointments, guest webinars, and faculty collaboration meets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentorship Sessions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            Student Mentorship Sessions ({sessions.length})
          </h3>

          {loading ? (
            <div className="text-xs text-slate-400 py-4">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No mentoring sessions scheduled.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {s.topic}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mentee: <strong>{s.student_name}</strong> • Mode: {s.meeting_mode}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{s.scheduled_date} at {s.scheduled_time}</span>
                  </p>
                  {s.meeting_link_or_venue && (
                    <a
                      href={s.meeting_link_or_venue}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline pt-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{s.meeting_link_or_venue}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guest Lectures */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            Guest Lectures & Webinars ({lectures.length})
          </h3>

          {loading ? (
            <div className="text-xs text-slate-400 py-4">Loading lectures...</div>
          ) : lectures.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No guest lectures proposed or scheduled.</p>
          ) : (
            <div className="space-y-3">
              {lectures.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {l.topic}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {l.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Target: {l.target_department} • {l.mode}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{l.proposed_date} at {l.proposed_time}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
