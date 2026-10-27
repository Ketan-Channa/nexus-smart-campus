import React, { useState, useEffect } from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Sparkles,
  UserPlus,
  MessageSquare,
  Award,
  Briefcase,
  Share2,
} from 'lucide-react';

interface AlumniNotificationsCentreProps {
  session: any;
}

export const AlumniNotificationsCentre: React.FC<AlumniNotificationsCentreProps> = ({ session }) => {
  const userEmail = session?.email || '';

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [userEmail]);

  // Realtime notification event
  useEffect(() => {
    const handleNotif = () => fetchNotifications();
    window.addEventListener('notification.created', handleNotif);
    return () => window.removeEventListener('notification.created', handleNotif);
  }, []);

  const fetchNotifications = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/connections/notifications?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notifId: string) => {
    try {
      await fetch('https://nexus-smart-campus-backend.onrender.com/api/connections/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifId }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <BellRing className="w-5 h-5 text-indigo-500" />
          Notifications & Activity Alerts
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Realtime alerts regarding connection requests, direct messages, mentorship inquiries, and referral updates.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-xs text-slate-500">You have zero unread notifications. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isUnread = n.read_status === 0 || n.is_read === 0 || !n.read;
            return (
              <div
                key={n.id || n.notif_id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {n.title || 'System Notification'}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {n.text || n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>

                {isUnread && (
                  <button
                    onClick={() => handleMarkRead(n.notif_id || n.id)}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 border shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
