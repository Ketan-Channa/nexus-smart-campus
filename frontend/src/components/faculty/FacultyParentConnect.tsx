import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Video,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Send,
  MessageSquare,
  FileText,
  UserCheck,
  TrendingUp,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import axios from 'axios';
import { type UserSession } from '../../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nexus-smart-campus-backend.onrender.com';

interface FacultyParentConnectProps {
  session?: UserSession | null;
  facultyName?: string;
  facultyEmail?: string;
  department?: string;
  inchargeClass?: string;
}

export const FacultyParentConnect: React.FC<FacultyParentConnectProps> = ({
  session,
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'meetings' | 'invitations' | 'feedback'>('directory');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Directory State
  const [directory, setDirectory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  // Meetings State
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    studentRoll: '',
    studentName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: 'Father',
    meetingTitle: '',
    meetingPurpose: 'Academic Performance',
    description: '',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '11:00 AM',
    endTime: '11:30 AM',
    meetingType: 'In-Person',
    meetingLocation: 'Faculty Block A • Room 304',
    priority: 'Medium',
  });

  // Invitations State
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [invitationForm, setInvitationForm] = useState({
    eventTitle: 'Mid-Semester Academic Review & Parent-Teacher Meeting',
    studentRoll: '',
    studentName: '',
    parentName: '',
    parentEmail: '',
    eventDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    eventTime: '10:00 AM',
    venue: 'Main Campus Auditorium & Dept Seminar Hall',
    message: 'We cordially invite you to review your ward’s mid-semester academic progression and project presentations.',
    rsvpDeadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [respondingFeedback, setRespondingFeedback] = useState<any | null>(null);
  const [responseText, setResponseText] = useState('');

  // Academic Context Drawer
  const [academicContext, setAcademicContext] = useState<any | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // Fetch Directory
  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/parent-connect/directory`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setDirectory(res.data.directory || []);
      }
    } catch (e) {
      console.warn('Directory fetch fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Meetings
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/parent-connect/meetings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setMeetings(res.data.meetings || []);
      }
    } catch (e) {
      console.warn('Meetings fetch error:', e);
    }
  };

  // Fetch Invitations
  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/parent-connect/invitations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setInvitations(res.data.invitations || []);
      }
    } catch (e) {
      console.warn('Invitations fetch error:', e);
    }
  };

  // Fetch Feedback
  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/parent-connect/feedback`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setFeedbackList(res.data.feedback || []);
      }
    } catch (e) {
      console.warn('Feedback fetch error:', e);
    }
  };

  useEffect(() => {
    fetchDirectory();
    fetchMeetings();
    fetchInvitations();
    fetchFeedback();
  }, []);

  // Open Academic Context Drawer
  const handleOpenAcademicContext = async (studentRoll: string) => {
    try {
      setLoadingContext(true);
      setAcademicContext(null);
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/parent-connect/academic-context`, {
        params: { studentRoll },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setAcademicContext(res.data.context);
      }
    } catch (e) {
      console.warn('Academic context error:', e);
    } finally {
      setLoadingContext(false);
    }
  };

  // Open Schedule Meeting for a specific student/parent
  const handleScheduleForStudent = (entry: any) => {
    setMeetingForm({
      ...meetingForm,
      studentRoll: entry.studentRoll,
      studentName: entry.studentName,
      parentName: entry.parentName,
      parentEmail: entry.email,
      parentPhone: entry.phone,
      relationship: entry.relationship || 'Parent',
      meetingTitle: `Academic Progress Discussion - ${entry.studentName}`,
    });
    setIsMeetingModalOpen(true);
  };

  // Submit Meeting Form
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await axios.post(
        `${API_BASE_URL}/api/faculty/parent-connect/meetings`,
        {
          ...meetingForm,
          facultyEmail,
          facultyName,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.success) {
        setFeedbackMsg({ type: 'success', text: 'Meeting scheduled successfully with parent!' });
        setIsMeetingModalOpen(false);
        fetchMeetings();
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to schedule meeting.',
      });
    }
  };

  // Update Meeting Status (Confirm, Complete, Cancel)
  const handleUpdateMeetingStatus = async (meetingId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('nexus_token');
      await axios.put(
        `${API_BASE_URL}/api/faculty/parent-connect/meetings/${meetingId}`,
        { status, followUpNotes: notes },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      fetchMeetings();
      setFeedbackMsg({ type: 'success', text: `Meeting marked as "${status}".` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Failed to update meeting status.' });
    }
  };

  // Submit Invitation Form
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nexus_token');
      const res = await axios.post(
        `${API_BASE_URL}/api/faculty/parent-connect/invitations`,
        {
          ...invitationForm,
          facultyEmail,
          facultyName,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data?.success) {
        setFeedbackMsg({ type: 'success', text: 'Invitation dispatched to parent!' });
        setIsInvitationModalOpen(false);
        fetchInvitations();
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send invitation.' });
    }
  };

  // Submit Feedback Response
  const handleSendFeedbackResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingFeedback || !responseText.trim()) return;

    try {
      const token = localStorage.getItem('nexus_token');
      await axios.post(
        `${API_BASE_URL}/api/faculty/parent-connect/feedback/${respondingFeedback.feedback_id}/respond`,
        {
          responseText,
          respondedBy: facultyName,
          status: 'Responded',
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setFeedbackMsg({ type: 'success', text: 'Response delivered to parent.' });
      setRespondingFeedback(null);
      setResponseText('');
      fetchFeedback();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Failed to send feedback response.' });
    }
  };

  // Filtered Directory
  const filteredDirectory = directory.filter((d) => {
    const matchesSearch =
      d.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.studentRoll?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.parentName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'All' || d.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Filtered Meetings
  const filteredMeetings = meetings.filter((m) => {
    const matchesPurpose = selectedPurpose === 'All' || m.meeting_purpose === selectedPurpose;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    return matchesPurpose && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-900/80 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/30">
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            NEXUS PARENT CONNECT & COLLABORATION
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Parent & Guardian Engagement Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Schedule parent–faculty meetings, dispatch academic event invitations, review parent feedback, and discuss
            live attendance & published results with verified guardians.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
          <button
            onClick={() => setIsInvitationModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-purple-400" /> Invite Parents
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-bold block text-[11px]">Linked Parents</span>
            <span className="font-display font-black text-2xl text-slate-900 dark:text-white">{directory.length}</span>
            <span className="text-[10px] text-emerald-500 font-bold block">100% Verified Relationships</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-bold block text-[11px]">Scheduled Meetings</span>
            <span className="font-display font-black text-2xl text-slate-900 dark:text-white">
              {meetings.filter((m) => m.status === 'Scheduled' || m.status === 'Confirmed').length}
            </span>
            <span className="text-[10px] text-purple-400 font-bold block">Upcoming This Month</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-bold block text-[11px]">Dispatched Invitations</span>
            <span className="font-display font-black text-2xl text-slate-900 dark:text-white">{invitations.length}</span>
            <span className="text-[10px] text-cyan-400 font-bold block">Events & PTM Reviews</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-bold block text-[11px]">Inbound Feedback</span>
            <span className="font-display font-black text-2xl text-slate-900 dark:text-white">
              {feedbackList.filter((f) => f.status === 'Pending').length}
            </span>
            <span className="text-[10px] text-amber-500 font-bold block">Awaiting Faculty Reply</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MODULE TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Parent Directory & Contacts ({directory.length})
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'meetings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Scheduled Meetings ({meetings.length})
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'invitations'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" /> Dispatched Invitations ({invitations.length})
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Parent Inquiries & Feedback ({feedbackList.length})
        </button>
      </div>

      {/* TAB 1: PARENT DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, roll # or parent..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All">All Teaching Classes</option>
                <option value="B.TECH CSE 2023 A">B.TECH CSE 2023 A</option>
                <option value="BTECH CSE 4A">BTECH CSE 4A</option>
              </select>
              <button
                onClick={fetchDirectory}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map((entry) => (
              <div
                key={entry.studentRoll}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-mono font-bold border border-purple-500/20">
                        {entry.relationship}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{entry.parentName}</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{entry.occupation}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-600 dark:text-slate-400">
                        {entry.studentRoll}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{entry.className}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Student:
                      </span>
                      <strong className="text-slate-900 dark:text-white">{entry.studentName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone:
                      </span>
                      <span className="font-mono">{entry.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-400" /> Email:
                      </span>
                      <span className="font-mono truncate max-w-[140px]">{entry.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenAcademicContext(entry.studentRoll)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Progress
                  </button>

                  <button
                    onClick={() => handleScheduleForStudent(entry)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Meet Parent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED MEETINGS */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All">All Purposes</option>
                <option value="Academic Performance">Academic Performance</option>
                <option value="Attendance">Attendance</option>
                <option value="Behaviour or student support">Behaviour or Support</option>
                <option value="Medical or wellbeing">Medical or Wellbeing</option>
                <option value="Career guidance">Career Guidance</option>
                <option value="General PTM">General PTM</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending Request">Pending Request</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-500 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Meeting
            </button>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Parent Meetings Found</h4>
              <p className="text-xs text-slate-500">
                You currently have no scheduled meetings under this filter. Click "+ New Meeting" to schedule one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMeetings.map((m) => (
                <div
                  key={m.meeting_id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-[10px] border border-purple-500/20">
                        {m.meeting_purpose}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                        {m.meeting_type}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          m.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : m.status === 'Cancelled'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{m.meeting_title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Student: <strong className="text-slate-700 dark:text-slate-300">{m.student_name}</strong> ({m.student_roll}) • Parent: <strong>{m.parent_name}</strong>
                    </p>
                    {m.description && <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{m.description}"</p>}
                    {m.follow_up_notes && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Follow-up: {m.follow_up_notes}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-right shrink-0">
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center md:justify-end gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" /> {m.meeting_date}
                      </div>
                      <div className="flex items-center md:justify-end gap-1.5 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> {m.start_time} - {m.end_time}
                      </div>
                      <div className="flex items-center md:justify-end gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" /> {m.meeting_location}
                      </div>
                    </div>

                    {m.status !== 'Completed' && m.status !== 'Cancelled' && (
                      <div className="flex items-center gap-2 justify-end pt-2">
                        <button
                          onClick={() => handleUpdateMeetingStatus(m.meeting_id, 'Completed', 'Meeting conducted constructively. Action plan shared.')}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateMeetingStatus(m.meeting_id, 'Cancelled')}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 font-bold text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISPATCHED INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Invitations to Parent-Teacher Meetings, academic presentations, and campus celebrations.
            </p>
            <button
              onClick={() => setIsInvitationModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-500 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send New Invitation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((inv) => (
              <div
                key={inv.invitation_id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold">
                    Official Invitation
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">RSVP: {inv.rsvp_status}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{inv.event_title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">"{inv.message}"</p>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student & Parent:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {inv.student_name} • {inv.parent_name}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Venue:</span>
                    <span>
                      {inv.event_date} ({inv.event_time}) • {inv.venue}
                    </span>
                  </div>
                  {inv.rsvp_deadline && (
                    <div className="flex justify-between text-amber-500">
                      <span>RSVP Deadline:</span>
                      <span className="font-mono">{inv.rsvp_deadline}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PARENT FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Confidential inquiries and feedback submitted by parents regarding academic progress and student support.
          </p>

          <div className="space-y-3">
            {feedbackList.map((fb) => (
              <div
                key={fb.feedback_id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-bold">
                      {fb.feedback_category}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{fb.subject}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fb.status === 'Responded' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {fb.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  "{fb.message}"
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Submitted by: <strong>{fb.parent_name}</strong> for {fb.student_name} ({fb.student_roll})
                  </span>

                  {fb.status !== 'Responded' ? (
                    <button
                      onClick={() => setRespondingFeedback(fb)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Reply to Parent
                    </button>
                  ) : (
                    <span className="text-emerald-500 font-bold text-xs">Replied by {fb.responded_by} ✓</span>
                  )}
                </div>

                {fb.response_text && (
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                    <strong>Faculty Response:</strong> {fb.response_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Schedule Parent-Faculty Meeting
              </h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Select Student & Parent *</label>
                <select
                  value={meetingForm.studentRoll}
                  onChange={(e) => {
                    const found = directory.find((d) => d.studentRoll === e.target.value);
                    if (found) {
                      setMeetingForm({
                        ...meetingForm,
                        studentRoll: found.studentRoll,
                        studentName: found.studentName,
                        parentName: found.parentName,
                        parentEmail: found.email,
                        parentPhone: found.phone,
                        relationship: found.relationship,
                        meetingTitle: `Academic Progress Meeting - ${found.studentName}`,
                      });
                    }
                  }}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold"
                >
                  <option value="">-- Choose Student from Assigned Classes --</option>
                  {directory.map((d) => (
                    <option key={d.studentRoll} value={d.studentRoll}>
                      {d.studentName} ({d.studentRoll}) — {d.parentName} ({d.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingForm.meetingTitle}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meetingTitle: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Meeting Purpose</label>
                  <select
                    value={meetingForm.meetingPurpose}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingPurpose: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                  >
                    <option value="Academic Performance">Academic Performance</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Behaviour or student support">Behaviour or Support</option>
                    <option value="Medical or wellbeing">Medical or Wellbeing</option>
                    <option value="Career guidance">Career Guidance</option>
                    <option value="General PTM">General PTM</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Meeting Type</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                  >
                    <option value="In-Person">In-Person (On Campus)</option>
                    <option value="Online">Online Video Conference</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={meetingForm.meetingDate}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
                    required
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Start Time</label>
                  <input
                    type="text"
                    value={meetingForm.startTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">End Time</label>
                  <input
                    type="text"
                    value={meetingForm.endTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                    placeholder="11:30 AM"
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Location / Online Link</label>
                <input
                  type="text"
                  value={meetingForm.meetingLocation}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meetingLocation: e.target.value })}
                  placeholder="e.g. Faculty Block A • Room 304 or Google Meet link"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Description / Agenda Notes</label>
                <textarea
                  rows={2}
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                  placeholder="Points to discuss regarding course results, lab participation..."
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND INVITATION MODAL */}
      {isInvitationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                Dispatch Parent Event Invitation
              </h3>
              <button onClick={() => setIsInvitationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvitation} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Student & Parent</label>
                <select
                  value={invitationForm.studentRoll}
                  onChange={(e) => {
                    const found = directory.find((d) => d.studentRoll === e.target.value);
                    if (found) {
                      setInvitationForm({
                        ...invitationForm,
                        studentRoll: found.studentRoll,
                        studentName: found.studentName,
                        parentName: found.parentName,
                        parentEmail: found.email,
                      });
                    }
                  }}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                >
                  <option value="">-- Choose Student & Parent --</option>
                  {directory.map((d) => (
                    <option key={d.studentRoll} value={d.studentRoll}>
                      {d.studentName} ({d.studentRoll}) — {d.parentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Event / Review Title</label>
                <input
                  type="text"
                  value={invitationForm.eventTitle}
                  onChange={(e) => setInvitationForm({ ...invitationForm, eventTitle: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Event Date</label>
                  <input
                    type="date"
                    value={invitationForm.eventDate}
                    onChange={(e) => setInvitationForm({ ...invitationForm, eventDate: e.target.value })}
                    required
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Event Time</label>
                  <input
                    type="text"
                    value={invitationForm.eventTime}
                    onChange={(e) => setInvitationForm({ ...invitationForm, eventTime: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Venue / Auditorium</label>
                <input
                  type="text"
                  value={invitationForm.venue}
                  onChange={(e) => setInvitationForm({ ...invitationForm, venue: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Invitation Message</label>
                <textarea
                  rows={2}
                  value={invitationForm.message}
                  onChange={(e) => setInvitationForm({ ...invitationForm, message: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInvitationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESPOND TO FEEDBACK MODAL */}
      {respondingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Reply to Parent Inquiry
              </h3>
              <button onClick={() => setRespondingFeedback(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border text-xs space-y-1">
              <span className="text-[10px] text-purple-400 font-bold block">{respondingFeedback.subject}</span>
              <p className="text-slate-700 dark:text-slate-300 italic">"{respondingFeedback.message}"</p>
              <span className="text-[10px] text-slate-400 block">
                From: {respondingFeedback.parent_name} for {respondingFeedback.student_name}
              </span>
            </div>

            <form onSubmit={handleSendFeedbackResponse} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Faculty Official Response
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write clear response and resolution advice for the parent..."
                  required
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRespondingFeedback(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Deliver Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACADEMIC SNAPSHOT DRAWER */}
      {academicContext && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setAcademicContext(null)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Student Academic Progress Snapshot
                </h3>
              </div>
              <button onClick={() => setAcademicContext(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance & Attendance Score */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                Live Attendance Summary
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-display font-black text-3xl text-purple-400">
                  {academicContext.attendancePercent}%
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {academicContext.attendedClasses} / {academicContext.totalClasses} Lectures Attended
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block">
                {academicContext.attendancePercent >= 75
                  ? '✓ Eligible for Semester End Examination'
                  : '⚠️ Attendance Warning Alert Required'}
              </span>
            </div>

            {/* Published Results */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Published Assessment Marks & Grades
              </h4>

              {academicContext.publishedMarks.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 text-center text-xs">
                  No published marks available yet for this student.
                </div>
              ) : (
                <div className="space-y-2">
                  {academicContext.publishedMarks.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 dark:text-white block">{m.subject_name || m.subject_code}</strong>
                        <span className="text-[10px] text-slate-400">{m.component_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-purple-400">
                          {m.marks_obtained} / {m.max_marks}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold ml-1.5">
                          {m.grade || 'A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Coursework */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Active Class Coursework & Deadlines
              </h4>
              <div className="space-y-2">
                {academicContext.upcomingAssignments.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">{a.title}</span>
                      <span className="text-[10px] text-slate-400">{a.subject}</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400">Due: {a.due_date}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const entry = directory.find((d) => d.studentRoll === academicContext.studentRoll);
                if (entry) handleScheduleForStudent(entry);
                setAcademicContext(null);
              }}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Schedule Parent Meeting for this Student
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
