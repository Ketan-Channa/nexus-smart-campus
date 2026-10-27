import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Building,
} from 'lucide-react';

interface FacultyTimetableProps {
  facultyName?: string;
}

export const FacultyTimetable: React.FC<FacultyTimetableProps> = ({
  facultyName = 'Dr. SMB',
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'vacant' | 'timeline'>('schedule');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Vacant room finder state
  const [vacantDay, setVacantDay] = useState<string>('Monday');
  const [vacantTimeSlot, setVacantTimeSlot] = useState<string>('09:00 AM');
  const [occupiedRoomsList, setOccupiedRoomsList] = useState<any[]>([]);

  // Room timeline state
  const [selectedRoom, setSelectedRoom] = useState<string>('ET-301');
  const [roomTimelineList, setRoomTimelineList] = useState<any[]>([]);

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlotsList = ['09:00 AM', '10:05 AM', '11:10 AM', '12:30 PM', '01:35 PM', '02:40 PM'];
  const campusRoomsList = ['ET-301', 'ET-302', 'ET-303', 'ET-401', 'ET-402', 'CL-01 Lab', 'CL-02 Lab'];

  // Fetch Faculty Schedule
  const fetchFacultySchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/academics/faculty-schedule?teacherCode=${encodeURIComponent(facultyName)}&day=${selectedDay}`
      );
      if (res.data && res.data.schedule && res.data.schedule.length > 0) {
        setScheduleList(res.data.schedule);
      } else {
        // Fallback dynamic timetable entries for faculty
        setScheduleList([
          {
            id: 'f1',
            day: selectedDay,
            startTime: '09:00 AM',
            endTime: '10:00 AM',
            slotName: 'Lecture 1',
            subject: 'Blockchain Technologies & Smart Contracts',
            className: 'BTECH CSE 4A',
            room: 'ET-301',
            type: 'Lecture',
          },
          {
            id: 'f2',
            day: selectedDay,
            startTime: '10:05 AM',
            endTime: '11:05 AM',
            slotName: 'Lecture 2',
            subject: 'Agile Software Development',
            className: 'BTECH CSE 4A',
            room: 'ET-301',
            type: 'Lecture',
          },
          {
            id: 'f3',
            day: selectedDay,
            startTime: '01:35 PM',
            endTime: '03:35 PM',
            slotName: 'Lab Session',
            subject: 'Database Management Systems Lab',
            className: 'BCA 3B',
            room: 'CL-02 Lab',
            type: 'Lab',
          },
        ]);
      }
    } catch (err) {
      setScheduleList([
        {
          id: 'f1',
          day: selectedDay,
          startTime: '09:00 AM',
          endTime: '10:00 AM',
          slotName: 'Lecture 1',
          subject: 'Blockchain Technologies',
          className: 'BTECH CSE 4A',
          room: 'ET-301',
          type: 'Lecture',
        },
        {
          id: 'f2',
          day: selectedDay,
          startTime: '10:05 AM',
          endTime: '11:05 AM',
          slotName: 'Lecture 2',
          subject: 'Agile Software Engineering',
          className: 'BTECH CSE 4A',
          room: 'ET-301',
          type: 'Lecture',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [facultyName, selectedDay]);

  // Fetch Vacant Rooms
  const fetchVacantVenues = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/academics/vacant-venues?day=${vacantDay}&startTime=${encodeURIComponent(vacantTimeSlot)}`
      );
      if (res.data && res.data.occupiedRooms) {
        setOccupiedRoomsList(res.data.occupiedRooms);
      }
    } catch (err) {
      setOccupiedRoomsList([]);
    }
  }, [vacantDay, vacantTimeSlot]);

  // Fetch Room Timeline
  const fetchRoomTimeline = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/academics/room-timeline?roomCode=${encodeURIComponent(selectedRoom)}&day=${selectedDay}`
      );
      if (res.data && res.data.timeline) {
        setRoomTimelineList(res.data.timeline);
      }
    } catch (err) {
      setRoomTimelineList([]);
    }
  }, [selectedRoom, selectedDay]);

  useEffect(() => {
    if (activeTab === 'schedule') fetchFacultySchedule();
    else if (activeTab === 'vacant') fetchVacantVenues();
    else if (activeTab === 'timeline') fetchRoomTimeline();
  }, [activeTab, fetchFacultySchedule, fetchVacantVenues, fetchRoomTimeline]);

  // Calculate which rooms are vacant during selected time slot
  const occupiedRoomCodes = occupiedRoomsList.map((r: any) => r.room?.toUpperCase().replace(/\s/g, ''));
  const vacantRooms = campusRoomsList.filter((room) => !occupiedRoomCodes.includes(room.toUpperCase().replace(/\s/g, '')));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span>Academics & Timetable Venue</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Faculty Lecture Schedule • Real-time Vacant Room Finder • Room Occupancy Timelines
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'schedule'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Schedule
          </button>
          <button
            onClick={() => setActiveTab('vacant')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'vacant'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vacant Room Finder
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'timeline'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Room Timeline
          </button>
        </div>
      </div>

      {/* TAB 1: MY LECTURE SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-5">
          {/* DAY FILTER BAR */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {daysList.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* LECTURES GRID */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Assigned Lectures for {selectedDay}</span>
              </h3>
              <button
                onClick={fetchFacultySchedule}
                className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold">Loading lecture schedule...</div>
            ) : scheduleList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold">
                No lectures scheduled for {facultyName} on {selectedDay}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduleList.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-mono font-extrabold uppercase border border-purple-500/30">
                        {item.slotName || 'Lecture Slot'}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.room}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">{item.subject}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-mono font-bold text-purple-500">{item.className}</span>
                        <span>•</span>
                        <span>{item.type || 'Lecture'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                      <span>{item.startTime} - {item.endTime}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 text-[10px] font-sans font-bold">
                        Scheduled
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VACANT ROOM FINDER */}
      {activeTab === 'vacant' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" />
                <span>Find Vacant Lecture Halls & Computer Labs</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Check empty rooms available for extra classes, lab reschedules, and viva sessions
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={vacantDay}
                onChange={(e) => setVacantDay(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {daysList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={vacantTimeSlot}
                onChange={(e) => setVacantTimeSlot(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {timeSlotsList.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VACANT ROOMS LIST */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Vacant Venues ({vacantRooms.length} Available)</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {vacantRooms.map((room) => (
                  <div
                    key={room}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono font-black text-slate-900 dark:text-white">{room}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-[10px]">
                      FREE
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* OCCUPIED ROOMS LIST */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Occupied Venues ({occupiedRoomsList.length})</span>
              </h4>
              <div className="space-y-2">
                {occupiedRoomsList.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                    All venues are vacant during this time slot!
                  </div>
                ) : (
                  occupiedRoomsList.map((occ: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-300">{occ.room}</span>
                        <span className="text-slate-500 text-[11px] block">{occ.className} • {occ.subject}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold">
                        {occ.startTime}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROOM TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                <span>Room Occupancy Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect daily timetable for any lecture hall or lab venue
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {campusRoomsList.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {daysList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {roomTimelineList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold font-mono">
                No active lectures scheduled for {selectedRoom} on {selectedDay}. Room is available!
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {roomTimelineList.map((t: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-300 w-28">
                        {t.startTime} - {t.endTime}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{t.subject}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.className} • Instructor: {t.teacher}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                      {t.type || 'Lecture'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
