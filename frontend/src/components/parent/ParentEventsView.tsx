import React, { useState, useEffect } from 'react';
import {
  PartyPopper,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentEventsViewProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentEventsView: React.FC<ParentEventsViewProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [data, setData] = useState<any>({ invitations: [], campusEvents: [] });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!parentEmail) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/parent/events?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild?.roll_number || '')}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [parentEmail, selectedChild?.roll_number]);

  const handleRsvp = async (invitationId: string, status: 'Accepted' | 'Declined' | 'Tentative') => {
    setUpdatingId(invitationId);
    try {
      const res = await fetch(`http://localhost:5000/api/parent/events/${invitationId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvpStatus: status }),
      });
      const json = await res.json();
      if (json.success) {
        fetchEvents();
      }
    } catch (err) {
      console.error('RSVP update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const invitations = data.invitations || [];
  const campusEvents = data.campusEvents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <PartyPopper className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Events, PTM & Institutional Invitations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Parent-Teacher assemblies, campus fests, academic orientations, and official RSVPs
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Invitations</span>
        </button>
      </div>

      {/* Official Parent Invitations */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Official Parent Invitations ({invitations.length})
        </h3>

        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((inv: any) => {
              const isAccepted = inv.rsvp_status === 'Accepted';
              const isDeclined = inv.rsvp_status === 'Declined';

              return (
                <div
                  key={inv.invitation_id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 uppercase">
                        Invitation
                      </span>
                      <span className="text-xs text-slate-400">
                        From: {inv.faculty_name} ({inv.faculty_email})
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {inv.event_title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                      {inv.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        Date: {inv.event_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        Time: {inv.event_time || '10:00 AM'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        Venue: {inv.venue}
                      </span>
                    </div>
                  </div>

                  {/* RSVP Buttons */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-[11px] font-bold text-slate-500">
                      Current RSVP: <strong className="text-teal-600 dark:text-teal-400">{inv.rsvp_status || 'Pending'}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRsvp(inv.invitation_id, 'Accepted')}
                        disabled={updatingId === inv.invitation_id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isAccepted
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        Accept RSVP
                      </button>

                      <button
                        onClick={() => handleRsvp(inv.invitation_id, 'Declined')}
                        disabled={updatingId === inv.invitation_id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isDeclined
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No personalized event invitations sent to your account at this time.
          </div>
        )}
      </div>

      {/* Campus Public Events */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <PartyPopper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Campus Assemblies & Cultural Events ({campusEvents.length})
        </h3>

        {campusEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campusEvents.map((ev: any) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                    {ev.category || 'Campus Event'}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {ev.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                  <span>{ev.event_date}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{ev.venue}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No upcoming campus assemblies scheduled.
          </div>
        )}
      </div>
    </div>
  );
};
