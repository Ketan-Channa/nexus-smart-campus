import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Sparkles,
  Wrench,
  LogOut,
  Crown,
  UserCheck,
  FileText,
  Stethoscope,
  Megaphone,
  Award,
  HeartHandshake,
  ShieldAlert,
  Coffee,
  Bus,
  CreditCard,
  Network,
  Users,
  Compass,
  User,
  Info,
  CheckSquare,
  Contact,
} from 'lucide-react';

export type FacultyTabType =
  | 'dashboard'
  | 'timetable'
  | 'my-students-classes'
  | 'attendance'
  | 'assignments'
  | 'exams-analytics'
  | 'student-approvals'
  | 'medical-leaves'
  | 'faculty-leaves'
  | 'safety-response'
  | 'parent-connect'
  | 'announcements'
  | 'events-updates'
  | 'canteen'
  | 'hostel-transport'
  | 'payments'
  | 'utilities'
  | 'connections'
  | 'alumni-connect'
  | 'research'
  | 'profile'
  | 'about-us';

interface FacultySidebarProps {
  activeTab: FacultyTabType;
  setActiveTab: (tab: FacultyTabType) => void;
  onLogout: () => void;
  facultyName?: string;
  department?: string;
  isClassIncharge?: string;
  inchargeClass?: string;
  activeSosCount?: number;
  pendingApprovalsCount?: number;
}

export const FacultySidebar: React.FC<FacultySidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  facultyName = 'Dr. SMB',
  isClassIncharge = 'No',
  inchargeClass = 'BTECH CSE 4A',
  activeSosCount = 0,
  pendingApprovalsCount = 0,
}) => {
  const navSections = [
    {
      title: 'ACADEMICS & ROSTER',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'timetable', label: 'Academics & Timetable', icon: Calendar },
        { id: 'my-students-classes', label: 'My Students & Classes', icon: GraduationCap },
        { id: 'attendance', label: 'Attendance Register', icon: UserCheck },
        { id: 'assignments', label: 'Assignments & Work', icon: FileText },
        { id: 'exams-analytics', label: 'Exams & Results Analytics', icon: Award },
      ],
    },
    {
      title: 'APPROVALS & SAFETY',
      items: [
        {
          id: 'student-approvals',
          label: 'Student Approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : undefined,
          badgeColor: 'bg-amber-500 text-white font-bold',
        },
        { id: 'faculty-leaves', label: 'Faculty Leave Applications', icon: HeartHandshake },
        {
          id: 'safety-response',
          label: 'Student Safety Response',
          icon: ShieldAlert,
          badge: activeSosCount > 0 ? `${activeSosCount} Active` : undefined,
          badgeColor: 'bg-rose-500 text-white animate-pulse',
        },
      ],
    },
    {
      title: 'CAMPUS LIFE & SERVICES',
      items: [
        { id: 'announcements', label: 'Announcements & Alerts', icon: Megaphone },
        { id: 'events-updates', label: 'Events & Updates', icon: Sparkles },
        { id: 'canteen', label: 'Canteen & Offers', icon: Coffee },
        { id: 'hostel-transport', label: 'Hostel & Transport', icon: Bus },
        { id: 'payments', label: 'Payment & Transactions', icon: CreditCard },
        { id: 'utilities', label: 'Faculty Utilities', icon: Wrench },
      ],
    },
    {
      title: 'NETWORK & RESEARCH',
      items: [
        { id: 'parent-connect', label: 'Parent Connect', icon: Contact },
        { id: 'connections', label: 'Connections Network', icon: Network },
        { id: 'alumni-connect', label: 'College Alumni Connect', icon: Users },
        { id: 'research', label: 'Research & Collaborations', icon: Compass },
      ],
    },
    {
      title: 'ACCOUNT & SYSTEM',
      items: [
        { id: 'profile', label: 'My Faculty Profile', icon: User },
        { id: 'about-us', label: 'About NEXUS Platform', icon: Info },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-[#0a0d16] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 text-slate-700 dark:text-slate-300 select-none overflow-hidden shrink-0 transition-colors">
      <div className="p-4 space-y-3 overflow-hidden flex flex-col pt-3 flex-1 min-h-0">
        {/* Faculty Profile Badge placed ON VERY TOP OF SIDEBAR */}
        <div
          onClick={() => setActiveTab('profile')}
          className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-purple-500/40 transition-colors"
          title="Click to view full profile"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold font-mono text-xs border border-purple-500/30 shrink-0">
            {facultyName.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden text-left flex-1 min-w-0">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{facultyName}</h4>
            {isClassIncharge === 'Yes' ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-300 font-extrabold flex items-center gap-1 truncate">
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Incharge: {inchargeClass}
              </span>
            ) : (
              <span className="text-[10px] text-purple-600 dark:text-purple-300 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" /> Instructor
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3.5 py-0.5 block">
                {sec.title}
              </span>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as FacultyTabType)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all duration-200 ${
                        isActive
                          ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate min-w-0">
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${item.badgeColor || 'bg-purple-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Action Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Faculty Portal</span>
        </button>
      </div>
    </aside>
  );
};
