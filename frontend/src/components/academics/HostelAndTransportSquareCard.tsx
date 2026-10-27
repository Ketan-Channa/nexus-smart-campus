import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
} from 'lucide-react';

interface HostelAndTransportSquareCardProps {
  onNavigateToHostel?: () => void;
}

const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    title: 'Hostel Block B (Boys) - Room B-304',
    subtitle: 'Triple Sharing • With Mess (₹45,000 Paid ✓)',
    status: 'Active Allotment',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    category: 'Hostel Residence',
  },
  {
    id: 'slide-2',
    title: 'Room C-201 Deluxe Upgrade Request',
    subtitle: 'Target Room Status: Available ✓ • Proof Media Attached',
    status: 'Incharge Verified',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    category: 'Room Change',
  },
  {
    id: 'slide-3',
    title: 'Central Dining Hall 4-Meal Menu',
    subtitle: 'Breakfast, Lunch, Evening Tea & Special Dinner',
    status: 'Weekly Rotation',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    category: 'Weekly Food Menu',
  },
  {
    id: 'slide-4',
    title: 'Hostel Premier League T20 & Movie Night',
    subtitle: 'Inter-Block Matches & Open-Air Amphitheatre Jam',
    status: 'Weekly Events',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    category: 'Student Activities',
  },
  {
    id: 'slide-5',
    title: 'Bus Route #14 & Parking Pass DL-03-CC-9912',
    subtitle: 'Sector 62 Metro Shuttle • Driver: Mr. Surender',
    status: 'Transit Active',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    category: 'Transport & Parking',
  },
];

export const HostelAndTransportSquareCard: React.FC<HostelAndTransportSquareCardProps> = ({
  onNavigateToHostel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // 10-Second Auto-play Timer
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, currentIndex]);

  const currentSlide = DEFAULT_SLIDES[currentIndex];

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500 to-indigo-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR: Header + Auto-Play Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Hostel & Transport
            </h4>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-bold block">
              Residence, Food & Passes
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
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-extrabold border border-sky-200 dark:border-sky-800/60">
                {currentSlide.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${currentSlide.badgeColor}`}>
                {currentSlide.status}
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
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500"
            />
          </div>
        )}
      </div>

      {/* FOOTER ACTION & NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToHostel) onNavigateToHostel();
          }}
          className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          <span>Open Hostel & Transport</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Navigation Arrows < > */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Slide"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % DEFAULT_SLIDES.length);
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
