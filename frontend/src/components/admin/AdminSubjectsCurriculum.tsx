import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  UserCheck,
  Building2,
  X,
  CheckCircle2,
} from 'lucide-react';

export const AdminSubjectsCurriculum: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Create Subject Modal
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [subjectForm, setSubjectForm] = useState({
    subjectCode: '',
    subjectName: '',
    department: 'Computer Science & Engineering',
    semester: '7',
    credits: 4,
  });

  // Assign Faculty Modal
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/subjects'),
        fetch('http://localhost:5000/api/admin/faculty'),
      ]);
      const sData = await sRes.json();
      const fData = await fRes.json();
      if (sData.status === 'success') setSubjects(sData.subjects || []);
      if (fData.status === 'success') setFaculty(fData.faculty || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowSubjectModal(false);
        setSubjectForm({ subjectCode: '', subjectName: '', department: 'Computer Science & Engineering', semester: '7', credits: 4 });
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedFacultyId) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/subjects/assign-faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: selectedSubject.subject_code,
          facultyId: selectedFacultyId,
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowAssignModal(false);
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const filtered = subjects.filter(
    (s) =>
      s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Curriculum & Faculty Subject Allocations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage course codes, semester credit hours, and assign specialized faculty instructors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subject
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subject code or title..."
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">{filtered.length} Subjects Registered</span>
      </div>

      {/* Subjects Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Department & Credits</th>
                <th className="py-3 px-4">Assigned Instructor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading curriculum registry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No curriculum subjects found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-semibold text-white">{s.subject_name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-300">{s.subject_code}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{s.department}</div>
                      <div className="text-[11px] text-slate-400">
                        {s.credits || 4} Credits • Sem {s.semester || '1'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {s.faculty_name ? (
                        <div>
                          <div className="font-semibold text-sky-300">{s.faculty_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.faculty_email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSubject(s);
                          setSelectedFacultyId(s.faculty_id ? String(s.faculty_id) : '');
                          setShowAssignModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-medium inline-flex items-center gap-1 border border-indigo-500/20 transition"
                      >
                        <UserCheck className="w-3 h-3" />
                        Allocate Faculty
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Register Subject & Code</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE-701"
                  value={subjectForm.subjectCode}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Systems"
                  value={subjectForm.subjectName}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Semester</label>
                  <input
                    type="text"
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Credits</label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Faculty Modal */}
      {showAssignModal && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Allocate Faculty Instructor</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300">
              Allocating instructor for course:{' '}
              <strong className="text-indigo-300">{selectedSubject.subject_code}</strong> - {selectedSubject.subject_name}
            </div>
            <form onSubmit={handleAssignFaculty} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Professor / Faculty Member</label>
                <select
                  required
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.faculty_name} ({f.employee_id || f.email}) - {f.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
