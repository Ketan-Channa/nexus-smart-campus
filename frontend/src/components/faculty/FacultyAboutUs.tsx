import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Radio,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  HeartHandshake,
  Mail,
  MapPin,
  ExternalLink,
  Code2,
  Lock,
} from 'lucide-react';

export const FacultyAboutUs: React.FC = () => {
  const modulesList = [
    {
      title: 'Academics & Timetables',
      desc: 'Conflict-free scheduling, vacant venue timeline detection, and multi-format timetable parsing.',
      icon: BookOpen,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Attendance Register & Policies',
      desc: 'Realtime session recording, attendance percentage calculation, and automated policy enforcement.',
      icon: GraduationCap,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Exams, Results & Analytics',
      desc: 'Configurable assessment schemes, component weighting, attendance marks derivation, and live student charts.',
      icon: Award,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Medical & Faculty Leave Portals',
      desc: 'Class-incharge medical leave review pipeline alongside faculty casual and duty leave workflows.',
      icon: HeartHandshake,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Emergency Safety Response Centre',
      desc: 'Instant SOS dispatch with atomic first-5 faculty responder claiming and Web Audio alerts.',
      icon: ShieldCheck,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Canteen & Cabin Delivery',
      desc: 'Digital food court menus, promo code engine, and express delivery to faculty offices and cabins.',
      icon: Sparkles,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    {
      title: 'Research & Inter-College Networking',
      desc: 'Collaborative projects, proposal workflows, peer messaging, and cross-department initiatives.',
      icon: Cpu,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Alumni Mentorship & Campus Network',
      desc: 'Direct connection to verified alumni, guest lectures, job boards, and social feed discussions.',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 text-left">
      {/* HERO BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-tr from-purple-900/80 via-slate-900 to-indigo-950 p-6 sm:p-10 border border-purple-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            NEXUS SMART CAMPUS ENTERPRISE PLATFORM
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            About the NEXUS Campus Ecosystem
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            NEXUS is an integrated, next-generation smart campus enterprise operating system designed to unite
            students, faculty, academic administrators, alumni, and campus responders into a unified, data-driven,
            and realtime collaborative environment.
          </p>
        </div>
      </div>

      {/* CORE ARCHITECTURE & SYSTEM DESIGN */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-400" /> System Architecture & Technology Stack
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Node.js & Express</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              TypeScript REST API backend with JWT token verification, role-based authorization, and schema validation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">MySQL Relational DB</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Authoritative ACID-compliant database with foreign keys, transactional integrity, and persistent audit logs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Socket.IO Realtime</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Bidirectional event bus synchronizing attendance, emergency SOS alerts, exam marks, and peer messages instantly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">FastAPI AI Engine</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Autonomous AI microservice running Captain campus assistant, timetable conversion, and student analytics.
            </p>
          </div>
        </div>
      </div>

      {/* INTEGRATED MODULES */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" /> Production Campus Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {modulesList.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">{m.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUPPORTED USER ROLES */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
        <h3 className="font-display font-black text-base text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" /> Supported User Identities & Permissions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <span className="font-bold text-purple-300 block">Student Identity</span>
            <p className="text-slate-400 text-[11px]">
              Access marksheets, class schedules, attendance trackers, digital canteen, medical submissions, and emergency alerts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <span className="font-bold text-indigo-300 block">Faculty & Class Incharge</span>
            <p className="text-slate-400 text-[11px]">
              Manage student rosters, attendance registers, assessment schemes, grading, leaves, research, and cabin canteen delivery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <span className="font-bold text-cyan-300 block">Campus Administration & Safety</span>
            <p className="text-slate-400 text-[11px]">
              Campus-wide audit oversight, emergency responder escalation, institutional policies, and verified alumni management.
            </p>
          </div>
        </div>
      </div>

      {/* CREDITS & INSTITUTIONAL CONTACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-500" /> Platform Engineering & Authors
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            NEXUS Smart Campus Platform was architected and developed with focus on high concurrency, distributed
            systems resilience, and seamless student-faculty workflows.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 font-mono font-bold text-[11px]">
            <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Lead Architect: Ketan Channa
            </span>
            <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Full-Stack Lead: Nitin Kumar
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-500" /> Campus Support & Operations
          </h3>
          <div className="space-y-2 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Technical Helpdesk: <strong className="font-mono">support@nexuscampus.edu</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Campus IT Operations Center, Block A, Room 101</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Version: <strong className="font-mono">NEXUS v2.4 (Enterprise Edition)</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
