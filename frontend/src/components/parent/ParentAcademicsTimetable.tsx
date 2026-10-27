import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentAcademicsTimetableProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentAcademicsTimetable: React.FC<ParentAcademicsTimetableProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchTimetable = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nexus-smart-campus-backend.onrender.com/api/parent/academics/timetable?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Fetch timetable error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [parentEmail, selectedChild?.roll_number]);

  const schedule = data?.weeklySchedule || {};
  const currentDaySlots = schedule[selectedDay] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Class Timetable & Academic Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative lecture slots for {selectedChild?.full_name || 'student'} ({data?.targetClass || selectedChild?.class || 'B.Tech CSE'})
          </p>
        </div>

        <button
          onClick={fetchTimetable}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Schedule</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const slotsCount = (schedule[day] || []).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 scale-105'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-500/50'
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {slotsCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>{selectedDay}'s Class Schedule</span>
            <span className="text-xs font-normal text-slate-400">({currentDaySlots.length} Sessions)</span>
          </h3>
          <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-full border border-teal-200/50">
            Active Semester 2026-27
          </span>
        </div>

        {currentDaySlots.length > 0 ? (
          <div className="space-y-3.5">
            {currentDaySlots.map((slot: any, idx: number) => {
              const isLab = (slot.type || '').toLowerCase().includes('lab');
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isLab
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isLab
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      }`}
                    >
                      {isLab ? 'LAB' : 'LEC'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {slot.subject}
                        </span>
                        {slot.code && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                            {slot.code}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Faculty: <strong className="text-slate-700 dark:text-slate-300">{slot.teacher || 'Assigned Professor'}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Venue: <strong className="text-slate-700 dark:text-slate-300">Room {slot.room || '304'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto shadow-sm">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No lectures or lab sessions scheduled on {selectedDay}.
          </div>
        )}
      </div>
    </div>
  );
};
