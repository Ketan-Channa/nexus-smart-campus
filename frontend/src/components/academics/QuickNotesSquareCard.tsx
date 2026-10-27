import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Download,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Tag,
  Calendar,
  Sparkles,
  CheckCircle2,
  Wrench,
  FileCheck2,
  Briefcase,
  Calculator,
} from 'lucide-react';
import jsPDF from 'jspdf';

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Project' | 'Exam Prep' | 'Personal' | 'Idea';
  date: string;
  color: string;
}

const DEFAULT_NOTES: QuickNote[] = [
  {
    id: 'note-1',
    title: 'Blockchain Project Phase-II Architecture',
    content: 'Implement smart contract verification on Ethereum Sepolia testnet. Prepare report for Dr. SMB before Friday submission.',
    category: 'Project',
    date: '2026-08-03',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'note-2',
    title: 'Network Security NSC Formula Sheet',
    content: 'Review RSA public key encryption, Diffie-Hellman key exchange, AES-256 block ciphers, and SHA-3 hashing algorithms.',
    category: 'Exam Prep',
    date: '2026-08-02',
    color: 'from-rose-500 to-amber-500',
  },
  {
    id: 'note-3',
    title: 'Agile Software Dev Daily Sprint Goals',
    content: 'Complete user story mapping, setup CI/CD pipeline in GitHub Actions, and conduct daily standup with Prof. RNJ.',
    category: 'Academic',
    date: '2026-08-01',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'note-4',
    title: 'Campus Hackathon Team Idea',
    content: 'AI-driven Smart Attendance & Automated Timetable Converter with facial recognition & realtime venue analytics.',
    category: 'Idea',
    date: '2026-07-30',
    color: 'from-cyan-500 to-blue-500',
  },
];

const MERGED_UTILITIES_SLIDES = [
  {
    id: 'util-slide-1',
    type: 'note',
    title: 'Quick Notes & Audio Speech Reader',
    subtitle: 'Categorized notes with AI structuring & voice reader',
    category: 'Quick Notes',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    icon: FileText,
  },
  {
    id: 'util-slide-2',
    type: 'utility',
    title: 'Self Testing & Exam Generator',
    subtitle: 'Upload PDF / Notes for MCQ 50/100 Qs & Subjective Exams',
    category: 'Self Testing',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    icon: FileCheck2,
    detail: 'Objective & Subjective (~150 words) with anti-cheating tab protection.',
  },
  {
    id: 'util-slide-3',
    type: 'utility',
    title: 'AI Student Assistant & Email Drafter',
    subtitle: 'Draft formal emails, summaries & academic requests',
    category: 'AI Assistant',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    icon: Sparkles,
    detail: 'AI writing improver with explicit confirm email send modal.',
  },
  {
    id: 'util-slide-4',
    type: 'utility',
    title: 'AI Resume Builder & ATS Scanner',
    subtitle: 'Live ATS analyzer (86-94%) & multi-page PDF generator',
    category: 'Career Studio',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    icon: Briefcase,
    detail: 'Build recruiter ATS ready resume with document sync.',
  },
  {
    id: 'util-slide-5',
    type: 'utility',
    title: '3D Flashcards & Productivity Tools',
    subtitle: 'SGPA/CGPA Calculator, Pomodoro Timer & 3D Flip Decks',
    category: 'Productivity',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    icon: Calculator,
    detail: '3D interactive revision decks & academic calculators.',
  },
];

interface QuickNotesSquareCardProps {
  onNavigateToUtilities?: () => void;
}

export const QuickNotesSquareCard: React.FC<QuickNotesSquareCardProps> = ({
  onNavigateToUtilities,
}) => {
  const [notes, setNotes] = useState<QuickNote[]>(DEFAULT_NOTES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'Academic' as QuickNote['category'],
  });

  const [downloadSuccessNoteId, setDownloadSuccessNoteId] = useState<string | null>(null);

  // Load Notes from localStorage on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_quick_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
        }
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  // Sync Notes to localStorage
  const saveNotes = (updatedNotes: QuickNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('nexus_quick_notes', JSON.stringify(updatedNotes));
  };

  // 10-Second Auto Play Rotator across merged slides
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MERGED_UTILITIES_SLIDES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // Handle Note Save
  const handleSaveFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;

    let categoryColor = 'from-purple-500 to-indigo-500';
    if (noteForm.category === 'Project') categoryColor = 'from-purple-500 to-indigo-500';
    else if (noteForm.category === 'Exam Prep') categoryColor = 'from-rose-500 to-amber-500';
    else if (noteForm.category === 'Academic') categoryColor = 'from-emerald-500 to-teal-500';
    else if (noteForm.category === 'Idea') categoryColor = 'from-cyan-500 to-blue-500';
    else categoryColor = 'from-amber-500 to-orange-500';

    if (editingNoteId) {
      const updated = notes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              title: noteForm.title,
              content: noteForm.content,
              category: noteForm.category,
              color: categoryColor,
            }
          : n
      );
      saveNotes(updated);
    } else {
      const newNote: QuickNote = {
        id: `note-${Date.now()}`,
        title: noteForm.title,
        content: noteForm.content,
        category: noteForm.category,
        date: new Date().toISOString().substring(0, 10),
        color: categoryColor,
      };
      const updated = [newNote, ...notes];
      saveNotes(updated);
    }

    setShowModal(false);
    setEditingNoteId(null);
    setNoteForm({ title: '', content: '', category: 'Academic' });
  };

  // Open Edit Modal
  const openEditModal = (note: QuickNote, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      content: note.content,
      category: note.category,
    });
    setShowModal(true);
  };

  // Delete Note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) {
      alert('Keep at least 1 note!');
      return;
    }
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  // DOWNLOAD PDF FUNCTIONALITY
  const handleDownloadPDF = (note: QuickNote, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('NEXUS SMART CAMPUS', 15, 16);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Quick Note & Academic Brief Document', 15, 23);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, 40, 180, 28, 3, 3, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Document Title: ${note.title}`, 20, 49);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Category Tag: ${note.category}   |   Created Date: ${note.date}   |   Campus ID: NEXUS-2026`, 20, 58);

      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.8);
      doc.line(15, 75, 195, 75);

      doc.setTextColor(79, 70, 229);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTE CONTENT & DETAILS:', 15, 84);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const splitText = doc.splitTextToSize(note.content, 180);
      doc.text(splitText, 15, 93);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Exported via NEXUS Smart Campus Platform • ${new Date().toLocaleString()}`, 15, 285);

      const safeFilename = note.title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
      doc.save(`nexus_note_${safeFilename}.pdf`);

      setDownloadSuccessNoteId(note.id);
      setTimeout(() => setDownloadSuccessNoteId(null), 3000);
    } catch (err) {
      alert('Error exporting note to PDF.');
    }
  };

  const currentSlide = MERGED_UTILITIES_SLIDES[currentIndex % MERGED_UTILITIES_SLIDES.length];
  const currentNote = notes[0] || DEFAULT_NOTES[0];
  const SlideIcon = currentSlide.icon;

  return (
    <div
      onClick={onNavigateToUtilities}
      className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all cursor-pointer group overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-amber-500 opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none" />

      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Quick Notes & Student Utilities
            </h4>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
              AI Toolbox • Self Testing • Notes ({currentIndex + 1}/{MERGED_UTILITIES_SLIDES.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingNoteId(null);
              setNoteForm({ title: '', content: '', category: 'Academic' });
              setShowModal(true);
            }}
            className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-colors flex items-center gap-1 text-[11px] font-bold"
            title="Create New Quick Note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Note</span>
          </button>

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

      {/* MERGED ROTATING CAROUSEL BODY */}
      <div className="flex-1 my-3 relative overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentSlide.type === 'note' ? (
            <motion.div
              key={currentNote.id + currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-950/30 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/60 shadow-inner flex flex-col justify-between h-full space-y-2"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${currentNote.color} shadow-xs flex items-center gap-1`}>
                  <Tag className="w-2.5 h-2.5" />
                  {currentNote.category}
                </span>
                <span className="font-mono text-slate-400 font-bold text-[10px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  {currentNote.date}
                </span>
              </div>

              <div>
                <h5 className="font-display font-black text-xs text-slate-900 dark:text-white line-clamp-1">
                  {currentNote.title}
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {currentNote.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-purple-200/50 dark:border-purple-800/40 text-[10px]">
                <button
                  onClick={(e) => handleDownloadPDF(currentNote, e)}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors flex items-center gap-1 shadow"
                  title="Download Note as PDF"
                >
                  {downloadSuccessNoteId === currentNote.id ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <span>PDF Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Export PDF</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => openEditModal(currentNote, e)}
                    className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteNote(currentNote.id, e)}
                    className="p-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentSlide.id + currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex flex-col justify-between h-full space-y-2"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${currentSlide.badgeColor}`}>
                  {currentSlide.category}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <SlideIcon className="w-3 h-3 text-amber-500" />
                  Live Utility
                </span>
              </div>

              <div>
                <h5 className="font-display font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tight">
                  {currentSlide.title}
                </h5>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">
                  {currentSlide.subtitle}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                  {currentSlide.detail}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAutoPlay && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"
            />
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between z-10 pt-1 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateToUtilities) onNavigateToUtilities();
          }}
          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
        >
          <span>Open Quick Notes & Student Utilities</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + MERGED_UTILITIES_SLIDES.length) % MERGED_UTILITIES_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            title="Previous Tool Slide"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % MERGED_UTILITIES_SLIDES.length);
            }}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            title="Next Tool Slide"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CREATE / EDIT NOTE MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  {editingNoteId ? 'Edit Quick Note' : 'Create New Quick Note'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Note Title</label>
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    placeholder="e.g. Blockchain Project Phase-II Deadline"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Tag</label>
                  <select
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value as QuickNote['category'] })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Project">Project</option>
                    <option value="Exam Prep">Exam Prep</option>
                    <option value="Idea">Idea</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Note Content & Details</label>
                  <textarea
                    rows={4}
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    placeholder="Write your quick ideas, deadlines, or formulas..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none font-medium"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md hover:from-purple-500 hover:to-indigo-500"
                  >
                    {editingNoteId ? 'Save Changes' : 'Create Note'}
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
