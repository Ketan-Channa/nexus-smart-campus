import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Edit3,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  ShieldCheck,
  Calendar,
  Award,
} from 'lucide-react';

interface AlumniProfileManagerProps {
  session: any;
}

export const AlumniProfileManager: React.FC<AlumniProfileManagerProps> = ({ session }) => {
  const alumniEmail = session?.email || '';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState(session?.name || '');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [degree, setDegree] = useState('B.Tech');
  const [graduationYear, setGraduationYear] = useState('2023');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  const [industry, setIndustry] = useState('Software & Technology');
  const [currentCity, setCurrentCity] = useState('New Delhi');
  const [currentCountry, setCurrentCountry] = useState('India');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [otherLinks, setOtherLinks] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [mentorshipAvailable, setMentorshipAvailable] = useState(true);
  const [mentorshipFormat, setMentorshipFormat] = useState('Virtual (Video Call)');
  const [preferredMentoringTopics, setPreferredMentoringTopics] = useState('');
  const [volunteeringInterests, setVolunteeringInterests] = useState('');
  const [guestLectureTopics, setGuestLectureTopics] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState('CAMPUS_ONLY');
  const [alumniId, setAlumniId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState('PENDING');

  // Experience and Achievements Lists
  const [experiences, setExperiences] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Add Experience Form Modal State
  const [showAddExp, setShowAddExp] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpDesignation, setNewExpDesignation] = useState('');
  const [newExpStartDate, setNewExpStartDate] = useState('');
  const [newExpEndDate, setNewExpEndDate] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Add Achievement Form Modal State
  const [showAddAch, setShowAddAch] = useState(false);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchCategory, setNewAchCategory] = useState('Award');
  const [newAchOrg, setNewAchOrg] = useState('');
  const [newAchDate, setNewAchDate] = useState('');
  const [newAchDesc, setNewAchDesc] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [alumniEmail]);

  const fetchProfile = async () => {
    if (!alumniEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/profile/${encodeURIComponent(alumniEmail)}`);
      const data = await res.json();
      if (data.status === 'success' && data.alumni) {
        const a = data.alumni;
        setFullName(a.full_name || session?.name || '');
        setMobile(a.mobile || '');
        setDepartment(a.department || 'Computer Science');
        setDegree(a.degree || 'B.Tech');
        setGraduationYear(a.graduation_year || '2023');
        setCurrentCompany(a.current_company || '');
        setCurrentDesignation(a.current_designation || '');
        setIndustry(a.industry || 'Software & Technology');
        setCurrentCity(a.current_city || 'New Delhi');
        setCurrentCountry(a.current_country || 'India');
        setSkills(typeof a.skills === 'string' ? a.skills : JSON.stringify(a.skills || ''));
        setBio(a.bio || '');
        setLinkedinUrl(a.linkedin_url || '');
        setGithubUrl(a.github_url || '');
        setOtherLinks(a.other_links || '');
        setPhotoUrl(a.photograph_url || null);
        setCoverPhotoUrl(a.cover_photo_url || null);
        setMentorshipAvailable(a.mentorship_available === 1);
        setMentorshipFormat(a.mentorship_format || 'Virtual (Video Call)');
        setPreferredMentoringTopics(a.preferred_mentoring_topics || '');
        setVolunteeringInterests(a.volunteering_interests || '');
        setGuestLectureTopics(a.guest_lecture_topics || '');
        setPrivacyLevel(a.privacy_level || 'CAMPUS_ONLY');
        setAlumniId(a.alumni_id || null);
        setVerificationStatus(a.verification_status || 'PENDING');
        setExperiences(a.experiences || []);
        setAchievements(a.achievements || []);
      }
    } catch (e: any) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: alumniEmail,
          fullName,
          mobile,
          department,
          degree,
          graduationYear,
          currentCompany,
          currentDesignation,
          industry,
          currentCity,
          currentCountry,
          skills,
          bio,
          linkedinUrl,
          githubUrl,
          otherLinks,
          photoUrl,
          coverPhotoUrl,
          mentorshipAvailable,
          mentorshipFormat,
          preferredMentoringTopics,
          volunteeringInterests,
          guestLectureTopics,
          privacyLevel,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniEmail,
          company: newExpCompany,
          designation: newExpDesignation,
          startDate: newExpStartDate,
          endDate: newExpEndDate || 'Present',
          isCurrent: !newExpEndDate,
          description: newExpDesc,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowAddExp(false);
        setNewExpCompany('');
        setNewExpDesignation('');
        setNewExpStartDate('');
        setNewExpEndDate('');
        setNewExpDesc('');
        fetchProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/experiences/${id}`, { method: 'DELETE' });
      fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexus-smart-campus-backend.onrender.com/api/alumni/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniEmail,
          title: newAchTitle,
          category: newAchCategory,
          organization: newAchOrg,
          achievementDate: newAchDate,
          description: newAchDesc,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowAddAch(false);
        setNewAchTitle('');
        setNewAchOrg('');
        setNewAchDate('');
        setNewAchDesc('');
        fetchProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAchievement = async (id: number) => {
    try {
      await fetch(`https://nexus-smart-campus-backend.onrender.com/api/alumni/achievements/${id}`, { method: 'DELETE' });
      fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Alumni profile changes saved directly to MySQL database and synchronized across Student & Faculty directories!</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-44 bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-800 relative">
          {coverPhotoUrl && (
            <img src={coverPhotoUrl} alt="Cover" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
              {verificationStatus} ALUMNI
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="p-6 sm:p-8 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-indigo-600 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  fullName.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                  {fullName}
                </h2>
                {verificationStatus === 'VERIFIED' && (
                  <span title="Verified Alumni"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /></span>
                )}
              </div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-purple-400">
                {currentDesignation ? `${currentDesignation} at ${currentCompany}` : 'Professional details not set'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Class of {graduationYear} • {degree} in {department} {alumniId ? `• ID: ${alumniId}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile to Database'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SECTION 1: PROFESSIONAL & ACADEMIC INFO */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            Professional & Academic Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Mobile
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Graduation Year
              </label>
              <input
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Company / Organization
              </label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g. Google, Microsoft, Startup"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Designation / Title
              </label>
              <input
                type="text"
                value={currentDesignation}
                onChange={(e) => setCurrentDesignation(e.target.value)}
                placeholder="e.g. Senior Software Architect"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Industry Domain
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Software & Technology">Software & Technology</option>
                <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Financial Technology (FinTech)">Financial Technology (FinTech)</option>
                <option value="Consulting & Strategy">Consulting & Strategy</option>
                <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                <option value="Automotive & Robotics">Automotive & Robotics</option>
                <option value="Other Industry">Other Industry</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current City
              </label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Country
              </label>
              <input
                type="text"
                value={currentCountry}
                onChange={(e) => setCurrentCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Degree & Department
              </label>
              <input
                type="text"
                value={`${degree} in ${department}`}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Skills & Technical Expertise (Comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React.js, Python, System Design, Kubernetes, AWS, Data Structures"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Professional Biography
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your career journey, achievements, and message to student mentees..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: LINKS & MENTORSHIP AVAILABILITY */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-500" />
            Social Profiles & Campus Engagement Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                GitHub / Portfolio URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Profile Visibility
              </label>
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="CAMPUS_ONLY">Campus Only (Students & Faculty)</option>
                <option value="PUBLIC">Public (All verified users)</option>
                <option value="CONNECTIONS_ONLY">Connections Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mentorship Availability
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="mentorshipAvailable"
                  checked={mentorshipAvailable}
                  onChange={(e) => setMentorshipAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="mentorshipAvailable" className="font-semibold text-slate-800 dark:text-slate-200">
                  Open to Mentoring Students
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Mentoring Format
              </label>
              <select
                value={mentorshipFormat}
                onChange={(e) => setMentorshipFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Virtual (Video Call)">Virtual (Video Call / Google Meet)</option>
                <option value="In-Person Campus Sessions">In-Person Campus Sessions</option>
                <option value="Async Messaging & Code Review">Async Messaging & Code Review</option>
                <option value="Flexible (Hybrid)">Flexible (Hybrid)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Mentoring Topics
              </label>
              <input
                type="text"
                value={preferredMentoringTopics}
                onChange={(e) => setPreferredMentoringTopics(e.target.value)}
                placeholder="e.g. System Design, Resume Review, LeetCode"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Guest Lecture & Webinar Topics of Interest
              </label>
              <input
                type="text"
                value={guestLectureTopics}
                onChange={(e) => setGuestLectureTopics(e.target.value)}
                placeholder="e.g. Cloud Native Microservices, Transitioning to FAANG, Generative AI in Production"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Volunteering Interests
              </label>
              <input
                type="text"
                value={volunteeringInterests}
                onChange={(e) => setVolunteeringInterests(e.target.value)}
                placeholder="e.g. Hackathon Judge, Mock Interviews"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* SECTION 3: WORK EXPERIENCES */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            Work Experiences Timeline
          </h3>
          <button
            onClick={() => setShowAddExp(!showAddExp)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        {/* Add Experience Modal/Inline Form */}
        {showAddExp && (
          <form onSubmit={handleAddExperience} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add New Work Experience</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Company Name"
                value={newExpCompany}
                onChange={(e) => setNewExpCompany(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                required
              />
              <input
                type="text"
                placeholder="Designation / Role"
                value={newExpDesignation}
                onChange={(e) => setNewExpDesignation(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                required
              />
              <input
                type="text"
                placeholder="Start Date (e.g. Jan 2022)"
                value={newExpStartDate}
                onChange={(e) => setNewExpStartDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                required
              />
              <input
                type="text"
                placeholder="End Date (or leave empty for Present)"
                value={newExpEndDate}
                onChange={(e) => setNewExpEndDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <textarea
                placeholder="Responsibilities, achievements, technologies used..."
                value={newExpDesc}
                onChange={(e) => setNewExpDesc(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddExp(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Save Experience
              </button>
            </div>
          </form>
        )}

        {/* Experience List */}
        {experiences.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No work experiences listed yet. Add your current and past roles.</p>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {exp.designation} at {exp.company}
                    </h4>
                    {exp.is_current === 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        Current Role
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">{exp.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: ACHIEVEMENTS & AWARDS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Achievements, Awards & Certifications
          </h3>
          <button
            onClick={() => setShowAddAch(!showAddAch)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Achievement</span>
          </button>
        </div>

        {/* Add Achievement Form Modal */}
        {showAddAch && (
          <form onSubmit={handleAddAchievement} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add New Achievement / Honor</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Title / Honor Name"
                value={newAchTitle}
                onChange={(e) => setNewAchTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                required
              />
              <select
                value={newAchCategory}
                onChange={(e) => setNewAchCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="Award">Industry Award</option>
                <option value="Certification">Professional Certification</option>
                <option value="Publication">Research Publication</option>
                <option value="Patent">Patent / Intellectual Property</option>
                <option value="Honor">Campus Honor / Recognition</option>
              </select>
              <input
                type="text"
                placeholder="Issuing Organization"
                value={newAchOrg}
                onChange={(e) => setNewAchOrg(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                placeholder="Date / Year Awarded"
                value={newAchDate}
                onChange={(e) => setNewAchDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
              <textarea
                placeholder="Details, impact, or verification link..."
                value={newAchDesc}
                onChange={(e) => setNewAchDesc(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddAch(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Save Achievement
              </button>
            </div>
          </form>
        )}

        {/* Achievements List */}
        {achievements.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No achievements or awards added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      {ach.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{ach.achievement_date}</span>
                  </div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {ach.title}
                  </h4>
                  {ach.organization && (
                    <p className="text-[11px] text-slate-500">{ach.organization}</p>
                  )}
                  {ach.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">{ach.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAchievement(ach.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
