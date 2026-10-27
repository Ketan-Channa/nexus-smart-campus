import React, { useState } from 'react';
import { useNotifications, type CampusNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  X,
  Clock,
  CheckCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const NotificationBell: React.FC<{ variant?: 'circular' | 'pill' }> = () => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    openNotificationDetail,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredNotifications = notifications.filter((n) => {
    if (categoryFilter === 'All') return true;
    return n.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const getIcon = (type: CampusNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'urgent':
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getCategoryColor = (category: CampusNotification['category']) => {
    switch (category) {
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
    <div className="relative flex items-center">
      {/* NOTIFICATION BELL BUTTON MATCHING THEME TOGGLE STYLE */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        title="Campus Notifications"
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#120e28] text-slate-800 dark:text-purple-200 border border-slate-200 dark:border-purple-500/40 shadow-xl backdrop-blur-xl hover:border-indigo-400 dark:hover:border-purple-400 transition-all duration-300 group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full blur opacity-20 group-hover:opacity-75 transition duration-300" />
        <div className="relative z-10">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-purple-300" />
        </div>

        {/* UNREAD COUNTER BADGE */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 z-20 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* DROPDOWN PANEL MODAL */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click dismiss */}
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-14 z-50 w-80 sm:w-96 bg-white dark:bg-[#0f0b24] text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-purple-500/40 shadow-2xl overflow-hidden text-xs"
            >
              {/* TOP HEADER */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-purple-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      Campus Notifications
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {unreadCount} unread notification{unreadCount !== 1 && 's'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-purple-300 hover:bg-indigo-100 font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CATEGORY FILTER BAR */}
              <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <Filter className="w-3 h-3 text-slate-400 shrink-0" />
                {(['All', 'Hostel', 'Payment', 'Academic', 'Security'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* NOTIFICATION LIST */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-slate-400">
                    <Bell className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
                    <p className="text-xs font-semibold">No notifications in this category</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsOpen(false);
                        openNotificationDetail(notif);
                      }}
                      className={`p-4 transition-all cursor-pointer flex items-start gap-3 relative group ${
                        !notif.isRead
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-4 left-2 shadow-xs" />
                      )}

                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getCategoryColor(notif.category)}`}>
                            {notif.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {notif.timestamp}
                          </span>
                        </div>

                        <h4 className={`font-bold text-xs leading-snug line-clamp-1 ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 shrink-0 self-center transition-colors" />
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono">
                  NEXUS Real-Time Notification Engine Active
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
