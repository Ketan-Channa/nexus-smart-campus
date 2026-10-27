import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  MapPin,
  Clock,
  User,
} from 'lucide-react';

interface EventsAndFestsSquareCardProps {
  onNavigateToEvents: () => void;
}

const FEATURED_EVENTS = [
  {
    id: 'evt-1',
    title: 'NEXUS AI HackFest 2026 (36-Hour Hackathon)',
    category: 'Technical',
    date: 'Aug 22 - Aug 24, 2026',
    time: '09:00 AM',
    venue: 'Innovation Hub',
    organizer: 'Ketan Channa (Gymkhana President)',
    registered: '198 / 250 Seats',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'evt-2',
    title: 'SPANDAN 2026 - Annual Cultural Fest',
    category: 'Cultural Fest',
    date: 'Sep 05 - Sep 07, 2026',
    time: '04:00 PM',
    venue: 'Main Quad Theatre',
    organizer: 'Priyanjali Sen (Vice President)',
    registered: '1,120 / 1,500 Seats',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'evt-3',
    title: 'Faculty Development Program (FDP on AI)',
    category: 'Faculty FDP',
    date: 'Aug 18 - Aug 20, 2026',
    time: '10:00 AM',
    venue: 'Executive Seminar Hall',
    organizer: 'Dr. Nitin Kumar (Academic Lead)',
    registered: '64 / 80 Seats',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'evt-4',
    title: 'Inter-Departmental Floodlight Sports Championship',
    category: 'Sports',
    date: 'Aug 28 - Aug 30, 2026',
    time: '05:30 PM',
    venue: 'Floodlight Sports Ground',
    organizer: 'Vikramaditya Rao (Sports Captain)',
    registered: '245 / 300 Seats',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
];

export const EventsAndFestsSquareCard: React.FC<EventsAndFestsSquareCardProps> = ({ onNavigateToEvents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // 10-Second Auto-play Timer
  useEffect(() => {
    if (!isAutoPlay || FEATURED_EVENTS.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_EVENTS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, FEATURED_EVENTS.length, currentIndex]);

  const currentSlide = FEATURED_EVENTS[currentIndex] || FEATURED_EVENTS[0];

  return (
    <div
      onClick={onNavigateToEvents}
      className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 transition-all group cursor-pointer"
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR: Header + Auto-Play Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Events & Fests
            </h4>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block">
              Student & Faculty Studio
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
            {/* Top Category Badge & Capacity */}
            <div className="flex items-center justify-between text-[11px]">
              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${currentSlide.badgeColor}`}>
                {currentSlide.category}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-bold">
                {currentSlide.registered}
              </span>
            </div>

            {/* Title & Venue */}
            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentSlide.title}
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{currentSlide.venue} ({currentSlide.date})</span>
              </span>
            </div>

            {/* Publisher Footer Row */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 truncate font-bold text-slate-700 dark:text-slate-300">
                <User className="w-3 h-3 text-indigo-500" />
                {currentSlide.organizer}
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {currentSlide.time}
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
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
            />
          </div>
        )}
      </div>

      {/* FOOTER ACTION & NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToEvents();
          }}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>Open Events & Fest Studio</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Navigation Arrows < > */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + FEATURED_EVENTS.length) % FEATURED_EVENTS.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Event"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % FEATURED_EVENTS.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Event"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
