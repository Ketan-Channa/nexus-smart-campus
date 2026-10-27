import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  User,
  Users,
  MessageSquare,
  Paperclip,
  Download,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Bell,
  Check,
  X,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { type UserSession } from '../../types/auth';
import { useRealtimeEvent } from '../../context/RealtimeContext';

const API_BASE = 'http://localhost:5000/api';

export interface AnnouncementItem {
  id: number;
  announcementId: string;
  title: string;
  message: string;
  category: string;
  targetAudience: string;
  targetClass: string;
  targetType: string;
  targetDepartment?: string;
  targetStudentEmail?: string;
  facultyName: string;
  facultyEmail: string;
  attachmentUrl?: string;
  priority: string;
  requiresAcknowledgement: boolean;
  expiresAt?: string;
  status: string;
  createdAt: string;
  acknowledgementCount: number;
  recipientCount: number;
  questionCount: number;
}

export interface AcknowledgementAnalytics {
  announcementId: string;
  title: string;
  targetClass: string;
  totalRecipients: number;
  acknowledgedCount: number;
  unacknowledgedCount: number;
  acknowledgements: Array<{
    id: number;
    studentEmail: string;
    studentName: string;
    studentRoll: string;
    acknowledgedAt: string;
  }>;
  unacknowledgedStudents: Array<{
    id: number;
    name: string;
    rollNumber: string;
    email: string;
    className: string;
  }>;
}

interface FacultyAnnouncementsManagerProps {
  session?: UserSession | null;
}

export const FacultyAnnouncementsManager: React.FC<FacultyAnnouncementsManagerProps> = ({ session }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [selectedAckModal, setSelectedAckModal] = useState<AcknowledgementAnalytics | null>(null);

  // Announcement Form State
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [category, setCategory] = useState<string>('Academic');
  const [priority, setPriority] = useState<string>('Normal');
  const [targetAudience, setTargetAudience] = useState<string>('Class');
  const [targetClass, setTargetClass] = useState<string>('B.TECH CSE 2023 A');
  const [targetType, setTargetType] = useState<string>('ENTIRE_CLASS');
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState<boolean>(true);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [publishing, setPublishing] = useState<boolean>(false);

  // Quick Reminder Form State
  const [reminderTitle, setReminderTitle] = useState<string>('');
  const [reminderMessage, setReminderMessage] = useState<string>('');
  const [reminderTargetClass, setReminderTargetClass] = useState<string>('B.TECH CSE 2023 A');
  const [reminderType, setReminderType] = useState<string>('ASSIGNMENT');
  const [sendingReminder, setSendingReminder] = useState<boolean>(false);

  const facultyEmail = session?.email || 'faculty@nexus.edu';
  const facultyName = session?.name || 'Dr. SMB';

  // Real-Time Socket Listeners (Phase 5 Pipeline)
  useRealtimeEvent('announcement.created', () => {
    console.log('📡 [Faculty Socket] Realtime announcement.created received -> Refreshing roster');
    fetchAnnouncements();
  });

  useRealtimeEvent('announcement.acknowledged', (payload: any) => {
    console.log('🎉 [Faculty Socket] Realtime announcement.acknowledged received:', payload);
    fetchAnnouncements();
    if (selectedAckModal && selectedAckModal.announcementId === payload.announcementId) {
      fetchAcknowledgementAnalytics(payload.announcementId);
    }
  });

  useRealtimeEvent('announcement.question.created', () => {
    console.log('📡 [Faculty Socket] Realtime announcement.question.created received');
    fetchAnnouncements();
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/faculty/announcements`, {
        params: { facultyEmail },
      });
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch announcements:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [facultyEmail]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out announcement title and message.');
      return;
    }

    try {
      setPublishing(true);
      const res = await axios.post(`${API_BASE}/faculty/announcements/create`, {
        title,
        message,
        category,
        priority,
        targetAudience,
        targetClass,
        targetType,
        facultyName,
        facultyEmail,
        attachmentUrl,
        requiresAcknowledgement,
        expiresAt: expiryDate ? `${expiryDate} 23:59:59` : null,
      });

      if (res.data.success) {
        alert(`🎉 ${res.data.message}`);
        setIsCreateModalOpen(false);
        setTitle('');
        setMessage('');
        setAttachmentUrl('');
        fetchAnnouncements();
      }
    } catch (err: any) {
      alert(`✕ Publication Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderMessage.trim()) {
      alert('Please fill out reminder title and message.');
      return;
    }

    try {
      setSendingReminder(true);
      const res = await axios.post(`${API_BASE}/faculty/reminders/send`, {
        title: reminderTitle,
        message: reminderMessage,
        targetClass: reminderTargetClass,
        facultyName,
        facultyEmail,
        reminderType,
      });

      if (res.data.success) {
        alert(`🎉 ${res.data.message}`);
        setIsReminderModalOpen(false);
        setReminderTitle('');
        setReminderMessage('');
      }
    } catch (err: any) {
      alert(`✕ Reminder Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSendingReminder(false);
    }
  };

  const fetchAcknowledgementAnalytics = async (announcementId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/faculty/announcements/${announcementId}/acknowledgements`);
      if (res.data.success) {
        setSelectedAckModal(res.data);
      }
    } catch (err: any) {
      alert('Failed to fetch acknowledgement analytics.');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string, titleStr: string) => {
    if (window.confirm(`Are you sure you want to delete the announcement "${titleStr}"?`)) {
      try {
        const res = await axios.delete(`${API_BASE}/faculty/announcements/${announcementId}`);
        if (res.data.success) {
          alert('🗑️ Announcement deleted successfully.');
          fetchAnnouncements();
        }
      } catch (err: any) {
        alert('Failed to delete announcement.');
      }
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesQuery = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    return matchesQuery && matchesCategory && matchesPriority;
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-500/30 w-full">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            NEXUS Phase 8 Faculty Studio
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Announcements, Alerts & Class Broadcasts
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed">
            Publish official academic notices, assignment reminders & alerts to student classes with real-time bidirectional student acknowledgement tracking!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Send Quick Reminder</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 border border-indigo-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Announcement</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Search Bulletins:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, message, class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Filter:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Assignment">Assignment</option>
            <option value="Examination">Examination</option>
            <option value="Timetable">Timetable</option>
            <option value="General">General</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Filter:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="All">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="Important">Important</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* ANNOUNCEMENT CARDS GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold text-sm">
          Loading Faculty Announcements from Database...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Megaphone className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">No Announcements Published Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Create New Announcement" to post official academic circulars to your classes!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((anc) => (
            <div
              key={anc.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-amber-500 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full font-black text-[10px] uppercase ${
                      anc.priority === 'Urgent' || anc.priority === 'High'
                        ? 'bg-rose-500 text-white'
                        : anc.priority === 'Important'
                        ? 'bg-amber-500 text-white'
                        : 'bg-indigo-500 text-white'
                    }`}
                  >
                    {anc.priority}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-300">
                    Category: {anc.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 font-bold text-[10px] text-purple-700 dark:text-purple-300">
                    Target: {anc.targetClass}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(anc.createdAt).toLocaleDateString()} at {new Date(anc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => handleDeleteAnnouncement(anc.announcementId, anc.title)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-display font-black text-xl text-slate-900 dark:text-white leading-tight mb-2">
                  {anc.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {anc.message}
                </p>
              </div>

              {/* REAL-TIME ACKNOWLEDGEMENT BAR */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Acknowledged:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black text-sm">
                      {anc.acknowledgementCount} / {anc.recipientCount} Students
                    </span>
                  </div>
                  {anc.requiresAcknowledgement && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      Acknowledgement Mandatory ✓
                    </span>
                  )}
                </div>

                <button
                  onClick={() => fetchAcknowledgementAnalytics(anc.announcementId)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Student Acknowledgement Roster</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: CREATE ANNOUNCEMENT FORM */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleCreateAnnouncement}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-500" />
              Publish New Faculty Announcement
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title:</label>
                <input
                  type="text"
                  placeholder="Announcement Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class:</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="B.TECH CSE 2023 A">B.TECH CSE 2023 A</option>
                    <option value="B.TECH CSE 2024 A">B.TECH CSE 2024 A</option>
                    <option value="B.TECH ECE 2023 A">B.TECH ECE 2023 A</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Examination">Examination</option>
                    <option value="Timetable">Timetable</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Message Content:</label>
                <textarea
                  rows={4}
                  placeholder="Enter clear announcement details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reqAck"
                  checked={requiresAcknowledgement}
                  onChange={(e) => setRequiresAcknowledgement(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="reqAck" className="font-bold text-slate-800 dark:text-slate-200">
                  Require Student Acknowledgement Button [Acknowledge]
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={publishing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                {publishing ? 'Publishing...' : 'Publish Announcement Now'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: SEND QUICK REMINDER */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSendReminder}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Dispatch Quick Academic Reminder
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reminder Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Blockchain Assignment Deadline Tomorrow"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class:</label>
                <select
                  value={reminderTargetClass}
                  onChange={(e) => setReminderTargetClass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="B.TECH CSE 2023 A">B.TECH CSE 2023 A</option>
                  <option value="B.TECH CSE 2024 A">B.TECH CSE 2024 A</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reminder Content:</label>
                <textarea
                  rows={3}
                  placeholder="Enter short reminder details..."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingReminder}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
              >
                {sendingReminder ? 'Sending...' : 'Dispatch Reminder Now'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ACKNOWLEDGEMENT ANALYTICS ROSTER */}
      {selectedAckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAckModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Student Acknowledgement Analytics Roster
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                Announcement: "{selectedAckModal.title}" ({selectedAckModal.targetClass})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                <p className="font-bold text-slate-500">Total Class Roster</p>
                <p className="font-mono font-black text-2xl text-indigo-600 dark:text-indigo-400">
                  {selectedAckModal.totalRecipients}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <p className="font-bold text-slate-500">Acknowledged</p>
                <p className="font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400">
                  {selectedAckModal.acknowledgedCount}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                <p className="font-bold text-slate-500">Pending Acknowledgement</p>
                <p className="font-mono font-black text-2xl text-rose-600 dark:text-rose-400">
                  {selectedAckModal.unacknowledgedCount}
                </p>
              </div>
            </div>

            {/* ACKNOWLEDGED STUDENTS TABLE */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Acknowledged Students List ({selectedAckModal.acknowledgements.length}):
              </h4>
              {selectedAckModal.acknowledgements.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No students have acknowledged yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-2xl overflow-hidden text-xs">
                  {selectedAckModal.acknowledgements.map((a) => (
                    <div key={a.id} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{a.studentName} ({a.studentRoll})</p>
                        <p className="text-[10px] text-slate-400">{a.studentEmail}</p>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        ✓ {new Date(a.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedAckModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Close Roster Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
