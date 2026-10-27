import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  X,
  ExternalLink,
  Clock,
} from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast, openNotificationDetail } = useNotifications();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeToast) {
      setProgress(100);
      return;
    }

    // 10-Second countdown timer progress bar (smooth 100ms interval ticks)
    const startTime = Date.now();
    const duration = 10000; // 10 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeToast]);

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'urgent':
      case 'security':
        return <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getCategoryColor = () => {
    switch (activeToast.category) {
      case 'Hostel':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Payment':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Canteen':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Security / SOS':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Academic':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 pointer-events-none max-w-md w-full px-4 sm:px-0">
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto bg-slate-900/95 dark:bg-[#0f0b24]/95 backdrop-blur-xl border border-indigo-500/30 dark:border-purple-500/40 text-white rounded-3xl shadow-2xl overflow-hidden relative"
          >
            {/* 10-SECOND COUNTDOWN PROGRESS BAR */}
            <div className="h-1 w-full bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                    {getIcon()}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryColor()}`}>
                    {activeToast.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    10s Screen Alert
                  </span>
                  <button
                    onClick={dismissToast}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TOAST CONTENT */}
              <div
                onClick={() => {
                  dismissToast();
                  openNotificationDetail(activeToast);
                }}
                className="cursor-pointer space-y-1 hover:opacity-90 transition-opacity"
              >
                <h4 className="font-display font-black text-sm text-white flex items-center justify-between gap-2">
                  <span>{activeToast.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                  {activeToast.message}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">{activeToast.timestamp}</span>
                <button
                  onClick={() => {
                    dismissToast();
                    openNotificationDetail(activeToast);
                  }}
                  className="font-bold text-indigo-300 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <span>Click to view full detail</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
