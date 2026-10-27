import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  RefreshCw,
  Building2,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Edit2,
  X,
  CheckCircle2,
} from 'lucide-react';

export const AdminFacultyManagement: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Incharge Modal State
  const [showInchargeModal, setShowInchargeModal] = useState<boolean>(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [targetClass, setTargetClass] = useState<string>('B.Tech CSE 4A');

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/faculty');
      const data = await res.json();
      if (data.status === 'success') {
        setFaculty(data.faculty || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAssignIncharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || !targetClass) return;
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/faculty/assign-class-incharge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          facultyEmail: selectedFaculty.email,
          classCode: targetClass,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowInchargeModal(false);
        fetchFaculty();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const filteredFaculty = faculty.filter(
    (f) =>
      f.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sky-400" />
            Faculty Management & Responsibilities
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Oversee professorship assignments, class incharge responsibilities, and teaching allocations.
          </p>
        </div>
        <button
          onClick={fetchFaculty}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty by name, employee ID, or email..."
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">{filteredFaculty.length} Faculty Members</span>
      </div>

      {/* Faculty Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Faculty</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department & Rank</th>
                <th className="py-3 px-4">Class Incharge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-400" />
                    Fetching faculty roster...
                  </td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No faculty found matching search.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => {
                  const isIncharge = f.is_class_incharge === 'Yes' && f.incharge_class;
                  return (
                    <tr key={f.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{f.faculty_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{f.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-300">
                        {f.employee_id || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{f.department || 'Computer Science'}</div>
                        <div className="text-[11px] text-slate-400">{f.designation || 'Assistant Professor'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {isIncharge ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {f.incharge_class}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">None Assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedFaculty(f);
                            setTargetClass(f.incharge_class || 'B.Tech CSE 4A');
                            setShowInchargeModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 font-medium inline-flex items-center gap-1 border border-sky-500/20 transition"
                        >
                          <UserCheck className="w-3 h-3" />
                          Assign Incharge
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Incharge Modal */}
      {showInchargeModal && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-400" />
                Assign Class Incharge
              </h3>
              <button onClick={() => setShowInchargeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Assigning Incharge responsibility for faculty:{' '}
              <strong className="text-white">{selectedFaculty.faculty_name}</strong> ({selectedFaculty.employee_id})
            </div>

            <form onSubmit={handleAssignIncharge} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Class Code / Name</label>
                <input
                  type="text"
                  required
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  placeholder="e.g. B.Tech CSE 4A or CSE-4B"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Note: Assigning this will automatically link to the Faculty's My Students & Classes register and emit a live sync event.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInchargeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/20"
                >
                  Confirm Incharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
