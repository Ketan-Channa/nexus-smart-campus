import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  FileText,
  FileCheck2,
  Sparkles,
  Briefcase,
  Calculator,
} from 'lucide-react';

interface StudentUtilitiesSquareCardProps {
  onNavigateToUtilities?: () => void;
}

const FEATURED_UTILITIES_SLIDES = [
  {
    id: 'util-1',
    title: 'Self Testing & Exam Generator',
    subtitle: 'Upload PDF / Notes & Take Practice Exams',
    category: 'Self Testing',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    icon: FileCheck2,
    detail: 'Objective (50/100 Qs) & Subjective (~150 words) with live timer & anti-cheating.',
  },
  {
    id: 'util-2',
    title: 'AI Student Assistant & Email Draft',
    subtitle: 'Draft Formal Emails, Summaries & Requests',
    category: 'AI Assistant',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    icon: Sparkles,
    detail: 'AI writing improver with explicit confirm email send modal.',
  },
  {
    id: 'util-3',
    title: 'Quick Notes & AI Organizer',
    subtitle: 'Create, Tag, Pin & Auto-Structure Notes',
    category: 'Quick Notes',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    icon: FileText,
    detail: 'Categorize notes with AI automatic text formatting.',
  },
  {
    id: 'util-4',
    title: 'AI Resume Builder & Career Remarks',
    subtitle: 'Live ATS Analyzer & PDF Generator',
    category: 'Career Studio',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    icon: Briefcase,
    detail: 'Build recruiter ATS ready resume with document sync.',
  },
  {
    id: 'util-5',
    title: 'Productivity & Academic Calculators',
    subtitle: 'SGPA/CGPA, Attendance & Percentage',
    category: 'Productivity',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    icon: Calculator,
    detail: 'Tools for student performance calculation & task tracking.',
  },
  {
    id: 'util-6',
    title: 'Scientific & Engineering Calculator',
    subtitle: 'Trigonometry, Logarithms, Exponents & Constants',
    category: 'Scientific Calc',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    icon: Calculator,
    detail: 'Full scientific calculator with DEG/RAD mode & calculation history.',
  },
];

export const StudentUtilitiesSquareCard: React.FC<StudentUtilitiesSquareCardProps> = ({
  onNavigateToUtilities,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_UTILITIES_SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, currentIndex]);

  const currentSlide = FEATURED_UTILITIES_SLIDES[currentIndex];
  const SlideIcon = currentSlide.icon;

  return (
    <div
      onClick={onNavigateToUtilities}
      className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all group cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Student Utilities
            </h4>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">
              AI Toolbox & Self Testing
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAutoPlay(!isAutoPlay);
          }}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* SLIDE CONTENT */}
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
            <div className="flex items-center justify-between text-[11px]">
              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${currentSlide.badgeColor}`}>
                {currentSlide.category}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <SlideIcon className="w-3 h-3 text-amber-500" />
                Live Tool
              </span>
            </div>

            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentSlide.title}
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">
                {currentSlide.subtitle}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                {currentSlide.detail}
              </span>
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
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
            />
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToUtilities) onNavigateToUtilities();
          }}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <span>Open Student Utilities</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + FEATURED_UTILITIES_SLIDES.length) % FEATURED_UTILITIES_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % FEATURED_UTILITIES_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
