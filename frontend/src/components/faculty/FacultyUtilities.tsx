import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import jsPDF from 'jspdf';
import {
  Wrench,
  FileText,
  Mail,
  Sparkles,
  FileSpreadsheet,
  Calendar,
  Calculator as CalcIcon,
  ExternalLink,
  Plus,
  Pin,
  Trash2,
  CheckCircle2,
  Copy,
  Download,
  ChevronRight,
} from 'lucide-react';
import { type UserSession } from '../../types/auth';

interface FacultyUtilitiesProps {
  session?: UserSession | null;
  facultyName?: string;
  facultyEmail?: string;
  department?: string;
}

export const FacultyUtilities: React.FC<FacultyUtilitiesProps> = ({
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
  department = 'Computer Science & Engineering',
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'notes'
    | 'email'
    | 'copilot'
    | 'paper'
    | 'notice'
    | 'reports'
    | 'tasks'
    | 'calculator'
    | 'links'
  >('overview');

  // ==========================================
  // 1. QUICK NOTES STATE & API
  // ==========================================
  const [notesList, setNotesList] = useState<any[]>([]);
  const [noteCategoryFilter, setNoteCategoryFilter] = useState('All');
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Teaching');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/notes?email=${encodeURIComponent(facultyEmail)}`
      );
      if (res.data && res.data.notes) {
        setNotesList(res.data.notes);
      }
    } catch (err) {
      setNotesList([]);
    }
  }, [facultyEmail]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) {
      alert('Please provide note title and details');
      return;
    }

    try {
      if (editingNoteId) {
        await axios.put(`https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/notes/${editingNoteId}`, {
          title: noteTitle,
          content: noteContent,
          category: noteCategory,
          isPinned: false,
          isArchived: false,
        });
      } else {
        await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/notes', {
          facultyEmail,
          title: noteTitle,
          content: noteContent,
          category: noteCategory,
          isPinned: false,
        });
      }

      setNoteTitle('');
      setNoteContent('');
      setEditingNoteId(null);
      setIsNewNoteOpen(false);
      fetchNotes();
    } catch (err) {
      alert('Failed to save note');
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await axios.delete(`https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/notes/${id}`);
      fetchNotes();
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  const handleTogglePin = async (note: any) => {
    try {
      await axios.put(`https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/notes/${note.id}`, {
        title: note.title,
        content: note.content,
        category: note.category,
        isPinned: !note.isPinned,
        isArchived: note.isArchived,
      });
      fetchNotes();
    } catch (err) {
      alert('Failed to pin note');
    }
  };

  // ==========================================
  // 2. TASKS & REMINDERS STATE & API
  // ==========================================
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('NORMAL');
  const [taskCategory, setTaskCategory] = useState('Teaching');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/tasks?email=${encodeURIComponent(facultyEmail)}`
      );
      if (res.data && res.data.tasks) {
        setTasksList(res.data.tasks);
      }
    } catch (err) {
      setTasksList([]);
    }
  }, [facultyEmail]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/tasks', {
        facultyEmail,
        title: taskTitle,
        description: taskDesc,
        dueDate: taskDueDate,
        priority: taskPriority,
        category: taskCategory,
      });

      setTaskTitle('');
      setTaskDesc('');
      setIsNewTaskOpen(false);
      fetchTasks();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await axios.put(`https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/tasks/${task.id}`, {
        status: nextStatus,
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await axios.delete(`https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchTasks();
  }, [fetchNotes, fetchTasks]);

  // ==========================================
  // 3. AI EMAIL & MESSAGE ASSISTANT STATE
  // ==========================================
  const [aiRecipient, setAiRecipient] = useState('B.Tech CSE 4A Students');
  const [aiSubject, setAiSubject] = useState('');
  const [aiPurpose, setAiPurpose] = useState('');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiLength, setAiLength] = useState('Medium');
  const [aiGeneratedEmail, setAiGeneratedEmail] = useState<any | null>(null);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  const handleDraftAIEmail = async () => {
    if (!aiPurpose) {
      alert('Please enter a purpose or simple instruction');
      return;
    }
    setIsDraftingEmail(true);
    try {
      const res = await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/ai/draft-email', {
        recipient: aiRecipient,
        subject: aiSubject,
        purpose: aiPurpose,
        tone: aiTone,
        length: aiLength,
      });
      if (res.data && res.data.email) {
        setAiGeneratedEmail(res.data.email);
      }
    } catch (err) {
      alert('Failed to generate AI email');
    } finally {
      setIsDraftingEmail(false);
    }
  };

  // ==========================================
  // 4. AI QUESTION PAPER GENERATOR STATE
  // ==========================================
  const [qpSubject, setQpSubject] = useState('Database Management Systems');
  const [qpTopic, setQpTopic] = useState('Relational Algebra & Normalization');
  const [qpTotalMarks, setQpTotalMarks] = useState('50');
  const [qpDuration, setQpDuration] = useState('2 Hours');
  const [qpDifficulty, setQpDifficulty] = useState('Mixed');
  const [qpQuestionType, setQpQuestionType] = useState('Mixed');
  const [qpTotalQuestions, setQpTotalQuestions] = useState('10');
  const [generatedPaper, setGeneratedPaper] = useState<any | null>(null);
  const [isGeneratingPaper, setIsGeneratingPaper] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const handleGenerateQuestionPaper = async () => {
    setIsGeneratingPaper(true);
    try {
      const res = await axios.post('https://nexus-smart-campus-backend.onrender.com/api/faculty/utilities/ai/generate-question-paper', {
        subject: qpSubject,
        topic: qpTopic,
        totalMarks: qpTotalMarks,
        duration: qpDuration,
        difficulty: qpDifficulty,
        questionType: qpQuestionType,
        totalQuestions: qpTotalQuestions,
      });
      if (res.data && res.data.paper) {
        setGeneratedPaper(res.data.paper);
      }
    } catch (err) {
      alert('Failed to generate question paper');
    } finally {
      setIsGeneratingPaper(false);
    }
  };

  const handleDownloadQuestionPaperPDF = () => {
    if (!generatedPaper) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(generatedPaper.university, 105, 10, { align: 'center' });
      doc.setFontSize(9);
      doc.text(generatedPaper.department, 105, 17, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.text(`SUBJECT: ${generatedPaper.subject}`, 14, 34);
      doc.text(`TOPIC: ${generatedPaper.topic}`, 14, 40);
      doc.text(`MARKS: ${generatedPaper.totalMarks} | TIME: ${generatedPaper.duration}`, 140, 34);

      let yPos = 50;
      generatedPaper.questions.forEach((q: any) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(`${q.question} [${q.marks} Marks]`, 14, yPos);
        yPos += 6;
        if (q.options) {
          q.options.forEach((opt: string) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.text(`   ${opt}`, 16, yPos);
            yPos += 5;
          });
        }
        yPos += 4;
      });

      doc.save(`question_paper_${generatedPaper.subject.toLowerCase().replace(/ /g, '_')}.pdf`);
      alert('Question Paper PDF downloaded successfully!');
    } catch (e) {
      alert('Error generating Question Paper PDF');
    }
  };

  // ==========================================
  // 5. SCIENTIFIC & ACADEMIC CALCULATOR STATE
  // ==========================================
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [attendanceClassesHeld, setAttendanceClassesHeld] = useState('40');
  const [attendanceClassesAttended, setAttendanceClassesAttended] = useState('28');

  const handleCalcInput = (val: string) => {
    if (calcDisplay === '0') setCalcDisplay(val);
    else setCalcDisplay((prev) => prev + val);
  };

  const handleCalcClear = () => setCalcDisplay('0');

  const handleCalcEval = () => {
    try {
      const cleanExpr = calcDisplay.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function(`'use strict'; return (${cleanExpr})`)();
      setCalcDisplay(String(result));
    } catch (e) {
      setCalcDisplay('Error');
    }
  };

  const attPercent = Math.round((parseInt(attendanceClassesAttended) / parseInt(attendanceClassesHeld || '1')) * 100) || 0;
  const classesNeededFor75 = Math.max(0, Math.ceil(3 * parseInt(attendanceClassesHeld) - 4 * parseInt(attendanceClassesAttended)));

  // Filtered Notes
  const filteredNotes = notesList.filter((n) => {
    const q = noteSearchQuery.toLowerCase();
    const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const matchesCat = noteCategoryFilter === 'All' || n.category === noteCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold border border-purple-500/30">
            <Wrench className="w-4 h-4 text-purple-400" />
            NEXUS Faculty Utilities Command Center
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Faculty Utilities & Productivity Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed">
            {facultyName} ({department}) • AI-Assisted Teaching, Drafts, Question Papers, Scratchpad & Academic Workload Tools.
          </p>
        </div>

        {/* TOP TOOL SELECTOR BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 z-10 bg-slate-950/70 p-2 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'notes' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick Notes
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'email' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Email
          </button>
          <button
            onClick={() => setActiveTab('paper')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'paper' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Question Paper
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'tasks' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tasks
          </button>
        </div>
      </div>

      {/* OVERVIEW DASHBOARD GRID */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* QUICK NOTES CARD */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={() => setActiveTab('notes')}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                📝 Quick Notes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal faculty scratchpad. Persisted automatically for {facultyName}. Pin, filter, and edit teaching ideas.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 pt-2">
                Open Scratchpad <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* AI EMAIL ASSISTANT CARD */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={() => setActiveTab('email')}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                ✉️ AI Email Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Draft professional emails, attendance shortage warnings, leave responses, and class room change notices in seconds.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 pt-2">
                Launch AI Email Drafter <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* QUESTION PAPER GENERATOR CARD */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={() => setActiveTab('paper')}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                📝 Question Paper Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate mid-term and semester exam question papers with answer keys, configurable marks, MCQs, and PDF export.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
                Generate Exam Paper <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* TASKS & REMINDERS CARD */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={() => setActiveTab('tasks')}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                📅 Tasks & Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage grading deadlines, research submissions, and department workload tasks with priority indicators.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-2">
                View Faculty Tasks <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* SCIENTIFIC CALCULATOR CARD */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={() => setActiveTab('calculator')}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <CalcIcon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                🧮 Faculty Calculator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safe scientific calculator plus academic tools: attendance shortage requirement, marks average, weighted grades.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 pt-2">
                Open Calculator <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* CAMPUS QUICK LINKS CARD */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={() => setActiveTab('links')}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                🔗 Campus Quick Links
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fast links to University ERP, LMS, Exam Portal, Digital Library, Academic Calendar, and HR Portal.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-2">
                View Quick Links <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>
          </div>
        </div>
      )}

      {/* SECTION: QUICK NOTES SCRATCHPAD */}
      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>Personal Scratchpad for {facultyName}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Private notes persisted securely to MySQL database.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={noteCategoryFilter}
                onChange={(e) => setNoteCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-300 dark:border-slate-700"
              >
                <option value="All">Category: All</option>
                <option value="Personal">Personal</option>
                <option value="Teaching">Teaching</option>
                <option value="Meeting">Meeting</option>
                <option value="Research">Research</option>
                <option value="Student">Student</option>
                <option value="Department">Department</option>
                <option value="Important">Important</option>
              </select>

              <input
                type="text"
                value={noteSearchQuery}
                onChange={(e) => setNoteSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
              />
              <button
                onClick={() => {
                  setNoteTitle('');
                  setNoteContent('');
                  setEditingNoteId(null);
                  setIsNewNoteOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* NOTES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 text-xs font-mono">
                No personal notes found. Click "+ New Note" to create one!
              </div>
            ) : (
              filteredNotes.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 relative text-left ${
                    n.isPinned
                      ? 'bg-purple-500/10 border-purple-500/40 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-bold">
                      {n.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleTogglePin(n)} title="Pin Note" className="p-1 text-slate-400 hover:text-amber-500">
                        <Pin className={`w-3.5 h-3.5 ${n.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                      <button onClick={() => handleDeleteNote(n.id)} title="Delete Note" className="p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION: AI EMAIL & MESSAGE ASSISTANT */}
      {activeTab === 'email' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-500" />
              <span>AI Email & Message Assistant</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter a simple instruction and let AI generate professional communication drafts.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Recipient</label>
                <input
                  type="text"
                  value={aiRecipient}
                  onChange={(e) => setAiRecipient(e.target.value)}
                  placeholder="e.g. B.Tech CSE 4A Students"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Subject (Optional)</label>
                <input
                  type="text"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  placeholder="e.g. DBMS Assignment Submission Deadline"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Tone</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Formal">Formal</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Strict">Strict but Respectful</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Length</label>
                  <select
                    value={aiLength}
                    onChange={(e) => setAiLength(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Short">Short</option>
                    <option value="Medium">Medium</option>
                    <option value="Detailed">Detailed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Purpose / Instruction</label>
                <textarea
                  rows={4}
                  value={aiPurpose}
                  onChange={(e) => setAiPurpose(e.target.value)}
                  placeholder="e.g. Write an email to students reminding them to submit their DBMS assignment by Friday..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                disabled={isDraftingEmail}
                onClick={handleDraftAIEmail}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isDraftingEmail ? 'Drafting with AI...' : 'Generate Email Draft'}</span>
              </button>
            </div>

            {/* AI OUTPUT DISPLAY */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>AI Drafted Response</span>
                {aiGeneratedEmail && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${aiGeneratedEmail.subject}\n\n${aiGeneratedEmail.body}`);
                      alert('Copied to clipboard!');
                    }}
                    className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-[10px] font-bold inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Text
                  </button>
                )}
              </h4>

              {aiGeneratedEmail ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                    Subject: {aiGeneratedEmail.subject}
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {aiGeneratedEmail.body}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 font-mono">
                  Enter purpose above and click "Generate Email Draft".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: QUESTION PAPER GENERATOR */}
      {activeTab === 'paper' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              <span>AI Question Paper & Answer Key Generator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Generate examination papers with options, marks allocation, and answer keys.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={qpSubject}
                  onChange={(e) => setQpSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Topic / Unit</label>
                <input
                  type="text"
                  value={qpTopic}
                  onChange={(e) => setQpTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={qpDifficulty}
                    onChange={(e) => setQpDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Question Type</label>
                  <select
                    value={qpQuestionType}
                    onChange={(e) => setQpQuestionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Short Answer">Short Answer</option>
                    <option value="Long Answer">Long Answer</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={qpTotalQuestions}
                    onChange={(e) => setQpTotalQuestions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={qpTotalMarks}
                    onChange={(e) => setQpTotalMarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={qpDuration}
                    onChange={(e) => setQpDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                disabled={isGeneratingPaper}
                onClick={handleGenerateQuestionPaper}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 mt-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingPaper ? 'Generating Paper...' : 'Generate Question Paper'}</span>
              </button>
            </div>

            {/* PAPER PREVIEW DISPLAY */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4 text-xs">
              {generatedPaper ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-slate-700">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{generatedPaper.subject}</h4>
                      <span className="text-[11px] text-slate-500">{generatedPaper.topic} • {generatedPaper.totalMarks} Marks • {generatedPaper.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAnswerKey(!showAnswerKey)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
                      >
                        {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
                      </button>
                      <button
                        onClick={handleDownloadQuestionPaperPDF}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {generatedPaper.questions.map((q: any) => (
                      <div key={q.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{q.question}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono font-bold text-[10px]">
                            {q.marks} Marks
                          </span>
                        </div>
                        {q.options && (
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-400 pl-2">
                            {q.options.map((opt: string, i: number) => (
                              <div key={i}>{opt}</div>
                            ))}
                          </div>
                        )}
                        {showAnswerKey && (
                          <div className="mt-2 p-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            Correct Answer: {q.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 font-mono">
                  Click "Generate Question Paper" to construct an exam paper with answer key!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: TASKS & REMINDERS */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span>Faculty Tasks & Reminders</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Track workload tasks, research deadlines, and grading commitments.</p>
            </div>

            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {tasksList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No active faculty tasks. Click "+ Add Task" to create a task!
              </div>
            ) : (
              tasksList.map((t) => {
                const isDone = t.status === 'Completed';
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                      isDone ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleToggleTaskStatus(t)} className="text-slate-400 hover:text-emerald-500">
                        <CheckCircle2 className={`w-5 h-5 ${isDone ? 'text-emerald-500 fill-emerald-500/20' : ''}`} />
                      </button>
                      <div>
                        <h4 className={`font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{t.title}</h4>
                        <span className="text-slate-500 text-[11px]">{t.category} • Priority: {t.priority} {t.dueDate && `• Due: ${t.dueDate}`}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTask(t.id)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SECTION: SCIENTIFIC & ACADEMIC CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CalcIcon className="w-5 h-5 text-rose-500" />
              <span>Faculty Calculator Suite</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Scientific calculator and student attendance requirement calculator.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CALCULATOR DISPLAY & BUTTONS */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4 max-w-sm mx-auto w-full">
              <div className="p-4 rounded-xl bg-slate-900 text-right font-mono text-2xl font-black text-white tracking-widest overflow-x-auto">
                {calcDisplay}
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                <button onClick={handleCalcClear} className="p-3 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">C</button>
                <button onClick={() => handleCalcInput('(')} className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700">(</button>
                <button onClick={() => handleCalcInput(')')} className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700">)</button>
                <button onClick={() => handleCalcInput('/')} className="p-3 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">÷</button>

                <button onClick={() => handleCalcInput('7')} className="p-3 rounded-xl bg-white dark:bg-slate-800">7</button>
                <button onClick={() => handleCalcInput('8')} className="p-3 rounded-xl bg-white dark:bg-slate-800">8</button>
                <button onClick={() => handleCalcInput('9')} className="p-3 rounded-xl bg-white dark:bg-slate-800">9</button>
                <button onClick={() => handleCalcInput('*')} className="p-3 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">×</button>

                <button onClick={() => handleCalcInput('4')} className="p-3 rounded-xl bg-white dark:bg-slate-800">4</button>
                <button onClick={() => handleCalcInput('5')} className="p-3 rounded-xl bg-white dark:bg-slate-800">5</button>
                <button onClick={() => handleCalcInput('6')} className="p-3 rounded-xl bg-white dark:bg-slate-800">6</button>
                <button onClick={() => handleCalcInput('-')} className="p-3 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">-</button>

                <button onClick={() => handleCalcInput('1')} className="p-3 rounded-xl bg-white dark:bg-slate-800">1</button>
                <button onClick={() => handleCalcInput('2')} className="p-3 rounded-xl bg-white dark:bg-slate-800">2</button>
                <button onClick={() => handleCalcInput('3')} className="p-3 rounded-xl bg-white dark:bg-slate-800">3</button>
                <button onClick={() => handleCalcInput('+')} className="p-3 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">+</button>

                <button onClick={() => handleCalcInput('0')} className="col-span-2 p-3 rounded-xl bg-white dark:bg-slate-800">0</button>
                <button onClick={() => handleCalcInput('.')} className="p-3 rounded-xl bg-white dark:bg-slate-800">.</button>
                <button onClick={handleCalcEval} className="p-3 rounded-xl bg-purple-600 text-white font-black">=</button>
              </div>
            </div>

            {/* ATTENDANCE SHORTAGE CALCULATOR TOOL */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <CalcIcon className="w-4 h-4 text-purple-500" />
                <span>Attendance Shortage Calculator</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    value={attendanceClassesHeld}
                    onChange={(e) => setAttendanceClassesHeld(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Classes Attended by Student</label>
                  <input
                    type="number"
                    value={attendanceClassesAttended}
                    onChange={(e) => setAttendanceClassesAttended(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>Current Attendance Rate:</span>
                    <span className={`text-sm font-black ${attPercent >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{attPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span>Required for 75% Threshold:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-mono font-black">{classesNeededFor75} More Consecutive Classes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: CAMPUS QUICK LINKS */}
      {activeTab === 'links' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-indigo-500" />
              <span>Campus Quick Portals & Official Links</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">One-click navigation to essential university software systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'University ERP System', desc: 'Faculty attendance, payroll, and official grade submission.', link: '#' },
              { title: 'LMS E-Learning Portal', desc: 'Course material uploads, lecture recordings, and quizzes.', link: '#' },
              { title: 'Examination Cell Portal', desc: 'Mid-term and end-term seat allocation & answer key keying.', link: '#' },
              { title: 'Digital Library & IEEE', desc: 'Access 50,000+ research journals, IEEE papers, and e-books.', link: '#' },
              { title: 'University HR Portal', desc: 'Faculty leave applications, NOC certificates, and service record.', link: '#' },
              { title: 'NEXUS Academic Calendar', desc: 'Gazetted university holidays, exam schedules, and fests.', link: '#' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{item.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW NOTE MODAL */}
      <AnimatePresence>
        {isNewNoteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewNoteOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-purple-600 dark:text-purple-300">Create Personal Scratchpad Note</h3>
                <button onClick={() => setIsNewNoteOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Research">Research</option>
                    <option value="Student">Student</option>
                    <option value="Department">Department</option>
                    <option value="Important">Important</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. DBMS lecture normalization examples"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Content</label>
                  <textarea
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Type scratchpad details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsNewNoteOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold shadow-md">
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW TASK MODAL */}
      <AnimatePresence>
        {isNewTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewTaskOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Create Faculty Workload Task</h3>
                <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold mb-2"
                  >
                    <option value="Teaching">Teaching</option>
                    <option value="Grading">Grading</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Research">Research</option>
                    <option value="Student">Student</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Grade DBMS Assignment 2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Enter task details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="LOW">LOW</option>
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsNewTaskOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow-md">
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
