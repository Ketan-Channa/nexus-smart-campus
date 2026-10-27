import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  MapPin,
  Mail,
  ExternalLink,
  Award,
  UserPlus,
  UserCheck,
  CheckCircle,
  MessageSquare,
  Sparkles,
  X,
  Briefcase,
  Globe,
} from 'lucide-react';

export interface AlumniProfileData {
  id: number | string;
  full_name: string;
  username?: string;
  email: string;
  mobile?: string;
  photograph_url?: string;
  cover_photo_url?: string;
  graduation_year: string | number;
  batch?: string;
  degree?: string;
  department: string;
  section?: string;
  college_name?: string;
  current_city?: string;
  current_country?: string;
  current_company?: string;
  current_designation?: string;
  industry?: string;
  skills?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  other_links?: string;
  alumni_id?: string;
  mentorship_available?: boolean | number;
  job_provider?: boolean | number;
  experiences?: any[];
  achievements?: any[];
}

export type ConnectionStatusType = 'NOT_SENT' | 'PENDING' | 'ACCEPTED' | 'INCOMING_PENDING';

interface AlumniProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumni: AlumniProfileData | null;
  connectionStatus: ConnectionStatusType;
  onSendRequest: (alumni: AlumniProfileData) => void;
  onCancelRequest?: (alumni: AlumniProfileData) => void;
  onAcceptRequest?: (alumni: AlumniProfileData) => void;
  onDeclineRequest?: (alumni: AlumniProfileData) => void;
  onRequestMentorship?: (alumni: AlumniProfileData) => void;
  onOpenChat?: (alumni: AlumniProfileData) => void;
  userRole?: string;
}

export const AlumniProfileViewModal: React.FC<AlumniProfileViewModalProps> = ({
  isOpen,
  onClose,
  alumni,
  connectionStatus,
  onSendRequest,
  onCancelRequest,
  onAcceptRequest,
  onDeclineRequest,
  onRequestMentorship,
  onOpenChat,
  userRole = 'Student',
}) => {
  if (!isOpen || !alumni) return null;

  const skillsList = alumni.skills
    ? typeof alumni.skills === 'string'
      ? alumni.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(alumni.skills)
      ? alumni.skills
      : []
    : ['System Architecture', 'Leadership', 'Cloud Infrastructure', 'Machine Learning'];

  const alumniIdCode = alumni.alumni_id || `ALM-${alumni.graduation_year || '2023'}-${(alumni.department || 'CSE').substring(0, 3).toUpperCase()}-001`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left"
      >
        {/* COVER PHOTO BANNER */}
        <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 relative overflow-hidden shrink-0">
          {alumni.cover_photo_url ? (
            <img src={alumni.cover_photo_url} alt="Cover" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-indigo-500/10 to-transparent" />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-lg z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-purple-200">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Official Verified Alumni ID: {alumniIdCode}
          </div>
        </div>

        {/* PROFILE HEADER & AVATAR ROW */}
        <div className="px-6 pb-4 pt-0 relative shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-3">
            {/* AVATAR */}
            <div className="relative">
              {alumni.photograph_url ? (
                <img
                  src={alumni.photograph_url}
                  alt={alumni.full_name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-xl">
                  {alumni.full_name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-1 right-1 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900 shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* ACTION BUTTONS (4 DISTINCT STATUS STATES) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* STATE 1: ACCEPTED / CONNECTED */}
              {connectionStatus === 'ACCEPTED' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCancelRequest && onCancelRequest(alumni)}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black text-xs flex items-center gap-2 shadow"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>Request Accepted • Connected Friend</span>
                  </button>
                  {onOpenChat && (
                    <button
                      onClick={() => onOpenChat(alumni)}
                      className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  )}
                </div>
              )}

              {/* STATE 2: PENDING OUTGOING SENT REQUEST */}
              {connectionStatus === 'PENDING' && (
                <button
                  onClick={() => onCancelRequest && onCancelRequest(alumni)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-black text-xs flex items-center gap-2 shadow hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
                  title="Click to cancel pending request"
                >
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span>Request Sent • Pending Acceptance (Cancel)</span>
                </button>
              )}

              {/* STATE 3: PENDING INCOMING REQUEST */}
              {connectionStatus === 'INCOMING_PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAcceptRequest && onAcceptRequest(alumni)}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow"
                  >
                    <UserCheck className="w-4 h-4" /> Accept Request
                  </button>
                  <button
                    onClick={() => onDeclineRequest && onDeclineRequest(alumni)}
                    className="px-3 py-2.5 rounded-2xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs"
                  >
                    Decline
                  </button>
                </div>
              )}

              {/* STATE 4: NOT SENT (DEFAULT) */}
              {connectionStatus === 'NOT_SENT' && (
                <button
                  onClick={() => onSendRequest(alumni)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs transition-all shadow-purple-500/25 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Add Connection (Request Not Sent)</span>
                </button>
              )}

              {/* Mentorship Button for Students */}
              {userRole === 'Student' && onRequestMentorship && (
                <button
                  onClick={() => onRequestMentorship(alumni)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>Request Mentorship</span>
                </button>
              )}
            </div>
          </div>

          {/* NAME & ROLE DEMOGRAPHICS */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">{alumni.full_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold text-[10px] uppercase">
                Verified Alumni
              </span>
            </div>

            <p className="text-xs font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{alumni.current_designation || 'Software Specialist'}</span>
              <span className="text-slate-400">•</span>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-800 dark:text-slate-200">{alumni.current_company || 'Tech Enterprise'}</strong>
            </p>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                {alumni.degree || 'B.Tech'} {alumni.department} (Batch {alumni.graduation_year})
              </span>
              {(alumni.current_city || alumni.current_country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {alumni.current_city ? `${alumni.current_city}, ` : ''}{alumni.current_country || 'India'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SCROLLABLE BODY CONTENT */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* BIO / STORY */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Professional Overview & Story
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              {alumni.bio ||
                `Distinguished NEXUS Alumnus from ${alumni.department} (Class of ${alumni.graduation_year}). Currently working as ${
                  alumni.current_designation || 'Specialist'
                } at ${alumni.current_company || 'Industry Leader'}. Passionate about mentoring students and contributing to campus innovation projects.`}
            </p>
          </div>

          {/* DOMAIN EXPERTISE & SKILLS */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-500" /> Key Skills & Domain Expertise
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* MENTORSHIP & HIGHLIGHTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Mentorship Availability</span>
              <strong className={`text-xs font-bold flex items-center gap-1.5 ${alumni.mentorship_available ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                {alumni.mentorship_available ? 'Available for Student Mentorship' : 'Mentorship by Request'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">College / Campus</span>
              <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {alumni.college_name || 'NEXUS Partner Campus'}
              </strong>
            </div>
          </div>

          {/* SOCIAL & CONTACT LINKS */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">Professional Networks & Contact</h4>
            <div className="flex items-center gap-3 flex-wrap">
              {alumni.linkedin_url && (
                <a
                  href={alumni.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow hover:bg-blue-700 transition"
                >
                  <Globe className="w-4 h-4 text-white" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}

              {alumni.github_url && (
                <a
                  href={alumni.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow hover:bg-slate-700 transition"
                >
                  <Globe className="w-4 h-4 text-purple-300" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}

              <a
                href={`mailto:${alumni.email}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Mail className="w-4 h-4 text-purple-500" />
                <span>{alumni.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow hover:opacity-90 transition"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};
