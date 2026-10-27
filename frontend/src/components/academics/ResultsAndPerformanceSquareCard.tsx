import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ResultsAndPerformanceSquareCardProps {
  onNavigateToResults?: () => void;
}

export interface LatestResultUpdate {
  subjectCode: string;
  subjectName: string;
  instructorName: string;
  facultyId: string;
  internalScore: number;
  maxInternal: number;
  externalScore: number;
  maxExternal: number;
  totalScore: number;
  grade: string;
  updatedAt: string;
}

export const ResultsAndPerformanceSquareCard: React.FC<ResultsAndPerformanceSquareCardProps> = ({
  onNavigateToResults,
}) => {
  const [subjectResults, setSubjectResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Load subject results from localStorage
  const loadSubjectResults = () => {
    try {
      const raw = localStorage.getItem('nexus_student_subject_results');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSubjectResults(parsed);
          return;
        }
      }
    } catch (e) {}
    setSubjectResults([]);
  };

  useEffect(() => {
    loadSubjectResults();
    const handleUpdate = () => loadSubjectResults();
    window.addEventListener('nexus_results_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nexus_results_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Compute SGPA from recorded subjects
  const totalCredits = subjectResults.reduce((sum, s) => sum + Number(s.credits || 0), 0);
  const weightedPoints = subjectResults.reduce((sum, s) => sum + Number(s.gradePoints || 0) * Number(s.credits || 0), 0);
  const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

  // Build slides list
  const slidesList =
    subjectResults.length > 0
      ? subjectResults.map((s, i) => ({
          id: `res-${i}-${s.code}`,
          code: s.code,
          title: s.name,
          subtitle: `Internal: ${s.internals?.totalInternal || 0}/40 • End Sem: ${s.externalEndSem || 0}/60`,
          totalScore: `${s.totalScore} / 100`,
          grade: s.grade,
          instructor: s.instructor,
          badge: 'REAL-TIME RESULT',
        }))
      : [
          {
            id: 'res-empty',
            code: 'NO DATA',
            title: 'No Subject Results Recorded Yet',
            subtitle: 'Module is empty • All charts set to 0.00',
            totalScore: '0.00 SGPA',
            grade: 'Zero State',
            instructor: 'Add Subjects to Update',
            badge: 'EMPTY MODULE',
          },
        ];

  // 10-Second Auto-play Timer
  useEffect(() => {
    if (!isAutoPlay || slidesList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesList.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, slidesList.length, currentIndex]);

  const currentSlide = slidesList[currentIndex] || slidesList[0];

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR: Header + SGPA Badge + Auto-Play Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Exams & Analytics
            </h4>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold block">
              SGPA: <strong className="font-mono text-slate-900 dark:text-white">{sgpa}</strong> • {subjectResults.length} Subjects
            </span>
          </div>
        </div>

        {/* Auto-Play Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAutoPlay(!isAutoPlay);
          }}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          title={isAutoPlay ? 'Pause Auto-Play' : 'Play Auto-Play'}
        >
          {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ROTATING CONTENT SLIDE BODY */}
      <div className="flex-1 my-3 relative overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id + currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col justify-between h-full space-y-2"
          >
            {/* Top Code & Badge Row */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold border border-purple-200 dark:border-purple-800/60">
                {currentSlide.code}
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase">
                {currentSlide.badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentSlide.title}
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-1">
                <User className="w-3 h-3 text-purple-500 shrink-0" />
                Faculty: <strong className="font-mono text-purple-600 dark:text-purple-400">{currentSlide.instructor}</strong>
              </span>
            </div>

            {/* Score & Grade Footer Row */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                {subjectResults.length > 0 ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                )}
                <span>{currentSlide.grade}</span>
              </div>

              <span className="px-2.5 py-0.5 rounded-xl bg-purple-600 text-white font-mono font-black text-[10px] shadow-sm">
                {currentSlide.totalScore}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 10-SECOND ANIMATED LOADING PROGRESS BAR */}
        {isAutoPlay && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-rose-500"
            />
          </div>
        )}
      </div>

      {/* FOOTER ACTION & NAVIGATION ARROWS */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToResults) onNavigateToResults();
          }}
          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
        >
          <span>Open Exams & Analytics</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Navigation Arrows < > */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + slidesList.length) % slidesList.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Result"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % slidesList.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Result"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
