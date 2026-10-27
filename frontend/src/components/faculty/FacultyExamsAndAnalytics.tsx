import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Plus,
  RefreshCw,
  Calculator,
  UserCheck,
  FileSpreadsheet,
  Edit,
  History,
  X,
  Sparkles,
  ChevronDown,
  BookOpen,
  User,
  Users,
  Calendar,
  Percent,
  Award,
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import { type UserSession } from '../../types/auth';

interface ComponentScheme {
  name: string;
  type: 'MSE' | 'Class Test' | 'Presentation' | 'Project' | 'Attendance' | 'End Sem';
  maxMarks: number;
  weightage: number;
  isOptional?: boolean;
}

interface AttendanceBand {
  minPercent: number;
  maxPercent: number;
  marks: number;
}

interface StudentMarkRow {
  rollNumber: string;
  name: string;
  email: string;
  marksByComponent: { [compName: string]: number };
  attendancePercent: number;
  attendanceMarks: number;
  totalScore: number;
  grade: string;
  status: 'Draft' | 'Saved' | 'Published' | 'Corrected';
  remarks: string;
}

interface FacultyExamsAndAnalyticsProps {
  session: UserSession;
  inchargeClass?: string;
  facultyName?: string;
  facultyEmail?: string;
}

export const FacultyExamsAndAnalytics: React.FC<FacultyExamsAndAnalyticsProps> = ({
  session,
  inchargeClass = 'BTECH CSE 4A',
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(inchargeClass);
  const [selectedSemester, setSelectedSemester] = useState<string>('Semester 7');
  const [selectedSubject, setSelectedSubject] = useState<string>('Agile Software Development');
  const [subjectCode, setSubjectCode] = useState<string>('CSE-401');
  const [academicSession, setAcademicSession] = useState<string>('2025-2026');

  // Scheme Components State
  const [components, setComponents] = useState<ComponentScheme[]>([
    { name: 'Mid-Sem Exam 1 (MSE 1)', type: 'MSE', maxMarks: 10, weightage: 25 },
    { name: 'Mid-Sem Exam 2 (MSE 2)', type: 'MSE', maxMarks: 10, weightage: 25 },
    { name: 'Class Test 1', type: 'Class Test', maxMarks: 5, weightage: 12.5 },
    { name: 'Class Test 2', type: 'Class Test', maxMarks: 5, weightage: 12.5 },
    { name: 'Project & Presentation', type: 'Project', maxMarks: 10, weightage: 15 },
    { name: 'Attendance Marks', type: 'Attendance', maxMarks: 5, weightage: 10 },
  ]);

  const [attendanceBands] = useState<AttendanceBand[]>([
    { minPercent: 75, maxPercent: 80, marks: 1 },
    { minPercent: 80, maxPercent: 85, marks: 2 },
    { minPercent: 85, maxPercent: 90, marks: 3 },
    { minPercent: 90, maxPercent: 95, marks: 4 },
    { minPercent: 95, maxPercent: 100, marks: 5 },
  ]);

  // Students Marks State
  const [studentRows, setStudentRows] = useState<StudentMarkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sub-module view switcher: Configured Scheme Roster vs Flexible Marks Entry
  const [activeSubTab, setActiveSubTab] = useState<'scheme-roster' | 'flexible-entry'>('scheme-roster');

  // Flexible Marks Entry Workspace State
  const [flexibleMode, setFlexibleMode] = useState<'individual' | 'bulk'>('individual');
  const [flexSubjectName, setFlexSubjectName] = useState<string>('Artificial Intelligence & Neural Networks');
  const [flexSubjectCode, setFlexSubjectCode] = useState<string>('CSE-410');
  const [availableSubjectSuggestions, setAvailableSubjectSuggestions] = useState<Array<{ subject_code: string; subject_name: string }>>([]);
  const [flexAssessmentType, setFlexAssessmentType] = useState<string>('Mid-Semester Examination (MSE)');
  const [flexComponentName, setFlexComponentName] = useState<string>('MSE 1');
  const [flexMaxMarks, setFlexMaxMarks] = useState<number>(25);
  const [flexAssessmentDate, setFlexAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [flexStudentRoll, setFlexStudentRoll] = useState<string>('');
  const [flexMarksObtained, setFlexMarksObtained] = useState<number>(0);
  const [flexRemarks, setFlexRemarks] = useState<string>('');
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [bulkMarksMap, setBulkMarksMap] = useState<Record<string, { marks: number; remarks: string }>>({});

  // Modals
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState<{ studentRoll: string; componentName: string; currentMarks: number } | null>(null);
  const [correctionNewMarks, setCorrectionNewMarks] = useState<number>(0);
  const [correctionReason, setCorrectionReason] = useState<string>('');

  // Fetch Marks for Selected Class and Subject
  const fetchMarks = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await axios.get(`${API_BASE}/faculty/exams/marks`, {
        params: { className: selectedClass, subjectCode },
      });

      if (res.data.success) {
        const students = res.data.students || [];
        const existingMarks = res.data.marks || [];

        setRawStudents(students);
        if (students.length > 0 && !flexStudentRoll) {
          setFlexStudentRoll(students[0].roll_number);
        }

        const initBulk: Record<string, { marks: number; remarks: string }> = {};
        students.forEach((s: any) => {
          initBulk[s.roll_number] = { marks: 0, remarks: '' };
        });
        setBulkMarksMap((prev) => (Object.keys(prev).length === 0 ? initBulk : prev));

        // Map into table rows
        const rows: StudentMarkRow[] = students.map((stu: any) => {
          const marksForStu = existingMarks.filter((m: any) => m.studentRoll === stu.roll_number);
          const marksByComp: { [compName: string]: number } = {};
          let attMarks = 0;
          let attPct = 85;
          let status: any = 'Draft';
          let remarks = '';

          marksForStu.forEach((m: any) => {
            marksByComp[m.componentName] = m.marksObtained;
            if (m.attendanceMarks !== null && m.attendanceMarks !== undefined) attMarks = m.attendanceMarks;
            if (m.attendancePercent !== null && m.attendancePercent !== undefined) attPct = m.attendancePercent;
            if (m.status) status = m.status;
            if (m.facultyRemarks) remarks = m.facultyRemarks;
          });

          // calculate total score
          let total = 0;
          components.forEach((c) => {
            if (c.type === 'Attendance') {
              total += attMarks;
            } else {
              total += marksByComp[c.name] || 0;
            }
          });

          let grade = 'A';
          if (total >= 45) grade = 'A+';
          else if (total >= 40) grade = 'A';
          else if (total >= 35) grade = 'B';
          else if (total >= 30) grade = 'C';
          else grade = 'P';

          return {
            rollNumber: stu.roll_number,
            name: stu.full_name,
            email: stu.email,
            marksByComponent: marksByComp,
            attendancePercent: attPct,
            attendanceMarks: attMarks,
            totalScore: total,
            grade,
            status,
            remarks,
          };
        });

        setStudentRows(rows);
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/faculty/exams/subjects`, {
        params: { className: selectedClass },
      });
      if (res.data.success && Array.isArray(res.data.subjects)) {
        setAvailableSubjectSuggestions(res.data.subjects);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchMarks();
    fetchSubjects();
  }, [selectedClass, subjectCode]);

  // Handle Flexible Marks Entry Submit (Draft or Published)
  const handleSaveFlexibleMarks = async (publish: boolean) => {
    setLoading(true);
    setActionMsg(null);
    try {
      if (!flexSubjectName.trim()) {
        setActionMsg({ type: 'error', text: 'Please enter a valid Subject Name.' });
        setLoading(false);
        return;
      }

      if (flexMaxMarks <= 0) {
        setActionMsg({ type: 'error', text: 'Maximum marks must be a positive number greater than 0.' });
        setLoading(false);
        return;
      }

      const payload: any = {
        academicSession,
        className: selectedClass,
        semester: selectedSemester,
        subjectName: flexSubjectName.trim(),
        subjectCode: flexSubjectCode.trim() || undefined,
        assessmentType: flexAssessmentType,
        componentName: flexComponentName.trim() || flexAssessmentType,
        maxMarks: flexMaxMarks,
        assessmentDate: flexAssessmentDate,
        status: publish ? 'Published' : 'Draft',
        facultyEmail,
      };

      if (flexibleMode === 'individual') {
        if (!flexStudentRoll) {
          setActionMsg({ type: 'error', text: 'Please select a student.' });
          setLoading(false);
          return;
        }

        if (flexMarksObtained < 0 || flexMarksObtained > flexMaxMarks) {
          setActionMsg({
            type: 'error',
            text: `Marks obtained must be between 0 and maximum marks (${flexMaxMarks}).`,
          });
          setLoading(false);
          return;
        }

        const selectedStu = rawStudents.find((s) => s.roll_number === flexStudentRoll);
        payload.studentRoll = flexStudentRoll;
        payload.studentName = selectedStu?.full_name || 'Student';
        payload.studentEmail = selectedStu?.email || `${flexStudentRoll.toLowerCase()}@nexus.campus.edu`;
        payload.marksObtained = flexMarksObtained;
        payload.remarks = flexRemarks;
      } else {
        const entries = rawStudents.map((stu) => {
          const entry = bulkMarksMap[stu.roll_number] || { marks: 0, remarks: '' };
          return {
            studentRoll: stu.roll_number,
            studentName: stu.full_name,
            studentEmail: stu.email,
            marksObtained: Math.max(0, Math.min(Number(entry.marks) || 0, flexMaxMarks)),
            remarks: entry.remarks || '',
          };
        });
        payload.entries = entries;
      }

      const res = await axios.post(`${API_BASE}/faculty/exams/flexible-marks`, payload);
      if (res.data.success) {
        setActionMsg({
          type: 'success',
          text: res.data.message || (publish ? 'Marks successfully published to Student Portal!' : 'Draft marks saved.'),
        });
        fetchMarks();
        fetchSubjects();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Change for a student component
  const handleMarkChange = (rollNumber: string, componentName: string, maxMarks: number, value: string) => {
    const num = Math.max(0, Math.min(Number(value) || 0, maxMarks));
    setStudentRows((prev) =>
      prev.map((row) => {
        if (row.rollNumber === rollNumber) {
          const updatedComps = { ...row.marksByComponent, [componentName]: num };
          let total = 0;
          components.forEach((c) => {
            if (c.type === 'Attendance') {
              total += row.attendanceMarks;
            } else {
              total += updatedComps[c.name] || 0;
            }
          });

          let grade = 'A';
          if (total >= 45) grade = 'A+';
          else if (total >= 40) grade = 'A';
          else if (total >= 35) grade = 'B';
          else if (total >= 30) grade = 'C';
          else grade = 'P';

          return {
            ...row,
            marksByComponent: updatedComps,
            totalScore: total,
            grade,
          };
        }
        return row;
      })
    );
  };

  // Calculate Attendance Marks via Backend API
  const handleCalculateAttendanceMarks = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      let updatedCount = 0;
      const updatedRows = [...studentRows];

      for (let i = 0; i < updatedRows.length; i++) {
        const row = updatedRows[i];
        try {
          const res = await axios.post(`${API_BASE}/faculty/exams/calculate-attendance-marks`, {
            studentRoll: row.rollNumber,
            className: selectedClass,
            subjectCode,
            attendancePolicy: attendanceBands,
          });

          if (res.data.success) {
            row.attendancePercent = res.data.attendancePercent;
            row.attendanceMarks = res.data.attendanceMarks;

            let total = 0;
            components.forEach((c) => {
              if (c.type === 'Attendance') {
                total += row.attendanceMarks;
              } else {
                total += row.marksByComponent[c.name] || 0;
              }
            });
            row.totalScore = total;
            updatedCount++;
          }
        } catch (e) {}
      }

      setStudentRows(updatedRows);
      setActionMsg({
        type: 'success',
        text: `Successfully calculated attendance-derived marks from authoritative logs for ${updatedCount} students!`,
      });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Save or Publish Marks
  const handleSaveMarks = async (publish: boolean) => {
    setLoading(true);
    setActionMsg(null);
    try {
      // Flatten into array of entries
      const marksPayload: any[] = [];
      studentRows.forEach((row) => {
        components.forEach((comp) => {
          marksPayload.push({
            studentRoll: row.rollNumber,
            studentName: row.name,
            studentEmail: row.email,
            componentName: comp.name,
            marksObtained: comp.type === 'Attendance' ? row.attendanceMarks : row.marksByComponent[comp.name] || 0,
            maxMarks: comp.maxMarks,
            attendancePercent: row.attendancePercent,
            attendanceMarks: row.attendanceMarks,
            totalScore: row.totalScore,
            grade: row.grade,
            facultyRemarks: row.remarks,
          });
        });
      });

      const res = await axios.post(`${API_BASE}/faculty/exams/save-marks`, {
        schemeId: `SCH-${selectedClass.replace(/\s+/g, '')}-${subjectCode}`,
        subjectCode,
        subjectName: selectedSubject,
        className: selectedClass,
        semester: selectedSemester,
        facultyEmail,
        status: publish ? 'Published' : 'Saved',
        marks: marksPayload,
      });

      if (res.data.success) {
        setActionMsg({
          type: 'success',
          text: publish
            ? '🚀 All assessment marks successfully PUBLISHED! Visible instantly in Student Portal with real-time chart updates.'
            : '💾 Assessment marks saved to database as Draft.',
        });
        fetchMarks();
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Submit Mark Correction Audit
  const handleApplyCorrection = async () => {
    if (!correctionTarget || !correctionReason) {
      alert('Please provide a reason for mark correction.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/faculty/exams/correct-mark`, {
        studentRoll: correctionTarget.studentRoll,
        subjectCode,
        componentName: correctionTarget.componentName,
        newMarks: correctionNewMarks,
        reason: correctionReason,
        facultyEmail,
      });

      if (res.data.success) {
        setIsCorrectionModalOpen(false);
        setActionMsg({
          type: 'success',
          text: `Mark corrected and audited in database (Audit Log ID: ${res.data.logId})!`,
        });
        fetchMarks();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span>Exams, Marks & Results Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Configure Assessment Schemes • Enter Individual Student Marks • Compute Attendance Marks • Publish to Student Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSchemeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Configure Scheme</span>
          </button>

          <button
            onClick={handleCalculateAttendanceMarks}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculate Attendance Marks</span>
          </button>
        </div>
      </div>

      {/* SUB-MODULE VIEW SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('scheme-roster')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'scheme-roster'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Configured Scheme Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('flexible-entry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'flexible-entry'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Flexible Quick Marks Entry</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              NEW
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          Active Class: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedClass}</span>
        </div>
      </div>

      {activeSubTab === 'scheme-roster' ? (
        <>
          {/* FILTER CONTROLS BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Academic Session</label>
          <input
            type="text"
            value={academicSession}
            onChange={(e) => setAcademicSession(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Assigned Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="BTECH CSE 4A">BTECH CSE 4A</option>
            <option value="BTECH CSE 2023 A">BTECH CSE 2023 A</option>
            <option value="BCA 3B">BCA 3B</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="Semester 7">Semester 7</option>
            <option value="Semester 5">Semester 5</option>
            <option value="Semester 3">Semester 3</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              if (e.target.value === 'Agile Software Development') setSubjectCode('CSE-401');
              else if (e.target.value === 'Blockchain Technologies') setSubjectCode('CSE-402');
              else setSubjectCode('CSE-403');
            }}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="Agile Software Development">Agile Software Development</option>
            <option value="Blockchain Technologies">Blockchain Technologies</option>
            <option value="Database Management Systems">Database Management Systems</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject Code</label>
          <input
            type="text"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* ACTION BANNER */}
      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* MARKS ENTRY SPREADSHEET TABLE */}
      <div className="bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900 dark:text-white">Assessment Roster:</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
              {studentRows.length} Students Enrolled
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              Max Total: 50 Marks
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleSaveMarks(false)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => handleSaveMarks(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#7c3aed] hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish to Student Portal</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 sticky top-0 z-20 backdrop-blur border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">Roll No</th>
                <th className="p-3 font-bold text-slate-500 uppercase tracking-wider min-w-[180px]">Student Name</th>
                {components.map((c, i) => (
                  <th key={i} className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center min-w-[110px]">
                    <div>{c.name}</div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-normal">
                      (Max {c.maxMarks})
                    </span>
                  </th>
                ))}
                <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center min-w-[90px]">Total (50)</th>
                <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center min-w-[70px]">Grade</th>
                <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center min-w-[90px]">Status</th>
                <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center min-w-[80px]">Audit</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {studentRows.length === 0 ? (
                <tr>
                  <td colSpan={components.length + 5} className="p-8 text-center text-slate-400 font-medium">
                    No students found for class {selectedClass}. Ensure class roster exists.
                  </td>
                </tr>
              ) : (
                studentRows.map((stu) => (
                  <tr key={stu.rollNumber} className="hover:bg-purple-500/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{stu.rollNumber}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{stu.name}</td>

                    {/* Component mark inputs */}
                    {components.map((c, i) => {
                      const isAtt = c.type === 'Attendance';
                      const val = isAtt ? stu.attendanceMarks : stu.marksByComponent[c.name] ?? '';

                      return (
                        <td key={i} className="p-2 text-center">
                          {isAtt ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                {stu.attendanceMarks} / {c.maxMarks}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">{stu.attendancePercent}% Att.</span>
                            </div>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              max={c.maxMarks}
                              value={val}
                              onChange={(e) => handleMarkChange(stu.rollNumber, c.name, c.maxMarks, e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                            />
                          )}
                        </td>
                      );
                    })}

                    <td className="p-3 text-center font-mono font-black text-slate-900 dark:text-white text-sm">
                      {stu.totalScore}
                    </td>

                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {stu.grade}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stu.status === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : stu.status === 'Corrected'
                            ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {stu.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setCorrectionTarget({
                            studentRoll: stu.rollNumber,
                            componentName: components[0]?.name || 'Mid-Sem Exam 1 (MSE 1)',
                            currentMarks: stu.marksByComponent[components[0]?.name] || 0,
                          });
                          setCorrectionNewMarks(stu.marksByComponent[components[0]?.name] || 0);
                          setCorrectionReason('');
                          setIsCorrectionModalOpen(true);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600 transition-colors"
                        title="Audited Mark Correction"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        /* FLEXIBLE QUICK MARKS ENTRY WORKSPACE */
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Top Workspace Header & Mode Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20 font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Flexible Assessment & Marks Dispatcher
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Type any custom or existing subject name, choose an assessment category, and enter marks directly.
                </p>
              </div>

              {/* Mode Toggle: Individual vs Bulk */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFlexibleMode('individual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    flexibleMode === 'individual'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Individual Entry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlexibleMode('bulk')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    flexibleMode === 'bulk'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Bulk Class Entry</span>
                </button>
              </div>
            </div>

            {/* Assessment Meta Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Academic Session */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Academic Session</label>
                <input
                  type="text"
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Class & Section */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Class & Section</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="BTECH CSE 4A">BTECH CSE 4A</option>
                  <option value="BTECH CSE 2023 A">BTECH CSE 2023 A</option>
                  <option value="BCA 3B">BCA 3B</option>
                </select>
              </div>

              {/* Subject Name (with Autocomplete / Free-text) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-400">Subject Name (Type freely or choose)</label>
                  {availableSubjectSuggestions.length > 0 && (
                    <span className="text-[10px] text-purple-500 font-medium">
                      {availableSubjectSuggestions.length} known subjects
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    list="subject-suggestions-list"
                    value={flexSubjectName}
                    onChange={(e) => {
                      setFlexSubjectName(e.target.value);
                      const match = availableSubjectSuggestions.find(
                        (s) => s.subject_name.toLowerCase() === e.target.value.toLowerCase()
                      );
                      if (match) {
                        setFlexSubjectCode(match.subject_code);
                      }
                    }}
                    placeholder="e.g. Artificial Intelligence, Cryptography, Agile Dev..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <datalist id="subject-suggestions-list">
                    {availableSubjectSuggestions.map((s, i) => (
                      <option key={i} value={s.subject_name}>
                        {s.subject_code}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Subject Code */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject Code</label>
                <input
                  type="text"
                  value={flexSubjectCode}
                  onChange={(e) => setFlexSubjectCode(e.target.value)}
                  placeholder="e.g. CSE-410 (auto if empty)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Assessment Type / Category */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Assessment Type</label>
                <select
                  value={flexAssessmentType}
                  onChange={(e) => {
                    setFlexAssessmentType(e.target.value);
                    if (e.target.value === 'Mid-Semester Examination (MSE)') setFlexComponentName('MSE 1');
                    else if (e.target.value === 'Class Test') setFlexComponentName('Class Test 1');
                    else if (e.target.value === 'Practical/Lab') setFlexComponentName('Lab Practical');
                    else if (e.target.value === 'Viva') setFlexComponentName('Viva Voce');
                    else if (e.target.value === 'Presentation') setFlexComponentName('Project Presentation');
                    else if (e.target.value === 'Assignment') setFlexComponentName('Assignment 1');
                    else setFlexComponentName(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="Mid-Semester Examination (MSE)">Mid-Semester Examination (MSE)</option>
                  <option value="Class Test">Class Test</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Practical/Lab">Practical / Lab</option>
                  <option value="Viva">Viva Voce</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Internal Examination">Internal Examination</option>
                  <option value="Other">Other Assessment</option>
                </select>
              </div>

              {/* Assessment Name or Component */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Assessment / Component Name</label>
                <input
                  type="text"
                  value={flexComponentName}
                  onChange={(e) => setFlexComponentName(e.target.value)}
                  placeholder="e.g. MSE 1, Quiz 2, Viva 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Maximum Marks & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Max Marks (&gt; 0)</label>
                  <input
                    type="number"
                    min={1}
                    value={flexMaxMarks}
                    onChange={(e) => setFlexMaxMarks(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={flexAssessmentDate}
                    onChange={(e) => setFlexAssessmentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* MODE A: INDIVIDUAL ENTRY */}
            {flexibleMode === 'individual' ? (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Individual Student Marks Form</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Select Student</label>
                    <select
                      value={flexStudentRoll}
                      onChange={(e) => setFlexStudentRoll(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {rawStudents.length === 0 ? (
                        <option value="">No students found</option>
                      ) : (
                        rawStudents.map((s) => (
                          <option key={s.roll_number} value={s.roll_number}>
                            {s.roll_number} — {s.full_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-400">Marks Obtained</label>
                      <span className="text-[10px] text-purple-600 font-mono">Max: {flexMaxMarks}</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={flexMaxMarks}
                      step={0.5}
                      value={flexMarksObtained}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFlexMarksObtained(Math.max(0, Math.min(val, flexMaxMarks)));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  {/* Realtime Calculation Preview */}
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-around">
                    <div className="text-center">
                      <div className="text-[10px] text-purple-400 font-bold uppercase">Percentage</div>
                      <div className="font-mono font-black text-sm text-purple-600 dark:text-purple-300">
                        {flexMaxMarks > 0 ? ((flexMarksObtained / flexMaxMarks) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    <div className="h-8 w-px bg-purple-500/20" />
                    <div className="text-center">
                      <div className="text-[10px] text-purple-400 font-bold uppercase">Estimated Grade</div>
                      <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {(() => {
                          const pct = flexMaxMarks > 0 ? (flexMarksObtained / flexMaxMarks) * 100 : 0;
                          return pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'P';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Optional Remarks / Academic Feedback
                  </label>
                  <input
                    type="text"
                    value={flexRemarks}
                    onChange={(e) => setFlexRemarks(e.target.value)}
                    placeholder="e.g. Demonstrated exemplary problem analysis; suggested reinforcement on graph theory."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveFlexibleMarks(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft (Hidden from Student)</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveFlexibleMarks(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Result to Student Portal</span>
                  </button>
                </div>
              </div>
            ) : (
              /* MODE B: BULK ENTRY TABLE */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      Bulk Marks Entry Roster ({rawStudents.length} Students)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                    Max Marks: {flexMaxMarks}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/90 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center w-36">
                          Marks (Max {flexMaxMarks})
                        </th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center w-24">Pct %</th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider text-center w-20">Grade</th>
                        <th className="p-3 font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {rawStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            No students enrolled in {selectedClass}.
                          </td>
                        </tr>
                      ) : (
                        rawStudents.map((stu) => {
                          const item = bulkMarksMap[stu.roll_number] || { marks: 0, remarks: '' };
                          const marksVal = Number(item.marks) || 0;
                          const pct = flexMaxMarks > 0 ? ((marksVal / flexMaxMarks) * 100).toFixed(1) : '0';
                          const grade = Number(pct) >= 90 ? 'A+' : Number(pct) >= 80 ? 'A' : Number(pct) >= 70 ? 'B' : Number(pct) >= 60 ? 'C' : 'P';

                          return (
                            <tr key={stu.roll_number} className="hover:bg-purple-500/5 transition-colors">
                              <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{stu.roll_number}</td>
                              <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{stu.full_name}</td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={flexMaxMarks}
                                  step={0.5}
                                  value={item.marks}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(Number(e.target.value) || 0, flexMaxMarks));
                                    setBulkMarksMap((prev) => ({
                                      ...prev,
                                      [stu.roll_number]: { ...prev[stu.roll_number], marks: val },
                                    }));
                                  }}
                                  className="w-24 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                                {pct}%
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                  {grade}
                                </span>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.remarks}
                                  placeholder="Feedback..."
                                  onChange={(e) => {
                                    const rmk = e.target.value;
                                    setBulkMarksMap((prev) => ({
                                      ...prev,
                                      [stu.roll_number]: { ...prev[stu.roll_number], remarks: rmk },
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveFlexibleMarks(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All as Draft</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveFlexibleMarks(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish All to Student Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MARK CORRECTION AUDIT MODAL */}
      <AnimatePresence>
        {isCorrectionModalOpen && correctionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Audited Mark Correction</h3>
                </div>
                <button onClick={() => setIsCorrectionModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Any changes to published marks are permanently recorded in the institutional audit log table with your identity and reason.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Student Roll Number</label>
                  <input
                    type="text"
                    disabled
                    value={correctionTarget.studentRoll}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Assessment Component</label>
                  <select
                    value={correctionTarget.componentName}
                    onChange={(e) =>
                      setCorrectionTarget({ ...correctionTarget, componentName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {components
                      .filter((c) => c.type !== 'Attendance')
                      .map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name} (Max {c.maxMarks})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">New Marks Obtained</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={correctionNewMarks}
                    onChange={(e) => setCorrectionNewMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/5 font-mono text-sm font-bold text-purple-600 dark:text-purple-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Official Reason for Correction</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Re-evaluation of question 3 upon student grievance request."
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCorrection}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  Commit Audited Correction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEME CONFIGURATION MODAL */}
      <AnimatePresence>
        {isSchemeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Assessment Scheme Architecture</h3>
                </div>
                <button onClick={() => setIsSchemeModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Evaluation breakdown components and maximum marks for {selectedSubject} ({selectedClass}).
              </p>

              <div className="space-y-3">
                {components.map((comp, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{comp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Type: {comp.type} • Weightage: {comp.weightage}%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono bg-purple-500/10 px-2.5 py-1 rounded-xl">
                        Max: {comp.maxMarks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSchemeModalOpen(false);
                    setActionMsg({ type: 'success', text: 'Evaluation scheme saved.' });
                  }}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  Confirm Scheme Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
