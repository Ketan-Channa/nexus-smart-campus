import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Building2,
  GraduationCap,
  Briefcase,
  X,
  ShieldCheck,
} from 'lucide-react';

export const AdminAlumniManagement: React.FC = () => {
  const [pendingAlumni, setPendingAlumni] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'directory'>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/alumni/pending'),
        fetch(`https://nexus-smart-campus-backend.onrender.com/api/admin/alumni/directory?search=${encodeURIComponent(searchTerm)}`),
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      if (pData.status === 'success') setPendingAlumni(pData.pendingAlumni || []);
      if (dData.status === 'success') setDirectory(dData.alumni || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (alumniId: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/admin/alumni/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniId,
          status,
          notes: status === 'VERIFIED' ? 'Verified by Central Alumni Cell' : 'Rejected - invalid credentials',
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`Alumni verification updated to ${status}!`);
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Alumni Governance & Identity Verification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit graduation credentials, issue official Alumni IDs, and oversee global network membership.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'pending'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending Verifications ({pendingAlumni.length})
        </button>
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'directory'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Verified Alumni Directory ({directory.length})
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'pending' ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Alumnus</th>
                  <th className="py-3 px-4">Graduation & Degree</th>
                  <th className="py-3 px-4">Current Employment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Loading verification queue...
                    </td>
                  </tr>
                ) : pendingAlumni.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      All alumni registration applications have been processed!
                    </td>
                  </tr>
                ) : (
                  pendingAlumni.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{a.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{a.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-amber-300 font-bold">Class of {a.graduation_year}</div>
                        <div className="text-[11px] text-slate-400">{a.degree} • {a.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{a.current_company || 'Independent'}</div>
                        <div className="text-[11px] text-slate-400">{a.current_designation || 'Professional'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {a.verification_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerify(a.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve & Issue ID
                        </button>
                        <button
                          onClick={() => handleVerify(a.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30 transition inline-flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Alumni ID & Name</th>
                  <th className="py-3 px-4">Batch & Dept</th>
                  <th className="py-3 px-4">Company & Designation</th>
                  <th className="py-3 px-4">Mentorship</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {directory.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono text-amber-300 font-bold">{a.alumni_id || 'ALM-VERIFIED'}</span>
                      <div className="font-semibold text-white mt-0.5">{a.full_name}</div>
                      <div className="text-[11px] text-slate-400">{a.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">Batch {a.graduation_year}</div>
                      <div className="text-[11px] text-slate-400">{a.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{a.current_company || '—'}</div>
                      <div className="text-[11px] text-slate-400">{a.current_designation || '—'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {a.mentorship_available === 'Yes' || a.mentorship_available === 1 ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">
                          Active Mentor
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Not Mentoring</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {a.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
