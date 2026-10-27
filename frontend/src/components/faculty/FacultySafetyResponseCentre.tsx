import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  X,
  Users,
  Shield,
  Radio,
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import { type UserSession } from '../../types/auth';

interface Responder {
  facultyEmail: string;
  facultyName: string;
  department: string;
  assignedSlot: number;
  responseTime: string;
  status: string;
}

interface EmergencyAlert {
  id: number;
  alertId: string;
  studentName: string;
  studentEmail: string;
  studentMobile: string;
  emergencyType: string;
  shortDescription: string;
  locationText: string;
  latitude?: string;
  longitude?: string;
  status: 'Alert Sent' | 'Help Response Received' | 'Resolved';
  respondersCount: number;
  maxResponders: number;
  resolvedBy?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  responders: Responder[];
}

interface FacultySafetyResponseCentreProps {
  session: UserSession;
  facultyName?: string;
  facultyEmail?: string;
  department?: string;
}

export const FacultySafetyResponseCentre: React.FC<FacultySafetyResponseCentreProps> = ({
  session,
  facultyName = 'Dr. SMB',
  facultyEmail = 'faculty@nexus.edu',
  department = 'Computer Science & Engineering',
}) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Resolution modal
  const [resolveTargetAlertId, setResolveTargetAlertId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Audio Context for High-Priority Audible Alarm
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  const playChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/faculty/safety/active-alerts`);
      if (res.data.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err: any) {
      console.warn('Could not fetch active emergency alerts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  // Alarm sound loop for active, unresolved emergencies
  const activeUnresolved = alerts.filter((a) => a.status !== 'Resolved');
  useEffect(() => {
    if (activeUnresolved.length > 0 && audioEnabled && !isSilenced) {
      if (!alarmIntervalRef.current) {
        playChime();
        alarmIntervalRef.current = setInterval(playChime, 2500);
      }
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    }

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [activeUnresolved.length, audioEnabled, isSilenced]);

  // Claim First-5-Responder Slot
  const handleClaimSlot = async (alertId: string) => {
    setActionMsg(null);
    try {
      const res = await axios.post(`${API_BASE}/faculty/safety/claim-responder-slot`, {
        alertId,
        facultyEmail,
        facultyName,
        facultyDepartment: department,
      });

      if (res.data.success) {
        setActionMsg({
          type: 'success',
          text: `🚨 ${res.data.message}`,
        });
        fetchAlerts();
      }
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.message || err.message,
      });
    }
  };

  // Resolve Emergency Alert
  const handleResolveAlert = async () => {
    if (!resolveTargetAlertId || !resolutionNotes.trim()) {
      alert('Please provide notes describing how the incident was handled/resolved.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/faculty/safety/resolve-alert`, {
        alertId: resolveTargetAlertId,
        facultyEmail,
        facultyName,
        resolutionNotes,
      });

      if (res.data.success) {
        setResolveTargetAlertId(null);
        setResolutionNotes('');
        setActionMsg({
          type: 'success',
          text: '✅ Incident marked as RESOLVED. Student Portal updated in real time.',
        });
        fetchAlerts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* HEADER & SOUND CONTROL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span>Student Safety Response Centre</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time SOS Emergency Dispatch • First-Five-Faculty Rapid Response Protocol • Incident Resolution Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!audioEnabled ? (
            <button
              onClick={() => {
                setAudioEnabled(true);
                playChime();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Enable Emergency Siren Audio</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSilenced(!isSilenced)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSilenced
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse'
              }`}
            >
              {isSilenced ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSilenced ? 'Alarm Silenced (Click to Unsilence)' : 'Silence Local Alarm'}</span>
            </button>
          )}

          <button
            onClick={fetchAlerts}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* ACTIVE EMERGENCY CRITICAL ALERT BANNER */}
      {activeUnresolved.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-600/10 border-2 border-rose-500/40 shadow-xl shadow-rose-600/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <h3 className="font-display font-black text-base text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                CRITICAL EMERGENCY SOS ACTIVE: {activeUnresolved.length} ALERT(S) REQUIRE FACULTY ATTENDANCE
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold">
              High Priority
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            A student has activated the NEXUS SOS Emergency Beacon. Up to 5 campus faculty responders can claim active on-scene responder slots to coordinate immediate assistance.
          </p>
        </div>
      )}

      {/* ALERTS LIST */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0a0d18] border border-slate-200 dark:border-slate-800">
            <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Campus Secure & Safe</h3>
            <p className="text-xs text-slate-400 mt-1">No emergency SOS signals currently active.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isResolved = alert.status === 'Resolved';
            const isMyResponse = alert.responders.some((r) => r.facultyEmail === facultyEmail);
            const isSlotsFull = (alert.respondersCount || 0) >= 5;

            return (
              <div
                key={alert.alertId}
                className={`p-6 rounded-3xl bg-white dark:bg-[#0a0d18] border transition-all shadow-xl ${
                  isResolved
                    ? 'border-slate-200 dark:border-slate-800/80 opacity-80'
                    : 'border-rose-500/40 dark:border-rose-500/40 shadow-rose-600/5'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {alert.alertId}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse'
                        }`}
                      >
                        {alert.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{alert.emergencyType}</span>
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300">{alert.shortDescription}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Location: {alert.locationText}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Student Contact: {alert.studentMobile || 'Available to Responders'}</span>
                      </div>
                    </div>

                    {isResolved && alert.resolutionNotes && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 mt-2">
                        <strong>Resolution Details:</strong> {alert.resolutionNotes} (Resolved by {alert.resolvedBy})
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 shrink-0">
                    {!isResolved && (
                      <>
                        <button
                          onClick={() => handleClaimSlot(alert.alertId)}
                          disabled={isMyResponse || isSlotsFull}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                            isMyResponse
                              ? 'bg-emerald-600 text-white cursor-default'
                              : isSlotsFull
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>
                            {isMyResponse
                              ? '✓ You Responded'
                              : isSlotsFull
                              ? '5/5 Slots Filled'
                              : 'Accept / Respond (Claim Slot)'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setResolveTargetAlertId(alert.alertId);
                            setResolutionNotes('');
                          }}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                        >
                          Mark as Resolved
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* FIRST-FIVE RESPONDERS GRID */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>First-Five-Faculty Rapid Response Team:</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {alert.responders.length} / 5 Claimed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[1, 2, 3, 4, 5].map((slotNum) => {
                      const resp = alert.responders.find((r) => r.assignedSlot === slotNum);
                      return (
                        <div
                          key={slotNum}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            resp
                              ? 'bg-purple-500/10 border-purple-500/30'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold text-slate-400 block mb-0.5">
                            Slot #{slotNum}
                          </span>
                          {resp ? (
                            <div>
                              <div className="font-bold text-xs text-purple-600 dark:text-purple-300 truncate">
                                {resp.facultyName}
                              </div>
                              <span className="text-[9px] text-slate-400 block truncate">{resp.department}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium italic">Available</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RESOLUTION MODAL */}
      <AnimatePresence>
        {resolveTargetAlertId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Resolve Emergency Incident</h3>
                </div>
                <button onClick={() => setResolveTargetAlertId(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Please enter action summary and notes describing how the student's safety concern was addressed. This will update the student's SOS beacon in real time.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Resolution Summary / Action Notes</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Campus Security and Faculty attended the site. Medical assistance provided and student escorted safely to hostel."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setResolveTargetAlertId(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveAlert}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  Confirm & Resolve Incident
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
