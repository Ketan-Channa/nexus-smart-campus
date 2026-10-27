import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  Search,
  RefreshCw,
  X,
  Layers,
  GraduationCap,
} from 'lucide-react';

export const AdminDepartmentsClasses: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassRoster, setSelectedClassRoster] = useState<{
    classInfo: any;
    students: any[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // New Department Form Modal
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);
  const [deptForm, setDeptForm] = useState({
    deptCode: '',
    deptName: '',
    hodName: '',
    hodEmail: '',
    description: '',
  });

  // New Class Form Modal
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [classForm, setClassForm] = useState({
    classCode: '',
    className: '',
    department: 'Computer Science & Engineering',
    semester: '1',
    section: 'A',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/departments'),
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/classes'),
      ]);
      const dData = await dRes.json();
      const cData = await cRes.json();
      if (dData.status === 'success') setDepartments(dData.departments || []);
      if (cData.status === 'success') setClasses(cData.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowDeptModal(false);
        setDeptForm({ deptCode: '', deptName: '', hodName: '', hodEmail: '', description: '' });
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classForm),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowClassModal(false);
        setClassForm({ classCode: '', className: '', department: 'Computer Science & Engineering', semester: '1', section: 'A' });
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const inspectRoster = async (classCode: string) => {
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/admin/classes/${encodeURIComponent(classCode)}/roster`);
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedClassRoster({
          classInfo: data.classInfo,
          students: data.students || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Departments, Programs & Class Roster Structure
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure academic departments, class sections, and inspect student class registers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeptModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Department
          </button>
          <button
            onClick={() => setShowClassModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Class
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

      {/* Two Column Layout: Departments and Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Academic Departments ({departments.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 flex items-center justify-between hover:border-indigo-500/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{d.dept_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                      {d.dept_code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    HOD: {d.hod_name || 'Dr. Assigned HOD'} ({d.hod_email || 'hod@nexus.edu'})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Classes & Sections ({classes.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {classes.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 flex items-center justify-between hover:border-sky-500/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{c.class_name || c.class_code}</span>
                    <span className="text-[10px] text-slate-400">Sem {c.semester} • Sec {c.section}</span>
                  </div>
                  <div className="text-[11px] text-sky-300 mt-0.5">
                    Incharge: {c.class_incharge_name || 'None Assigned'}
                  </div>
                </div>

                <button
                  onClick={() => inspectRoster(c.class_code || c.class_name)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-[11px] font-semibold border border-sky-500/20 transition flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  Roster
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Modal */}
      {selectedClassRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  Class Roster: {selectedClassRoster.classInfo?.class_name || 'Class Students'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Total Enrolled: {selectedClassRoster.students.length} students
                </p>
              </div>
              <button onClick={() => setSelectedClassRoster(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2">Student</th>
                    <th className="py-2">Roll Number</th>
                    <th className="py-2">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedClassRoster.students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-800/30">
                      <td className="py-2 font-semibold text-white">{stu.full_name}</td>
                      <td className="py-2 font-mono text-indigo-300 font-bold">{stu.roll_number}</td>
                      <td className="py-2 text-slate-300">{stu.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Academic Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-DS"
                  value={deptForm.deptCode}
                  onChange={(e) => setDeptForm({ ...deptForm, deptCode: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={deptForm.deptName}
                  onChange={(e) => setDeptForm({ ...deptForm, deptName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={deptForm.hodName}
                  onChange={(e) => setDeptForm({ ...deptForm, hodName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Class / Section</h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Class Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BTECH-CSE-4A"
                  value={classForm.classCode}
                  onChange={(e) => setClassForm({ ...classForm, classCode: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Class Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech CSE 4A"
                  value={classForm.className}
                  onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Semester</label>
                  <input
                    type="text"
                    value={classForm.semester}
                    onChange={(e) => setClassForm({ ...classForm, semester: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Section</label>
                  <input
                    type="text"
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
