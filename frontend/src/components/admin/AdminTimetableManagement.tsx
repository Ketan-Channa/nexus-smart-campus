import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  Users,
  Radio,
  X,
  FileCheck2,
} from 'lucide-react';

export const AdminTimetableManagement: React.FC = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [activeSlots, setActiveSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/timetables');
      const data = await res.json();
      if (data.status === 'success') {
        setVersions(data.versions || []);
        setActiveSlots(data.activeSlots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  const handleActivate = async (timetableId: string) => {
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/timetables/activate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableId,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        fetchTimetables();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            Academics & Timetable Master Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit campus scheduling, activate authoritative timetable versions, and propagate changes live to Student, Faculty, and Parent portals.
          </p>
        </div>
        <button
          onClick={fetchTimetables}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Timetable Versions Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-sky-400" />
          Timetable Matrix Versions ({versions.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {versions.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              No timetable versions uploaded. Timetable data is currently mapped from default class schedules.
            </div>
          ) : (
            versions.map((v) => {
              const isActive = v.is_active === 1 || v.is_active === true;
              return (
                <div
                  key={v.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-sky-950/20 border-sky-500/50 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {v.file_name || `Version ${v.version || v.id}`}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Radio className="w-3 h-3 animate-pulse" />
                        ACTIVE CAMPUS-WIDE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Inactive</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Target Class: <strong className="text-slate-200">{v.selected_class || 'All Classes'}</strong></div>
                    <div>Lectures Mapped: <strong className="text-slate-200">{v.total_lectures || 0}</strong></div>
                    <div className="text-[10px] text-slate-500 mt-2">
                      Uploaded by: {v.uploader_name || 'Academic Dean'}
                    </div>
                  </div>

                  {!isActive && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => handleActivate(v.timetable_id || v.id)}
                        className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition"
                      >
                        Publish & Activate Version
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Slots Preview */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Active Live Timetable Schedule Slots
        </h3>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Day & Slot</th>
                  <th className="py-3 px-4">Subject & Code</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeSlots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No active slots currently loaded.
                    </td>
                  </tr>
                ) : (
                  activeSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">{slot.day}</span>
                        <div className="text-[11px] text-sky-400 font-mono">
                          {slot.start_time} - {slot.end_time}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{slot.subject}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{slot.code}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {slot.teacher_code || 'Faculty Instructor'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold text-[10px]">
                          {slot.class_name || 'B.Tech CSE 4A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {slot.room || 'Room 301'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
