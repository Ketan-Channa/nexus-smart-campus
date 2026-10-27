import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Sparkles,
  Crown,
  Save,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  GraduationCap,
  Building2,
  User,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import { type UserSession } from '../../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nexus-smart-campus-backend.onrender.com';

interface FacultyProfileProps {
  session?: UserSession | null;
  facultyName?: string;
  department?: string;
  designation?: string;
  email?: string;
}

export const FacultyProfile: React.FC<FacultyProfileProps> = ({
  session,
  facultyName: propName,
  department: propDept,
  designation: propDesig,
  email: propEmail,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile data from backend
  const [profile, setProfile] = useState({
    name: propName || session?.name || 'Dr. SMB',
    employeeId: (session as any)?.employeeId || (session as any)?.facultyCode || 'EMP-CSE-101',
    email: propEmail || session?.email || 'faculty@nexus.edu',
    department: propDept || (session as any)?.department || 'Computer Science & Engineering',
    designation: propDesig || 'Associate Professor',
    phone: '+91 98765 43210',
    officeLocation: 'Faculty Block A • Room 304',
    bio: 'Associate Professor specializing in Distributed Systems, Blockchain Architectures, and Database Engineering with 8+ years of academic and industry research experience.',
    isClassIncharge: (session as any)?.isClassIncharge || (session as any)?.is_class_incharge || 'Yes',
    inchargeClass: (session as any)?.inchargeClass || (session as any)?.incharge_class || 'BTECH CSE 4A',
    joiningDate: 'July 15, 2020 (6 Years Active)',
    subjects: [
      'Agile Software Development (CSE-403)',
      'Blockchain Technologies (CSE-405)',
      'Database Management Systems (BCA-301)',
    ],
    assignedClasses: ['BTECH CSE 4A', 'BCA 3B', 'MTECH CSE 1A'],
    researchInterests: 'Blockchain Security, Consensus Algorithms, Edge Computing, Decentralized Storage',
    professionalLinks: {
      linkedin: 'https://linkedin.com/in/nexus-faculty',
      github: 'https://github.com/nexus-faculty',
      googleScholar: 'https://scholar.google.com/citations?user=nexus',
      website: 'https://nexus.edu/faculty/smb',
    },
  });

  // Edit form state
  const [formData, setFormData] = useState({
    phone: '',
    officeLocation: '',
    bio: '',
    researchInterests: '',
    linkedin: '',
    github: '',
    website: '',
    googleScholar: '',
  });

  // Fetch live faculty profile from backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/faculty/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data && res.data.faculty) {
        const f = res.data.faculty;
        const updated = {
          name: f.name || profile.name,
          employeeId: f.employee_id || f.employeeId || profile.employeeId,
          email: f.email || profile.email,
          department: f.department || profile.department,
          designation: f.designation || profile.designation,
          phone: f.phone || profile.phone,
          officeLocation: f.office_location || f.officeLocation || profile.officeLocation,
          bio: f.bio || profile.bio,
          isClassIncharge: f.is_class_incharge || f.isClassIncharge || profile.isClassIncharge,
          inchargeClass: f.incharge_class || f.inchargeClass || profile.inchargeClass,
          joiningDate: f.created_at ? `Joined ${new Date(f.created_at).toLocaleDateString()}` : profile.joiningDate,
          subjects: Array.isArray(f.subjects) ? f.subjects : profile.subjects,
          assignedClasses: Array.isArray(f.assigned_classes) ? f.assigned_classes : profile.assignedClasses,
          researchInterests: f.research_interests || profile.researchInterests,
          professionalLinks: typeof f.professional_links === 'object' && f.professional_links !== null
            ? { ...profile.professionalLinks, ...f.professional_links }
            : profile.professionalLinks,
        };

        setProfile(updated);
        setFormData({
          phone: updated.phone,
          officeLocation: updated.officeLocation,
          bio: updated.bio,
          researchInterests: updated.researchInterests,
          linkedin: updated.professionalLinks.linkedin || '',
          github: updated.professionalLinks.github || '',
          website: updated.professionalLinks.website || '',
          googleScholar: updated.professionalLinks.googleScholar || '',
        });
      }
    } catch (err) {
      console.warn('Using local faculty profile baseline:', err);
      // Initialize form data with fallback values
      setFormData({
        phone: profile.phone,
        officeLocation: profile.officeLocation,
        bio: profile.bio,
        researchInterests: profile.researchInterests,
        linkedin: profile.professionalLinks.linkedin || '',
        github: profile.professionalLinks.github || '',
        website: profile.professionalLinks.website || '',
        googleScholar: profile.professionalLinks.googleScholar || '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('nexus_token');
      const payload = {
        phone: formData.phone,
        officeLocation: formData.officeLocation,
        bio: formData.bio,
        researchInterests: formData.researchInterests,
        professionalLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website,
          googleScholar: formData.googleScholar,
        },
      };

      const res = await axios.put(`${API_BASE_URL}/api/faculty/profile`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data?.success) {
        setProfile((prev) => ({
          ...prev,
          phone: formData.phone,
          officeLocation: formData.officeLocation,
          bio: formData.bio,
          researchInterests: formData.researchInterests,
          professionalLinks: payload.professionalLinks,
        }));
        setFeedback({ type: 'success', message: 'Faculty profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setFeedback(null), 4000);
      } else {
        throw new Error(res.data?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Error updating profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-left">
      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN PROFILE CARD */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        {/* TOP HEADER: AVATAR, NAME, ROLES, EDIT BUTTON */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black font-display text-3xl shadow-xl shadow-purple-600/30 shrink-0">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> {profile.employeeId}
                </span>

                {profile.isClassIncharge === 'Yes' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Crown className="w-3.5 h-3.5 text-amber-400" /> Incharge: {profile.inchargeClass}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Faculty
                </span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">{profile.name}</h2>
              <p className="text-sm font-bold text-slate-300">
                {profile.designation} • {profile.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (!isEditing) {
                  setFormData({
                    phone: profile.phone,
                    officeLocation: profile.officeLocation,
                    bio: profile.bio,
                    researchInterests: profile.researchInterests,
                    linkedin: profile.professionalLinks.linkedin || '',
                    github: profile.professionalLinks.github || '',
                    website: profile.professionalLinks.website || '',
                    googleScholar: profile.professionalLinks.googleScholar || '',
                  });
                }
                setIsEditing(!isEditing);
              }}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
                isEditing
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" /> Cancel Edit
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* EDIT MODE FORM */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-6 pt-2">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
              <strong>Note:</strong> Privileged institutional fields (Faculty Name, Employee ID, Department, Designation, and Class Incharge assignment) are managed by Campus Academic Administration and are locked. You may update your official contact details, bio, research domains, and links below.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Office / Cabin Location
                </label>
                <input
                  type="text"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  placeholder="e.g. Faculty Block A • Room 304"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Professional Biography
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summarize your academic focus, teaching philosophy, and background..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Research Interests & Domains (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.researchInterests}
                  onChange={(e) => setFormData({ ...formData, researchInterests: e.target.value })}
                  placeholder="e.g. Distributed Systems, Blockchain, Natural Language Processing"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> GitHub / Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* VIEW MODE */
          <div className="space-y-6">
            {/* BIOGRAPHY */}
            {profile.bio && (
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">
                  Professional Biography & Background
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* KEY METRIC TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-purple-400" /> Email Address
                </span>
                <strong className="text-white font-mono block text-xs truncate">{profile.email}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" /> Contact Number
                </span>
                <strong className="text-white font-mono block text-xs">{profile.phone}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" /> Office / Cabin
                </span>
                <strong className="text-white block text-xs truncate">{profile.officeLocation}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Institutional Tenure
                </span>
                <strong className="text-white block text-xs truncate">{profile.joiningDate}</strong>
              </div>
            </div>

            {/* ASSIGNED SUBJECTS & COURSE LOAD */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Assigned Subjects & Teaching Load
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {profile.subjects.map((subj, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>

            {/* ASSIGNED CLASSES & SECTIONS */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Teaching Classes & Department Roster
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {profile.assignedClasses.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            {/* RESEARCH INTERESTS */}
            {profile.researchInterests && (
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Research Interests & Specialization
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {profile.researchInterests.split(',').map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-medium"
                    >
                      {item.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PROFESSIONAL PORTFOLIO LINKS */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Professional Links & Portfolio
              </h4>
              <div className="flex flex-wrap gap-3 text-xs">
                {profile.professionalLinks.linkedin && (
                  <a
                    href={profile.professionalLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.professionalLinks.github && (
                  <a
                    href={profile.professionalLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.professionalLinks.website && (
                  <a
                    href={profile.professionalLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    Faculty Webpage <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
