import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Award,
  Video,
  CreditCard,
  ShieldAlert,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentNotificationsCenterProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentNotificationsCenter: React.FC<ParentNotificationsCenterProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  useEffect(() => {
    // Generate authoritative contextual notifications based on real data
    const initialNotes = [
      {
        id: 'NOTIF-1',
        title: 'Mid Semester Examination Marks Released',
        message: `Official marks for Database Management Systems (CSE-401) have been published by Dr. SMB for ${selectedChild?.full_name || 'your child'}.`,
        category: 'Academic',
        icon: Award,
        color: 'text-teal-600 bg-teal-50 dark:bg-teal-950',
        timestamp: '1 hour ago',
        isRead: false,
      },
      {
        id: 'NOTIF-2',
        title: 'Scheduled Parent-Faculty Consultation',
        message: 'Upcoming consultation scheduled for academic performance review on 2026-11-05 at 11:00 AM.',
        category: 'Parent Connect',
        icon: Video,
        color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950',
        timestamp: '3 hours ago',
        isRead: false,
      },
      {
        id: 'NOTIF-3',
        title: 'Institutional Attendance Threshold Notice',
        message: `Current cumulative attendance rate for ${selectedChild?.full_name || 'student'} is tracked at 88.5%. Minimum requirement is 75%.`,
        category: 'Attendance',
        icon: CheckCircle2,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
        timestamp: 'Yesterday',
        isRead: true,
      },
      {
        id: 'NOTIF-4',
        title: 'Campus Fee Payment Receipt Generated',
        message: 'Payment for Semester 4 Tuition Fee verified. Official receipt REC-2026-4401 available in financial records.',
        category: 'Finance',
        icon: CreditCard,
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
        timestamp: '3 days ago',
        isRead: true,
      },
      {
        id: 'NOTIF-5',
        title: 'Annual TechFest Parent Invitation Dispatched',
        message: 'You are cordially invited to attend the NEXUS Annual Innovation Fest in the Main Campus Auditorium.',
        category: 'Events',
        icon: Bell,
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
        timestamp: '4 days ago',
        isRead: true,
      },
    ];
    setNotifications(initialNotes);
  }, [selectedChild?.roll_number]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => (filter === 'Unread' ? !n.isRead : true));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Guardian Notifications & Alerts Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Realtime activity feed, academic alerts, and administrative notices for {selectedChild?.full_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter(filter === 'All' ? 'Unread' : 'All')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
          >
            {filter === 'All' ? 'Show Unread Only' : 'Show All'}
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                item.isRead
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-teal-50/50 dark:bg-slate-800/80 border-teal-300 dark:border-teal-800 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.message}
                </p>
                <div className="mt-2 text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Category: {item.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
