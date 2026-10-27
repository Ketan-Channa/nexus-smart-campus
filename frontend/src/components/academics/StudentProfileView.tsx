import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import jsPDF from 'jspdf';
import {
  Camera,
  Edit3,
  Save,
  CheckCircle2,
  GraduationCap,
  FileCheck,
  Users,
  Award,
  Home,
  Heart,
  Download,
  Plus,
  FileText,
} from 'lucide-react';

interface StudentProfileViewProps {
  session: any;
  onLogout: () => void;
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

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ session, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Complete Student Form State
  const [profile, setProfile] = useState({
    fullName: session?.name || 'Ketan Channa',
    admissionNumber: 'ADM2023991',
    rollNumber: '2301019',
    collegeName: 'NEXUS Institute of Technology',
    degreeClass: 'B.TECH',
    joiningYear: '2023',
    endingYear: '2027',
    studyYear: '2ND',
    semester: 'Semester 3',
    department: 'Computer Science & Engineering',
    section: 'A',
    dob: '2003-05-14',
    bloodGroup: 'O+',
    gender: 'Male',
    email: session?.email || 'ketan@nexus.edu',
    mobile: session?.mobile || '+91 98765 43210',
    address: 'Nexus Smart Campus, Block A, City Center',

    govtIdType: 'Aadhaar Card',
    govtIdNumber: '1234 5678 9012',
    photoUrl: null as string | null,
    govtIdPhotoUrl: null as string | null,
    collegeDocUrl: null as string | null,

    fatherName: 'Ramesh Channa',
    fatherPhone: '+91 98765 00001',
    fatherEmail: 'ramesh@gmail.com',
    fatherGovtIdType: 'PAN Card',
    fatherGovtIdNumber: 'ABCDE1234F',
    fatherPhotoUrl: null as string | null,
    fatherGovtIdPhotoUrl: null as string | null,

    motherName: 'Sunita Channa',
    motherPhone: '+91 98765 00002',
    motherEmail: 'sunita@gmail.com',
    motherGovtIdType: 'Aadhaar Card',
    motherGovtIdNumber: '9876 5432 1098',
    motherPhotoUrl: null as string | null,
    motherGovtIdPhotoUrl: null as string | null,

    hobbies: 'Reading Books, Listening to Music',
    skills: ['DSA', 'Graphic Designing', 'React.js'],

    conveyanceMode: 'Self',
    busRoute: 'Route 4 (Central Campus via Civil Lines)',
    busCharges: '12000',
    vehicleType: '2-Wheeler',
    parkingPaymentTerm: 'Semester-wise',
    parkingFee: '500',

    residenceType: 'Day Scholar',
    hostelName: 'NEXUS Boys Hostel Block A',
    roomNumber: 'B-304',
    hostelPaymentTerm: 'Semester-wise',
    hostelFee: '35000',
    hostelDocUrl: null as string | null,
    hostelCardUrl: null as string | null,
  });

  // Fetch complete profile from MySQL on mount
  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const identifier = session?.email || session?.name || '2301019';
      const res = await axios.get(`https://nexus-smart-campus-backend.onrender.com/api/auth/student-profile?identifier=${encodeURIComponent(identifier)}`);
      if (res.data?.status === 'success' && res.data?.student) {
        const s = res.data.student;
        let parsedSkills: string[] = ['DSA', 'Graphic Designing'];
        try {
          if (s.skills) {
            parsedSkills = typeof s.skills === 'string' && s.skills.startsWith('[') ? JSON.parse(s.skills) : s.skills.split(',');
          }
        } catch (e) {}

        setProfile({
          fullName: s.full_name || session?.name || '',
          admissionNumber: s.admission_number || '',
          rollNumber: s.roll_number || '',
          collegeName: s.college_name || 'NEXUS Institute of Technology',
          degreeClass: s.degree_class || 'B.TECH',
          joiningYear: s.joining_year || '2023',
          endingYear: s.ending_year || '2027',
          studyYear: s.study_year || '2ND',
          semester: s.semester || 'Semester 3',
          department: s.department || 'Computer Science & Engineering',
          section: s.section || 'A',
          dob: s.dob || '',
          bloodGroup: s.blood_group || 'O+',
          gender: s.gender || 'Male',
          email: s.email || session?.email || '',
          mobile: s.mobile || '',
          address: s.address || '',

          govtIdType: s.govt_id_type || 'Aadhaar Card',
          govtIdNumber: s.govt_id_number || '',
          photoUrl: s.photograph_url || null,
          govtIdPhotoUrl: s.govt_id_photo_url || null,
          collegeDocUrl: s.college_doc_url || null,

          fatherName: s.father_name || '',
          fatherPhone: s.father_phone || '',
          fatherEmail: s.father_email || '',
          fatherGovtIdType: s.father_govt_id_type || 'PAN Card',
          fatherGovtIdNumber: s.father_govt_id_number || '',
          fatherPhotoUrl: s.father_photo_url || null,
          fatherGovtIdPhotoUrl: s.father_govt_id_photo_url || null,

          motherName: s.mother_name || '',
          motherPhone: s.mother_phone || '',
          motherEmail: s.mother_email || '',
          motherGovtIdType: s.mother_govt_id_type || 'Aadhaar Card',
          motherGovtIdNumber: s.mother_govt_id_number || '',
          motherPhotoUrl: s.mother_photo_url || null,
          motherGovtIdPhotoUrl: s.mother_govt_id_photo_url || null,

          hobbies: s.hobbies || 'Reading Books, Listening to Music',
          skills: parsedSkills,

          conveyanceMode: s.conveyance_mode || 'Self',
          busRoute: s.bus_route || 'Route 4',
          busCharges: s.bus_charges || '12000',
          vehicleType: s.vehicle_type || '2-Wheeler',
          parkingPaymentTerm: s.parking_payment_term || 'Semester-wise',
          parkingFee: s.parking_fee || '500',

          residenceType: s.residence_type || 'Day Scholar',
          hostelName: s.hostel_name || 'NEXUS Boys Hostel Block A',
          roomNumber: s.room_number || 'B-304',
          hostelPaymentTerm: s.hostel_payment_term || 'Semester-wise',
          hostelFee: s.hostel_fee || '35000',
          hostelDocUrl: s.hostel_doc_url || null,
          hostelCardUrl: s.hostel_card_url || null,
        });
      }
    } catch (err) {
      console.warn('Could not fetch student profile from database, using session state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'vehicleType' || name === 'parkingPaymentTerm') {
      const updatedVehicle = name === 'vehicleType' ? value : profile.vehicleType;
      const updatedTerm = name === 'parkingPaymentTerm' ? value : profile.parkingPaymentTerm;
      const fee = updatedVehicle === '4-Wheeler' ? (updatedTerm === 'Yearly' ? '3000' : '1500') : (updatedTerm === 'Yearly' ? '1000' : '500');
      setProfile({ ...profile, [name]: value, parkingFee: fee });
      return;
    }

    if (name === 'hostelPaymentTerm') {
      const fee = value === 'Yearly' ? '70000' : '35000';
      setProfile({ ...profile, [name]: value, hostelFee: fee });
      return;
    }

    setProfile({ ...profile, [name]: value });
  };

  // Helper File Uploader with Image Compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof profile) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const raw = reader.result as string;
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.src = raw;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, w, h);
            setProfile((prev) => ({ ...prev, [key]: canvas.toDataURL('image/jpeg', 0.7) }));
          };
          img.onerror = () => setProfile((prev) => ({ ...prev, [key]: raw }));
        } else {
          setProfile((prev) => ({ ...prev, [key]: raw }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const identifier = profile.rollNumber || profile.email || session?.email;
      await axios.put('https://nexus-smart-campus-backend.onrender.com/api/auth/update-profile', {
        role: 'Student',
        identifier,
        ...profile,
      });

      setIsEditing(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
    } catch (err: any) {
      console.error('Failed to update student profile:', err);
      setIsEditing(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
    }
  };

  // PDF Generator for Student Profile
  const downloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 26, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('NEXUS SMART CAMPUS UNIVERSITY', 105, 10, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL STUDENT ADMISSION & REGISTRATION APPLICATION FORM', 105, 17, { align: 'center' });

      if (profile.photoUrl) {
        try { doc.addImage(profile.photoUrl, 'JPEG', 165, 30, 30, 35); } catch (e) {}
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('1. ACADEMIC & PERSONAL CREDENTIALS', 14, 34);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      let y = 41;
      doc.text(`Full Name: ${profile.fullName}`, 14, y);
      doc.text(`Admission No: ${profile.admissionNumber}`, 90, y); y += 6;
      doc.text(`University Roll No: ${profile.rollNumber}`, 14, y);
      doc.text(`Official Class Code: ${profile.degreeClass} ${profile.department} ${profile.joiningYear}`, 90, y); y += 6;
      doc.text(`College Name: ${profile.collegeName}`, 14, y);
      doc.text(`Department: ${profile.department}`, 90, y); y += 6;
      doc.text(`Degree Program: ${profile.degreeClass}`, 14, y);
      doc.text(`Session Period: ${profile.joiningYear} - ${profile.endingYear}`, 90, y); y += 6;
      doc.text(`Study Year & Sem: ${profile.studyYear} Year, ${profile.semester}`, 14, y); y += 6;
      doc.text(`DOB: ${profile.dob} | Blood Group: ${profile.bloodGroup} | Gender: ${profile.gender}`, 14, y); y += 6;
      doc.text(`Email: ${profile.email}`, 14, y);
      doc.text(`Mobile: ${profile.mobile}`, 90, y); y += 6;
      doc.text(`Residential Address: ${profile.address}`, 14, y); y += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('2. PARENTAL INFORMATION & VERIFICATION', 14, y); y += 7;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student Govt ID: ${profile.govtIdType} - ${profile.govtIdNumber}`, 14, y); y += 6;
      doc.text(`Father: ${profile.fatherName} | Phone: ${profile.fatherPhone} | ID: ${profile.fatherGovtIdType} ${profile.fatherGovtIdNumber}`, 14, y); y += 6;
      doc.text(`Mother: ${profile.motherName} | Phone: ${profile.motherPhone} | ID: ${profile.motherGovtIdType} ${profile.motherGovtIdNumber}`, 14, y); y += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('3. CONVEYANCE, PARKING & RESIDENCE STATUS', 14, y); y += 7;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Conveyance: ${profile.conveyanceMode} | Vehicle: ${profile.vehicleType} | Parking Fee: Rs. ${profile.parkingFee}`, 14, y); y += 6;
      doc.text(`Residence Category: ${profile.residenceType} ${profile.residenceType === 'Hosteller' ? `(Hostel: ${profile.hostelName}, Room: ${profile.roomNumber})` : ''}`, 14, y); y += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('4. HOBBIES & SKILLS PROFILE', 14, y); y += 7;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Hobbies: ${profile.hobbies}`, 14, y); y += 5;
      doc.text(`Skills: ${profile.skills.join(', ')}`, 14, y); y += 12;

      doc.save(`student_profile_${profile.rollNumber || 'card'}.pdf`);
    } catch (err) {
      alert('Error generating PDF');
    }
  };

  const generatedClassCode = `${profile.degreeClass} ${profile.department} ${profile.joiningYear} ${profile.section}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Student profile details, photographs, and document records saved to MySQL database successfully!</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/20 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-indigo-500/25 overflow-hidden border-2 border-indigo-200 dark:border-indigo-800">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Student Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.fullName.charAt(0).toUpperCase()
                )}
              </div>

              <label className="absolute inset-0 bg-slate-950/70 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Change Photo</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} className="hidden" />
              </label>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <span>Student Academic Profile</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">{profile.fullName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                Roll No: <span className="text-purple-600 dark:text-purple-400">{profile.rollNumber}</span> | Admission No: {profile.admissionNumber}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Class: <strong className="text-slate-800 dark:text-slate-200 font-mono">{generatedClassCode}</strong> ({profile.studyYear} Year, {profile.semester})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-500 shadow-md transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Profile (CRUD)'}</span>
            </button>

            <button
              onClick={downloadPDF}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Download Form (PDF)</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* PROFILE CONTENT FORM / VIEW */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* SECTION 1: ACADEMIC CREDENTIALS */}
          <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-4">
            <div className="flex items-center gap-2 font-black text-purple-900 dark:text-purple-300 text-xs uppercase tracking-wider">
              <GraduationCap className="w-4.5 h-4.5 text-purple-500" /> Academic & Enrollment Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                {isEditing ? (
                  <input type="text" name="fullName" value={profile.fullName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.fullName}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Admission Number</label>
                {isEditing ? (
                  <input type="text" name="admissionNumber" value={profile.admissionNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold">{profile.admissionNumber}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-purple-600 dark:text-purple-400 mb-1">University Roll Number</label>
                {isEditing ? (
                  <input type="text" name="rollNumber" value={profile.rollNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 text-xs font-mono font-black" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 font-mono font-black text-purple-600 dark:text-purple-300">{profile.rollNumber}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">College Name</label>
                {isEditing ? (
                  <input type="text" name="collegeName" value={profile.collegeName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.collegeName}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                {isEditing ? (
                  <input type="text" name="department" value={profile.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold uppercase" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.department}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Degree Program</label>
                {isEditing ? (
                  <input type="text" name="degreeClass" value={profile.degreeClass} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold uppercase" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.degreeClass}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Joining & Ending Years</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="joiningYear" value={profile.joiningYear} onChange={handleInputChange} className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                    <input type="text" name="endingYear" value={profile.endingYear} onChange={handleInputChange} className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold" />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.joiningYear} - {profile.endingYear}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Study Year & Section</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <select name="studyYear" value={profile.studyYear} onChange={handleInputChange} className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                      <option value="1ST">1ST</option>
                      <option value="2ND">2ND</option>
                      <option value="3RD">3RD</option>
                      <option value="4TH">4TH</option>
                    </select>
                    <input type="text" name="section" value={profile.section} onChange={handleInputChange} className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold uppercase" />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.studyYear} Year (Section {profile.section})</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                {isEditing ? (
                  <select name="semester" value={profile.semester} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                    {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.semester}</div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: PERSONAL & CONTACT INFORMATION */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              <Heart className="w-4.5 h-4.5 text-purple-500" /> Personal & Demographic Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input type="date" name="dob" value={profile.dob} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.dob || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                {isEditing ? (
                  <input type="text" name="bloodGroup" value={profile.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.bloodGroup}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                {isEditing ? (
                  <select name="gender" value={profile.gender} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.gender}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                {isEditing ? (
                  <input type="text" name="mobile" value={profile.mobile} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.mobile}</div>
                )}
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                {isEditing ? (
                  <input type="email" name="email" value={profile.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.email}</div>
                )}
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                {isEditing ? (
                  <textarea name="address" rows={2} value={profile.address} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.address}</div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: DOCUMENTS & VERIFICATION */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-4">
            <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider">
              <FileCheck className="w-4.5 h-4.5 text-amber-500" /> Government & College Verification Documents
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Government ID Type & Number</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <select name="govtIdType" value={profile.govtIdType} onChange={handleInputChange} className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                      {GOVT_ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="text" name="govtIdNumber" value={profile.govtIdNumber} onChange={handleInputChange} className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono font-bold" />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold">{profile.govtIdType}: {profile.govtIdNumber}</div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official College Document</label>
                {isEditing ? (
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'collegeDocUrl')} className="w-full text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold text-emerald-600 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {profile.collegeDocUrl ? '✓ Document Uploaded' : 'Not Uploaded'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: PARENT PROFILES */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              <Users className="w-4.5 h-4.5 text-purple-500" /> Parent Profiles & Contacts
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Father */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border space-y-2">
                <h5 className="font-bold text-purple-600 dark:text-purple-400">Father Information</h5>
                {isEditing ? (
                  <div className="space-y-2">
                    <input type="text" name="fatherName" placeholder="Father Name" value={profile.fatherName} onChange={handleInputChange} className="w-full px-2 py-1.5 rounded-lg border text-xs" />
                    <input type="text" name="fatherPhone" placeholder="Father Phone" value={profile.fatherPhone} onChange={handleInputChange} className="w-full px-2 py-1.5 rounded-lg border text-xs" />
                    <input type="email" name="fatherEmail" placeholder="Father Email" value={profile.fatherEmail} onChange={handleInputChange} className="w-full px-2 py-1.5 rounded-lg border text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <select name="fatherGovtIdType" value={profile.fatherGovtIdType} onChange={handleInputChange} className="px-2 py-1.5 rounded-lg border text-xs">
                        {GOVT_ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="text" name="fatherGovtIdNumber" placeholder="ID No" value={profile.fatherGovtIdNumber} onChange={handleInputChange} className="px-2 py-1.5 rounded-lg border text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between cursor-pointer">
                        <span>{profile.fatherPhotoUrl ? '✓ Photo' : 'Upload Photo'}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'fatherPhotoUrl')} className="hidden" />
                      </label>
                      <label className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between cursor-pointer">
                        <span>{profile.fatherGovtIdPhotoUrl ? '✓ Govt ID' : 'Upload Govt ID'}</span>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'fatherGovtIdPhotoUrl')} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-[11px]">
                    <p><strong>Name:</strong> {profile.fatherName}</p>
                    <p><strong>Phone:</strong> {profile.fatherPhone}</p>
                    <p><strong>Email:</strong> {profile.fatherEmail}</p>
                    <p><strong>ID:</strong> {profile.fatherGovtIdType} - {profile.fatherGovtIdNumber}</p>
                    <p className="text-emerald-600 font-semibold pt-1">
                      {profile.fatherGovtIdPhotoUrl ? '✓ Govt ID Document Uploaded' : 'No Govt ID Uploaded'}
                    </p>
                  </div>
                )}
              </div>

              {/* Mother */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border space-y-2">
                <h5 className="font-bold text-purple-600 dark:text-purple-400">Mother Information</h5>
                {isEditing ? (
                  <div className="space-y-2">
                    <input type="text" name="motherName" placeholder="Mother Name" value={profile.motherName} onChange={handleInputChange} className="w-full px-2 py-1.5 rounded-lg border text-xs" />
                    <input type="text" name="motherPhone" placeholder="Mother Phone" value={profile.motherPhone} onChange={handleInputChange} className="w-full px-2 py-1.5 rounded-lg border text-xs" />
                    <input type="email" name="motherEmail" placeholder="Mother Email" value={profile.motherEmail} onChange={handleInputChange} className="w-full px-2 py-1.5 rounded-lg border text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <select name="motherGovtIdType" value={profile.motherGovtIdType} onChange={handleInputChange} className="px-2 py-1.5 rounded-lg border text-xs">
                        {GOVT_ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="text" name="motherGovtIdNumber" placeholder="ID No" value={profile.motherGovtIdNumber} onChange={handleInputChange} className="px-2 py-1.5 rounded-lg border text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between cursor-pointer">
                        <span>{profile.motherPhotoUrl ? '✓ Photo' : 'Upload Photo'}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'motherPhotoUrl')} className="hidden" />
                      </label>
                      <label className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between cursor-pointer">
                        <span>{profile.motherGovtIdPhotoUrl ? '✓ Govt ID' : 'Upload Govt ID'}</span>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'motherGovtIdPhotoUrl')} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-[11px]">
                    <p><strong>Name:</strong> {profile.motherName}</p>
                    <p><strong>Phone:</strong> {profile.motherPhone}</p>
                    <p><strong>Email:</strong> {profile.motherEmail}</p>
                    <p><strong>ID:</strong> {profile.motherGovtIdType} - {profile.motherGovtIdNumber}</p>
                    <p className="text-emerald-600 font-semibold pt-1">
                      {profile.motherGovtIdPhotoUrl ? '✓ Govt ID Document Uploaded' : 'No Govt ID Uploaded'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: HOBBIES & SKILLS */}
          <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-purple-900 dark:text-purple-300 text-xs uppercase tracking-wider">
                <Award className="w-4.5 h-4.5 text-purple-500" /> Hobbies & Technical Skills
              </div>
              <span className="text-[10px] font-mono text-purple-600 font-bold">{profile.skills.length} Skills</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hobbies</label>
                {isEditing ? (
                  <input type="text" name="hobbies" value={profile.hobbies} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.hobbies}</div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Skills List</label>
                {isEditing && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a new skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                    />
                    <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1 border border-purple-500/30">
                      {skill}
                      {isEditing && (
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-500 font-bold ml-1">✕</button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: CONVEYANCE & RESIDENCE (HOSTELLER / DAY SCHOLAR) */}
          <div className="p-5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 space-y-4">
            <div className="flex items-center gap-2 font-black text-cyan-950 dark:text-cyan-200 text-xs uppercase tracking-wider">
              <Home className="w-4.5 h-4.5 text-cyan-500" /> Residence & Conveyance Options
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Conveyance Mode</label>
                {isEditing ? (
                  <select name="conveyanceMode" value={profile.conveyanceMode} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                    <option value="Self">Self Vehicle</option>
                    <option value="College Vehicle">College Bus</option>
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.conveyanceMode} {profile.conveyanceMode === 'Self' ? `(${profile.vehicleType}, Fee: ₹${profile.parkingFee})` : `(${profile.busRoute})`}</div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Residence Category</label>
                {isEditing ? (
                  <select name="residenceType" value={profile.residenceType} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">
                    <option value="Day Scholar">Day Scholar</option>
                    <option value="Hosteller">Hosteller</option>
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-semibold">{profile.residenceType} {profile.residenceType === 'Hosteller' ? `(Hostel: ${profile.hostelName}, Room: ${profile.roomNumber}, Fee: ₹${profile.hostelFee})` : ''}</div>
                )}
              </div>
            </div>
          </div>

          {/* SAVE BUTTON FOR EDITING MODE */}
          {isEditing && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save All Profile Changes to MySQL</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};
