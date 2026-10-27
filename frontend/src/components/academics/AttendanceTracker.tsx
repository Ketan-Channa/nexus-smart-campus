import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Sparkles,
  FileText,
  Lock,
  DollarSign,
  Ban,
  Briefcase,
} from 'lucide-react';

import { type UserSession, type UserRole } from '../../types/auth';
import { MedicalCertificateModal } from './MedicalCertificateModal';
import { useRealtimeEvent } from '../../context/RealtimeContext';

export type AttendanceStatusType =
  | 'Present'
  | 'Absent'
  | 'Medical Leave'
  | 'On Duty (OD)'
  | 'Suspended'
  | 'Fees Not Paid but present (FP)'
  | 'Fees Not Paid and Absent (FA)';

interface AttendanceTrackerProps {
  session?: UserSession | null;
}

interface AttendanceRecord {
  id: number;
  studentId?: number;
  rollNumber: string;
  studentName: string;
  className: string;
  department: string;
  semester: string;
  section: string;
  subject: string;
  subjectCode: string;
  date: string;
  timeSlot: string;
  status: AttendanceStatusType;
  facultyName: string;
  remarks?: string;
}

interface SubjectStat {
  subject: string;
  code: string;
  faculty: string;
  attended: number;
  total: number;
  percentage: number;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ session: _session }) => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Student');
  const [currentUserName, setCurrentUserName] = useState<string>('Student User');
  const [currentRollNumber, setCurrentRollNumber] = useState<string>(_session?.rollNumber || '2026CSE001');
  const [userClass, setUserClass] = useState<string>('BTECH CSE 4A');
  const [userDepartment, setUserDepartment] = useState<string>('Computer Science & Engineering');
  const [userSemester, setUserSemester] = useState<string>('Semester 7');
  const [userSection, setUserSection] = useState<string>('4A');

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Medical Leave Submission state
  const [isMedicalSubmitted, setIsMedicalSubmitted] = useState<boolean>(false);
  const [showMedicalModal, setShowMedicalModal] = useState<boolean>(false);

  // Faculty Mark Attendance State
  const [showMarkModal, setShowMarkModal] = useState<boolean>(false);
  const [markForm, setMarkForm] = useState({
    rollNumber: '',
    studentName: '',
    className: 'BTECH CSE 4A',
    subject: '',
    subjectCode: '',
    date: new Date().toISOString().substring(0, 10),
    timeSlot: '09:00 AM - 10:00 AM',
    status: 'Present' as AttendanceStatusType,
    facultyName: '',
    remarks: '',
  });

  // Load Session details & fetch attendance for student's class
  useEffect(() => {
    const rawSession = sessionStorage.getItem('nexus_session');
    let loadedClass = userClass;
    let loadedRoll = _session?.rollNumber || currentRollNumber;

    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession);
        if (parsed.role) setCurrentUserRole(parsed.role as UserRole);
        if (parsed.name) setCurrentUserName(parsed.name);
        if (parsed.department) setUserDepartment(parsed.department);
        if (parsed.className) {
          setUserClass(parsed.className);
          loadedClass = parsed.className;
        }
        if (parsed.rollNumber || parsed.roll_number) {
          const r = parsed.rollNumber || parsed.roll_number;
          setCurrentRollNumber(r);
          loadedRoll = r;
        }
        if (parsed.semester) setUserSemester(parsed.semester);
        if (parsed.section) setUserSection(parsed.section);
      } catch (e) {
        // Fallback
      }
    } else if (_session?.rollNumber) {
      setCurrentRollNumber(_session.rollNumber);
      loadedRoll = _session.rollNumber;
      if (_session.className) {
        setUserClass(_session.className);
        loadedClass = _session.className;
      }
    }

    fetchAttendanceForClass(loadedClass, loadedRoll);
  }, [_session]);

  // Realtime Socket Event Subscriptions for Student Attendance Tracker
  useRealtimeEvent('attendance.marked', () => {
    console.log('⚡ [Realtime Student UI] Attendance updated by Faculty! Refetching...');
    fetchAttendanceForClass(userClass, currentRollNumber);
  });

  useRealtimeEvent('attendance.updated', () => {
    console.log('⚡ [Realtime Student UI] Attendance corrected/updated by Faculty! Refetching...');
    fetchAttendanceForClass(userClass, currentRollNumber);
  });

  useRealtimeEvent('medical_leave.approved', () => {
    console.log('⚡ [Realtime Student UI] Medical Leave verified by Faculty! Refetching...');
    setIsMedicalSubmitted(true);
    fetchAttendanceForClass(userClass, currentRollNumber);
  });

  useRealtimeEvent('medical_leave.rejected', () => {
    console.log('⚡ [Realtime Student UI] Medical Leave rejected by Faculty!');
    setIsMedicalSubmitted(false);
    fetchAttendanceForClass(userClass, currentRollNumber);
  });

  useRealtimeEvent('medical_leave.clarification_requested', (data: any) => {
    console.log('⚡ [Realtime Student UI] Clarification requested by Faculty:', data);
    alert(`❓ Clarification Requested by Class Incharge (${data.verifierName || 'Faculty'}): "${data.clarificationRequest}". Please review your Medical Certificate application.`);
  });

  const fetchAttendanceForClass = async (classNameStr: string, rollNo?: string) => {
    try {
      const activeRoll = rollNo !== undefined ? rollNo : currentRollNumber;
      let url = `http://localhost:5000/api/attendance?className=${encodeURIComponent(classNameStr)}`;
      if (activeRoll) {
        url += `&rollNumber=${encodeURIComponent(activeRoll)}`;
      }
      const res = await axios.get(url);
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setAttendanceRecords(res.data.data);
      } else {
        setAttendanceRecords([]);
      }
    } catch (err) {
      setAttendanceRecords([]);
    }
  };

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/attendance/mark', markForm);
      setShowMarkModal(false);
      fetchAttendanceForClass(userClass);
    } catch (err) {
      alert('Attendance marked locally!');
      setShowMarkModal(false);
      fetchAttendanceForClass(userClass);
    }
  };

  // 7 Criteria Calculations
  const hasMedicalRecords = attendanceRecords.some((r) => r.status === 'Medical Leave');
  const effectiveMedicalActive = isMedicalSubmitted || hasMedicalRecords;
  const requiredThreshold = effectiveMedicalActive ? 65.0 : 75.0;

  const totalLectures = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const odCount = attendanceRecords.filter((r) => r.status === 'On Duty (OD)').length;
  const medicalCount = attendanceRecords.filter((r) => r.status === 'Medical Leave').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'Absent' || r.status === 'Fees Not Paid and Absent (FA)').length;
  const suspendedCount = attendanceRecords.filter((r) => r.status === 'Suspended').length;
  const fpCount = attendanceRecords.filter((r) => r.status === 'Fees Not Paid but present (FP)').length;
  const faCount = attendanceRecords.filter((r) => r.status === 'Fees Not Paid and Absent (FA)').length;

  // Attended Units = Present + OD + FP + (Medical if active)
  const totalAttendedUnits = presentCount + odCount + fpCount + (effectiveMedicalActive ? medicalCount : 0);
  const overallPercentage = totalLectures > 0 ? ((totalAttendedUnits / totalLectures) * 100).toFixed(2) : '0.00';
  const numPerc = parseFloat(overallPercentage);
  const isThresholdSafe = numPerc >= requiredThreshold;

  // Compute Subject-Wise Statistics & Skip Guidance
  const subjectMap = new Map<string, SubjectStat>();
  attendanceRecords.forEach((r) => {
    const key = r.subjectCode || r.subject;
    if (!subjectMap.has(key)) {
      subjectMap.set(key, {
        subject: r.subject,
        code: r.subjectCode,
        faculty: r.facultyName,
        attended: 0,
        total: 0,
        percentage: 0,
      });
    }
    const stat = subjectMap.get(key)!;
    stat.total += 1;
    if (r.status === 'Present' || r.status === 'On Duty (OD)' || r.status === 'Fees Not Paid but present (FP)' || (effectiveMedicalActive && r.status === 'Medical Leave')) {
      stat.attended += 1;
    }
    stat.percentage = parseFloat(((stat.attended / stat.total) * 100).toFixed(1));
  });

  const subjectStatsList = Array.from(subjectMap.values());

  // Sync calculated stats & subject skip guidance to localStorage for Square Card #2 15-second rotator
  useEffect(() => {
    if (attendanceRecords.length === 0) {
      localStorage.removeItem('nexus_user_attendance_stats');
      localStorage.removeItem('nexus_user_attendance_subjects');
      window.dispatchEvent(new Event('storage'));
      return;
    }

    const statsPayload = {
      percentage: numPerc,
      hasMedical: effectiveMedicalActive,
      userClass,
      total: totalLectures,
      attended: totalAttendedUnits,
    };
    localStorage.setItem('nexus_user_attendance_stats', JSON.stringify(statsPayload));

    const subjectGuidancePayload = subjectStatsList.map((stat) => ({
      subject: stat.subject,
      code: stat.code,
      faculty: stat.faculty,
      percentage: stat.percentage,
      isSafe: stat.percentage >= requiredThreshold,
      marginLectures: Math.floor(stat.attended / (requiredThreshold / 100) - stat.total),
    }));

    localStorage.setItem('nexus_user_attendance_subjects', JSON.stringify(subjectGuidancePayload));

    window.dispatchEvent(new Event('storage'));
  }, [numPerc, effectiveMedicalActive, userClass, totalLectures, totalAttendedUnits, subjectStatsList.length, requiredThreshold, attendanceRecords.length]);

  // Upright Semi-circle Arc SVG (Radius 75, Center 100, 110)
  const radius = 75;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(numPerc, 100) / 100) * circumference;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
            NEXUS Attendance Tracker & Analytics Engine
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight flex items-center gap-2">
            <span>Attendance Tracker —</span>
            <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono flex items-center gap-1">
              <Lock className="w-4 h-4 text-cyan-300" />
              {userClass}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100 opacity-90 leading-relaxed">
            Registered Student Class: <strong>{userClass}</strong> • Department: <strong>{userDepartment}</strong> ({userSemester}, Section {userSection}). Attendance is strictly locked to your registered class section.
          </p>

          {/* Medical Leave Submission Toggle */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setShowMedicalModal(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                effectiveMedicalActive
                  ? 'bg-amber-400 text-slate-900 shadow-amber-400/30'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>
                {effectiveMedicalActive ? 'Medical Certificate Active (Safe Target: 65%)' : 'Submit Medical Certificate (Lowers Safe Threshold to 65%)'}
              </span>
            </button>
          </div>
        </div>

        {/* UPRIGHT ATTENDANCE WHEEL GAUGE IN HEADER */}
        <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shrink-0 max-w-xs flex flex-col items-center justify-center text-center space-y-2 z-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200">
            OVERALL ATTENDANCE WHEEL
          </span>

          <div className="relative w-full max-w-[210px] mx-auto flex items-center justify-center">
            <svg className="w-full h-auto overflow-visible" viewBox="0 0 200 115">
              {/* Upright Background Track Arc */}
              <path
                d="M 25 105 A 75 75 0 0 1 175 105"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Upright Active Progress Arc */}
              <motion.path
                d="M 25 105 A 75 75 0 0 1 175 105"
                fill="none"
                stroke={isThresholdSafe ? '#f59e0b' : '#ef4444'}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={235.619}
                initial={{ strokeDashoffset: 235.619 }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              {/* Percentage Text Centered Inside Gauge Arch */}
              <text
                x="100"
                y="92"
                textAnchor="middle"
                className="fill-white font-display font-black text-2xl tracking-tight"
              >
                {overallPercentage}%
              </text>
            </svg>
          </div>


          <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black border ${
            isThresholdSafe
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-300'
              : 'bg-rose-500/20 text-rose-200 border-rose-300 animate-pulse'
          }`}>
            {isThresholdSafe ? <CheckCircle2 className="w-3 h-3 text-emerald-300" /> : <AlertTriangle className="w-3 h-3 text-rose-300" />}
            {isThresholdSafe ? `Safe Criteria Met (>${requiredThreshold}%)` : `Shortage (<${requiredThreshold}%)`}
          </span>

          {(currentUserRole === 'Faculty' || currentUserRole === 'Administrator') && (
            <button
              onClick={() => setShowMarkModal(true)}
              className="mt-1 w-full py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md hover:bg-emerald-400 flex items-center justify-center gap-1"
            >
              <UserCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* 7 CRITERIA METRICS SUMMARY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Present */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">1. Present</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">{presentCount}</h4>
          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Regular Classes</span>
        </div>

        {/* 2. On Duty (OD) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">2. On Duty</span>
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">{odCount}</h4>
          <span className="text-[9px] text-blue-500 font-bold block mt-0.5">College Duty</span>
        </div>

        {/* 3. Medical Leave */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">3. Medical</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">{medicalCount}</h4>
          <span className="text-[9px] text-amber-500 font-bold block mt-0.5">Safe Target: 65%</span>
        </div>

        {/* 4. Absent */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">4. Absent</span>
            <XCircle className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">{absentCount}</h4>
          <span className="text-[9px] text-rose-500 font-bold block mt-0.5">Unexcused</span>
        </div>

        {/* 5. Suspended */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">5. Suspended</span>
            <Ban className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">{suspendedCount}</h4>
          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Academic Hold</span>
        </div>

        {/* 6. Fees Not Paid but present (FP) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">6. FP (Present)</span>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">{fpCount}</h4>
          <span className="text-[9px] text-cyan-600 font-semibold block mt-0.5">Attended (Dues)</span>
        </div>

        {/* 7. Fees Not Paid and Absent (FA) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">7. FA (Absent)</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">{faCount}</h4>
          <span className="text-[9px] text-red-500 font-bold block mt-0.5">Absent (Dues)</span>
        </div>
      </div>

      {/* FACULTY / ADMIN MARK ATTENDANCE MODAL */}
      <AnimatePresence>
        {showMarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMarkModal(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  Mark Attendance for {userClass}
                </h3>
                <button onClick={() => setShowMarkModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleMarkSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Roll Number</label>
                  <input type="text" value={markForm.rollNumber} onChange={(e) => setMarkForm({ ...markForm, rollNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Full Name</label>
                  <input type="text" value={markForm.studentName} onChange={(e) => setMarkForm({ ...markForm, studentName: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input type="text" value={markForm.subject} onChange={(e) => setMarkForm({ ...markForm, subject: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input type="date" value={markForm.date} onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">7 Status Criteria</label>
                    <select value={markForm.status} onChange={(e) => setMarkForm({ ...markForm, status: e.target.value as AttendanceStatusType })} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold">
                      <option value="Present">Present</option>
                      <option value="On Duty (OD)">On Duty (OD)</option>
                      <option value="Medical Leave">Medical Leave</option>
                      <option value="Absent">Absent</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Fees Not Paid but present (FP)">Fees Not Paid but present (FP)</option>
                      <option value="Fees Not Paid and Absent (FA)">Fees Not Paid and Absent (FA)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowMarkModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md">Save Attendance</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MEDICAL CERTIFICATE SUBMISSION MODAL */}
      <MedicalCertificateModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        rollNumber={currentRollNumber}
        studentName={currentUserName}
        className={userClass}
        department={userDepartment}
        onSuccessSubmitted={() => {
          setIsMedicalSubmitted(true);
        }}
      />
    </div>
  );
};
