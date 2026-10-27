import React, { useState } from 'react';
import axios from 'axios';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './notifications/NotificationBell';
import { CaptainChatbot } from './ai/CaptainChatbot';
import { TimetableConverter } from './academics/TimetableConverter';
import { AcademicsSquareCard } from './academics/AcademicsSquareCard';
import { AttendanceTracker } from './academics/AttendanceTracker';
import { AttendanceSquareCard } from './academics/AttendanceSquareCard';
import { QuickNotesSquareCard } from './academics/QuickNotesSquareCard';
import { AssignmentsAndWork } from './academics/AssignmentsAndWork';
import { AssignmentsSquareCard } from './academics/AssignmentsSquareCard';
import { StudentDocuments } from './academics/StudentDocuments';
import { CanteenAndOffers } from './academics/CanteenAndOffers';
import { CanteenAndOffersSquareCard } from './academics/CanteenAndOffersSquareCard';
import { ResultsAndPerformance } from './academics/ResultsAndPerformance';
import { ResultsAndPerformanceSquareCard } from './academics/ResultsAndPerformanceSquareCard';
import { PaymentAndTransactions } from './academics/PaymentAndTransactions';
import { PaymentAndTransactionsSquareCard } from './academics/PaymentAndTransactionsSquareCard';
import { HostelAndTransport } from './academics/HostelAndTransport';
import { HostelAndTransportSquareCard } from './academics/HostelAndTransportSquareCard';
import { EventsAndUpdates } from './academics/EventsAndUpdates';
import { EventsAndFestsSquareCard } from './academics/EventsAndFestsSquareCard';
import { CampusAnnouncementsSquareCard } from './academics/CampusAnnouncementsSquareCard';
import { StudentSafetyAndVoice } from './academics/StudentSafetyAndVoice';
import { StudentSafetyAndVoiceSquareCard } from './academics/StudentSafetyAndVoiceSquareCard';
import { ConnectionsModule } from './academics/ConnectionsModule';
import { ConnectionsSquareCard } from './academics/ConnectionsSquareCard';
import { StudentUtilities } from './academics/StudentUtilities';
import { StudentProfileView } from './academics/StudentProfileView';
import { AlumniDashboard } from './alumni/AlumniDashboard';
import { AlumniNetworkModule } from './alumni/AlumniNetworkModule';
import { AdminAlumniManagement } from './alumni/AdminAlumniManagement';
import { AdminDashboardStudio } from './admin/AdminDashboardStudio';







import { type UserSession } from '../types/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileCheck,
  CreditCard,
  Home,
  Sparkles,
  Wrench,
  ClipboardList,
  FileText,
  Bell,
  TrendingUp,
  Mail,
  Settings,
  ShieldAlert,
  User,
  Info,
  Building2,
  MapPin,
  Code,
  Globe,
  Edit3,
  Save,
  Camera,
  CheckCircle2,
  Utensils,
  Plus,
} from 'lucide-react';

interface CampusHubProps {
  onShowSplash: () => void;
  session?: UserSession | null;
}

// NEXUS Role-Specific Dashboard Component
export const CampusHub: React.FC<CampusHubProps> = ({ onShowSplash, session }) => {
  const role = session?.role || 'Student';
  const [userName, setUserName] = useState(session?.name || `${role} User`);
  const [userEmail, setUserEmail] = useState(session?.email || `${role.toLowerCase()}@nexus.campus.edu`);
  const [userMobile, setUserMobile] = useState('9876543210');
  const [userDepartment, setUserDepartment] = useState('Computer Science & Engineering');
  const [userAddress, setUserAddress] = useState('Nexus Smart Campus, Block A');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview Dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Dynamic Navigation Items tailored per role + My Profile + About Us
  const getNavItems = () => {
    let roleItems: { name: string; icon: any }[] = [];

    switch (role) {
      case 'Student':
        roleItems = [
          { name: 'Overview Dashboard', icon: LayoutDashboard },
          { name: 'Academics & Timetable', icon: BookOpen },
          { name: 'Attendance Tracker', icon: Calendar },
          { name: 'Assignments & Work', icon: FileCheck },
          { name: 'Alumni Connect', icon: Award },
          { name: 'Events & Updates', icon: Bell },
          { name: 'Student Documents', icon: ShieldCheck },
          { name: 'Exams & Analytics', icon: Award },
          { name: 'Student Utilities', icon: Wrench },
          { name: 'Connections', icon: Users },
          { name: 'Student Safety & Voice', icon: ShieldAlert },
          { name: 'Canteen & Offers', icon: Utensils },
          { name: 'Payment & Transactions', icon: CreditCard },
          { name: 'Hostel & Transport', icon: Home },
        ];
        break;
      case 'Faculty':
        roleItems = [
          { name: 'Overview Dashboard', icon: LayoutDashboard },
          { name: 'Teaching Schedule', icon: Calendar },
          { name: 'Student Attendance', icon: ClipboardList },
          { name: 'Assignments & Grading', icon: FileText },
          { name: 'Alumni Network', icon: Award },
          { name: 'Research & Publications', icon: BookOpen },
          { name: 'AI Question Generator', icon: Sparkles },
          { name: 'Department Notices', icon: Bell },
        ];
        break;
      case 'Parent':
        roleItems = [
          { name: 'Overview Dashboard', icon: LayoutDashboard },
          { name: 'Attendance Tracker', icon: Calendar },
          { name: 'Performance & Grades', icon: TrendingUp },
          { name: 'Fee Dues & Payments', icon: CreditCard },
          { name: 'Campus Announcements', icon: Bell },
          { name: 'Faculty Connect', icon: Mail },
        ];
        break;
      case 'Alumni':
        roleItems = [
          { name: 'Overview Dashboard', icon: LayoutDashboard },
          { name: 'Alumni Network', icon: Users },
          { name: 'Career & Mentorship', icon: Briefcase },
          { name: 'Events & Reunions', icon: Calendar },
        ];
        break;
      case 'Administrator':
        roleItems = [
          { name: 'Overview', icon: LayoutDashboard },
          { name: 'Users & Accounts', icon: Users },
          { name: 'Students', icon: GraduationCap },
          { name: 'Faculty', icon: Briefcase },
          { name: 'Alumni', icon: Award },
          { name: 'Classes & Departments', icon: Building2 },
          { name: 'Academics & Timetable', icon: BookOpen },
          { name: 'Attendance', icon: Calendar },
          { name: 'Assignments & Academics', icon: FileCheck },
          { name: 'Exams & Analytics', icon: Award },
          { name: 'Announcements & Events', icon: Bell },
          { name: 'Safety & Student Voice', icon: ShieldAlert },
          { name: 'Payments & Transactions', icon: CreditCard },
          { name: 'Canteen & Offers', icon: Utensils },
          { name: 'Hostel & Transport', icon: Home },
          { name: 'Documents', icon: ShieldCheck },
          { name: 'Notifications', icon: Bell },
          { name: 'Roles & Permissions', icon: ShieldCheck },
          { name: 'Reports & Analytics', icon: TrendingUp },
          { name: 'Admin Utilities', icon: Wrench },
          { name: 'System Settings', icon: Settings },
        ];
        break;
    }

    return [
      ...roleItems,
      { name: 'My Profile', icon: User },
      { name: 'About Us', icon: Info },
    ];
  };

  const navItems = getNavItems();

  const getRoleIcon = () => {
    switch (role) {
      case 'Student':
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'Faculty':
        return <Briefcase className="w-5 h-5 text-purple-400" />;
      case 'Parent':
        return <Users className="w-5 h-5 text-emerald-400" />;
      case 'Alumni':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'Administrator':
        return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/update-profile', {
        role,
        identifier: userName || userEmail,
        fullName: userName,
        email: userEmail,
        mobile: userMobile,
        department: userDepartment,
        address: userAddress,
        photoUrl: photoPreview,
      });

      const updatedSession = {
        id: session?.id || 'USER-1',
        name: userName,
        email: userEmail,
        role,
      };
      sessionStorage.setItem('nexus_session', JSON.stringify(updatedSession));

      setIsEditingProfile(false);
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile in MySQL:', err);
      setIsEditingProfile(false);
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    }
  };

  // 9 Square Cards for Overview Dashboard (3 in each line)
  const overviewSquareCards = [
    { title: 'Academics & Timetable', category: 'Class Schedule', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
    { title: 'Attendance Tracker', category: 'Academic Record', icon: ClipboardList, color: 'from-amber-500 to-orange-500' },
    { title: 'Quick Notes & Student Utilities', category: 'AI Toolbox, Self Testing & Notes', icon: Wrench, color: 'from-purple-500 to-pink-500' },
    { title: 'Assignments & Work', category: 'Submissions', icon: FileCheck, color: 'from-rose-500 to-red-500' },
    { title: 'Canteen & Offers', category: 'Campus Food & Dining', icon: Utensils, color: 'from-amber-500 to-orange-500' },
    { title: 'Exams & Analytics', category: 'Marks & Analytics', icon: Award, color: 'from-purple-500 to-indigo-500' },
    { title: 'Events & Fests', category: 'Campus Activities', icon: Calendar, color: 'from-indigo-500 to-purple-500' },
    { title: 'Campus Announcements', category: 'Notice Board', icon: Bell, color: 'from-cyan-500 to-blue-500' },
    { title: 'Payment & Transactions', category: 'Razorpay & Wallet Billing', icon: CreditCard, color: 'from-violet-500 to-indigo-500' },
    { title: 'Hostel & Transport', category: 'Rooms & Transport', icon: Home, color: 'from-sky-500 to-indigo-500' },
    { title: 'Student Safety & Voice', category: 'Grievance & SOS Protection', icon: ShieldAlert, color: 'from-rose-600 to-red-600' },
    { title: 'Connections', category: 'Campus Social Network', icon: Users, color: 'from-indigo-600 to-purple-600' },
  ];



  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-[#090714] text-slate-900 dark:text-slate-100 transition-colors duration-500 flex flex-col overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-[61px] shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              {getRoleIcon()}
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                NEXUS <span className="text-indigo-600 dark:text-purple-400">{role} Portal</span>
              </h2>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE HEADER ACTION CONTROLS */}
        <div className="flex items-center gap-3">
          <NotificationBell variant="circular" />
          <ThemeToggle variant="circular" />
          <CaptainChatbot session={session} variant="header" />
        </div>
      </header>

      {/* Main Viewport Container */}
      <div className="flex-1 h-[calc(100vh-61px)] flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <motion.aside
          animate={{ width: isSidebarOpen ? 260 : 80 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden md:flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm shrink-0 z-20 overflow-hidden"
        >
          <div className="p-3 space-y-1 overflow-y-auto flex-1 h-full scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </button>
              );
            })}
          </div>
        </motion.aside>

        {/* MOBILE SIDEBAR DRAWER OVERLAY */}
        <AnimatePresence>
          {isMobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3 }}
                className="relative z-50 w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    {role} Dashboard Menu
                  </span>
                  <button onClick={() => setIsMobileOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1 overflow-y-auto flex-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setActiveTab(item.name);
                          setIsMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN SCROLLABLE DASHBOARD CONTENT AREA */}
        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
          {/* ADMIN COMMAND CENTER ROUTING */}
          {role === 'Administrator' && activeTab !== 'My Profile' && activeTab !== 'About Us' ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <AdminDashboardStudio session={session} activeNavTab={activeTab} onNavigateTab={(tab) => setActiveTab(tab)} />
            </motion.div>
          ) : role === 'Alumni' && activeTab !== 'My Profile' && activeTab !== 'About Us' ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <AlumniDashboard user={session} />
            </motion.div>
          ) : (activeTab === 'Alumni Connect' || activeTab === 'Alumni Network') ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <AlumniNetworkModule userRole={role as any} currentUser={session} />
            </motion.div>
          ) : activeTab === 'Alumni Management' ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <AdminAlumniManagement />
            </motion.div>
          ) : (activeTab === 'Academics & Timetable' || activeTab === 'Teaching Schedule') ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <TimetableConverter />
            </motion.div>
          ) : (activeTab === 'Attendance Tracker' || activeTab === 'Student Attendance') ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <AttendanceTracker session={session} />
            </motion.div>
          ) : (activeTab === 'Overview Dashboard' || activeTab === 'System Dashboard') ? (

            /* TAB 2: OVERVIEW DASHBOARD (9 SQUARE CARDS - 3 IN EACH ROW) */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-indigo-500" />
                    Overview Dashboard
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live Campus Overview • 9 Empty Square Modules Ready for Content
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {overviewSquareCards.map((card, idx) => {
                  const Icon = card.icon;
                  const isAcademicsCard = card.title === 'Academics & Timetable';

                  if (isAcademicsCard) {
                    let userTimetable = [];
                    try {
                      const raw = localStorage.getItem('nexus_user_timetable');
                      if (raw) userTimetable = JSON.parse(raw);
                    } catch (e) {
                      userTimetable = [];
                    }

                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 dark:hover:border-purple-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <AcademicsSquareCard
                          timetable={userTimetable}
                          onOpenFullTimetable={() => setActiveTab('Academics & Timetable')}
                        />
                      </motion.div>
                    );
                  }

                  const isAttendanceCard = card.title === 'Attendance Tracker' || idx === 1;
                  if (isAttendanceCard) {
                    return (
                      <motion.div
                        key="AttendanceSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 dark:hover:border-purple-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <AttendanceSquareCard
                          onNavigateToAttendance={() => setActiveTab('Attendance Tracker')}
                        />
                      </motion.div>
                    );
                  }

                  const isNotesCard = idx === 2 || card.title.includes('Notes') || card.title.includes('Utilities');
                  if (isNotesCard) {
                    return (
                      <motion.div
                        key="QuickNotesSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-purple-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <QuickNotesSquareCard
                          onNavigateToUtilities={() => setActiveTab('Student Utilities')}
                        />
                      </motion.div>
                    );
                  }

                  const isAssignmentsCard = idx === 3 || card.title.includes('Assignments');

                  if (isAssignmentsCard) {
                    return (
                      <motion.div
                        key="AssignmentsSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-rose-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <AssignmentsSquareCard
                          onNavigateToAssignments={() => setActiveTab('Assignments & Work')}
                        />
                      </motion.div>
                    );
                  }

                  const isCanteenCard = card.title === 'Canteen & Offers';

                  if (isCanteenCard) {
                    return (
                      <motion.div
                        key="CanteenAndOffersSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-amber-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <CanteenAndOffersSquareCard
                          onNavigateToCanteen={() => setActiveTab('Canteen & Offers')}
                        />
                      </motion.div>
                    );
                  }

                  const isResultsCard = card.title === 'Results & Performance';

                  if (isResultsCard) {
                    return (
                      <motion.div
                        key="ResultsAndPerformanceSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-purple-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <ResultsAndPerformanceSquareCard
                          onNavigateToResults={() => setActiveTab('Results & Performance')}
                        />
                      </motion.div>
                    );
                  }

                  const isPaymentsCard = card.title === 'Payment & Transactions' || card.title === 'Fee Payment & Dues';

                  if (isPaymentsCard) {
                    return (
                      <motion.div
                        key="PaymentAndTransactionsSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-violet-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <PaymentAndTransactionsSquareCard
                          onNavigateToPayments={() => setActiveTab('Payment & Transactions')}
                        />
                      </motion.div>
                    );
                  }

                  const isHostelCard = card.title === 'Hostel & Transport';

                  if (isHostelCard) {
                    return (
                      <motion.div
                        key="HostelAndTransportSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-sky-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <HostelAndTransportSquareCard
                          onNavigateToHostel={() => setActiveTab('Hostel & Transport')}
                        />
                      </motion.div>
                    );
                  }

                  const isEventsFestCard = card.title === 'Events & Fests' || card.title.includes('Events');

                  if (isEventsFestCard) {
                    return (
                      <motion.div
                        key="EventsAndFestsSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <EventsAndFestsSquareCard
                          onNavigateToEvents={() => setActiveTab('Events & Updates')}
                        />
                      </motion.div>
                    );
                  }

                  const isAnnouncementsCard = card.title === 'Campus Announcements' || card.title.includes('Announcements');

                  if (isAnnouncementsCard) {
                    return (
                      <motion.div
                        key="CampusAnnouncementsSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-amber-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <CampusAnnouncementsSquareCard
                          onNavigateToAnnouncements={() => setActiveTab('Events & Updates')}
                        />
                      </motion.div>
                    );
                  }

                  const isSafetyCard = card.title === 'Student Safety & Voice' || card.title.includes('Safety');

                  if (isSafetyCard) {
                    return (
                      <motion.div
                        key="StudentSafetyAndVoiceSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-rose-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <StudentSafetyAndVoiceSquareCard
                          onNavigateToSafety={() => setActiveTab('Student Safety & Voice')}
                        />
                      </motion.div>
                    );
                  }

                  const isConnectionsCard = card.title === 'Connections';

                  if (isConnectionsCard) {
                    return (
                      <motion.div
                        key="ConnectionsSquareCard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 flex flex-col justify-between relative overflow-hidden transition-all group"
                      >
                        <ConnectionsSquareCard
                          onNavigateToConnections={() => setActiveTab('Connections')}
                        />
                      </motion.div>
                    );
                  }





                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => {
                        if (card.title.includes('Academics')) {
                          setActiveTab('Academics & Timetable');
                        } else if (card.title.includes('Assignments')) {
                          setActiveTab('Assignments & Work');
                        } else if (card.title.includes('Attendance')) {
                          setActiveTab('Attendance Tracker');
                        }
                      }}

                      className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 dark:hover:border-purple-500/50 p-6 flex flex-col justify-between relative overflow-hidden transition-all group cursor-pointer"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none`} />

                      <div className="flex items-center justify-between z-10">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-lg shadow-indigo-500/20`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Module {idx + 1}
                        </span>
                      </div>

                      <div className="flex-1 my-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center p-4 text-center z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-1">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          Empty Module Workspace
                        </span>
                      </div>

                      <div className="z-10">
                        <h4 className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-purple-400 transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {card.category}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </motion.div>
          ) : activeTab === 'My Profile' ? (
            /* TAB 3: MY PROFILE VIEW */
            role === 'Student' ? (
              <StudentProfileView session={session} onLogout={onShowSplash} />
            ) : (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
                {profileSavedMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Profile details updated successfully!</span>
                  </div>
                )}

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-indigo-500/25 overflow-hidden border-2 border-indigo-200 dark:border-indigo-800">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          userName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <label className="absolute inset-0 bg-slate-950/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-purple-950/60 border border-indigo-200 dark:border-purple-800/60 text-indigo-700 dark:text-purple-300 text-xs font-semibold">
                        {getRoleIcon()}
                        <span>{role} Account</span>
                      </div>
                      <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">{userName}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-purple-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </button>

                    <button
                      onClick={onShowSplash}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500">Edit Profile Details (Saves to MySQL)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                        <input
                          type="text"
                          value={userMobile}
                          onChange={(e) => setUserMobile(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                        <input
                          type="text"
                          value={userDepartment}
                          onChange={(e) => setUserDepartment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                        <textarea
                          rows={2}
                          value={userAddress}
                          onChange={(e) => setUserAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save & Update Profile to MySQL</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <User className="w-5 h-5 text-indigo-500 shrink-0" />
                      <div>
                        <span className="text-[11px] text-slate-400 block">Full Name</span>
                        <strong className="text-slate-900 dark:text-white text-sm">{userName}</strong>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-500 shrink-0" />
                      <div>
                        <span className="text-[11px] text-slate-400 block">Registered Email</span>
                        <strong className="text-slate-900 dark:text-white text-sm">{userEmail}</strong>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-[11px] text-slate-400 block">Department / Organization</span>
                        <strong className="text-slate-900 dark:text-white text-sm">{userDepartment}</strong>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-[11px] text-slate-400 block">Residential Address</span>
                        <strong className="text-slate-900 dark:text-white text-sm">{userAddress}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            )
          ) : activeTab === 'Assignments & Work' || activeTab === 'Assignments & Grading' ? (
            /* TAB: ASSIGNMENTS & WORK VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <AssignmentsAndWork
                className={(session as any)?.userClass || (session as any)?.class_name || (session as any)?.className || 'B.TECH CSE 2023 A'}
                studentEmail={session?.email || 'ketan@gmail.com'}
                rollNumber={(session as any)?.rollNumber || '2329362'}
                studentName={session?.name || 'Ketan Channa'}
              />
            </motion.div>
          ) : activeTab === 'Events & Updates' || activeTab === 'Campus Announcements & Events' || activeTab === 'Campus Announcements' ? (
            /* TAB: EVENTS & UPDATES VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <EventsAndUpdates />
            </motion.div>
          ) : activeTab === 'Student Documents' ? (
            /* TAB: STUDENT DOCUMENTS & DIGITAL ID CARD STUDIO VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <StudentDocuments session={session} />
            </motion.div>
          ) : activeTab === 'Student Safety & Voice' ? (
            /* TAB: STUDENT SAFETY & VOICE VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <StudentSafetyAndVoice session={session} />
            </motion.div>
          ) : activeTab === 'Connections' ? (
            /* TAB: CONNECTIONS STUDENT NETWORK VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <ConnectionsModule session={session} />
            </motion.div>
          ) : activeTab === 'Student Utilities' ? (
            /* TAB: STUDENT UTILITIES TOOLBOX VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <StudentUtilities session={session} />
            </motion.div>
          ) : activeTab === 'Exams & Analytics' || activeTab === 'Results & AI Career Studio' || activeTab === 'Results & Performance' || activeTab === 'AI Career & Resume ATS' || activeTab === 'Performance & Grades' ? (
            /* TAB: EXAMS & ANALYTICS VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <ResultsAndPerformance session={session} />
            </motion.div>
          ) : activeTab === 'Canteen & Offers' ? (
            /* TAB: CANTEEN & OFFERS PORTAL VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <CanteenAndOffers session={session} />
            </motion.div>
          ) : activeTab === 'Payment & Transactions' || activeTab === 'Fee Payment (Razorpay)' ? (
            /* TAB: PAYMENT & TRANSACTIONS HUB VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <PaymentAndTransactions session={session} />
            </motion.div>
          ) : activeTab === 'Hostel & Transport' ? (
            /* TAB: HOSTEL & TRANSPORT HUB VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <HostelAndTransport session={session} />
            </motion.div>
          ) : activeTab === 'About Us' ? (


            /* TAB 4: ABOUT US VIEW */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/25 mb-3">
                    <GraduationCap className="w-9 h-9 text-white" />
                  </div>
                  <h2 className="font-display font-black text-3xl text-slate-900 dark:text-white">
                    NEXUS <span className="text-indigo-600 dark:text-purple-400">SMART CAMPUS PLATFORM</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Next-Generation Modular & Component-Based Full-Stack Web Application for Modern Educational Ecosystems.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg space-y-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    Lead Architects & Developers
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl">
                    Designed and Developed by Ketan Channa and Nitin Kumar
                  </h3>
                  <p className="text-xs text-indigo-100 max-w-md mx-auto opacity-90">
                    Engineered with passion for high performance, rich glassmorphism aesthetics, dynamic dark/light theme switching, and seamless MySQL database integration.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <Code className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Frontend Stack</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">React.js • TypeScript • Tailwind CSS • Framer Motion • Material Symbols</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <Globe className="w-5 h-5 text-purple-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Backend & Database</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Node.js • Express REST APIs • MySQL 8.0 • JWT Auth • Razorpay Gateway</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">AI Services</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">FastAPI Microservice • Google Gemini API • PyPDF2 Resume ATS Score Engine</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* DEFAULT DASHBOARD PLACEHOLDER FOR OTHER SPECIFIC MENU ITEMS */
            <div className="w-full min-h-[65vh] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center mb-4">
                {getRoleIcon()}
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                {activeTab}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Active Portal: <span className="font-semibold text-slate-700 dark:text-slate-300">{role} ({userName})</span>. Content for <strong className="text-indigo-600 dark:text-purple-400">{activeTab}</strong> will be built here step-by-step.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
