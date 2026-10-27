import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Clock,
  Building2,
} from 'lucide-react';

interface CampusAnnouncementsSquareCardProps {
  onNavigateToAnnouncements: () => void;
}

const FEATURED_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Canteen Electrical Maintenance Work & Temporary Dining Closure',
    service: 'Central Canteen & Food Court',
    priority: 'Important Notice',
    effectiveDate: 'Aug 10 (01:00 PM - 04:00 PM)',
    postedBy: 'Campus Estate Officer',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'ann-2',
    title: 'ERP Administrative Office Closure for Annual Database Server Upgrade',
    service: 'ERP & Student Portal Services',
    priority: 'Urgent / Emergency',
    effectiveDate: 'Aug 11 (Tue) - Aug 13 (Thu)',
    postedBy: 'Registrar & IT Division',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'ann-3',
    title: 'Official Declaration of Campus Holiday on Account of Dusshera',
    service: 'All Academic & Administrative Operations',
    priority: 'Gazetted Holiday',
    effectiveDate: 'Oct 12, 2026',
    postedBy: 'Vice Chancellor Office',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'ann-4',
    title: 'Central Library Extended 24x7 Night Reading Lounge Access',
    service: 'Central Library & Study Kiosks',
    priority: 'General Update',
    effectiveDate: 'Aug 12 - Sep 02, 2026',
    postedBy: 'Chief Librarian',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
];

export const CampusAnnouncementsSquareCard: React.FC<CampusAnnouncementsSquareCardProps> = ({
  onNavigateToAnnouncements,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // 10-Second Auto-play Timer
  useEffect(() => {
    if (!isAutoPlay || FEATURED_ANNOUNCEMENTS.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_ANNOUNCEMENTS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, FEATURED_ANNOUNCEMENTS.length, currentIndex]);

  const currentSlide = FEATURED_ANNOUNCEMENTS[currentIndex] || FEATURED_ANNOUNCEMENTS[0];

  return (
    <div
      onClick={onNavigateToAnnouncements}
      className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all group cursor-pointer"
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR: Header + Auto-Play Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Campus Announcements
            </h4>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">
              Operational Bulletins
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
            {/* Top Priority Badge & Effective Date */}
            <div className="flex items-center justify-between text-[11px]">
              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${currentSlide.badgeColor}`}>
                {currentSlide.priority}
              </span>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                {currentSlide.effectiveDate}
              </span>
            </div>

            {/* Title & Service Impacted */}
            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentSlide.title}
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1 flex items-center gap-1 truncate">
                <Building2 className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Service Impacted: {currentSlide.service}</span>
              </span>
            </div>

            {/* Issuer Footer Row */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="truncate font-bold text-slate-700 dark:text-slate-300">
                Posted By: {currentSlide.postedBy}
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
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
            />
          </div>
        )}
      </div>

      {/* FOOTER ACTION & NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToAnnouncements();
          }}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <span>Open Operational Bulletins</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Navigation Arrows < > */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + FEATURED_ANNOUNCEMENTS.length) % FEATURED_ANNOUNCEMENTS.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Announcement"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % FEATURED_ANNOUNCEMENTS.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
