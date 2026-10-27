import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  User,
  Calendar,
  Award,
  CheckCircle,
} from 'lucide-react';

import { type AssignmentItem } from './AssignmentsAndWork';

const DEFAULT_CARD_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asgn-1',
    topicName: 'Smart Contract Vulnerability Audit & Gas Optimization',
    subjectName: 'BLOCKCHAIN TECHNOLOGIES THEORY',
    subjectCode: 'CSE-405',
    facultyName: 'SMB',
    assignmentType: 'Subjective',
    totalMarks: 50,
    scoredMarks: 46,
    deadlineDate: '2026-08-02',
    deadlineTime: '11:59 PM',
    status: 'Submitted',
    submittedDate: '2026-08-01 08:30 PM',
    uploadedFileName: 'solidity_audit_report.pdf',
    uploadedFileType: 'pdf',
    uploadedFileSize: '2.4 MB',
    facultyRemarks: 'Exceptional depth in reentrancy attack mitigation analysis!',
    description: 'Detailed analysis of Solidity smart contract vulnerabilities.',
  },
  {
    id: 'asgn-2',
    topicName: 'Objective Quiz on Decentralized Consensus Protocols',
    subjectName: 'BLOCKCHAIN TECHNOLOGIES LAB',
    subjectCode: 'CSE-455',
    facultyName: 'SMB',
    assignmentType: 'Objective',
    totalMarks: 25,
    scoredMarks: 24,
    deadlineDate: '2026-08-03',
    deadlineTime: '05:00 PM',
    status: 'Submitted',
    submittedDate: '2026-08-02 04:15 PM',
    uploadedFileName: 'consensus_mcq_answers.pdf',
    uploadedFileType: 'pdf',
    uploadedFileSize: '1.1 MB',
    facultyRemarks: 'Great score! Correctly answered all PoS questions.',
    description: 'Multiple choice objective assignment on Raft and BFT.',
  },
  {
    id: 'asgn-3',
    topicName: 'Agile Sprint Velocity Calculation & Story Point Sheet',
    subjectName: 'AGILE SOFTWARE DEVELOPMENT THEORY',
    subjectCode: 'CSE-403',
    facultyName: 'RNJ',
    assignmentType: 'Objective',
    totalMarks: 25,
    scoredMarks: 21,
    deadlineDate: '2026-08-04',
    deadlineTime: '11:59 PM',
    status: 'Submitted',
    submittedDate: '2026-08-03 10:00 AM',
    uploadedFileName: 'sprint_velocity_calc.xlsx',
    uploadedFileType: 'xlsx',
    uploadedFileSize: '850 KB',
    facultyRemarks: 'Burn-down rate formulas solved accurately.',
    description: 'Excel calculation sheet for sprint velocity planning.',
  },
  {
    id: 'asgn-4',
    topicName: 'Jira Board Setup & Scrum Ceremony Documentation',
    subjectName: 'AGILE SOFTWARE DEVELOPMENT LAB',
    subjectCode: 'CSE-453',
    facultyName: 'RNJ',
    assignmentType: 'Subjective',
    totalMarks: 50,
    scoredMarks: null,
    deadlineDate: '2026-08-08',
    deadlineTime: '11:59 PM',
    status: 'Pending',
    submittedDate: null,
    uploadedFileName: null,
    uploadedFileType: null,
    uploadedFileSize: null,
    facultyRemarks: null,
    description: 'Document your team Jira workflow and sprint retrospective.',
  },
  {
    id: 'asgn-5',
    topicName: 'Project Phase-II Architecture & System Specs',
    subjectName: 'PROJECT-II',
    subjectCode: 'CSE-409',
    facultyName: 'PRT',
    assignmentType: 'Subjective',
    totalMarks: 50,
    scoredMarks: 38,
    deadlineDate: '2026-08-05',
    deadlineTime: '06:00 PM',
    status: 'Incomplete but Submitted',
    submittedDate: '2026-08-04 05:45 PM',
    uploadedFileName: 'project_phase2_draft.docx',
    uploadedFileType: 'docx',
    uploadedFileSize: '3.8 MB',
    facultyRemarks: 'System architecture submitted, but UML sequence flow chart section is incomplete.',
    description: 'Comprehensive design document detailing system architecture.',
  },
  {
    id: 'asgn-6',
    topicName: 'Cryptographic Encryption Algorithms (RSA & AES-256)',
    subjectName: 'NETWORK SECURITY AND CRYPTOGRAPHY',
    subjectCode: 'NSC',
    facultyName: 'HSD',
    assignmentType: 'Objective',
    totalMarks: 25,
    scoredMarks: null,
    deadlineDate: '2026-08-07',
    deadlineTime: '05:00 PM',
    status: 'Pending',
    submittedDate: null,
    uploadedFileName: null,
    uploadedFileType: null,
    uploadedFileSize: null,
    facultyRemarks: null,
    description: 'Objective problem set covering RSA prime number generation.',
  },
  {
    id: 'asgn-7',
    topicName: 'Solar & Wind Hybrid Energy System Feasibility Study',
    subjectName: 'NON CONVENTIONAL ENERGY RESOURCES',
    subjectCode: 'NCE',
    facultyName: 'VS',
    assignmentType: 'Subjective',
    totalMarks: 50,
    scoredMarks: null,
    deadlineDate: '2026-08-11',
    deadlineTime: '11:59 PM',
    status: 'Pending',
    submittedDate: null,
    uploadedFileName: null,
    uploadedFileType: null,
    uploadedFileSize: null,
    facultyRemarks: null,
    description: 'Technical report on hybrid renewable energy generation.',
  },
  {
    id: 'asgn-8',
    topicName: 'Apriori Association Mining & Data Warehouse Schema',
    subjectName: 'DATA MINING AND DATA WAREHOUSING',
    subjectCode: 'DMDW',
    facultyName: 'PRK',
    assignmentType: 'Objective',
    totalMarks: 25,
    scoredMarks: 25,
    deadlineDate: '2026-08-01',
    deadlineTime: '11:59 PM',
    status: 'Submitted',
    submittedDate: '2026-07-31 09:15 PM',
    uploadedFileName: 'apriori_dw_pipeline.xlsx',
    uploadedFileType: 'xlsx',
    uploadedFileSize: '1.4 MB',
    facultyRemarks: 'Perfect score! Star schema dimensional modeling solved.',
    description: 'Data warehouse star schema model and association mining.',
  },
];

interface AssignmentsSquareCardProps {
  onNavigateToAssignments?: () => void;
}

export const AssignmentsSquareCard: React.FC<AssignmentsSquareCardProps> = ({
  onNavigateToAssignments,
}) => {
  const [assignmentsList, setAssignmentsList] = useState<AssignmentItem[]>(DEFAULT_CARD_ASSIGNMENTS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  // Sync with MySQL backend
  useEffect(() => {
    const fetchRealCardAssignments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/faculty/assignments');
        if (res.data && res.data.success && Array.isArray(res.data.assignments) && res.data.assignments.length > 0) {
          const formatted: AssignmentItem[] = res.data.assignments.map((a: any) => ({
            id: a.assignmentId || a.assignment_id || `asgn_${a.id}`,
            topicName: a.title || a.topic_name || 'Assignment Title',
            subjectName: a.subject || a.subject_name || 'Computer Science',
            subjectCode: a.subjectCode || a.subject_code || 'CS-501',
            facultyName: a.facultyName || a.faculty_name || 'Faculty Incharge',
            assignmentType: (a.assignmentType || a.assignment_type) === 'Objective' ? 'Objective' : 'Subjective',
            totalMarks: a.totalMarks || a.total_marks || 50,
            scoredMarks: a.scored_marks || null,
            deadlineDate: a.deadlineDate || (a.deadline_date ? String(a.deadline_date).substring(0, 10) : '2026-09-30'),
            deadlineTime: a.deadlineTime || a.deadline_time || '11:59 PM',
            status: a.status === 'Submitted' ? 'Submitted' : 'Pending',
            submittedDate: a.submitted_date || null,
            uploadedFileName: a.uploaded_file_name || null,
            uploadedFileType: 'pdf',
            uploadedFileSize: '1.5 MB',
            facultyRemarks: a.faculty_remarks || null,
            description: a.description || '',
          }));
          setAssignmentsList(formatted);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchRealCardAssignments();
  }, []);

  // 10-Second Auto Play Rotator
  useEffect(() => {
    if (!isAutoPlay || assignmentsList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % assignmentsList.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoPlay, assignmentsList.length]);

  const currentItem = assignmentsList[currentIndex % assignmentsList.length] || assignmentsList[0];

  const isSubmitted = currentItem.status === 'Submitted';
  const isIncomplete = currentItem.status === 'Incomplete but Submitted';

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500 to-red-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* Top Header Control (Identical Parity to Cards #1, #2, #3) */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Assignments & Work
            </h4>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Tasks: ({currentIndex + 1}/{assignmentsList.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Play/Pause Rotator Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoPlay(!isAutoPlay);
            }}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title={isAutoPlay ? 'Pause 10s Rotator' : 'Play 10s Rotator'}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ROTATING ASSIGNMENT CARD BODY */}
      <div className="flex-1 my-3 relative overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id + currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col justify-between h-full space-y-2"
          >
            {/* Top Code & Type Row */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold border border-rose-200 dark:border-rose-800/60">
                {currentItem.subjectCode}
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold text-[10px]">
                {currentItem.assignmentType} ({currentItem.totalMarks}M)
              </span>
            </div>

            {/* Topic Title */}
            <div>
              <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                {currentItem.topicName}
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-1">
                <User className="w-3 h-3 text-purple-500 shrink-0" />
                Faculty: <strong className="font-mono text-purple-600 dark:text-purple-400">{currentItem.facultyName}</strong>
              </span>
            </div>

            {/* Status & Marks Footer Row */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">Due: {currentItem.deadlineDate}</span>
              </div>

              <div className="flex items-center justify-end">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${
                  isSubmitted
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300'
                    : isIncomplete
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-300'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300'
                }`}>
                  {isSubmitted && <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />}
                  {isIncomplete && <AlertTriangle className="w-2.5 h-2.5 text-orange-500" />}
                  <span>{currentItem.status}</span>
                </span>
              </div>
            </div>

            {/* Scored Marks Badge (If Evaluated) */}
            {currentItem.scoredMarks !== null && (
              <div className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] font-black flex items-center justify-between text-purple-700 dark:text-purple-300">
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-purple-500" /> Marks Scored:
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400">
                  {currentItem.scoredMarks} / {currentItem.totalMarks}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 10-SECOND ANIMATED LOADING PROGRESS BAR */}
        {isAutoPlay && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Action Footer (Identical Parity to Cards #1, #2, #3) */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToAssignments) onNavigateToAssignments();
          }}
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
        >
          <span>Open Assignments & Work</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + assignmentsList.length) % assignmentsList.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Previous Assignment"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % assignmentsList.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Next Assignment"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
