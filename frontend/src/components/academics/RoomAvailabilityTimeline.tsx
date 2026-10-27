import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Filter,
  Layers,
  Wind,
  Wifi,
} from 'lucide-react';
import { type TimetableEntry, toCanonicalKey } from './TimetableConverter';

interface RoomAvailabilityTimelineProps {
  timetable: TimetableEntry[];
}

export interface RoomDetails {
  roomCode: string;
  building: string;
  floor: string;
  capacity: number;
  type: 'Classroom' | 'Lab' | 'Auditorium' | 'Lounge';
  amenities: string[];
}

const MASTER_CAMPUS_VENUES: RoomDetails[] = [
  { roomCode: 'ET-101', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-102', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-103', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-104', building: 'Engineering Tower', floor: '1st Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-201', building: 'Engineering Tower', floor: '2nd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-202', building: 'Engineering Tower', floor: '2nd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-301', building: 'Engineering Tower', floor: '3rd Floor', capacity: 70, type: 'Classroom', amenities: ['AC', 'WiFi', 'Smart Board'] },
  { roomCode: 'ET-302', building: 'Engineering Tower', floor: '3rd Floor', capacity: 70, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-303', building: 'Engineering Tower', floor: '3rd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-310', building: 'Engineering Tower', floor: '3rd Floor', capacity: 60, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-401', building: 'Engineering Tower', floor: '4th Floor', capacity: 65, type: 'Classroom', amenities: ['AC', 'WiFi', 'Projector'] },
  { roomCode: 'ET-402', building: 'Engineering Tower', floor: '4th Floor', capacity: 65, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ET-403', building: 'Engineering Tower', floor: '4th Floor', capacity: 65, type: 'Classroom', amenities: ['AC', 'WiFi'] },
  { roomCode: 'ETCC-200', building: 'Computer Centre Block', floor: '2nd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'PCs'] },
  { roomCode: 'ETCC-209', building: 'Computer Centre Block', floor: '2nd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'PCs'] },
  { roomCode: 'ETCC-304', building: 'Computer Centre Block', floor: '3rd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'Java Stack'] },
  { roomCode: 'ETCC-307', building: 'Computer Centre Block', floor: '3rd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN'] },
  { roomCode: 'ETCC-309', building: 'Computer Centre Block', floor: '3rd Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN', 'Docker Nodes'] },
  { roomCode: 'ETCC-407', building: 'Computer Centre Block', floor: '4th Floor', capacity: 50, type: 'Lab', amenities: ['AC', 'High-Speed LAN'] },
  { roomCode: 'ETCC-507', building: 'Computer Centre Block', floor: '5th Floor', capacity: 55, type: 'Lab', amenities: ['AC', 'WiFi', 'Workshop Setup'] },
  { roomCode: 'ETCC-607', building: 'Computer Centre Block', floor: '6th Floor', capacity: 60, type: 'Lab', amenities: ['AC', 'WiFi', 'Projector', 'Power Sockets'] },
  { roomCode: 'MTCL-1', building: 'Main Technology Complex', floor: '1st Floor', capacity: 45, type: 'Lab', amenities: ['AC', 'WiFi'] },
  { roomCode: 'MTCL-2', building: 'Main Technology Complex', floor: '2nd Floor', capacity: 45, type: 'Lab', amenities: ['AC', 'WiFi'] },
  { roomCode: 'AI LAB-1', building: 'Innovation Hub', floor: 'Ground Floor', capacity: 40, type: 'Lab', amenities: ['AC', 'GPU Workstations', 'WiFi'] },
  { roomCode: 'AUDITORIUM 1', building: 'Central Block', floor: 'Ground Floor', capacity: 300, type: 'Auditorium', amenities: ['AC', 'Stage', 'Sound System'] },
  { roomCode: 'AUDITORIUM 2', building: 'Central Block', floor: '1st Floor', capacity: 200, type: 'Auditorium', amenities: ['AC', 'Sound System'] },
  { roomCode: 'STUDENT LOUNGE A', building: 'Student Activity Centre', floor: 'Ground Floor', capacity: 80, type: 'Lounge', amenities: ['AC', 'Sofa Seating', 'WiFi', 'Snack Bar'] },
];

const STANDARD_TIME_SLOTS = [
  { name: 'Slot I', start: '09:00 AM', end: '10:00 AM' },
  { name: 'Slot II', start: '10:05 AM', end: '11:05 AM' },
  { name: 'Tea Break', start: '11:05 AM', end: '11:25 AM', isBreak: true },
  { name: 'Slot III', start: '11:25 AM', end: '12:25 PM' },
  { name: 'Slot IV', start: '12:30 PM', end: '01:30 PM' },
  { name: 'Slot V', start: '01:35 PM', end: '02:35 PM' },
  { name: 'Slot VI', start: '02:40 PM', end: '03:40 PM' },
  { name: 'Slot VII', start: '03:40 PM', end: '04:40 PM' },
];

export const RoomAvailabilityTimeline: React.FC<RoomAvailabilityTimelineProps> = ({ timetable }) => {
  const [searchRoom, setSearchRoom] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [selectedVenueType, setSelectedVenueType] = useState<string>('All');


  const buildings = ['All', 'Engineering Tower', 'Computer Centre Block', 'Main Technology Complex', 'Innovation Hub', 'Central Block', 'Student Activity Centre'];
  const floors = ['All', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor'];
  const venueTypes = ['All', 'Classroom', 'Lab', 'Auditorium', 'Lounge'];

  // Filter master room list
  const filteredVenues = MASTER_CAMPUS_VENUES.filter((v) => {
    const matchesSearch = !searchRoom || v.roomCode.toLowerCase().includes(searchRoom.toLowerCase().trim()) || v.building.toLowerCase().includes(searchRoom.toLowerCase().trim());
    const matchesBuilding = selectedBuilding === 'All' || v.building === selectedBuilding;
    const matchesFloor = selectedFloor === 'All' || v.floor === selectedFloor;
    const matchesType = selectedVenueType === 'All' || v.type === selectedVenueType;
    return matchesSearch && matchesBuilding && matchesFloor && matchesType;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-extrabold uppercase">
              <Clock className="w-3 h-3 text-cyan-500" /> Full-Day Occupancy Timeline Search
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              Room Availability & Visual Occupancy Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search any room number to view its complete 9:00 AM – 4:40 PM schedule with color indicators: 🟢 Available, 🔴 Occupied, and 🟡 Reserved / Break!
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Break
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="col-span-2 sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-indigo-500" /> Search Room / Venue
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              placeholder="Search ET-301, ETCC-607..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-500" /> Select Day
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 font-extrabold focus:outline-none"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
              <option key={d} value={d}>{d}{d === 'Sunday' ? ' (Holiday)' : ''}</option>
            ))}

          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-cyan-500" /> Building
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            {buildings.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-500" /> Floor
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            {floors.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-rose-500" /> Venue Type
          </label>
          <select
            value={selectedVenueType}
            onChange={(e) => setSelectedVenueType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            {venueTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VENUE TIMELINE CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Showing Full Occupancy Timelines on <strong>{selectedDay}</strong> — ({filteredVenues.length} Venues Listed)
          </h4>
        </div>

        {filteredVenues.length === 0 ? (
          <div className="p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No campus rooms matched your search filters</h5>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVenues.map((venue) => {
              // Calculate schedule slots for this room on the selected day
              const roomEntries = timetable.filter(
                (t) => t.day === selectedDay && toCanonicalKey(t.room) === toCanonicalKey(venue.roomCode)
              );

              return (
                <motion.div
                  key={venue.roomCode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-slate-50 to-slate-100/70 dark:from-slate-800/90 dark:to-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-md space-y-4"
                >
                  {/* Room Meta Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                            {venue.roomCode}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                            {venue.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {venue.building} • {venue.floor} • Capacity: {venue.capacity} Seats
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {venue.amenities.map((amenity) => (
                        <span key={amenity} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          {amenity === 'AC' && <Wind className="w-2.5 h-2.5 text-cyan-500" />}
                          {amenity === 'WiFi' && <Wifi className="w-2.5 h-2.5 text-emerald-500" />}
                          <span>{amenity}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* VISUAL TIMELINE SLOTS BAR */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-xs">
                    {STANDARD_TIME_SLOTS.map((slot) => {
                      if (slot.isBreak) {
                        return (
                          <div key={slot.name} className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-center space-y-1">
                            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-300 block">
                              TEA BREAK
                            </span>
                            <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 block font-bold">
                              11:05-11:25
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-black text-amber-600 dark:text-amber-300 block">
                              UNIVERSAL
                            </span>
                          </div>
                        );
                      }

                      const occupied = roomEntries.find((e) => e.startTime.includes(slot.start.split(' ')[0]));

                      if (occupied) {
                        return (
                          <div key={slot.name} className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-center space-y-1">
                            <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-300 block truncate">
                              {slot.name}
                            </span>
                            <span className="text-[9px] font-mono text-rose-700 dark:text-rose-400 block font-bold">
                              {slot.start}
                            </span>
                            <div className="pt-1 border-t border-rose-500/20">
                              <span className="text-[10px] font-black text-slate-900 dark:text-white block truncate">
                                {occupied.className}
                              </span>
                              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-300 block truncate">
                                {occupied.subject}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={slot.name} className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-1">
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block">
                            {slot.name}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-300 block font-bold">
                            {slot.start}
                          </span>
                          <div className="pt-1 border-t border-emerald-500/20">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px] font-black text-emerald-600 dark:text-emerald-300 block">
                              AVAILABLE
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
