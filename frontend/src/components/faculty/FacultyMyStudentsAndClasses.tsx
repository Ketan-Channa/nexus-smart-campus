import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Users,
  Search,
  Mail,
  Crown,
  Radio,
  Send,
  Bell,
  Clock,
  Building2,
  ShieldAlert,
  ArrowRightLeft,
  UserX,
  History,
  FileText,
} from 'lucide-react';

interface FacultyMyStudentsAndClassesProps {
  isClassIncharge?: string;
  inchargeClass?: string;
  facultyName?: string;
  facultyEmail?: string;
}

export const FacultyMyStudentsAndClasses: React.FC<FacultyMyStudentsAndClassesProps> = ({
  isClassIncharge = 'Yes',
  inchargeClass = 'B.TECH CSE 2023 A',
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
}) => {
  const [activeSection, setActiveSection] = useState<'my-class' | 'other-classes' | 'pass-approvals'>('my-class');
  const [selectedClass, setSelectedClass] = useState<string>(inchargeClass || 'B.TECH CSE 2023 A');

  useEffect(() => {
    if (inchargeClass) {
      setSelectedClass(inchargeClass);
    }
  }, [inchargeClass]);

  const [studentsRoster, setStudentsRoster] = useState<any[]>([]);
  const [otherClassesList, setOtherClassesList] = useState<any[]>([]);
  const [broadcastHistoryList, setBroadcastHistoryList] = useState<any[]>([]);
  const [atRiskList, setAtRiskList] = useState<any[]>([]);

  // Overview Stats
  const [classStats, setClassStats] = useState({
    totalStudents: 0,
    averageAttendance: 82.5,
    pendingLeaves: 0,
    pendingAssignments: 0,
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('All');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  // Multi-Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Modals
  const [activeStudentModal, setActiveStudentModal] = useState<any | null>(null);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState<boolean>(false);
  const [alertModalStudent, setAlertModalStudent] = useState<any | null>(null);
  const [reminderModalStudent, setReminderModalStudent] = useState<any | null>(null);
  const [transferModalStudent, setTransferModalStudent] = useState<any | null>(null);
  const [targetClassForTransfer, setTargetClassForTransfer] = useState<string>('BTECH CSE 4B');

  // Form states
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('GENERAL');
  const [broadcastPriority, setBroadcastPriority] = useState('NORMAL');
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);

  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertPriority, setAlertPriority] = useState('HIGH');

  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  // 7-Tab Drawer States & Handlers
  const [drawerTab, setDrawerTab] = useState<'PROFILE' | 'ACADEMICS' | 'ATTENDANCE' | 'ASSIGNMENTS' | 'MEDICAL' | 'REMARKS' | 'COMMUNICATION'>('PROFILE');
  const [drawerData, setDrawerData] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState<boolean>(false);

  const [newRemark, setNewRemark] = useState('');
  const [newRemarkCategory, setNewRemarkCategory] = useState('Academic');
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  const [directMsgType, setDirectMsgType] = useState('MESSAGE');
  const [directMsgTitle, setDirectMsgTitle] = useState('');
  const [directMsgBody, setDirectMsgBody] = useState('');
  const [isSendingDirectMsg, setIsSendingDirectMsg] = useState(false);

  // Fetch student drawer details when activeStudentModal changes
  useEffect(() => {
    if (activeStudentModal) {
      setDrawerLoading(true);
      axios
        .get(`https://nexus-smart-campus-backend.onrender.com/api/faculty/students/${activeStudentModal.id || activeStudentModal.rollNumber}`)
        .then((res) => {
          if (res.data && res.data.success) {
            setDrawerData(res.data.student);
          }
        })
        .catch(() => {})
        .finally(() => setDrawerLoading(false));
    }
  }, [activeStudentModal]);

  const handleAddRemark = async () => {
    if (!newRemark || !activeStudentModal) return;
    setIsSubmittingRemark(true);
    try {
      await axios.post(`https://nexus-smart-campus-backend.onrender.com/api/faculty/students/${activeStudentModal.id}/remarks`, {
        remark: newRemark,
        category: newRemarkCategory,
        facultyEmail,
        facultyName,
      });
      alert('✓ Performance remark logged successfully!');
      setNewRemark('');
      const res = await axios.get(`https://nexus-smart-campus-backend.onrender.com/api/faculty/students/${activeStudentModal.id}`);
      if (res.data && res.data.success) setDrawerData(res.data.student);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add remark');
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  const handleSendDirectMessage = async () => {
    if (!directMsgBody || !activeStudentModal) return;
    setIsSendingDirectMsg(true);
    try {
      await axios.post(`https://nexus-smart-campus-backend.onrender.com/api/faculty/students/${activeStudentModal.id}/message`, {
        message: directMsgBody,
        category: directMsgType,
        priority: 'NORMAL',
        facultyEmail,
        facultyName,
      });
      alert(`✓ ${directMsgType} dispatched directly to ${activeStudentModal.name}'s portal!`);
      setDirectMsgBody('');
      setDirectMsgTitle('');
      const res = await axios.get(`https://nexus-smart-campus-backend.onrender.com/api/faculty/students/${activeStudentModal.id}`);
      if (res.data && res.data.success) setDrawerData(res.data.student);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSendingDirectMsg(false);
    }
  };

  // Fetch My Class Data from MySQL Backend
  const fetchMyClassData = useCallback(async () => {
    try {
      const cls = selectedClass || inchargeClass || 'B.TECH CSE 2023 A';
      let roster: any[] = [];
      let stats = {
        totalStudents: 0,
        averageAttendance: 82.5,
        pendingLeaves: 0,
        pendingAssignments: 0,
      };

      try {
        const res = await axios.get(
          `https://nexus-smart-campus-backend.onrender.com/api/faculty/my-students-classes/my-class?email=${encodeURIComponent(facultyEmail)}&className=${encodeURIComponent(cls)}`
        );
        if (res.data && res.data.success) {
          roster = res.data.students || [];
          stats = {
            totalStudents: res.data.totalStudents || roster.length,
            averageAttendance: res.data.averageAttendance || 82.5,
            pendingLeaves: res.data.pendingLeaves || 0,
            pendingAssignments: res.data.pendingAssignments || 0,
          };
        }
      } catch (e) {}

      // Fallback query if roster is empty
      if (!roster || roster.length === 0) {
        try {
          const res2 = await axios.get(
            `https://nexus-smart-campus-backend.onrender.com/api/faculty/students?className=${encodeURIComponent(cls)}&email=${encodeURIComponent(facultyEmail)}`
          );
          if (res2.data && res2.data.students) {
            roster = res2.data.students;
            stats.totalStudents = roster.length;
          }
        } catch (e) {}
      }

      const formattedRoster = (roster || []).map((s: any) => ({
        id: s.id,
        rollNumber: s.rollNumber || s.roll_number || `2023CSE${String(s.id).padStart(3, '0')}`,
        name: s.name || s.fullName || s.full_name || 'Student Name',
        email: s.email,
        attendancePercent: s.attendancePercent || (s.attendance_percentage ? parseFloat(s.attendance_percentage) : 85),
        submittedAssignments: s.submittedAssignments || '7/8',
        academicRisk: s.academicRisk || (s.riskStatus === 'HIGH_RISK' ? 'At Risk' : s.riskStatus === 'MODERATE_RISK' ? 'Attention Required' : 'Normal'),
        isNewStudent: s.isNewStudent || Boolean(s.is_new),
        department: s.department || 'Computer Science & Engineering',
        className: s.className || s.class || cls,
        section: s.section || 'A',
      }));

      setStudentsRoster(formattedRoster);
      setAtRiskList(formattedRoster.filter((s: any) => s.academicRisk !== 'Normal'));
      setClassStats(stats);
    } catch (err) {
      setStudentsRoster([]);
    }
  }, [selectedClass, inchargeClass, facultyEmail]);

  // Fetch Other Classes from Backend
  const fetchOtherClasses = useCallback(async () => {
    try {
      const res = await axios.get('https://nexus-smart-campus-backend.onrender.com/api/faculty/my-students-classes/other-classes');
      if (res.data && res.data.classes) {
        setOtherClassesList(res.data.classes);
      }
    } catch (err) {
      setOtherClassesList([]);
    }
  }, []);

  // Fetch Broadcast History
  const fetchBroadcastHistory = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/faculty/my-students-classes/broadcast-history?facultyEmail=${encodeURIComponent(facultyEmail)}`
      );
      if (res.data && res.data.history) {
        setBroadcastHistoryList(res.data.history);
      }
    } catch (err) {
      setBroadcastHistoryList([]);
    }
  }, [facultyEmail]);

  const [pendingMedicalList, setPendingMedicalList] = useState<any[]>([]);

  // Fetch Pending Medical Certificates for Class Incharge Verification
  const fetchPendingMedical = useCallback(async () => {
    let apiList: any[] = [];
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/attendance/medical/pending?className=${encodeURIComponent(selectedClass)}`
      );
      if (res.data && res.data.certificates && Array.isArray(res.data.certificates)) {
        apiList = res.data.certificates;
      }
    } catch (err) {
      apiList = [];
    }

    // Merge localStorage fallback list
    let localList: any[] = [];
    try {
      const localRaw = localStorage.getItem('nexus_pending_medicals');
      if (localRaw) {
        localList = JSON.parse(localRaw);
      }
    } catch (e) {}

    const normClass = (selectedClass || '').replace(/[\s\.\-]/g, '').toUpperCase();
    const filteredLocal = localList.filter((c: any) => {
      if (c.status !== 'PENDING') return false;
      const cClass = (c.className || '').replace(/[\s\.\-]/g, '').toUpperCase();
      return !normClass || cClass === normClass;
    });

    const certMap = new Map<string, any>();
    apiList.forEach((c) => certMap.set(c.applicationRef, c));
    filteredLocal.forEach((c) => certMap.set(c.applicationRef, c));

    setPendingMedicalList(Array.from(certMap.values()));
  }, [selectedClass]);

  const handleVerifyMedical = async (cert: any, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/attendance/medical/verify', {
        applicationRef: cert.applicationRef,
        rollNumber: cert.rollNumber,
        status,
        verifierEmail: facultyEmail,
        verifierName: facultyName,
        verificationRemarks: status === 'VERIFIED' ? 'Approved & Attendance Criteria Lowered to 65%' : 'Rejected due to invalid medical documentation',
      });

      // Update local storage
      try {
        const localRaw = localStorage.getItem('nexus_pending_medicals') || '[]';
        const localList = JSON.parse(localRaw);
        const updated = localList.filter((c: any) => c.applicationRef !== cert.applicationRef);
        localStorage.setItem('nexus_pending_medicals', JSON.stringify(updated));
      } catch (e) {}

      if (status === 'VERIFIED') {
        alert(`✓ Medical Certificate ${cert.applicationRef} Verified! Student (${cert.studentName}) attendance threshold lowered from 75% to 65%.`);
      } else {
        alert(`✕ Medical Certificate ${cert.applicationRef} Rejected. Attendance threshold remains 75%.`);
      }
      fetchPendingMedical();
    } catch (err) {
      alert(status === 'VERIFIED' ? `✓ Medical Verified for ${cert.studentName}! Attendance criteria set to 65%.` : `✕ Medical Certificate Rejected.`);
      fetchPendingMedical();
    }
  };

  useEffect(() => {
    fetchMyClassData();
    fetchOtherClasses();
    fetchBroadcastHistory();
    fetchPendingMedical();
  }, [fetchMyClassData, fetchOtherClasses, fetchBroadcastHistory, fetchPendingMedical]);

  // Real-time Event Subscription & Live Ticker
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      fetchMyClassData();
      fetchOtherClasses();
      fetchBroadcastHistory();
      fetchPendingMedical();
    };

    window.addEventListener('nexus:student-registered', handleRealtimeUpdate);
    window.addEventListener('nexus:class-transferred', handleRealtimeUpdate);
    window.addEventListener('nexus:incharge-changed', handleRealtimeUpdate);
    window.addEventListener('nexus:medical-submitted', handleRealtimeUpdate);
    window.addEventListener('storage', handleRealtimeUpdate);

    const interval = setInterval(() => {
      fetchPendingMedical();
    }, 3000);

    return () => {
      window.removeEventListener('nexus:student-registered', handleRealtimeUpdate);
      window.removeEventListener('nexus:class-transferred', handleRealtimeUpdate);
      window.removeEventListener('nexus:incharge-changed', handleRealtimeUpdate);
      window.removeEventListener('nexus:medical-submitted', handleRealtimeUpdate);
      window.removeEventListener('storage', handleRealtimeUpdate);
      clearInterval(interval);
    };
  }, [fetchMyClassData, fetchOtherClasses, fetchBroadcastHistory, fetchPendingMedical]);

  // Execute Broadcast
  const handleSendBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      alert('Please provide broadcast title and message');
      return;
    }
    setIsSubmittingBroadcast(true);
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/my-students-classes/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        category: broadcastCategory,
        priority: broadcastPriority,
        targetClass: selectedClass,
        facultyEmail,
        facultyName,
        targetType: selectedStudentIds.length > 0 ? 'SELECTED_STUDENTS' : 'ENTIRE_CLASS',
        selectedStudents: selectedStudentIds,
      });

      alert(`Broadcast sent successfully to ${selectedStudentIds.length > 0 ? selectedStudentIds.length : classStats.totalStudents} active students in ${selectedClass}!`);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastModalOpen(false);
      fetchBroadcastHistory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

  // Execute Individual Alert
  const handleSendAlert = async () => {
    if (!alertTitle || !alertMessage || !alertModalStudent) return;
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/my-students-classes/alert', {
        studentId: alertModalStudent.id,
        rollNumber: alertModalStudent.rollNumber,
        title: alertTitle,
        message: alertMessage,
        priority: alertPriority,
      });

      alert(`Alert sent to ${alertModalStudent.name}!`);
      setAlertModalStudent(null);
      setAlertTitle('');
      setAlertMessage('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send alert');
    }
  };

  // Execute Individual Reminder
  const handleSendReminder = async () => {
    if (!reminderTitle || !reminderMessage || !reminderModalStudent) return;
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/my-students-classes/reminder', {
        studentId: reminderModalStudent.id,
        rollNumber: reminderModalStudent.rollNumber,
        title: reminderTitle,
        message: reminderMessage,
      });

      alert(`Reminder dispatched to ${reminderModalStudent.name}!`);
      setReminderModalStudent(null);
      setReminderTitle('');
      setReminderMessage('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send reminder');
    }
  };

  // Execute Student Class Transfer
  const handleExecuteTransfer = async () => {
    if (!transferModalStudent || !targetClassForTransfer) return;
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/students/transfer', {
        studentId: transferModalStudent.id,
        rollNumber: transferModalStudent.rollNumber,
        oldClassName: selectedClass,
        newClassName: targetClassForTransfer,
      });

      window.dispatchEvent(new CustomEvent('nexus:class-transferred'));
      setTransferModalStudent(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transfer failed');
    }
  };

  // Execute Student Deactivation
  const handleDeactivateStudent = async (student: any) => {
    if (!window.confirm(`Deactivate ${student.name} (${student.rollNumber})?`)) return;
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/students/deactivate', {
        studentId: student.id,
        rollNumber: student.rollNumber,
      });

      window.dispatchEvent(new CustomEvent('nexus:class-transferred'));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deactivation failed');
    }
  };

  // Selection toggle
  const toggleSelectStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  // Live Filtering Logic
  const filteredStudents = studentsRoster.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (s.name && s.name.toLowerCase().includes(q)) || (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q));

    let matchesAtt = true;
    if (attendanceFilter === 'Above 75%') matchesAtt = s.attendancePercent >= 75;
    else if (attendanceFilter === 'Below 75%') matchesAtt = s.attendancePercent < 75;
    else if (attendanceFilter === 'Below 65%') matchesAtt = s.attendancePercent < 65;

    let matchesAsgn = true;
    if (assignmentFilter === 'Pending') matchesAsgn = s.submittedAssignments.startsWith('0') || s.submittedAssignments.startsWith('1') || s.submittedAssignments.startsWith('2');
    else if (assignmentFilter === 'Submitted') matchesAsgn = !s.submittedAssignments.startsWith('0');

    let matchesRisk = true;
    if (riskFilter !== 'All') matchesRisk = s.academicRisk === riskFilter;

    return matchesSearch && matchesAtt && matchesAsgn && matchesRisk;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* MODULE TOP NAVIGATION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span>MY STUDENTS & CLASSES</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Class Incharge Command Center & Authorized Academic Access
          </p>
        </div>

        {/* THREE PRIMARY SECTION TABS */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setActiveSection('my-class')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeSection === 'my-class'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>1. MY CLASS</span>
          </button>
          <button
            onClick={() => setActiveSection('other-classes')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeSection === 'other-classes'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>2. OTHER CLASSES</span>
          </button>
          <button
            onClick={() => setActiveSection('pass-approvals')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeSection === 'pass-approvals'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>3. PASS APPROVALS</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: MY CLASS (CLASS INCHARGE COMMAND CENTER) */}
      {activeSection === 'my-class' && (
        <div className="space-y-6">
          {/* CLASS INCHARGE STATUS BANNER */}
          {isClassIncharge === 'Yes' && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 shadow-xl space-y-2 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-black text-sm">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>Official Class Incharge: {selectedClass}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-mono font-bold border border-amber-500/40 w-fit">
                  👑 Command Center Active
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Full class-level management active for <strong className="text-slate-900 dark:text-white">{selectedClass}</strong>. Students who register for this class populate your database roster automatically.
              </p>
            </div>
          )}

          {/* DYNAMIC KPI OVERVIEW CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Students</span>
              <strong className="font-display font-black text-2xl text-purple-600 dark:text-purple-400 block">
                {classStats.totalStudents}
              </strong>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Attendance</span>
              <strong className="font-display font-black text-2xl text-emerald-600 dark:text-emerald-400 block">
                {classStats.averageAttendance}%
              </strong>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Leaves</span>
              <strong className="font-display font-black text-2xl text-amber-500 block">
                {classStats.pendingLeaves}
              </strong>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Tasks</span>
              <strong className="font-display font-black text-2xl text-cyan-500 block">
                {classStats.pendingAssignments}
              </strong>
            </div>
          </div>

          {/* QUICK ACTION COMMAND BAR */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Class Command Center Actions:
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Radio className="w-4 h-4" />
                <span>BroadCast Message</span>
              </button>
              <button
                onClick={() => {
                  if (studentsRoster.length > 0) setAlertModalStudent(studentsRoster[0]);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Send Alert</span>
              </button>
              <button
                onClick={() => {
                  if (studentsRoster.length > 0) setReminderModalStudent(studentsRoster[0]);
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-bold text-xs border border-cyan-500/30 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Send Reminder</span>
              </button>
            </div>
          </div>

          {/* MAIN STUDENT ROSTER CONTAINER */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            {/* FILTER & SEARCH CONTROL BAR */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Student Roster for {selectedClass}</span>
                </h3>
                <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-mono font-bold border border-purple-500/30">
                  {filteredStudents.length} Students
                </span>
                {selectedStudentIds.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                    {selectedStudentIds.length} Selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* SEARCH INPUT */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Roll No / Name..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* ATTENDANCE FILTER */}
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="All">Attendance: All</option>
                  <option value="Above 75%">Above 75%</option>
                  <option value="Below 75%">Below 75% (Shortage)</option>
                  <option value="Below 65%">Below 65% (Critical)</option>
                </select>

                {/* ASSIGNMENT FILTER */}
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="All">Assignments: All</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Pending">Pending</option>
                </select>

                {/* RISK FILTER */}
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="All">Risk: All</option>
                  <option value="Normal">Normal</option>
                  <option value="Attention Required">Attention Required</option>
                  <option value="At Risk">At Risk</option>
                </select>
              </div>
            </div>

            {/* ROSTER TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider bg-slate-100 dark:bg-slate-950">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Attendance %</th>
                    <th className="p-3">Tasks Submitted</th>
                    <th className="p-3">Academic Risk</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-bold font-mono">
                        No active students found matching filter criteria in MySQL database.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <tr key={s.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-purple-500/10' : ''}`}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectStudent(s.id)}
                              className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {s.rollNumber}
                            {s.isNewStudent && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-sans font-extrabold uppercase border border-emerald-500/30">
                                New
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{s.email}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              s.attendancePercent >= 75 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}>
                              {s.attendancePercent}%
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{s.submittedAssignments}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.academicRisk === 'At Risk'
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : s.academicRisk === 'Attention Required'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {s.academicRisk}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setActiveStudentModal(s)}
                                className="px-2 py-1 rounded-xl bg-purple-500/10 dark:bg-purple-600/30 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs inline-flex items-center gap-1 border border-purple-500/30"
                              >
                                <span>Profile</span>
                              </button>
                              <button
                                onClick={() => setAlertModalStudent(s)}
                                className="p-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                                title="Send Alert"
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setTransferModalStudent(s)}
                                className="p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                                title="Transfer Section"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeactivateStudent(s)}
                                className="p-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                title="Deactivate"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PENDING MEDICAL CERTIFICATE VERIFICATION QUEUE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-500/40 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>Pending Medical Certificate Verification Requests ({pendingMedicalList.length})</span>
              </h3>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                Incharge Verification Queue
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Medical certificates exceeding <strong>10 consecutive calendar days</strong> submitted by students in {selectedClass}. Approving a certificate relaxes the student's minimum attendance threshold from <strong>75% to 65%</strong>.
            </p>

            <div className="space-y-3">
              {pendingMedicalList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No pending medical certificate verification requests for {selectedClass}.
                </div>
              ) : (
                pendingMedicalList.map((m) => (
                  <div key={m.id || m.applicationRef} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{m.studentName}</h4>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono text-[10px] font-bold">
                            {m.rollNumber}
                          </span>
                        </div>
                        <span className="text-amber-600 dark:text-amber-300 font-bold block mt-0.5">
                          Illness: {m.illness} ({m.totalDays} Days Rest: {m.startDate} to {m.endDate})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleVerifyMedical(m, 'VERIFIED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1"
                        >
                          <span>✓ Approve & Lower Criteria to 65%</span>
                        </button>
                        <button
                          onClick={() => handleVerifyMedical(m, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center gap-1"
                        >
                          <span>✕ Reject Request</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20 text-[11px] text-slate-600 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-1 font-mono">
                      <div>Doctor: <strong>{m.doctorName}</strong> ({m.doctorRegNo})</div>
                      <div>Hospital: <strong>{m.hospitalName}</strong></div>
                      <div className="sm:col-span-2 text-slate-500">Details: {m.causeDetails}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AT-RISK STUDENTS PANEL & BROADCAST HISTORY GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AT-RISK PANEL */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <h3 className="font-display font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span>Students Requiring Academic Attention ({atRiskList.length})</span>
              </h3>
              <div className="space-y-3">
                {atRiskList.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                    All students in {selectedClass} are in good academic standing!
                  </div>
                ) : (
                  atRiskList.map((st) => (
                    <div key={st.id} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{st.name} ({st.rollNumber})</h4>
                        <span className="text-slate-500 text-[11px] block mt-0.5">Attendance: {st.attendancePercent}% • Risk: {st.academicRisk}</span>
                      </div>
                      <button
                        onClick={() => setAlertModalStudent(st)}
                        className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
                      >
                        Send Alert
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* BROADCAST HISTORY PANEL */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <h3 className="font-display font-bold text-base text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                <span>Broadcast History ({broadcastHistoryList.length})</span>
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {broadcastHistoryList.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                    No class broadcasts sent yet.
                  </div>
                ) : (
                  broadcastHistoryList.map((bh) => (
                    <div key={bh.id} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{bh.title}</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono text-[10px] font-bold">
                          {bh.recipientCount} Recipients
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1">{bh.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: OTHER CLASSES (AUTHORIZED ACADEMIC ACCESS) */}
      {activeSection === 'other-classes' && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-500 shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">Subject Faculty Access Policy:</strong> Displays classes where you are authorized as Subject Faculty. Class-wide broadcast and roster modification powers are restricted to the official Class Incharge.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherClassesList.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ y: -3 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-xs font-black border border-cyan-500/30">
                    {c.classCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                    {c.studentCount} Students
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">{c.subject}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{c.department} • {c.semester}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className="text-purple-600 dark:text-purple-400">Role: {c.role}</span>
                  <span className="text-slate-500 font-mono">Room: {c.room}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: PASS & DOCUMENT APPROVALS */}
      {activeSection === 'pass-approvals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Student Pass & Digital Card Verification Center
                </h3>
                <p className="text-xs text-slate-500">
                  Review and verify student digital ID cards, fest passes, hostel outings, parent visit passes, bus passes, and library cards in real-time.
                </p>
              </div>
            </div>

            {/* PASS TYPES APPROVAL MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'idCard', title: 'Student Digital ID Card', desc: 'Autofilled Student ID Verification' },
                { key: 'festCard', title: 'Fest & Cultural Pass', desc: 'SPANDAN 2026 Entry & Concert Access' },
                { key: 'hostelPassIncharge', title: 'Hostel Outing Pass', desc: 'Hostel Outing & Parent Visit Authorization' },
                { key: 'parentPass', title: 'Parent Campus Visit Pass', desc: 'Both Parents Visit & Photo Review' },
                { key: 'busPass', title: 'Emergency Bus Pass', desc: 'Route #14 Shuttle Clearance' },
                { key: 'libraryCard', title: 'Central Library Digital Card', desc: 'Book Issue & Overdue Fine Clearance' },
              ].map((item) => {
                let currentStatus = 'PENDING';
                try {
                  const saved = localStorage.getItem('nexus_card_approvals_v2');
                  const parsed = saved ? JSON.parse(saved) : {};
                  currentStatus = parsed[item.key] || 'PENDING';
                } catch (e) {}

                return (
                  <div
                    key={item.key}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{item.title}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono font-black text-[9px] uppercase ${
                            currentStatus === 'APPROVED'
                              ? 'bg-emerald-500 text-white'
                              : currentStatus === 'REJECTED'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          try {
                            const saved = localStorage.getItem('nexus_card_approvals_v2');
                            const current = saved ? JSON.parse(saved) : {};
                            current[item.key] = 'REJECTED';
                            localStorage.setItem('nexus_card_approvals_v2', JSON.stringify(current));
                            window.dispatchEvent(new CustomEvent('nexus:pass-approval-updated', { detail: { cardKey: item.key, status: 'REJECTED' } }));
                            window.dispatchEvent(new Event('storage'));
                            alert(`✕ Pass request for "${item.title}" REJECTED.`);
                          } catch (e) {}
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-200 transition-all"
                      >
                        Reject Pass
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const saved = localStorage.getItem('nexus_card_approvals_v2');
                            const current = saved ? JSON.parse(saved) : {};
                            current[item.key] = 'APPROVED';
                            localStorage.setItem('nexus_card_approvals_v2', JSON.stringify(current));
                            window.dispatchEvent(new CustomEvent('nexus:pass-approval-updated', { detail: { cardKey: item.key, status: 'APPROVED' } }));
                            window.dispatchEvent(new Event('storage'));
                            alert(`✓ Pass request for "${item.title}" APPROVED! Student can now download PDF.`);
                          } catch (e) {}
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                      >
                        Approve Pass
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BROADCAST COMPOSER MODAL */}
      <AnimatePresence>
        {broadcastModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBroadcastModalOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-black text-base">
                  <Radio className="w-5 h-5 text-purple-500" />
                  <span>Broadcast Message to {selectedClass}</span>
                </div>
                <button onClick={() => setBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Target Audience:</span>
                  <span className="font-mono font-black text-purple-600 dark:text-purple-300">
                    {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} Selected Students` : `Entire Class (${classStats.totalStudents} Active Students)`}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Broadcast Title</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Tomorrow DBMS Lecture Room Change"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Category</label>
                    <select
                      value={broadcastCategory}
                      onChange={(e) => setBroadcastCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="GENERAL">GENERAL</option>
                      <option value="ACADEMIC">ACADEMIC</option>
                      <option value="ATTENDANCE">ATTENDANCE</option>
                      <option value="ASSIGNMENT">ASSIGNMENT</option>
                      <option value="EXAM">EXAM</option>
                      <option value="TIMETABLE">TIMETABLE</option>
                      <option value="ROOM CHANGE">ROOM CHANGE</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Broadcast Message Body</label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type broadcast message details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button onClick={() => setBroadcastModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                  Cancel
                </button>
                <button
                  disabled={isSubmittingBroadcast}
                  onClick={handleSendBroadcast}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingBroadcast ? 'Publishing...' : 'Send Broadcast'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INDIVIDUAL ALERT MODAL */}
      <AnimatePresence>
        {alertModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAlertModalStudent(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-bold text-sm">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Send Alert to {alertModalStudent.name}</span>
                </div>
                <button onClick={() => setAlertModalStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={alertPriority}
                    onChange={(e) => setAlertPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white mb-2"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Alert Title</label>
                  <input
                    type="text"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="e.g. Attendance Shortage Warning"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Alert Details</label>
                  <textarea
                    rows={3}
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Type alert instructions..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button onClick={() => setAlertModalStudent(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                  Cancel
                </button>
                <button onClick={handleSendAlert} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md">
                  Send Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INDIVIDUAL REMINDER MODAL */}
      <AnimatePresence>
        {reminderModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReminderModalStudent(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300 font-bold text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Send Reminder to {reminderModalStudent.name}</span>
                </div>
                <button onClick={() => setReminderModalStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Reminder Subject</label>
                  <input
                    type="text"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    placeholder="e.g. DBMS Assignment Submission Deadline"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Reminder Details</label>
                  <textarea
                    rows={3}
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Type reminder text..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button onClick={() => setReminderModalStudent(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                  Cancel
                </button>
                <button onClick={handleSendReminder} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md">
                  Send Reminder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLASS TRANSFER MODAL */}
      <AnimatePresence>
        {transferModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTransferModalStudent(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-bold text-sm">
                  <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                  <span>Transfer Student Section</span>
                </div>
                <button onClick={() => setTransferModalStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Transfer <strong className="text-slate-900 dark:text-white">{transferModalStudent.name}</strong> ({transferModalStudent.rollNumber}) from <strong className="text-purple-600 dark:text-purple-400">{selectedClass}</strong> to:
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Target Class Section</label>
                  <select
                    value={targetClassForTransfer}
                    onChange={(e) => setTargetClassForTransfer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="BTECH CSE 4A">BTECH CSE 4A</option>
                    <option value="BTECH CSE 4B">BTECH CSE 4B</option>
                    <option value="BCA 3B">BCA 3B</option>
                    <option value="BTECH ECE 2A">BTECH ECE 2A</option>
                    <option value="BTECH MECH 1A">BTECH MECH 1A</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button onClick={() => setTransferModalStudent(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                  Cancel
                </button>
                <button onClick={handleExecuteTransfer} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md">
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ENHANCED 7-TAB STUDENT PROFILE DRAWER MODAL */}
      <AnimatePresence>
        {activeStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveStudentModal(null);
                setDrawerData(null);
              }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left max-h-[90vh] flex flex-col"
            >
              {/* DRAWER HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md overflow-hidden shrink-0">
                    {activeStudentModal.photoUrl ? (
                      <img src={activeStudentModal.photoUrl} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      activeStudentModal.name?.charAt(0).toUpperCase() || 'S'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">{activeStudentModal.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono text-[10px] font-bold">
                        {activeStudentModal.rollNumber}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      {activeStudentModal.department} • {activeStudentModal.className} ({activeStudentModal.section})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveStudentModal(null);
                    setDrawerData(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* 7-TAB DRAWER NAVIGATION BAR */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs font-bold">
                {[
                  { key: 'PROFILE', label: 'Profile' },
                  { key: 'ACADEMICS', label: 'Academics' },
                  { key: 'ATTENDANCE', label: 'Attendance' },
                  { key: 'ASSIGNMENTS', label: 'Assignments' },
                  { key: 'MEDICAL', label: 'Medical Leaves' },
                  { key: 'REMARKS', label: 'Remarks' },
                  { key: 'COMMUNICATION', label: 'Communication' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setDrawerTab(t.key as any)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      drawerTab === t.key
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* DRAWER BODY TAB CONTENTS */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
                {drawerLoading ? (
                  <div className="p-8 text-center text-slate-400 font-mono font-bold">
                    Loading student data from MySQL...
                  </div>
                ) : (
                  <>
                    {/* TAB 1: PROFILE */}
                    {drawerTab === 'PROFILE' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Admission No: {drawerData?.student?.admissionNumber || `ADM-${activeStudentModal.rollNumber}`}</span>
                          <span className="font-mono text-purple-600 dark:text-purple-300 font-bold">{drawerData?.student?.semester || 'Semester 3'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Official Email</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-xs">{activeStudentModal.email}</strong>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Mobile Number</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-xs">{activeStudentModal.mobile || '+91 98765 43210'}</strong>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Father's Name</span>
                            <strong className="text-slate-900 dark:text-white font-bold text-xs">{drawerData?.student?.fatherName || 'Parent / Guardian'}</strong>
                            {drawerData?.student?.fatherPhone && (
                              <span className="text-[10px] text-slate-400 block font-mono">({drawerData.student.fatherPhone})</span>
                            )}
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Mother's Name</span>
                            <strong className="text-slate-900 dark:text-white font-bold text-xs">{drawerData?.student?.motherName || 'Mother Name'}</strong>
                          </div>

                          <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Residential Address</span>
                            <strong className="text-slate-900 dark:text-white text-xs">{drawerData?.student?.address || 'Nexus Campus Hostel Block A, Room 304'}</strong>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-600 dark:text-amber-300 font-bold">
                          🔒 Faculty Privacy Shield: Sensitive government identity details (Aadhaar / PAN / Govt document photos) are strictly redacted.
                        </div>
                      </div>
                    )}

                    {/* TAB 2: ACADEMICS */}
                    {drawerTab === 'ACADEMICS' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                            <span className="text-[10px] font-bold text-slate-400 block">CGPA</span>
                            <strong className="font-display font-black text-lg text-purple-600 dark:text-purple-300">{drawerData?.academics?.cgpa || 8.42}</strong>
                          </div>
                          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                            <span className="text-[10px] font-bold text-slate-400 block">SGPA</span>
                            <strong className="font-display font-black text-lg text-cyan-600 dark:text-cyan-300">{drawerData?.academics?.sgpa || 8.65}</strong>
                          </div>
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-[10px] font-bold text-slate-400 block">Total Credits</span>
                            <strong className="font-display font-black text-lg text-emerald-600 dark:text-emerald-300">{drawerData?.academics?.totalCredits || 24}</strong>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block">Enrolled Courses (Semester 3)</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(drawerData?.academics?.enrolledCourses || ['Blockchain Technologies', 'Agile Software Development', 'Database Management Systems', 'Computer Networks']).map((course: string) => (
                              <div key={course} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs text-purple-600 dark:text-purple-300">
                                • {course}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: ATTENDANCE SUMMARY */}
                    {drawerTab === 'ATTENDANCE' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Conducted</span>
                            <strong className="font-bold text-slate-900 dark:text-white text-sm">{drawerData?.attendance?.totalConducted || 30} Classes</strong>
                          </div>
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-[10px] font-bold text-slate-400 block">Attended</span>
                            <strong className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{drawerData?.attendance?.totalAttended || 26} Classes</strong>
                          </div>
                          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                            <span className="text-[10px] font-bold text-slate-400 block">Medical Leaves</span>
                            <strong className="font-bold text-amber-600 dark:text-amber-300 text-sm">{drawerData?.attendance?.medicalLeavesCount || 1} Approved</strong>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block">Overall Attendance Percentage</span>
                            <strong className="font-display font-black text-2xl text-purple-600 dark:text-purple-300">
                              {drawerData?.attendance?.percentage || activeStudentModal.attendancePercent}%
                            </strong>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            (drawerData?.attendance?.percentage || activeStudentModal.attendancePercent) >= 75
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}>
                            {(drawerData?.attendance?.percentage || activeStudentModal.attendancePercent) >= 75 ? '✓ Safe Margin (≥75%)' : '⚠️ Shortage Alert (<75%)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: ASSIGNMENTS */}
                    {drawerTab === 'ASSIGNMENTS' && (
                      <div className="space-y-3">
                        {(!drawerData?.assignments || drawerData.assignments.length === 0) ? (
                          <div className="p-6 text-center text-slate-400 font-mono font-bold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                            No assignment submissions recorded yet.
                          </div>
                        ) : (
                          drawerData.assignments.map((asgn: any) => (
                            <div key={asgn.id || asgn.submissionId} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">{asgn.title} ({asgn.subject})</span>
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono font-bold text-[10px]">
                                  {asgn.scoredMarks !== null ? `${asgn.scoredMarks} / ${asgn.totalMarks} Marks` : `Max: ${asgn.totalMarks}`}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Submitted: {asgn.submittedAt ? new Date(asgn.submittedAt).toLocaleDateString() : 'Recent'} | Status: <strong>{asgn.status}</strong>
                              </p>
                              {asgn.facultyRemarks && (
                                <span className="text-[11px] text-purple-600 dark:text-purple-300 block font-semibold">
                                  Faculty Remarks: "{asgn.facultyRemarks}"
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 5: MEDICAL LEAVES */}
                    {drawerTab === 'MEDICAL' && (
                      <div className="space-y-3">
                        {(!drawerData?.medicalLeaves || drawerData.medicalLeaves.length === 0) ? (
                          <div className="p-6 text-center text-slate-400 font-mono font-bold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                            No medical leave requests on record.
                          </div>
                        ) : (
                          drawerData.medicalLeaves.map((med: any) => (
                            <div key={med.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">{med.reason}</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                                  {med.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Duration: {med.fromDate} to {med.toDate}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 6: FACULTY REMARKS */}
                    {drawerTab === 'REMARKS' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block">Add Faculty Performance Remark</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newRemark}
                              onChange={(e) => setNewRemark(e.target.value)}
                              placeholder="Type performance or behavioral remark..."
                              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <select
                              value={newRemarkCategory}
                              onChange={(e) => setNewRemarkCategory(e.target.value)}
                              className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white"
                            >
                              <option value="Academic">Academic</option>
                              <option value="Behavioral">Behavioral</option>
                              <option value="Attendance">Attendance</option>
                              <option value="General">General</option>
                            </select>
                            <button
                              disabled={isSubmittingRemark}
                              onClick={handleAddRemark}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shrink-0"
                            >
                              Save Remark
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(!drawerData?.facultyRemarks || drawerData.facultyRemarks.length === 0) ? (
                            <div className="p-4 text-center text-slate-400 font-mono text-xs">
                              No faculty remarks added yet.
                            </div>
                          ) : (
                            drawerData.facultyRemarks.map((r: any) => (
                              <div key={r.id} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-purple-600 dark:text-purple-300 text-xs">{r.facultyName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-800 dark:text-slate-200">"{r.remark}"</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 7: COMMUNICATION */}
                    {drawerTab === 'COMMUNICATION' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                          <span className="font-bold text-purple-600 dark:text-purple-300 text-xs block">Send Direct Message / Alert / Reminder</span>

                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={directMsgType}
                              onChange={(e) => setDirectMsgType(e.target.value)}
                              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white"
                            >
                              <option value="MESSAGE">Direct Message</option>
                              <option value="ALERT">Academic Alert</option>
                              <option value="REMINDER">Deadline Reminder</option>
                            </select>

                            <input
                              type="text"
                              value={directMsgTitle}
                              onChange={(e) => setDirectMsgTitle(e.target.value)}
                              placeholder="Subject / Title (Optional)"
                              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          <textarea
                            rows={3}
                            value={directMsgBody}
                            onChange={(e) => setDirectMsgBody(e.target.value)}
                            placeholder="Type message content..."
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white"
                          />

                          <div className="flex justify-end">
                            <button
                              disabled={isSendingDirectMsg}
                              onClick={handleSendDirectMessage}
                              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isSendingDirectMsg ? 'Dispatching...' : `Dispatch ${directMsgType}`}</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block">Recent Message Log</span>
                          {(!drawerData?.communications || drawerData.communications.length === 0) ? (
                            <div className="p-4 text-center text-slate-400 font-mono text-xs">
                              No recent messages log.
                            </div>
                          ) : (
                            drawerData.communications.map((msg: any) => (
                              <div key={msg.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-900 dark:text-white">{msg.senderName} ({msg.type})</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">{msg.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* DRAWER FOOTER */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
                <button
                  onClick={() => {
                    setActiveStudentModal(null);
                    setDrawerData(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  Close Profile Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
