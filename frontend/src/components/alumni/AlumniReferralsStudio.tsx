import React, { useState, useEffect } from 'react';
import {
  Share2,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  MessageSquare,
  Clock,
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles,
  Send,
  X,
} from 'lucide-react';

interface AlumniReferralsStudioProps {
  session: any;
  onOpenChatWithUser?: (targetEmail: string, targetName: string) => void;
}

export const AlumniReferralsStudio: React.FC<AlumniReferralsStudioProps> = ({
  session,
  onOpenChatWithUser,
}) => {
  const userEmail = session?.email || '';

  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REFERRED' | 'DECLINED'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Response Modal State
  const [respondingRef, setRespondingRef] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'REFERRED' | 'DECLINED'>('REFERRED');
  const [referenceCode, setReferenceCode] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, [userEmail]);

  // Realtime listener
  useEffect(() => {
    const handleRefRequested = () => fetchReferrals();
    window.addEventListener('career.referral.requested', handleRefRequested);
    return () => window.removeEventListener('career.referral.requested', handleRefRequested);
  }, []);

  const fetchReferrals = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/alumni/referrals?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setReferrals(data.referrals || []);
      }
    } catch (e) {
      console.error('Error fetching referrals:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingRef) return;

    try {
      const res = await fetch(`http://localhost:5000/api/alumni/referrals/${respondingRef.referral_id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          referenceCode: actionType === 'REFERRED' ? referenceCode || `REF-${Date.now().toString().slice(-5)}` : null,
          feedback,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionSuccess(`Referral marked as ${actionType}!`);
        setRespondingRef(null);
        setReferenceCode('');
        setFeedback('');
        fetchReferrals();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-500" />
              Student Referral Requests & Endorsements
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review verified student applications and provide direct internal employee referrals for your company.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/60">
              {referrals.filter((r) => r.status === 'PENDING').length} Pending Requests
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
          {(['ALL', 'PENDING', 'REFERRED', 'DECLINED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-3 capitalize transition-all ${
                filter === tab
                  ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.toLowerCase()} ({referrals.filter((r) => tab === 'ALL' || r.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Referrals Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading referral applications...</div>
      ) : filteredReferrals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Share2 className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No referral requests found in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReferrals.map((ref) => {
            const isPending = ref.status === 'PENDING';
            return (
              <div
                key={ref.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      {ref.student_name}
                    </h3>
                    <span className="text-xs text-slate-500">
                      ({ref.student_department || 'Student'})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ref.status === 'REFERRED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : ref.status === 'DECLINED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {ref.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Applied for: {ref.job_title} at {ref.company}</span>
                  </p>

                  {ref.cover_note && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border">
                      "{ref.cover_note}"
                    </p>
                  )}

                  {/* Resume & Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    {ref.resume_url && (
                      <a
                        href={ref.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Resume Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {ref.portfolio_url && (
                      <a
                        href={ref.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline"
                      >
                        <span>Portfolio / GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {ref.referral_reference_code && (
                      <span className="text-[11px] font-mono font-bold text-emerald-600">
                        Ref Code: {ref.referral_reference_code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          setRespondingRef(ref);
                          setActionType('REFERRED');
                          setReferenceCode(`EMP-REF-${Date.now().toString().slice(-5)}`);
                          setFeedback('Profile endorsed and submitted internally.');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                      >
                        Refer Candidate
                      </button>
                      <button
                        onClick={() => {
                          setRespondingRef(ref);
                          setActionType('DECLINED');
                          setFeedback('Thank you for applying. Currently seeking candidates with more specialized experience.');
                        }}
                        className="px-3 py-2 rounded-xl border text-slate-600 hover:text-rose-600 font-bold text-xs"
                      >
                        Decline
                      </button>
                    </>
                  ) : null}

                  <button
                    onClick={() => {
                      if (onOpenChatWithUser) onOpenChatWithUser(ref.student_email, ref.student_name);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                    title="Message Student"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      {respondingRef && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                {actionType === 'REFERRED' ? 'Endorse & Refer Candidate' : 'Decline Referral Request'}
              </h3>
              <button onClick={() => setRespondingRef(null)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRespondSubmit} className="space-y-3 text-xs">
              <p className="text-slate-500">
                Applicant: <strong>{respondingRef.student_name}</strong> for <strong>{respondingRef.job_title}</strong>.
              </p>

              {actionType === 'REFERRED' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Employee Referral / Application Tracking Code
                  </label>
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Feedback / Confirmation Note to Student
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRespondingRef(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-md ${
                    actionType === 'REFERRED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
