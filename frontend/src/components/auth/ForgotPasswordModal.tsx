import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type UserRole, SECURITY_QUESTIONS_LIST } from '../../types/auth';
import { X, KeyRound, ShieldAlert, CheckCircle2, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  initialRole: UserRole;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  initialRole,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [answers, setAnswers] = useState({ a1: '', a2: '', a3: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your roll number or identifier.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Lockout check
    if (attempts >= 5) {
      setIsLocked(true);
      return;
    }

    if (!answers.a1 || !answers.a2 || !answers.a3) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsLocked(true);
      } else {
        setErrorMessage(`Security question answers incorrect. Attempt ${newAttempts} of 5.`);
      }
      return;
    }

    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setResetDone(true);
    setTimeout(() => {
      onClose();
      setResetDone(false);
      setStep(1);
      setAttempts(0);
    }, 1800);
  };

  const getIdentifierLabel = () => {
    switch (role) {
      case 'Student':
        return 'Roll Number';
      case 'Faculty':
        return 'Faculty Name or Employee ID';
      case 'Parent':
        return 'Student Roll Number';
      case 'Alumni':
        return 'Roll Number / Alumni ID';
      case 'Administrator':
        return 'Admin Name';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-500" />
                Password Recovery System
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Step {step} of 3: {step === 1 ? 'Identify Account' : step === 2 ? 'Security Questions' : 'Reset Password'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Locked State */}
          {isLocked ? (
            <div className="p-8 text-center space-y-3">
              <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-pulse" />
              <h4 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Account Locked
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                You have exceeded the maximum limit of 5 failed security attempts. For safety, your account is locked for <strong className="text-rose-500">30 minutes</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close Recovery
              </button>
            </div>
          ) : resetDone ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Password Reset Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can now log in with your new credentials.
              </p>
            </div>
          ) : (
            <div className="p-6">
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: Select Role & Enter Identifier */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      1. Select Account Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Parent">Parent</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      2. Enter {getIdentifierLabel()}
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={`Enter your ${getIdentifierLabel()}`}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
                    >
                      Verify Account Identity
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Answer Previously Selected Security Questions */}
              {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Answer your 3 configured security questions for account <strong className="text-slate-900 dark:text-white">{identifier}</strong>.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        1. {SECURITY_QUESTIONS_LIST[0]}
                      </label>
                      <input
                        type="text"
                        required
                        value={answers.a1}
                        onChange={(e) => setAnswers({ ...answers, a1: e.target.value })}
                        placeholder="Your answer"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        2. {SECURITY_QUESTIONS_LIST[1]}
                      </label>
                      <input
                        type="text"
                        required
                        value={answers.a2}
                        onChange={(e) => setAnswers({ ...answers, a2: e.target.value })}
                        placeholder="Your answer"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        3. {SECURITY_QUESTIONS_LIST[2]}
                      </label>
                      <input
                        type="text"
                        required
                        value={answers.a3}
                        onChange={(e) => setAnswers({ ...answers, a3: e.target.value })}
                        placeholder="Your answer"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md"
                    >
                      Validate Security Answers
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Reset Password */}
              {step === 3 && (
                <form onSubmit={handleStep3Submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
