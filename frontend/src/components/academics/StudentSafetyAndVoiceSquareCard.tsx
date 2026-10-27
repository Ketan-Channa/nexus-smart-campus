import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  AlertTriangle,
  FileText,
  MessageSquareWarning,
  PhoneCall,
} from 'lucide-react';

interface StudentSafetyAndVoiceSquareCardProps {
  onNavigateToSafety?: () => void;
}

const FEATURED_SAFETY_SLIDES = [
  {
    id: 'safe-1',
    title: 'Instant Campus Emergency SOS Alert',
    subtitle: '24x7 Security Patrol & GPS Response Dispatch',
    category: 'Emergency SOS',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    icon: AlertTriangle,
    detail: 'Tap header SOS button for immediate security dispatch to your campus location.',
  },
  {
    id: 'safe-2',
    title: 'Zero-Tolerance Anti-Ragging Hotline',
    subtitle: '100% Confidential & Anonymous Reporting',
    category: 'Anti-Ragging',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    icon: PhoneCall,
    detail: 'National Toll-Free 1800-180-5522 | Campus Squad: +91 98765 00100',
  },
  {
    id: 'safe-3',
    title: 'Report a Safety Concern or Grievance',
    subtitle: 'Dispatched directly to Authorized Committee',
    category: 'Report Concern',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    icon: FileText,
    detail: 'Upload evidence files & track investigation status timeline in real-time.',
  },
  {
    id: 'safe-4',
    title: 'Campus Feedback & Suggestions Box',
    subtitle: 'Improve Campus Amenities & Academic Services',
    category: 'Feedback & Ideas',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    icon: MessageSquareWarning,
    detail: 'Submit constructive suggestions with 5-star ratings to campus Dean.',
  },
];

export const StudentSafetyAndVoiceSquareCard: React.FC<StudentSafetyAndVoiceSquareCardProps> = ({
  onNavigateToSafety,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // 10-Second Auto-play Timer
  useEffect(() => {
    if (!isAutoPlay || FEATURED_SAFETY_SLIDES.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_SAFETY_SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, FEATURED_SAFETY_SLIDES.length, currentIndex]);

  const currentSlide = FEATURED_SAFETY_SLIDES[currentIndex] || FEATURED_SAFETY_SLIDES[0];
  const SlideIcon = currentSlide.icon;

  return (
    <div
      onClick={onNavigateToSafety}
      className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-rose-500/50 transition-all group cursor-pointer"
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500 to-red-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR: Header + Auto-Play Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Student Safety & Voice
            </h4>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block">
              Grievance & SOS Protection
            </span>
          </div>
        </div>

        {/* Auto-Play Toggle */}
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
            {/* Top Category Badge */}
            <div className="flex items-center justify-between text-[11px]">
              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${currentSlide.badgeColor}`}>
                {currentSlide.category}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <SlideIcon className="w-3 h-3 text-rose-500" />
                Active Protection
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentSlide.title}
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">
                {currentSlide.subtitle}
              </span>
            </div>

            {/* Detail Footer Row */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                {currentSlide.detail}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 10-SECOND ANIMATED SMOOTH LINEAR PROGRESS BAR */}
        {isAutoPlay && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600"
            />
          </div>
        )}
      </div>

      {/* FOOTER ACTION & NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToSafety) onNavigateToSafety();
          }}
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
        >
          <span>Open Student Safety & Voice</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Navigation Arrows < > */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + FEATURED_SAFETY_SLIDES.length) % FEATURED_SAFETY_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Slide"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % FEATURED_SAFETY_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
