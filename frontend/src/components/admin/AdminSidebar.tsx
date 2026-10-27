import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Award,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  CheckSquare,
  FileCheck2,
  Video,
  ShieldAlert,
  Bell,
  Sparkles,
  MessageSquare,
  Network,
  Compass,
  FlaskConical,
  Coffee,
  Bus,
  CreditCard,
  FileSpreadsheet,
  PieChart,
  Bot,
  KeyRound,
  Activity,
  ShieldCheck,
  Settings,
  UserCheck,
  HelpCircle,
  X,
} from 'lucide-react';

export type AdminTabType =
  | 'overview'
  | 'users'
  | 'students'
  | 'faculty'
  | 'parents'
  | 'alumni'
  | 'departments_classes'
  | 'subjects_curriculum'
  | 'timetable'
  | 'attendance'
  | 'assignments'
  | 'exams_results'
  | 'student_approvals'
  | 'faculty_leaves'
  | 'parent_connect'
  | 'safety_voice'
  | 'announcements'
  | 'events'
  | 'messaging_governance'
  | 'alumni_connect'
  | 'jobs_careers'
  | 'research_collab'
  | 'canteen_services'
  | 'hostel_transport'
  | 'payments_finance'
  | 'documents_certs'
  | 'reports_analytics'
  | 'admin_utilities_ai'
  | 'roles_permissions'
  | 'system_health'
  | 'audit_security'
  | 'system_settings'
  | 'admin_profile'
  | 'help_about';

interface SidebarCategory {
  title: string;
  items: {
    id: AdminTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

interface AdminSidebarProps {
  activeTab: AdminTabType;
  onSelectTab: (tab: AdminTabType) => void;
  isOpen: boolean;
  onClose: () => void;
  badgeCounts?: {
    pendingApprovals?: number;
    pendingAlumni?: number;
    activeSos?: number;
    pendingFeedback?: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  badgeCounts = {},
}) => {
  const categories: SidebarCategory[] = [
    {
      title: 'Core Governance',
      items: [
        { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'User & Account Directory', icon: Users },
        { id: 'roles_permissions', label: 'Roles & Permissions', icon: KeyRound },
        { id: 'system_settings', label: 'System Settings', icon: Settings },
        { id: 'admin_profile', label: 'Admin Profile', icon: UserCheck },
      ],
    },
    {
      title: 'Campus Constituencies',
      items: [
        { id: 'students', label: 'Student Management', icon: GraduationCap },
        { id: 'faculty', label: 'Faculty Management', icon: Briefcase },
        { id: 'parents', label: 'Parent Governance', icon: HeartHandshake },
        {
          id: 'alumni',
          label: 'Alumni Governance',
          icon: Award,
          badge: badgeCounts.pendingAlumni || undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
      ],
    },
    {
      title: 'Academics & Operations',
      items: [
        { id: 'departments_classes', label: 'Departments & Classes', icon: Building2 },
        { id: 'subjects_curriculum', label: 'Subjects & Curriculum', icon: BookOpen },
        { id: 'timetable', label: 'Timetable Administration', icon: Calendar },
        { id: 'attendance', label: 'Attendance Management', icon: Clock },
        { id: 'assignments', label: 'Assignments & Work', icon: FileText },
        { id: 'exams_results', label: 'Exams, Marks & Results', icon: BarChart3 },
      ],
    },
    {
      title: 'Approvals & Leaves',
      items: [
        {
          id: 'student_approvals',
          label: 'Student Central Approvals',
          icon: CheckSquare,
          badge: badgeCounts.pendingApprovals || undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        },
        { id: 'faculty_leaves', label: 'Faculty Leaves & Approvals', icon: FileCheck2 },
      ],
    },
    {
      title: 'Safety & Campus Voice',
      items: [
        {
          id: 'safety_voice',
          label: 'Student Safety & Voice',
          icon: ShieldAlert,
          badge: badgeCounts.activeSos || undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
        { id: 'parent_connect', label: 'Parent Connect & Meetings', icon: Video },
        { id: 'announcements', label: 'Announcements & Circulars', icon: Bell },
        { id: 'events', label: 'Events & Campus Life', icon: Sparkles },
        { id: 'messaging_governance', label: 'Connections & Moderation', icon: MessageSquare },
      ],
    },
    {
      title: 'Alumni & Careers',
      items: [
        { id: 'alumni_connect', label: 'Mentorship & Guest Lectures', icon: Network },
        { id: 'jobs_careers', label: 'Jobs, Internships & Referrals', icon: Compass },
        { id: 'research_collab', label: 'Research & Collaborations', icon: FlaskConical },
      ],
    },
    {
      title: 'Campus Services & Finance',
      items: [
        { id: 'canteen_services', label: 'Canteen & Food Services', icon: Coffee },
        { id: 'hostel_transport', label: 'Hostel & Transport Hub', icon: Bus },
        { id: 'payments_finance', label: 'Payments & Transactions', icon: CreditCard },
        { id: 'documents_certs', label: 'Documents & Certificates', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'Intelligence & Audit',
      items: [
        { id: 'reports_analytics', label: 'Reports & Analytics', icon: PieChart },
        { id: 'admin_utilities_ai', label: 'AI Assistant & Utilities', icon: Bot },
        { id: 'system_health', label: 'Integrations & System Health', icon: Activity },
        { id: 'audit_security', label: 'Audit Logs & Security', icon: ShieldCheck },
        { id: 'help_about', label: 'Help & Campus Topology', icon: HelpCircle },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B0F17]/95 dark:bg-[#0B0F17]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-sky-300">
                  NEXUS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  GOV
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Central Administration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="text-[10px] font-bold tracking-wider uppercase text-slate-500 px-3 py-1">
                {cat.title}
              </h4>
              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && Number(item.badge) > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                            item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mesh Realtime v2.4</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Port 5000</span>
          </div>
        </div>
      </aside>
    </>
  );
};
