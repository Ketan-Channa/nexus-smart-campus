import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Video,
  Calendar,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { type LinkedStudent, type ParentTabType } from './ParentSidebar';

interface ParentConnectCentralProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
  onNavigateTab: (tab: ParentTabType) => void;
}

export const ParentConnectCentral: React.FC<ParentConnectCentralProps> = ({
  parentEmail,
  selectedChild,
  onNavigateTab,
}) => {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectData();
  }, [parentEmail, selectedChild?.roll_number]);

  const fetchConnectData = async () => {
    setLoading(true);
    try {
      // 1. Fetch authorized faculty directory for this class
      const dRes = await fetch('http://localhost:5000/api/faculty/parent-connect/directory?targetClass=' + encodeURIComponent(selectedChild?.class || 'BTECH CSE 4A'));
      const dJson = await dRes.json();
      if (dJson.success) {
        setFacultyList(dJson.directory || []);
      }

      // 2. Fetch active meetings
      const mRes = await fetch(
        `http://localhost:5000/api/parent/meetings?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild?.roll_number || '')}`
      );
      const mJson = await mRes.json();
      if (mJson.success) {
        setMeetings(mJson.meetings || []);
      }
    } catch (err) {
      console.error('Fetch connect data error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold border border-teal-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Institutional Collaboration Hub
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            NEXUS Parent Connect
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Direct, verified academic bridge connecting parents with class in-charges and subject mentors. Schedule consultations, track progress, and collaborate seamlessly on student growth.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('meetings')}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Schedule Faculty Consultation</span>
            </button>
            <button
              onClick={() => onNavigateTab('feedback')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all"
            >
              <span>Submit Academic Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Directory Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Class Faculty & Mentors ({selectedChild?.class || 'B.Tech CSE'})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized academic contacts for your child's courses
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('meetings')}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
          >
            Manage Appointments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyList.length > 0 ? (
            facultyList.slice(0, 6).map((fac: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-sm flex items-center justify-center shrink-0">
                      {fac.faculty_name ? fac.faculty_name[0] : 'F'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {fac.faculty_name || 'Dr. Professor'}
                      </div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold truncate">
                        {fac.designation || 'Class In-Charge'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div>Department: <strong className="text-slate-700 dark:text-slate-300">{fac.department || 'CSE'}</strong></div>
                    <div className="truncate">Email: {fac.email || 'faculty@nexus.edu'}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateTab('meetings')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-all text-center"
                  >
                    Request Meeting
                  </button>
                  <button
                    onClick={() => onNavigateTab('messages')}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-400 italic">
              Faculty directory loading or updating for this academic section.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
