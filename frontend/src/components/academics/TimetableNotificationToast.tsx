import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MapPin, User, Sparkles, X, Coffee } from 'lucide-react';

import { type TimetableEntry, formatTeacherCode } from './TimetableConverter';

interface TimetableNotificationToastProps {
  timetable: TimetableEntry[];
  selectedClass: string;
}

export interface ToastAlert {
  id: string;
  type: 'reminder_10m' | 'reminder_5m' | 'lecture_start' | 'lecture_end' | 'tea_break' | 'lunch_break' | 'timetable_update';
  title: string;
  message: string;
  subject?: string;
  teacher?: string;
  room?: string;
  minsLeft?: number;
  timestamp: string;
}

export const TimetableNotificationToast: React.FC<TimetableNotificationToastProps> = ({
  timetable,
  selectedClass,
}) => {
  const [activeToasts, setActiveToasts] = useState<ToastAlert[]>([]);

  const addToast = (toast: Omit<ToastAlert, 'id' | 'timestamp'>) => {
    const newToast: ToastAlert = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveToasts((prev) => [newToast, ...prev].slice(0, 4)); // Max 4 concurrent toasts

    // Auto-dismiss toast after 6 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Continuous Time Monitor for Class & Break Notifications
  useEffect(() => {
    const checkScheduleAlerts = () => {
      const now = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[now.getDay()];
      const curMins = now.getHours() * 60 + now.getMinutes();

      // Check Tea Break (11:05 - 11:25 AM)
      const teaStartMins = 11 * 60 + 5;
      const teaEndMins = 11 * 60 + 25;

      if (curMins === teaStartMins) {
        addToast({
          type: 'tea_break',
          title: '☕ Universal Tea Break Started!',
          message: 'Tea Break is active for all classes (11:05 AM – 11:25 AM). Enjoy your break!',
        });
      } else if (curMins === teaEndMins) {
        addToast({
          type: 'tea_break',
          title: '🔔 Tea Break Ended',
          message: 'Tea Break has concluded. Please return to your upcoming lecture room.',
        });
      }

      // Check Class Lectures
      const classLectures = timetable.filter((t) => t.className === selectedClass && t.day === today);

      classLectures.forEach((lec) => {
        const [timePart, ampm] = lec.startTime.split(' ');
        let [h, m] = timePart.split(':').map(Number);
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        const lecStartMins = h * 60 + m;

        // 10 Min Reminder
        if (curMins === lecStartMins - 10) {
          addToast({
            type: 'reminder_10m',
            title: `⏳ Lecture Alert: In 10 Mins`,
            message: `"${lec.subject}" starts in 10 minutes.`,
            subject: lec.subject,
            teacher: formatTeacherCode(lec.teacher),
            room: lec.room,
            minsLeft: 10,
          });
        }

        // 5 Min Reminder
        if (curMins === lecStartMins - 5) {
          addToast({
            type: 'reminder_5m',
            title: `🚨 Lecture Alert: In 5 Mins`,
            message: `"${lec.subject}" starts in 5 minutes! Proceed to room ${lec.room}.`,
            subject: lec.subject,
            teacher: formatTeacherCode(lec.teacher),
            room: lec.room,
            minsLeft: 5,
          });
        }

        // Class Starting Now (0 Min)
        if (curMins === lecStartMins) {
          addToast({
            type: 'lecture_start',
            title: `🚀 LECTURE STARTING NOW!`,
            message: `"${lec.subject}" is starting now in room ${lec.room}.`,
            subject: lec.subject,
            teacher: formatTeacherCode(lec.teacher),
            room: lec.room,
            minsLeft: 0,
          });
        }
      });
    };

    const interval = setInterval(checkScheduleAlerts, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [timetable, selectedClass]);

  // 2. Listen for Real-Time Timetable Updates / Replacement Window Events
  useEffect(() => {
    const handleTimetableUpdate = () => {
      addToast({
        type: 'timetable_update',
        title: '✨ Timetable Updated Real-Time',
        message: `Department timetable has been updated or replaced for ${selectedClass}!`,
      });
    };

    window.addEventListener('nexus_timetable_updated', handleTimetableUpdate);
    return () => window.removeEventListener('nexus_timetable_updated', handleTimetableUpdate);
  }, [selectedClass]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 relative overflow-hidden ${
              toast.type === 'lecture_start'
                ? 'bg-gradient-to-r from-rose-500/90 to-rose-600/90 border-rose-400 text-white shadow-rose-500/25'
                : toast.type === 'tea_break' || toast.type === 'lunch_break'
                ? 'bg-gradient-to-r from-amber-500/90 to-orange-600/90 border-amber-400 text-white shadow-amber-500/25'
                : toast.type === 'timetable_update'
                ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 border-emerald-400 text-white shadow-emerald-500/25'
                : 'bg-slate-900/95 border-indigo-500/40 text-white shadow-indigo-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                {toast.type === 'tea_break' ? (
                  <Coffee className="w-5 h-5" />
                ) : toast.type === 'timetable_update' ? (
                  <Sparkles className="w-5 h-5 text-amber-300" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1 text-xs pr-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-display font-black tracking-tight leading-snug">
                    {toast.title}
                  </h5>
                  <span className="text-[9px] font-mono opacity-80">{toast.timestamp}</span>
                </div>

                <p className="opacity-90 leading-relaxed font-medium">
                  {toast.message}
                </p>

                {toast.room && (
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-bold opacity-90 border-t border-white/20">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {toast.room}
                    </span>
                    {toast.teacher && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {toast.teacher}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
