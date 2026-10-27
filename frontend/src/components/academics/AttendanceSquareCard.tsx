import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Award,
  Play,
  Pause,
  ClipboardList,
  Bell,
} from 'lucide-react';

interface AttendanceSquareCardProps {
  onNavigateToAttendance?: () => void;
}

interface LectureAttendanceItem {
  id: string;
  type: 'overall' | 'lecture';
  subject: string;
  code: string;
  faculty: string;
  percentage: number;
  isSafe: boolean;
  status: string;
  marginLectures: number;
  className: string;
}

// Helper to convert full names or raw codes into clean teacher codes (e.g. Prof. VS -> VS, Dr. SMB -> SMB)
export const formatTeacherCode = (rawTeacher: string): string => {
  if (!rawTeacher) return 'TBA';
  const clean = rawTeacher.trim();
  if (clean.length <= 5 && !clean.includes(' ')) return clean.toUpperCase();
  const parts = clean.split(' ');
  const lastPart = parts[parts.length - 1];
  if (lastPart.length <= 5) return lastPart.toUpperCase();
  return parts.map((p) => p[0]).join('').toUpperCase().substring(0, 4);
};

const normalizeSubjectInfo = (rawName: string, rawCode?: string, rawFaculty?: string): { title: string; code: string; faculty: string } => {
  return {
    title: (rawName || 'SUBJECT').toUpperCase(),
    code: (rawCode || 'SUB').toUpperCase(),
    faculty: (rawFaculty || 'DEPT').toUpperCase(),
  };
};


export const AttendanceSquareCard: React.FC<AttendanceSquareCardProps> = ({ onNavigateToAttendance }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [userClass, setUserClass] = useState<string>('BTECH CSE 4A');
  const [overallPercentage, setOverallPercentage] = useState<number>(0.0);
  const [hasMedicalLeave, setHasMedicalLeave] = useState<boolean>(false);

  // Initial lectures list with zero initial percentage until calculated
  const [lectureList, setLectureList] = useState<LectureAttendanceItem[]>([
    {
      id: 'overall',
      type: 'overall',
      subject: 'Overall Attendance Gauge',
      code: 'SUMMARY',
      faculty: 'ALL',
      percentage: 0.0,
      isSafe: false,
      status: 'No attendance records yet',
      marginLectures: 0,
      className: 'BTECH CSE 4A',
    },
  ]);

  // Load Session & LocalStorage Sync
  useEffect(() => {
    const loadData = () => {
      let currentClassStr = 'BTECH CSE 4A';
      try {
        const rawSession = sessionStorage.getItem('nexus_session');
        if (rawSession) {
          const s = JSON.parse(rawSession);
          if (s.className) {
            setUserClass(s.className);
            currentClassStr = s.className;
          }
        }
      } catch (e) {
        // Fallback
      }

      try {
        const savedStats = localStorage.getItem('nexus_user_attendance_stats');
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          if (parsed.percentage !== undefined) setOverallPercentage(parsed.percentage);
          if (parsed.hasMedical !== undefined) setHasMedicalLeave(parsed.hasMedical);
          if (parsed.userClass) {
            setUserClass(parsed.userClass);
            currentClassStr = parsed.userClass;
          }
        }

        const savedSubjects = localStorage.getItem('nexus_user_attendance_subjects');
        let parsedSubs = [];
        if (savedSubjects) {
          parsedSubs = JSON.parse(savedSubjects);
        }

        const reqTarget = hasMedicalLeave ? 65.0 : 75.0;

        // Build dynamic list with exact normalized subject info
        const dynamicList: LectureAttendanceItem[] = [
          {
            id: 'overall',
            type: 'overall',
            subject: 'Overall Attendance Wheel',
            code: 'SUMMARY',
            faculty: 'ALL',
            percentage: overallPercentage,
            isSafe: overallPercentage >= reqTarget,
            status: overallPercentage >= reqTarget ? `Safe (>${reqTarget}%)` : `Shortage (<${reqTarget}%)`,
            marginLectures: 3,
            className: currentClassStr,
          },
        ];

        if (Array.isArray(parsedSubs) && parsedSubs.length > 0) {
          parsedSubs.forEach((sub, idx) => {
            const isSubSafe = sub.percentage >= reqTarget;
            const normInfo = normalizeSubjectInfo(sub.subject, sub.code, sub.faculty);

            dynamicList.push({
              id: `sub-${idx}`,
              type: 'lecture',
              subject: normInfo.title,
              code: normInfo.code,
              faculty: normInfo.faculty,
              percentage: sub.percentage,
              isSafe: isSubSafe,
              status: isSubSafe
                ? sub.marginLectures > 0
                  ? `Can skip ${sub.marginLectures} class(es)`
                  : 'On edge (Do not skip)'
                : 'Shortage: Must attend!',
              marginLectures: sub.marginLectures || 0,
              className: currentClassStr,
            });
          });
          setLectureList(dynamicList);
        }
      } catch (e) {
        // Fallback
      }
    };

    loadData();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nexus_user_attendance_stats' || e.key === 'nexus_user_attendance_subjects') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [hasMedicalLeave, overallPercentage]);

  // 10-Second Auto Play Rotator
  useEffect(() => {
    if (!isAutoPlay || lectureList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % lectureList.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoPlay, lectureList.length]);

  const currentItem = lectureList[currentIndex % lectureList.length] || lectureList[0];
  const requiredThreshold = hasMedicalLeave ? 65.0 : 75.0;

  // Upright Semi-Circle SVG Arc Geometry (Radius = 75, Center = 100, 105)
  const arcLength = 235.619; // Math.PI * 75
  const strokeDashoffset = arcLength - (Math.min(overallPercentage, 100) / 100) * arcLength;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* Top Header Control (Identical Layout to Academics & Timetable Card) */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Attendance Tracker
            </h4>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Class: {userClass} ({currentIndex + 1}/{lectureList.length})
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

      {/* ROTATING LECTURE CARD BODY FOR SELECTED CLASS (Identical Layout to Academics Card) */}
      <div className="flex-1 my-3 relative overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentItem.type === 'overall' ? (
            /* SLIDE 0: UPRIGHT OVERALL ATTENDANCE WHEEL GAUGE */
            <motion.div
              key="overall_wheel_slide"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col items-center justify-center h-full space-y-1"
            >
              <div className="w-full flex items-center justify-between text-[11px] mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-200 dark:border-amber-800/60">
                  {userClass}
                </span>
                <span className="font-bold text-slate-500 dark:text-slate-400">
                  Overall Gauge
                </span>
              </div>

              <div className="relative w-full max-w-[180px] mx-auto flex items-center justify-center my-1">
                <svg className="w-full h-auto overflow-visible" viewBox="0 0 200 115">
                  <path
                    d="M 25 105 A 75 75 0 0 1 175 105"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeLinecap="round"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <motion.path
                    d="M 25 105 A 75 75 0 0 1 175 105"
                    fill="none"
                    stroke={overallPercentage >= requiredThreshold ? '#f59e0b' : '#ef4444'}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={arcLength}
                    initial={{ strokeDashoffset: arcLength }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <text
                    x="100"
                    y="92"
                    textAnchor="middle"
                    className="fill-slate-900 dark:fill-white font-display font-black text-2xl tracking-tight"
                  >
                    {overallPercentage.toFixed(2)}%
                  </text>
                </svg>
              </div>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                overallPercentage >= requiredThreshold
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-300 animate-pulse'
              }`}>
                {overallPercentage >= requiredThreshold ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-rose-500" />}
                {overallPercentage >= requiredThreshold ? `Criteria Met (>${requiredThreshold}%)` : `Shortage (<${requiredThreshold}%)`}
              </span>
            </motion.div>
          ) : (
            /* INDIVIDUAL LECTURE ATTENDANCE SLIDE */
            <motion.div
              key={currentItem.id + currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col justify-between h-full space-y-2"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-purple-300 font-extrabold border border-indigo-200 dark:border-indigo-800/60">
                  {currentItem.className || userClass}
                </span>
                <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                  {currentItem.code}
                </span>
              </div>

              <div>
                <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                  {currentItem.subject}
                </h5>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-amber-500 shrink-0" />
                  Faculty: <strong className="font-mono">{formatTeacherCode(currentItem.faculty)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1.5 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Award className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">{currentItem.percentage}% Attended</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  {currentItem.isSafe ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />}
                  <span className={`truncate font-bold ${currentItem.isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {currentItem.status}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 10-SECOND ANIMATED LOADING PROGRESS BAR */}
        {isAutoPlay && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500"
            />
          </div>
        )}
      </div>

      {/* NOTIFICATION ALERT BANNER (Matching Academics Card style) */}
      <AnimatePresence>
        {!currentItem.isSafe && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between shadow-md mb-2 border bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-300 animate-pulse"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                SHORTAGE ALERT: {currentItem.subject}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-mono shrink-0">
              {currentItem.percentage}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Footer (Identical Layout to Academics Card) */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onNavigateToAttendance}
          className="text-xs font-bold text-indigo-600 dark:text-purple-400 hover:underline flex items-center gap-1"
        >
          <span>Open Attendance Tracker</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + lectureList.length) % lectureList.length)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Slide"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % lectureList.length)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Slide"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
