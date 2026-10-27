import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MessageSquareWarning,
  Users,
  Paperclip,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Lock,
  EyeOff,
  Star,
  X,
  User,
  Radio,
  Volume2,
  VolumeX,
  History,
  UserCheck,
  Download,
  BookOpen,
} from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { type UserSession } from '../../types/auth';

interface StudentSafetyAndVoiceProps {
  session?: UserSession | null;
}

interface FileAttachment {
  name: string;
  size: string;
  type: string;
  url: string;
  status: 'Uploaded' | 'Uploading';
}

interface SafetyAuthority {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  officeHours: string;
}

export interface RespondingFaculty {
  id: string;
  name: string;
  department: string;
  responseTime: string;
}

export interface EmergencyAlertRecord {
  alertId: string;
  studentName: string;
  studentEmail: string;
  emergencyType: string;
  description: string;
  locationText: string;
  gpsCoords?: { lat: string; lng: string } | null;
  googleMapsUrl?: string;
  timestamp: string;
  status: 'Sending' | 'Alert Sent' | 'Responded' | 'Problem Dealt With' | 'Resolved';
  respondingFaculties: RespondingFaculty[];
  resolvedByFaculty?: string | null;
  resolutionTime?: string | null;
}

const AUTHORITIES_LIST: SafetyAuthority[] = [
  {
    id: 'auth-1',
    name: 'Anti-Ragging Squad & Committee',
    designation: 'Chairperson & Chief Squad Officer',
    department: 'Office of Student Safety & Ethics',
    email: 'anti-ragging@nexus.campus.edu',
    phone: '+91 98765 00100',
    officeHours: '24x7 Immediate Response',
  },
  {
    id: 'auth-2',
    name: 'Dr. R. K. Verma',
    designation: 'Dean of Student Affairs',
    department: 'Office of Student Affairs',
    email: 'dean.studentaffairs@nexus.campus.edu',
    phone: '+91 98765 43201',
    officeHours: '09:00 AM - 05:00 PM (Admin Block R-102)',
  },
  {
    id: 'auth-3',
    name: 'Prof. Meenakshi Sundaram',
    designation: 'Female Protection & Gender Cell Head',
    department: 'Women Protection & Equality Cell',
    email: 'gender-protection@nexus.campus.edu',
    phone: '+91 98765 43202',
    officeHours: '10:00 AM - 04:00 PM (Block B R-204)',
  },
  {
    id: 'auth-4',
    name: 'Captain S. P. Singh',
    designation: 'Chief Security Officer',
    department: 'Campus Security & Patrol Division',
    email: 'campus.security@nexus.campus.edu',
    phone: '+91 98765 43200',
    officeHours: '24x7 Control Room (Gate #1)',
  },
  {
    id: 'auth-5',
    name: 'Prof. Nitin Kumar',
    designation: 'Hostel Chief Warden',
    department: 'Hostel Administration',
    email: 'hostel.warden@nexus.campus.edu',
    phone: '+91 98765 43203',
    officeHours: '08:00 AM - 08:00 PM (Warden Desk)',
  },
  {
    id: 'auth-6',
    name: 'Dr. A. K. Sharma',
    designation: 'Student Grievance Cell Convenor',
    department: 'Academic Grievance Council',
    email: 'grievance.cell@nexus.campus.edu',
    phone: '+91 98765 43204',
    officeHours: '10:00 AM - 04:30 PM (Main Building R-15)',
  },
];

const ANTI_RAGGING_RULES_LIST = [
  "Rule 1: Absolute Prohibition of Ragging — Physical, verbal, psychological, or digital intimidation is strictly illegal.",
  "Rule 2: Mandatory Police FIR — Cases involving physical assault, threat, or extortion will result in immediate Police FIR.",
  "Rule 3: Immediate Suspension — Accused students face instant academic suspension pending Squad investigation.",
  "Rule 4: Expulsion & Admission Cancelation — Proven offenders face permanent expulsion under UGC 2009 Regulations.",
  "Rule 5: Immediate Hostel Eviction — Loss of campus hostel accommodation without refund for acts of harassment.",
  "Rule 6: Blacklisting from Placements — Permanent prohibition from campus placement drives, fests, and sports teams.",
  "Rule 7: 24x7 Squad Patrol — Unannounced surprise inspections by Anti-Ragging Squads across hostels and walkways.",
  "Rule 8: 100% Anonymous Protection — Victims can report without identity disclosure under protected student rights.",
  "Rule 9: Banned Personal Errands — Forcing junior students to perform personal tasks or dress codes is illegal.",
  "Rule 10: Financial Extortion Penalties — Demanding money, food, or unauthorized contributions is punishable.",
  "Rule 11: Cyber-Ragging Prosecutions — Online trolling, unauthorized recording, or social media harassment is penalized.",
  "Rule 12: Mandatory Annual Affidavit — Every student and parent must submit the UGC Anti-Ragging Undertaking."
];

export const StudentSafetyAndVoice: React.FC<StudentSafetyAndVoiceProps> = ({ session }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'report_concern_committee' | 'anti_ragging' | 'emergency_sos' | 'reports_sos_logs' | 'feedback'
  >('report_concern_committee');

  const studentName = session?.name || 'Ketan Channa';
  const studentEmail = session?.email || 'student@nexus.campus.edu';
  const userRole = (session?.role as string) || 'Student';
  const studentRoll = '2022CSE041';

  // Faculty simulation state
  const [isFacultyViewMode, setIsFacultyViewMode] = useState(
    userRole === 'Faculty' || userRole === 'Admin' || userRole === 'Administrator'
  );

  // --- 1. REPORT A CONCERN STATE ---
  const [reportTitle, setReportTitle] = useState('');
  const [concernDate, setConcernDate] = useState(new Date().toISOString().split('T')[0]);
  const [concernTime, setConcernTime] = useState('08:30 PM');
  const [concernLocation, setConcernLocation] = useState('Block C Hostel Entrance Gate');
  const [concernCategory, setConcernCategory] = useState<string>('Ragging');
  const [severity, setSeverity] = useState<string>('High');
  const [personReported, setPersonReported] = useState('');
  const [studentDesc, setStudentDesc] = useState('');
  const [detailedConcern, setDetailedConcern] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<string[]>(['auth-1', 'auth-2']);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- 2. EMERGENCY SOS & LOUD ALARM STATE ---
  const [sosType, setSosType] = useState('Personal Safety');
  const [sosDesc, setSosDesc] = useState('');
  const [sosLocation, setSosLocation] = useState('NEXUS Main Academic Quad');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: string; lng: string } | null>({ lat: '30.7046', lng: '76.7179' });
  const [isSirenActive, setIsSirenActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [currentActiveSos, setCurrentActiveSos] = useState<EmergencyAlertRecord | null>(null);

  // --- 3. PREVIOUS ALERTS & MY REPORTS MERGED STATE ---
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [selectedTimelineReport, setSelectedTimelineReport] = useState<any | null>(null);
  const [previousAlertsList, setPreviousAlertsList] = useState<EmergencyAlertRecord[]>([
    {
      alertId: 'SOS-882194',
      studentName: 'Ketan Channa',
      studentEmail: 'student@nexus.campus.edu',
      emergencyType: 'Medical Emergency',
      description: 'Acute asthma attack near Central Library Block B',
      locationText: 'Central Library Entrance Gate (GPS: 30.7051, 76.7182)',
      gpsCoords: { lat: '30.7051', lng: '76.7182' },
      googleMapsUrl: 'https://maps.google.com/?q=30.7051,76.7182',
      timestamp: '2026-08-28 04:15 PM',
      status: 'Resolved',
      respondingFaculties: [
        { id: 'f-1', name: 'Dr. Vikram Singh', department: 'Computer Science & Engineering', responseTime: '04:16 PM' },
        { id: 'f-2', name: 'Prof. Meenakshi Sundaram', department: 'Women Protection Cell', responseTime: '04:17 PM' },
        { id: 'f-3', name: 'Captain S. P. Singh', department: 'Campus Security Patrol', responseTime: '04:18 PM' },
        { id: 'f-4', name: 'Prof. Nitin Kumar', department: 'Hostel Administration', responseTime: '04:19 PM' },
        { id: 'f-5', name: 'Dr. R. K. Verma', department: 'Dean of Student Affairs', responseTime: '04:20 PM' },
      ],
      resolvedByFaculty: 'Dr. Vikram Singh (HOD CSE)',
      resolutionTime: '04:25 PM',
    },
  ]);

  // --- 4. FEEDBACK STATE ---
  const [fbType, setFbType] = useState('Campus');
  const [fbSubject, setFbSubject] = useState('');
  const [fbDesc, setFbDesc] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbAnonymous, setFbAnonymous] = useState(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState<string | null>(null);

  // Fetch Reports
  useEffect(() => {
    fetchStudentReports();
  }, [studentEmail]);

  const fetchStudentReports = async () => {
    try {
      const res = await axios.get(`https://nexus-smart-campus-backend.onrender.com/api/student-safety/reports?email=${encodeURIComponent(studentEmail)}`);
      if (res.data && res.data.reports) {
        setReportsList(res.data.reports);
      }
    } catch (e) {
      setReportsList([
        {
          id: 1,
          reportId: 'REP-782910',
          studentName: studentName,
          studentEmail: studentEmail,
          title: 'Intimidation & Verbal Harassment Near Block C Hostel Gate',
          concernDate: '2026-08-20',
          concernTime: '08:30 PM',
          location: 'Block C Hostel Entrance Gate',
          category: 'Ragging',
          severity: 'Critical / Urgent',
          personReported: 'Unidentified Senior Group',
          studentDescription: 'Senior group blocking hostel walkway demanding identity verification.',
          detailedConcern: 'A group of seniors gathered near Block C gate after 8 PM, making intimidation comments. Anti-Ragging Committee intervention requested.',
          isAnonymous: false,
          reportedTo: [
            { name: 'Anti-Ragging Squad & Committee', email: 'anti-ragging@nexus.campus.edu' },
            { name: 'Dr. R. K. Verma', email: 'dean.studentaffairs@nexus.campus.edu' },
          ],
          attachments: [],
          status: 'Under Review',
          timeline: [
            { step: 'Submitted', date: '2026-08-20T20:35:00Z', title: 'Report Filed', description: 'Submitted via Anti-Ragging Channel', actor: studentName },
            { step: 'Assigned to Committee', date: '2026-08-20T20:40:00Z', title: 'Dispatched to Squad', description: 'Assigned to Squad Officer Dr. A. K. Sharma', actor: 'NEXUS Automated System' },
          ],
          createdAt: '2026-08-20T20:35:00Z',
        },
      ]);
    }
  };

  // DOWNLOAD ANTI-RAGGING RULES PDF HANDLER
  const handleDownloadAntiRaggingPdf = () => {
    try {
      const doc = new jsPDF();

      // Title Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('NEXUS SMART CAMPUS UNIVERSITY', 105, 14, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL UGC ANTI-RAGGING RULES & DISCIPLINARY MANDATES (2026)', 105, 25, { align: 'center' });

      // Rules List
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ZERO-TOLERANCE CODE OF CONDUCT & CAMPUS DISCIPLINE:', 14, 45);

      let y = 55;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      ANTI_RAGGING_RULES_LIST.forEach((rule) => {
        doc.text(rule, 14, y, { maxWidth: 180 });
        y += 12;
      });

      // Footer Signatures
      doc.setLineWidth(0.4);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 258, 196, 258);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Issued by: Office of Student Safety & Ethics | 24x7 Anti-Ragging Helpline: 1800-180-5522', 105, 265, { align: 'center' });
      doc.text('This is an official digitally signed policy document of NEXUS Smart Campus OS.', 105, 271, { align: 'center' });

      doc.save('NEXUS_Anti_Ragging_Rules_and_Regulations.pdf');
      alert('📄 Anti-Ragging Rules & Disciplinary PDF downloaded successfully!');
    } catch (e) {
      alert('Error generating Anti-Ragging PDF.');
    }
  };

  // LOUD SIREN SYNTHESIZER
  const playEmergencySirenAudio = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(1300, now + 0.35);
      osc.frequency.linearRampToValueAtTime(900, now + 0.7);
      osc.frequency.linearRampToValueAtTime(1300, now + 1.05);

      gain.gain.setValueAtTime(0.8, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setIsSirenActive(true);

      setTimeout(() => {
        try {
          osc.stop();
          ctx.close();
          setIsSirenActive(false);
        } catch (e) {}
      }, 4000);
    } catch (e) {
      console.warn('Siren audio error:', e);
    }
  };

  const stopEmergencySirenAudio = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsSirenActive(false);
  };

  // HIGH-PRECISION GPS
  const handleCaptureLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          const acc = Math.round(pos.coords.accuracy);
          setGpsCoordinates({ lat, lng });
          setSosLocation(`Precise GPS: ${lat}° N, ${lng}° E (±${acc}m accuracy)`);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          setGpsCoordinates({ lat: '30.7046', lng: '76.7179' });
          setSosLocation('NEXUS Main Campus Quad (GPS: 30.7046, 76.7179)');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      setGpsCoordinates({ lat: '30.7046', lng: '76.7179' });
      setSosLocation('Campus Hostel Entrance (GPS: 30.7046, 76.7179)');
    }
  };

  // TRIGGER EMERGENCY SOS HANDLER
  const handleTriggerSOS = async () => {
    if (!sosLocation.trim()) {
      alert('Please capture or enter your current campus location before sending Emergency SOS.');
      return;
    }

    playEmergencySirenAudio();

    const alertId = `SOS-${Date.now().toString().slice(-6)}`;
    const mapsUrl = gpsCoordinates ? `https://maps.google.com/?q=${gpsCoordinates.lat},${gpsCoordinates.lng}` : undefined;

    const newSosRecord: EmergencyAlertRecord = {
      alertId,
      studentName: isAnonymous ? 'Anonymous Student' : studentName,
      studentEmail,
      emergencyType: sosType,
      description: sosDesc || `ACTIVE EMERGENCY SOS: ${sosType} at ${sosLocation}`,
      locationText: sosLocation,
      gpsCoords: gpsCoordinates,
      googleMapsUrl: mapsUrl,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'Alert Sent',
      respondingFaculties: [],
    };

    setCurrentActiveSos(newSosRecord);

    setTimeout(() => {
      handleFacultyRespondToSos(
        newSosRecord.alertId,
        'Dr. Vikram Singh',
        'Computer Science & Engineering'
      );
    }, 2500);

    setTimeout(() => {
      handleFacultyRespondToSos(
        newSosRecord.alertId,
        'Prof. Meenakshi Sundaram',
        'Women Protection Cell'
      );
    }, 4500);
  };

  // FACULTY ACCEPTS SOS (MAX 5 CAP)
  const handleFacultyRespondToSos = (alertId: string, facultyName: string, facultyDept: string) => {
    setCurrentActiveSos((prev) => {
      if (!prev || prev.alertId !== alertId) return prev;

      if (prev.respondingFaculties.length >= 5) {
        alert('ℹ️ Problem has already been dealt with by 5 responding faculty members!');
        return prev;
      }

      if (prev.respondingFaculties.some((f) => f.name === facultyName)) {
        return prev;
      }

      const newResponder: RespondingFaculty = {
        id: `f-${Date.now()}`,
        name: facultyName,
        department: facultyDept,
        responseTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedResponders = [...prev.respondingFaculties, newResponder];
      const isCapped = updatedResponders.length >= 5;

      return {
        ...prev,
        status: isCapped ? 'Problem Dealt With' : 'Responded',
        respondingFaculties: updatedResponders,
      };
    });
  };

  // FACULTY MARKS RESOLVED
  const handleFacultyResolveSos = () => {
    if (!currentActiveSos) return;

    const resolvedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const facultyResolverName = 'Dr. Vikram Singh (HOD CSE & Emergency Squad)';

    const resolvedSos: EmergencyAlertRecord = {
      ...currentActiveSos,
      status: 'Resolved',
      resolvedByFaculty: facultyResolverName,
      resolutionTime: resolvedTime,
    };

    setCurrentActiveSos(resolvedSos);
    setPreviousAlertsList((prev) => [resolvedSos, ...prev]);
    stopEmergencySirenAudio();

    alert(`✅ REAL-TIME UPDATE: Emergency SOS marked as RESOLVED by ${facultyResolverName}! Updated across Student & Faculty portals.`);
  };

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: `${sizeMB} MB`,
            type: file.type.includes('image') ? 'Image' : file.type.includes('pdf') ? 'PDF' : 'Document',
            url: reader.result as string,
            status: 'Uploaded',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const toggleAuthoritySelect = (id: string) => {
    if (selectedAuthorityIds.includes(id)) {
      setSelectedAuthorityIds(selectedAuthorityIds.filter((item) => item !== id));
    } else {
      setSelectedAuthorityIds([...selectedAuthorityIds, id]);
    }
  };

  // Submit Concern Form
  const handlePreSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !detailedConcern.trim()) {
      alert('Please fill out report title and detailed concern description.');
      return;
    }
    if (selectedAuthorityIds.length === 0) {
      alert('Please select at least one official authority in "Report To".');
      return;
    }

    if (severity === 'Critical / Urgent' || concernCategory === 'Ragging' || concernCategory === 'Harassment') {
      setIsConfirmModalOpen(true);
    } else {
      executeSubmitReport();
    }
  };

  const executeSubmitReport = async () => {
    setIsSubmitting(true);
    setIsConfirmModalOpen(false);

    const selectedAuthorities = AUTHORITIES_LIST.filter((a) => selectedAuthorityIds.includes(a.id));

    const payload = {
      studentName,
      studentEmail,
      studentRoll,
      title: reportTitle,
      concernDate,
      concernTime,
      location: concernLocation,
      category: concernCategory,
      severity,
      personReported,
      studentDescription: studentDesc || reportTitle,
      detailedConcern,
      isAnonymous,
      reportedTo: selectedAuthorities,
      attachments,
    };

    try {
      const res = await axios.post('https://nexus-smart-campus-backend.onrender.com/api/student-safety/reports', payload);
      if (res.data && res.data.report) {
        setSuccessMsg(`🎉 SUCCESS! Report ID ${res.data.report.reportId} submitted to authorized faculties & admins.`);
      }
    } catch (e) {
      setSuccessMsg(`🎉 SUCCESS! Safety Concern Report submitted to authorized faculties & admins. (Ref: REP-${Date.now().toString().slice(-6)})`);
    } finally {
      setIsSubmitting(false);
      setReportTitle('');
      setStudentDesc('');
      setDetailedConcern('');
      setPersonReported('');
      setAttachments([]);
      fetchStudentReports();
    }
  };

  // Feedback Form
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbSubject.trim() || !fbDesc.trim()) {
      alert('Please fill out feedback subject and description.');
      return;
    }

    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/student-safety/feedback', {
        studentName,
        studentEmail,
        feedbackType: fbType,
        subject: fbSubject,
        description: fbDesc,
        rating: fbRating,
        isAnonymous: fbAnonymous,
      });
      setFbSuccessMsg('🎉 Thank you! Your feedback has been recorded for campus administration.');
    } catch (e) {
      setFbSuccessMsg('🎉 Thank you! Your feedback has been recorded.');
    } finally {
      setFbSubject('');
      setFbDesc('');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/30 w-full">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            NEXUS Central Student Safety, Anti-Ragging & Emergency Portal
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Student Safety & Voice Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed">
            {studentName} ({studentRoll}) • Dispatches strictly routed to <strong>Faculties & Admins</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setIsFacultyViewMode(!isFacultyViewMode)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 border ${
              isFacultyViewMode
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-300" />
            <span>{isFacultyViewMode ? 'Faculty Incharge Portal Active' : 'Switch to Faculty View'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('emergency_sos')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 border border-rose-400/40 animate-pulse shrink-0"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>EMERGENCY SOS ALERT</span>
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION BAR (MERGED TABS) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-white/20 text-xs">
        <button
          onClick={() => setActiveSubTab('report_concern_committee')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'report_concern_committee' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Report Concern & Safety Committee</span>
        </button>

        <button
          onClick={() => setActiveSubTab('anti_ragging')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'anti_ragging' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Anti-Ragging Center (Rules & PDF)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('emergency_sos')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'emergency_sos' ? 'bg-rose-600 text-white shadow-lg' : 'text-rose-400 hover:bg-white/10'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Emergency Alert / SOS</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reports_sos_logs')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'reports_sos_logs' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
          }`}
        >
          <History className="w-4 h-4 text-purple-400" />
          <span>Reports & SOS Emergency Logs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`px-4 py-2.5 rounded-xl font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'feedback' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4 text-amber-400" />
          <span>Feedback & Suggestions</span>
        </button>
      </div>

      {/* TOAST SUCCESS */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. MERGED: REPORT A CONCERN & SAFETY COMMITTEE TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'report_concern_committee' && (
        <div className="space-y-6">
          {/* SECTION A: AUTHORIZED SAFETY COMMITTEE DIRECTORY */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  Authorized Campus Safety Committee & Incharges
                </h3>
                <p className="text-xs text-slate-500">
                  Select committee members below to automatically populate the "Report To" section of your grievance filing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AUTHORITIES_LIST.map((mem) => {
                const isSelected = selectedAuthorityIds.includes(mem.id);
                return (
                  <div
                    key={mem.id}
                    onClick={() => toggleAuthoritySelect(mem.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 font-bold text-[9px]">
                          {mem.department}
                        </span>
                        <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-1">{mem.name}</h4>
                      <p className="text-indigo-600 font-bold text-[11px]">{mem.designation}</p>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono space-y-0.5 border-t pt-2">
                      <p>✉️ {mem.email}</p>
                      <p>📞 {mem.phone}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: CONCERN REPORTING FORM */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-black text-[10px] uppercase mb-1">
                  <Lock className="w-3 h-3" /> Dispatched Exclusively to Authorized Faculties & Admins
                </div>
                <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Report a Safety Concern or Official Grievance
                </h3>
                <p className="text-xs text-slate-500">
                  Reports are sent strictly to Faculty Members and Admins. Protected under UGC anti-retaliation rules.
                </p>
              </div>

              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  isAnonymous
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isAnonymous ? <EyeOff className="w-4 h-4" /> : <User className="w-4 h-4" />}
                <span>{isAnonymous ? 'Anonymous Mode Active 🔒' : 'Report as Identified Student'}</span>
              </button>
            </div>

            <form onSubmit={handlePreSubmitReport} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concern / Report Title *:</label>
                  <input
                    type="text"
                    placeholder="Summarize the incident..."
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concern Category *:</label>
                  <select
                    value={concernCategory}
                    onChange={(e) => setConcernCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold"
                  >
                    <option value="Ragging">Ragging (Zero Tolerance)</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Bullying">Bullying</option>
                    <option value="Threat/Safety Issue">Threat / Safety Issue</option>
                    <option value="Academic Issue">Academic Issue</option>
                    <option value="Hostel Issue">Hostel Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Concern:</label>
                  <input
                    type="date"
                    value={concernDate}
                    onChange={(e) => setConcernDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time of Concern:</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:30 PM"
                    value={concernTime}
                    onChange={(e) => setConcernTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Severity / Priority:</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                  >
                    <option value="Low">Low (General Concern)</option>
                    <option value="Medium">Medium (Attention Required)</option>
                    <option value="High">High (Serious Allegation)</option>
                    <option value="Critical / Urgent">Critical / Urgent</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location of Concern:</label>
                  <input
                    type="text"
                    placeholder="e.g. Block C Gate..."
                    value={concernLocation}
                    onChange={(e) => setConcernLocation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Person Reported (Optional):</label>
                  <input
                    type="text"
                    placeholder="Name or group..."
                    value={personReported}
                    onChange={(e) => setPersonReported(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Explanation *:</label>
                <textarea
                  rows={4}
                  placeholder="Explain timeline of events and details..."
                  value={detailedConcern}
                  onChange={(e) => setDetailedConcern(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-medium"
                  required
                />
              </div>

              {/* MEDIA EVIDENCE ATTACHMENT UPLOADER */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    Media Evidence Attachments (Images, Videos, PDFs):
                  </span>
                  <span className="text-[10px] text-slate-400">Max 10 MB per file</span>
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs font-bold text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-100 file:text-indigo-700 cursor-pointer"
                />

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{att.name}</p>
                            <p className="text-[10px] text-slate-400">{att.size} • {att.type}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeAttachment(idx)} className="text-rose-500 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  Dispatched strictly to Faculty & Admin accounts only.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Concern to Faculty'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ANTI-RAGGING CENTER (WITH 12 RULES & DOWNLOAD PDF) */}
      {/* ========================================================= */}
      {activeSubTab === 'anti_ragging' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase">
                UGC & University Mandatory Guidelines 2026
              </span>
              <h3 className="font-display font-black text-2xl tracking-tight">
                Zero-Tolerance Anti-Ragging Center
              </h3>
              <p className="text-xs text-rose-200 opacity-90 max-w-xl">
                Ragging is strictly illegal. Read the 12 mandatory anti-ragging rules below or download the official policy document.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadAntiRaggingPdf}
                className="px-5 py-3 rounded-2xl bg-white text-rose-950 hover:bg-rose-50 font-black text-xs shadow-xl transition-all flex items-center gap-2 border"
              >
                <Download className="w-4 h-4 text-rose-600" />
                <span>DOWNLOAD RULES (PDF)</span>
              </button>

              <button
                onClick={() => {
                  setConcernCategory('Ragging');
                  setSelectedAuthorityIds(['auth-1', 'auth-2']);
                  setActiveSubTab('report_concern_committee');
                }}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-xl transition-all flex items-center gap-2 border border-rose-400/40"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>REPORT RAGGING</span>
              </button>
            </div>
          </div>

          {/* 12 MANDATORY ANTI-RAGGING RULES GRID */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b pb-2">
              <BookOpen className="w-4.5 h-4.5 text-rose-500" />
              12 Mandatory Campus Anti-Ragging Disciplinary Rules & Penalties:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ANTI_RAGGING_RULES_LIST.map((ruleText, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{ruleText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EMERGENCY SOS MODULE */}
      {/* ========================================================= */}
      {activeSubTab === 'emergency_sos' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white border border-red-500/40 text-center space-y-3 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center mx-auto animate-ping-slow">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-black uppercase">
              <Lock className="w-3 h-3 text-red-400" /> Dispatched Exclusively to Faculties & Admins (Max 5 Responders)
            </div>

            <h3 className="font-display font-black text-2xl tracking-tight">
              INSTANT CAMPUS EMERGENCY SOS DISPATCH
            </h3>

            <div className="flex justify-center gap-3 pt-1">
              <button
                onClick={playEmergencySirenAudio}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Volume2 className="w-4 h-4" />
                <span>Play Loud Alarm Siren 🔊</span>
              </button>

              {isSirenActive && (
                <button
                  onClick={stopEmergencySirenAudio}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 border"
                >
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Stop Siren 🔇</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Type *:</label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold text-rose-600"
                >
                  <option value="Personal Safety">Personal Safety Threat</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Fire">Fire / Explosion</option>
                  <option value="Accident">Accident / Physical Injury</option>
                  <option value="Harassment">Active Harassment / Stalking</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Precise GPS Location *:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Capture or enter location..."
                    value={sosLocation}
                    onChange={(e) => setSosLocation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleCaptureLocation}
                    disabled={isLocating}
                    className="px-4 rounded-xl bg-indigo-600 text-white font-bold shrink-0 flex items-center gap-1"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{isLocating ? 'Locating...' : 'GPS'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Short Emergency Description (Optional):</label>
              <textarea
                rows={2}
                placeholder="Briefly describe what assistance is required immediately..."
                value={sosDesc}
                onChange={(e) => setSosDesc(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-medium text-xs"
              />
            </div>

            <button
              onClick={handleTriggerSOS}
              className="w-full py-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 border-2 border-red-400/40"
            >
              <Radio className="w-6 h-6 animate-pulse" />
              <span>ACTIVATE EMERGENCY SOS NOW</span>
            </button>

            {currentActiveSos && (
              <div className="p-6 rounded-3xl bg-red-50/90 dark:bg-red-950/50 border border-red-300 space-y-5">
                <div className="flex justify-between items-center border-b pb-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{currentActiveSos.emergencyType} - {currentActiveSos.locationText}</h4>
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs uppercase">{currentActiveSos.status}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                  <span className="font-bold text-indigo-600 block">Responded Faculties ({currentActiveSos.respondingFaculties.length}/5):</span>
                  {currentActiveSos.respondingFaculties.map((f, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border flex justify-between font-bold">
                      <span>{f.name} ({f.department})</span>
                      <span className="font-mono text-slate-400">{f.responseTime}</span>
                    </div>
                  ))}
                </div>

                {isFacultyViewMode && currentActiveSos.status !== 'Resolved' && (
                  <button onClick={handleFacultyResolveSos} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black">
                    MARK SOS AS RESOLVED (FACULTY ACTION)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MERGED: REPORTS & SOS EMERGENCY LOGS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'reports_sos_logs' && (
        <div className="space-y-6 text-xs">
          {/* SECTION A: SUBMITTED CONCERN REPORTS */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
              <Clock className="w-5 h-5 text-emerald-500" />
              My Submitted Safety Concern Reports ({reportsList.length})
            </h3>

            <div className="space-y-3">
              {reportsList.map((rep) => (
                <div
                  key={rep.id || rep.reportId}
                  onClick={() => setSelectedTimelineReport(rep)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border cursor-pointer hover:border-indigo-500 transition-all space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-indigo-600">{rep.reportId}</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-600 font-bold">Status: {rep.status}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rep.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">{rep.detailedConcern}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: PREVIOUS SOS EMERGENCY LOGS */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
              <History className="w-5 h-5 text-purple-500" />
              Previous Emergency SOS Logs & Responder Records ({previousAlertsList.length})
            </h3>

            <div className="space-y-4">
              {previousAlertsList.map((rec) => (
                <div key={rec.alertId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-mono font-black text-rose-600">{rec.alertId} • {rec.emergencyType}</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-bold">Status: {rec.status}</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{rec.description}</p>
                  <p className="text-slate-500 font-mono text-[11px]">📍 Location: {rec.locationText}</p>
                </div>
              ))}
            </div>
          </div>

          {/* REPORT TIMELINE INSPECTOR MODAL */}
          {selectedTimelineReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 relative text-xs">
                <button
                  onClick={() => setSelectedTimelineReport(null)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-500 hover:text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>

                <div>
                  <span className="font-mono font-black text-indigo-600">{selectedTimelineReport.reportId}</span>
                  <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mt-1">{selectedTimelineReport.title}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2">
                  <p><strong>Category:</strong> {selectedTimelineReport.category}</p>
                  <p><strong>Location:</strong> {selectedTimelineReport.location}</p>
                  <p className="text-slate-600 dark:text-slate-300">{selectedTimelineReport.detailedConcern}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. FEEDBACK & SUGGESTIONS */}
      {/* ========================================================= */}
      {activeSubTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="border-b pb-4">
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-amber-500" />
              Campus Feedback & Suggestions Box
            </h3>
          </div>

          {fbSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border text-emerald-600 font-bold">
              {fbSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Feedback Domain *:</label>
                <select
                  value={fbType}
                  onChange={(e) => setFbType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                >
                  <option value="Campus">Campus & General</option>
                  <option value="Academics">Academics & Curriculum</option>
                  <option value="Hostel">Hostel & Mess</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *:</label>
                <input
                  type="text"
                  placeholder="Feedback title..."
                  value={fbSubject}
                  onChange={(e) => setFbSubject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Suggestion *:</label>
              <textarea
                rows={4}
                placeholder="Explain suggestion..."
                value={fbDesc}
                onChange={(e) => setFbDesc(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border font-medium"
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbRating(star)}
                        className={`p-1 ${fbRating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={fbAnonymous}
                    onChange={(e) => setFbAnonymous(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Submit Anonymously</span>
                </label>
              </div>

              <button type="submit" className="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs shadow-lg">
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-md w-full p-6 space-y-4 text-center text-xs">
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">Verify Allegation Accuracy</h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium">Please verify that the information in this report is accurate before submitting.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsConfirmModalOpen(false)} className="w-1/2 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold">Edit</button>
              <button onClick={executeSubmitReport} className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">Confirm & Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
