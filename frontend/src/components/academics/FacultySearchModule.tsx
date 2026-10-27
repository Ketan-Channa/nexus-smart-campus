import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  BookOpen,
  Award,
  Coffee,
} from 'lucide-react';

import { type TimetableEntry, formatTeacherCode, toCanonicalKey } from './TimetableConverter';

interface FacultySearchModuleProps {
  timetable: TimetableEntry[];
}

export const FacultySearchModule: React.FC<FacultySearchModuleProps> = ({ timetable }) => {
  const [selectedTeacherCode, setSelectedTeacherCode] = useState<string>('PRT');
  const [selectedDay, setSelectedDay] = useState<string>('All');

  // Extract unique faculty codes across ALL classes
  const uniqueTeachers = Array.from(
    new Set(timetable.map((t) => formatTeacherCode(t.teacher)).filter(Boolean))
  );

  // Filter lectures across ALL classes for selected faculty member
  const facultyLectures = timetable.filter(
    (t) => toCanonicalKey(formatTeacherCode(t.teacher)) === toCanonicalKey(selectedTeacherCode)
  );

  const filteredLectures = facultyLectures.filter(
    (t) => selectedDay === 'All' || t.day === selectedDay
  );

  // Find active lecture right now
  const getActiveFacultyLecture = () => {
    const now = new Date();
    const curMins = now.getHours() * 60 + now.getMinutes();

    return facultyLectures.find((lec) => {
      const [tStr, ampm] = lec.startTime.split(' ');
      let [h, m] = tStr.split(':').map(Number);
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      const startMins = h * 60 + m;

      const [endStr, endAmpm] = lec.endTime.split(' ');
      let [eh, em] = endStr.split(':').map(Number);
      if (endAmpm === 'PM' && eh < 12) eh += 12;
      if (endAmpm === 'AM' && eh === 12) eh = 0;
      const endMins = eh * 60 + em;

      return curMins >= startMins && curMins <= endMins;
    });
  };

  const activeLecture = getActiveFacultyLecture();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase">
              <Award className="w-3 h-3 text-purple-500" /> Faculty Schedule & Free Period Finder
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              Faculty Search & Weekly Teaching Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search any faculty code to view their assigned class lectures, current active venue, next class, and free periods!
            </p>
          </div>
        </div>

        {/* Quick Select Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs scrollbar-none">
          {uniqueTeachers.slice(0, 6).map((tCode) => (
            <button
              key={tCode}
              onClick={() => setSelectedTeacherCode(tCode)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 ${
                selectedTeacherCode === tCode
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tCode}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-purple-500" /> Select / Search Faculty Code
          </label>
          <select
            value={selectedTeacherCode}
            onChange={(e) => setSelectedTeacherCode(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 font-black focus:outline-none"
          >
            {uniqueTeachers.map((tCode) => (
              <option key={tCode} value={tCode}>
                Faculty Code: {tCode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Filter Day
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 font-extrabold focus:outline-none"
          >
            <option value="All">All Weekdays (Mon-Sat)</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday (Holiday)</option>

          </select>
        </div>
      </div>

      {/* ACTIVE LECTURE STATUS BANNER */}
      {activeLecture ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-900 dark:text-purple-200 flex items-center justify-between text-xs font-bold shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-extrabold block">
                TEACHING NOW IN CLASSROOM
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {activeLecture.subject} ({activeLecture.className}) in Room <strong>{activeLecture.room}</strong>
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-mono font-bold">
            {activeLecture.startTime} - {activeLecture.endTime}
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Faculty <strong>{selectedTeacherCode}</strong> has no active lecture right now. Available in Faculty Cabin / Free Period.</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
            FREE PERIOD NOW
          </span>
        </div>
      )}

      {/* LECTURE MATRIX DISPLAY */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            Teaching Schedule for Faculty <strong>{selectedTeacherCode}</strong> — ({filteredLectures.length} Total Slots)
          </h4>
        </div>

        {filteredLectures.length === 0 ? (
          <div className="p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <Coffee className="w-8 h-8 text-slate-400 mx-auto" />
            <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No lectures assigned to faculty {selectedTeacherCode} on {selectedDay}</h5>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLectures.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/90 dark:to-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-extrabold border border-purple-200 dark:border-purple-800">
                    {entry.day}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    {entry.className}
                  </span>
                </div>

                <div>
                  <h5 className="font-display font-black text-sm text-slate-900 dark:text-white">
                    {entry.subject}
                  </h5>
                  <span className="text-[10px] text-purple-500 font-mono font-bold">
                    {entry.slotName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    <span>{entry.startTime} - {entry.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{entry.room}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
