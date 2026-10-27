import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { type UserRole, type UserSession } from '../../types/auth';

import { User, Lock, Hash, Eye, EyeOff, LogIn, KeyRound, UserPlus } from 'lucide-react';

interface LoginFormProps {
  role: UserRole;
  onSuccessLogin: (session: UserSession) => void;
  onOpenRegister: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  onSuccessLogin,
  onOpenRegister,
  onOpenForgotPassword,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    alumniId: '',
    facultyName: '',
    studentName: '',
    studentRollNumber: '',
    adminName: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://nexus-smart-campus-backend.onrender.com/api/auth/login', {
        role,
        ...formData,
      });


      setLoading(false);
      if (response.data.status === 'success') {
        onSuccessLogin(response.data.user);
      } else {
        setError(response.data.message || 'Login failed. Invalid credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      const apiMessage = err.response?.data?.message;
      if (apiMessage) {
        setError(apiMessage);
      } else {
        setError('Server unreachable. Please verify backend npm start is running on port 5000.');
      }
    }
  };



  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="w-full space-y-4 text-left"
    >
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Dynamic Fields Per Role */}

      {/* STUDENT ROLE */}
      {role === 'Student' && (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Roll Number
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="rollNumber"
                required
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g. 2329362"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </>
      )}

      {/* ALUMNI ROLE */}
      {role === 'Alumni' && (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Roll Number / Alumni ID
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="alumniId"
                required
                value={formData.alumniId}
                onChange={handleChange}
                placeholder="e.g. ALUM-2024-93"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </>
      )}

      {/* FACULTY ROLE */}
      {role === 'Faculty' && (
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Faculty Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="facultyName"
              required
              value={formData.facultyName}
              onChange={handleChange}
              placeholder="Prof. / Dr. Full Name"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* PARENT ROLE */}
      {role === 'Parent' && (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Student Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="studentName"
                required
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Enter child's full name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Student Roll Number
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="studentRollNumber"
                required
                value={formData.studentRollNumber}
                onChange={handleChange}
                placeholder="Child's roll number"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </>
      )}

      {/* ADMINISTRATOR ROLE */}
      {role === 'Administrator' && (
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Admin Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="adminName"
              required
              value={formData.adminName}
              onChange={handleChange}
              placeholder="Enter administrator username"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* PASSWORD FIELD (Common to all roles) */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {role === 'Parent' ? 'Parent Password' : role === 'Faculty' ? 'Faculty Password' : 'Password'}
          </label>

          <button
            type="button"
            onClick={onOpenForgotPassword}
            className="text-[11px] font-semibold text-indigo-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3" /> Forgot Password?
          </button>
        </div>

        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-purple-500 transition-colors"
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

      {/* SUBMIT BUTTONS */}
      <div className="pt-2 space-y-2.5">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Login to {role} Portal</span>
            </>
          )}
        </button>

        {/* CREATE ACCOUNT BUTTON (Enabled for all roles including Admin) */}
        <button
          type="button"
          onClick={onOpenRegister}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create New {role} Account</span>
        </button>
      </div>
    </motion.form>
  );
};
