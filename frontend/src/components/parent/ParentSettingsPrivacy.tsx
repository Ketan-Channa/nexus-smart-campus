import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Lock,
  Eye,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  Save,
  Globe,
  Radio,
} from 'lucide-react';
import { type LinkedStudent } from './ParentSidebar';

interface ParentSettingsPrivacyProps {
  parentEmail: string;
  selectedChild: LinkedStudent | null;
}

export const ParentSettingsPrivacy: React.FC<ParentSettingsPrivacyProps> = ({
  parentEmail,
  selectedChild,
}) => {
  const [saved, setSaved] = useState(false);
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    status: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    instantEmergencySos: true,
    attendanceAlerts: true,
    publishedResultsNotice: true,
    ptmMeetingInvites: true,
    feePaymentReminders: true,
    campusCirculars: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    allowFacultyDirectCall: true,
    shareContactWithPTA: false,
    enableTwoFactorAuth: true,
    dataRetentionConsent: true,
  });

  const [commChannel, setCommChannel] = useState<'app_email' | 'email_only' | 'all'>('app_email');

  const handleToggleNotice = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePrivacy = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.currentPassword || !passwordState.newPassword) {
      setPasswordState((prev) => ({ ...prev, status: 'Please enter both current and new password.' }));
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordState((prev) => ({ ...prev, status: 'New passwords do not match.' }));
      return;
    }
    setPasswordState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      status: 'Password updated successfully across all NEXUS portals.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Shield className="w-4 h-4 text-indigo-400" />
            Security & Governance
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Privacy & Account Settings</h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage guardian privacy protocols, emergency alerting thresholds, communication channels, and security credentials.
          </p>
        </div>
        <button
          onClick={handleSavePreferences}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-md self-start md:self-center"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved Successfully!' : 'Save Preferences'}
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Your notification preferences and privacy configurations have been synchronized with the campus server.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Realtime Notification Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Notification Preferences</h2>
              <p className="text-xs text-slate-500">Configure instant alerts and digest subscriptions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Instant Emergency SOS Alerts
                </p>
                <p className="text-xs text-slate-500 mt-0.5">High-priority push and SMS alerts if your child triggers a safety dispatch</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.instantEmergencySos}
                onChange={() => handleToggleNotice('instantEmergencySos')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Attendance Shortage Warnings (&lt; 75%)</p>
                <p className="text-xs text-slate-500 mt-0.5">Immediate notice when cumulative attendance falls below the academic debarment threshold</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.attendanceAlerts}
                onChange={() => handleToggleNotice('attendanceAlerts')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Official Published Exam Results</p>
                <p className="text-xs text-slate-500 mt-0.5">Notifies when MSE, Lab, or Semester grades are signed and published by faculty</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.publishedResultsNotice}
                onChange={() => handleToggleNotice('publishedResultsNotice')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Parent-Faculty Meeting Invites & Status</p>
                <p className="text-xs text-slate-500 mt-0.5">Notifications for upcoming PTM slots, confirmations, and faculty reschedule notes</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.ptmMeetingInvites}
                onChange={() => handleToggleNotice('ptmMeetingInvites')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Term Fee Payment Reminders</p>
                <p className="text-xs text-slate-500 mt-0.5">Advance notices for tuition, hostel, and transit fee deadlines</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.feePaymentReminders}
                onChange={() => handleToggleNotice('feePaymentReminders')}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Authorization Boundaries */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Privacy & Disclosure Controls</h2>
              <p className="text-xs text-slate-500">FERPA-aligned student guardian privacy parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Direct Faculty Liaison Consent</p>
                <p className="text-xs text-slate-500 mt-0.5">Authorizes assigned class mentors and HoD to place voice calls for urgent counseling</p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.allowFacultyDirectCall}
                onChange={() => handleTogglePrivacy('allowFacultyDirectCall')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Parent-Teacher Association (PTA) Directory</p>
                <p className="text-xs text-slate-500 mt-0.5">Allow other verified parents of your child&apos;s batch to view your primary contact for PTA activities</p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.shareContactWithPTA}
                onChange={() => handleTogglePrivacy('shareContactWithPTA')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-slate-500 mt-0.5">Requires email OTP verification when signing in to the NEXUS Parent Portal</p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.enableTwoFactorAuth}
                onChange={() => handleTogglePrivacy('enableTwoFactorAuth')}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Communication Mode Radio */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-500" />
                Primary Communication Channel
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCommChannel('app_email')}
                  className={`p-2 rounded-lg font-medium border text-center transition-all ${
                    commChannel === 'app_email'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  App + Email
                </button>
                <button
                  type="button"
                  onClick={() => setCommChannel('email_only')}
                  className={`p-2 rounded-lg font-medium border text-center transition-all ${
                    commChannel === 'email_only'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Email Only
                </button>
                <button
                  type="button"
                  onClick={() => setCommChannel('all')}
                  className={`p-2 rounded-lg font-medium border text-center transition-all ${
                    commChannel === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  App + Email + SMS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Password & Security Credentials */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 lg:col-span-2">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Security & Password Management</h2>
              <p className="text-xs text-slate-500">Update your guardian portal access password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="max-w-xl space-y-4">
            {passwordState.status && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  passwordState.status.includes('successfully')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordState.status}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordState.currentPassword}
                onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordState.confirmPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
              >
                Update Access Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
