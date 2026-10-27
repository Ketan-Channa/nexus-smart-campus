import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  Sparkles,
  ExternalLink,
  Tag,
  Building2,
  X,
} from 'lucide-react';

interface AlumniEventsAndReunionsProps {
  session: any;
}

export const AlumniEventsAndReunions: React.FC<AlumniEventsAndReunionsProps> = ({ session }) => {
  const userEmail = session?.email || '';
  const userName = session?.name || 'Alumnus';

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Event State
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('Alumni Reunion');
  const [venue, setVenue] = useState('Campus Main Auditorium');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('11:00 AM');
  const [description, setDescription] = useState('');
  const [eventMode, setEventMode] = useState('Offline');
  const [targetBatch, setTargetBatch] = useState('All Batches');

  useEffect(() => {
    fetchEvents();
  }, []);

  // Realtime listeners
  useEffect(() => {
    const handleEventCreated = () => fetchEvents();
    const handleRsvpUpdated = () => fetchEvents();
    window.addEventListener('event.created', handleEventCreated);
    window.addEventListener('event.rsvp.updated', handleRsvpUpdated);
    return () => {
      window.removeEventListener('event.created', handleEventCreated);
      window.removeEventListener('event.rsvp.updated', handleRsvpUpdated);
    };
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/alumni/events');
      const data = await res.json();
      if (data.status === 'success') {
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId: string, rsvpStatus: 'GOING' | 'MAYBE' | 'DECLINED') => {
    try {
      const res = await fetch(`http://localhost:5000/api/alumni/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          userName,
          userRole: 'Alumni',
          rsvpStatus,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRsvpSuccess(`RSVP recorded as ${rsvpStatus}!`);
        fetchEvents();
        setTimeout(() => setRsvpSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/alumni/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerEmail: userEmail,
          organizerName: userName,
          eventName,
          category,
          venue,
          eventDate,
          eventTime,
          description,
          eventMode,
          targetBatch,
          targetAudience: 'All (Student & Faculty & Alumni)',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRsvpSuccess('Event published and broadcasted to campus in realtime!');
        setShowCreateModal(false);
        setEventName('');
        setDescription('');
        fetchEvents();
        setTimeout(() => setRsvpSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {rsvpSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{rsvpSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Alumni Reunions, Campus Events & Invitations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reconnect with batchmates, participate in campus cultural and technical festivals, and manage your RSVPs.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Host Reunion / Event</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading campus events from database...</div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No scheduled events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-400 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                    {evt.category || 'Alumni Reunion'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {evt.event_date || evt.start_date || 'Upcoming'}
                  </span>
                </div>

                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  {evt.event_name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.venue || 'Campus Auditorium'} ({evt.event_mode || 'Offline'})</span>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {evt.description}
                </p>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Batch: <strong className="text-slate-700 dark:text-slate-300">{evt.target_batch || 'All'}</strong></span>
                  <span>Registered: <strong className="text-purple-600 dark:text-purple-400">{evt.registered_count || 1} Attending</strong></span>
                </div>
              </div>

              {/* RSVP Action Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Your RSVP:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRsvp(evt.event_id, 'GOING')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Going
                  </button>
                  <button
                    onClick={() => handleRsvp(evt.event_id, 'MAYBE')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs transition-all"
                  >
                    Maybe
                  </button>
                  <button
                    onClick={() => handleRsvp(evt.event_id, 'DECLINED')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 font-bold text-xs transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Host Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Publish Alumni Reunion / Event
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. 2021-2023 Batch Silver Jubilee Reunion"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Time
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Mode
                  </label>
                  <select
                    value={eventMode}
                    onChange={(e) => setEventMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="Offline">Offline (Campus Grounds)</option>
                    <option value="Online">Online Webinar</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Batch
                </label>
                <input
                  type="text"
                  value={targetBatch}
                  onChange={(e) => setTargetBatch(e.target.value)}
                  placeholder="e.g. All Batches, Class of 2023"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event itinerary, dress code, guest speakers..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
