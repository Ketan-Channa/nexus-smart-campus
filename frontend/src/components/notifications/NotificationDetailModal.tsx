import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  X,
  Clock,
  Trash2,
} from 'lucide-react';

export const NotificationDetailModal: React.FC = () => {
  const { selectedNotification, closeNotificationDetail, deleteNotification } = useNotifications();

  if (!selectedNotification) return null;

  const getIcon = () => {
    switch (selectedNotification.type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case 'urgent':
      case 'security':
        return <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getCategoryColor = () => {
    switch (selectedNotification.category) {
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#0f0b24] text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-purple-500/30 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 text-xs text-left relative overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md">
                {getIcon()}
              </div>
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryColor()}`}>
                  {selectedNotification.category}
                </span>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white mt-1 leading-snug">
                  {selectedNotification.title}
                </h3>
              </div>
            </div>

            <button
              onClick={closeNotificationDetail}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timestamp & Created Time */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Timestamp: <strong>{selectedNotification.timestamp}</strong></span>
            <span className="opacity-40">•</span>
            <span>Date: {new Date(selectedNotification.createdAt).toLocaleString()}</span>
          </div>

          {/* Full Message Body */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Notification Message:
            </h4>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              {selectedNotification.message}
            </p>
          </div>

          {/* Optional Metadata Grid */}
          {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Attached Details Breakdown:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                {Object.entries(selectedNotification.metadata).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">{key}:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-purple-300 text-xs block">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                deleteNotification(selectedNotification.id);
                closeNotificationDetail();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={closeNotificationDetail}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg transition-all flex items-center gap-2"
            >
              <span>Close Window</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
