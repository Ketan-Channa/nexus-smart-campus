import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRealtimeEvent } from '../../context/RealtimeContext';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  UserCheck,
  Sparkles,
  RefreshCw,
  Coffee,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building,
  User,
  PlusCircle,
  ArrowRight,
  Filter,
  Search,
  Layers,
  ChevronRight,
  Users,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';
import {
  type TimetableEntry,
  type StoredTimetableMeta,
  toCanonicalKey,
  parseMinsFromAnyTimeString,
  formatTeacherCode,
  parseDepartmentTimetableText,
  OFFICIAL_RAW_TIMETABLE_TEXT,
} from '../academics/TimetableConverter';
import { VacantVenueFinder } from '../academics/VacantVenueFinder';
import { RoomAvailabilityTimeline } from '../academics/RoomAvailabilityTimeline';

export interface FacultyTimetableScheduleProps {
  facultyName: string;
  facultyEmail: string;
  facultyCode?: string;
  inchargeClass?: string;
  onNavigateToAttendance?: (params: { className: string; subject: string; date: string }) => void;
  onNavigateToAssignments?: (params: { className: string; subject: string }) => void;
  onNavigateToStudents?: (params: { className: string }) => void;
}

const TIME_SLOT_DEFS = [
  { name: 'Slot I (09:00-10:00 AM)', start: '09:00 AM', end: '10:00 AM' },
  { name: 'Slot II (10:05-11:05 AM)', start: '10:05 AM', end: '11:05 AM' },
  { name: 'Slot III (11:25-12:25 PM)', start: '11:25 AM', end: '12:25 PM' },
  { name: 'Slot IV (12:30-01:30 PM)', start: '12:30 PM', end: '01:30 PM' },
  { name: 'Slot V (01:35-02:35 PM)', start: '01:35 PM', end: '02:35 PM' },
  { name: 'Slot VI (02:40-03:40 PM)', start: '02:40 PM', end: '03:40 PM' },
  { name: 'Slot VII (03:40-04:40 PM)', start: '03:40 PM', end: '04:40 PM' },
];

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const FacultyTimetableSchedule: React.FC<FacultyTimetableScheduleProps> = ({
  facultyName,
  facultyEmail,
  facultyCode,
  inchargeClass = 'B.TECH CSE 2023 A',
  onNavigateToAttendance,
  onNavigateToAssignments,
  onNavigateToStudents,
}) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [meta, setMeta] = useState<StoredTimetableMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sub-view Tab State
  const [activeTab, setActiveTab] = useState<'TODAY' | 'WEEKLY' | 'MY_SCHEDULE' | 'CLASS_SCHEDULE' | 'ROOM_FINDER'>('TODAY');

  // Selected Class & Filters
  const [selectedClass, setSelectedClass] = useState<string>(inchargeClass);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');

  // Real System Clock Ticker
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Canonical Faculty Identity Code (e.g. 'SMB', 'KP', 'HSD')
  const derivedFacultyCode = useMemo(() => {
    if (facultyCode && facultyCode.trim()) return facultyCode.trim().toUpperCase();
    if (facultyName) {
      // Extract capital initials or abbreviation
      const parts = facultyName.replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\./gi, '').trim().split(/\s+/);
      if (parts.length === 1 && parts[0].length <= 5) return parts[0].toUpperCase();
      if (parts.length >= 2) {
        return parts.map((p) => p.charAt(0)).join('').toUpperCase();
      }
    }
    return 'SMB'; // Default fallback matching official timetable dataset
  }, [facultyCode, facultyName]);

  const canonicalFacultyKey = useMemo(() => toCanonicalKey(derivedFacultyCode), [derivedFacultyCode]);

  // Fetch Active Canonical Timetable from Backend API (with local fallback)
  const fetchActiveTimetable = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.get('https://nexus-smart-campus-backend.onrender.com/api/academics/timetable');
      if (res.data && res.data.status === 'success' && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setTimetable(res.data.data);
        if (res.data.meta) setMeta(res.data.meta);
      } else {
        // Fallback to local official dataset
        const defaultEntries = parseDepartmentTimetableText(OFFICIAL_RAW_TIMETABLE_TEXT);
        setTimetable(defaultEntries);
      }
    } catch (err: any) {
      console.warn('Backend timetable fetch warning, using local dataset fallback:', err.message);
      const defaultEntries = parseDepartmentTimetableText(OFFICIAL_RAW_TIMETABLE_TEXT);
      setTimetable(defaultEntries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveTimetable();
  }, [fetchActiveTimetable]);

  // Real-Time Socket Event Listener (Phase 5 Pipeline)
  useRealtimeEvent('timetable.updated', (data: any) => {
    console.log('⚡ [Realtime Faculty UI] Active Timetable Update Received:', data);
    fetchActiveTimetable();
  });

  // Extract available unique classes dynamically
  const availableClasses = useMemo(() => {
    const set = new Set(timetable.map((t) => t.className).filter(Boolean));
    return Array.from(set).sort();
  }, [timetable]);

  // Current Day & Time Calculations
  const currentDayName = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[currentTime.getDay()];
  }, [currentTime]);

  const currentMinutes = useMemo(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }, [currentTime]);

  // Filter Lectures for Logged-In Faculty across all classes
  const facultyLectures = useMemo(() => {
    return timetable.filter((t) => {
      if (t.type === 'Break' || t.slotType === 'BREAK') return false;
      const tCode = formatTeacherCode(t.teacher);
      const tKey = t.canonicalFacultyKey || toCanonicalKey(tCode);
      return (
        tKey === canonicalFacultyKey ||
        tCode.toUpperCase() === derivedFacultyCode.toUpperCase() ||
        toCanonicalKey(t.teacher).includes(canonicalFacultyKey)
      );
    });
  }, [timetable, canonicalFacultyKey, derivedFacultyCode]);

  // Filter Lectures for Selected Class
  const classLectures = useMemo(() => {
    const targetKey = toCanonicalKey(selectedClass);
    return timetable.filter((t) => toCanonicalKey(t.className) === targetKey);
  }, [timetable, selectedClass]);

  // Today's Faculty Lectures
  const todayFacultyLectures = useMemo(() => {
    if (currentDayName === 'Sunday') return [];
    return facultyLectures
      .filter((t) => t.day === currentDayName)
      .sort((a, b) => parseMinsFromAnyTimeString(a.startTime) - parseMinsFromAnyTimeString(b.startTime));
  }, [facultyLectures, currentDayName]);

  // Current & Next Lecture for Logged-in Faculty
  const { currentLecture, nextLecture } = useMemo(() => {
    let currentLec: TimetableEntry | null = null;
    let nextLec: TimetableEntry | null = null;

    if (currentDayName === 'Sunday' || todayFacultyLectures.length === 0) {
      return { currentLecture: null, nextLecture: null };
    }

    for (const lec of todayFacultyLectures) {
      const startMins = parseMinsFromAnyTimeString(lec.startTime);
      const endMins = parseMinsFromAnyTimeString(lec.endTime);

      if (currentMinutes >= startMins && currentMinutes <= endMins) {
        currentLec = lec;
      } else if (startMins > currentMinutes && !nextLec) {
        nextLec = lec;
      }
    }

    return { currentLecture: currentLec, nextLecture: nextLec };
  }, [todayFacultyLectures, currentDayName, currentMinutes]);

  // Helper: Check if entry is assigned to logged-in faculty
  const isFacultyAssigned = (entry: TimetableEntry): boolean => {
    if (entry.type === 'Break' || entry.slotType === 'BREAK') return false;
    const tCode = formatTeacherCode(entry.teacher);
    const tKey = entry.canonicalFacultyKey || toCanonicalKey(tCode);
    return (
      tKey === canonicalFacultyKey ||
      tCode.toUpperCase() === derivedFacultyCode.toUpperCase() ||
      toCanonicalKey(entry.teacher).includes(canonicalFacultyKey)
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left select-none">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Faculty Academic Schedule Engine
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{currentDayName}, {currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center gap-3">
            <span>Faculty Timetable & Schedule</span>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Code: {derivedFacultyCode}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Logged in as <strong>{facultyName}</strong> ({facultyEmail}). Direct access to your teaching schedule, class timetables, and automated attendance registers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10">
          <button
            onClick={fetchActiveTimetable}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition-all shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Active Schedule</span>
          </button>
        </div>
      </div>

      {/* CURRENT & NEXT LECTURE REAL-TIME BANNER */}
      {currentDayName !== 'Sunday' && (currentLecture || nextLecture) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CURRENT LECTURE CARD */}
          {currentLecture ? (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/50 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> CURRENT LECTURE IN SESSION
                </span>
                <span className="font-mono text-xs text-emerald-300 font-bold">{currentLecture.startTime} - {currentLecture.endTime}</span>
              </div>

              <div>
                <h3 className="font-black text-lg text-white">{currentLecture.subject}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200 mt-1">
                  <span className="font-bold">Class: {currentLecture.className}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono font-bold"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Venue: {currentLecture.room}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/30">
                {onNavigateToAttendance && (
                  <button
                    onClick={() => onNavigateToAttendance({ className: currentLecture.className, subject: currentLecture.subject, date: currentTime.toISOString().split('T')[0] })}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Take Live Attendance
                  </button>
                )}
                {onNavigateToAssignments && (
                  <button
                    onClick={() => onNavigateToAssignments({ className: currentLecture.className, subject: currentLecture.subject })}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Create Assignment
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Slot Status</span>
                <p className="text-sm font-bold text-slate-300">No active lecture right now in this slot.</p>
              </div>
              <Coffee className="w-8 h-8 text-amber-500/60" />
            </div>
          )}

          {/* NEXT LECTURE CARD */}
          {nextLecture ? (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/50 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
                  <ArrowRight className="w-3.5 h-3.5" /> UPCOMING NEXT LECTURE
                </span>
                <span className="font-mono text-xs text-indigo-300 font-bold">{nextLecture.startTime} - {nextLecture.endTime}</span>
              </div>

              <div>
                <h3 className="font-black text-lg text-white">{nextLecture.subject}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 mt-1">
                  <span className="font-bold">Class: {nextLecture.className}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono font-bold"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Venue: {nextLecture.room}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/30">
                {onNavigateToAttendance && (
                  <button
                    onClick={() => onNavigateToAttendance({ className: nextLecture.className, subject: nextLecture.subject, date: currentTime.toISOString().split('T')[0] })}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Prepare Register
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Upcoming Status</span>
                <p className="text-sm font-bold text-slate-300">No further lectures scheduled for today.</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
            </div>
          )}
        </div>
      )}

      {/* NAVIGATION SUB-VIEW TABS */}
      <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-1 text-xs font-bold shadow-sm">
        <button
          onClick={() => setActiveTab('TODAY')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'TODAY'
              ? 'bg-amber-500 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Today's Schedule</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
            {todayFacultyLectures.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('WEEKLY')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'WEEKLY'
              ? 'bg-indigo-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Weekly Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_SCHEDULE')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'MY_SCHEDULE'
              ? 'bg-purple-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Teaching Schedule</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
            {facultyLectures.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CLASS_SCHEDULE')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'CLASS_SCHEDULE'
              ? 'bg-cyan-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Class Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('ROOM_FINDER')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'ROOM_FINDER'
              ? 'bg-emerald-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Vacant Venues & Rooms</span>
        </button>
      </div>

      {/* 1. TODAY'S SCHEDULE VIEW */}
      {activeTab === 'TODAY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Today's Scheduled Lectures ({currentDayName})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Assigned Code: <strong>{derivedFacultyCode}</strong></span>
          </div>

          {currentDayName === 'Sunday' ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Coffee className="w-12 h-12 mx-auto text-amber-500" />
              <h4 className="font-black text-lg text-slate-900 dark:text-white">Campus Sunday Holiday</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">No lectures scheduled today. Enjoy your weekend break!</p>
            </div>
          ) : todayFacultyLectures.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <h4 className="font-black text-lg text-slate-900 dark:text-white">No Classes Scheduled for Today</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">You have no teaching lectures assigned on {currentDayName} in the active timetable.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayFacultyLectures.map((lec, idx) => {
                const startMins = parseMinsFromAnyTimeString(lec.startTime);
                const endMins = parseMinsFromAnyTimeString(lec.endTime);
                const isOngoing = currentMinutes >= startMins && currentMinutes <= endMins;
                const isPast = currentMinutes > endMins;

                return (
                  <div
                    key={lec.id || idx}
                    className={`p-5 rounded-3xl border transition-all ${
                      isOngoing
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-xl'
                        : isPast
                        ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Period {idx + 1}: {lec.startTime} - {lec.endTime}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isOngoing
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : isPast
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {isOngoing ? 'ONGOING NOW' : isPast ? 'COMPLETED' : 'UPCOMING'}
                      </span>
                    </div>

                    <div className="py-3 space-y-1.5">
                      <h4 className="font-black text-base text-slate-900 dark:text-white">{lec.subject}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Class: {lec.className}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono font-bold text-purple-600 dark:text-purple-300">
                          <MapPin className="w-3.5 h-3.5" /> Room: {lec.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        {onNavigateToAttendance && (
                          <button
                            onClick={() => onNavigateToAttendance({ className: lec.className, subject: lec.subject, date: currentTime.toISOString().split('T')[0] })}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Take Attendance
                          </button>
                        )}
                        {onNavigateToAssignments && (
                          <button
                            onClick={() => onNavigateToAssignments({ className: lec.className, subject: lec.subject })}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-indigo-500" /> Assignment
                          </button>
                        )}
                      </div>

                      {onNavigateToStudents && (
                        <button
                          onClick={() => onNavigateToStudents({ className: lec.className })}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Roster</span> <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. WEEKLY TIMETABLE MATRIX */}
      {activeTab === 'WEEKLY' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Weekly Institution Matrix (Class: {selectedClass})
              </h3>
              <p className="text-xs text-slate-400">Lectures assigned to you ({derivedFacultyCode}) are highlighted in gold border.</p>
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>Class: {cls}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-200 dark:border-slate-800">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3 border border-slate-200 dark:border-slate-800 w-36">Time Slot</th>
                  {WEEK_DAYS.map((day) => (
                    <th key={day} className={`py-3 px-3 border border-slate-200 dark:border-slate-800 min-w-[140px] ${day === currentDayName ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black' : ''}`}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {TIME_SLOT_DEFS.map((slot) => {
                  const slotStartMins = parseMinsFromAnyTimeString(slot.start);

                  return (
                    <tr key={slot.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono font-bold text-[11px] bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        {slot.start} - {slot.end}
                      </td>

                      {WEEK_DAYS.map((day) => {
                        const dayLectures = classLectures.filter((t) => t.day === day);
                        const matchedLec = dayLectures.find((t) => {
                          const mins = parseMinsFromAnyTimeString(t.startTime);
                          return Math.abs(mins - slotStartMins) <= 15;
                        });

                        if (!matchedLec) {
                          return (
                            <td key={day} className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-[11px]">
                              <span className="italic text-slate-300 dark:text-slate-700">Free Period</span>
                            </td>
                          );
                        }

                        if (matchedLec.type === 'Break' || matchedLec.slotType === 'BREAK') {
                          return (
                            <td key={day} className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] text-center">
                              <Coffee className="w-3.5 h-3.5 inline-block mr-1 text-amber-500" />
                              {matchedLec.breakType === 'LUNCH' ? 'LUNCH BREAK' : 'TEA BREAK'}
                            </td>
                          );
                        }

                        const isMine = isFacultyAssigned(matchedLec);

                        return (
                          <td
                            key={day}
                            className={`py-2.5 px-3 border transition-all ${
                              isMine
                                ? 'bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <strong className="block text-xs font-bold truncate">{matchedLec.subject}</strong>
                              <span className="text-[10px] font-mono block text-slate-400">
                                {matchedLec.className} • Room: <strong>{matchedLec.room}</strong>
                              </span>
                              <span className={`text-[10px] block font-mono ${isMine ? 'text-amber-500 font-black' : 'text-slate-400'}`}>
                                Code: {matchedLec.teacher} {isMine ? '★ (MY CLASS)' : ''}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MY TEACHING SCHEDULE VIEW */}
      {activeTab === 'MY_SCHEDULE' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" /> My Complete Teaching Schedule ({facultyLectures.length} Total Assigned Lectures)
              </h3>
              <p className="text-xs text-slate-400">Filtered automatically using canonical faculty code: <strong>{derivedFacultyCode}</strong></p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Filter Day:</span>
              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All">All Days</option>
                {WEEK_DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Assigned Class</th>
                    <th className="py-3 px-4">Venue Room</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {facultyLectures
                    .filter((t) => selectedDayFilter === 'All' || t.day === selectedDayFilter)
                    .map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.day}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.startTime} - {item.endTime}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.subject}</td>
                        <td className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-300">{item.className}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300"><MapPin className="w-3 h-3 inline mr-1 text-purple-400" />{item.room}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onNavigateToAttendance && (
                              <button
                                onClick={() => onNavigateToAttendance({ className: item.className, subject: item.subject, date: currentTime.toISOString().split('T')[0] })}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]"
                              >
                                Take Attendance
                              </button>
                            )}
                            {onNavigateToAssignments && (
                              <button
                                onClick={() => onNavigateToAssignments({ className: item.className, subject: item.subject })}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                              >
                                Assignment
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CLASS SCHEDULE VIEW */}
      {activeTab === 'CLASS_SCHEDULE' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-500" /> Class Schedule Directory
              </h3>
              <p className="text-xs text-slate-400">Select any authorized class section to view complete timetable schedule.</p>
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>Class: {cls}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WEEK_DAYS.map((day) => {
              const dayLectures = classLectures.filter((t) => t.day === day);
              if (dayLectures.length === 0) return null;

              return (
                <div key={day} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-md">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                    <span>{day}</span>
                    <span className="text-xs font-mono text-slate-400">{dayLectures.length} Slots</span>
                  </h4>

                  <div className="space-y-2">
                    {dayLectures.map((item, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <strong className="font-bold text-slate-900 dark:text-white block">{item.subject}</strong>
                          <span className="text-[11px] text-slate-400 font-mono">{item.startTime} - {item.endTime} • Room: {item.room}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono font-bold text-[10px]">
                          Code: {item.teacher}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. VACANT VENUES & ROOM TIMELINE VIEW */}
      {activeTab === 'ROOM_FINDER' && (
        <div className="space-y-6">
          <VacantVenueFinder timetable={timetable} selectedClass={selectedClass} />
          <RoomAvailabilityTimeline timetable={timetable} />
        </div>
      )}
    </div>
  );
};
