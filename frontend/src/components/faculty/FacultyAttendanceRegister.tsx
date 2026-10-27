import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRealtimeEvent } from '../../context/RealtimeContext';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Edit3,
  Save,
  RefreshCw,
  ShieldCheck,
  Award,
  Filter,
} from 'lucide-react';

interface FacultyAttendanceRegisterProps {
  facultyName?: string;
  facultyEmail?: string;
  inchargeClass?: string;
}

export const FacultyAttendanceRegister: React.FC<FacultyAttendanceRegisterProps> = ({
  facultyName = 'Dr. S. M. Bhatnagar',
  facultyEmail = 'dr_smb_incharge@nexus.edu',
  inchargeClass = 'B.TECH CSE 2023 A',
}) => {
  // Selector states
  const [classesList, setClassesList] = useState<string[]>([inchargeClass || 'B.TECH CSE 2023 A']);
  const [subjectsList, setSubjectsList] = useState<string[]>(['Blockchain Technologies', 'Database Management Systems']);
  const [timeSlotsList, setTimeSlotsList] = useState<string[]>([
    '09:00 AM - 10:00 AM (Period 1)',
    '10:00 AM - 11:00 AM (Period 2)',
    '11:15 AM - 12:15 PM (Period 3)',
    '12:15 PM - 01:15 PM (Period 4)',
    '02:00 PM - 03:00 PM (Period 5)',
    '03:00 PM - 04:00 PM (Period 6)',
  ]);

  const [selectedClass, setSelectedClass] = useState<string>(inchargeClass || 'B.TECH CSE 2023 A');
  const [selectedSubject, setSelectedSubject] = useState<string>('Blockchain Technologies');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00 AM - 10:00 AM (Period 1)');

  // Roster & Summary Data
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alreadyMarked, setAlreadyMarked] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('ALL');

  // Attendance Correction Modal State
  const [correctionModalStudent, setCorrectionModalStudent] = useState<any | null>(null);
  const [correctionNewStatus, setCorrectionNewStatus] = useState<string>('Present');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [submittingCorrection, setSubmittingCorrection] = useState<boolean>(false);

  // 1. Fetch Faculty Options (Assigned Classes & Subjects)
  const fetchFacultyOptions = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/faculty/options?email=${encodeURIComponent(facultyEmail)}`
      );
      if (res.data && res.data.success) {
        if (res.data.classes && res.data.classes.length > 0) setClassesList(res.data.classes);
        if (res.data.subjects && res.data.subjects.length > 0) setSubjectsList(res.data.subjects);
        if (res.data.timeSlots && res.data.timeSlots.length > 0) setTimeSlotsList(res.data.timeSlots);

        if (!selectedClass && res.data.classes.length > 0) setSelectedClass(res.data.classes[0]);
        if (!selectedSubject && res.data.subjects.length > 0) setSelectedSubject(res.data.subjects[0]);
      }
    } catch (err) {}
  }, [facultyEmail, selectedClass, selectedSubject]);

  // 2. Fetch Attendance Register Roster from Backend (with resilient fallbacks)
  const fetchRegister = useCallback(async () => {
    if (!selectedClass || !selectedSubject || !selectedDate || !selectedSlot) return;
    setLoading(true);

    try {
      // Primary: Try Phase 3 attendance register API
      const res = await axios.get(
        `http://localhost:5000/api/attendance/register?className=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}&date=${encodeURIComponent(selectedDate)}&timeSlot=${encodeURIComponent(selectedSlot)}&facultyEmail=${encodeURIComponent(facultyEmail)}`
      );

      if (res.data && res.data.success && Array.isArray(res.data.roster) && res.data.roster.length > 0) {
        setRoster(res.data.roster);
        setAlreadyMarked(Boolean(res.data.alreadyMarked));
        setLoading(false);
        return;
      }
    } catch (e) {}

    // Fallback: Fetch student roster directly from faculty my-class / students endpoints
    let rawStudents: any[] = [];
    let markedMap = new Map<string, any>();
    let isMarked = false;

    try {
      const resClass = await axios.get(
        `http://localhost:5000/api/faculty/my-students-classes/my-class?email=${encodeURIComponent(facultyEmail)}&className=${encodeURIComponent(selectedClass)}`
      );
      if (resClass.data && resClass.data.students && resClass.data.students.length > 0) {
        rawStudents = resClass.data.students;
      } else {
        const resSt = await axios.get(
          `http://localhost:5000/api/faculty/students?className=${encodeURIComponent(selectedClass)}`
        );
        if (resSt.data && resSt.data.students) {
          rawStudents = resSt.data.students;
        }
      }
    } catch (e) {}

    // Fetch marked attendance entries for date and slot
    try {
      const resAtt = await axios.get(
        `http://localhost:5000/api/attendance?className=${encodeURIComponent(selectedClass)}`
      );
      if (resAtt.data && resAtt.data.data) {
        resAtt.data.data.forEach((m: any) => {
          if (m.subject === selectedSubject && (m.date === selectedDate || m.date?.substring(0, 10) === selectedDate)) {
            markedMap.set(m.rollNumber || m.roll_number, m);
            isMarked = true;
          }
        });
      }
    } catch (e) {}

    const formattedRoster = rawStudents.map((s: any) => {
      const roll = s.rollNumber || s.roll_number || `2023CSE${String(s.id).padStart(3, '0')}`;
      const existing = markedMap.get(roll);
      const name = s.name || s.fullName || s.full_name || 'Student Name';
      const attPct = s.attendancePercent || s.attendance_percentage || 85;

      return {
        studentId: s.id,
        rollNumber: roll,
        studentName: name,
        email: s.email,
        department: s.department || 'Computer Science & Engineering',
        className: s.className || s.class || selectedClass,
        section: s.section || 'A',
        status: existing ? existing.status : 'Present',
        currentPercentage: typeof attPct === 'number' ? attPct : parseFloat(attPct),
        previousPercentage: typeof attPct === 'number' ? attPct : parseFloat(attPct),
        alreadyMarked: !!existing,
        attendanceRecordId: existing ? existing.id : null,
        remarks: existing ? existing.remarks : '',
      };
    });

    setRoster(formattedRoster);
    setAlreadyMarked(isMarked);
    setLoading(false);
  }, [selectedClass, selectedSubject, selectedDate, selectedSlot, facultyEmail]);

  useEffect(() => {
    fetchFacultyOptions();
  }, [fetchFacultyOptions]);

  useEffect(() => {
    fetchRegister();
  }, [fetchRegister]);

  // Realtime Socket Event Subscriptions for Faculty Attendance Register
  useRealtimeEvent('medical_leave.submitted', (data) => {
    console.log('⚡ [Realtime Faculty UI] Student submitted a Medical Leave application!', data);
    fetchRegister();
  });

  // Bulk Status Updates
  const handleMarkAll = (targetStatus: string) => {
    setRoster((prev) =>
      prev.map((s) => ({
        ...s,
        status: targetStatus,
      }))
    );
  };

  // Individual Status Update
  const handleSingleStatusChange = (rollNumber: string, newStatus: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.rollNumber === rollNumber ? { ...s, status: newStatus } : s))
    );
  };

  // 3. Save Attendance Register to MySQL
  const handleSaveAttendance = async (force: boolean = false) => {
    if (roster.length === 0) {
      alert('No student records to save.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        className: selectedClass,
        subject: selectedSubject,
        date: selectedDate,
        timeSlot: selectedSlot,
        facultyEmail,
        facultyName,
        forceOverwrite: force,
        records: roster.map((r) => ({
          studentId: r.studentId,
          rollNumber: r.rollNumber,
          studentName: r.studentName,
          department: r.department,
          className: r.className,
          section: r.section,
          status: r.status,
          remarks: r.remarks || '',
        })),
      };

      try {
        const res = await axios.post('http://localhost:5000/api/attendance/mark-batch', payload);
        if (res.data && res.data.success) {
          alert(res.data.message || '✓ Attendance Register saved successfully in MySQL!');
          fetchRegister();
          return;
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Fallback batch posting to /api/attendance/mark
          for (const r of roster) {
            await axios.post('http://localhost:5000/api/attendance/mark', {
              rollNumber: r.rollNumber,
              studentName: r.studentName,
              className: selectedClass,
              department: r.department,
              semester: '5th Sem',
              section: r.section,
              subject: selectedSubject,
              subjectCode: 'CS-501',
              date: selectedDate,
              timeSlot: selectedSlot,
              status: r.status,
              facultyName,
              remarks: r.remarks || '',
            });
          }
          alert(`✓ Attendance Register saved successfully for ${roster.length} students in ${selectedClass} (${selectedSubject})!`);
          fetchRegister();
          return;
        }
        if (err.response?.status === 409 && err.response?.data?.duplicateDetected) {
          if (window.confirm(`${err.response.data.message}\n\nDo you want to overwrite/correct this attendance record now?`)) {
            handleSaveAttendance(true);
          }
        } else {
          alert(err.response?.data?.message || 'Failed to save attendance.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  // 4. Submit Attendance Correction Modal Action
  const handleExecuteCorrection = async () => {
    if (!correctionModalStudent || !correctionReason || correctionReason.trim().length < 5) {
      alert('Please provide a valid reason for attendance correction (minimum 5 characters).');
      return;
    }

    setSubmittingCorrection(true);
    try {
      const res = await axios.put('http://localhost:5000/api/attendance/correct', {
        attendanceId: correctionModalStudent.attendanceRecordId,
        rollNumber: correctionModalStudent.rollNumber,
        studentName: correctionModalStudent.studentName,
        className: selectedClass,
        subject: selectedSubject,
        date: selectedDate,
        timeSlot: selectedSlot,
        newStatus: correctionNewStatus,
        changedByEmail: facultyEmail,
        changedByName: facultyName,
        reason: correctionReason,
      });

      if (res.data && res.data.success) {
        alert(res.data.message || `✓ Attendance corrected to "${correctionNewStatus}"!`);
        setCorrectionModalStudent(null);
        setCorrectionReason('');
        fetchRegister();
        return;
      }
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 500) {
        try {
          // Fallback direct update/insert to /api/attendance/mark
          await axios.post('http://localhost:5000/api/attendance/mark', {
            rollNumber: correctionModalStudent.rollNumber,
            studentName: correctionModalStudent.studentName,
            className: selectedClass,
            department: correctionModalStudent.department || 'CSE',
            semester: '5th Sem',
            section: correctionModalStudent.section || 'A',
            subject: selectedSubject,
            subjectCode: 'CS-501',
            date: selectedDate,
            timeSlot: selectedSlot,
            status: correctionNewStatus,
            facultyName,
            remarks: `Corrected status to ${correctionNewStatus} (Reason: ${correctionReason})`,
          });

          alert(`✓ Attendance corrected to "${correctionNewStatus}" for ${correctionModalStudent.studentName}!`);
          setCorrectionModalStudent(null);
          setCorrectionReason('');
          fetchRegister();
          return;
        } catch (fbErr: any) {
          alert(fbErr.response?.data?.message || 'Correction failed.');
          return;
        }
      }
      alert(err.response?.data?.message || 'Correction failed.');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // Compute Metrics Summary
  const totalStudents = roster.length;
  const presentCount = roster.filter((r) => r.status === 'Present').length;
  const absentCount = roster.filter((r) => r.status === 'Absent').length;
  const odCount = roster.filter((r) => r.status === 'OD' || r.status === 'On Duty (OD)').length;
  const medicalCount = roster.filter((r) => r.status === 'Medical Leave').length;
  const averageAttendance =
    totalStudents > 0
      ? (roster.reduce((acc, r) => acc + (r.currentPercentage || 85), 0) / totalStudents).toFixed(1)
      : '85.0';

  const shortage75 = roster.filter((r) => (r.currentPercentage || 85) < 75.0).length;
  const shortage65 = roster.filter((r) => (r.currentPercentage || 85) < 65.0).length;

  // Filtered Roster View
  const filteredRoster = roster.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (s.studentName && s.studentName.toLowerCase().includes(q)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q));

    let matchesFilter = true;
    if (attendanceFilter === 'BELOW_75') matchesFilter = s.currentPercentage < 75.0;
    else if (attendanceFilter === 'BELOW_65') matchesFilter = s.currentPercentage < 65.0;
    else if (attendanceFilter === 'GOOD') matchesFilter = s.currentPercentage >= 75.0;
    else if (attendanceFilter === 'ABSENT_TODAY') matchesFilter = s.status === 'Absent';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span>FACULTY ATTENDANCE REGISTER</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lecture Slot Roll Call, Real-Time Student Portal Synchronization & Audit Trail Correction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized: {facultyName}</span>
          </span>
          <button
            onClick={fetchRegister}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
            title="Refresh Roster"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LECTURE SELECTION CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CLASS SELECTOR */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              <span>Assigned Class Section</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              {classesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* SUBJECT SELECTOR */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Taught Subject</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* DATE SELECTOR */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attendance Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* LECTURE SLOT SELECTOR */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lecture Period Slot</span>
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              {timeSlotsList.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {alreadyMarked && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-600 dark:text-amber-300">
            <span className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Notice: Attendance for this lecture slot has ALREADY been saved in MySQL database.</span>
            </span>
            <span className="font-mono text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-amber-500/20">
              Marked State Active
            </span>
          </div>
        )}
      </div>

      {/* SUMMARY METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-left">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Roster</span>
          <strong className="font-display font-black text-xl text-slate-900 dark:text-white">{totalStudents}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Present
          </span>
          <strong className="font-display font-black text-xl text-emerald-600 dark:text-emerald-400">{presentCount}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-500" /> Absent
          </span>
          <strong className="font-display font-black text-xl text-rose-600 dark:text-rose-400">{absentCount}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300 block uppercase">On Duty (OD)</span>
          <strong className="font-display font-black text-xl text-cyan-600 dark:text-cyan-300">{odCount}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 block uppercase">Medical Leave</span>
          <strong className="font-display font-black text-xl text-amber-600 dark:text-amber-300">{medicalCount}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-md text-left">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 block uppercase">Avg Class %</span>
          <strong className="font-display font-black text-xl text-purple-600 dark:text-purple-300">{averageAttendance}%</strong>
        </div>
      </div>

      {/* REGISTER ACTION BAR & ROSTER MATRIX TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        {/* CONTROL ACTIONS & FILTERS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>

            <button
              onClick={() => handleMarkAll('Absent')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SEARCH */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Roll No / Student Name..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* FILTER */}
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="ALL">Show All ({roster.length})</option>
              <option value="BELOW_75">Shortage (&lt;75%) ({shortage75})</option>
              <option value="BELOW_65">Critical (&lt;65%) ({shortage65})</option>
              <option value="GOOD">Good Attendance (&ge;75%)</option>
              <option value="ABSENT_TODAY">Marked Absent Today</option>
            </select>

            {/* SAVE ATTENDANCE BUTTON */}
            <button
              disabled={saving}
              onClick={() => handleSaveAttendance(false)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving to MySQL...' : 'Save Attendance Register'}</span>
            </button>
          </div>
        </div>

        {/* REGISTER TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider bg-slate-100 dark:bg-slate-950">
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Attendance Status</th>
                <th className="p-3">Current %</th>
                <th className="p-3">Previous %</th>
                <th className="p-3 text-right">Action / Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-mono font-bold">
                    Loading attendance register from MySQL...
                  </td>
                </tr>
              ) : filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-mono font-bold">
                    No student records found matching selected class and filters.
                  </td>
                </tr>
              ) : (
                filteredRoster.map((s) => (
                  <tr key={s.rollNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {s.rollNumber}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.studentName}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{s.email}</td>

                    {/* STATUS SELECTOR */}
                    <td className="p-3">
                      <select
                        value={s.status}
                        onChange={(e) => handleSingleStatusChange(s.rollNumber, e.target.value)}
                        className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                          s.status === 'Present'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                            : s.status === 'Absent'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40'
                            : s.status === 'OD' || s.status === 'On Duty (OD)'
                            ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/40'
                            : s.status === 'Medical Leave'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                            : s.status === 'Suspended'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40'
                            : s.status === 'Fees Not Paid but present (FP)'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40'
                            : 'bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/40'
                        }`}
                      >
                        <option value="Present">Present</option>
                        <option value="On Duty (OD)">On Duty (OD)</option>
                        <option value="Medical Leave">Medical Leave</option>
                        <option value="Absent">Absent</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Fees Not Paid but present (FP)">FP — Fees Not Paid but Present</option>
                        <option value="Fees Not Paid and Absent (FA)">FA — Fees Not Paid & Absent</option>
                      </select>
                    </td>

                    {/* CURRENT % BADGE */}
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black ${
                          s.currentPercentage >= 75
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {s.currentPercentage}%
                      </span>
                    </td>

                    {/* PREVIOUS % */}
                    <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{s.previousPercentage}%</td>

                    {/* ACTION CORRECTION BUTTON */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setCorrectionModalStudent(s);
                          setCorrectionNewStatus(s.status);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/10 dark:bg-purple-600/30 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs inline-flex items-center gap-1 border border-purple-500/30"
                        title="Request Authorized Attendance Correction"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Correct Status</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTENDANCE CORRECTION MODAL WITH AUDIT TRAIL LOGGING */}
      <AnimatePresence>
        {correctionModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCorrectionModalStudent(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-bold text-sm">
                  <Edit3 className="w-4 h-4 text-purple-500" />
                  <span>Correct Attendance & Audit Trail</span>
                </div>
                <button onClick={() => setCorrectionModalStudent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">{correctionModalStudent.studentName} ({correctionModalStudent.rollNumber})</span>
                  <span className="text-slate-500 block">Class: {selectedClass} • Subject: {selectedSubject}</span>
                  <span className="text-purple-600 dark:text-purple-300 font-mono block">Original Status: {correctionModalStudent.status}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Corrected Status</label>
                  <select
                    value={correctionNewStatus}
                    onChange={(e) => setCorrectionNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Present">Present</option>
                    <option value="On Duty (OD)">On Duty (OD)</option>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Absent">Absent</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Fees Not Paid but present (FP)">FP — Fees Not Paid but Present</option>
                    <option value="Fees Not Paid and Absent (FA)">FA — Fees Not Paid & Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Reason for Modification (Mandatory Audit Trail)</label>
                  <textarea
                    rows={3}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Type official reason for correcting attendance..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button onClick={() => setCorrectionModalStudent(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                  Cancel
                </button>
                <button
                  disabled={submittingCorrection}
                  onClick={handleExecuteCorrection}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                >
                  {submittingCorrection ? 'Logging Correction...' : 'Save Correction'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
