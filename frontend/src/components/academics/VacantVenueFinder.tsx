import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Calendar,
  Search,
  CheckCircle2,
  Coffee,
  ShieldCheck,
  Zap,
  Sliders,
  Sun,
  GraduationCap,
  Sparkles,
} from 'lucide-react';


import { type TimetableEntry, toCanonicalKey } from './TimetableConverter';

interface VacantVenueFinderProps {
  timetable: TimetableEntry[];
  selectedClass: string;
}

export interface VenueInfo {
  roomCode: string;
  building: string;
  floor: string;
  capacity: number;
  type: 'Classroom' | 'Lab' | 'Auditorium' | 'Lounge';
  amenities: string[];
}

const ALL_CAMPUS_VENUES: VenueInfo[] = [
  { roomCode: 'ET-101', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-102', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-103', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-104', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-201', building: 'Engineering Tower', floor: '2nd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-202', building: 'Engineering Tower', floor: '2nd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-301', building: 'Engineering Tower', floor: '3rd Floor', capacity: 70, type: 'Classroom', amenities: ['AC', 'WiFi', 'Smart Board'] },
  { roomCode: 'ET-302', building: 'Engineering Tower', floor: '3rd Floor', capacity: 70, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-303', building: 'Engineering Tower', floor: '3rd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-310', building: 'Engineering Tower', floor: '3rd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-401', building: 'Engineering Tower', floor: '4th Floor', capacity: 65, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-402', building: 'Engineering Tower', floor: '4th Floor', capacity: 65, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-403', building: 'Engineering Tower', floor: '4th Floor', capacity: 65, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ETCC-200', building: 'Computer Centre Block', floor: '2nd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'PCs'] },
  { roomCode: 'ETCC-209', building: 'Computer Centre Block', floor: '2nd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'PCs'] },
  { roomCode: 'ETCC-304', building: 'Computer Centre Block', floor: '3rd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'Java Stack'] },
  { roomCode: 'ETCC-307', building: 'Computer Centre Block', floor: '3rd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN'] },
  { roomCode: 'ETCC-309', building: 'Computer Centre Block', floor: '3rd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'Docker Nodes'] },
  { roomCode: 'ETCC-407', building: 'Computer Centre Block', floor: '4th Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN'] },
  { roomCode: 'ETCC-507', building: 'Computer Centre Block', floor: '5th Floor', capacity: 55, type: 'Lab', amenities: ['AC', 'WiFi', 'Workshop Setup'] },
  { roomCode: 'ETCC-607', building: 'Computer Centre Block', floor: '6th Floor', capacity: 60, type: 'Lab', amenities: ['AC', 'WiFi', 'Projector', 'Power Sockets'] },
  { roomCode: 'MTCL-1', building: 'Main Technology Complex', floor: '1st Floor', capacity: 45, type: 'Lab', amenities: ['AC', 'WiFi'] },
  { roomCode: 'MTCL-2', building: 'Main Technology Complex', floor: '2nd Floor', capacity: 45, type: 'Lab', amenities: ['AC', 'WiFi'] },
  { roomCode: 'AI LAB-1', building: 'Innovation Hub', floor: 'Ground Floor', capacity: 40, type: 'Lab', amenities: ['AC', 'GPU Workstations', 'WiFi'] },
  { roomCode: 'AUDITORIUM 1', building: 'Central Block', floor: 'Ground Floor', capacity: 300, type: 'Auditorium', amenities: ['AC', 'Stage', 'Sound System'] },
  { roomCode: 'AUDITORIUM 2', building: 'Central Block', floor: '1st Floor', capacity: 200, type: 'Auditorium', amenities: ['AC', 'Sound System'] },
  { roomCode: 'STUDENT LOUNGE A', building: 'Student Activity Centre', floor: 'Ground Floor', capacity: 80, type: 'Lounge', amenities: ['AC', 'Sofa Seating', 'WiFi', 'Snack Bar'] },
];

const SERIAL_TIME_SLOTS = [
  '09:00 AM - 10:00 AM (Slot I)',
  '10:05 AM - 11:05 AM (Slot II)',
  '11:05 AM - 11:25 AM (Universal Tea Break)',
  '11:25 AM - 12:25 PM (Slot III)',
  '12:30 PM - 01:30 PM (Slot IV - Lunch Break)',
  '01:35 PM - 02:35 PM (Slot V - Lunch Break)',
  '02:40 PM - 03:40 PM (Slot VI)',
  '03:40 PM - 04:40 PM (Slot VII)',
];

export const VacantVenueFinder: React.FC<VacantVenueFinderProps> = ({
  timetable,
  selectedClass,
}) => {
  const [searchMode, setSearchMode] = useState<'Instant' | 'Custom'>('Instant');
  
  // Extract ALL classes dynamically from uploaded timetable
  const dynamicClasses = Array.from(new Set(timetable.map((t) => t.className).filter(Boolean)));
  
  const [targetClass, setTargetClass] = useState<string>(selectedClass || (dynamicClasses[0] || 'BTECH CSE 4A'));
  const [targetDay, setTargetDay] = useState<string>('Monday');
  const [targetTimeSlot, setTargetTimeSlot] = useState<string>('12:30 PM - 01:30 PM (Slot IV - Lunch Break)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemTimeStr, setSystemTimeStr] = useState<string>('');


  // Sync target class if selectedClass changes
  useEffect(() => {
    if (selectedClass) setTargetClass(selectedClass);
  }, [selectedClass]);

  // Live system clock effect for Instant Mode & Sunday detection
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[now.getDay()];
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      setSystemTimeStr(`${currentDay}, ${timeStr}`);

      if (searchMode === 'Instant') {
        setTargetDay(currentDay);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, [searchMode]);


  const handleClassChange = (newClass: string) => {
    setTargetClass(newClass);
  };

  const handleAnalyzeVacantVenues = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 600);
  };

  const targetStartTime = targetTimeSlot.split(' ')[0];
  const isSundaySelected = targetDay === 'Sunday';

  // Map of occupied rooms with details
  const occupiedRoomDetails = new Map<string, { className: string; subject: string; teacher: string; endTime: string }>();

  if (!isSundaySelected) {
    timetable.forEach((entry) => {
      const matchesDay = entry.day === targetDay;
      const matchesTime = entry.startTime.includes(targetStartTime);
      if (matchesDay && matchesTime && entry.room && entry.room !== 'VACANT LOUNGE') {
        occupiedRoomDetails.set(toCanonicalKey(entry.room), {
          className: entry.className,
          subject: entry.subject,
          teacher: entry.teacher,
          endTime: entry.endTime,
        });
      }
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase">
              <ShieldCheck className="w-3 h-3 text-amber-500" /> Re-engineered Smart Venue Finder
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              Vacant Venues & Break Recommendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-analyzes full departmental timetable for all classes. Finds free rooms for sitting/hanging out during lunch & tea breaks!
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSearchMode('Instant')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              searchMode === 'Instant'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Instant System Time</span>
          </button>
          <button
            onClick={() => setSearchMode('Custom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              searchMode === 'Custom'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Day/Time</span>
          </button>
        </div>
      </div>

      {/* Mode Status Indicator Bar */}
      {searchMode === 'Instant' ? (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>Live System Time Mode Active: <strong>{systemTimeStr}</strong></span>
          </div>
          <span className="text-[10px] bg-amber-500/20 px-2.5 py-1 rounded-full font-mono uppercase font-black">
            Auto-Updated
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* ALL CLASSES DROPDOWN */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Target Class ({dynamicClasses.length} Options)
            </label>
            <select
              value={targetClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 font-extrabold focus:outline-none"
            >
              {dynamicClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* DAY SELECTOR WITH SUNDAY HOLIDAY SUPPORT */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-500" /> Select Day
            </label>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 font-extrabold focus:outline-none"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday (Holiday)</option>
            </select>
          </div>

          {/* TIME SLOTS IN STRICT CHRONOLOGICAL SERIAL ORDER */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Select Time Slot (Serial Order)
            </label>
            <select
              value={targetTimeSlot}
              onChange={(e) => setTargetTimeSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-extrabold focus:outline-none"
            >
              {SERIAL_TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* FAST CLASS SWITCH CHIPS FOR ALL CLASSES */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Filter Class:</span>
        {dynamicClasses.map((cName) => (
          <button
            key={cName}
            onClick={() => handleClassChange(cName)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
              targetClass === cName
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-500'
            }`}
          >
            {cName}
          </button>
        ))}
      </div>

      {/* SUNDAY HOLIDAY FEATURED BANNER */}
      {isSundaySelected && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sun className="w-7 h-7 text-amber-200 animate-spin-slow" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-200" /> Campus Sunday Holiday
            </div>
            <h4 className="font-display font-black text-base">
              Happy Sunday! No Academic Lectures Scheduled Today
            </h4>
            <p className="text-xs text-amber-100 opacity-95 mt-0.5">
              All departmental classrooms, computer labs, and student lounges are completely vacant and open for self-study, group discussions, and campus hanging out!
            </p>
          </div>
        </div>
      )}

      {/* VENUE STATUS CARDS GRID */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Campus Venues Status on <strong>{targetDay}</strong> ({targetTimeSlot.split(' ')[0]} - {targetTimeSlot.split(' ')[2]}) for <strong>{targetClass}</strong>
          </h4>

          <button
            onClick={handleAnalyzeVacantVenues}
            disabled={isAnalyzing}
            className="px-4 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-md hover:bg-amber-600 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Re-Check Venues</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_CAMPUS_VENUES.map((venue) => {
            const occupiedInfo = isSundaySelected ? undefined : occupiedRoomDetails.get(toCanonicalKey(venue.roomCode));
            const isVacant = !occupiedInfo;

            return (
              <motion.div
                key={venue.roomCode}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3 }}
                className={`p-5 rounded-2xl border shadow-md hover:shadow-lg transition-all space-y-3 flex flex-col justify-between ${
                  isVacant
                    ? 'bg-gradient-to-br from-emerald-50/50 to-slate-50 dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-gradient-to-br from-rose-50/50 to-slate-50 dark:from-rose-950/20 dark:to-slate-900 border-rose-200 dark:border-rose-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      isVacant ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-display font-black text-sm text-slate-900 dark:text-white">
                        {venue.roomCode}
                      </h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {venue.building} • {venue.floor}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                    isVacant
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-300'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isVacant ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                    {isVacant ? (isSundaySelected ? 'SUNDAY VACANT' : 'VACANT NOW') : 'OCCUPIED'}
                  </span>
                </div>

                {isVacant ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isSundaySelected ? 'Open for Sunday Study & Hangout' : `Available for ${targetClass} Break`}</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Capacity: {venue.capacity} seats • Amenities: {venue.amenities.join(', ')}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                      <span>Occupied by {occupiedInfo?.className}</span>
                    </div>
                    <p className="text-[10px] text-rose-700 dark:text-rose-300">
                      Lecture: <strong>{occupiedInfo?.subject}</strong> ({occupiedInfo?.teacher}) till {occupiedInfo?.endTime}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
