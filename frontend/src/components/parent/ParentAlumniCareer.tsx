import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  Calendar,
  User,
  Building2,
  RefreshCw,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentAlumniCareerProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentAlumniCareer: React.FC<ParentAlumniCareerProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [data, setData] = useState<any>({ guestLectures: [], careerOpportunities: [] });
  const [loading, setLoading] = useState(true);

  const fetchCareer = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/parent/alumni-career');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Fetch alumni career error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareer();
  }, [parentEmail]);

  const lectures = data?.guestLectures || [];
  const jobs = data?.careerOpportunities || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Alumni Mentorship & Career Guidance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional career orientations, alumni guest talks, and campus placement awareness for {selectedChild?.full_name}
          </p>
        </div>

        <button
          onClick={fetchCareer}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Opportunities</span>
        </button>
      </div>

      {/* Career Talks & Alumni Masterclasses */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Alumni Guest Lectures & Industry Webinars ({lectures.length})
        </h3>

        {lectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lectures.map((lec: any) => (
              <div
                key={lec.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                    <span>{lec.mode || 'Online Webinar'}</span>
                    <span className="text-teal-600 dark:text-teal-400 font-extrabold">{lec.target_audience || 'All Engineering'}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {lec.topic}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {lec.description || 'Industry overview session hosted by verified alumnus.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    By: {lec.speaker_name} ({lec.speaker_company})
                  </span>
                  <span>{lec.preferred_date || 'Upcoming'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No alumni guest lectures currently open for registration.
          </div>
        )}
      </div>

      {/* Campus Placement & Internship Openings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Campus Hiring & Internship Drives ({jobs.length})
        </h3>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {job.title}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {job.job_type || 'Full-time'}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1 flex items-center gap-3">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{job.company_name}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>Level: {job.experience_level || 'Entry / Graduate'}</span>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px] font-medium self-start sm:self-auto">
                  Posted by verified alumnus
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No active placement postings available.
          </div>
        )}
      </div>
    </div>
  );
};
