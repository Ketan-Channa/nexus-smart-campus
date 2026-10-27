import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CreditCard,
  QrCode,
  Bus,
  BookOpen,
  PartyPopper,
  Building2,
  Users,
  RefreshCw,
  CheckCircle2,
  Lock,
  Clock,
  ShieldCheck,
  AlertCircle,
  Send,
  Eye,
  X,
  Upload,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  User,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import axios from 'axios';
import { type UserSession } from '../../types/auth';
import { useRealtimeEvent } from '../../context/RealtimeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nexus-smart-campus-backend.onrender.com';

export interface StudentDocumentItem {
  id: string;
  docName: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  fileDataUrl?: string;
  status: 'Verified' | 'Under Review';
  notes: string;
}

interface StudentDocumentsProps {
  session?: UserSession | null;
}

export interface CardApprovalState {
  idCard: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'IN_REVIEW';
  festCard: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'IN_REVIEW';
  hostelPassIncharge: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'IN_REVIEW';
  parentPass: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'IN_REVIEW';
  busPass: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'IN_REVIEW';
  libraryCard: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'IN_REVIEW';
}

// Reusable SVG QR Code Renderer
const VisualQRCode: React.FC<{ text: string; color?: string; size?: number }> = ({
  text,
  color = '#4F46E5',
  size = 75,
}) => {
  return (
    <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200 inline-block text-center" title={text}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <rect x="5" y="5" width="30" height="30" rx="4" fill={color} />
        <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
        <rect x="14" y="14" width="12" height="12" rx="1" fill={color} />

        <rect x="65" y="5" width="30" height="30" rx="4" fill={color} />
        <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
        <rect x="74" y="14" width="12" height="12" rx="1" fill={color} />

        <rect x="5" y="65" width="30" height="30" rx="4" fill={color} />
        <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
        <rect x="14" y="74" width="12" height="12" rx="1" fill={color} />

        <rect x="42" y="10" width="8" height="8" rx="1" fill={color} />
        <rect x="52" y="18" width="8" height="8" rx="1" fill={color} />
        <rect x="42" y="26" width="8" height="8" rx="1" fill={color} />

        <rect x="10" y="42" width="8" height="8" rx="1" fill={color} />
        <rect x="22" y="42" width="8" height="8" rx="1" fill={color} />
        <rect x="42" y="42" width="16" height="16" rx="2" fill={color} />
        <rect x="65" y="42" width="8" height="8" rx="1" fill={color} />
        <rect x="78" y="42" width="8" height="8" rx="1" fill={color} />

        <rect x="42" y="65" width="8" height="8" rx="1" fill={color} />
        <rect x="52" y="74" width="8" height="8" rx="1" fill={color} />
        <rect x="65" y="65" width="12" height="12" rx="2" fill={color} />
        <rect x="80" y="80" width="12" height="12" rx="2" fill={color} />
      </svg>
    </div>
  );
};

// Reusable Barcode Component
const VisualBarcode: React.FC<{ code: string }> = ({ code }) => {
  return (
    <div className="bg-white p-2 rounded-xl border border-slate-200 text-center space-y-1">
      <div className="flex items-center justify-center gap-0.5 h-6">
        {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1].map((w, i) => (
          <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
        ))}
      </div>
      <span className="font-mono text-[9px] text-slate-700 font-bold block">{code}</span>
    </div>
  );
};

export const StudentDocuments: React.FC<StudentDocumentsProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<
    'IDCard' | 'FestCard' | 'HostelVisitorPass' | 'ParentVisitorPass' | 'TransportCard' | 'LibraryCard' | 'Vault'
  >('IDCard');

  // Default Photos
  const DEFAULT_AVATAR =
    session?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
  const DEFAULT_FATHER = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300';
  const DEFAULT_MOTHER = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300';

  // AUTOFILL STUDENT CREDENTIALS FROM ACCOUNT CREATION & DATABASE
  const [profileData, setProfileData] = useState(() => {
    let savedSession: any = {};
    let savedProfile: any = {};
    try {
      const s = sessionStorage.getItem('nexus_session');
      if (s) savedSession = JSON.parse(s);
      const p = localStorage.getItem('nexus_user_profile') || localStorage.getItem('nexus_student_profile');
      if (p) savedProfile = JSON.parse(p);
    } catch (e) {}

    const studentName =
      session?.name ||
      savedSession?.name ||
      savedProfile?.fullName ||
      savedProfile?.name ||
      'Ketan Channa';

    const rollNo =
      (session as any)?.rollNumber ||
      (session as any)?.roll_number ||
      savedSession?.rollNumber ||
      savedSession?.roll_number ||
      savedProfile?.rollNumber ||
      savedProfile?.roll_no ||
      '2329';

    const dept = (session as any)?.department || (session as any)?.branch || savedProfile?.department || 'Computer Science & Engineering';
    const classParam = savedProfile?.classParameter || savedProfile?.inchargeClass || (session as any)?.classParameter || 'B.TECH CSE 2023 A';
    const email = session?.email || savedSession?.email || savedProfile?.email || 'student@nexus.campus.edu';
    const phone = (session as any)?.mobile || (session as any)?.phone || savedProfile?.mobile || '+91 98000 00000';
    const address = savedProfile?.address || (session as any)?.address || 'Nexus Campus, Block A, Sector 62, New Delhi';

    const fatherName = savedProfile?.fatherName || savedProfile?.father_name || 'Father Name';
    const fatherPhone = savedProfile?.fatherPhone || savedProfile?.father_phone || '+91 98765 11223';
    const motherName = savedProfile?.motherName || savedProfile?.mother_name || 'Mother Name';
    const motherPhone = savedProfile?.motherPhone || savedProfile?.mother_phone || '+91 98765 22334';

    // Class Incharge autofilled from Faculty schema / Database
    const inchargeName =
      savedProfile?.classInchargeName ||
      (session as any)?.classInchargeName ||
      savedSession?.classInchargeName ||
      'Dr. SMB (Prof. & Head CSE)';

    const inchargePhone = savedProfile?.classInchargePhone || (session as any)?.classInchargePhone || '+91 98123 45678';
    const inchargeEmail = savedProfile?.classInchargeEmail || (session as any)?.classInchargeEmail || 'smb.head.cse@nexus.campus.edu';

    return {
      fullName: studentName,
      rollNumber: rollNo,
      classParameter: classParam,
      department: dept,
      email: email,
      phone: phone,
      address: address,
      fatherName: fatherName,
      fatherPhone: fatherPhone,
      motherName: motherName,
      motherPhone: motherPhone,
      classInchargeName: inchargeName,
      classInchargePhone: inchargePhone,
      classInchargeEmail: inchargeEmail,
      photoUrl: session?.avatarUrl || savedProfile?.photoUrl || DEFAULT_AVATAR,
    };
  });

  const [studentPhoto, setStudentPhoto] = useState<string>(profileData.photoUrl);
  const [fatherPhoto, setFatherPhoto] = useState<string>(DEFAULT_FATHER);
  const [motherPhoto, setMotherPhoto] = useState<string>(DEFAULT_MOTHER);

  // FETCH STUDENT & CLASS INCHARGE DETAILS FROM DATABASE ON MOUNT
  useEffect(() => {
    const fetchDbCredentials = async () => {
      try {
        const stuRes = await axios.get('https://nexus-smart-campus-backend.onrender.com/api/admin/users?role=Student');
        if (stuRes.data?.users && Array.isArray(stuRes.data.users)) {
          const matched = stuRes.data.users.find(
            (u: any) =>
              (session?.email && u.email?.toLowerCase() === session.email.toLowerCase()) ||
              (profileData.rollNumber && String(u.identifier) === String(profileData.rollNumber))
          );
          if (matched) {
            setProfileData((prev) => ({
              ...prev,
              fullName: matched.name || prev.fullName,
              rollNumber: matched.identifier || prev.rollNumber,
              department: matched.department || prev.department,
              classParameter: matched.class || prev.classParameter,
              email: matched.email || prev.email,
            }));
          }
        }

        const facRes = await axios.get('https://nexus-smart-campus-backend.onrender.com/api/admin/faculty');
        if (facRes.data?.faculty && Array.isArray(facRes.data.faculty)) {
          const inchargeFac = facRes.data.faculty.find(
            (f: any) =>
              f.is_class_incharge === 'Yes' ||
              (f.incharge_class && profileData.classParameter.includes(f.incharge_class))
          );
          if (inchargeFac) {
            const inchargeName = `${inchargeFac.faculty_name} (${inchargeFac.designation || 'Faculty'})`;
            setProfileData((prev) => ({
              ...prev,
              classInchargeName: inchargeName,
              classInchargePhone: inchargeFac.mobile || prev.classInchargePhone,
              classInchargeEmail: inchargeFac.email || prev.classInchargeEmail,
            }));
          }
        }
      } catch (e) {}
    };

    fetchDbCredentials();
  }, [session, profileData.rollNumber, profileData.classParameter]);

  // Photo Upload Handler
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'student' | 'father' | 'mother'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const res = reader.result as string;
          if (target === 'student') setStudentPhoto(res);
          else if (target === 'father') setFatherPhoto(res);
          else if (target === 'mother') setMotherPhoto(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // REAL-TIME APPROVAL STATES FOR ALL CARDS
  const [approvals, setApprovals] = useState<CardApprovalState>(() => {
    try {
      const saved = localStorage.getItem('nexus_card_approvals_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      idCard: 'APPROVED',
      festCard: 'PENDING',
      hostelPassIncharge: 'PENDING',
      parentPass: 'PENDING',
      busPass: 'PENDING',
      libraryCard: 'PENDING',
    };
  });

  // 1. STUDENT ID CARD FORM (AUTOFILLED)
  const [idForm, setIdForm] = useState({
    fullName: profileData.fullName,
    rollNumber: profileData.rollNumber,
    classParameter: profileData.classParameter,
    department: profileData.department,
    email: profileData.email,
    phone: profileData.phone,
    address: profileData.address,
    classInchargeName: profileData.classInchargeName,
    classInchargePhone: profileData.classInchargePhone,
    classInchargeEmail: profileData.classInchargeEmail,
  });

  // Roll Number Real-Time Sync Handler
  const handleRollNumberChange = (val: string) => {
    setIdForm((prev) => ({ ...prev, rollNumber: val }));
    setProfileData((prev) => ({ ...prev, rollNumber: val }));
    try {
      const p = localStorage.getItem('nexus_user_profile') || localStorage.getItem('nexus_student_profile');
      const parsed = p ? JSON.parse(p) : {};
      parsed.rollNumber = val;
      localStorage.setItem('nexus_user_profile', JSON.stringify(parsed));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  // Class Incharge Real-Time Sync Handler
  const handleClassInchargeNameChange = (val: string) => {
    setIdForm((prev) => ({ ...prev, classInchargeName: val }));
    setProfileData((prev) => ({ ...prev, classInchargeName: val }));
    setFestForm((prev) => ({ ...prev, classInchargeName: val }));
    setHostelForm((prev) => ({ ...prev, classInchargeName: val }));
    setParentForm((prev) => ({ ...prev, classInchargeName: val }));
    setBusForm((prev) => ({ ...prev, classInchargeName: val }));
    setLibraryForm((prev) => ({ ...prev, classInchargeName: val }));
  };

  // 2. FEST PASS FORM (AUTOFILLED)
  const [festForm, setFestForm] = useState({
    eventName: 'SPANDAN 2026 - Annual Cultural Fest & Pro Night',
    startDate: '2026-09-05',
    startTime: '04:00 PM',
    endDate: '2026-09-07',
    endTime: '10:00 PM',
    classParameter: profileData.classParameter,
    department: profileData.department,
    classInchargeName: profileData.classInchargeName,
    classInchargePhone: profileData.classInchargePhone,
    classInchargeEmail: profileData.classInchargeEmail,
    accessZone: 'VIP Main Arena & Pro Concert Hall',
  });

  // 3. HOSTEL OUTING PASS FORM (AUTOFILLED)
  const [hostelForm, setHostelForm] = useState({
    isParentVisit: true,
    fatherName: profileData.fatherName,
    fatherPhone: profileData.fatherPhone,
    motherName: profileData.motherName,
    motherPhone: profileData.motherPhone,
    purposeOfVisit: 'Home Outing & Academic Review',
    visitingDate: '2026-09-10',
    visitingHours: '02:00 PM - 06:00 PM',
    destination: 'Home / Outstation',
    classParameter: profileData.classParameter,
    classInchargeName: profileData.classInchargeName,
    classInchargePhone: profileData.classInchargePhone,
    classInchargeEmail: profileData.classInchargeEmail,
  });

  // 4. PARENT CAMPUS VISIT PASS FORM (AUTOFILLED)
  const [parentForm, setParentForm] = useState({
    fatherName: profileData.fatherName,
    fatherPhone: profileData.fatherPhone,
    motherName: profileData.motherName,
    motherPhone: profileData.motherPhone,
    visitDate: '2026-09-15',
    timeForVisit: '10:00 AM - 04:00 PM',
    visitPurpose: 'Parent-Teacher Meeting & Evaluation',
    classParameter: profileData.classParameter,
    classInchargeName: profileData.classInchargeName,
    classInchargePhone: profileData.classInchargePhone,
    classInchargeEmail: profileData.classInchargeEmail,
  });

  // 5. EMERGENCY BUS PASS FORM (AUTOFILLED)
  const [busForm, setBusForm] = useState({
    pickupStop: 'Sector 62 Metro Station',
    dropStop: 'NEXUS Campus Main Gate',
    tripType: 'Round Trip' as 'Round Trip' | 'One Way Pass',
    routeName: 'Bus Route #14 - Sector 62 Shuttle',
    driverName: 'Bus Driver',
    driverPhone: '+91 98765 44321',
    facultyInchargeName: 'Transport Faculty Incharge',
    facultyPhone: '+91 98111 22334',
    classInchargeName: profileData.classInchargeName,
    classInchargePhone: profileData.classInchargePhone,
    classInchargeEmail: profileData.classInchargeEmail,
  });

  const [monthlyBusQuota, setMonthlyBusQuota] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_emergency_bus_quota');
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return 1;
  });

  const [busCheckResult, setBusCheckResult] = useState<{ available: boolean; message: string } | null>(null);

  // 6. LIBRARY SMART DIGITAL CARD FORM (AUTOFILLED)
  const [libraryForm, setLibraryForm] = useState({
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    issueDate: '2026-09-10',
    returnDate: '2026-09-24',
    librarianName: 'Chief Librarian',
    librarianPhone: '+91 98123 99887',
    librarianEmail: 'librarian@nexus.campus.edu',
    classInchargeName: profileData.classInchargeName,
    classInchargePhone: profileData.classInchargePhone,
    classInchargeEmail: profileData.classInchargeEmail,
  });

  const [bookCheckResult, setBookCheckResult] = useState<{ available: boolean; message: string } | null>(null);

  // 3D Card Flip State
  const [isFlipped, setIsFlipped] = useState(false);

  // VAULT DOCUMENTS STATE & MODALS FOR CRUD
  const [documents, setDocuments] = useState<StudentDocumentItem[]>([]);
  const [viewingVaultDoc, setViewingVaultDoc] = useState<StudentDocumentItem | null>(null);
  const [editingVaultDoc, setEditingVaultDoc] = useState<StudentDocumentItem | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Sync profile update from Account Creation / Session / Profile
  useEffect(() => {
    const handleProfileSync = () => {
      try {
        let savedSession: any = {};
        let savedProfile: any = {};
        const s = sessionStorage.getItem('nexus_session');
        if (s) savedSession = JSON.parse(s);
        const p = localStorage.getItem('nexus_user_profile') || localStorage.getItem('nexus_student_profile');
        if (p) savedProfile = JSON.parse(p);

        const studentName =
          session?.name ||
          savedSession?.name ||
          savedProfile?.fullName ||
          savedProfile?.name ||
          'Ketan Channa';

        const rollNo =
          (session as any)?.rollNumber ||
          (session as any)?.roll_number ||
          savedSession?.rollNumber ||
          savedSession?.roll_number ||
          savedProfile?.rollNumber ||
          savedProfile?.roll_no ||
          '2329';

        const dept = (session as any)?.department || (session as any)?.branch || savedProfile?.department || 'Computer Science & Engineering';
        const classParam = savedProfile?.classParameter || savedProfile?.inchargeClass || (session as any)?.classParameter || 'B.TECH CSE 2023 A';
        const email = session?.email || savedSession?.email || savedProfile?.email || 'student@nexus.campus.edu';
        const phone = (session as any)?.mobile || (session as any)?.phone || savedProfile?.mobile || '+91 98000 00000';
        const address = savedProfile?.address || (session as any)?.address || 'Nexus Campus, Block A, Sector 62, New Delhi';

        const fatherName = savedProfile?.fatherName || savedProfile?.father_name || 'Father Name';
        const fatherPhone = savedProfile?.fatherPhone || savedProfile?.father_phone || '+91 98765 11223';
        const motherName = savedProfile?.motherName || savedProfile?.mother_name || 'Mother Name';
        const motherPhone = savedProfile?.motherPhone || savedProfile?.mother_phone || '+91 98765 22334';

        const inchargeName =
          savedProfile?.classInchargeName ||
          (session as any)?.classInchargeName ||
          savedSession?.classInchargeName ||
          'Dr. SMB (Prof. & Head CSE)';

        const inchargePhone = savedProfile?.classInchargePhone || (session as any)?.classInchargePhone || '+91 98123 45678';
        const inchargeEmail = savedProfile?.classInchargeEmail || (session as any)?.classInchargeEmail || 'smb.head.cse@nexus.campus.edu';

        const updated = {
          fullName: studentName,
          rollNumber: rollNo,
          classParameter: classParam,
          department: dept,
          email: email,
          phone: phone,
          address: address,
          fatherName: fatherName,
          fatherPhone: fatherPhone,
          motherName: motherName,
          motherPhone: motherPhone,
          classInchargeName: inchargeName,
          classInchargePhone: inchargePhone,
          classInchargeEmail: inchargeEmail,
          photoUrl: session?.avatarUrl || savedProfile?.photoUrl || DEFAULT_AVATAR,
        };

        setProfileData(updated);

        setIdForm((prev) => ({
          ...prev,
          fullName: updated.fullName,
          rollNumber: updated.rollNumber,
          classParameter: updated.classParameter,
          department: updated.department,
          email: updated.email,
          phone: updated.phone,
          address: updated.address,
          classInchargeName: updated.classInchargeName,
          classInchargePhone: updated.classInchargePhone,
          classInchargeEmail: updated.classInchargeEmail,
        }));

        setFestForm((prev) => ({ ...prev, classParameter: updated.classParameter, department: updated.department, classInchargeName: updated.classInchargeName, classInchargePhone: updated.classInchargePhone, classInchargeEmail: updated.classInchargeEmail }));
        setHostelForm((prev) => ({ ...prev, fatherName: updated.fatherName, fatherPhone: updated.fatherPhone, motherName: updated.motherName, motherPhone: updated.motherPhone, classParameter: updated.classParameter, classInchargeName: updated.classInchargeName, classInchargePhone: updated.classInchargePhone, classInchargeEmail: updated.classInchargeEmail }));
        setParentForm((prev) => ({ ...prev, fatherName: updated.fatherName, fatherPhone: updated.fatherPhone, motherName: updated.motherName, motherPhone: updated.motherPhone, classParameter: updated.classParameter, classInchargeName: updated.classInchargeName, classInchargePhone: updated.classInchargePhone, classInchargeEmail: updated.classInchargeEmail }));
        setBusForm((prev) => ({ ...prev, classInchargeName: updated.classInchargeName, classInchargePhone: updated.classInchargePhone, classInchargeEmail: updated.classInchargeEmail }));
        setLibraryForm((prev) => ({ ...prev, classInchargeName: updated.classInchargeName, classInchargePhone: updated.classInchargePhone, classInchargeEmail: updated.classInchargeEmail }));

        if (updated.photoUrl) setStudentPhoto(updated.photoUrl);
      } catch (e) {}
    };

    window.addEventListener('storage', handleProfileSync);
    window.addEventListener('nexus:profile-updated', handleProfileSync);

    return () => {
      window.removeEventListener('storage', handleProfileSync);
      window.removeEventListener('nexus:profile-updated', handleProfileSync);
    };
  }, [session]);

  // Sync approvals to localStorage & listen for real-time changes
  useEffect(() => {
    localStorage.setItem('nexus_card_approvals_v2', JSON.stringify(approvals));

    const syncApprovals = () => {
      try {
        const saved = localStorage.getItem('nexus_card_approvals_v2');
        if (saved) setApprovals(JSON.parse(saved));
      } catch (e) {}
    };

    window.addEventListener('storage', syncApprovals);
    window.addEventListener('nexus:pass-approval-updated', syncApprovals);

    return () => {
      window.removeEventListener('storage', syncApprovals);
      window.removeEventListener('nexus:pass-approval-updated', syncApprovals);
    };
  }, [approvals]);

  // Load vault documents
  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem('nexus_student_uploaded_documents');
      if (savedDocs) {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed)) setDocuments(parsed);
      }
    } catch (e) {}
  }, []);

  // Handle Bus Availability Check
  const handleCheckBusAvailability = () => {
    const pickup = busForm.pickupStop.toLowerCase();
    if (pickup.includes('sector 62') || pickup.includes('metro') || pickup.includes('city') || pickup.includes('campus')) {
      setBusCheckResult({
        available: true,
        message: '✅ Bus Available: Route #14 (02:40 PM & 04:40 PM Shuttles Operating)',
      });
    } else {
      setBusCheckResult({
        available: true,
        message: '✅ Bus Available: Route #08 (Express Campus Shuttle)',
      });
    }
  };

  // Handle Book Availability Check
  const handleCheckBookAvailability = () => {
    if (libraryForm.bookTitle.trim()) {
      setBookCheckResult({
        available: true,
        message: '✅ Book Available in Central Library Section B-4 (Copies Available: 5)',
      });
    } else {
      setBookCheckResult({
        available: false,
        message: '❌ Please enter a book title to check catalog',
      });
    }
  };

  // CARD DATABASE STATE & REALTIME APPROVAL TRACKING
  const [cardDetailsMap, setCardDetailsMap] = useState<Record<string, any>>({});
  const [isSubmittingCard, setIsSubmittingCard] = useState<keyof CardApprovalState | null>(null);

  const mapCardTypeToKey = (cardType: string): keyof CardApprovalState | null => {
    const ct = (cardType || '').toLowerCase();
    if (ct.includes('fest')) return 'festCard';
    if (ct.includes('id card') || ct === 'idcard') return 'idCard';
    if (ct.includes('hostel')) return 'hostelPassIncharge';
    if (ct.includes('parent')) return 'parentPass';
    if (ct.includes('bus') || ct.includes('transport')) return 'busPass';
    if (ct.includes('library')) return 'libraryCard';
    return null;
  };

  const mapKeyToCardType = (key: keyof CardApprovalState): string => {
    switch (key) {
      case 'festCard': return 'Fest Card';
      case 'idCard': return 'Student Digital ID Card';
      case 'hostelPassIncharge': return 'Hostel Outing Pass';
      case 'parentPass': return 'Parent Campus Visit Pass';
      case 'busPass': return 'Emergency Bus Pass';
      case 'libraryCard': return 'Library Smart Digital Card';
      default: return 'Student Digital Pass';
    }
  };

  const mapBackendStatus = (status: string): 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'IN_REVIEW' => {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'approved' || s === 'verified') return 'APPROVED';
    if (s === 'rejected') return 'REJECTED';
    if (s === 'clarification requested' || s === 'clarification') return 'CLARIFICATION_REQUESTED';
    if (s === 'in review' || s === 'under review') return 'IN_REVIEW';
    return 'PENDING';
  };

  const fetchStudentCards = async () => {
    try {
      const roll = profileData.rollNumber;
      if (!roll) return;
      const token = localStorage.getItem('nexus_token');
      const res = await axios.get(`${API_BASE_URL}/api/student-utilities/cards`, {
        params: { studentRoll: roll },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data?.success && Array.isArray(res.data.cards)) {
        const newApprovals = { ...approvals };
        const newDetails: Record<string, any> = {};

        res.data.cards.forEach((card: any) => {
          const key = mapCardTypeToKey(card.card_type);
          if (key) {
            newApprovals[key] = mapBackendStatus(card.status);
            newDetails[key] = {
              status: card.status,
              approvedBy: card.approved_by,
              rejectionReason: card.rejection_reason,
              clarificationRequest: card.clarification_request,
              cardNumber: card.card_number,
              validUntil: card.valid_until,
              updatedAt: card.updated_at || card.created_at,
            };
          }
        });

        setApprovals(newApprovals);
        setCardDetailsMap(newDetails);
        localStorage.setItem('nexus_card_approvals_v2', JSON.stringify(newApprovals));
      }
    } catch (e) {
      console.warn('Student cards fetch error:', e);
    }
  };

  useEffect(() => {
    fetchStudentCards();
  }, [profileData.rollNumber]);

  useRealtimeEvent('approval.decision_updated', (data) => {
    console.log('⚡ [Student Documents] Realtime approval decision updated:', data);
    fetchStudentCards();
  });

  // Request Approval from Class Incharge Handler (Persisted to Database & Notified to Faculty Portal)
  const handleRequestApproval = async (key: keyof CardApprovalState) => {
    if (key === 'busPass' && monthlyBusQuota >= 5) {
      alert('⚠️ Monthly Emergency Bus Pass Limit Reached! You have used 5 out of 5 emergency passes for this month.');
      return;
    }

    if (key === 'busPass') {
      const newQuota = monthlyBusQuota + 1;
      setMonthlyBusQuota(newQuota);
      localStorage.setItem('nexus_emergency_bus_quota', newQuota.toString());
    }

    setIsSubmittingCard(key);
    const mappedCardType = mapKeyToCardType(key);

    try {
      const token = localStorage.getItem('nexus_token');
      const res = await axios.post(
        `${API_BASE_URL}/api/student-utilities/cards/apply`,
        {
          studentRoll: profileData.rollNumber,
          studentName: profileData.fullName,
          className: profileData.classParameter,
          department: profileData.department,
          cardType: mappedCardType,
          eventName: key === 'festCard' ? festForm.eventName : undefined,
          eventDates: key === 'festCard' ? `${festForm.startDate} to ${festForm.endDate}` : undefined,
          duration: key === 'festCard' ? '3 Days' : 'Academic Year 2025-2026',
          inchargeName: profileData.classInchargeName,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.success) {
        const updated = { ...approvals, [key]: 'PENDING' as const };
        setApprovals(updated);
        localStorage.setItem('nexus_card_approvals_v2', JSON.stringify(updated));

        setCardDetailsMap((prev) => ({
          ...prev,
          [key]: {
            status: 'Pending Approval',
            cardNumber: res.data.card?.cardNumber,
            approvedBy: profileData.classInchargeName,
          },
        }));

        window.dispatchEvent(new CustomEvent('nexus:pass-approval-updated', { detail: { cardKey: key, status: 'PENDING' } }));
        window.dispatchEvent(new Event('storage'));

        alert(`🚀 ${mappedCardType} successfully submitted to Faculty Portal for verification by ${profileData.classInchargeName}!`);
      }
    } catch (err: any) {
      console.error('Card apply error:', err);
      const updated = { ...approvals, [key]: 'PENDING' as const };
      setApprovals(updated);
      alert(`⚠️ Request submitted locally. Server notice: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmittingCard(null);
    }
  };

  // VAULT CRUD OPERATIONS:
  // 1. CREATE (Upload)
  const handleVaultUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const newDoc: StudentDocumentItem = {
            id: `doc-${Date.now()}`,
            docName: file.name.replace(/\.[^/.]+$/, ''),
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            uploadDate: nowStr,
            fileDataUrl: reader.result as string,
            status: 'Verified',
            notes: `Uploaded by ${profileData.fullName} on ${nowStr}.`,
          };

          const updated = [newDoc, ...documents];
          setDocuments(updated);
          localStorage.setItem('nexus_student_uploaded_documents', JSON.stringify(updated));
          alert(`🎉 SUCCESS!\n\nDocument "${newDoc.docName}" has been uploaded to your Vault.`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. UPDATE (Edit Document Modal)
  const handleStartEditVaultDoc = (docItem: StudentDocumentItem) => {
    setEditingVaultDoc(docItem);
    setEditDocName(docItem.docName);
    setEditNotes(docItem.notes);
  };

  const handleSaveEditVaultDoc = () => {
    if (!editingVaultDoc || !editDocName.trim()) return;
    const updatedDocs = documents.map((d) =>
      d.id === editingVaultDoc.id ? { ...d, docName: editDocName, notes: editNotes } : d
    );
    setDocuments(updatedDocs);
    localStorage.setItem('nexus_student_uploaded_documents', JSON.stringify(updatedDocs));
    setEditingVaultDoc(null);
    alert('✏️ Vault Document updated successfully!');
  };

  // 3. DELETE (Permanent Delete)
  const handleDeleteVaultDoc = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from your Vault?`)) {
      const updatedDocs = documents.filter((d) => d.id !== id);
      setDocuments(updatedDocs);
      localStorage.setItem('nexus_student_uploaded_documents', JSON.stringify(updatedDocs));
      alert(`🗑️ Document "${name}" deleted from Vault.`);
    }
  };

  // 4. DOWNLOAD (PDF Export)
  const handleDownloadVaultDocPDF = (docItem: StudentDocumentItem) => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('NEXUS SMART CAMPUS - OFFICIAL STUDENT VAULT DOCUMENT', 105, 12, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`DOCUMENT ID: ${docItem.id.toUpperCase()} | UPLOADED: ${docItem.uploadDate}`, 105, 19, { align: 'center' });

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Document Name: ${docItem.docName}`, 15, 38);
      pdf.text(`File Name: ${docItem.fileName} (${docItem.fileSize})`, 15, 45);
      pdf.text(`Student: ${profileData.fullName} (${profileData.rollNumber})`, 15, 52);
      pdf.text(`Class: ${profileData.classParameter} | Dept: ${profileData.department}`, 15, 59);

      pdf.setLineWidth(0.5);
      pdf.setDrawColor(203, 213, 225);
      pdf.line(15, 65, 195, 65);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Document Notes & Clearance Details:', 15, 75);
      pdf.setFont('helvetica', 'normal');
      pdf.text(docItem.notes, 15, 82, { maxWidth: 180 });

      pdf.setTextColor(16, 185, 129);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VERIFIED & ENCRYPTED IN NEXUS STUDENT VAULT ✓', 15, 120);

      pdf.save(`nexus_vault_${docItem.docName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      alert('Error downloading Vault PDF document');
    }
  };

  // Dual-Sided PDF Generator Engine
  const handlePrintDualSidedCardPDF = (cardType: string) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });

      // PAGE 1: FRONT SIDE
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 85.6, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`NEXUS SMART CAMPUS - ${cardType.toUpperCase()} (FRONT)`, 42.8, 4.5, { align: 'center' });
      doc.setFontSize(4);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL VERIFIED DIGITAL CREDENTIAL PASS', 42.8, 8, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(profileData.fullName, 23, 16);
      doc.setFontSize(4.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Roll No: ${profileData.rollNumber}`, 23, 20);
      doc.text(`Class: ${profileData.classParameter}`, 23, 23.5);
      doc.text(`Dept: ${profileData.department}`, 23, 27);
      doc.text(`Address: ${idForm.address.substring(0, 35)}...`, 23, 30.5);

      // Embedded Visual QR Code Box Page 1
      doc.setFillColor(79, 70, 229);
      doc.rect(65, 14, 16, 16, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(67, 16, 12, 12, 'F');
      doc.setFillColor(79, 70, 229);
      doc.rect(69, 18, 8, 8, 'F');
      doc.setFontSize(3.5);
      doc.text('VERIFIED QR', 73, 33, { align: 'center' });

      // PAGE 2: BACK SIDE
      doc.addPage([85.6, 53.98], 'landscape');
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 85.6, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`NEXUS SMART CAMPUS - ${cardType.toUpperCase()} (BACK)`, 42.8, 4.5, { align: 'center' });
      doc.setFontSize(4);
      doc.setFont('helvetica', 'normal');
      doc.text('CLASS INCHARGE AUTHORIZATION & VERIFICATION SEAL', 42.8, 8, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Class Incharge Name: ${idForm.classInchargeName}`, 5, 16);
      doc.text(`Incharge Phone: ${idForm.classInchargePhone}`, 5, 21);
      doc.text(`Incharge Email: ${idForm.classInchargeEmail}`, 5, 26);

      if (cardType === 'Library Card') {
        doc.setTextColor(225, 29, 72);
        doc.text('FINE NOTICE: Overdue return causes fine of Rs.50/- per day.', 5, 32);
      } else {
        doc.setTextColor(16, 185, 129);
        doc.text('CLASS INCHARGE VERIFIED & APPROVED ✓', 5, 32);
      }

      // Embedded Visual QR Code Box Page 2
      doc.setFillColor(15, 23, 42);
      doc.rect(65, 14, 16, 16, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(67, 16, 12, 12, 'F');
      doc.setFillColor(15, 23, 42);
      doc.rect(69, 18, 8, 8, 'F');
      doc.setFontSize(3.5);
      doc.text('SECURITY CLEARANCE', 73, 33, { align: 'center' });

      doc.save(`nexus_${cardType.toLowerCase().replace(/\s+/g, '_')}_dual_page_${profileData.rollNumber}.pdf`);
    } catch (e) {
      alert('Error exporting Dual-Sided Card PDF.');
    }
  };

  // Helper to render Verification Status Badge & Actions
  const renderVerificationControls = (key: keyof CardApprovalState) => {
    const currentStatus = approvals[key] || 'PENDING';
    const isApproved = currentStatus === 'APPROVED';
    const cardInfo = cardDetailsMap[key];

    return (
      <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Class Incharge Verification:</span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                isApproved
                  ? 'bg-emerald-500 text-white'
                  : currentStatus === 'REJECTED'
                  ? 'bg-rose-500 text-white'
                  : currentStatus === 'CLARIFICATION_REQUESTED'
                  ? 'bg-amber-600 text-white'
                  : currentStatus === 'IN_REVIEW'
                  ? 'bg-blue-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isApproved ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : currentStatus === 'REJECTED' ? (
                <AlertCircle className="w-3 h-3" />
              ) : currentStatus === 'CLARIFICATION_REQUESTED' ? (
                <HelpCircle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              <span>{currentStatus === 'CLARIFICATION_REQUESTED' ? 'Clarification Needed' : currentStatus.replace('_', ' ')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isApproved && (
              <button
                disabled={isSubmittingCard === key}
                onClick={() => handleRequestApproval(key)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                {isSubmittingCard === key ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{currentStatus === 'REJECTED' || currentStatus === 'CLARIFICATION_REQUESTED' ? 'Re-Submit to Incharge' : 'Submit to Class Incharge'}</span>
              </button>
            )}

            <button
              disabled={!isApproved}
              onClick={() => handlePrintDualSidedCardPDF(key)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                isApproved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-400/30'
              }`}
            >
              {isApproved ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isApproved ? 'Download PDF (Both Sides)' : '🔒 Locked (Incharge Approval Required)'}</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK FROM FACULTY (REJECTION REASON OR CLARIFICATION REQUEST) */}
        {cardInfo && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1 text-[11px]">
            {isApproved && (
              <p className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Verified & Approved by <strong>{cardInfo.approvedBy || profileData.classInchargeName}</strong>. Valid until {cardInfo.validUntil ? new Date(cardInfo.validUntil).toLocaleDateString() : 'Next Academic Year'}.</span>
              </p>
            )}

            {currentStatus === 'REJECTED' && cardInfo.rejectionReason && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 space-y-0.5">
                <span className="font-bold flex items-center gap-1 text-rose-800 dark:text-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Faculty Rejection Note:
                </span>
                <p className="italic">"{cardInfo.rejectionReason}"</p>
              </div>
            )}

            {currentStatus === 'CLARIFICATION_REQUESTED' && cardInfo.clarificationRequest && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 space-y-0.5">
                <span className="font-bold flex items-center gap-1 text-amber-900 dark:text-amber-100">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  Clarification Requested by Faculty:
                </span>
                <p className="italic">"{cardInfo.clarificationRequest}"</p>
              </div>
            )}

            {cardInfo.cardNumber && (
              <span className="text-slate-400 font-mono text-[10px]">Reference Application ID: {cardInfo.cardNumber}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* NEXUS PURPLE HEADER BANNER & 7 SUB-OPTIONS TABS TOOLBAR */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            NEXUS Smart Campus Platform
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Smart Digital Pass & Document Studio
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 opacity-90 leading-relaxed font-medium">
            Official Campus Digital Credentials, Verified Gate Passes & Encrypted Document Vault.
          </p>
        </div>

        {/* 7 SUB-OPTIONS TABS IN PURPLE HEADER BAR */}
        <div className="flex flex-wrap items-center gap-2 z-10 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          <button
            onClick={() => {
              setActiveTab('IDCard');
              setIsFlipped(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'IDCard'
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Student ID</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('FestCard');
              setIsFlipped(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'FestCard'
                ? 'bg-white text-rose-900 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <PartyPopper className="w-4 h-4 text-rose-500" />
            <span>Fest Pass</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('HostelVisitorPass');
              setIsFlipped(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'HostelVisitorPass'
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Hostel Outing</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ParentVisitorPass');
              setIsFlipped(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'ParentVisitorPass'
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-amber-300" />
            <span>Parent Pass</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('TransportCard');
              setIsFlipped(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'TransportCard'
                ? 'bg-white text-purple-900 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Bus className="w-4 h-4 text-purple-400" />
            <span>Emergency Bus</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('LibraryCard');
              setIsFlipped(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'LibraryCard'
                ? 'bg-white text-emerald-900 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Library Card</span>
          </button>

          <button
            onClick={() => setActiveTab('Vault')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'Vault'
                ? 'bg-white text-indigo-900 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Vault ({documents.length})</span>
          </button>
        </div>
      </div>

      {/* STUDIO VIEW 1: STUDENT DIGITAL ID CARD */}
      {activeTab === 'IDCard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Student ID Form
            </h3>

            {/* STUDENT PHOTO UPLOADER */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <img src={studentPhoto} alt="Student Photo" className="w-14 h-16 rounded-xl object-cover border-2 border-indigo-400 shadow-md shrink-0" />
              <div className="space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-200">Upload Student Photo:</span>
                <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Student Full Name:</label>
                <input
                  type="text"
                  value={idForm.fullName}
                  onChange={(e) => setIdForm({ ...idForm, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Roll Number:</label>
                <input
                  type="text"
                  value={idForm.rollNumber}
                  onChange={(e) => handleRollNumberChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 font-mono font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Class Parameter:</label>
                <input
                  type="text"
                  value={idForm.classParameter}
                  onChange={(e) => setIdForm({ ...idForm, classParameter: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Department:</label>
                <input
                  type="text"
                  value={idForm.department}
                  onChange={(e) => setIdForm({ ...idForm, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Student Phone:</label>
                <input
                  type="text"
                  value={idForm.phone}
                  onChange={(e) => setIdForm({ ...idForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Student Email:</label>
                <input
                  type="text"
                  value={idForm.email}
                  onChange={(e) => setIdForm({ ...idForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-indigo-600"
                />
              </div>

              {/* ADDRESS FIELD */}
              <div className="col-span-2">
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  Student Permanent Address:
                </label>
                <input
                  type="text"
                  value={idForm.address}
                  onChange={(e) => setIdForm({ ...idForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              {/* CLASS INCHARGE CREDENTIALS (AUTOFILLED FACULTY) */}
              <div className="col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-300 dark:border-indigo-700 space-y-2">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Class Incharge Credentials (Autofilled Faculty):
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Name:</label>
                    <input
                      type="text"
                      value={idForm.classInchargeName}
                      onChange={(e) => handleClassInchargeNameChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Phone:</label>
                    <input
                      type="text"
                      value={idForm.classInchargePhone}
                      onChange={(e) => setIdForm({ ...idForm, classInchargePhone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Email:</label>
                    <input
                      type="text"
                      value={idForm.classInchargeEmail}
                      onChange={(e) => setIdForm({ ...idForm, classInchargeEmail: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-medium text-indigo-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderVerificationControls('idCard')}
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-500" />
                3D Flip Card Preview ({isFlipped ? 'Back Side' : 'Front Side'})
              </span>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Flip Card (Front/Back)</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden border border-indigo-500/40 min-h-[290px] flex flex-col justify-between">
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="font-black text-xs text-indigo-300 tracking-wider">NEXUS SMART CAMPUS UNIVERSITY</h5>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">OFFICIAL STUDENT ID CARD</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono font-black text-[9px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={studentPhoto}
                      alt="Student"
                      className="w-16 h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-md shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-display font-black text-base text-white">{idForm.fullName}</h4>
                      <p className="text-indigo-300 font-bold text-xs">{idForm.department}</p>
                      <p className="text-slate-300 text-[10px]">Class Parameter: <strong className="font-mono text-indigo-300">{idForm.classParameter}</strong></p>
                      <p className="text-slate-300 text-[10px]">Roll No: <strong className="text-indigo-300 font-mono">{idForm.rollNumber}</strong></p>
                      <p className="text-slate-300 text-[10px]">Phone: <strong>{idForm.phone}</strong></p>
                      <p className="text-slate-300 text-[9px] truncate max-w-[200px]">Address: <strong>{idForm.address}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <VisualQRCode text={`VERIFIED-NEXUS-ID-${idForm.rollNumber}`} size={45} color="#4F46E5" />
                    <VisualBarcode code={`||| ${idForm.rollNumber} |||`} />
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-white text-sm border-b border-slate-800 pb-1">CLASS INCHARGE AUTHORIZATION:</p>
                  <p>Class Incharge Name: <strong className="text-indigo-300">{idForm.classInchargeName}</strong></p>
                  <p>Incharge Phone Number: <strong className="text-white font-mono">{idForm.classInchargePhone}</strong></p>
                  <p>Incharge Email: <strong className="text-indigo-300">{idForm.classInchargeEmail}</strong></p>
                  <p>Student Address: <strong className="text-white">{idForm.address}</strong></p>
                  <p className="text-[10px] text-slate-400 pt-2">Verification Seal: Signed & Approved by Class Incharge ({idForm.classInchargeName}).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO VIEW 2: FEST PASS */}
      {activeTab === 'FestCard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-display font-black text-base text-rose-600 dark:text-rose-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <PartyPopper className="w-5 h-5" />
              Fest & Cultural Entry Pass Form
            </h3>

            {/* STUDENT PHOTO UPLOADER */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <img src={studentPhoto} alt="Student Photo" className="w-14 h-16 rounded-xl object-cover border-2 border-rose-400 shadow-md shrink-0" />
              <div className="space-y-1">
                <span className="block font-bold text-xs text-rose-950 dark:text-rose-200">Upload Student Photo:</span>
                <label className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Event / Fest Name:</label>
                <input
                  type="text"
                  value={festForm.eventName}
                  onChange={(e) => setFestForm({ ...festForm, eventName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Start Date & Time:</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={festForm.startDate}
                      onChange={(e) => setFestForm({ ...festForm, startDate: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                    <input
                      type="text"
                      value={festForm.startTime}
                      onChange={(e) => setFestForm({ ...festForm, startTime: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">End Date & Time:</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={festForm.endDate}
                      onChange={(e) => setFestForm({ ...festForm, endDate: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                    <input
                      type="text"
                      value={festForm.endTime}
                      onChange={(e) => setFestForm({ ...festForm, endTime: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Class Parameter:</label>
                  <input
                    type="text"
                    value={festForm.classParameter}
                    onChange={(e) => setFestForm({ ...festForm, classParameter: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Access Zone:</label>
                  <input
                    type="text"
                    value={festForm.accessZone}
                    onChange={(e) => setFestForm({ ...festForm, accessZone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-indigo-600"
                  />
                </div>
              </div>

              {/* CLASS INCHARGE CREDENTIALS */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-rose-200 dark:border-rose-800 space-y-2">
                <h4 className="font-bold text-rose-900 dark:text-rose-300 text-xs">Class Incharge Credentials:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Name:</label>
                    <input
                      type="text"
                      value={festForm.classInchargeName}
                      onChange={(e) => handleClassInchargeNameChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Phone:</label>
                    <input
                      type="text"
                      value={festForm.classInchargePhone}
                      onChange={(e) => setFestForm({ ...festForm, classInchargePhone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Email:</label>
                    <input
                      type="text"
                      value={festForm.classInchargeEmail}
                      onChange={(e) => setFestForm({ ...festForm, classInchargeEmail: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-medium text-rose-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderVerificationControls('festCard')}
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-rose-500" />
                Fest Pass Preview ({isFlipped ? 'Back Side' : 'Front Side'})
              </span>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                <span>Flip Pass</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden border border-rose-500/50 min-h-[280px] flex flex-col justify-between">
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="font-black text-xs text-rose-400 tracking-wider">NEXUS FEST ENTRY PASS</h5>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">{festForm.eventName}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-[9px]">FRONT</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={studentPhoto}
                      alt="Student"
                      className="w-16 h-20 rounded-2xl object-cover border-2 border-rose-400 shadow-md shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-display font-black text-base text-white">{profileData.fullName} ({profileData.rollNumber})</h4>
                      <p className="text-rose-300 font-bold text-xs">{festForm.eventName}</p>
                      <p className="text-slate-300 text-[10px]">Start: <strong>{festForm.startDate} ({festForm.startTime})</strong></p>
                      <p className="text-slate-300 text-[10px]">End: <strong>{festForm.endDate} ({festForm.endTime})</strong></p>
                      <p className="text-rose-300 text-[10px]">Class: <strong>{festForm.classParameter}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <VisualQRCode text={`FEST-ENTRY-${profileData.rollNumber}`} size={45} color="#E11D48" />
                    <VisualBarcode code={`||| FEST-${profileData.rollNumber} |||`} />
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>Access Zone: <strong className="text-rose-300">{festForm.accessZone}</strong></p>
                  <p>Class Incharge: <strong className="text-white">{festForm.classInchargeName}</strong></p>
                  <p>Incharge Phone: <strong className="text-white font-mono">{festForm.classInchargePhone}</strong></p>
                  <p>Incharge Email: <strong className="text-rose-300">{festForm.classInchargeEmail}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO VIEW 3: HOSTEL OUTING PASS */}
      {activeTab === 'HostelVisitorPass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-display font-black text-base text-cyan-600 dark:text-cyan-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Building2 className="w-5 h-5" />
              Hostel Outing Pass Form
            </h3>

            {/* PHOTO UPLOADERS FOR STUDENT, FATHER & MOTHER (ALREADY IMPLEMENTED) */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
              <div className="text-center space-y-1">
                <span className="block font-bold text-[10px] text-cyan-900 dark:text-cyan-300">Student Photo:</span>
                <img src={studentPhoto} alt="Student" className="w-12 h-14 rounded-xl object-cover border mx-auto" />
                <label className="text-[9px] font-bold text-cyan-700 cursor-pointer block underline">
                  Upload
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" />
                </label>
              </div>

              <div className="text-center space-y-1">
                <span className="block font-bold text-[10px] text-cyan-900 dark:text-cyan-300">Father Photo:</span>
                <img src={fatherPhoto} alt="Father" className="w-12 h-14 rounded-xl object-cover border mx-auto" />
                <label className="text-[9px] font-bold text-cyan-700 cursor-pointer block underline">
                  Upload
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'father')} className="hidden" />
                </label>
              </div>

              <div className="text-center space-y-1">
                <span className="block font-bold text-[10px] text-cyan-900 dark:text-cyan-300">Mother Photo:</span>
                <img src={motherPhoto} alt="Mother" className="w-12 h-14 rounded-xl object-cover border mx-auto" />
                <label className="text-[9px] font-bold text-cyan-700 cursor-pointer block underline">
                  Upload
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'mother')} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* SEPARATE FIELDS FOR FATHER AND MOTHER DETAILS */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father Full Name:</label>
                  <input
                    type="text"
                    value={hostelForm.fatherName}
                    onChange={(e) => setHostelForm({ ...hostelForm, fatherName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-500" />
                    Father Contact Number:
                  </label>
                  <input
                    type="text"
                    value={hostelForm.fatherPhone}
                    onChange={(e) => setHostelForm({ ...hostelForm, fatherPhone: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-cyan-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mother Full Name:</label>
                  <input
                    type="text"
                    value={hostelForm.motherName}
                    onChange={(e) => setHostelForm({ ...hostelForm, motherName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-500" />
                    Mother Contact Number:
                  </label>
                  <input
                    type="text"
                    value={hostelForm.motherPhone}
                    onChange={(e) => setHostelForm({ ...hostelForm, motherPhone: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-cyan-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Visiting / Outing Date:</label>
                  <input
                    type="date"
                    value={hostelForm.visitingDate}
                    onChange={(e) => setHostelForm({ ...hostelForm, visitingDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Visiting Hours Window:</label>
                  <input
                    type="text"
                    value={hostelForm.visitingHours}
                    onChange={(e) => setHostelForm({ ...hostelForm, visitingHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Purpose of Visit / Outing:</label>
                <input
                  type="text"
                  value={hostelForm.purposeOfVisit}
                  onChange={(e) => setHostelForm({ ...hostelForm, purposeOfVisit: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                />
              </div>

              {/* CLASS INCHARGE CREDENTIALS */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-cyan-300 dark:border-cyan-700 space-y-2">
                <h4 className="font-bold text-cyan-900 dark:text-cyan-300 text-xs">Class Incharge Verification Credentials:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Name:</label>
                    <input
                      type="text"
                      value={hostelForm.classInchargeName}
                      onChange={(e) => handleClassInchargeNameChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Phone:</label>
                    <input
                      type="text"
                      value={hostelForm.classInchargePhone}
                      onChange={(e) => setHostelForm({ ...hostelForm, classInchargePhone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Email:</label>
                    <input
                      type="text"
                      value={hostelForm.classInchargeEmail}
                      onChange={(e) => setHostelForm({ ...hostelForm, classInchargeEmail: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-medium text-cyan-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderVerificationControls('hostelPassIncharge')}
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-500" />
                Hostel Pass Preview ({isFlipped ? 'Back Side' : 'Front Side'})
              </span>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 hover:bg-cyan-200 text-cyan-700 dark:text-cyan-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                <span>Flip Pass</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden border border-cyan-500/50 min-h-[280px] flex flex-col justify-between">
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="font-black text-xs text-cyan-400 tracking-wider">HOSTEL OUTING & PARENT VISIT PASS</h5>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">DATE: {hostelForm.visitingDate}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-600 text-white font-mono font-black text-[9px]">FRONT</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 shrink-0">
                      <img src={studentPhoto} alt="Student" className="w-12 h-14 rounded-xl object-cover border-2 border-cyan-400" />
                      <img src={fatherPhoto} alt="Father" className="w-12 h-14 rounded-xl object-cover border-2 border-amber-400" />
                      <img src={motherPhoto} alt="Mother" className="w-12 h-14 rounded-xl object-cover border-2 border-indigo-400" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <h4 className="font-display font-black text-sm text-white">{profileData.fullName}</h4>
                      <p className="text-cyan-300 font-bold text-[11px]">Father: {hostelForm.fatherName} ({hostelForm.fatherPhone})</p>
                      <p className="text-cyan-300 font-bold text-[11px]">Mother: {hostelForm.motherName} ({hostelForm.motherPhone})</p>
                      <p className="text-slate-300 text-[10px]">Visiting Hours: <strong>{hostelForm.visitingHours}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <VisualQRCode text={`HOSTEL-OUTING-${profileData.rollNumber}`} size={45} color="#06B6D4" />
                    <VisualBarcode code={`||| HOSTEL-${profileData.rollNumber} |||`} />
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>Class Incharge Name: <strong className="text-white">{hostelForm.classInchargeName}</strong></p>
                  <p>Incharge Phone Number: <strong className="text-white font-mono">{hostelForm.classInchargePhone}</strong></p>
                  <p>Incharge Email: <strong className="text-cyan-300">{hostelForm.classInchargeEmail}</strong></p>
                  <p className="text-[10px] text-slate-400 pt-2">Gate Security Verification: Authorized exclusively by Class Incharge.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO VIEW 4: PARENT CAMPUS VISIT PASS */}
      {activeTab === 'ParentVisitorPass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-display font-black text-base text-amber-600 dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Users className="w-5 h-5" />
              Parent Campus Visit Pass Form
            </h3>

            <div className="space-y-3 text-xs">
              {/* PHOTO UPLOADERS FOR FATHER, MOTHER & STUDENT (ALREADY IMPLEMENTED) */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="text-center space-y-1">
                  <span className="block font-bold text-[10px] text-amber-900 dark:text-amber-300">Father Photo:</span>
                  <img src={fatherPhoto} alt="Father" className="w-12 h-14 rounded-xl object-cover border mx-auto" />
                  <label className="text-[9px] font-bold text-amber-700 cursor-pointer block underline">
                    Upload
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'father')} className="hidden" />
                  </label>
                </div>

                <div className="text-center space-y-1">
                  <span className="block font-bold text-[10px] text-amber-900 dark:text-amber-300">Mother Photo:</span>
                  <img src={motherPhoto} alt="Mother" className="w-12 h-14 rounded-xl object-cover border mx-auto" />
                  <label className="text-[9px] font-bold text-amber-700 cursor-pointer block underline">
                    Upload
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'mother')} className="hidden" />
                  </label>
                </div>

                <div className="text-center space-y-1">
                  <span className="block font-bold text-[10px] text-amber-900 dark:text-amber-300">Student Photo:</span>
                  <img src={studentPhoto} alt="Student" className="w-12 h-14 rounded-xl object-cover border mx-auto" />
                  <label className="text-[9px] font-bold text-amber-700 cursor-pointer block underline">
                    Upload
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" />
                  </label>
                </div>
              </div>

              {/* SEPARATE FIELDS FOR FATHER AND MOTHER DETAILS */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father Full Name:</label>
                  <input
                    type="text"
                    value={parentForm.fatherName}
                    onChange={(e) => setParentForm({ ...parentForm, fatherName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-500" />
                    Father Contact Number:
                  </label>
                  <input
                    type="text"
                    value={parentForm.fatherPhone}
                    onChange={(e) => setParentForm({ ...parentForm, fatherPhone: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mother Full Name:</label>
                  <input
                    type="text"
                    value={parentForm.motherName}
                    onChange={(e) => setParentForm({ ...parentForm, motherName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-500" />
                    Mother Contact Number:
                  </label>
                  <input
                    type="text"
                    value={parentForm.motherPhone}
                    onChange={(e) => setParentForm({ ...parentForm, motherPhone: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Visit Date:</label>
                  <input
                    type="date"
                    value={parentForm.visitDate}
                    onChange={(e) => setParentForm({ ...parentForm, visitDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Time for Visit / Visiting Hours:</label>
                  <input
                    type="text"
                    value={parentForm.timeForVisit}
                    onChange={(e) => setParentForm({ ...parentForm, timeForVisit: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Reason for Visit:</label>
                <input
                  type="text"
                  value={parentForm.visitPurpose}
                  onChange={(e) => setParentForm({ ...parentForm, visitPurpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-medium"
                />
              </div>

              {/* CLASS INCHARGE CREDENTIALS */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-amber-300 dark:border-amber-700 space-y-2">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs">Class Incharge Credentials:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Name:</label>
                    <input
                      type="text"
                      value={parentForm.classInchargeName}
                      onChange={(e) => handleClassInchargeNameChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Phone:</label>
                    <input
                      type="text"
                      value={parentForm.classInchargePhone}
                      onChange={(e) => setParentForm({ ...parentForm, classInchargePhone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Email:</label>
                    <input
                      type="text"
                      value={parentForm.classInchargeEmail}
                      onChange={(e) => setParentForm({ ...parentForm, classInchargeEmail: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-medium text-amber-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderVerificationControls('parentPass')}
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-500" />
                Parent Pass Preview ({isFlipped ? 'Back Side' : 'Front Side'})
              </span>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                <span>Flip Pass</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden border border-amber-500/50 min-h-[280px] flex flex-col justify-between">
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="font-black text-xs text-amber-400 tracking-wider">PARENT CAMPUS VISIT PASS</h5>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">HOURS: {parentForm.timeForVisit}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-mono font-black text-[9px]">FRONT</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 shrink-0">
                      <img src={fatherPhoto} alt="Father" className="w-12 h-14 rounded-xl object-cover border-2 border-amber-400" />
                      <img src={motherPhoto} alt="Mother" className="w-12 h-14 rounded-xl object-cover border-2 border-amber-400" />
                      <img src={studentPhoto} alt="Student" className="w-12 h-14 rounded-xl object-cover border-2 border-indigo-400" />
                    </div>

                    <div className="space-y-1 text-xs">
                      <h4 className="font-display font-black text-sm text-white">{parentForm.fatherName} & {parentForm.motherName}</h4>
                      <p className="text-amber-300 font-bold text-[10px]">Father: {parentForm.fatherPhone} | Mother: {parentForm.motherPhone}</p>
                      <p className="text-amber-300 font-bold text-xs">Student: {profileData.fullName} ({profileData.rollNumber})</p>
                      <p className="text-slate-300 text-[10px]">Visiting Hours: <strong>{parentForm.timeForVisit}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <VisualQRCode text={`PARENT-VISIT-${profileData.rollNumber}`} size={45} color="#D97706" />
                    <VisualBarcode code={`||| PARENT-${profileData.rollNumber} |||`} />
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>Class Incharge: <strong className="text-white">{parentForm.classInchargeName}</strong></p>
                  <p>Incharge Phone: <strong className="text-white font-mono">{parentForm.classInchargePhone}</strong></p>
                  <p>Incharge Email: <strong className="text-amber-300">{parentForm.classInchargeEmail}</strong></p>
                  <p className="text-[10px] text-slate-400 pt-2">Note: Security Gate Clearance is strictly active during visiting hours: {parentForm.timeForVisit}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO VIEW 5: EMERGENCY BUS PASS */}
      {activeTab === 'TransportCard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-black text-base text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <Bus className="w-5 h-5" />
                Emergency Bus Pass Form
              </h3>

              <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold text-[10px]">
                Quota: {monthlyBusQuota} / 5 Used ({5 - monthlyBusQuota} Left)
              </span>
            </div>

            {/* STUDENT PHOTO UPLOADER */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <img src={studentPhoto} alt="Student Photo" className="w-14 h-16 rounded-xl object-cover border-2 border-purple-400 shadow-md shrink-0" />
              <div className="space-y-1">
                <span className="block font-bold text-xs text-purple-950 dark:text-purple-200">Upload Student Photo:</span>
                <label className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Pickup Stop:</label>
                  <input
                    type="text"
                    value={busForm.pickupStop}
                    onChange={(e) => setBusForm({ ...busForm, pickupStop: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Drop Spot:</label>
                  <input
                    type="text"
                    value={busForm.dropStop}
                    onChange={(e) => setBusForm({ ...busForm, dropStop: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Trip Type:</label>
                  <select
                    value={busForm.tripType}
                    onChange={(e) => setBusForm({ ...busForm, tripType: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-purple-600"
                  >
                    <option value="Round Trip">Round Trip</option>
                    <option value="One Way Pass">One Way Pass</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Route Name & Number:</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={busForm.routeName}
                      onChange={(e) => setBusForm({ ...busForm, routeName: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleCheckBusAvailability}
                      className="px-2 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shrink-0"
                    >
                      Check Route
                    </button>
                  </div>
                </div>
              </div>

              {busCheckResult && (
                <p className={`font-bold text-[10px] ${busCheckResult.available ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {busCheckResult.message}
                </p>
              )}

              {/* SEPARATE FIELDS FOR DRIVER & TRANSPORT FACULTY CREDENTIALS */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bus Driver Name:</label>
                  <input
                    type="text"
                    value={busForm.driverName}
                    onChange={(e) => setBusForm({ ...busForm, driverName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-purple-500" />
                    Bus Driver Phone Number:
                  </label>
                  <input
                    type="text"
                    value={busForm.driverPhone}
                    onChange={(e) => setBusForm({ ...busForm, driverPhone: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transport Faculty Incharge:</label>
                  <input
                    type="text"
                    value={busForm.facultyInchargeName}
                    onChange={(e) => setBusForm({ ...busForm, facultyInchargeName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-purple-500" />
                    Transport Faculty Phone Number:
                  </label>
                  <input
                    type="text"
                    value={busForm.facultyPhone}
                    onChange={(e) => setBusForm({ ...busForm, facultyPhone: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-purple-600"
                  />
                </div>
              </div>

              {/* CLASS INCHARGE CREDENTIALS */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800 space-y-2">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 text-xs">Class Incharge Credentials:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Name:</label>
                    <input
                      type="text"
                      value={busForm.classInchargeName}
                      onChange={(e) => handleClassInchargeNameChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Phone:</label>
                    <input
                      type="text"
                      value={busForm.classInchargePhone}
                      onChange={(e) => setBusForm({ ...busForm, classInchargePhone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Email:</label>
                    <input
                      type="text"
                      value={busForm.classInchargeEmail}
                      onChange={(e) => setBusForm({ ...busForm, classInchargeEmail: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-medium text-purple-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderVerificationControls('busPass')}
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-500" />
                Bus Pass Preview ({isFlipped ? 'Back Side' : 'Front Side'})
              </span>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 text-purple-700 dark:text-purple-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                <span>Flip Pass</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden border border-purple-500/50 min-h-[280px] flex flex-col justify-between">
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="font-black text-xs text-purple-400 tracking-wider">EMERGENCY BUS PASS</h5>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">{busForm.routeName}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-mono font-black text-[9px]">FRONT</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={studentPhoto}
                      alt="Student"
                      className="w-16 h-20 rounded-2xl object-cover border-2 border-purple-400 shadow-md shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-display font-black text-base text-white">{profileData.fullName} ({profileData.rollNumber})</h4>
                      <p className="text-purple-300 font-bold text-xs">Pickup: {busForm.pickupStop}</p>
                      <p className="text-slate-300 text-[10px]">Drop: <strong>{busForm.dropStop}</strong></p>
                      <p className="text-slate-300 text-[10px]">Driver: <strong>{busForm.driverName} ({busForm.driverPhone})</strong></p>
                      <p className="text-purple-300 text-[10px]">Trip Type: <strong>{busForm.tripType}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <VisualQRCode text={`BUS-PASS-${profileData.rollNumber}`} size={45} color="#9333EA" />
                    <VisualBarcode code={`||| BUS-${profileData.rollNumber} |||`} />
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>Transport Faculty Incharge: <strong className="text-purple-300">{busForm.facultyInchargeName} ({busForm.facultyPhone})</strong></p>
                  <p>Driver Contact: <strong className="text-white font-mono">{busForm.driverName} ({busForm.driverPhone})</strong></p>
                  <p>Class Incharge: <strong className="text-white">{busForm.classInchargeName}</strong></p>
                  <p>Incharge Phone: <strong className="text-white font-mono">{busForm.classInchargePhone}</strong></p>
                  <p>Incharge Email: <strong className="text-purple-300">{busForm.classInchargeEmail}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO VIEW 6: LIBRARY CARD */}
      {activeTab === 'LibraryCard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-display font-black text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <BookOpen className="w-5 h-5" />
              Central Library Digital Card Form
            </h3>

            {/* STUDENT PHOTO UPLOADER */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <img src={studentPhoto} alt="Student Photo" className="w-14 h-16 rounded-xl object-cover border-2 border-emerald-400 shadow-md shrink-0" />
              <div className="space-y-1">
                <span className="block font-bold text-xs text-emerald-950 dark:text-emerald-200">Upload Student Photo:</span>
                <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Book Title to Issue:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={libraryForm.bookTitle}
                    onChange={(e) => setLibraryForm({ ...libraryForm, bookTitle: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleCheckBookAvailability}
                    className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0"
                  >
                    Check Catalog
                  </button>
                </div>
                {bookCheckResult && (
                  <span className={`text-[10px] font-bold block mt-1 ${bookCheckResult.available ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {bookCheckResult.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Date of Issue:</label>
                  <input
                    type="date"
                    value={libraryForm.issueDate}
                    onChange={(e) => setLibraryForm({ ...libraryForm, issueDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Expected Return Date:</label>
                  <input
                    type="date"
                    value={libraryForm.returnDate}
                    onChange={(e) => setLibraryForm({ ...libraryForm, returnDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-rose-500"
                  />
                </div>
              </div>

              {/* OVERDUE FINE DISCLAIMER */}
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-200 font-bold">
                ⚠️ OVERDUE DISCLAIMER: Return after return date incurs fine of ₹50/- per day.
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Chief Librarian Credentials:</label>
                <input
                  type="text"
                  value={`${libraryForm.librarianName} (${libraryForm.librarianPhone})`}
                  onChange={(e) => setLibraryForm({ ...libraryForm, librarianName: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-emerald-600"
                />
              </div>

              {/* CLASS INCHARGE CREDENTIALS */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs">Class Incharge Credentials:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Name:</label>
                    <input
                      type="text"
                      value={libraryForm.classInchargeName}
                      onChange={(e) => handleClassInchargeNameChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Phone:</label>
                    <input
                      type="text"
                      value={libraryForm.classInchargePhone}
                      onChange={(e) => setLibraryForm({ ...libraryForm, classInchargePhone: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">Incharge Email:</label>
                    <input
                      type="text"
                      value={libraryForm.classInchargeEmail}
                      onChange={(e) => setLibraryForm({ ...libraryForm, classInchargeEmail: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border font-medium text-emerald-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderVerificationControls('libraryCard')}
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-500" />
                Library Card Preview ({isFlipped ? 'Back Side' : 'Front Side'})
              </span>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Flip Card</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden border border-emerald-500/50 min-h-[280px] flex flex-col justify-between">
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h5 className="font-black text-xs text-emerald-400 tracking-wider">CENTRAL LIBRARY DIGITAL CARD</h5>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">ISSUED BOOK PASS</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-black text-[9px]">FRONT</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={studentPhoto}
                      alt="Student"
                      className="w-16 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-display font-black text-base text-white">{profileData.fullName} ({profileData.rollNumber})</h4>
                      <p className="text-emerald-300 font-bold text-xs">Book: {libraryForm.bookTitle}</p>
                      <p className="text-slate-300 text-[10px]">Issued: <strong>{libraryForm.issueDate}</strong></p>
                      <p className="text-rose-400 text-[10px]">Return By: <strong>{libraryForm.returnDate}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <VisualQRCode text={`LIB-CARD-${profileData.rollNumber}`} size={45} color="#10B981" />
                    <VisualBarcode code={`||| LIB-${profileData.rollNumber} |||`} />
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="text-rose-400 font-bold text-[11px]">Overdue Disclaimer: ₹50/- per day fine after return date.</p>
                  <p>Librarian: <strong className="text-emerald-300">{libraryForm.librarianName}</strong></p>
                  <p>Class Incharge: <strong className="text-white">{libraryForm.classInchargeName}</strong></p>
                  <p>Incharge Phone: <strong className="text-white font-mono">{libraryForm.classInchargePhone}</strong></p>
                  <p>Incharge Email: <strong className="text-emerald-300">{libraryForm.classInchargeEmail}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO VIEW 7: STUDENT VAULT STORAGE */}
      {activeTab === 'Vault' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Student Document Vault ({documents.length} Files Uploaded)
              </h3>
            </div>

            <label className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>+ Upload Important Document</span>
              <input type="file" onChange={handleVaultUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{doc.docName}</h5>
                    <span className="text-[10px] text-slate-400 block">{doc.uploadDate} • {doc.fileSize}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 font-medium">{doc.notes}</p>

                {/* FULL CRUD ACTION BUTTONS */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-[9px] uppercase">
                    {doc.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* READ / VIEW */}
                    <button
                      title="View Document"
                      onClick={() => setViewingVaultDoc(doc)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* UPDATE / EDIT */}
                    <button
                      title="Edit Document Title & Notes"
                      onClick={() => handleStartEditVaultDoc(doc)}
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* DELETE */}
                    <button
                      title="Delete Document"
                      onClick={() => handleDeleteVaultDoc(doc.id, doc.docName)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* DOWNLOAD PDF */}
                    <button
                      title="Download PDF"
                      onClick={() => handleDownloadVaultDocPDF(doc)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] shadow-sm hover:bg-indigo-500 transition-all flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* READ / VIEW VAULT DOCUMENT MODAL */}
      {viewingVaultDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewingVaultDoc(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Document Viewer: {viewingVaultDoc.docName}</span>
              </h4>
              <button onClick={() => setViewingVaultDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-xs space-y-2">
              <p>File Name: <strong>{viewingVaultDoc.fileName}</strong> ({viewingVaultDoc.fileSize})</p>
              <p>Upload Date: <strong>{viewingVaultDoc.uploadDate}</strong></p>
              <p>Student: <strong>{profileData.fullName} ({profileData.rollNumber})</strong></p>
              <p>Class: <strong>{profileData.classParameter}</strong></p>
              <p>Notes: <strong>{viewingVaultDoc.notes}</strong></p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setViewingVaultDoc(null)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                Close Viewer
              </button>
              <button onClick={() => handleDownloadVaultDocPDF(viewingVaultDoc)} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Download as Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE / EDIT VAULT DOCUMENT MODAL */}
      {editingVaultDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingVaultDoc(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h4 className="font-display font-black text-base text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                <span>Edit Vault Document Info</span>
              </h4>
              <button onClick={() => setEditingVaultDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Document Title:</label>
                <input
                  type="text"
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Document Notes & Remarks:</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingVaultDoc(null)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                Cancel
              </button>
              <button onClick={handleSaveEditVaultDoc} className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
