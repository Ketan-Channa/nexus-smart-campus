import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  ShieldAlert,
  Building2,
  Bus,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentChildrenViewProps {
  parentEmail: string;
  childrenList: LinkedStudent[];
  selectedChild: LinkedStudent | null;
  onSelectChild: (child: LinkedStudent) => void;
  onRefreshChildren: () => void;
}

export const ParentChildrenView: React.FC<ParentChildrenViewProps> = ({
  parentEmail,
  childrenList = [],
  selectedChild,
  onSelectChild,
  onRefreshChildren,
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [studentRoll, setStudentRoll] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentRoll.trim()) return;

    setLinking(true);
    setLinkMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/parent/children/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail,
          studentRoll: studentRoll.trim(),
          relationship,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLinkMsg({ type: 'success', text: data.message });
        setStudentRoll('');
        onRefreshChildren();
        setTimeout(() => setShowLinkModal(false), 2000);
      } else {
        setLinkMsg({ type: 'error', text: data.message || 'Failed to link student' });
      }
    } catch (err: any) {
      setLinkMsg({ type: 'error', text: err.message || 'Network error linking child' });
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            My Children & Student Profiles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized student links, review enrollment statuses, and switch active academic context.
          </p>
        </div>

        <button
          onClick={() => {
            setLinkMsg(null);
            setShowLinkModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/25 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Link Additional Child</span>
        </button>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childrenList.map((child: any) => {
          const isSelected = selectedChild?.roll_number === child.roll_number;
          const isVerified = (child.verification_status || 'VERIFIED') === 'VERIFIED';

          return (
            <div
              key={child.roll_number}
              className={`rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-teal-50/50 to-white dark:from-slate-800/80 dark:to-slate-900 border-teal-500 shadow-xl shadow-teal-500/10 ring-2 ring-teal-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div>
                {/* Status Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isVerified
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40'
                    }`}
                  >
                    {isVerified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{child.verification_status || 'VERIFIED'}</span>
                  </span>

                  <span className="text-[11px] font-bold text-slate-400">
                    {child.relationship || 'Child'}
                  </span>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {child.full_name ? child.full_name[0].toUpperCase() : 'S'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                      {child.full_name}
                    </h3>
                    <div className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                      Roll Number: {child.roll_number}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {child.class || 'B.Tech CSE'} • {child.semester || 'Semester 7'}
                    </div>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-4 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{child.department || 'CSE'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">College:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{child.college_name || 'PCTE IET'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Group:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{child.blood_group || 'A+'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hostel:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {child.hostel_name ? `${child.hostel_name} (${child.room_number || 'Room'})` : 'Day Scholar'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transit:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {child.conveyance_mode || 'Self Conveyance'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {isSelected ? (
                  <div className="py-2.5 px-4 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 border border-teal-500/30">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active Viewing Context</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectChild(child)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-teal-600 hover:text-white dark:bg-slate-800 dark:hover:bg-teal-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Switch to this Child</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Link Additional Child */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Link Additional Child
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Enter the official University Roll Number of your student. The system will verify guardian records or submit a verification request.
            </p>

            {linkMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs mb-4 font-semibold flex items-center gap-2 ${
                  linkMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                }`}
              >
                {linkMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{linkMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Student Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2329362"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Relationship *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Legal Guardian</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linking}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {linking ? 'Verifying...' : 'Submit Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
