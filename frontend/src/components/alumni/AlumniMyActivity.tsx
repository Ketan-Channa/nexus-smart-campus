import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Calendar,
  Award,
  Briefcase,
  Share2,
  Users,
  MessageSquare,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface AlumniMyActivityProps {
  session: any;
}

export const AlumniMyActivity: React.FC<AlumniMyActivityProps> = ({ session }) => {
  const userEmail = session?.email || '';

  const [jobs, setJobs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, [userEmail]);

  const fetchActivity = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const [jobsRes, sessRes, refRes] = await Promise.all([
        fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/jobs'),
        fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/mentorship/sessions?userEmail=${encodeURIComponent(userEmail)}`),
        fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/referrals?userEmail=${encodeURIComponent(userEmail)}`),
      ]);

      const jobsData = await jobsRes.json();
      const sessData = await sessRes.json();
      const refData = await refRes.json();

      if (jobsData.status === 'success') {
        const myJobs = (jobsData.jobs || []).filter(
          (j: any) => (j.posted_by_email || '').toLowerCase() === userEmail.toLowerCase()
        );
        setJobs(myJobs);
      }
      if (sessData.status === 'success') setSessions(sessData.sessions || []);
      if (refData.status === 'success') setReferrals(refData.referrals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          My Campus Activity & Impact Audit
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Summary of your engagement across student mentoring, job postings, referrals, and campus events.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{sessions.length}</div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Mentorship Sessions</div>
          <div className="text-[10px] text-slate-400">Hours invested in students</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{jobs.length}</div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Jobs & Internships Posted</div>
          <div className="text-[10px] text-slate-400">Opportunities created</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{referrals.length}</div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Referrals Handled</div>
          <div className="text-[10px] text-slate-400">Direct student endorsements</div>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Recent Engagement Log
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4">Loading activity history...</div>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Posted Job: {j.job_title}</span>
                    <span className="text-slate-400 block text-[11px]">{j.company} • {j.work_mode}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Status: {j.status || 'ACTIVE'}</span>
              </div>
            ))}

            {sessions.map((s) => (
              <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-purple-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Mentoring Session: {s.topic}</span>
                    <span className="text-slate-400 block text-[11px]">Mentee: {s.student_name}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600">{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
