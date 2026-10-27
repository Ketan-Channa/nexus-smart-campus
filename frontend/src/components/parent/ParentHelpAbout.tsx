import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Info,
  GraduationCap,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export const ParentHelpAbout: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I link an additional child or sibling to my parent portal?',
      a: 'Navigate to "My Children" from the sidebar and click "Link Another Child". Provide your child\'s official University Roll Number and specify your relationship. Once the administration or existing verified record matches your guardian credentials, your child\'s academic and attendance data will instantly appear in the child switcher.',
    },
    {
      q: 'Why can’t I see preliminary or unpublished exam marks?',
      a: 'NEXUS strictly adheres to institutional examination governance. Incomplete draft marks being keyed in by faculty remain private until the department chair or controller of examinations signs and publishes the official marksheet. This prevents confusion caused by unmoderated scores.',
    },
    {
      q: 'What triggers an Attendance Shortage Alert?',
      a: 'University academic regulations require a minimum 75% cumulative attendance in each subject to be eligible for end-semester examinations. When your child’s attendance in any subject or overall falls below 75%, NEXUS flags an automatic debarment warning banner and alerts you.',
    },
    {
      q: 'How do Parent-Faculty Meetings (PTM) function?',
      a: 'You can view meeting invitations scheduled by faculty in the "Faculty Meetings & Appointments" tab. You can Accept, Decline, or suggest an Alternative Time. You can also proactively initiate appointment requests with your child’s class incharge or subject faculty.',
    },
    {
      q: 'How do I approve or endorse my child’s student applications?',
      a: 'When your child submits applications requiring parental consent (such as Campus Fest passes, hostel leaves, or medical certificates), they appear under "Student Approvals & Requests". You can review the details and click "Endorse & Approve" with real-time audit logging.',
    },
    {
      q: 'What should I do in an emergency?',
      a: 'If you receive an SOS dispatch or need immediate campus intervention, call the 24/7 Campus Security Control Room at +91 1800-CAMPUS-911 or reach the Dean of Student Welfare immediately using the hotlines below.',
    },
  ];

  const emergencyContacts = [
    {
      dept: '24/7 Campus Security Control Room',
      phone: '+91 1800-CAMPUS-911',
      email: 'security.dispatch@nexus.edu',
      timing: '24 Hours / 7 Days',
      badge: 'Immediate Response',
    },
    {
      dept: 'Dean of Student Welfare (DSW)',
      phone: '+91 (0172) 500-2401',
      email: 'dsw.office@nexus.edu',
      timing: '09:00 AM – 05:30 PM (Mon–Sat)',
      badge: 'Student Affairs',
    },
    {
      dept: 'University Health & Emergency Clinic',
      phone: '+91 (0172) 500-2499',
      email: 'medical.center@nexus.edu',
      timing: '24 Hours / Resident Physician',
      badge: 'Medical',
    },
    {
      dept: 'Examination Control & Records Office',
      phone: '+91 (0172) 500-2420',
      email: 'controller.exams@nexus.edu',
      timing: '09:00 AM – 05:00 PM (Mon–Fri)',
      badge: 'Academic',
    },
    {
      dept: 'Accounts & Student Fee Desk',
      phone: '+91 (0172) 500-2435',
      email: 'student.accounts@nexus.edu',
      timing: '09:30 AM – 04:30 PM (Mon–Fri)',
      badge: 'Finance',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          Guardian Support Hub
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Help, Institutional Directory & About NEXUS</h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Complete guidance on guardian portal workflows, institutional escalation contacts, academic integrity protocols, and technical support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mb-6">Common questions regarding student monitoring and parent workflows</p>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-4 font-semibold text-sm text-slate-800 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* About NEXUS Architecture */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              About NEXUS Smart Campus Platform
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              NEXUS is an enterprise four-portal campus ecosystem connecting <strong>Students</strong>, <strong>Faculty</strong>, <strong>Alumni</strong>, and <strong>Parents</strong> through unified MySQL persistence, end-to-end encryption, and bidirectional realtime WebSocket synchronization.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
              <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Student Portal</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Academics & Campus</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400">Faculty Portal</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Instruction & Grading</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Alumni Portal</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Mentorship & Careers</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Parent Portal</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Guardian Governance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency & Institutional Contacts */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-500" />
              Institutional Helpdesk
            </h2>
            <p className="text-xs text-slate-500">Official department desks and campus hotlines</p>

            <div className="space-y-3">
              {emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{contact.dept}</p>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {contact.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{contact.timing}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Guardian Data Protection
            </p>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              Your access credentials and child monitoring logs are protected under campus cyber security policies and encrypted in transit and at rest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
