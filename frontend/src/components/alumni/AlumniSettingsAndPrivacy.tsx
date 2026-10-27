import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  Key,
  Save,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface AlumniSettingsAndPrivacyProps {
  session: any;
}

export const AlumniSettingsAndPrivacy: React.FC<AlumniSettingsAndPrivacyProps> = ({ session }) => {
  const userEmail = session?.email || '';

  const [verification, setVerification] = useState<any>(null);
  const [privacyLevel, setPrivacyLevel] = useState('CAMPUS_ONLY');
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);

  // Password Update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, [userEmail]);

  const fetchVerificationStatus = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/verification-status/${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.status === 'success' && data.verification) {
        setVerification(data.verification);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrivacy(true);
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          privacyLevel,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPrivacySuccess(true);
        setTimeout(() => setPrivacySuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdMsg(null), 4000);
      } else {
        setPwdMsg({ type: 'error', text: data.message || 'Password update failed' });
      }
    } catch (e: any) {
      setPwdMsg({ type: 'error', text: e.message || 'Server error' });
    }
  };

  const status = verification?.verification_status || session?.verificationStatus || 'PENDING';
  const isVerified = status === 'VERIFIED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          Account Governance, Privacy & Security
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Institutional verification status, directory visibility policies, and account credentials.
        </p>
      </div>

      {/* 1. INSTITUTIONAL VERIFICATION STATUS CARD */}
      <div
        className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
          isVerified
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
            : status === 'SUSPENDED'
            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
                isVerified ? 'bg-emerald-600' : status === 'SUSPENDED' ? 'bg-rose-600' : 'bg-amber-600'
              }`}
            >
              {isVerified ? (
                <ShieldCheck className="w-6 h-6" />
              ) : status === 'SUSPENDED' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Institutional Verification: {status}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isVerified
                  ? `Official Alumni ID: ${verification?.alumni_id || session?.alumniId || 'Assigned'}. You have unrestricted access to mentorship, jobs, and networking.`
                  : status === 'CLARIFICATION_REQUIRED'
                  ? 'The university administrator has requested additional details before finalizing your verification.'
                  : status === 'UNDER_REVIEW'
                  ? 'Your profile submission is actively under administrative audit.'
                  : status === 'SUSPENDED'
                  ? 'Your account has been suspended by campus administration.'
                  : 'Your registration is queued for university verification. Certain services will activate upon approval.'}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Feedback / Clarification Notes if any */}
        {(verification?.clarification_message || verification?.verification_notes || verification?.suspended_reason) && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Official Institutional Notes:</span>
            <p className="text-slate-700 dark:text-slate-300">
              {verification.clarification_message || verification.verification_notes || verification.suspended_reason}
            </p>
          </div>
        )}
      </div>

      {/* 2. DIRECTORY PRIVACY SETTINGS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-500" />
          Directory Visibility Policies
        </h3>

        {privacySuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 text-xs font-bold">
            Privacy policy updated successfully!
          </div>
        )}

        <form onSubmit={handleSavePrivacy} className="space-y-3 text-xs">
          <p className="text-slate-500">
            Configure who can see your contact information, graduation details, and employment history in the campus search directory.
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'CAMPUS_ONLY',
                title: 'Campus Only (Recommended)',
                desc: 'Visible to verified NEXUS students, faculty members, and fellow alumni.',
              },
              {
                id: 'PUBLIC',
                title: 'Public Directory',
                desc: 'Visible across all campus portals and search engines.',
              },
              {
                id: 'CONNECTIONS_ONLY',
                title: 'Connections Only',
                desc: 'Only accepted friends and connected peers can see full professional details.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  privacyLevel === opt.id
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={opt.id}
                  checked={privacyLevel === opt.id}
                  onChange={(e) => setPrivacyLevel(e.target.value)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{opt.title}</h4>
                  <p className="text-[11px] text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPrivacy}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
            >
              {savingPrivacy ? 'Saving...' : 'Save Privacy Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. PASSWORD & SECURITY */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" />
          Update Account Password
        </h3>

        {pwdMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold ${
              pwdMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
            }`}
          >
            {pwdMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs max-w-md">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              required
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
