import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Clock, XCircle, Check, X, RefreshCw, Search, Download
} from 'lucide-react';

export const AdminAlumniManagement: React.FC = () => {
  const [alumniData, setAlumniData] = useState<{
    counts: { total: number; pending: number; verified: number; rejected: number; suspended: number };
    all: any[];
    pending: any[];
    verified: any[];
    rejected: any[];
    suspended: any[];
  }>({
    counts: { total: 0, pending: 0, verified: 0, rejected: 0, suspended: 0 },
    all: [],
    pending: [],
    verified: [],
    rejected: [],
    suspended: [],
  });

  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'all'>('pending');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminAlumniData();
  }, []);

  const fetchAdminAlumniData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/alumni/admin/list');
      const data = await res.json();
      if (data.status === 'success') {
        setAlumniData({
          counts: data.counts,
          all: data.all || [],
          pending: data.pending || [],
          verified: data.verified || [],
          rejected: data.rejected || [],
          suspended: data.suspended || [],
        });
      }
    } catch (e) {
      console.error('Error fetching admin alumni data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, email: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'PENDING') => {
    try {
      const res = await fetch('http://localhost:5000/api/alumni/admin/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email, status }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMessage(`Alumni status updated to ${status}! ${data.alumniId ? `Generated Alumni ID: ${data.alumniId}` : ''}`);
        fetchAdminAlumniData();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Alumni ID', 'Department', 'Graduation Year', 'Company', 'Designation', 'Status'];
    const rows = alumniData.all.map((a) => [
      a.id,
      `"${a.full_name}"`,
      `"${a.email}"`,
      `"${a.alumni_id || 'N/A'}"`,
      `"${a.department}"`,
      `"${a.graduation_year}"`,
      `"${a.current_company || ''}"`,
      `"${a.current_designation || ''}"`,
      `"${a.verification_status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEXUS_Alumni_Directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredList = (tab: 'pending' | 'verified' | 'all') => {
    let list = alumniData[tab];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (a: any) =>
          a.full_name?.toLowerCase().includes(term) ||
          a.email?.toLowerCase().includes(term) ||
          a.department?.toLowerCase().includes(term) ||
          a.college_name?.toLowerCase().includes(term) ||
          a.alumni_id?.toLowerCase().includes(term) ||
          a.current_company?.toLowerCase().includes(term)
      );
    }
    return list;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-purple-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              🛡️ Admin Alumni Management & Verification Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Alumni Identity & Verification Studio</h1>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Single Source of Truth management. Verify pending alumni requests, generate unique Alumni IDs, suspend accounts, and view global analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs flex items-center gap-2 transition shadow-lg"
            >
              <Download className="w-4 h-4" /> Export CSV Report
            </button>
            <button
              onClick={fetchAdminAlumniData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/15"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Alumni</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{alumniData.counts.total}</div>
        </div>
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Verification
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{alumniData.counts.pending}</div>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Alumni
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{alumniData.counts.verified}</div>
        </div>
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Suspended / Rejected
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{alumniData.counts.suspended + alumniData.counts.rejected}</div>
        </div>
      </div>

      {/* NAVIGATION TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            🟡 Pending Approval ({alumniData.counts.pending})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'verified' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            🟢 Verified Alumni ({alumniData.counts.verified})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'all' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            📋 All Alumni Database ({alumniData.counts.total})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 dark:border-slate-700 w-full sm:w-64"
          />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Alumni Profile</th>
                <th className="p-4">Alumni ID / Reg No</th>
                <th className="p-4">Graduation & Dept</th>
                <th className="p-4">Current Workplace</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList(activeTab as any).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No alumni records found in this category.
                  </td>
                </tr>
              ) : (
                filteredList(activeTab as any).map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {a.photograph_url ? (
                          <img src={a.photograph_url} alt={a.full_name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                            {a.full_name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{a.full_name}</div>
                          <div className="text-[11px] text-slate-400">{a.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono">
                      {a.alumni_id ? (
                        <span className="font-bold text-purple-600 dark:text-purple-400">{a.alumni_id}</span>
                      ) : (
                        <span className="text-slate-400">Reg: {a.student_registration_number || 'N/A'}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{a.department}</div>
                      <div className="text-slate-400 text-[11px]">Class of {a.graduation_year} ({a.degree})</div>
                      <div className="text-purple-600 dark:text-purple-400 font-bold text-[10px] truncate max-w-[160px]">{a.college_name || 'NEXUS Campus'}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{a.current_company || 'N/A'}</div>
                      <div className="text-slate-400 text-[11px]">{a.current_designation || 'Alumnus'}</div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${a.verification_status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-600' : a.verification_status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : a.verification_status === 'SUSPENDED' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-500/10 text-slate-500'}`}>
                        {a.verification_status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.verification_status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, a.email, 'VERIFIED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                            title="Verify & Generate Alumni ID"
                          >
                            <Check className="w-3.5 h-3.5" /> Verify
                          </button>
                        )}
                        {a.verification_status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, a.email, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        {a.verification_status === 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, a.email, 'SUSPENDED')}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
