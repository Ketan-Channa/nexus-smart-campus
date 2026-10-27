import React, { useState, useEffect } from 'react';
import {
  Video,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentFacultyMeetingsProps {
  parentEmail: string;
  parentName?: string;
  selectedChild: LinkedStudent | null;
}

export const ParentFacultyMeetings: React.FC<ParentFacultyMeetingsProps> = ({
  parentEmail,
  parentName = 'Parent',
  selectedChild,
}) => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<any | null>(null);

  // Form State
  const [meetingTitle, setMeetingTitle] = useState('Academic Progress Review');
  const [facultyName, setFacultyName] = useState('Dr. SMB');
  const [facultyEmail, setFacultyEmail] = useState('faculty@nexus.edu');
  const [meetingPurpose, setMeetingPurpose] = useState('Academic Performance');
  const [meetingDate, setMeetingDate] = useState('2026-11-05');
  const [startTime, setStartTime] = useState('11:00 AM');
  const [endTime, setEndTime] = useState('11:30 AM');
  const [meetingType, setMeetingType] = useState('In-Person');
  const [meetingLocation, setMeetingLocation] = useState('Faculty Block A • Room 304');
  const [submitting, setSubmitting] = useState(false);

  // Action State (Respond / Reschedule)
  const [actionStatus, setActionStatus] = useState<'Confirmed' | 'Rescheduled' | 'Cancelled'>('Confirmed');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchMeetings = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nexus-smart-campus-backend.onrender.com/api/parent/meetings?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setMeetings(json.meetings || []);
      }
    } catch (err) {
      console.error('Fetch meetings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [parentEmail, selectedChild?.roll_number]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild?.roll_number) return;

    setSubmitting(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/parent/meetings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail,
          parentName,
          studentRoll: selectedChild.roll_number,
          studentName: selectedChild.full_name,
          facultyEmail,
          facultyName,
          meetingTitle,
          meetingPurpose,
          meetingDate,
          startTime,
          endTime,
          meetingType,
          meetingLocation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMeetings();
        setShowRequestModal(false);
      } else {
        alert(data.message || 'Failed to submit request');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showActionModal) return;

    setActionSubmitting(true);
    try {
      const res = await fetch(
        `https://nexus-smart-campus-backend.onrender.com/api/parent/meetings/${showActionModal.meeting_id}/respond`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: actionStatus,
            followUpNotes,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchMeetings();
        setShowActionModal(null);
      } else {
        alert(data.message || 'Failed to update meeting');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Faculty Consultations & Appointments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Schedule and manage parent-faculty meetings for {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMeetings}
            disabled={loading}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all"
            title="Refresh Meetings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Appointment</span>
          </button>
        </div>
      </div>

      {/* Meetings List */}
      {meetings.length > 0 ? (
        <div className="space-y-4">
          {meetings.map((m: any) => {
            const isConfirmed = m.status === 'Confirmed' || m.status === 'Scheduled';
            const isPending = m.status === 'Pending Request';
            const isCancelled = m.status === 'Cancelled';

            return (
              <div
                key={m.meeting_id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {m.status}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      Initiator: {m.initiator || 'Faculty'}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {m.meeting_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      Faculty: <strong className="text-slate-800 dark:text-slate-200">{m.faculty_name}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      {m.meeting_date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      {m.start_time} - {m.end_time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      {m.meeting_location || 'Campus'}
                    </span>
                  </div>

                  {m.follow_up_notes && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 italic">
                      Notes: "{m.follow_up_notes}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  {isPending && m.initiator === 'Faculty' && (
                    <button
                      onClick={() => {
                        setShowActionModal(m);
                        setActionStatus('Confirmed');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                    >
                      Accept Invite
                    </button>
                  )}

                  {!isCancelled && (
                    <button
                      onClick={() => {
                        setShowActionModal(m);
                        setActionStatus('Rescheduled');
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                    >
                      Reschedule / Respond
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Meetings Scheduled</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You currently have no scheduled appointments with {selectedChild?.full_name}'s professors. Click "Request Appointment" to propose a consultation.
          </p>
        </div>
      )}

      {/* Modal: Request Appointment */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Schedule Faculty Consultation
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Faculty Professor *
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Faculty Email
                  </label>
                  <input
                    type="email"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Meeting Mode & Venue
                </label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Respond / Reschedule */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
              Respond to: {showActionModal.meeting_title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              With {showActionModal.faculty_name} on {showActionModal.meeting_date} ({showActionModal.start_time})
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Decision
                </label>
                <select
                  value={actionStatus}
                  onChange={(e: any) => setActionStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Confirmed">Confirm & Accept Time</option>
                  <option value="Rescheduled">Suggest Alternate Time</option>
                  <option value="Cancelled">Decline / Cancel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Remarks / Alternate Time Notes
                </label>
                <textarea
                  rows={3}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Can we meet after 2 PM or over online call?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  {actionSubmitting ? 'Updating...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
