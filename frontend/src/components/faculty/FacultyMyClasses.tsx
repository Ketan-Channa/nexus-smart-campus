import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Users,
  Search,
  ChevronRight,
  Mail,
  ArrowRightLeft,
  UserX,
  Crown,
} from 'lucide-react';

interface FacultyMyClassesProps {
  isClassIncharge?: string;
  inchargeClass?: string;
}

export const FacultyMyClasses: React.FC<FacultyMyClassesProps> = ({
  isClassIncharge = 'Yes',
  inchargeClass = 'B.TECH CSE 2023 A',
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(inchargeClass || 'B.TECH CSE 2023 A');

  useEffect(() => {
    if (inchargeClass) {
      setSelectedClass(inchargeClass);
    }
  }, [inchargeClass]);
  const [studentsRoster, setStudentsRoster] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStudentModal, setActiveStudentModal] = useState<any | null>(null);
  const [transferModalStudent, setTransferModalStudent] = useState<any | null>(null);
  const [targetClassForTransfer, setTargetClassForTransfer] = useState<string>('BTECH CSE 4B');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState<boolean>(false);

  // Fetch student roster for selected class from backend database
  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/faculty/students?className=${encodeURIComponent(selectedClass)}`);
      if (res.data && res.data.students) {
        setStudentsRoster(res.data.students);
      } else {
        setStudentsRoster([]);
      }
    } catch (err) {
      setStudentsRoster([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, selectedClass]);

  // Real-time synchronization event listeners!
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      fetchStudents();
    };

    window.addEventListener('nexus:student-registered', handleRealtimeUpdate);
    window.addEventListener('nexus:class-transferred', handleRealtimeUpdate);
    window.addEventListener('nexus:incharge-changed', handleRealtimeUpdate);

    return () => {
      window.removeEventListener('nexus:student-registered', handleRealtimeUpdate);
      window.removeEventListener('nexus:class-transferred', handleRealtimeUpdate);
      window.removeEventListener('nexus:incharge-changed', handleRealtimeUpdate);
    };
  }, [fetchStudents]);

  // Execute Student Class Transfer
  const handleExecuteTransfer = async () => {
    if (!transferModalStudent || !targetClassForTransfer) return;
    setIsSubmittingTransfer(true);
    try {
      await axios.post('http://localhost:5000/api/faculty/students/transfer', {
        studentId: transferModalStudent.id,
        rollNumber: transferModalStudent.rollNumber,
        oldClassName: selectedClass,
        newClassName: targetClassForTransfer,
      });

      window.dispatchEvent(new CustomEvent('nexus:class-transferred'));
      setTransferModalStudent(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transfer failed');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Execute Student Deactivation
  const handleDeactivateStudent = async (student: any) => {
    if (!window.confirm(`Deactivate ${student.name} (${student.rollNumber})?`)) return;
    try {
      await axios.post('http://localhost:5000/api/faculty/students/deactivate', {
        studentId: student.id,
        rollNumber: student.rollNumber,
      });

      window.dispatchEvent(new CustomEvent('nexus:class-transferred'));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deactivation failed');
    }
  };

  const filteredStudents = studentsRoster.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || (s.name && s.name.toLowerCase().includes(q)) || (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* MY CLASS CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 transition-colors">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">
                  My Class: <span className="text-purple-600 dark:text-purple-400">{selectedClass}</span>
                </h2>
                {isClassIncharge === 'Yes' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" /> Incharge Active
                  </span>
                )}
              </div>
              <span className="text-xs font-mono font-extrabold text-slate-500 dark:text-slate-400 block mt-0.5">
                Students Count: {studentsRoster.length}
              </span>
            </div>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Roll No / Student Name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* STUDENT ROSTER TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider bg-slate-100 dark:bg-slate-950">
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Department</th>
                <th className="p-3">Class & Section</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-bold font-mono">
                    No active students found in MySQL database for {selectedClass}.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
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
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{s.department}</td>
                    <td className="p-3 font-mono text-purple-600 dark:text-purple-300 font-bold">{s.className}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveStudentModal(s)}
                          className="px-2.5 py-1 rounded-xl bg-purple-500/10 dark:bg-purple-600/30 hover:bg-purple-500/20 dark:hover:bg-purple-600/50 text-purple-600 dark:text-purple-300 font-bold text-xs inline-flex items-center gap-1 border border-purple-500/30"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTransferModalStudent(s)}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs inline-flex items-center gap-1 border border-amber-500/30"
                          title="Transfer Section"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                          <span>Transfer</span>
                        </button>
                        <button
                          onClick={() => handleDeactivateStudent(s)}
                          className="p-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          title="Deactivate Student"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <button onClick={() => setTransferModalStudent(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button
                  disabled={isSubmittingTransfer}
                  onClick={handleExecuteTransfer}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                >
                  {isSubmittingTransfer ? 'Transferring...' : 'Confirm Transfer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STUDENT PROFILE MODAL */}
      <AnimatePresence>
        {activeStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveStudentModal(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{activeStudentModal.rollNumber}</span>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">{activeStudentModal.name}</h3>
                </div>
                <button onClick={() => setActiveStudentModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-purple-500" /> {activeStudentModal.email}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-300">{activeStudentModal.className}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Department & Mobile</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{activeStudentModal.department} • {activeStudentModal.mobile || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setActiveStudentModal(null)} className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-500">
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
