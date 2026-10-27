import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { NotificationToast } from './components/notifications/NotificationToast';
import { NotificationDetailModal } from './components/notifications/NotificationDetailModal';
import { SplashScreen } from './components/SplashScreen';
import { AuthContainer } from './components/auth/AuthContainer';
import { CampusHub } from './components/CampusHub';
import { FacultyPortal } from './components/faculty/FacultyPortal';
import { AlumniPortal } from './components/alumni/AlumniPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { type UserSession } from './types/auth';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const [stage, setStage] = useState<'splash' | 'auth' | 'dashboard'>(() => {
    // Force fresh stage reload
    const savedSession = sessionStorage.getItem('nexus_session');
    return savedSession ? 'dashboard' : 'splash';
  });

  const [session, setSession] = useState<UserSession | null>(() => {
    const savedSession = sessionStorage.getItem('nexus_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const handleSplashComplete = () => {
    setStage('auth');
  };

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    sessionStorage.setItem('nexus_session', JSON.stringify(userSession));
    setStage('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nexus_session');
    setSession(null);
    setStage('auth');
  };

  return (
    <ThemeProvider>
      <RealtimeProvider session={session}>
        <NotificationProvider>
          <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-[#090714] relative">
            {/* Global 10-Second Toast Alert & Notification Detail Modal */}
            <NotificationToast />
            <NotificationDetailModal />

            <AnimatePresence mode="wait">
              {stage === 'splash' && (
                <motion.div
                  key="splash"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.6 } }}
                >
                  <SplashScreen onComplete={handleSplashComplete} />
                </motion.div>
              )}

              {stage === 'auth' && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <AuthContainer onLoginSuccess={handleLoginSuccess} />
                </motion.div>
              )}

              {stage === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {((session as any)?.role === 'Faculty' || (session as any)?.user?.role === 'Faculty') ? (
                    <FacultyPortal session={session!} onLogout={handleLogout} />
                  ) : ((session as any)?.role === 'Alumni' || (session as any)?.user?.role === 'Alumni') ? (
                    <AlumniPortal session={session!} onLogout={handleLogout} />
                  ) : ((session as any)?.role === 'Parent' || (session as any)?.user?.role === 'Parent') ? (
                    <ParentPortal session={session!} onLogout={handleLogout} />
                  ) : ((session as any)?.role === 'Administrator' || (session as any)?.role === 'Admin' || (session as any)?.user?.role === 'Administrator' || (session as any)?.user?.role === 'Admin') ? (
                    <AdminPortal session={session!} onLogout={handleLogout} />
                  ) : (
                    <CampusHub onShowSplash={handleLogout} session={session} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </NotificationProvider>
      </RealtimeProvider>
    </ThemeProvider>
  );
};

export default App;
