import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  MapPin,
  User,
  Bell,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Plus,
} from 'lucide-react';
import { type TimetableEntry, formatTeacherCode } from './TimetableConverter';

interface AcademicsSquareCardProps {
  timetable?: TimetableEntry[];
  onOpenFullTimetable?: () => void;
}

export const AcademicsSquareCard: React.FC<AcademicsSquareCardProps> = ({
  timetable = [],
  onOpenFullTimetable,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [activeAlert, setActiveAlert] = useState<{
    minsLeft: number;
    title: string;
    room: string;
    teacher: string;
  } | null>(null);

  const [activeList, setActiveList] = useState<TimetableEntry[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>('BTECH CSE 4A');

  // Sync timetable data & selected class with localStorage & window events
  useEffect(() => {
    const syncTimetableData = () => {
      const rawData = localStorage.getItem('nexus_user_timetable');
      const rawMeta = localStorage.getItem('nexus_user_timetable_meta');

      let targetClass = 'BTECH CSE 4A';
      if (rawMeta) {
        try {
          const meta = JSON.parse(rawMeta);
          if (meta.selectedClass) targetClass = meta.selectedClass;
        } catch (e) {
          // Fallback
        }
      }

      if (rawData) {
        try {
          const parsed: TimetableEntry[] = JSON.parse(rawData);
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const todayName = dayNames[new Date().getDay()];

          // Filter ONLY the lectures belonging to the selected class AND today's day!
          let filtered = parsed.filter((t) => {
            const normEntry = t.className.toLowerCase().replace(/[\s\.\-]/g, '');
            const normTarget = targetClass.toLowerCase().replace(/[\s\.\-]/g, '');
            const matchesClass = normEntry === normTarget;
            const matchesDay = todayName === 'Sunday' ? true : (t.day && t.day.toLowerCase() === todayName.toLowerCase());
            return matchesClass && matchesDay;
          });

          if (filtered.length === 0) {
            // Fallback to all class lectures if no specific today match
            filtered = parsed.filter((t) => {
              const normEntry = t.className.toLowerCase().replace(/[\s\.\-]/g, '');
              const normTarget = targetClass.toLowerCase().replace(/[\s\.\-]/g, '');
              return normEntry === normTarget;
            });
          }

          setActiveList(filtered.length > 0 ? filtered : parsed);
          setSelectedClassName(targetClass);
          setCurrentIndex(0);
        } catch (e) {
          setActiveList([]);
        }
      } else {
        setActiveList([]);
      }
    };

    syncTimetableData();
    window.addEventListener('nexus_timetable_updated', syncTimetableData);
    return () => window.removeEventListener('nexus_timetable_updated', syncTimetableData);
  }, [timetable]);

  // 10-Second Auto-Rotation Timer
  useEffect(() => {
    if (!isAutoPlay || activeList.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeList.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoPlay, activeList.length]);

  // Notification alerts simulation
  useEffect(() => {
    if (activeList.length === 0) {
      setActiveAlert(null);
      return;
    }

    const currentSlot = activeList[currentIndex % activeList.length];
    if (!currentSlot) return;

    const alerts = [
      { minsLeft: 10, title: currentSlot.subject, room: currentSlot.room, teacher: formatTeacherCode(currentSlot.teacher) },
      { minsLeft: 5, title: currentSlot.subject, room: currentSlot.room, teacher: formatTeacherCode(currentSlot.teacher) },
      { minsLeft: 0, title: currentSlot.subject, room: currentSlot.room, teacher: formatTeacherCode(currentSlot.teacher) },
    ];

    let alertIdx = 0;
    const alertInterval = setInterval(() => {
      setActiveAlert(alerts[alertIdx]);
      alertIdx = (alertIdx + 1) % alerts.length;
    }, 12000);

    return () => clearInterval(alertInterval);
  }, [currentIndex, activeList]);

  const isSundayToday = new Date().getDay() === 0;
  const currentLecture = activeList[currentIndex % activeList.length];

  if (isSundayToday) {
    return (
      <div className="relative w-full h-full flex flex-col justify-between p-6">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
                Academics & Timetable
              </h4>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Sunday Campus Holiday</span>
            </div>
          </div>
        </div>

        <div
          onClick={onOpenFullTimetable}
          className="flex-1 my-3 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-amber-500 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-2 font-bold text-sm">
            ☀️
          </div>
          <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200">Sunday Holiday — Campus Closed</h5>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">No lectures scheduled today. Enjoy your break!</span>
        </div>

        <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onOpenFullTimetable}
            className="text-xs font-bold text-indigo-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Open Academics Module</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }


  if (activeList.length === 0) {
    return (
      <div className="relative w-full h-full flex flex-col justify-between p-6">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
                Academics & Timetable
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">Smart Scheduling System</span>
            </div>
          </div>
        </div>

        <div
          onClick={onOpenFullTimetable}
          className="flex-1 my-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
            <Plus className="w-5 h-5" />
          </div>
          <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">Open Timetable Engine</h5>
          <span className="text-[10px] text-slate-400 mt-0.5">Click to Upload or Select Class</span>
        </div>

        <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onOpenFullTimetable}
            className="text-xs font-bold text-indigo-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Open Academics Module</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6">
      {/* Top Header Control */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Academics & Timetable
            </h4>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Class: {selectedClassName} ({currentIndex + 1}/{activeList.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title={isAutoPlay ? 'Pause 10s Rotator' : 'Play 10s Rotator'}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ROTATING TIMESLOT CARD BODY FOR SELECTED CLASS ONLY */}
      <div className="flex-1 my-3 relative overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={(currentLecture?.id || 'slot') + currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col justify-between h-full space-y-2"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-purple-300 font-extrabold border border-indigo-200 dark:border-indigo-800/60">
                {currentLecture?.className || selectedClassName}
              </span>
              <span className="font-bold text-slate-500 dark:text-slate-400">
                {currentLecture?.day || 'Monday'}
              </span>
            </div>

            <div>
              <h5 className="font-display font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                {currentLecture?.subject}
              </h5>
              <span className="text-[10px] text-indigo-500 dark:text-purple-400 font-mono font-bold">
                {currentLecture?.slotName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="truncate">{currentLecture?.startTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate font-bold text-slate-900 dark:text-white">{currentLecture?.room}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 col-span-2">
                <User className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate font-bold text-amber-600 dark:text-amber-400">
                  {formatTeacherCode(currentLecture?.teacher || '')}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {isAutoPlay && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
            />
          </div>
        )}
      </div>

      {/* NOTIFICATION ALERT BANNER */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between shadow-md mb-2 border ${
              activeAlert.minsLeft === 0
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-300 animate-pulse'
                : activeAlert.minsLeft === 5
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300'
                : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-600 dark:text-purple-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {activeAlert.minsLeft === 0
                  ? `NOW STARTING: ${activeAlert.title}`
                  : `In ${activeAlert.minsLeft} mins: ${activeAlert.title}`}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-mono shrink-0">
              {activeAlert.room}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Footer */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onOpenFullTimetable}
          className="text-xs font-bold text-indigo-600 dark:text-purple-400 hover:underline flex items-center gap-1"
        >
          <span>Open Full Timetable</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + activeList.length) % activeList.length)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeList.length)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
