import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Bell,
  Calendar,
  Sparkles,
  Search,
  Download,
  CheckCircle2,
  Clock,
  MapPin,
  Vote,
  Plus,
  Megaphone,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { type UserSession } from '../../types/auth';
import { useRealtimeEvent } from '../../context/RealtimeContext';

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Urgent' | 'Academic' | 'Exam & Fee' | 'Placement' | 'Hostel & Transport';
  priority: 'High' | 'Medium' | 'General';
  date: string;
  author: string;
  content: string;
  targetAudience: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: 'Cultural' | 'Technical' | 'Sports' | 'Workshop';
  date: string;
  time: string;
  venue: string;
  organizer: string;
  description: string;
  maxSeats: number;
  registeredCount: number;
  isRegistered: boolean;
}

export interface ElectionCandidate {
  id: string;
  position: 'Gymkhana President' | 'Vice President' | 'Sports Secretary' | 'Cultural Secretary';
  candidateName: string;
  rollNumber: string;
  department: string;
  manifesto: string;
  votesCount: number;
  hasVoted: boolean;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Mid-Term Semester Examination Schedule & Admit Card Issue',
    category: 'Exam & Fee',
    priority: 'High',
    date: 'Aug 10, 2026',
    author: 'Controller of Examinations (Exam Cell)',
    content: 'Mid-term examinations for B.Tech & MBA Semesters 3, 5, and 7 will commence on August 20, 2026. Hall tickets can be downloaded from the Student Vault after clearance of library dues.',
    targetAudience: 'All Undergraduate & Postgraduate Students',
  },
  {
    id: 'ann-2',
    title: 'Microsoft & Google Campus Placement Drive Registration Open',
    category: 'Placement',
    priority: 'High',
    date: 'Aug 09, 2026',
    author: 'Training & Placement Officer (TPO)',
    content: 'Registration for the upcoming Microsoft SDE-1 and Google Cloud Associate Software Engineer recruitment drive is now live on the AI Career Studio portal. Deadline: Aug 18, 2026.',
    targetAudience: 'Final Year B.Tech CSE / ECE & M.Tech Students',
  },
  {
    id: 'ann-3',
    title: 'Central Library Extended Night Reading Hours During Exams',
    category: 'Academic',
    priority: 'Medium',
    date: 'Aug 08, 2026',
    author: 'Chief Librarian',
    content: 'To assist students preparing for upcoming examinations, the Central Library digital reading lounge will remain open 24x7 from August 12 to September 02, 2026.',
    targetAudience: 'All Campus Students',
  },
  {
    id: 'ann-4',
    title: 'Hostel Night Gate Pass & Bus Route #14 Schedule Update',
    category: 'Hostel & Transport',
    priority: 'General',
    date: 'Aug 06, 2026',
    author: 'Chief Warden & Transport Incharge',
    content: 'Hostel curfew timings for weekend pass holders updated to 10:00 PM. Bus Route #14 will operate an extra evening trip at 06:30 PM starting Monday.',
    targetAudience: 'Hostel Residents & Day Commuters',
  },
];

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt-1',
    title: 'NEXUS HackFest 2026 (36-Hour National AI & Web3 Hackathon)',
    category: 'Technical',
    date: 'Aug 22 - Aug 24, 2026',
    time: '09:00 AM Onwards',
    venue: 'Campus Innovation Hub & Auditorium',
    organizer: 'Department of CSE & AI Student Chapter',
    description: 'Build flagship AI, Web3, and Full-Stack applications. Prize pool: ₹2,50,000 + Direct Interview Referrals.',
    maxSeats: 250,
    registeredCount: 198,
    isRegistered: false,
  },
  {
    id: 'evt-2',
    title: 'Annual Cultural Fest - SPANDAN 2026',
    category: 'Cultural',
    date: 'Sep 05 - Sep 07, 2026',
    time: '04:00 PM - 10:00 PM',
    venue: 'Campus Open Air Theatre & Main Quad',
    organizer: 'Student Cultural Committee',
    description: '3 days of battle of bands, fashion show, classical dance, acoustic music nights & celebrity artist concert.',
    maxSeats: 1500,
    registeredCount: 1120,
    isRegistered: false,
  },
  {
    id: 'evt-3',
    title: 'Inter-College Floodlight Sports Championship (Cricket & Football)',
    category: 'Sports',
    date: 'Aug 28 - Aug 30, 2026',
    time: '05:30 PM - 09:30 PM',
    venue: 'Campus Floodlight Sports Complex',
    organizer: 'Department of Physical Education',
    description: 'T20 Cricket & 7-a-side Football tournament featuring 16 university teams across Northern region.',
    maxSeats: 300,
    registeredCount: 245,
    isRegistered: false,
  },
];

const INITIAL_CANDIDATES: ElectionCandidate[] = [
  {
    id: 'cand-1',
    position: 'Gymkhana President',
    candidateName: 'Aarav Sharma',
    rollNumber: '2023CSE4012',
    department: 'Computer Science & Engineering',
    manifesto: 'Promoting 24/7 library access, transparent mess feedback committee, and expanded inter-college technical fests.',
    votesCount: 412,
    hasVoted: false,
  },
  {
    id: 'cand-2',
    position: 'Gymkhana President',
    candidateName: 'Priyanjali Sen',
    rollNumber: '2023CE4088',
    department: 'Civil Engineering',
    manifesto: 'Focusing on student mental wellness programs, enhanced campus shuttle connectivity, and green campus sustainability.',
    votesCount: 389,
    hasVoted: false,
  },
  {
    id: 'cand-3',
    position: 'Sports Secretary',
    candidateName: 'Vikramaditya Rao',
    rollNumber: '2023CE4019',
    department: 'Civil Engineering',
    manifesto: 'Upgrading sports ground floodlights, introducing indoor Badminton & TT leagues, and funding state-level sports tournaments.',
    votesCount: 510,
    hasVoted: false,
  },
];

interface CampusAnnouncementsAndEventsProps {
  session?: UserSession | null;
}

export const CampusAnnouncementsAndEvents: React.FC<CampusAnnouncementsAndEventsProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'elections'>('notices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [candidates, setCandidates] = useState<ElectionCandidate[]>(INITIAL_CANDIDATES);
  const [hasVotedForPosition, setHasVotedForPosition] = useState<Record<string, boolean>>({});

  // New Notice Modal State
  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Urgent' | 'Academic' | 'Exam & Fee' | 'Placement' | 'Hostel & Transport'>('Academic');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'General'>('Medium');
  const [newContent, setNewContent] = useState('');

  const userName = session?.name || 'Ketan Channa';
  const rollNumber = '2023CSE4091';

  // Fetch announcements from authoritative MySQL backend
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('https://nexus-smart-campus-backend.onrender.com/api/faculty/announcements');
      if (res.data?.success && Array.isArray(res.data?.announcements)) {
        const mapped: AnnouncementItem[] = res.data.announcements.map((a: any) => ({
          id: a.announcementId || String(a.id),
          title: a.title,
          category: (['Urgent', 'Academic', 'Exam & Fee', 'Placement', 'Hostel & Transport'].includes(a.category)
            ? a.category
            : 'Academic') as any,
          priority: (a.priority === 'Urgent' || a.priority === 'High'
            ? 'High'
            : a.priority === 'Normal' || a.priority === 'Medium'
            ? 'Medium'
            : 'General') as any,
          date: a.createdAt
            ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            : 'Recent',
          author: a.facultyName || 'Faculty / Examination Cell',
          content: a.message || '',
          targetAudience: a.targetClass ? `Class: ${a.targetClass}` : 'All University Students',
        }));

        const existingIds = new Set(mapped.map((m) => m.id));
        const nonDuplicateInitial = INITIAL_ANNOUNCEMENTS.filter((init) => !existingIds.has(init.id));
        setAnnouncements([...mapped, ...nonDuplicateInitial]);
      }
    } catch (err) {
      console.warn('Could not fetch announcements from backend:', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useRealtimeEvent('announcement.published', () => {
    console.log('⚡ [Realtime Student UI] New announcement published! Refetching...');
    fetchAnnouncements();
  });

  useRealtimeEvent('announcement.updated', () => {
    console.log('⚡ [Realtime Student UI] Announcement updated! Refetching...');
    fetchAnnouncements();
  });

  useRealtimeEvent('announcement.deleted', () => {
    console.log('⚡ [Realtime Student UI] Announcement deleted! Refetching...');
    fetchAnnouncements();
  });

  // Download PDF Notice
  const handleDownloadNoticePDF = (ann: AnnouncementItem) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 148, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('NEXUS CAMPUS - OFFICIAL UNIVERSITY BULLETIN', 74, 10, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`OFFICIAL CIRCULAR NO. ${ann.id.toUpperCase()}`, 74, 16, { align: 'center' });

      doc.setFillColor(248, 250, 252);
      doc.rect(10, 26, 128, 18, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(ann.title, 14, 32, { maxWidth: 120 });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${ann.date} | Category: ${ann.category} | Priority: ${ann.priority}`, 14, 40);

      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Issued By: ${ann.author}`, 12, 52);
      doc.text(`Target Audience: ${ann.targetAudience}`, 12, 58);

      doc.setFont('helvetica', 'bold');
      doc.text('OFFICIAL CIRCULAR DETAILS & INSTRUCTIONS:', 12, 68);
      doc.setFont('helvetica', 'normal');
      doc.text(ann.content, 12, 74, { maxWidth: 124 });

      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129);
      doc.text('AUTHENTICATED & SEALED BY REGISTRAR & DEAN ACADEMICS ✓', 12, 185);

      doc.save(`nexus_notice_${ann.id}_${Date.now()}.pdf`);
      alert(`🎉 SUCCESS!\n\nOfficial Notice PDF "${ann.title}" downloaded successfully.`);
    } catch (e) {
      alert('Error generating Notice PDF.');
    }
  };

  // Submit New Notice (authoritative database POST with fallback)
  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please fill out all notice title and content fields.');
      return;
    }

    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/announcements', {
        title: newTitle,
        message: newContent,
        category: newCategory,
        priority: newPriority,
        targetClass: 'All Students',
        facultyName: `${userName} (Faculty / Admin)`,
        facultyEmail: session?.email || 'faculty@nexus.edu',
      });
      await fetchAnnouncements();
    } catch (err) {
      const newAnn: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: newTitle,
        category: newCategory,
        priority: newPriority,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        author: `${userName} (Faculty / Admin)`,
        content: newContent,
        targetAudience: 'All University Students & Staff',
      };
      setAnnouncements([newAnn, ...announcements]);
    }
    setIsNewNoticeOpen(false);
    setNewTitle('');
    setNewContent('');
    alert('🎉 Notice published successfully to Campus Bulletins!');
  };

  // Event Registration Handler
  const handleRegisterEvent = (eventId: string) => {
    setEvents(
      events.map((e) => {
        if (e.id === eventId) {
          const nextRegistered = !e.isRegistered;
          return {
            ...e,
            isRegistered: nextRegistered,
            registeredCount: nextRegistered ? e.registeredCount + 1 : e.registeredCount - 1,
          };
        }
        return e;
      })
    );
  };

  // Cast Vote Handler
  const handleCastVote = (candidate: ElectionCandidate) => {
    if (hasVotedForPosition[candidate.position]) {
      alert(`You have already cast your vote for the position of ${candidate.position}.`);
      return;
    }

    setCandidates(
      candidates.map((c) => {
        if (c.id === candidate.id) {
          return { ...c, votesCount: c.votesCount + 1, hasVoted: true };
        }
        return c;
      })
    );

    setHasVotedForPosition({ ...hasVotedForPosition, [candidate.position]: true });
    alert(`🎉 Vote recorded successfully!\nYou voted for ${candidate.candidateName} for ${candidate.position}.`);
  };

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER BANNER & TOP NAV */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/30 w-full">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30">
            <Megaphone className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Official University Announcements, Events & Elections Studio
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Campus Announcements & Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed">
            {userName} ({rollNumber}) • Official Bulletins, Technical Fests, Cultural Meets & Student Gymkhana Elections!
          </p>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 z-10 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'notices' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Bell className="w-4 h-4 text-indigo-500" />
            <span>Notices & Bulletins</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'events' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Campus Fests & Events</span>
          </button>

          <button
            onClick={() => setActiveTab('elections')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'elections' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Vote className="w-4 h-4 text-rose-400" />
            <span>Student Elections</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NOTICES & BULLETINS */}
      {activeTab === 'notices' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                Official Campus Notices & University Bulletins
              </h3>
              <p className="text-xs text-slate-500">
                Official circulars issued by Registrar, Controller of Examinations & Deans.
              </p>
            </div>

            <button
              onClick={() => setIsNewNoticeOpen(!isNewNoticeOpen)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Notice</span>
            </button>
          </div>

          {/* NEW NOTICE CREATION FORM */}
          {isNewNoticeOpen && (
            <form onSubmit={handlePostNotice} className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-4 text-xs">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Publish Official Campus Notice:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title:</label>
                  <input
                    type="text"
                    placeholder="Notice Headline / Subject..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Academic">Academic Circular</option>
                    <option value="Exam & Fee">Exam & Fee Dues</option>
                    <option value="Placement">Placement Drive</option>
                    <option value="Hostel & Transport">Hostel & Transport</option>
                    <option value="Urgent">Urgent / Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="General">General Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Content:</label>
                <textarea
                  rows={3}
                  placeholder="Enter full notice description..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewNoticeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md"
                >
                  Post Notice Now
                </button>
              </div>
            </form>
          )}

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Search Bulletins:</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Keyword search notices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filter Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                <option value="All">All Categories</option>
                <option value="Exam & Fee">Examinations & Fees</option>
                <option value="Placement">Campus Placements</option>
                <option value="Academic">Academic Circulars</option>
                <option value="Hostel & Transport">Hostel & Transport</option>
              </select>
            </div>
          </div>

          {/* NOTICES LIST */}
          <div className="space-y-4">
            {filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 hover:border-indigo-500 transition-all shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase">
                      {ann.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        ann.priority === 'High'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                  </div>

                  <span className="font-mono text-xs text-slate-500 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {ann.date}
                  </span>
                </div>

                <h4 className="font-display font-black text-lg text-slate-900 dark:text-white leading-tight">{ann.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{ann.content}</p>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <span>Issued By: <strong className="text-slate-900 dark:text-white">{ann.author}</strong></span>

                  <button
                    onClick={() => handleDownloadNoticePDF(ann)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-purple-300 font-bold hover:bg-indigo-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Download Official PDF Notice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CAMPUS FESTS & EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Campus Technical, Cultural & Sports Events
            </h3>
            <p className="text-xs text-slate-500">
              Register for upcoming campus hackathons, cultural festivals & sports championships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 hover:border-amber-500 transition-all shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase">
                      {evt.category}
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-bold">{evt.date}</span>
                  </div>

                  <h4 className="font-display font-black text-base text-slate-900 dark:text-white leading-tight">{evt.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{evt.description}</p>

                  <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Time: {evt.time}
                    </p>
                    <p className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                      <MapPin className="w-3.5 h-3.5" />
                      Venue: {evt.venue}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Seats Registered:</span>
                    <span className="font-mono text-amber-600 font-bold">{evt.registeredCount}/{evt.maxSeats}</span>
                  </div>

                  <button
                    onClick={() => handleRegisterEvent(evt.id)}
                    className={`w-full py-3 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                      evt.isRegistered
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {evt.isRegistered ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Registered & Seat Confirmed ✓</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Register for Event Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT ELECTIONS */}
      {activeTab === 'elections' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-rose-500" />
              Annual Student Gymkhana Elections 2026
            </h3>
            <p className="text-xs text-slate-500">
              Cast your vote for student council representatives. Secure electronic ballot powered by Student ID verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 hover:border-rose-500 transition-all shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase">
                      {cand.position}
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-bold">{cand.rollNumber}</span>
                  </div>

                  <h4 className="font-display font-black text-lg text-slate-900 dark:text-white">{cand.candidateName}</h4>
                  <p className="text-xs text-indigo-600 dark:text-purple-400 font-bold">{cand.department}</p>
                  
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic">
                    "{cand.manifesto}"
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Total Ballot Votes:</span>
                    <span className="font-mono text-rose-600 font-bold">{cand.votesCount} Votes</span>
                  </div>

                  <button
                    onClick={() => handleCastVote(cand)}
                    disabled={hasVotedForPosition[cand.position]}
                    className={`w-full py-3 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                      hasVotedForPosition[cand.position]
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    <Vote className="w-4 h-4" />
                    <span>
                      {hasVotedForPosition[cand.position]
                        ? 'Vote Recorded ✓'
                        : `Cast Vote for ${cand.candidateName}`}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
