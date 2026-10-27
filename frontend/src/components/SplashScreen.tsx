import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './notifications/NotificationBell';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 400);
          }
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);


  return (
    <div 
      className={`relative min-h-screen w-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden transition-colors duration-500 selection:bg-indigo-500 selection:text-white ${
        isDark ? 'bg-[#090714] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Ambient background glows */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none animate-pulse-slow transition-colors duration-500 ${
          isDark ? 'bg-purple-600/20' : 'bg-indigo-500/10'
        }`} 
      />
      <div 
        className={`absolute top-1/3 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isDark ? 'bg-indigo-600/20' : 'bg-purple-500/10'
        }`} 
      />
      <div 
        className={`absolute bottom-1/3 right-1/3 w-[350px] h-[350px] rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isDark ? 'bg-purple-500/15' : 'bg-cyan-500/10'
        }`} 
      />

      {/* Grid Pattern Overlay */}
      <div 
        className={`absolute inset-0 bg-[size:4rem_4rem] pointer-events-none transition-colors duration-500 ${
          isDark 
            ? 'bg-[linear-gradient(to_right,#1e1b4b25_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b25_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)]'
        }`} 
      />

      {/* Top Spacer */}
      <div className="w-full h-8 z-10" />

      {/* Center Content Section: Typography & Slogan */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center w-full max-w-4xl px-4 text-center">
        {/* Main Title - NEXUS */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className={`font-display text-6xl sm:text-8xl md:text-9xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r transition-all duration-500 ${
            isDark 
              ? 'from-white via-indigo-200 to-purple-300 drop-shadow-[0_0_40px_rgba(168,85,247,0.45)]' 
              : 'from-indigo-700 via-purple-700 to-slate-900 drop-shadow-sm'
          }`}
        >
          NEXUS
        </motion.h1>

        {/* Subtitle - THE SMART CAMPUS APP */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className={`font-sans font-bold text-lg sm:text-2xl md:text-3xl tracking-[0.25em] uppercase mt-3 transition-colors duration-500 ${
            isDark ? 'text-purple-300' : 'text-indigo-600'
          }`}
        >
          THE SMART CAMPUS APP
        </motion.p>

        {/* Slogan Pill / Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className={`mt-6 inline-flex items-center px-5 py-2.5 rounded-full backdrop-blur-md transition-all duration-500 ${
            isDark 
              ? 'bg-purple-950/50 border border-purple-500/30 shadow-lg shadow-purple-500/10' 
              : 'bg-slate-100/90 border border-slate-200 shadow-sm'
          }`}
        >
          <span 
            className={`font-display font-semibold text-xs sm:text-sm tracking-[0.2em] transition-colors duration-500 ${
              isDark ? 'text-purple-200' : 'text-slate-800'
            }`}
          >
            LEARN • PROMOTE • CONNECT • EXCEL
          </span>
        </motion.div>

        {/* Loading Bar & Percentage Counter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-md mt-12 sm:mt-16 space-y-2.5"
        >
          <div 
            className={`flex justify-between items-center text-xs font-mono font-bold tracking-wider px-1 transition-colors duration-500 ${
              isDark ? 'text-purple-300' : 'text-indigo-700'
            }`}
          >
            <span>LOADING</span>
            <span>{progress}%</span>
          </div>

          <div 
            className={`relative w-full h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner transition-colors duration-500 ${
              isDark 
                ? 'bg-slate-900 border border-purple-900/40' 
                : 'bg-slate-100 border border-slate-200'
            }`}
          >
            <motion.div
              className={`h-full rounded-full relative ${
                isDark 
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400' 
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500'
              }`}
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            >
              {/* Glowing tip indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_#ffffff]" />
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Developer Credits Footer */}
      <footer 
        className={`w-full max-w-4xl z-20 py-4 text-center text-xs sm:text-sm font-medium border-t transition-colors duration-500 ${
          isDark 
            ? 'text-slate-400 border-purple-900/30' 
            : 'text-slate-600 border-slate-200'
        }`}
      >
        Designed and Developed by{' '}
        <span className={`font-semibold transition-colors duration-500 ${isDark ? 'text-purple-100' : 'text-slate-900'}`}>
          Ketan Channa
        </span>{' '}
        and{' '}
        <span className={`font-semibold transition-colors duration-500 ${isDark ? 'text-purple-100' : 'text-slate-900'}`}>
          Nitin Kumar
        </span>
      </footer>

      {/* Circular Controls at Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <NotificationBell variant="circular" />
        <ThemeToggle variant="circular" />
      </div>
    </div>
  );
};
