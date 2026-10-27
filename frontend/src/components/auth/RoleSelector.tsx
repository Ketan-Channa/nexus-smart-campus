import React from 'react';
import { motion } from 'framer-motion';
import { type UserRole } from '../../types/auth';
import { GraduationCap, Briefcase, Users, Award, ShieldCheck } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  const roles: { role: UserRole; title: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'Student',
      title: 'Student',
      description: 'Access courses, attendance, timetables & AI resume analyzer.',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      role: 'Faculty',
      title: 'Faculty',
      description: 'Manage class attendance, assignments & student grading.',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
    },
    {
      role: 'Parent',
      title: 'Parent',
      description: 'Track academic progress, attendance & fee payments.',
      icon: <Users className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      role: 'Alumni',
      title: 'Alumni',
      description: 'Connect with campus network, events & placement portal.',
      icon: <Award className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
    },
    {
      role: 'Administrator',
      title: 'Administrator',
      description: 'Campus management, user access & system administration.',
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-600',
    },
  ];

  return (
    <div className="w-full space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">
        Select Portal Role
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {roles.map((item) => {
          const isSelected = selectedRole === item.role;
          return (
            <motion.button
              key={item.role}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectRole(item.role)}
              className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all duration-300 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 dark:border-purple-500 shadow-lg shadow-indigo-500/10 dark:shadow-purple-500/20 ring-2 ring-indigo-500/20 dark:ring-purple-500/30'
                  : 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-400'
              }`}
            >
              {/* Selected Badge Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="roleActiveGlow"
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 ring-2 ring-white dark:ring-slate-900"
                />
              )}

              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md mb-2`}
              >
                {item.icon}
              </div>

              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-1 line-clamp-2 hidden sm:block">
                  {item.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
