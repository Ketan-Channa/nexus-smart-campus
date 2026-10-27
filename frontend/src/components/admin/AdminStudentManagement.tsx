import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  Building2,
  BookOpen,
  Home,
  Bus,
  Edit2,
  X,
  CheckCircle2,
} from 'lucide-react';

export const AdminStudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Edit / Transfer Modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [transferForm, setTransferForm] = useState({
    targetClass: '',
    department: '',
    semester: '',
    conveyanceMode: '',
    hostelName: '',
    roomNumber: '',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (deptFilter !== 'All') q.append('department', deptFilter);
      if (searchTerm) q.append('search', searchTerm);
      const res = await fetch(`http://localhost:5000/api/admin/students?${q.toString()}`);
      const data = await res.json();
      if (data.status === 'success') {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [deptFilter]);

  const openTransferModal = (stu: any) => {
    setSelectedStudent(stu);
    setTransferForm({
      targetClass: stu.class || 'B.Tech CSE 4A',
      department: stu.department || 'Computer Science & Engineering',
      semester: stu.semester || '7',
      conveyanceMode: stu.conveyance_mode || 'College Bus',
      hostelName: stu.hostel_name || '',
      roomNumber: stu.room_number || '',
    });
  };

  const handleUpdateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/students/enrollment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          rollNumber: selectedStudent.roll_number,
          ...transferForm,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            Student Enrollment & Academic Record Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage student registrations, class/section transfers, transport, and hostel assignments.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400">Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Electronics & Communication">ECE</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Management Studies">Management</option>
          </select>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStudents();
          }}
          className="flex items-center gap-2 w-full md:w-80"
        >
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by roll number or name..."
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-xl hover:bg-slate-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll & Admission</th>
                <th className="py-3 px-4">Class & Sem</th>
                <th className="py-3 px-4">Conveyance / Hostel</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading student database...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{s.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-indigo-300">{s.roll_number}</span>
                      <div className="text-[10px] text-slate-400">{s.admission_number || '—'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20 text-[10px]">
                        {s.class}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">Sem {s.semester || '7'} • {s.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Bus className="w-3 h-3 text-sky-400" />
                        <span>{s.conveyance_mode || 'Self'}</span>
                      </div>
                      {s.hostel_name && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-0.5">
                          <Home className="w-3 h-3 text-amber-400" />
                          <span>{s.hostel_name} ({s.room_number || 'N/A'})</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openTransferModal(s)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-medium inline-flex items-center gap-1 border border-indigo-500/20 transition"
                      >
                        <Edit2 className="w-3 h-3" />
                        Transfer / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer & Edit Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                Update Student Enrollment: {selectedStudent.full_name}
              </h3>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEnrollment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Class / Section</label>
                <input
                  type="text"
                  required
                  value={transferForm.targetClass}
                  onChange={(e) => setTransferForm({ ...transferForm, targetClass: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Academic Department</label>
                <input
                  type="text"
                  required
                  value={transferForm.department}
                  onChange={(e) => setTransferForm({ ...transferForm, department: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Semester</label>
                <input
                  type="text"
                  value={transferForm.semester}
                  onChange={(e) => setTransferForm({ ...transferForm, semester: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Hostel Block</label>
                  <input
                    type="text"
                    value={transferForm.hostelName}
                    onChange={(e) => setTransferForm({ ...transferForm, hostelName: e.target.value })}
                    placeholder="e.g. Tagore Hostel"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={transferForm.roomNumber}
                    onChange={(e) => setTransferForm({ ...transferForm, roomNumber: e.target.value })}
                    placeholder="e.g. 302"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Confirm & Sync Portals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
