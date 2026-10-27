import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import jsPDF from 'jspdf';
import { type UserRole, SECURITY_QUESTIONS_LIST } from '../../types/auth';
import {
  X,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Lock,
  Download,
  GraduationCap,
  Eye,
  EyeOff,
  Briefcase,
  Award,
  Globe,
  Plus,
  Users,
  FileCheck,
  Bus,
  Home,
  UserCheck,
  CreditCard,
  Sparkles
} from 'lucide-react';

interface RegistrationModalProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSuccessRegister: () => void;
}

const GOVT_ID_TYPES = [
  'Aadhaar Card',
  'Passport',
  'Driving Licence',
  'Voter Card',
  '10th / 12th Certificate',
  'PAN Card',
  'Other Official ID',
];

const ADMIN_DEPARTMENTS = [
  'Central Administration',
  'Academic Affairs & Deanship',
  'Student Safety & Welfare Cell',
  'IT Infrastructure & Systems',
  'Finance & Accounts Office',
  'Examination & Evaluation Cell',
  'Registrar & General Council',
];

const ADMIN_ACCESS_LEVELS = [
  'Super Admin',
  'Academic Admin',
  'Safety Authority',
  'Finance Admin',
  'Standard Admin',
];

const INDUSTRY_OPTIONS = [
  'Information Technology & Software',
  'FinTech & Banking',
  'Healthcare & Pharmaceuticals',
  'Consulting & Business Advisory',
  'Manufacturing & Core Engineering',
  'Data Science & Artificial Intelligence',
  'Higher Education & Research',
  'Government & Civil Services',
  'Entrepreneurship & Startups',
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  role,
  isOpen,
  onClose,
  onSuccessRegister,
}) => {
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [alumniDocPreview, setAlumniDocPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File Previews for Student Verification Docs
  const [govtIdPhotoPreview, setGovtIdPhotoPreview] = useState<string | null>(null);
  const [collegeDocPreview, setCollegeDocPreview] = useState<string | null>(null);
  const [fatherPhotoPreview, setFatherPhotoPreview] = useState<string | null>(null);
  const [fatherGovtIdPhotoPreview, setFatherGovtIdPhotoPreview] = useState<string | null>(null);
  const [motherPhotoPreview, setMotherPhotoPreview] = useState<string | null>(null);
  const [motherGovtIdPhotoPreview, setMotherGovtIdPhotoPreview] = useState<string | null>(null);
  const [hostelDocPreview, setHostelDocPreview] = useState<string | null>(null);
  const [hostelCardPreview, setHostelCardPreview] = useState<string | null>(null);

  // Dynamic Technical Skills Manager State
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(['C++', 'Data Structures', 'Web Development']);

  // Form State
  const [form, setForm] = useState({
    // Student Core Demographics & Identity
    fullName: '',
    admissionNumber: '',
    rollNumber: '',
    collegeName: 'NEXUS Institute of Technology',
    degreeClass: 'B.TECH',
    joiningYear: '2023',
    endingYear: '2027',
    studyYear: '2ND',
    semester: 'Semester 3',
    department: 'CSE',
    section: 'A',
    dob: '',
    bloodGroup: 'O+',
    gender: 'Male',
    email: '',
    mobile: '',
    address: '',

    // Student Government & Official College Docs
    govtIdType: 'Aadhaar Card',
    govtIdNumber: '',

    // Father Details
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherGovtIdType: 'PAN Card',
    fatherGovtIdNumber: '',

    // Mother Details
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    motherGovtIdType: 'Aadhaar Card',
    motherGovtIdNumber: '',

    // Parent Contact & Emergency
    parentContact: '',
    parentOccupation: '',
    admissionDate: '',

    // Hobbies, Interests & Skills
    hobbies: 'Coding, Cricket, Music',
    interests: 'Artificial Intelligence, Cybersecurity',

    // Conveyance & Parking
    conveyanceMode: 'Self',
    busRoute: 'Route 4 (Central Campus via Civil Lines)',
    busCharges: '12000',
    busPaymentStatus: 'Unpaid',
    vehicleType: '2-Wheeler',
    parkingPaymentTerm: 'Semester-wise',
    parkingFee: '500',
    parkingPaymentStatus: 'Unpaid',

    // Residence & Hostel Options
    residenceType: 'Day Scholar',
    hostelName: 'NEXUS Boys Hostel Block A',
    roomNumber: 'B-304',
    hostelPaymentTerm: 'Semester-wise',
    hostelFee: '35000',
    hostelPaymentStatus: 'Unpaid',

    // Faculty specific
    employeeId: '',
    designation: 'Assistant Professor',
    joiningDate: '',
    subjectsTaught: '',
    isClassIncharge: 'No',
    inchargeClass: 'BTECH CSE 4A',

    // Parent specific
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    occupation: '',
    studentName: '',
    studentRollNumber: '',
    relationship: 'Father',

    // Alumni specific
    username: '',
    graduationYear: '2023',
    batch: '2019 - 2023',
    currentCompany: '',
    currentDesignation: '',
    industry: 'Information Technology & Software',
    currentCity: 'Bengaluru',
    currentCountry: 'India',
    bio: 'Passionate software engineer and proud NEXUS alumnus eager to mentor students.',
    linkedIn: '',
    githubUrl: '',
    otherLinks: '',
    mentorshipAvailable: 'Yes',
    jobProvider: 'Yes',
    privacyLevel: 'CAMPUS_ONLY',

    // Admin specific (Standalone Administrative Body)
    accessLevel: 'Super Admin',

    // Security & Account
    password: '',
    confirmPassword: '',
    q1: SECURITY_QUESTIONS_LIST[0],
    a1: '',
    q2: SECURITY_QUESTIONS_LIST[1],
    a2: '',
    q3: SECURITY_QUESTIONS_LIST[2],
    a3: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'rollNumber') {
      const numericVal = value.replace(/[^0-9]/g, '');
      setForm({ ...form, rollNumber: numericVal });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawResult = reader.result as string;
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.src = rawResult;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
            canvas.height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setter(compressed);
          };
        } else {
          setter(rawResult);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      const payload: any = {
        role,
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        address: form.address,
        collegeName: form.collegeName,
        password: form.password,
        q1: form.q1,
        a1: form.a1,
        q2: form.q2,
        a2: form.a2,
        q3: form.q3,
        a3: form.a3,
        photoUrl: photoPreview,
      };

      if (role === 'Student') {
        Object.assign(payload, {
          admissionNumber: form.admissionNumber,
          rollNumber: form.rollNumber,
          degreeClass: form.degreeClass,
          joiningYear: form.joiningYear,
          endingYear: form.endingYear,
          studyYear: form.studyYear,
          semester: form.semester,
          department: form.department,
          section: form.section,
          dob: form.dob,
          bloodGroup: form.bloodGroup,
          gender: form.gender,
          govtIdType: form.govtIdType,
          govtIdNumber: form.govtIdNumber,
          govtIdPhotoUrl: govtIdPhotoPreview,
          collegeDocUrl: collegeDocPreview,
          fatherName: form.fatherName,
          fatherPhone: form.fatherPhone,
          fatherEmail: form.fatherEmail,
          fatherPhotoUrl: fatherPhotoPreview,
          fatherGovtIdType: form.fatherGovtIdType,
          fatherGovtIdNumber: form.fatherGovtIdNumber,
          fatherGovtIdPhotoUrl: fatherGovtIdPhotoPreview,
          motherName: form.motherName,
          motherPhone: form.motherPhone,
          motherEmail: form.motherEmail,
          motherPhotoUrl: motherPhotoPreview,
          motherGovtIdType: form.motherGovtIdType,
          motherGovtIdNumber: form.motherGovtIdNumber,
          motherGovtIdPhotoUrl: motherGovtIdPhotoPreview,
          parentContact: form.parentContact || form.fatherPhone,
          parentOccupation: form.parentOccupation,
          admissionDate: form.admissionDate,
          hobbies: form.hobbies,
          interests: form.interests,
          skills: skillsList,
          conveyanceMode: form.conveyanceMode,
          busRoute: form.busRoute,
          busCharges: form.busCharges,
          busPaymentStatus: form.busPaymentStatus,
          vehicleType: form.vehicleType,
          parkingPaymentTerm: form.parkingPaymentTerm,
          parkingFee: form.parkingFee,
          parkingPaymentStatus: form.parkingPaymentStatus,
          residenceType: form.residenceType,
          hostelName: form.hostelName,
          roomNumber: form.roomNumber,
          hostelPaymentTerm: form.hostelPaymentTerm,
          hostelFee: form.hostelFee,
          hostelPaymentStatus: form.hostelPaymentStatus,
          hostelDocUrl: hostelDocPreview,
          hostelCardUrl: hostelCardPreview,
        });
      } else if (role === 'Faculty') {
        const computedInchargeClass = (form.isClassIncharge === 'Yes' || form.isClassIncharge === '1')
          ? `${(form.degreeClass || 'B.TECH').trim()} ${(form.department || 'CSE').trim()} ${(form.joiningYear || '2023').trim()} ${(form.section || 'A').trim()}`
          : null;

        Object.assign(payload, {
          employeeId: form.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
          department: form.department,
          designation: form.designation,
          joiningDate: form.joiningDate,
          subjectsTaught: form.subjectsTaught,
          isClassIncharge: form.isClassIncharge,
          inchargeClass: computedInchargeClass || form.inchargeClass,
          degreeClass: form.degreeClass,
          joiningYear: form.joiningYear,
          section: form.section,
        });
      } else if (role === 'Parent') {
        Object.assign(payload, {
          parentName: form.fullName,
          studentName: form.studentName,
          studentRollNumber: form.studentRollNumber,
          relationship: form.relationship,
          occupation: form.parentOccupation,
        });
      } else if (role === 'Alumni') {
        Object.assign(payload, {
          username: form.username || (form.email ? form.email.split('@')[0] : `alumni_${Date.now()}`),
          graduationYear: form.graduationYear,
          batch: form.batch || `${form.degreeClass} ${form.graduationYear}`,
          degreeClass: form.degreeClass,
          department: form.department,
          section: form.section,
          studentRegistrationNumber: form.rollNumber || form.admissionNumber,
          currentCompany: form.currentCompany,
          currentDesignation: form.currentDesignation,
          industry: form.industry,
          currentCity: form.currentCity,
          currentCountry: form.currentCountry,
          bio: form.bio,
          skills: skillsList,
          linkedIn: form.linkedIn,
          githubUrl: form.githubUrl,
          otherLinks: form.otherLinks,
          coverPhotoUrl: coverPhotoPreview,
          alumniDocUrl: alumniDocPreview,
          mentorshipAvailable: form.mentorshipAvailable === 'Yes',
          jobProvider: form.jobProvider === 'Yes',
          privacyLevel: form.privacyLevel,
        });
      } else if (role === 'Administrator') {
        Object.assign(payload, {
          department: form.department || 'Central Administration',
          accessLevel: form.accessLevel || 'Super Admin',
          designation: form.designation || 'System Administrator',
        });
      }

      await axios.post('http://localhost:5000/api/auth/register', payload);
      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed. Please check network/database server.');
    }
  };

  const downloadFullFormPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`NEXUS CAMPUS - OFFICIAL ${role.toUpperCase()} RECORD`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    let y = 50;
    doc.text(`Name: ${form.fullName}`, 14, y);
    doc.text(`Role: ${role}`, 120, y);
    y += 10;
    doc.text(`Email: ${form.email}`, 14, y);
    doc.text(`Mobile: ${form.mobile}`, 120, y);
    y += 10;
    doc.text(`Department: ${form.department}`, 14, y);
    doc.text(`College: ${form.collegeName}`, 120, y);
    y += 10;

    if (role === 'Student') {
      doc.text(`Roll Number: ${form.rollNumber}`, 14, y);
      doc.text(`Class: ${form.degreeClass} ${form.department} ${form.section}`, 120, y);
      y += 10;
      doc.text(`Father Name: ${form.fatherName}`, 14, y);
      doc.text(`Mother Name: ${form.motherName}`, 120, y);
      y += 10;
    }

    doc.save(`NEXUS_${role}_${form.fullName.replace(/\s+/g, '_')}_Registration.pdf`);
  };

  const getStepTitle = () => {
    if (role === 'Student') {
      switch (step) {
        case 1: return 'Personal Demographics & Passport Photo';
        case 2: return 'Academic Course & College Enrollment';
        case 3: return 'Government ID & College Verification';
        case 4: return 'Parents Information & Document Uploads';
        case 5: return 'Conveyance, Parking & Hostel Residence';
        case 6: return 'Security Password & Recovery Questions';
        default: return 'Student Profile Setup';
      }
    }
    if (role === 'Faculty') {
      switch (step) {
        case 1: return 'Faculty Profile & Passport Photograph';
        case 2: return 'Academic Department & Class Incharge Assignment';
        case 3: return 'Security Password & Recovery Questions';
        default: return 'Faculty Profile Setup';
      }
    }
    if (role === 'Alumni') {
      switch (step) {
        case 1: return 'Graduated Academic Record & Photos';
        case 2: return 'Career & Professional Status';
        case 3: return 'Mentorship & Verification Document';
        case 4: return 'Security Password & Recovery Questions';
        default: return 'Alumni Profile Setup';
      }
    }
    return step === 1 ? 'Official Profile Information' : 'Security & Password Credentials';
  };

  const totalSteps = role === 'Student' ? 6 : role === 'Alumni' ? 4 : role === 'Faculty' ? 3 : 2;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
        >
          {/* HEADER WITH PROGRESS STEPPER */}
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md">
                  {role === 'Student' ? <GraduationCap className="w-5 h-5" /> : role === 'Alumni' ? <Award className="w-5 h-5" /> : role === 'Administrator' ? <ShieldCheck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    {role === 'Student' ? 'Student Registration Studio' : `${role} Registration`}
                  </h3>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                    Step {step} of {totalSteps}: {getStepTitle()}
                  </p>
                </div>
              </div>

              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Step Indicator Progress Bar */}
            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    idx + 1 <= step ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-black">Registration Completed Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Official {role} account for <span className="font-bold text-slate-900 dark:text-white">{form.fullName}</span> has been authenticated and registered in MySQL single source of truth database.
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={downloadFullFormPDF}
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" /> Download Official Record PDF
                </button>
                <button
                  onClick={() => { onSuccessRegister(); onClose(); }}
                  className="px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 font-bold text-xs"
                >
                  Proceed to Login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

              {/* ========================================================================= */}
              {/* STUDENT REGISTRATION FORM (FULL 6-STEP COMPREHENSIVE STUDIO) */}
              {/* ========================================================================= */}
              {role === 'Student' && (
                <>
                  {/* STEP 1: PERSONAL DEMOGRAPHICS & PASSPORT PHOTO */}
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      {/* Photo Upload Section */}
                      <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-purple-600 shadow-md shrink-0">
                          {photoPreview ? <img src={photoPreview} alt="Student Passport" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-slate-400" />}
                        </div>
                        <div>
                          <label className="block text-xs font-black text-purple-600 dark:text-purple-400 mb-1 cursor-pointer hover:underline">
                            Upload Student Passport Photograph *
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoPreview)} className="hidden" />
                          </label>
                          <p className="text-[11px] text-slate-400">Official passport photo for Student Smart ID Card</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          <UserCheck className="w-4 h-4 text-purple-500" /> Student Identity & Contact Info
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Student Name *</label>
                            <input type="text" name="fullName" required placeholder="Full Name as per records" value={form.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Admission Number</label>
                            <input type="text" name="admissionNumber" placeholder="e.g. ADM-2023-0891" value={form.admissionNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">University Roll Number *</label>
                            <input type="text" name="rollNumber" required placeholder="e.g. 2301019" value={form.rollNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Student Email *</label>
                            <input type="email" name="email" required placeholder="student@nexus.edu" value={form.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number *</label>
                            <input type="text" name="mobile" required placeholder="+91 98765 43210" value={form.mobile} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
                            <input type="date" name="dob" required value={form.dob} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                            <select name="gender" value={form.gender} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group *</label>
                            <select name="bloodGroup" value={form.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Permanent Residential Address *</label>
                            <textarea name="address" rows={2} required placeholder="Full house address with pincode..." value={form.address} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-1.5 shadow-md">
                          <span>Next: Academic Program & College Record</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: ACADEMIC PROGRAM & ENROLLMENT RECORD */}
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider">
                          <GraduationCap className="w-4 h-4 text-indigo-500" /> College & Academic Enrollment
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">College / Campus Name *</label>
                            <input type="text" name="collegeName" required value={form.collegeName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Degree Program *</label>
                            <select name="degreeClass" value={form.degreeClass} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {['B.TECH', 'BCA', 'M.TECH', 'MBA', 'MCA', 'BBA', 'B.SC'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Department *</label>
                            <select name="department" value={form.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {['CSE', 'ECE', 'ME', 'CE', 'IT', 'MGMT'].map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Section *</label>
                            <input type="text" name="section" required placeholder="A, B, C or D" value={form.section} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold uppercase" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Study Year *</label>
                            <select name="studyYear" value={form.studyYear} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {['1ST', '2ND', '3RD', '4TH'].map(y => <option key={y} value={y}>{y} Year</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Semester *</label>
                            <select name="semester" value={form.semester} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Admission Date</label>
                            <input type="date" name="admissionDate" value={form.admissionDate} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Joining Year *</label>
                              <input type="text" name="joiningYear" required placeholder="2023" value={form.joiningYear} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expected Ending Year *</label>
                              <input type="text" name="endingYear" required placeholder="2027" value={form.endingYear} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Technical Skills Manager */}
                      <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" /> Technical Skills & Expertise Tags
                          </label>
                          <span className="text-[10px] font-mono text-purple-600 font-bold">{skillsList.length} Skills Added</span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a technical skill (e.g. React, Python, C++, DSA)..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                          />
                          <button type="button" onClick={handleAddSkill} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {skillsList.map((skill) => (
                            <span key={skill} className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center gap-1 border border-purple-500/30">
                              {skill}
                              <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-500 font-bold ml-1">✕</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(3)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1.5 shadow-md">
                          <span>Next: Government ID & College Documents</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: GOVERNMENT ID & COLLEGE VERIFICATION DOCUMENTS */}
                  {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider">
                          <CreditCard className="w-4 h-4 text-indigo-500" /> Student Identity & Official Government ID
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Government ID Document Type *</label>
                            <select name="govtIdType" value={form.govtIdType} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {GOVT_ID_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Government ID Number *</label>
                            <input type="text" name="govtIdNumber" required placeholder="e.g. 1234 5678 9012" value={form.govtIdNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* File Uploads Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                          <label className="block font-bold text-slate-900 dark:text-white">Upload Student Govt ID Card Photo</label>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setGovtIdPhotoPreview)} className="w-full text-xs" />
                          {govtIdPhotoPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Government ID Uploaded</span>}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                          <label className="block font-bold text-slate-900 dark:text-white">Upload College Marksheet / Admission Doc</label>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setCollegeDocPreview)} className="w-full text-xs" />
                          {collegeDocPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ College Document Uploaded</span>}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <button type="button" onClick={() => setStep(2)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(4)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1.5 shadow-md">
                          <span>Next: Parents Information & Photo Uploads</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: FATHER & MOTHER DETAILS & PHOTO UPLOADS */}
                  {step === 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      {/* Father Section */}
                      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-blue-950 dark:text-blue-300 text-xs uppercase tracking-wider">
                          <Users className="w-4 h-4 text-blue-500" /> Father's Details & Identification
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father's Full Name *</label>
                            <input type="text" name="fatherName" required placeholder="Father's Full Name" value={form.fatherName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father's Phone Number *</label>
                            <input type="text" name="fatherPhone" required placeholder="+91 98765 43210" value={form.fatherPhone} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father's Email Address</label>
                            <input type="email" name="fatherEmail" placeholder="father@gmail.com" value={form.fatherEmail} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father's Govt ID Number</label>
                            <input type="text" name="fatherGovtIdNumber" placeholder="PAN / Aadhaar Number" value={form.fatherGovtIdNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                            <label className="block font-bold text-slate-700 dark:text-slate-300">Father Passport Photo Upload</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setFatherPhotoPreview)} className="w-full text-[11px]" />
                            {fatherPhotoPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Father Photo Uploaded</span>}
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                            <label className="block font-bold text-slate-700 dark:text-slate-300">Father Govt ID Photo Upload</label>
                            <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setFatherGovtIdPhotoPreview)} className="w-full text-[11px]" />
                            {fatherGovtIdPhotoPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Father Govt ID Uploaded</span>}
                          </div>
                        </div>
                      </div>

                      {/* Mother Section */}
                      <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-rose-950 dark:text-rose-300 text-xs uppercase tracking-wider">
                          <Users className="w-4 h-4 text-rose-500" /> Mother's Details & Identification
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mother's Full Name *</label>
                            <input type="text" name="motherName" required placeholder="Mother's Full Name" value={form.motherName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mother's Phone Number</label>
                            <input type="text" name="motherPhone" placeholder="+91 98765 43210" value={form.motherPhone} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                            <label className="block font-bold text-slate-700 dark:text-slate-300">Mother Passport Photo Upload</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setMotherPhotoPreview)} className="w-full text-[11px]" />
                            {motherPhotoPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Mother Photo Uploaded</span>}
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                            <label className="block font-bold text-slate-700 dark:text-slate-300">Mother Govt ID Photo Upload</label>
                            <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setMotherGovtIdPhotoPreview)} className="w-full text-[11px]" />
                            {motherGovtIdPhotoPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Mother Govt ID Uploaded</span>}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <button type="button" onClick={() => setStep(3)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(5)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1.5 shadow-md">
                          <span>Next: Conveyance & Hostel Residence</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5: CONVEYANCE, PARKING & HOSTEL RESIDENCE */}
                  {step === 5 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      {/* Conveyance Section */}
                      <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-300 text-xs uppercase tracking-wider">
                          <Bus className="w-4 h-4 text-amber-500" /> Conveyance, Transport & Vehicle Parking
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Conveyance Mode *</label>
                            <select name="conveyanceMode" value={form.conveyanceMode} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              <option value="Self">Self Vehicle</option>
                              <option value="College Bus">College Bus Service</option>
                              <option value="Public Transport">Public Transport</option>
                            </select>
                          </div>

                          {form.conveyanceMode === 'College Bus' && (
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">College Bus Route</label>
                              <input type="text" name="busRoute" placeholder="Route 4 (Civil Lines)" value={form.busRoute} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                            </div>
                          )}

                          {form.conveyanceMode === 'Self' && (
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle Type</label>
                              <select name="vehicleType" value={form.vehicleType} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                                <option value="2-Wheeler">2-Wheeler (Bike/Scooter)</option>
                                <option value="4-Wheeler">4-Wheeler (Car)</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hostel Section */}
                      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-300 text-xs uppercase tracking-wider">
                          <Home className="w-4 h-4 text-emerald-500" /> Accommodation & Hostel Details
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Residence Type *</label>
                            <select name="residenceType" value={form.residenceType} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              <option value="Day Scholar">Day Scholar</option>
                              <option value="Hosteller">Campus Hosteller</option>
                              <option value="PG / Rented">PG / Rented Accommodation</option>
                            </select>
                          </div>

                          {form.residenceType === 'Hosteller' && (
                            <>
                              <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hostel Block Name</label>
                                <input type="text" name="hostelName" placeholder="Boys Hostel Block A" value={form.hostelName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
                                <input type="text" name="roomNumber" placeholder="B-304" value={form.roomNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                              </div>
                              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">Upload Hostel Document</label>
                                <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setHostelDocPreview)} className="w-full text-[11px]" />
                                {hostelDocPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Hostel Doc Uploaded</span>}
                              </div>
                              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border space-y-1">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">Upload Hostel Card Photo</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setHostelCardPreview)} className="w-full text-[11px]" />
                                {hostelCardPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Hostel Card Uploaded</span>}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <button type="button" onClick={() => setStep(4)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(6)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1.5 shadow-md">
                          <span>Next: Security Password & Recovery Questions</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* ========================================================================= */}
              {/* ALUMNI REGISTRATION FORM (FULL 4-STEP RICH EXPERIENCE) */}
              {/* ========================================================================= */}
              {role === 'Alumni' && (
                <>
                  {/* STEP 1: ALUMNI ACADEMIC RECORD & DEMOGRAPHICS */}
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      {/* Photo & Cover Upload Banner */}
                      <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300 text-xs uppercase tracking-wider">
                          <Award className="w-4 h-4 text-purple-500" /> Alumni Profile Photos & Banner
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-purple-500 shadow-md shrink-0">
                              {photoPreview ? <img src={photoPreview} alt="Alumni Photo" className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
                                Upload Passport Photo *
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoPreview)} className="hidden" />
                              </label>
                              <p className="text-[10px] text-slate-400">Headshot photo for alumni ID card</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-24 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-purple-300 shadow-md shrink-0">
                              {coverPhotoPreview ? <img src={coverPhotoPreview} alt="Cover Banner" className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
                                Upload Cover Banner Photo
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setCoverPhotoPreview)} className="hidden" />
                              </label>
                              <p className="text-[10px] text-slate-400">Profile cover image</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Academic & Identity Details */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          <GraduationCap className="w-4 h-4 text-purple-500" /> Graduated Academic Record
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                            <input type="text" name="fullName" required placeholder="Full Official Name" value={form.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">Alumni Network Username *</label>
                            <input type="text" name="username" placeholder="e.g. john_alumni_2023" value={form.username} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                            <input type="email" name="email" required placeholder="alumni@nexus.edu" value={form.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number *</label>
                            <input type="text" name="mobile" required placeholder="+91 98765 43210" value={form.mobile} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">College / Campus Studied *</label>
                            <input type="text" name="collegeName" required value={form.collegeName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Roll / Reg. Number</label>
                            <input type="text" name="rollNumber" placeholder="e.g. 2301019" value={form.rollNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Degree Program Completed *</label>
                            <input type="text" name="degreeClass" required placeholder="e.g. B.Tech or MBA" value={form.degreeClass} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold uppercase" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department Completed *</label>
                            <input type="text" name="department" required placeholder="e.g. CSE or ECE" value={form.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold uppercase" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Graduation Year *</label>
                              <input type="text" name="graduationYear" required placeholder="2023" value={form.graduationYear} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batch (e.g. 2019 - 2023)</label>
                              <input type="text" name="batch" placeholder="2019 - 2023" value={form.batch} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-1.5 shadow-md"
                        >
                          <span>Continue to Career & Professional Status</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: ALUMNI CAREER, SKILLS & PROFESSIONAL DETAILS */}
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider">
                          <Briefcase className="w-4 h-4 text-indigo-500" /> Current Professional & Employment Status
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Company / Organization *</label>
                            <input type="text" name="currentCompany" required placeholder="e.g. Google, Microsoft, TCS, Startup" value={form.currentCompany} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Job Title / Designation *</label>
                            <input type="text" name="currentDesignation" required placeholder="e.g. Senior Software Engineer" value={form.currentDesignation} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Industry Sector</label>
                            <select name="industry" value={form.industry} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {INDUSTRY_OPTIONS.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current City</label>
                              <input type="text" name="currentCity" placeholder="Bengaluru" value={form.currentCity} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Country</label>
                              <input type="text" name="currentCountry" placeholder="India" value={form.currentCountry} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Professional Bio & Career Summary</label>
                            <textarea name="bio" rows={3} placeholder="Brief description of your professional journey, achievements, and technical expertise..." value={form.bio} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium" />
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Skills Manager for Alumni */}
                      <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-500" /> Professional Skills & Expertise Tags
                          </label>
                          <span className="text-[10px] font-mono text-purple-600 font-bold">{skillsList.length} Skills Added</span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a skill (e.g. System Design, AI, Python)..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Skill
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {skillsList.map((skill) => (
                            <span key={skill} className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center gap-1 border border-purple-500/30">
                              {skill}
                              <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-500 font-bold ml-1">✕</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Social & Professional Links */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          <Globe className="w-4 h-4 text-purple-500" /> Professional Links & Networks
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile URL</label>
                            <input type="text" name="linkedIn" placeholder="https://linkedin.com/in/username" value={form.linkedIn} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Profile URL</label>
                            <input type="text" name="githubUrl" placeholder="https://github.com/username" value={form.githubUrl} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(3)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1.5 shadow-md">
                          Continue to Campus Mentorship & Document Verification <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: ALUMNI MENTORSHIP PREFERENCES & DEGREE VERIFICATION DOCUMENT */}
                  {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      {/* Mentorship & Hiring Toggles */}
                      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/80 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-300 text-xs uppercase tracking-wider">
                          <Users className="w-4 h-4 text-amber-500" /> Campus Student Engagement & Hiring Preferences
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 space-y-2">
                            <label className="block font-bold text-slate-900 dark:text-white text-xs">Available for Student Career Mentorship?</label>
                            <select name="mentorshipAvailable" value={form.mentorshipAvailable} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold">
                              <option value="Yes">Yes - Open to Mentoring Students</option>
                              <option value="No">No - Not Available Right Now</option>
                            </select>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 space-y-2">
                            <label className="block font-bold text-slate-900 dark:text-white text-xs">Available to Post Jobs & Offer Referrals?</label>
                            <select name="jobProvider" value={form.jobProvider} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold">
                              <option value="Yes">Yes - Open to Posting Referrals / Hiring</option>
                              <option value="No">No - Not Hiring Currently</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Network Profile Visibility Level</label>
                          <select name="privacyLevel" value={form.privacyLevel} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                            <option value="CAMPUS_ONLY">Campus Only (Students & Faculty of NEXUS)</option>
                            <option value="PUBLIC">Public Network (All Campus & Alumni Users)</option>
                            <option value="CONNECTIONS_ONLY">Connections Only</option>
                          </select>
                        </div>
                      </div>

                      {/* Degree Verification Document Upload */}
                      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-300/80 dark:border-rose-800/80 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-rose-950 dark:text-rose-300 text-xs uppercase tracking-wider">
                          <FileCheck className="w-4 h-4 text-rose-500" /> Alumni Verification Document (Mandatory for Admin Approval)
                        </div>

                        <div className="space-y-2">
                          <label className="block font-bold text-slate-700 dark:text-slate-300">
                            Upload Degree Certificate / Official Marksheet / Alumni ID Card
                          </label>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setAlumniDocPreview)} className="w-full text-xs" />
                          <p className="text-[10px] text-slate-500">
                            Uploading your degree certificate allows NEXUS Administrators to instantly verify your alumni status and grant full verified access.
                          </p>
                          {alumniDocPreview && <span className="text-[10px] font-bold text-emerald-500 block">✓ Verification Document Uploaded</span>}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <button type="button" onClick={() => setStep(2)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(4)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1.5 shadow-md">
                          Continue to Password & Security Credentials <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* ========================================================================= */}
              {/* ADMINISTRATOR REGISTRATION FORM (SPECIALIZED STANDALONE BODY FORM) */}
              {/* ========================================================================= */}
              {role === 'Administrator' && step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" /> Administrative Authority Details
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Full Name *</label>
                        <input type="text" name="fullName" required placeholder="e.g. Dr. SMB or Admin Officer" value={form.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Admin Email Address *</label>
                        <input type="email" name="email" required placeholder="admin@nexus.edu" value={form.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number *</label>
                        <input type="text" name="mobile" required placeholder="+91 98765 43210" value={form.mobile} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campus / Institution Name</label>
                        <input type="text" name="collegeName" required value={form.collegeName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                      </div>

                      <div>
                        <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Administrative Cell / Department *</label>
                        <select name="department" value={form.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                          {ADMIN_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Access Level & Privilege Scope *</label>
                        <select name="accessLevel" value={form.accessLevel} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                          {ADMIN_ACCESS_LEVELS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Designation Title</label>
                        <input type="text" name="designation" placeholder="e.g. System Administrator / Academic Dean" value={form.designation} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Office Room / Location Address</label>
                        <input type="text" name="address" placeholder="e.g. Main Admin Block, Room 101" value={form.address} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-indigo-500 shadow-md shrink-0">
                      {photoPreview ? <img src={photoPreview} alt="Admin Passport" className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 mb-1 cursor-pointer hover:underline">
                        Upload Admin Official Photograph
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoPreview)} className="hidden" />
                      </label>
                      <p className="text-[11px] text-slate-400">Official identification photo</p>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-md"
                    >
                      <span>Continue to Security & Password</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* FACULTY REGISTRATION FORM (FULL 3-STEP RICH STUDIO) */}
              {/* ========================================================================= */}
              {role === 'Faculty' && (
                <>
                  {/* STEP 1: FACULTY PERSONAL DEMOGRAPHICS & PASSPORT PHOTO */}
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      {/* Photo Upload Section */}
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-indigo-600 shadow-md shrink-0">
                          {photoPreview ? <img src={photoPreview} alt="Faculty Passport" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-slate-400" />}
                        </div>
                        <div>
                          <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 mb-1 cursor-pointer hover:underline">
                            Upload Faculty Official Passport Photograph *
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoPreview)} className="hidden" />
                          </label>
                          <p className="text-[11px] text-slate-400">Official identification photo for Faculty Staff Badge</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          <UserCheck className="w-4 h-4 text-indigo-500" /> Faculty Personal Identity & Contact
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Faculty Name *</label>
                            <input type="text" name="fullName" required placeholder="e.g. Dr. SMB or Prof. Jane Doe" value={form.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Faculty Employee ID *</label>
                            <input type="text" name="employeeId" required placeholder="e.g. EMP-CSE-101" value={form.employeeId} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Email Address *</label>
                            <input type="email" name="email" required placeholder="faculty@nexus.edu" value={form.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number *</label>
                            <input type="text" name="mobile" required placeholder="+91 98765 43210" value={form.mobile} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                            <input type="date" name="dob" value={form.dob} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                            <select name="bloodGroup" value={form.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Permanent Residential Address</label>
                            <textarea name="address" rows={2} placeholder="Full residential address..." value={form.address} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-md">
                          <span>Next: Academic Department & Courses Taught</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: ACADEMIC DEPARTMENT & CLASS INCHARGE ASSIGNMENT */}
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase tracking-wider">
                          <GraduationCap className="w-4 h-4 text-indigo-500" /> Academic Department & Appointment Record
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campus / Institution Name *</label>
                            <input type="text" name="collegeName" required value={form.collegeName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Academic Department *</label>
                            <select name="department" value={form.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {['CSE', 'ECE', 'ME', 'CE', 'IT', 'MGMT'].map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Official Designation Title *</label>
                            <select name="designation" value={form.designation} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              {['Professor', 'Associate Professor', 'Assistant Professor', 'Head of Department (HOD)', 'Lab Instructor', 'Visiting Faculty'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Joining</label>
                            <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subjects & Courses Taught *</label>
                            <input type="text" name="subjectsTaught" placeholder="e.g. Blockchain, Agile Dev, DBMS" value={form.subjectsTaught} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* Class Incharge Assignment */}
                      <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300 text-xs uppercase tracking-wider">
                          <Users className="w-4 h-4 text-purple-500" /> Class Incharge Duty Status & Assigned Student Class
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Are you assigned as Class Incharge?</label>
                            <select name="isClassIncharge" value={form.isClassIncharge} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                              <option value="No">No - Subject Faculty Only</option>
                              <option value="Yes">Yes - Assigned Class Incharge</option>
                            </select>
                          </div>

                          {form.isClassIncharge === 'Yes' && (
                            <>
                              <div>
                                <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">Degree Program *</label>
                                <select name="degreeClass" value={form.degreeClass} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                                  {['B.TECH', 'BCA', 'M.TECH', 'MBA', 'MCA', 'BBA', 'B.SC'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>

                              <div>
                                <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">Department *</label>
                                <select name="department" value={form.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                                  {['CSE', 'ECE', 'ME', 'CE', 'IT', 'MGMT'].map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                              </div>

                              <div>
                                <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">Class Joining Year / Batch *</label>
                                <input type="text" name="joiningYear" placeholder="2023" value={form.joiningYear} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                              </div>

                              <div>
                                <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">Section *</label>
                                <input type="text" name="section" placeholder="A, B, C or D" value={form.section} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold uppercase" />
                              </div>

                              <div className="sm:col-span-2 p-3 rounded-xl bg-purple-100/60 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 flex items-center justify-between">
                                <span className="font-bold text-purple-900 dark:text-purple-200">Computed Official Incharge Class Code:</span>
                                <span className="font-mono font-black text-purple-600 dark:text-purple-300 text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border">
                                  {form.degreeClass} {form.department} {form.joiningYear} {form.section}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(3)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 flex items-center gap-1.5 shadow-md">
                          <span>Next: Security Password & Recovery Questions</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* STEP 1 FOR PARENT */}
              {role === 'Parent' && step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                      <input type="text" name="fullName" required placeholder="Full Name" value={form.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                      <input type="email" name="email" required placeholder="email@nexus.edu" value={form.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone *</label>
                      <input type="text" name="mobile" required placeholder="+91 98765 43210" value={form.mobile} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student Roll Number</label>
                      <input type="text" name="studentRollNumber" placeholder="2301019" value={form.studentRollNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1">
                      Continue to Security <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* FINAL STEP: PASSWORD & SECURITY QUESTIONS FOR ALL ROLES */}
              {((role === 'Student' && step === 6) || (role === 'Alumni' && step === 4) || (role === 'Faculty' && step === 3) || (role !== 'Student' && role !== 'Alumni' && role !== 'Faculty' && step === 2)) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required
                          value={form.password}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          required
                          value={form.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Set Up 3 Mandatory Security Questions</span>
                    </div>

                    <div>
                      <select name="q1" value={form.q1} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs mb-1 font-bold">
                        {SECURITY_QUESTIONS_LIST.map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <input type="text" name="a1" required placeholder="Answer 1" value={form.a1} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs" />
                    </div>

                    <div>
                      <select name="q2" value={form.q2} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs mb-1 font-bold">
                        {SECURITY_QUESTIONS_LIST.map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <input type="text" name="a2" required placeholder="Answer 2" value={form.a2} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs" />
                    </div>

                    <div>
                      <select name="q3" value={form.q3} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs mb-1 font-bold">
                        {SECURITY_QUESTIONS_LIST.map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <input type="text" name="a3" required placeholder="Answer 3" value={form.a3} onChange={handleInputChange} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs" />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(role === 'Student' ? 5 : role === 'Alumni' ? 3 : role === 'Faculty' ? 2 : 1)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md"
                    >
                      Complete Registration
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
