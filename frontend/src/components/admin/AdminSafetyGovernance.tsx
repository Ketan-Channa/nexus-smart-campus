import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Clock,
  X,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export const AdminSafetyGovernance: React.FC = () => {
  const [data, setData] = useState<{
    sosAlerts: any[];
    safetyReports: any[];
    responders: any[];
  }>({
    sosAlerts: [],
    safetyReports: [],
    responders: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'sos' | 'reports'>('sos');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Resolution Modal
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [sosStatus, setSosStatus] = useState<string>('Help En Route');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  // Complaint Status Modal
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportStatus, setReportStatus] = useState<string>('Under Investigation');

  const fetchSafetyData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/safety/overview');
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
    fetchSafetyData();
  }, []);

  const handleUpdateSos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/safety/sos/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: selectedAlert.id || selectedAlert.alert_id,
          status: sosStatus,
          resolutionNotes,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setActionMsg(`✅ ${json.message}`);
        setSelectedAlert(null);
        setResolutionNotes('');
        fetchSafetyData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/safety/reports/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id || selectedReport.report_id,
          status: reportStatus,
          adminEmail: 'admin@nexus.edu',
          adminName: 'Super Administrator',
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setActionMsg(`✅ ${json.message}`);
        setSelectedReport(null);
        fetchSafetyData();
      }
    } catch (err: any) {
      setActionMsg(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/60 border border-rose-500/30 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              CAMPUS SECURITY & RAPID RESPONSE
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Student Safety & Voice Incident Command
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervise SOS emergency dispatches, faculty first-responder assignments, and confidential grievances.
          </p>
        </div>
        <button
          onClick={fetchSafetyData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('sos')}
          className={`pb-2 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'sos'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Emergency SOS Alerts ({data.sosAlerts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'reports'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Student Complaints & Safety Reports ({data.safetyReports?.length || 0})
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'sos' ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student & Contact</th>
                  <th className="py-3 px-4">Emergency Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Responders</th>
                  <th className="py-3 px-4">Alert Status</th>
                  <th className="py-3 px-4 text-right">Command Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.sosAlerts?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                      No active emergency alerts across campus.
                    </td>
                  </tr>
                ) : (
                  data.sosAlerts?.map((sos) => {
                    const isResolved = sos.status === 'Resolved';
                    return (
                      <tr key={sos.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{sos.student_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {sos.student_mobile || 'Emergency Contact'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-rose-300">{sos.emergency_type || 'General SOS'}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{sos.short_description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-slate-200">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{sos.location_text || 'Campus Premises'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[10px]">
                            {sos.responders_count || 0} Faculty Dispatched
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isResolved
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                            }`}
                          >
                            {sos.status || 'Alert Sent'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedAlert(sos);
                              setSosStatus(isResolved ? 'Resolved' : 'Help En Route');
                              setResolutionNotes(sos.resolution_notes || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30 transition text-[11px]"
                          >
                            Update Incident
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
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title & Category</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Severity & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.safetyReports?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No student complaints currently logged.
                    </td>
                  </tr>
                ) : (
                  data.safetyReports?.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{r.title || 'Safety Grievance'}</div>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                          {r.category || 'Anti-Ragging'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">
                          {r.is_anonymous ? 'Anonymous Student' : r.student_name}
                        </div>
                        {!r.is_anonymous && (
                          <div className="text-[10px] text-slate-500 font-mono">{r.student_roll}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-300">{r.severity || 'Moderate'}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.location || 'Campus'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {r.status || 'Submitted'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setReportStatus(r.status || 'Under Investigation');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/20 transition text-[11px]"
                        >
                          Update Case
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SOS Status Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Update Emergency SOS Command Status
              </h3>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>Student: <strong className="text-white">{selectedAlert.student_name}</strong></div>
              <div>Emergency: <strong className="text-rose-400">{selectedAlert.emergency_type}</strong></div>
              <div>Location: {selectedAlert.location_text || 'Campus Premises'}</div>
            </div>

            <form onSubmit={handleUpdateSos} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Incident Status</label>
                <select
                  value={sosStatus}
                  onChange={(e) => setSosStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Alert Sent">Alert Sent</option>
                  <option value="Help En Route">Help En Route (Responders Mobilized)</option>
                  <option value="Resolved">Resolved (Safe & Secure)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resolution / Security Log Notes</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Security patrol arrived at venue, medical assistance rendered."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/20"
                >
                  Commit Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Status Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Update Grievance Status</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateReport} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Case Status</label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Action Taken">Action Taken</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Dismissed">Dismissed</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Update Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
