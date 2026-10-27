import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Clock,
  MapPin,
  RefreshCw,
  HeartPulse,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentStudentSafetyProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentStudentSafety: React.FC<ParentStudentSafetyProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSafety = async () => {
    if (!parentEmail || !selectedChild?.roll_number) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/parent/safety?email=${encodeURIComponent(
          parentEmail
        )}&studentRoll=${encodeURIComponent(selectedChild.roll_number)}`
      );
      const json = await res.json();
      if (json.success) {
        setAlerts(json.alerts || []);
      }
    } catch (err) {
      console.error('Fetch safety error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafety();
  }, [parentEmail, selectedChild?.roll_number]);

  const campusHotlines = [
    { title: 'Campus Security Central Control', number: '+91 161 2888500', desc: '24/7 Rapid Patrol Response' },
    { title: 'Student Safety & Voice Cell', number: '+91 161 2888511', desc: 'Immediate Counseling & Intervention' },
    { title: 'Campus Health Centre & Ambulance', number: '+91 161 2888522', desc: 'Emergency Medical Evacuation' },
    { title: 'Hostel Chief Warden Office', number: '+91 161 2888533', desc: 'Residential Student Support' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Student Safety & Emergency Response
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional emergency monitoring and rapid responder status for {selectedChild?.full_name} ({selectedChild?.roll_number})
          </p>
        </div>

        <button
          onClick={fetchSafety}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Safety Status</span>
        </button>
      </div>

      {/* Safety Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-300">
              Active Security Guard Status
            </div>
            <h3 className="text-xl font-extrabold mt-0.5">
              {alerts.length > 0 && alerts[0].status !== 'Resolved'
                ? `Emergency Alert Active: ${alerts[0].emergency_type}`
                : 'Student Status Safe & Normal'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              NEXUS 24/7 Smart Campus Safety Network monitoring {selectedChild?.full_name}.
            </p>
          </div>
        </div>

        <div className="text-xs text-emerald-300 font-bold px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md self-start md:self-auto">
          Campus Perimeter Secure
        </div>
      </div>

      {/* Emergency Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          Safety Event Records
        </h3>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((al: any) => (
              <div
                key={al.alert_id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {al.emergency_type} Alert
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        al.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                      }`}
                    >
                      {al.status}
                    </span>
                  </div>

                  <div className="text-slate-500 mt-1">
                    Triggered: {al.created_at ? new Date(al.created_at).toLocaleString() : 'Recent'}
                    {al.resolved_at && ` • Resolved: ${new Date(al.resolved_at).toLocaleString()}`}
                  </div>
                </div>

                {al.resolved_by && (
                  <div className="text-right text-slate-600 dark:text-slate-400 font-medium">
                    Verified By: <strong>{al.resolved_by}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No emergency alerts recorded for this student.
          </div>
        )}
      </div>

      {/* Campus Emergency Hotline Contacts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          24/7 Campus Emergency Hotlines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {campusHotlines.map((hl, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{hl.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{hl.desc}</div>
              </div>
              <a
                href={`tel:${hl.number.replace(/\s+/g, '')}`}
                className="mt-3 py-2 px-3 bg-teal-600/10 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-300 font-extrabold rounded-xl transition-all text-center block"
              >
                {hl.number}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
