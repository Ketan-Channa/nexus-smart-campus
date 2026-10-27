import React from 'react';
import {
  Info,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Mail,
  Phone,
  Globe,
  Code,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AlumniHelpAndAbout: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/25 mb-3">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            NEXUS <span className="text-indigo-600 dark:text-purple-400">ALUMNI PORTAL</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Unifying students, faculty, and graduates into one bidirectional, real-time institutional network.
          </p>
        </div>

        {/* Creator Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            Lead Software Architects & Engineers
          </div>
          <h3 className="font-display font-black text-xl sm:text-2xl">
            Designed and Developed by Ketan Channa and Nitin Kumar
          </h3>
          <p className="text-xs text-indigo-100 max-w-md mx-auto opacity-90">
            Engineered with modern glassmorphism aesthetics, bidirectional real-time Socket.IO streams, and secure MySQL persistence.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pt-2">
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            Frequently Asked Questions
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">How does Alumni Verification work?</h4>
              <p className="text-slate-600 dark:text-slate-400">
                When you register as an alumnus, your academic details are queued for institutional verification. Once approved by the administrator, a unique Alumni ID (e.g. ALM-2023-CSE-001) is assigned and a verified badge is granted.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">How do student mentorship requests reach me?</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Students discover you through the Alumni Directory. When they submit a mentorship request, you receive a realtime notification in your portal. You can review their career goals and schedule a live session with a single click.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">Can I post job openings and provide internal referrals?</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Yes! Post hiring openings from your company in the Jobs & Internships module. Students can request referrals directly, and you can endorse them with internal reference codes.
              </p>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Alumni Support: <strong>alumni.support@nexus.campus.edu</strong></span>
          </div>
          <span className="text-[11px] text-slate-400">NEXUS Smart Campus Platform v2.6</span>
        </div>
      </div>
    </div>
  );
};
