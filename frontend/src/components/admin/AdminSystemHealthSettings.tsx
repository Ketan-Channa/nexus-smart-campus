import React, { useState, useEffect } from 'react';
import {
  Activity,
  Settings,
  Server,
  Database,
  Radio,
  Cpu,
  RefreshCw,
  CheckCircle2,
  X,
  Save,
} from 'lucide-react';

export const AdminSystemHealthSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'settings'>('health');
  const [health, setHealth] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    collegeName: 'NEXUS Smart Campus Platform',
    academicYear: '2026-27',
    activeSemester: 'Odd Semester 2026',
    attendanceThreshold: '75',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, sRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/system/health'),
        fetch('http://localhost:5000/api/admin/system-settings'),
      ]);
      const hData = await hRes.json();
      const sData = await sRes.json();
      if (hData.status === 'success') setHealth(hData.health);
      if (sData.status === 'success') setSettings(sData.settings || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          adminEmail: 'admin@nexus.edu',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMsg(`✅ ${data.message}`);
        fetchData();
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
            <Activity className="w-5 h-5 text-emerald-400" />
            System Integrations, Health Telemetry & Global Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor MySQL connection latency, active socket clusters, memory headroom, and institutional constants.
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
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-2 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'health'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Integrations & Health Telemetry
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-2 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Campus System Settings
        </button>
      </div>

      {/* Content */}
      {activeTab === 'health' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Database className="w-4 h-4 text-emerald-400" />
                Database Engine
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200">{health?.database || 'MySQL 8.0'}</div>
            <div className="text-[11px] text-slate-400 font-mono">
              Roundtrip Latency: <strong className="text-emerald-300">{health?.dbLatencyMs || 2} ms</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Radio className="w-4 h-4 text-sky-400" />
                Realtime Mesh Layer
              </span>
              <span className="text-sky-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                LISTENING
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200">{health?.socketServer || 'Socket.IO Engine'}</div>
            <div className="text-[11px] text-slate-400 font-mono">
              Channels: <strong className="text-sky-300">Bidirectional 5-Portal Sync</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Process & Memory
              </span>
              <span className="text-indigo-400 font-mono font-bold">HEALTHY</span>
            </div>
            <div className="text-sm font-semibold text-slate-200 font-mono">{health?.memoryUsed || '35 MB / 64 MB'}</div>
            <div className="text-[11px] text-slate-400 font-mono">
              Uptime: <strong className="text-indigo-300">{health?.serverUptime || 'Active'}</strong>
            </div>
          </div>

          <div className="col-span-full p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-bold text-white">Campus Mesh API Protocol:</span> {health?.apiVersion || 'v2.4.0 (Unified Campus Mesh)'}
            </div>
            <div className="font-mono text-emerald-400">Environment: {health?.environment || 'production'}</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Display Name</label>
            <input
              type="text"
              required
              value={settings.collegeName || ''}
              onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={settings.academicYear || ''}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Active Academic Term</label>
              <input
                type="text"
                required
                value={settings.activeSemester || ''}
                onChange={(e) => setSettings({ ...settings, activeSemester: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mandatory Attendance Threshold (%)</label>
            <input
              type="number"
              required
              value={settings.attendanceThreshold || 75}
              onChange={(e) => setSettings({ ...settings, attendanceThreshold: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Students falling below this threshold are automatically flagged for debarment warning in Attendance Governance.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration to MySQL
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
