import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { type UserRole, type UserSession } from '../../types/auth';
import { RoleSelector } from './RoleSelector';
import { LoginForm } from './LoginForm';
import { RegistrationModal } from './RegistrationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationBell } from '../notifications/NotificationBell';
import { GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthContainerProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-[#090714] text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow transition-colors duration-500" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none transition-colors duration-500" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[size:4rem_4rem] pointer-events-none bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e1b4b25_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b25_1px,transparent_1px)] transition-colors duration-500" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl p-6 sm:p-10 space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                NEXUS <span className="text-indigo-600 dark:text-purple-400 font-bold text-lg">PORTAL</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unified Authentication System for Smart Campus Operations
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-purple-950/60 border border-indigo-200 dark:border-purple-800/60 text-indigo-700 dark:text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Based Access Control</span>
          </div>
        </div>

        {/* Role Selector Tabs / Cards */}
        <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />

        {/* Dynamic Login Form */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              {selectedRole} Portal Login
            </h3>
          </div>

          <LoginForm
            role={selectedRole}
            onSuccessLogin={onLoginSuccess}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
          />
        </div>

        {/* Space before modals */}
      </motion.div>


      {/* Registration Modal */}
      <RegistrationModal
        role={selectedRole}
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccessRegister={() => {
          setIsRegisterOpen(false);
        }}
      />

      {/* Forgot Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        initialRole={selectedRole}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* Circular Controls at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <NotificationBell variant="circular" />
        <ThemeToggle variant="circular" />
      </div>
    </div>
  );
};
