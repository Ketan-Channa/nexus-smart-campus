import React, { useState } from 'react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle: React.FC<{ variant?: 'pill' | 'circular' }> = ({ variant = 'circular' }) => {
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const cycleTheme = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-purple-400" />;
      case 'system':
        return <Laptop className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />;
    }
  };

  const getLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light (Pure White)';
      case 'dark':
        return 'Dark (Purple Glow)';
      case 'system':
        return `System Default (${resolvedTheme === 'dark' ? 'Purple' : 'White'})`;
    }
  };

  if (variant === 'pill') {
    const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
      { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
      { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
      { mode: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> },
    ];

    return (
      <div className="relative inline-flex items-center p-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-300/50 dark:border-slate-700/50 shadow-inner">
        {options.map((option) => {
          const isActive = themeMode === option.mode;
          return (
            <button
              key={option.mode}
              onClick={() => setThemeMode(option.mode)}
              title={`Switch to ${option.label} Theme`}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 z-10 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeThemeBg"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-full shadow-md -z-10 border border-indigo-100 dark:border-indigo-900/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {option.icon}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Circular Floating Button with Tooltip
  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute right-14 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-purple-950/90 text-white text-xs font-semibold shadow-xl border border-slate-700 dark:border-purple-500/40 pointer-events-none backdrop-blur-md"
          >
            Theme: {getLabel()}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={cycleTheme}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={`Theme: ${getLabel()} (Click to switch)`}
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#120e28] text-slate-800 dark:text-purple-200 border border-slate-200 dark:border-purple-500/40 shadow-xl backdrop-blur-xl hover:border-indigo-400 dark:hover:border-purple-400 transition-all duration-300 group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300" />
        <div className="relative z-10">{getIcon()}</div>
      </motion.button>
    </div>
  );
};
