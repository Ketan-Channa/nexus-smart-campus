import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, User, Clock, RefreshCw, Pin } from 'lucide-react';

interface ParentAnnouncementsViewProps {
  parentEmail: string;
}

export const ParentAnnouncementsView: React.FC<ParentAnnouncementsViewProps> = ({
  parentEmail,
}) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/faculty/announcements?role=Parent');
      const json = await res.json();
      if (json.success) {
        setAnnouncements(json.announcements || []);
      }
    } catch (err) {
      console.error('Fetch announcements error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [parentEmail]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Official Announcements & Institutional Circulars
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative university updates, semester calendar notices, and campus notifications
          </p>
        </div>

        <button
          onClick={fetchAnnouncements}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Updates</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                    <Pin className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    {item.category || 'Academic Notice'}
                  </span>
                  {item.priority === 'High' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      High Priority
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {item.content || item.description || item.message}
              </p>

              <div className="pt-2 text-xs text-slate-400 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                <span>Issued By: <strong className="text-slate-700 dark:text-slate-300">{item.author_name || item.faculty_name || 'Office of Academic Affairs'}</strong></span>
                <span>•</span>
                <span>Target: All Guardian & Student Accounts</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Active Circulars</h3>
            <p className="text-xs text-slate-400 mt-1">There are no new campus announcements posted today.</p>
          </div>
        )}
      </div>
    </div>
  );
};
