import React, { useState, useEffect } from 'react';
import {
  Video,
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle2,
  Calendar,
  User,
  X,
  HeartHandshake,
} from 'lucide-react';

export const AdminParentConnectGovernance: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'meetings' | 'feedback'>('meetings');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Response Modal for Feedback
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [responseText, setResponseText] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, fRes] = await Promise.all([
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/parents/meetings'),
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/parents/feedback'),
      ]);
      const mData = await mRes.json();
      const fData = await fRes.json();
      if (mData.status === 'success') setMeetings(mData.meetings || []);
      if (fData.status === 'success') setFeedback(fData.feedback || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback || !responseText) return;
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/parents/feedback/resolve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: selectedFeedback.id || selectedFeedback.feedback_id,
          responseText,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setSelectedFeedback(null);
        setResponseText('');
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-400" />
            Parent Connect, PTM Meetings & Feedback Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Oversee Faculty–Parent appointment schedules, monitor escalations, and issue official administrative feedback responses.
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
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'meetings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Scheduled Parent–Teacher Meetings ({meetings.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'feedback'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Parent Concerns & Feedback Inquiries ({feedback.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'meetings' ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Meeting Title</th>
                  <th className="py-3 px-4">Parent & Contact</th>
                  <th className="py-3 px-4">Faculty Host</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Mode & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {meetings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No parent meetings currently scheduled.
                    </td>
                  </tr>
                ) : (
                  meetings.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">
                        {m.meeting_title || 'PTM Conference'}
                        <div className="text-[10px] text-slate-400">{m.meeting_purpose || 'Academic Progress'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{m.parent_name}</div>
                        <div className="text-[10px] text-indigo-300 font-mono">Roll: {m.student_roll}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{m.faculty_name}</div>
                        <div className="text-[10px] text-slate-400">{m.faculty_email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {m.meeting_date} • {m.start_time}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {m.status || 'Confirmed'} ({m.meeting_type || 'Online'})
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Subject & Category</th>
                  <th className="py-3 px-4">Parent</th>
                  <th className="py-3 px-4">Concern Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {feedback.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No parent feedback inquiries pending.
                    </td>
                  </tr>
                ) : (
                  feedback.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{fb.subject || 'Campus Inquiry'}</div>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                          {fb.feedback_category || 'Academics'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{fb.parent_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{fb.parent_email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {fb.message}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            fb.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {fb.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {fb.status !== 'Resolved' ? (
                          <button
                            onClick={() => {
                              setSelectedFeedback(fb);
                              setResponseText('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition text-[11px]"
                          >
                            Resolve & Reply
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Official Administrative Response
              </h3>
              <button onClick={() => setSelectedFeedback(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>Parent: <strong className="text-white">{selectedFeedback.parent_name}</strong></div>
              <div>Inquiry: "{selectedFeedback.message}"</div>
            </div>

            <form onSubmit={handleResolveFeedback} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Official University Response</label>
                <textarea
                  required
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="State the resolution and institutional action taken..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
                >
                  Send Resolution to Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
