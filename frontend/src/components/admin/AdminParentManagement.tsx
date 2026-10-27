import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users,
  ShieldCheck,
  Calendar,
  MessageSquare,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminParentManagement: React.FC = () => {
  const [data, setData] = useState<{
    stats: any;
    relationshipRequests: any[];
    parentsList: any[];
  }>({
    stats: {},
    relationshipRequests: [],
    parentsList: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'parents'>('requests');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchParentGovernance = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/parent-governance');
      const json = await res.json();
      if (json.status === 'success') {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentGovernance();
  }, []);

  const handleUpdateStatus = async (linkId: string, status: 'Verified' | 'Rejected' | 'Revoked') => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/parent-relationship/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId,
          status,
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setActionMsg(`Relationship marked as ${status}!`);
        fetchParentGovernance();
      }
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  const stats = data.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            Parent Governance & Relationship Verification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verify canonical parent–student bonds, authorize guardian portal access, and monitor engagement.
          </p>
        </div>
        <button
          onClick={fetchParentGovernance}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Total Parents</div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalParents || 0}</div>
          <div className="text-[10px] text-emerald-400">{stats.verifiedParents || 0} Verified</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Student Links</div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalLinks || 0}</div>
          <div className="text-[10px] text-indigo-400">{stats.verifiedLinks || 0} Canonical Bonds</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Pending Requests</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.pendingLinks || 0}</div>
          <div className="text-[10px] text-amber-300">Requires Document Audit</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Active Meetings</div>
          <div className="text-2xl font-black text-sky-400 mt-1">{stats.activeMeetings || 0}</div>
          <div className="text-[10px] text-sky-300">PTM Appointments</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'requests'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Relationship Verification Queue ({data.relationshipRequests?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('parents')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'parents'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Registered Parents Directory ({data.parentsList?.length || 0})
        </button>
      </div>

      {/* Content View */}
      {activeSubTab === 'requests' ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Parent Email</th>
                  <th className="py-3 px-4">Student & Roll</th>
                  <th className="py-3 px-4">Declared Relationship</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Loading relationship requests...
                    </td>
                  </tr>
                ) : data.relationshipRequests?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No pending parent relationship requests.
                    </td>
                  </tr>
                ) : (
                  data.relationshipRequests?.map((req) => {
                    const isVer = req.verification_status === 'Verified';
                    return (
                      <tr key={req.id || req.link_id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-mono font-medium text-slate-200">
                          {req.parent_email}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{req.student_name || 'Enrolled Student'}</div>
                          <div className="text-[11px] text-indigo-300 font-mono">{req.student_roll}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                            {req.relationship || 'Guardian'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isVer
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            }`}
                          >
                            {req.verification_status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {!isVer ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.link_id, 'Verified')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Verify
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.link_id, 'Rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30 transition inline-flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(req.link_id, 'Revoked')}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-[10px] transition"
                            >
                              Revoke Access
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
                  <th className="py-3 px-4">Parent Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Linked Student Roll</th>
                  <th className="py-3 px-4">Children Count</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.parentsList?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{p.email}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.phone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{p.student_roll}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                        {p.linked_children_count || 1} child
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {p.verification_status || 'Verified'}
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
