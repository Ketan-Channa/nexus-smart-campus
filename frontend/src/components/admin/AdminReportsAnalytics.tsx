import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Download,
  RefreshCw,
  Building2,
  Clock,
  CreditCard,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminReportsAnalytics: React.FC = () => {
  const [reports, setReports] = useState<any>({
    deptEnrollment: [],
    attendanceRates: [],
    feeCollections: [],
    safetyMetrics: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/reports/analytics');
      const data = await res.json();
      if (data.status === 'success') {
        setReports(data.reports || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCsv = (title: string, rows: any[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(',');
    const values = rows.map((r) => Object.values(r).join(',')).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + '\n' + values;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            Executive Reports & Institutional Campus Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime database aggregation, department performance metrics, financial telemetry, and CSV report exports.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Enrollment Report */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Enrollment Distribution
            </h3>
            <button
              onClick={() => exportCsv('department_enrollment', reports.deptEnrollment)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>

          <div className="space-y-2">
            {reports.deptEnrollment?.map((d: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs py-2 border-b border-slate-800/40">
                <span className="text-slate-200">{d.department}</span>
                <span className="font-mono text-white font-bold">{d.student_count} Enrolled</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Rates by Department */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Department Attendance Compliance
            </h3>
            <button
              onClick={() => exportCsv('attendance_rates', reports.attendanceRates)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>

          <div className="space-y-2">
            {reports.attendanceRates?.map((a: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs py-2 border-b border-slate-800/40">
                <span className="text-slate-200">{a.department}</span>
                <span className="font-mono text-emerald-400 font-bold">{a.avg_attendance}% Average</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Collection by Category */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Fee Collections by Head
            </h3>
            <button
              onClick={() => exportCsv('fee_collections', reports.feeCollections)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>

          <div className="space-y-2">
            {reports.feeCollections?.map((f: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs py-2 border-b border-slate-800/40">
                <span className="text-slate-200">{f.fee_type || 'General Fee'}</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ₹{Number(f.collected_amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Incident Metrics */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Safety & Grievance Metrics
            </h3>
            <button
              onClick={() => exportCsv('safety_metrics', reports.safetyMetrics)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>

          <div className="space-y-2">
            {reports.safetyMetrics?.map((s: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs py-2 border-b border-slate-800/40">
                <span className="text-slate-200">
                  {s.severity || 'Normal'} Severity ({s.status || 'Resolved'})
                </span>
                <span className="font-mono text-white font-bold">{s.count} Incidents</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
