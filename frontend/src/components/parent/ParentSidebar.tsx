import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle,
  Award,
  BookOpen,
  UserCheck,
  Video,
  FileCheck,
  ShieldAlert,
  PartyPopper,
  Megaphone,
  CreditCard,
  Building2,
  GraduationCap,
  MessageSquare,
  MessageSquarePlus,
  Bell,
  FileText,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export type ParentTabType =
  | 'dashboard'
  | 'children'
  | 'academics'
  | 'attendance'
  | 'exams'
  | 'assignments'
  | 'parent-connect'
  | 'meetings'
  | 'approvals'
  | 'safety'
  | 'events'
  | 'announcements'
  | 'payments'
  | 'hostel-transport'
  | 'alumni-career'
  | 'messages'
  | 'feedback'
  | 'notifications'
  | 'documents'
  | 'profile'
  | 'settings'
  | 'about-us';

export interface LinkedStudent {
  link_id: string;
  roll_number: string;
  full_name: string;
  class: string;
  department: string;
  semester?: string;
  photograph_url?: string | null;
  relationship?: string;
}

interface ParentSidebarProps {
  activeTab: ParentTabType;
  setActiveTab: (tab: ParentTabType) => void;
  onLogout: () => void;
  parentName?: string;
  childrenList: LinkedStudent[];
  selectedChild: LinkedStudent | null;
  onSelectChild: (child: LinkedStudent) => void;
  pendingApprovalsCount?: number;
  upcomingMeetingsCount?: number;
  pendingFeesCount?: number;
}

interface NavItem {
  id: ParentTabType;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const ParentSidebar: React.FC<ParentSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  parentName = 'Parent',
  childrenList = [],
  selectedChild,
  onSelectChild,
  pendingApprovalsCount = 0,
  upcomingMeetingsCount = 0,
  pendingFeesCount = 0,
}) => {
  const [childMenuOpen, setChildMenuOpen] = React.useState(false);

  const navSections: NavSection[] = [
    {
      title: 'PRIMARY DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'children', label: 'My Children', icon: Users, badge: childrenList.length > 0 ? `${childrenList.length}` : undefined },
      ],
    },
    {
      title: 'ACADEMICS & PROGRESS',
      items: [
        { id: 'academics', label: 'Academics & Timetable', icon: Calendar },
        { id: 'attendance', label: 'Attendance & Alerts', icon: CheckCircle },
        { id: 'exams', label: 'Exams & Results', icon: Award },
        { id: 'assignments', label: 'Assignments & Updates', icon: BookOpen },
      ],
    },
    {
      title: 'PARENT CONNECT & COLLABORATION',
      items: [
        { id: 'parent-connect', label: 'Parent Connect', icon: UserCheck },
        {
          id: 'meetings',
          label: 'Faculty Meetings',
          icon: Video,
          badge: upcomingMeetingsCount > 0 ? `${upcomingMeetingsCount}` : undefined,
          badgeColor: 'bg-indigo-500 text-white',
        },
        {
          id: 'approvals',
          label: 'Student Approvals',
          icon: FileCheck,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        { id: 'safety', label: 'Student Safety', icon: ShieldAlert },
        { id: 'messages', label: 'Connections & Chat', icon: MessageSquare },
        { id: 'feedback', label: 'Feedback & Suggestions', icon: MessageSquarePlus },
      ],
    },
    {
      title: 'CAMPUS SERVICES & ENGAGEMENT',
      items: [
        { id: 'events', label: 'Events & Invitations', icon: PartyPopper },
        { id: 'announcements', label: 'Campus Updates', icon: Megaphone },
        {
          id: 'payments',
          label: 'Payments & Dues',
          icon: CreditCard,
          badge: pendingFeesCount > 0 ? `${pendingFeesCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'hostel-transport', label: 'Hostel & Transport', icon: Building2 },
        { id: 'alumni-career', label: 'Career Guidance', icon: GraduationCap },
        { id: 'documents', label: 'Authorized Documents', icon: FileText },
        { id: 'notifications', label: 'Notifications Center', icon: Bell },
      ],
    },
    {
      title: 'ACCOUNT & SYSTEM',
      items: [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'settings', label: 'Privacy & Settings', icon: Settings },
        { id: 'about-us', label: 'Help & About Us', icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-screen select-none transition-all duration-300 shadow-xl z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              NEXUS
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase">
              Parent Portal
            </p>
          </div>
        </div>
      </div>

      {/* Child Context Switcher Card */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active Child Context</span>
          <span className="text-teal-600 dark:text-teal-400 font-semibold">{childrenList.length} Linked</span>
        </div>

        {selectedChild ? (
          <div className="relative">
            <button
              onClick={() => setChildMenuOpen(!childMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500/60 transition-all text-left shadow-sm group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-black text-xs flex items-center justify-center shrink-0">
                  {selectedChild.full_name ? selectedChild.full_name[0].toUpperCase() : 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {selectedChild.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Roll: {selectedChild.roll_number} • {selectedChild.class || 'B.Tech'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${childMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown child selector */}
            {childMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {childrenList.map((c) => (
                  <button
                    key={c.roll_number}
                    onClick={() => {
                      onSelectChild(c);
                      setChildMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                      selectedChild.roll_number === c.roll_number
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                      {c.full_name ? c.full_name[0] : 'S'}
                    </div>
                    <div className="text-xs truncate flex-1">
                      <span className="font-bold">{c.full_name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({c.roll_number})</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-1">No children linked yet</div>
        )}
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ParentTabType)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold shadow-md shadow-teal-500/20 translate-x-1'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer & User info */}
      <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
            {parentName ? parentName[0].toUpperCase() : 'P'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {parentName}
            </div>
            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium truncate">
              Verified Guardian
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Log out of Parent Portal"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
