import React, { useState, useEffect } from 'react';
import {
  Network,
  Compass,
  FlaskConical,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Briefcase,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminAlumniCareerResearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'lectures' | 'research'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jRes, lRes, rRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/alumni/jobs'),
        fetch('http://localhost:5000/api/admin/alumni/mentorship'),
        fetch('http://localhost:5000/api/admin/research/projects'),
      ]);
      const jData = await jRes.json();
      const lData = await lRes.json();
      const rData = await rRes.json();
      if (jData.status === 'success') setJobs(jData.jobs || []);
      if (lData.status === 'success') setLectures(lData.lectures || []);
      if (rData.status === 'success') setResearch(rData.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModerateJob = async (jobId: string | number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/alumni/jobs/moderate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status, adminEmail: 'admin@nexus.edu' }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`Job opportunity marked as ${status}!`);
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  const handleUpdateLecture = async (lectureId: string | number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/alumni/guest-lectures/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId, status, adminEmail: 'admin@nexus.edu' }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`Guest lecture marked as ${status}!`);
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Alumni Career Opportunities, Guest Lectures & Research Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Moderate job referrals, authorize alumni guest lectures, and supervise faculty research collaborations.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'jobs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Job & Internship Postings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('lectures')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'lectures'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Alumni Guest Lectures ({lectures.length})
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'research'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Faculty Research Projects ({research.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'jobs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              No job postings currently in moderation queue.
            </div>
          ) : (
            jobs.map((job) => {
              const isApproved = job.moderation_status === 'APPROVED';
              return (
                <div key={job.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{job.job_title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {job.moderation_status || 'PENDING'}
                      </span>
                    </div>

                    <div className="text-xs text-indigo-300 font-semibold">{job.company}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {job.location} • {job.work_mode || 'Hybrid'} • {job.employment_type || 'Full Time'}
                    </div>

                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{job.description}</p>
                    <div className="text-[10px] text-slate-500 font-mono mt-2">
                      Posted by: {job.posted_by_name} ({job.posted_by_email})
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">{job.salary_range || 'Competitive'}</span>
                    {!isApproved ? (
                      <div className="space-x-1.5">
                        <button
                          onClick={() => handleModerateJob(job.job_id || job.id, 'APPROVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateJob(job.job_id || job.id, 'REJECTED')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold">Active Listing</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'lectures' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lectures.map((l) => (
            <div key={l.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{l.topic}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {l.status || 'PROPOSED'}
                  </span>
                </div>
                <div className="text-xs text-sky-300 font-medium">
                  Speaker: {l.alumni_name} ({l.alumni_designation || 'Alumnus'})
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Proposed: {l.proposed_date} at {l.proposed_time} • {l.mode || 'Online'}
                </div>
                {l.abstract_desc && (
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{l.abstract_desc}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Dept: {l.target_department || 'All'}</span>
                {l.status !== 'APPROVED' ? (
                  <button
                    onClick={() => handleUpdateLecture(l.lecture_id || l.id, 'APPROVED')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
                  >
                    Approve Lecture
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-semibold">Scheduled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {research.map((proj) => (
            <div key={proj.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">{proj.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {proj.project_stage || 'Active'}
                </span>
              </div>
              <div className="text-xs text-emerald-400 font-medium">Domain: {proj.research_domain}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                PI: {proj.creator_name} ({proj.department})
              </div>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2">{proj.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
