import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

export const FacultyAnalytics: React.FC = () => {
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/faculty/students?className=BTECH%20CSE%204A');
        if (res.data && res.data.students) {
          const atRisk = res.data.students.filter((s: any) => s.attendancePercent < 75);
          setAtRiskStudents(atRisk);
        } else {
          setAtRiskStudents([]);
        }
      } catch (e) {
        setAtRiskStudents([]);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Class Performance Analytics & At-Risk Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time breakdown of class attendance averages, submission completion rates, and at-risk student rosters</p>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">BTECH CSE 4A Avg Attendance</span>
          <div className="flex items-baseline justify-between">
            <span className="font-display font-black text-3xl text-emerald-400">88.5%</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +2.4% this week</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Assignment Completion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="font-display font-black text-3xl text-purple-400">92.0%</span>
            <span className="text-xs text-purple-400 font-bold">38 / 45 Submissions</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Average Subjective Score</span>
          <div className="flex items-baseline justify-between">
            <span className="font-display font-black text-3xl text-cyan-400">42.8 / 50</span>
            <span className="text-xs text-cyan-400 font-bold">85.6% Score Avg</span>
          </div>
        </div>
      </div>

      {/* AT-RISK STUDENTS ALERT ROSTER */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Attendance Shortage & At-Risk Students Warning List ({atRiskStudents.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950">
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Attendance %</th>
                <th className="p-3">Missing Tasks</th>
                <th className="p-3">Alert Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {atRiskStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-white whitespace-nowrap">{s.rollNumber}</td>
                  <td className="p-3 font-bold text-white">{s.name}</td>
                  <td className="p-3 text-purple-400 font-bold">{s.className}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {s.attendancePercent}%
                    </span>
                  </td>
                  <td className="p-3 font-bold text-amber-400">{s.missingAssignments} Pending</td>
                  <td className="p-3">
                    <span className="text-amber-300 font-bold text-xs">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
