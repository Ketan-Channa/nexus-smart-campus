import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Globe,
  MessageSquare,
  Sparkles,
  UserPlus,
} from 'lucide-react';

interface ConnectionsSquareCardProps {
  onNavigateToConnections?: () => void;
}

const FEATURED_CONNECTIONS_SLIDES = [
  {
    id: 'conn-1',
    title: 'Inter-College Student Network',
    subtitle: 'Connect across PCTE, DCD & Partner Colleges',
    category: 'Global Network',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    icon: Globe,
    detail: 'Discover students by skills, department, and course across institutions.',
  },
  {
    id: 'conn-2',
    title: 'Real-Time Student Messaging & Chat',
    subtitle: 'One-to-One Text, Voice Notes & Attachments',
    category: 'Messages',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    icon: MessageSquare,
    detail: 'Instant student messaging & active collaboration invites.',
  },
  {
    id: 'conn-3',
    title: 'Hackathon & Project Collaborations',
    subtitle: 'AI Skill Match & Partner Invitations',
    category: 'Collaborations',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    icon: Sparkles,
    detail: 'Form inter-college teams for hackathons, research & startups.',
  },
  {
    id: 'conn-4',
    title: 'Campus Social Feed & Video Reels',
    subtitle: 'Share Posts, Photos, Reels & Achievements',
    category: 'Feed & Media',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    icon: UserPlus,
    detail: 'Like, comment, save, and showcase your portfolio projects.',
  },
];

export const ConnectionsSquareCard: React.FC<ConnectionsSquareCardProps> = ({
  onNavigateToConnections,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_CONNECTIONS_SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay, currentIndex]);

  const currentSlide = FEATURED_CONNECTIONS_SLIDES[currentIndex];
  const SlideIcon = currentSlide.icon;

  return (
    <div
      onClick={onNavigateToConnections}
      className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 transition-all group cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* TOP BAR */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
              Connections
            </h4>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block">
              Campus Social Network
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
                <SlideIcon className="w-3 h-3 text-indigo-500" />
                Live Network
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
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
            />
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToConnections) onNavigateToConnections();
          }}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>Open Connections</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + FEATURED_CONNECTIONS_SLIDES.length) % FEATURED_CONNECTIONS_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % FEATURED_CONNECTIONS_SLIDES.length);
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
