import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Search,
  Plus,
  Download,
  Clock,
  MapPin,
  Megaphone,
  Award,
  ExternalLink,
  Phone,
  User,
  Image as ImageIcon,
  Building2,
  X,
  Briefcase,
  ShieldCheck,
  Tag,
  Trash2,
  CheckCircle2,
  Check,
  MessageSquare,
  HelpCircle,
  Send,
} from 'lucide-react';
import jsPDF from 'jspdf';
import axios from 'axios';
import { type UserSession } from '../../types/auth';
import { useRealtimeEvent } from '../../context/RealtimeContext';

export interface FestEventItem {
  id: string;
  title: string;
  category: 'Cultural Fest' | 'Technical Hackathon' | 'Faculty FDP' | 'Sports Tournament' | 'Workshop';
  targetAudience: 'Student' | 'Faculty' | 'All (Student & Faculty)';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: string;
  organizerName: string;
  organizerDesignation: string;
  organizerClub: string;
  organizerDept: string;
  organizerPhone: string;
  registrationUrl: string;
  posterImage?: string | null;
  description: string;
  maxSeats: number;
  registeredCount: number;
  isRegistered: boolean;
}

export interface CampusAnnouncementItem {
  id: string;
  title: string;
  serviceImpacted: string;
  priority: 'Urgent / Emergency' | 'Important Notice' | 'General Update';
  effectiveDate: string;
  postedBy: string;
  content: string;
  publishedAtRelative?: string;
  publishedAtTime?: string;
}

const INITIAL_EVENTS: FestEventItem[] = [
  {
    id: 'evt-1',
    title: 'NEXUS HackFest 2026 (36-Hour National AI & Full-Stack Hackathon)',
    category: 'Technical Hackathon',
    targetAudience: 'Student',
    startDate: '2026-08-22',
    startTime: '09:00 AM',
    endDate: '2026-08-24',
    endTime: '09:00 PM',
    venue: 'Campus Innovation Hub & Auditorium',
    organizerName: 'Ketan Channa',
    organizerDesignation: 'Gymkhana President',
    organizerClub: 'NEXUS Coding & AI Guild',
    organizerDept: 'Computer Science & Engineering',
    organizerPhone: '+91 98765 43210',
    registrationUrl: 'https://forms.google.com/nexus-ai-hackfest-2026',
    posterImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    description: 'Build flagship AI, Web3, and Full-Stack applications. 36 hours of non-stop coding, mentorship from Microsoft & Google engineers, free energy drinks, hardware development kits, and a grand prize pool of ₹2,50,000 with direct interview referrals.',
    maxSeats: 250,
    registeredCount: 198,
    isRegistered: false,
  },
  {
    id: 'evt-2',
    title: 'SPANDAN 2026 - Annual Cultural Fest & Celebrity Concert',
    category: 'Cultural Fest',
    targetAudience: 'All (Student & Faculty)',
    startDate: '2026-09-05',
    startTime: '04:00 PM',
    endDate: '2026-09-07',
    endTime: '10:00 PM',
    venue: 'Campus Open Air Theatre & Main Quad',
    organizerName: 'Priyanjali Sen',
    organizerDesignation: 'Cultural Head & Vice President',
    organizerClub: 'Fine Arts & Music Society',
    organizerDept: 'Civil Engineering & Fine Arts',
    organizerPhone: '+91 98123 45678',
    registrationUrl: 'https://forms.google.com/spandan-fest-pass-2026',
    posterImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    description: '3 days of mega cultural celebrations featuring battle of the bands, classical fusion dance, ethnic fashion show, acoustic music jam sessions, food carnivals, and an exclusive live concert by top Bollywood & indie musical artists.',
    maxSeats: 1500,
    registeredCount: 1120,
    isRegistered: false,
  },
  {
    id: 'evt-3',
    title: 'Faculty Development Program (FDP) on Generative AI in Pedagogy',
    category: 'Faculty FDP',
    targetAudience: 'Faculty',
    startDate: '2026-08-18',
    startTime: '10:00 AM',
    endDate: '2026-08-20',
    endTime: '04:00 PM',
    venue: 'Executive Seminar Hall & Conference Suite 2',
    organizerName: 'Dr. Nitin Kumar',
    organizerDesignation: 'Chief Academic Coordinator',
    organizerClub: 'IQAC & Faculty Research Forum',
    organizerDept: 'Academic Affairs & Research',
    organizerPhone: '+91 97111 22334',
    registrationUrl: 'https://forms.google.com/faculty-fdp-genai-reg',
    posterImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    description: 'Advanced 3-day intensive workshop for university professors and academic faculty on implementing AI tools (Gemini, ChatGPT Enterprise, automated grading bots) into modern curriculum design, course outcome assessment, and research paper authoring.',
    maxSeats: 80,
    registeredCount: 64,
    isRegistered: false,
  },
  {
    id: 'evt-4',
    title: 'Inter-Departmental Floodlight Sports Championship',
    category: 'Sports Tournament',
    targetAudience: 'All (Student & Faculty)',
    startDate: '2026-08-22',
    startTime: '05:30 PM',
    endDate: '2026-08-22',
    endTime: '09:30 PM',
    venue: 'Campus Floodlight Sports Ground',
    organizerName: 'Vikramaditya Rao',
    organizerDesignation: 'Sports Secretary & Club Captain',
    organizerClub: 'NEXUS Cricket & Football Club',
    organizerDept: 'Department of Physical Education',
    organizerPhone: '+91 99887 76655',
    registrationUrl: 'https://forms.google.com/inter-dept-sports-championship',
    posterImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    description: 'T20 Cricket league & 7-a-side Football tournament under stadium floodlights featuring student and faculty combined departmental teams across all academic branches. Trophies, medals, and cash prizes for winners.',
    maxSeats: 300,
    registeredCount: 245,
    isRegistered: false,
  },
];

const INITIAL_ANNOUNCEMENTS: CampusAnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Canteen Electrical Maintenance Work & Temporary Dining Closure',
    serviceImpacted: 'Central Canteen & Food Court',
    priority: 'Important Notice',
    effectiveDate: 'Aug 10, 2026 (Today, 01:00 PM - 04:00 PM)',
    postedBy: 'Dr. Nitin Kumar (Faculty Estate Officer)',
    publishedAtRelative: '3 mins ago',
    publishedAtTime: 'Today, 10:45 AM',
    content: 'Central Canteen dining hall will remain temporarily closed from 1:00 PM to 4:00 PM today due to mandatory electrical transformer maintenance. Food stalls at Block C will remain operational.',
  },
  {
    id: 'ann-2',
    title: 'ERP Administrative Office Closure for Annual Database Server Upgrade',
    serviceImpacted: 'ERP & Student Administrative Services',
    priority: 'Urgent / Emergency',
    effectiveDate: 'Aug 11, 2026 (Tuesday) to Aug 13, 2026',
    postedBy: 'Registrar & IT Infrastructure Administrator',
    publishedAtRelative: '25 mins ago',
    publishedAtTime: 'Today, 09:30 AM',
    content: 'The ERP Administrative Office will remain closed from Tuesday (11th Aug) to Thursday (13th Aug) for server hardware migration. Student online services & portal will function normally.',
  },
  {
    id: 'ann-3',
    title: 'Official Declaration of Campus Holiday on Account of Dusshera',
    serviceImpacted: 'All Academic & Administrative Operations',
    priority: 'Important Notice',
    effectiveDate: 'Oct 12, 2026 (Gazetted Holiday)',
    postedBy: 'Office of the Vice Chancellor & Admin',
    publishedAtRelative: '2 hours ago',
    publishedAtTime: 'Today, 08:00 AM',
    content: 'All university academic classes, administrative departments, and research laboratories will remain closed on account of Dusshera Holiday. Essential hostel and security services will function uninterrupted.',
  },
  {
    id: 'ann-4',
    title: 'Central Library Extended 24x7 Night Reading Lounge Access',
    serviceImpacted: 'Central Library & Reading Lounge',
    priority: 'General Update',
    effectiveDate: 'Aug 12 to Sep 02, 2026',
    postedBy: 'Chief Librarian & Faculty Coordinator',
    publishedAtRelative: '1 day ago',
    publishedAtTime: 'Yesterday, 04:15 PM',
    content: 'To assist students preparing for upcoming mid-term semester examinations, the Central Library digital reading lounge will remain open 24x7. Coffee & study kiosks will operate continuously.',
  },
];

interface EventsAndUpdatesProps {
  session?: UserSession | null;
  defaultTab?: 'events_fest' | 'campus_announcements';
}

export const EventsAndUpdates: React.FC<EventsAndUpdatesProps> = ({ session, defaultTab = 'events_fest' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'events_fest' | 'campus_announcements'>(defaultTab);

  // Events State
  const [eventsList, setEventsList] = useState<FestEventItem[]>(INITIAL_EVENTS);
  const [audienceFilter, setAudienceFilter] = useState<string>('All');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [selectedEventModal, setSelectedEventModal] = useState<FestEventItem | null>(null);
  const [fullImageModal, setFullImageModal] = useState<string | null>(null);

  // DB Announcements State
  const [dbAnnouncements, setDbAnnouncements] = useState<any[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<CampusAnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [announcementSearchQuery, setAnnouncementSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [questionModalAncId, setQuestionModalAncId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState<string>('');
  const [submittingQuestion, setSubmittingQuestion] = useState<boolean>(false);

  const studentEmail = session?.email || 'student@nexus.edu';
  const studentName = session?.name || 'Aarav Sharma';
  const studentRoll = '2329362';

  const fetchDbAnnouncements = React.useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/faculty/announcements', {
        params: { className: 'B.TECH CSE 2023 A' },
      });
      if (res.data.success) {
        setDbAnnouncements(res.data.announcements || []);
      }
    } catch (err: any) {
      console.warn('DB Announcements fetch error:', err.message);
    }
  }, []);

  const fetchDbEvents = React.useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/alumni/events');
      if (res.data.status === 'success' && Array.isArray(res.data.events)) {
        const dbEvts: FestEventItem[] = res.data.events.map((dbE: any) => ({
          id: dbE.event_id || `db-evt-${dbE.id}`,
          title: dbE.event_name,
          category: (dbE.category || 'Cultural Fest') as any,
          targetAudience: (dbE.target_audience || 'All (Student & Faculty)') as any,
          startDate: dbE.start_date || dbE.event_date || '2026-09-15',
          startTime: dbE.start_time || dbE.event_time || '10:00 AM',
          endDate: dbE.end_date || dbE.event_date || '2026-09-15',
          endTime: dbE.end_time || '05:00 PM',
          venue: dbE.venue || 'Campus Main Auditorium',
          organizerName: dbE.organizer_name || 'Faculty Coordinator',
          organizerDesignation: dbE.organizer_designation || 'Event Coordinator',
          organizerClub: dbE.organizer_club || 'NEXUS Campus Society',
          organizerDept: dbE.target_department || 'Computer Science & Engineering',
          organizerPhone: '+91 98765 43210',
          registrationUrl: dbE.registration_link || 'https://forms.google.com/nexus-register',
          posterImage: dbE.poster_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
          description: dbE.description || '',
          maxSeats: dbE.max_seats || 200,
          registeredCount: dbE.registered_count || 1,
          isRegistered: false,
        }));

        setEventsList((prev) => {
          const dbIds = new Set(dbEvts.map((e) => e.id));
          const nonDuplicateInitial = INITIAL_EVENTS.filter((e) => !dbIds.has(e.id));
          return [...dbEvts, ...nonDuplicateInitial];
        });
      }
    } catch (err: any) {
      console.warn('DB Events fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchDbAnnouncements();
    fetchDbEvents();
  }, [fetchDbAnnouncements, fetchDbEvents]);

  // Realtime Socket.IO Listeners (Phase 5 Pipeline)
  useRealtimeEvent('event.created', React.useCallback(() => {
    console.log('📡 [Student/Faculty Socket] Realtime event.created received -> Refreshing campus events roster');
    fetchDbEvents();
  }, [fetchDbEvents]));

  useRealtimeEvent('announcement.created', React.useCallback(() => {
    console.log('📡 [Student Socket] Realtime announcement.created received -> Refreshing notices');
    fetchDbAnnouncements();
  }, [fetchDbAnnouncements]));

  useRealtimeEvent('announcement.updated', React.useCallback(() => {
    console.log('📡 [Student Socket] Realtime announcement.updated received');
    fetchDbAnnouncements();
  }, [fetchDbAnnouncements]));

  useRealtimeEvent('announcement.deleted', React.useCallback(() => {
    console.log('📡 [Student Socket] Realtime announcement.deleted received');
    fetchDbAnnouncements();
  }, [fetchDbAnnouncements]));

  useRealtimeEvent('announcement.question.responded', React.useCallback((payload: any) => {
    console.log('🎉 [Student Socket] Realtime announcement.question.responded received:', payload);
    alert(`💬 Clarification Reply from ${payload.facultyName}:\n\n"${payload.responseText}"`);
  }, []));

  const handleAcknowledgeAnnouncement = async (announcementId: string) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/faculty/announcements/${announcementId}/acknowledge`, {
        studentEmail,
        studentName,
        studentRoll,
        className: 'B.TECH CSE 2023 A',
      });
      if (res.data.success) {
        setAcknowledgedIds((prev) => new Set([...prev, announcementId]));
        alert('✓ Announcement Acknowledged! Faculty has been notified in real time.');
        fetchDbAnnouncements();
      }
    } catch (err: any) {
      alert(`✕ Acknowledgement error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionModalAncId || !questionText.trim()) return;

    try {
      setSubmittingQuestion(true);
      const res = await axios.post(`http://localhost:5000/api/faculty/announcements/${questionModalAncId}/questions`, {
        studentEmail,
        studentName,
        studentRoll,
        questionText,
      });

      if (res.data.success) {
        alert('✓ Clarification question sent to faculty! You will be notified in real time when faculty responds.');
        setQuestionModalAncId(null);
        setQuestionText('');
      }
    } catch (err: any) {
      alert(`✕ Question error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Post Event Modal Form State
  const [isPostEventOpen, setIsPostEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<'Cultural Fest' | 'Technical Hackathon' | 'Faculty FDP' | 'Sports Tournament' | 'Workshop'>('Cultural Fest');
  const [eventAudience, setEventAudience] = useState<'Student' | 'Faculty' | 'All (Student & Faculty)'>('All (Student & Faculty)');
  const [eventStartDate, setEventStartDate] = useState('2026-08-22');
  const [eventStartTime, setEventStartTime] = useState('09:00 AM');
  const [eventEndDate, setEventEndDate] = useState('2026-08-24');
  const [eventEndTime, setEventEndTime] = useState('06:00 PM');
  const [eventVenue, setEventVenue] = useState('Campus Auditorium');
  const [registrationUrl, setRegistrationUrl] = useState('https://forms.google.com/nexus-campus-event');
  const [publisherName, setPublisherName] = useState(session?.name || 'Ketan Channa');
  const [publisherDesignation, setPublisherDesignation] = useState('Gymkhana President');
  const [publisherClub, setPublisherClub] = useState('NEXUS Cricket Club');
  const [publisherDept, setPublisherDept] = useState('Computer Science & Engineering');
  const [publisherPhone, setPublisherPhone] = useState('+91 98765 43210');
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [eventDesc, setEventDesc] = useState('');

  // Post Announcement Modal Form State
  const [isPostAnnOpen, setIsPostAnnOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annService, setAnnService] = useState('Central Canteen / ERP / Campus Facilities');
  const [annPriority, setAnnPriority] = useState<'Urgent / Emergency' | 'Important Notice' | 'General Update'>('Important Notice');
  const [annDate, setAnnDate] = useState('2026-08-11');
  const [annContent, setAnnContent] = useState('');

  const userName = session?.name || 'Ketan Channa';
  const userRole = String(session?.role || 'Student');
  const isFacultyOrAdmin = userRole === 'Faculty' || userRole === 'Administrator' || userRole === 'Admin';

  // Media Poster Upload Handler
  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete Event Handler
  const handleDeleteEvent = (eventId: string, eventName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the event "${eventName}"?`)) {
      setEventsList(eventsList.filter((e) => e.id !== eventId));
      if (selectedEventModal?.id === eventId) {
        setSelectedEventModal(null);
      }
      alert(`🗑️ Event "${eventName}" deleted successfully.`);
    }
  };

  // Download PDF Announcement
  const handleDownloadAnnouncementPDF = (ann: CampusAnnouncementItem) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 148, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('NEXUS CAMPUS - OFFICIAL OPERATIONAL ANNOUNCEMENT', 74, 10, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`CIRCULAR ID: ${ann.id.toUpperCase()}`, 74, 16, { align: 'center' });

      doc.setFillColor(248, 250, 252);
      doc.rect(10, 26, 128, 20, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(ann.title, 14, 32, { maxWidth: 120 });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Service Impacted: ${ann.serviceImpacted}`, 14, 38);
      doc.text(`Effective Date: ${ann.effectiveDate} | Priority: ${ann.priority}`, 14, 43);

      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Issued By: ${ann.postedBy}`, 12, 54);

      doc.setFont('helvetica', 'bold');
      doc.text('ANNOUNCEMENT DETAILS & CAMPUS INSTRUCTIONS:', 12, 64);
      doc.setFont('helvetica', 'normal');
      doc.text(ann.content, 12, 70, { maxWidth: 124 });

      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129);
      doc.text('VERIFIED & ISSUED BY REGISTRAR & CAMPUS MAINTENANCE CELL ✓', 12, 185);

      doc.save(`nexus_announcement_${ann.id}_${Date.now()}.pdf`);
      alert(`🎉 SUCCESS!\n\nOfficial Campus Circular PDF "${ann.title}" downloaded successfully.`);
    } catch (e) {
      alert('Error generating Announcement PDF.');
    }
  };

  // Handlers
  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDesc.trim()) {
      alert('Please fill out event title and description.');
      return;
    }

    const uniqueId = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newEvt: FestEventItem = {
      id: uniqueId,
      title: eventTitle,
      category: eventCategory,
      targetAudience: eventAudience,
      startDate: eventStartDate,
      startTime: eventStartTime,
      endDate: eventEndDate,
      endTime: eventEndTime,
      venue: eventVenue,
      organizerName: publisherName,
      organizerDesignation: publisherDesignation || 'Event Coordinator',
      organizerClub: publisherClub || 'NEXUS Campus Society',
      organizerDept: publisherDept,
      organizerPhone: publisherPhone,
      registrationUrl: registrationUrl || 'https://forms.google.com/nexus-register',
      posterImage: posterPreview || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
      description: eventDesc,
      maxSeats: 200,
      registeredCount: 1,
      isRegistered: true,
    };

    // Optimistic UI update
    setEventsList([newEvt, ...eventsList]);
    setIsPostEventOpen(false);

    // Save to Database
    try {
      const res = await axios.post('http://localhost:5000/api/alumni/events', {
        organizerEmail: session?.email || 'faculty@nexus.edu',
        organizerName: publisherName || session?.name || 'Faculty Member',
        eventName: eventTitle,
        eventDate: eventStartDate,
        eventTime: eventStartTime,
        venue: eventVenue,
        eventMode: 'Offline',
        targetBatch: 'All Batches',
        targetDepartment: publisherDept || 'All Departments',
        description: eventDesc,
        registrationLink: registrationUrl || 'https://forms.google.com/nexus-register',
        posterUrl: posterPreview || null,
        category: eventCategory,
        targetAudience: eventAudience,
        organizerDesignation: publisherDesignation || 'Faculty Coordinator',
        organizerClub: publisherClub || 'NEXUS Campus Society',
        startDate: eventStartDate,
        endDate: eventEndDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        maxSeats: 200,
      });

      if (res.data.status === 'success') {
        alert(`🎉 SUCCESS!\n\nEvent "${eventTitle}" published successfully! All students and faculty can view this in real-time.`);
        fetchDbEvents();
      }
    } catch (err: any) {
      console.error('Error saving event to database:', err);
      alert(`🎉 Published locally!\n\nEvent "${eventTitle}" posted.`);
    }

    setEventTitle('');
    setEventDesc('');
    setPosterPreview(null);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert('Please fill out announcement title and description.');
      return;
    }

    const newAnn: CampusAnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: annTitle,
      serviceImpacted: annService,
      priority: annPriority,
      effectiveDate: annDate,
      postedBy: `${userName} (${isFacultyOrAdmin ? 'Faculty / Campus Administrator' : 'Authorized Publisher'})`,
      publishedAtRelative: 'Just now',
      publishedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: annContent,
    };

    setAnnouncementsList([newAnn, ...announcementsList]);
    setIsPostAnnOpen(false);
    setAnnTitle('');
    setAnnContent('');
    alert('🎉 Campus Operational Announcement posted successfully!');
  };

  // Registration URL Redirection Handler
  const handleOpenRegistrationLink = (url: string) => {
    const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    window.open(validUrl, '_blank');
  };

  // Filtered Lists
  const filteredEvents = eventsList.filter((e) => {
    const matchesQuery = e.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) || e.description.toLowerCase().includes(eventSearchQuery.toLowerCase());
    const matchesAudience = audienceFilter === 'All' || e.targetAudience.includes(audienceFilter);
    return matchesQuery && matchesAudience;
  });

  const filteredAnnouncements = announcementsList.filter((a) => {
    const matchesQuery = a.title.toLowerCase().includes(announcementSearchQuery.toLowerCase()) || a.content.toLowerCase().includes(announcementSearchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    return matchesQuery && matchesPriority;
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/30 w-full">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
            NEXUS Events, Promotions & Operational Bulletins Studio
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Events & Updates Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed">
            {userName} ({userRole}) • {isFacultyOrAdmin ? 'Post & Manage Cultural Fests, Hackathons, Canteen Maintenance, ERP Closure & Holiday Bulletins!' : 'Explore Campus Fests, Register for Hackathons & View Official Campus Announcements!'}
          </p>
        </div>

        {/* SUB-TAB SELECTOR - VISIBLE FOR ALL (STUDENTS, FACULTY & ADMIN) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 z-10 bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shrink-0">
          <button
            onClick={() => setActiveSubTab('events_fest')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeSubTab === 'events_fest' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Events & Fest Studio</span>
          </button>

          <button
            onClick={() => setActiveSubTab('campus_announcements')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeSubTab === 'campus_announcements' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Campus Announcements</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: EVENTS & FEST STUDIO (STUDENT + FACULTY PROMOTIONS) */}
      {activeSubTab === 'events_fest' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                Events & Fest Studio (Student & Faculty Promotions)
              </h3>
              <p className="text-xs text-slate-500">
                Upload & register for campus fests, hackathons, faculty development programs & sports tournaments. Click any card to open full event details!
              </p>
            </div>

            <button
              onClick={() => setIsPostEventOpen(!isPostEventOpen)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post / Add New Event & Poster</span>
            </button>
          </div>

          {/* POST EVENT FORM WITH START & END DATE/TIME, DESIGNATION, CLUB & MEDIA UPLOADER */}
          {isPostEventOpen && (
            <form onSubmit={handlePostEvent} className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-4 text-xs">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Publish Event / Promotion with Start & End Date/Time & Poster:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event / Fest Title:</label>
                  <input
                    type="text"
                    placeholder="Title of Fest, Hackathon or FDP..."
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience:</label>
                  <select
                    value={eventAudience}
                    onChange={(e) => setEventAudience(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="All (Student & Faculty)">All (Student & Faculty)</option>
                    <option value="Student">Student Promotions Only</option>
                    <option value="Faculty">Faculty Promotions / FDP Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Category:</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Cultural Fest">Cultural Fest</option>
                    <option value="Technical Hackathon">Technical Hackathon</option>
                    <option value="Faculty FDP">Faculty FDP</option>
                    <option value="Sports Tournament">Sports Tournament</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>

                {/* START DATE & TIME */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Start Date & Time:</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Start Time..."
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>

                {/* END DATE & TIME */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event End Date & Time:</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="End Time..."
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue:</label>
                  <input
                    type="text"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* PUBLISHER DETAILS: DESIGNATION & CLUB NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-indigo-100/60 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                <div>
                  <label className="block font-bold text-indigo-950 dark:text-indigo-200 mb-1">Publisher Full Name:</label>
                  <input
                    type="text"
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-indigo-700 dark:text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-indigo-950 dark:text-indigo-200 mb-1">Designation (e.g. President / Captain):</label>
                  <input
                    type="text"
                    placeholder="e.g. Gymkhana President / Club Head..."
                    value={publisherDesignation}
                    onChange={(e) => setPublisherDesignation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-indigo-700 dark:text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-indigo-950 dark:text-indigo-200 mb-1">Associated Club / Society:</label>
                  <input
                    type="text"
                    placeholder="e.g. NEXUS Cricket Club / Fine Arts..."
                    value={publisherClub}
                    onChange={(e) => setPublisherClub(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-indigo-700 dark:text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Publisher Department:</label>
                  <input
                    type="text"
                    value={publisherDept}
                    onChange={(e) => setPublisherDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone Number:</label>
                  <input
                    type="text"
                    value={publisherPhone}
                    onChange={(e) => setPublisherPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registration Link / URL:</label>
                  <input
                    type="text"
                    placeholder="https://forms.google.com/nexus-event"
                    value={registrationUrl}
                    onChange={(e) => setRegistrationUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>

              {/* MEDIA / POSTER IMAGE UPLOADER */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  Upload Event Poster / Media File (JPEG, PNG, WEBP):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterUpload}
                  className="w-full text-xs font-bold text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                />
                {posterPreview && (
                  <div className="mt-2 relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md">
                    <img src={posterPreview} alt="Poster Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Description:</label>
                <textarea
                  rows={3}
                  placeholder="Enter event details, schedule & prizes..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostEventOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md"
                >
                  Publish Event Now
                </button>
              </div>
            </form>
          )}

          {/* SEARCH & AUDIENCE FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Search Fests & Events:</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events, clubs, hackathons..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience Filter:</label>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                <option value="All">All Audiences (Student & Faculty)</option>
                <option value="Student">Student Promotions Only</option>
                <option value="Faculty">Faculty Promotions Only</option>
              </select>
            </div>
          </div>

          {/* EVENTS CARDS GRID - WITH START/END DATE & DELETE BUTTON */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEventModal(evt)}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 hover:border-indigo-500 hover:shadow-2xl cursor-pointer transition-all shadow-sm relative overflow-hidden group"
              >
                {/* DELETE BUTTON TOP RIGHT OVERLAY */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(evt.id, evt.title);
                  }}
                  title="Delete Event"
                  className="absolute top-4 right-4 p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all z-20 border border-rose-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* EVENT POSTER DISPLAY */}
                {evt.posterImage && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-2 border border-slate-200 dark:border-slate-700 shadow-md relative group/img">
                    <img src={evt.posterImage} alt={evt.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end justify-between p-3">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-600/90 text-white font-black text-[10px] uppercase backdrop-blur-md">
                        {evt.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-purple-600/90 text-white font-black text-[10px] backdrop-blur-md">
                        {evt.organizerClub}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
                    {!evt.posterImage && (
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase">
                        {evt.category}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                      Audience: {evt.targetAudience}
                    </span>
                  </div>

                  <h4 className="font-display font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                    {evt.description}
                  </p>

                  {/* START & END DATE & TIME */}
                  <div className="space-y-1 text-xs pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      Starts: <span className="font-mono text-emerald-600 dark:text-emerald-400">{evt.startDate} ({evt.startTime})</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      Ends: <span className="font-mono text-rose-600 dark:text-rose-400">{evt.endDate} ({evt.endTime})</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      Venue: {evt.venue}
                    </p>
                  </div>

                  {/* PUBLISHER DETAILS WITH DESIGNATION & CLUB */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        {evt.organizerName}
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                        {evt.organizerDesignation}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Club: {evt.organizerClub} ({evt.organizerDept})
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Click Card for Full Details • Capacity:</span>
                    <span className="font-mono text-indigo-600 font-bold">{evt.registeredCount}/{evt.maxSeats} Seats</span>
                  </div>

                  {/* REGISTER BUTTON WITH EXTERNAL REDIRECTION LINK */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRegistrationLink(evt.registrationUrl);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Register for Event (External Link)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: CAMPUS ANNOUNCEMENTS STUDIO (OPERATIONAL UPDATES) */}
      {activeSubTab === 'campus_announcements' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                Campus Operational Announcements (Posted by Faculty & Admin)
              </h3>
              <p className="text-xs text-slate-500">
                {isFacultyOrAdmin
                  ? 'Faculty & Admin Bulletin Center: Post official operational notices, canteen hours & holiday circulars.'
                  : 'Official Campus Notice Board: View official operational bulletins & circulars posted by Faculty & Campus Administration.'}
              </p>
            </div>

            {isFacultyOrAdmin ? (
              <button
                onClick={() => setIsPostAnnOpen(!isPostAnnOpen)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Post Operational Announcement</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-2 border border-amber-200 dark:border-amber-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Official Notice Feed (Faculty & Admin Authored)</span>
              </div>
            )}
          </div>

          {/* POST ANNOUNCEMENT FORM */}
          {isPostAnnOpen && (
            <form onSubmit={handlePostAnnouncement} className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-4 text-xs">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Post Operational Bulletin:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Title:</label>
                  <input
                    type="text"
                    placeholder="e.g. Canteen Maintenance / ERP Closure / Dusshera Holiday..."
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level:</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Important Notice">Important Notice</option>
                    <option value="Urgent / Emergency">Urgent / Emergency</option>
                    <option value="General Update">General Update</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Impacted:</label>
                  <input
                    type="text"
                    value={annService}
                    onChange={(e) => setAnnService(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Effective Date / Duration:</label>
                  <input
                    type="text"
                    value={annDate}
                    onChange={(e) => setAnnDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Body:</label>
                <textarea
                  rows={3}
                  placeholder="Enter complete operational instructions..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostAnnOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-md"
                >
                  Publish Operational Notice
                </button>
              </div>
            </form>
          )}

          {/* SEARCH & PRIORITY FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Search Announcements:</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search canteen, ERP, holidays..."
                  value={announcementSearchQuery}
                  onChange={(e) => setAnnouncementSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filter Priority:</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                <option value="All">All Priority Bulletins</option>
                <option value="Urgent / Emergency">Urgent / Emergency</option>
                <option value="Important Notice">Important Notice</option>
                <option value="General Update">General Update</option>
              </select>
            </div>
          </div>

          {/* ANNOUNCEMENTS LIST */}
          <div className="space-y-4">
            {/* REAL-TIME DATABASE FACULTY ANNOUNCEMENTS */}
            {dbAnnouncements.map((dbAnc) => {
              const isAck = acknowledgedIds.has(dbAnc.announcementId);

              return (
                <div
                  key={dbAnc.announcementId}
                  className="p-6 rounded-3xl bg-amber-500/5 dark:bg-slate-800/80 border-2 border-amber-500/30 space-y-4 shadow-md hover:border-amber-500 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full font-black text-[10px] uppercase ${
                          dbAnc.priority === 'Urgent' || dbAnc.priority === 'High'
                            ? 'bg-rose-500 text-white'
                            : dbAnc.priority === 'Important'
                            ? 'bg-amber-500 text-white'
                            : 'bg-indigo-500 text-white'
                        }`}
                      >
                        {dbAnc.priority}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 font-bold text-[10px] text-indigo-700 dark:text-indigo-300">
                        Category: {dbAnc.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 font-bold text-[10px] text-purple-700 dark:text-purple-300">
                        Target Class: {dbAnc.targetClass}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>Live Faculty Bulletin</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-black text-xl text-slate-900 dark:text-white leading-tight mb-1">
                      {dbAnc.title}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                      {dbAnc.message}
                    </p>
                  </div>

                  {/* INTERACTION STRIP: ACKNOWLEDGE & ASK CLARIFICATION */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 font-medium">
                      Faculty: <strong className="text-slate-900 dark:text-white">{dbAnc.facultyName}</strong> ({dbAnc.facultyEmail})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuestionModalAncId(dbAnc.announcementId)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition-all flex items-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Ask Clarification</span>
                      </button>

                      {isAck ? (
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1.5 border border-emerald-500/30">
                          <Check className="w-4 h-4" />
                          <span>Acknowledged ✓</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledgeAnnouncement(dbAnc.announcementId)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Acknowledge Notice</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAnnouncements.map((ann: any) => (
              <div
                key={ann.id}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 hover:border-amber-500 transition-all shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full font-black text-[10px] uppercase ${
                        ann.priority === 'Urgent / Emergency'
                          ? 'bg-rose-500 text-white'
                          : ann.priority === 'Important Notice'
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-500 text-white'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[10px] text-slate-700 dark:text-slate-300">
                      Impact: {ann.serviceImpacted}
                    </span>
                  </div>

                  {/* TIME OF PUBLISH RELATIVE & EXACT BADGE */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 border border-amber-500/30">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span>Published {ann.publishedAtRelative || 'Recently'}</span>
                      {ann.publishedAtTime && <span className="text-[10px] text-slate-400 font-normal">({ann.publishedAtTime})</span>}
                    </span>
                  </div>
                </div>

                <h4 className="font-display font-black text-lg text-slate-900 dark:text-white leading-tight">{ann.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{ann.content}</p>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <span>Issued & Posted By: <strong className="text-slate-900 dark:text-white">{ann.postedBy}</strong></span>

                  <button
                    onClick={() => handleDownloadAnnouncementPDF(ann)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>Download Official PDF Circular</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLARIFICATION QUESTION MODAL */}
      {questionModalAncId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSubmitQuestion}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setQuestionModalAncId(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              Ask Clarification Question to Faculty
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Question / Doubt:</label>
                <textarea
                  rows={4}
                  placeholder="Type your question regarding this announcement..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setQuestionModalAncId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingQuestion}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingQuestion ? 'Submitting...' : 'Submit Question'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FULL EVENT DETAILS MODAL VIEW */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedEventModal(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Image - Clickable for Full Resolution Lightbox */}
            {selectedEventModal.posterImage && (
              <div
                onClick={() => setFullImageModal(selectedEventModal.posterImage || null)}
                className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl relative cursor-pointer group/img transition-transform hover:scale-[1.01]"
              >
                <img src={selectedEventModal.posterImage} alt={selectedEventModal.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end justify-between p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-xs uppercase shadow-md">
                      {selectedEventModal.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-xs shadow-md">
                      {selectedEventModal.organizerClub}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 group-hover/img:bg-indigo-600 transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Click for Full Screen Photo 🔍</span>
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  Target Audience: {selectedEventModal.targetAudience}
                </span>
                <span className="font-mono text-slate-500 font-bold">
                  Capacity: {selectedEventModal.registeredCount}/{selectedEventModal.maxSeats} Seats
                </span>
              </div>

              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white leading-tight">
                {selectedEventModal.title}
              </h2>

              {/* START & END DATE & TIME IN MODAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Event Start: <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedEventModal.startDate} ({selectedEventModal.startTime})</span>
                </p>
                <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Clock className="w-4 h-4 text-rose-500" />
                  Event End: <span className="font-mono text-rose-600 dark:text-rose-400">{selectedEventModal.endDate} ({selectedEventModal.endTime})</span>
                </p>
                <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white sm:col-span-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  Venue: {selectedEventModal.venue}
                </p>
              </div>

              {/* FULL DESCRIPTION */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  Full Event Description & Schedule:
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {selectedEventModal.description}
                </p>
              </div>

              {/* PUBLISHER DETAILS: DESIGNATION, CLUB, DEPT & PHONE */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white space-y-2 border border-indigo-500/30">
                <h4 className="font-bold text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Verified Publisher Credentials & Contact Info:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <p className="font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Publisher: {selectedEventModal.organizerName}
                  </p>
                  <p className="font-bold flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    Designation: {selectedEventModal.organizerDesignation}
                  </p>
                  <p className="font-bold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Associated Club: {selectedEventModal.organizerClub}
                  </p>
                  <p className="font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    Department: {selectedEventModal.organizerDept}
                  </p>
                  <p className="font-mono font-bold text-emerald-400 flex items-center gap-1.5 sm:col-span-2">
                    <Phone className="w-3.5 h-3.5" />
                    Contact Phone: {selectedEventModal.organizerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL ACTIONS: WITH DELETE EVENT BUTTON */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleDeleteEvent(selectedEventModal.id, selectedEventModal.title)}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-500/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Event</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Close Window
                </button>
                <button
                  onClick={() => handleOpenRegistrationLink(selectedEventModal.registrationUrl)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Register for Event (Opens Link)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN PHOTO LIGHTBOX MODAL */}
      {fullImageModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in cursor-pointer"
          onClick={() => setFullImageModal(null)}
        >
          <button
            onClick={() => setFullImageModal(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-rose-600 transition-all flex items-center justify-center z-30 shadow-2xl border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[90vh] p-2 relative flex flex-col items-center z-20" onClick={(e) => e.stopPropagation()}>
            <img
              src={fullImageModal}
              alt="Full Size Event Poster"
              className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/20"
            />
            <div className="mt-4 flex items-center gap-3">
              <span className="text-white text-xs font-bold bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                🔍 Full High-Resolution Poster View • Click outside or Close button to exit
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
