import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  X,
  Edit2,
} from 'lucide-react';

export const AdminRolesPermissions: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Create Admin Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Central Administration',
    accessLevel: 'Campus Admin',
    mobile: '',
  });

  // Edit Access Level Modal
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [newAccessLevel, setNewAccessLevel] = useState<string>('Campus Admin');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/administrators');
      const data = await res.json();
      if (data.status === 'success') {
        setAdmins(data.administrators || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAdmin, adminEmail: 'admin@nexus.edu' }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setShowCreateModal(false);
        setNewAdmin({ name: '', email: '', password: '', department: 'Central Administration', accessLevel: 'Campus Admin', mobile: '' });
        fetchAdmins();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/administrators/access-level', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: selectedAdmin.id,
          accessLevel: newAccessLevel,
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        setSelectedAdmin(null);
        fetchAdmins();
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
            <KeyRound className="w-5 h-5 text-indigo-400" />
            Roles, Delegated Permissions & Administrative Hierarchy
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure granular access tiers (Super Admin, Academic Admin, Finance Admin, Safety Admin) for campus officials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Administrator
          </button>
          <button
            onClick={fetchAdmins}
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

      {/* Admins Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Access Level</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{adm.admin_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{adm.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {adm.department || 'Central Governance'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        adm.access_level === 'Super Admin'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          : adm.access_level === 'Academic Admin'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {adm.access_level || 'Campus Admin'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {adm.created_at ? new Date(adm.created_at).toLocaleDateString() : 'System'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedAdmin(adm);
                        setNewAccessLevel(adm.access_level || 'Campus Admin');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/20 transition text-[11px] inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Change Tier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Provision Administrator Account
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Vikram Malhotra"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@nexus.edu"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Access Level Role</label>
                <select
                  value={newAdmin.accessLevel}
                  onChange={(e) => setNewAdmin({ ...newAdmin, accessLevel: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Campus Admin">Campus Admin (General)</option>
                  <option value="Academic Admin">Academic Admin (Timetable & Exams)</option>
                  <option value="Finance Admin">Finance Admin (Fee Reconciliation)</option>
                  <option value="Safety Admin">Safety Admin (SOS & Incident Command)</option>
                  <option value="Super Admin">Super Admin (Unrestricted)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  value={newAdmin.department}
                  onChange={(e) => setNewAdmin({ ...newAdmin, department: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Secure Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Provision Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tier Modal */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Change Admin Tier</h3>
              <button onClick={() => setSelectedAdmin(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Updating access level for: <strong className="text-white">{selectedAdmin.admin_name}</strong>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Access Level</label>
                <select
                  value={newAccessLevel}
                  onChange={(e) => setNewAccessLevel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Campus Admin">Campus Admin</option>
                  <option value="Academic Admin">Academic Admin</option>
                  <option value="Finance Admin">Finance Admin</option>
                  <option value="Safety Admin">Safety Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Update Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
