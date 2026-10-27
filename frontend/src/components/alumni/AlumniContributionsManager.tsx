import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Send,
  Plus,
} from 'lucide-react';

interface AlumniContributionsManagerProps {
  session: any;
}

export const AlumniContributionsManager: React.FC<AlumniContributionsManagerProps> = ({ session }) => {
  const userEmail = session?.email || '';
  const userName = session?.name || 'Alumnus';

  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [contribType, setContribType] = useState('Mock Interviews');
  const [details, setDetails] = useState('');
  const [availabilityPeriod, setAvailabilityPeriod] = useState('Weekends (2 Hours / Week)');

  useEffect(() => {
    fetchContributions();
  }, [userEmail]);

  const fetchContributions = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/contributions?alumniEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setContributions(data.contributions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniEmail: userEmail,
          alumniName: userName,
          contributionType: contribType,
          details,
          availabilityPeriod,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccessMsg('Volunteering interest registered with campus administration!');
        setShowSubmitModal(false);
        setDetails('');
        fetchContributions();
        setTimeout(() => setSuccessMsg(null), 3000);
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
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              Alumni Contributions & Campus Volunteering
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Give back to your alma mater by offering voluntary time, evaluating student capstones, or leading mock technical interviews.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Volunteer Interest</span>
          </button>
        </div>
      </div>

      {/* Contribution Opportunities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Mock Technical Interviews',
            desc: 'Conduct 45-min practice coding and system design interviews for final year students.',
            type: 'Mock Interviews',
          },
          {
            title: 'Student Project & Capstone Judge',
            desc: 'Review major semester capstone projects, provide industry feedback, and award top teams.',
            type: 'Student Project Evaluation',
          },
          {
            title: 'Curriculum & Advisory Board',
            desc: 'Advise faculty on modern industry trends, tech stacks, and syllabus alignment.',
            type: 'Curriculum Advisory',
          },
        ].map((opp, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                Campus Initiative
              </span>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                {opp.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {opp.desc}
              </p>
            </div>

            <button
              onClick={() => {
                setContribType(opp.type);
                setShowSubmitModal(true);
              }}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Express Interest
            </button>
          </div>
        ))}
      </div>

      {/* My Active Contributions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-500" />
          My Registered Volunteering Commitments
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4">Loading contributions...</div>
        ) : contributions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No voluntary contributions registered yet. Choose an initiative above to express your interest.</p>
        ) : (
          <div className="space-y-3">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {c.contribution_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{c.details}</p>
                  <p className="text-[11px] text-slate-400">Availability: {c.availability_period}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              Volunteer for Campus Initiatives
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initiative Type
                </label>
                <select
                  value={contribType}
                  onChange={(e) => setContribType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                >
                  <option value="Mock Interviews">Mock Technical Interviews</option>
                  <option value="Student Project Evaluation">Student Project Evaluation & Capstone Judge</option>
                  <option value="Curriculum Advisory">Curriculum & Industry Advisory</option>
                  <option value="Campus Workshop">Campus Hands-on Workshop</option>
                  <option value="Career Guidance">Career Guidance & AMA Session</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Availability / Preferred Schedule
                </label>
                <input
                  type="text"
                  value={availabilityPeriod}
                  onChange={(e) => setAvailabilityPeriod(e.target.value)}
                  placeholder="e.g. Alternate Saturdays, 2 Hours"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Details & Specific Areas of Support
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Mention topics, formats, or special skills you'd love to share with students..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md"
                >
                  Register Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
