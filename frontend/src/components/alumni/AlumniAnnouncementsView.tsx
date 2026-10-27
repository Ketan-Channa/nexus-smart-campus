import React, { useState, useEffect } from 'react';
import {
  Bell,
  Megaphone,
  Calendar,
  Clock,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AlumniAnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/faculty/announcements');
      const data = await res.json();
      if (data.status === 'success' && data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500" />
          Campus Announcements & Official Institutional Notices
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official campus updates, alumni association circulars, and departmental advisories.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading campus announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No active announcements currently posted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                  {ann.category || 'Official Circular'}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                {ann.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {ann.content || ann.message}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Issued by: <strong className="text-slate-700 dark:text-slate-300">{ann.posted_by_name || 'NEXUS Administration'}</strong></span>
                <span>Department: {ann.department || 'All Campus'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
