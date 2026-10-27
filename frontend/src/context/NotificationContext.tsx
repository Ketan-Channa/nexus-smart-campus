import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRealtimeEvent } from './RealtimeContext';

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent' | 'security';
  category: 'Academic' | 'Hostel' | 'Payment' | 'Canteen' | 'Security / SOS' | 'System';
  timestamp: string; // e.g. "Just now", "2 mins ago", "10:45 AM"
  createdAt: number; // timestamp in ms for sorting
  isRead: boolean;
  linkTab?: string;
  metadata?: Record<string, string>;
}

interface NotificationContextType {
  notifications: CampusNotification[];
  unreadCount: number;
  activeToast: CampusNotification | null;
  selectedNotification: CampusNotification | null;
  addNotification: (notification: Omit<CampusNotification, 'id' | 'createdAt' | 'isRead' | 'timestamp'> & { timestamp?: string }) => void;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  openNotificationDetail: (notif: CampusNotification) => void;
  closeNotificationDetail: () => void;
}

const INITIAL_SEED_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-1',
    title: '🏠 Hostel Allotment Fee Approved & Verified',
    message: 'Your hostel room allotment request for Block B (Boys) Room B-304 has been verified and approved by Campus Admin.',
    type: 'success',
    category: 'Hostel',
    timestamp: 'Just now',
    createdAt: Date.now() - 1000 * 60 * 2, // 2 mins ago
    isRead: false,
    linkTab: 'Hostel & Transport',
    metadata: {
      'Hostel Block': 'Hostel Block B (Boys)',
      'Allocated Room': 'B-304',
      'Mess Option': 'With Mess (Full 4-Meal Plan)',
      'Status': 'Verified & Approved ✓',
    },
  },
  {
    id: 'notif-2',
    title: '💳 Razorpay Fee Settlement Acknowledgement',
    message: 'Quarterly Bus Pass Fee of ₹4,200 settled successfully. Official PDF tax invoice generated.',
    type: 'info',
    category: 'Payment',
    timestamp: '15 mins ago',
    createdAt: Date.now() - 1000 * 60 * 15,
    isRead: false,
    linkTab: 'Payment & Transactions',
    metadata: {
      'Gateway': 'Razorpay Online UPI',
      'Transaction ID': 'TXN-99882211',
      'Amount': 'Rs. 4,200.00',
    },
  },
  {
    id: 'notif-3',
    title: '🍛 Canteen Daily Special Menu Update',
    message: 'Special Sunday Feast menu updated in Central Dining Hall: Paneer Tikka Masala, Veg Dum Biryani & Ice Cream.',
    type: 'info',
    category: 'Canteen',
    timestamp: '1 hour ago',
    createdAt: Date.now() - 1000 * 60 * 60,
    isRead: true,
    linkTab: 'Canteen & Offers',
  },
  {
    id: 'notif-4',
    title: '🛡️ Safety Center Alert & Rapid SOS Status',
    message: 'NEXUS Campus Guard Patrol active near Block B Quad. Security desk monitoring enabled 24/7.',
    type: 'security',
    category: 'Security / SOS',
    timestamp: 'Today at 09:30 AM',
    createdAt: Date.now() - 1000 * 60 * 180,
    isRead: true,
    linkTab: 'Student Safety & Voice',
  },
  {
    id: 'notif-5',
    title: '📚 Academic Timetable & Attendance Schedule',
    message: 'Semester 7 Mid-Term Exam Date-Sheet & Room Seating Matrix published on Academic Portal.',
    type: 'warning',
    category: 'Academic',
    timestamp: 'Yesterday at 04:15 PM',
    createdAt: Date.now() - 1000 * 60 * 1440,
    isRead: true,
    linkTab: 'Academics & Timetable',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<CampusNotification[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_campus_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse notifications from localStorage:', e);
    }
    return INITIAL_SEED_NOTIFICATIONS;
  });

  const [activeToast, setActiveToast] = useState<CampusNotification | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<CampusNotification | null>(null);
  const [toastTimerId, setToastTimerId] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexus_campus_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = (
    newNotifData: Omit<CampusNotification, 'id' | 'createdAt' | 'isRead' | 'timestamp'> & { timestamp?: string }
  ) => {
    const now = Date.now();
    const newNotif: CampusNotification = {
      ...newNotifData,
      id: `notif-${now}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      timestamp: newNotifData.timestamp || 'Just now',
      isRead: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show 10-Second Screen Toast
    setActiveToast(newNotif);

    if (toastTimerId) {
      clearTimeout(toastTimerId);
    }

    // Auto-dismiss screen toast after exactly 10 SECONDS (10000ms)
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 10000);

    setToastTimerId(timer);
  };

  // Realtime Socket Event Subscriptions for Global Toast Notifications
  useRealtimeEvent('assignment.published', (data: any) => {
    addNotification({
      title: `📚 New Assignment Published: ${data.title}`,
      message: `${data.facultyName || 'Faculty'} published a new assignment for ${data.className} (${data.subject || ''}).`,
      type: 'warning',
      category: 'Academic',
      linkTab: 'Academics & Timetable',
    });
  });

  useRealtimeEvent('assignment.graded', (data: any) => {
    addNotification({
      title: `🎯 Assignment Graded: ${data.scoredMarks}/${data.maxMarks} Marks`,
      message: `Your submission for assignment has been evaluated by faculty. Remarks: "${data.facultyRemarks || 'Evaluated'}"`,
      type: 'success',
      category: 'Academic',
      linkTab: 'Academics & Timetable',
    });
  });

  useRealtimeEvent('announcement.created', (data: any) => {
    addNotification({
      title: `📢 Class Broadcast: ${data.title}`,
      message: `${data.facultyName || 'Class Incharge'} posted: ${data.message}`,
      type: 'urgent',
      category: 'Academic',
      linkTab: 'Academics & Timetable',
    });
  });

  useRealtimeEvent('reminder.created', (data: any) => {
    addNotification({
      title: `🔔 Quick Reminder: ${data.title}`,
      message: `${data.facultyName || 'Faculty'}: ${data.message}`,
      type: 'warning',
      category: 'Academic',
      linkTab: 'Academics & Timetable',
    });
  });

  useRealtimeEvent('attendance.marked', (data: any) => {
    addNotification({
      title: `⏱️ Attendance Register Marked (${data.className})`,
      message: `Attendance register for ${data.subject} [${data.timeSlot}] on ${data.date} has been updated.`,
      type: 'info',
      category: 'Academic',
      linkTab: 'Academics & Timetable',
    });
  });

  useRealtimeEvent('medical_leave.approved', (data: any) => {
    addNotification({
      title: `🏥 Medical Leave ${data.status}: Ref ${data.applicationRef}`,
      message: data.status === 'VERIFIED'
        ? 'Your Medical Certificate has been VERIFIED. Attendance criteria lowered to 65%.'
        : 'Your Medical Certificate application has been REJECTED by Class Incharge.',
      type: data.status === 'VERIFIED' ? 'success' : 'urgent',
      category: 'Academic',
      linkTab: 'Academics & Timetable',
    });
  });

  const dismissToast = () => {
    if (toastTimerId) {
      clearTimeout(toastTimerId);
      setToastTimerId(null);
    }
    setActiveToast(null);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const openNotificationDetail = (notif: CampusNotification) => {
    markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  const closeNotificationDetail = () => {
    setSelectedNotification(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        selectedNotification,
        addNotification,
        dismissToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        openNotificationDetail,
        closeNotificationDetail,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
