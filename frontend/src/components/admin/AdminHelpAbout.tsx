import React from 'react';
import {
  HelpCircle,
  Network,
  ShieldCheck,
  Server,
  BookOpen,
  LifeBuoy,
  FileCheck2,
} from 'lucide-react';

export const AdminHelpAbout: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-sky-950/40 border border-indigo-500/20 backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Campus Governance Architecture & Operational Manual
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          NEXUS Smart Campus Platform v2.4 — Five-Portal Mesh Topology & Authoritative Protocols.
        </p>
      </div>

      {/* 5-Portal Ecosystem Topology */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          Synchronized Campus Mesh Topology
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
            <div className="font-bold text-indigo-300">STUDENT PORTAL</div>
            <div className="text-[10px] text-slate-400 mt-1">Academics, Attendance, Safety SOS, Approvals</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30">
            <div className="font-bold text-sky-300">FACULTY PORTAL</div>
            <div className="text-[10px] text-slate-400 mt-1">Registers, Marks Grading, Responders, PTM</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <div className="font-bold text-emerald-300">PARENT PORTAL</div>
            <div className="text-[10px] text-slate-400 mt-1">Linked Children, Fee Dues, Faculty Meetings</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
            <div className="font-bold text-amber-300">ALUMNI PORTAL</div>
            <div className="text-[10px] text-slate-400 mt-1">Mentorship, Job Referrals, Guest Lectures</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
            <div className="font-bold text-purple-300">ADMIN PORTAL</div>
            <div className="text-[10px] text-slate-400 mt-1">Central Matrix, Master Audit, Governance</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-bold text-white">Central Architectural Directives:</div>
          <p>• Single authoritative MySQL database (<code className="text-indigo-300">nexus_campus_db</code>) — zero mock data.</p>
          <p>• Express REST layer with granular role authorization on port 5000.</p>
          <p>• Bidirectional Socket.IO dispatcher broadcasting state transitions to scoped rooms in realtime.</p>
        </div>
      </div>

      {/* Escalation Support Contacts */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-emerald-400" />
          Institutional Governance & Technical Escalations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="font-bold text-white">Office of the Registrar</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Academic & Enrollment Policies</div>
            <div className="text-[11px] text-indigo-400 font-mono mt-1">registrar@nexus.edu</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="font-bold text-white">Campus Security Command</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Emergency SOS & Rapid Response</div>
            <div className="text-[11px] text-rose-400 font-mono mt-1">security.command@nexus.edu</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="font-bold text-white">IT Infrastructure Operations</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Database & Socket Mesh Health</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1">sysadmin@nexus.edu</div>
          </div>
        </div>
      </div>
    </div>
  );
};
