import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  RefreshCw,
  X,
  Radio,
  Send,
} from 'lucide-react';

export const AdminAnnouncementsEvents: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // New Announcement Modal
  const [showAnnModal, setShowAnnModal] = useState<boolean>(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    targetAudience: 'ALL',
    priority: 'HIGH',
    isPinned: true,
  });

  // New Event Modal
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Cultural Festival',
    eventDate: '2026-11-15',
    startTime: '10:00 AM',
    venue: 'Auditorium Central',
    organizer: 'Office of Student Welfare',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, eRes] = await Promise.all([
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/announcements'),
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/events'),
      ]);
      const aData = await aRes.json();
      const eData = await eRes.json();
      if (aData.status === 'success') setAnnouncements(aData.announcements || []);
      if (eData.status === 'success') setEvents(eData.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...annForm,
          publisherName: 'Office of the Registrar',
          publisherEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowAnnModal(false);
        setAnnForm({ title: '', description: '', category: 'GENERAL', targetAudience: 'ALL', priority: 'HIGH', isPinned: true });
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowEventModal(false);
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg('Announcement archived successfully.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Campus Announcements, Circulars & Events
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast authoritative notices across portals and publish official institutional events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'announcements' ? (
            <button
              onClick={() => setShowAnnModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast Circular
            </button>
          ) : (
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Publish Campus Event
            </button>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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
          onClick={() => setActiveTab('announcements')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'announcements'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Campus Circulars & Notices ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'events'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Campus Events & Festivals ({events.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'announcements' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                ann.is_pinned
                  ? 'bg-indigo-950/20 border-indigo-500/40'
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {ann.is_pinned === 1 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        PINNED
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Target: {ann.target_audience || 'ALL'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{ann.title}</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-3">{ann.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>By: {ann.publisher_name}</span>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1 rounded hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div key={ev.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    {ev.category || 'Event'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Approved</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{ev.title}</h4>
                <div className="text-xs text-slate-400 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>{ev.event_date} at {ev.start_time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{ev.venue}</span>
                  </div>
                </div>
                {ev.description && (
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{ev.description}</p>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                Organizer: {ev.organizer || 'Campus Life'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                Broadcast Campus Circular
              </h3>
              <button onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for End-Term Practical Exams Nov 2026"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Audience</label>
                <select
                  value={annForm.targetAudience}
                  onChange={(e) => setAnnForm({ ...annForm, targetAudience: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="ALL">Entire Campus (All Portals)</option>
                  <option value="Student">Students Only</option>
                  <option value="Faculty">Faculty Only</option>
                  <option value="Parent">Parents Only</option>
                  <option value="Alumni">Alumni Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Circular Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Official notice body..."
                  value={annForm.description}
                  onChange={(e) => setAnnForm({ ...annForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Broadcast Realtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Publish Campus Event
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEXUS Annual Tech Fest 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time</label>
                  <input
                    type="text"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Venue</label>
                <input
                  type="text"
                  required
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
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
