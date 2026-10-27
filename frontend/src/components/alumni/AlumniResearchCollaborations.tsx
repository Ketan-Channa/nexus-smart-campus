import React, { useState, useEffect } from 'react';
import {
  Atom,
  Plus,
  Compass,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Building2,
  FileText,
  ExternalLink,
  X,
} from 'lucide-react';

interface AlumniResearchCollaborationsProps {
  session: any;
}

export const AlumniResearchCollaborations: React.FC<AlumniResearchCollaborationsProps> = ({ session }) => {
  const userEmail = session?.email || '';
  const userName = session?.name || 'Alumnus';

  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [expectedDuration, setExpectedDuration] = useState('3-6 Months');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeRole, setInviteeRole] = useState('Faculty');

  useEffect(() => {
    fetchCollaborations();
  }, [userEmail]);

  // Realtime listeners
  useEffect(() => {
    const handleCollab = () => fetchCollaborations();
    window.addEventListener('research.opportunity.created', handleCollab);
    window.addEventListener('research.request.updated', handleCollab);
    return () => {
      window.removeEventListener('research.opportunity.created', handleCollab);
      window.removeEventListener('research.request.updated', handleCollab);
    };
  }, []);

  const fetchCollaborations = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/collaborations?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCollaborations(data.collaborations || []);
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
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/collaborations/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviterEmail: userEmail,
          inviterName: userName,
          inviterRole: 'Alumni',
          inviteeEmail,
          inviteeName,
          inviteeRole,
          projectTitle,
          description,
          requiredSkills,
          expectedDuration,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatusMsg('Collaboration proposal dispatched in realtime!');
        setShowProposeModal(false);
        setProjectTitle('');
        setDescription('');
        setInviteeEmail('');
        fetchCollaborations();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRespond = async (collabId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/collaborations/${collabId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatusMsg(`Collaboration ${status.toLowerCase()}!`);
        fetchCollaborations();
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Atom className="w-5 h-5 text-purple-500" />
              Academic Research & Industry Collaborations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Partner with faculty members and students on inter-institutional research, patents, and technical publications.
            </p>
          </div>

          <button
            onClick={() => setShowProposeModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Collaboration</span>
          </button>
        </div>
      </div>

      {/* Collaborations List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading research initiatives...</div>
      ) : collaborations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Atom className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No active research collaborations found. Propose a project to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {collaborations.map((col) => {
            const isInvitee = (col.invitee_email || '').toLowerCase() === userEmail.toLowerCase();
            const isPending = col.status === 'PENDING';
            return (
              <div
                key={col.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-base text-slate-900 dark:text-white truncate">
                      {col.project_title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        col.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                          : col.status === 'DECLINED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                      }`}
                    >
                      {col.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {col.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span>Lead / Initiator: <strong className="text-slate-800 dark:text-slate-200">{col.inviter_name} ({col.inviter_role})</strong></span>
                    <span>Target Collaborator: <strong className="text-slate-800 dark:text-slate-200">{col.invitee_name} ({col.invitee_role})</strong></span>
                    <span>Timeline: {col.expected_duration}</span>
                  </div>
                </div>

                {isInvitee && isPending && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRespond(col.collab_id, 'ACCEPTED')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Accept Project
                    </button>
                    <button
                      onClick={() => handleRespond(col.collab_id, 'DECLINED')}
                      className="px-3 py-2 rounded-xl border text-slate-600 hover:text-rose-600 font-bold text-xs"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Atom className="w-5 h-5 text-purple-500" />
                Propose Research Collaboration
              </h3>
              <button onClick={() => setShowProposeModal(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProposeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus in Edge IoT Networks"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Abstract & Objectives
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize research questions, methodologies, and proposed outcomes..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Collaborator Role
                  </label>
                  <select
                    value={inviteeRole}
                    onChange={(e) => setInviteeRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="Faculty">Faculty Professor</option>
                    <option value="Student">Student Research Assistant</option>
                    <option value="Alumni">Fellow Alumnus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Duration
                  </label>
                  <input
                    type="text"
                    value={expectedDuration}
                    onChange={(e) => setExpectedDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Collaborator Name
                  </label>
                  <input
                    type="text"
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                    placeholder="e.g. Dr. SMB"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Collaborator Email
                  </label>
                  <input
                    type="email"
                    value={inviteeEmail}
                    onChange={(e) => setInviteeEmail(e.target.value)}
                    placeholder="faculty@nexus.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
