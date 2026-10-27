import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Calendar,
  Building2,
  Stethoscope,
  Download,
} from 'lucide-react';

export interface MedicalCertificateData {
  id?: number;
  applicationRef: string;
  rollNumber: string;
  studentName: string;
  className: string;
  department: string;
  illness: string;
  causeDetails: string;
  conditionType: 'Emergency' | 'Serious / Inpatient Hospitalization' | 'Surgical / Recovery' | 'Contagious Infection' | 'Chronic / Severe Illness';
  startDate: string;
  endDate: string;
  totalDays: number;
  doctorName: string;
  doctorRegNo: string;
  hospitalName: string;
  prescriptionDocUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifierName?: string;
  verificationRemarks?: string;
  createdAt?: string;
}

interface MedicalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rollNumber: string;
  studentName: string;
  className: string;
  department: string;
  onSuccessSubmitted: (cert: MedicalCertificateData) => void;
}

export const MedicalCertificateModal: React.FC<MedicalCertificateModalProps> = ({
  isOpen,
  onClose,
  rollNumber,
  studentName,
  className,
  department,
  onSuccessSubmitted,
}) => {
  const [step, setStep] = useState<'form' | 'pdf_preview'>('form');

  const [form, setForm] = useState({
    illness: 'Dengue Fever & Inpatient Recovery',
    customIllness: '',
    causeDetails: 'Severe high-grade fever with thrombocytopenia requiring 12 days of inpatient hospitalization and bed rest.',
    conditionType: 'Serious / Inpatient Hospitalization' as const,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    doctorName: 'Dr. V. K. Malhotra, M.D. (Medicine)',
    doctorRegNo: 'MCI-REG-849201',
    hospitalName: 'Apollo City Hospital & Medical Research Center',
    clarificationResponse: '',
  });

  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const [totalDays, setTotalDays] = useState<number>(12);
  const [applicationRef] = useState<string>(`MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedCertificate, setSubmittedCertificate] = useState<MedicalCertificateData | null>(null);

  // Calculate total days whenever start date or end date changes
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(isNaN(diffDays) ? 0 : diffDays);
    }
  }, [form.startDate, form.endDate]);

  const isEligibleDuration = totalDays >= 10;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitMedical = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalDays < 10) {
      alert('⚠️ POLICY REJECTION: Medical leave duration is shorter than 10 days. Minimum 10 consecutive calendar days required for attendance relaxation.');
      return;
    }

    if (!form.doctorName || !form.hospitalName) {
      alert('Please fill in Doctor and Hospital details.');
      return;
    }

    setIsSubmitting(true);
    const finalIllness = form.illness === 'Other' ? form.customIllness : form.illness;

    // Sanitize large Base64 images for storage/payload to avoid quota exceeded errors
    const safeDocUrl = prescriptionPreview
      ? prescriptionPreview.length > 50000
        ? 'DOCUMENT_ATTACHED_SAFE'
        : prescriptionPreview
      : undefined;

    const certPayload: MedicalCertificateData = {
      applicationRef,
      rollNumber,
      studentName,
      className,
      department,
      illness: finalIllness,
      causeDetails: form.causeDetails,
      conditionType: form.conditionType,
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays,
      doctorName: form.doctorName,
      doctorRegNo: form.doctorRegNo,
      hospitalName: form.hospitalName,
      prescriptionDocUrl: safeDocUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // 1. Send API Request to Backend
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/attendance/medical/submit', certPayload);
    } catch (err) {
      console.warn('Persisting medical certificate locally.');
    }

    // 2. Safe LocalStorage Storage with error catching for quota limits
    try {
      localStorage.setItem(`nexus_medical_${rollNumber}`, JSON.stringify(certPayload));

      const existingListRaw = localStorage.getItem('nexus_pending_medicals') || '[]';
      const existingList = JSON.parse(existingListRaw);
      existingList.unshift(certPayload);
      localStorage.setItem('nexus_pending_medicals', JSON.stringify(existingList));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, continuing gracefully.');
    }

    // 3. Dispatch real-time events for Faculty Portal
    try {
      window.dispatchEvent(new CustomEvent('nexus:medical-submitted', { detail: certPayload }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    // 4. Guaranteed UI State Update & Transition to PDF Studio Step
    setIsSubmitting(false);
    setSubmittedCertificate(certPayload);
    onSuccessSubmitted(certPayload);
    setStep('pdf_preview');
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto"
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Medical Exemption Certificate Studio</span>
              </h3>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                Application Ref: {applicationRef} • Registered Class: {className}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        {/* STEP 1: MEDICAL APPLICATION FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmitMedical} className="space-y-4 text-xs">
            {/* 10-DAY POLICY MANDATORY BANNER */}
            <div className={`p-4 rounded-2xl border space-y-1 ${
              totalDays >= 10
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'
            }`}>
              <div className="flex items-center justify-between font-extrabold">
                <span className="flex items-center gap-1.5 text-xs">
                  {totalDays >= 10 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />}
                  <span>University Medical Policy Threshold Check:</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono ${totalDays >= 10 ? 'bg-emerald-500 text-white font-black' : 'bg-rose-500 text-white font-black'}`}>
                  {totalDays} Days Calculated Rest
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {totalDays >= 10 ? (
                  <>✓ <strong>Eligible Medical Duration:</strong> Medical rest of {totalDays} days exceeds the 10-day policy requirement. Upon Class Incharge verification, your attendance criteria will be lowered to <strong>65%</strong>.</>
                ) : (
                  <>🚫 <strong>Submission Blocked:</strong> Medical leave shorter than <strong>10 days</strong> is NOT accepted for attendance criteria relaxation under University Ordinance Section 14-B (Minimum 10 consecutive calendar days required).</>
                )}
              </p>
            </div>

            {/* DATES & DURATION CALCULATOR */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-500" /> Medical Leave Start & End Date Selection
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Leave Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Leave End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-indigo-600 dark:text-indigo-400 mb-1">Calculated Days of Rest</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 font-mono font-black text-indigo-600 dark:text-purple-300 text-sm">
                    {totalDays} Days Rest
                  </div>
                </div>
              </div>
            </div>

            {/* ILLNESS & CONDITION DETAILS */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-rose-500" /> Medical Illness & Clinical Diagnosis
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Diagnosis / Illness *</label>
                  <select
                    value={form.illness}
                    onChange={(e) => setForm({ ...form, illness: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Dengue Fever & Inpatient Recovery">Dengue Fever & Inpatient Recovery</option>
                    <option value="Typhoid Fever & Prolonged Bed Rest">Typhoid Fever & Prolonged Bed Rest</option>
                    <option value="Bone Fracture & Orthopedic Surgical Recovery">Bone Fracture & Orthopedic Surgical Recovery</option>
                    <option value="Acute Appendicitis Surgery">Acute Appendicitis Surgery</option>
                    <option value="Severe Viral Hepatitis / Jaundice">Severe Viral Hepatitis / Jaundice</option>
                    <option value="Pneumonia & Respiratory Infection">Pneumonia & Respiratory Infection</option>
                    <option value="Contagious Infection (Chickenpox / Measles)">Contagious Infection (Chickenpox / Measles)</option>
                    <option value="Other">Other Medical Condition (Specify Below)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medical Condition Type *</label>
                  <select
                    value={form.conditionType}
                    onChange={(e) => setForm({ ...form, conditionType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Emergency">Emergency Inpatient Care</option>
                    <option value="Serious / Inpatient Hospitalization">Serious / Inpatient Hospitalization</option>
                    <option value="Surgical / Recovery">Surgical & Post-Op Recovery</option>
                    <option value="Contagious Infection">Contagious Infection Quarantine</option>
                    <option value="Chronic / Severe Illness">Chronic / Severe Illness Treatment</option>
                  </select>
                </div>

                {form.illness === 'Other' && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specify Medical Diagnosis *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spinal Injury & Recommended Physiotherapy Rest"
                      value={form.customIllness}
                      onChange={(e) => setForm({ ...form, customIllness: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Medical Cause & Doctor Recommendations *</label>
                  <textarea
                    rows={2}
                    required
                    value={form.causeDetails}
                    onChange={(e) => setForm({ ...form, causeDetails: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                    placeholder="Enter detailed diagnosis and medical cause..."
                  />
                </div>
              </div>
            </div>

            {/* DOCTOR & HOSPITAL DETAILS */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-purple-500" /> Attending Medical Practitioner & Hospital Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Attending Doctor Name & Qualification *</label>
                  <input
                    type="text"
                    required
                    value={form.doctorName}
                    onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Doctor Medical Council Reg No. *</label>
                  <input
                    type="text"
                    required
                    value={form.doctorRegNo}
                    onChange={(e) => setForm({ ...form, doctorRegNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hospital / Clinic Name & Location *</label>
                  <input
                    type="text"
                    required
                    value={form.hospitalName}
                    onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                  />
                </div>
              </div>
            </div>

            {/* PRESCRIPTION DOCUMENT UPLOAD */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label className="block font-bold text-amber-900 dark:text-amber-300 mb-0.5">
                  Upload Doctor's Prescription & Hospital Discharge Summary *
                </label>
                <p className="text-[11px] text-slate-400">Attach scanned doctor prescription, medical certificate slip, or hospital admission receipt.</p>
              </div>

              <label className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow flex items-center gap-1.5 shrink-0">
                <UploadCloud className="w-4 h-4" />
                <span>{prescriptionPreview ? 'Change Prescription File' : 'Upload Document'}</span>
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {prescriptionPreview && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Prescription Document Uploaded Successfully
                </span>
                <span className="text-slate-400 font-mono text-[10px]">Attached to {applicationRef}</span>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isEligibleDuration || isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-lg flex items-center gap-2 transition-all ${
                  isEligibleDuration
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25'
                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Application...' : 'Submit Medical Certificate to Class Incharge'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OFFICIAL PRINTABLE / DOWNLOADABLE PDF CERTIFICATE PREVIEW */}
        {step === 'pdf_preview' && submittedCertificate && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Medical Exemption Request Dispatched to Class Incharge!</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={handleTriggerPrint}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* FORMAL UNIVERSITY PDF LETTERHEAD PREVIEW CONTAINER */}
            <div id="medical-pdf-content" className="p-8 rounded-3xl bg-white text-slate-900 border-2 border-slate-300 shadow-2xl space-y-6 font-serif text-left">
              {/* LETTERHEAD TOP HEADER */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="font-bold text-xl tracking-tight text-slate-900 uppercase">NEXUS SMART CAMPUS PLATFORM</h1>
                  <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">OFFICIAL ACADEMIC MEDICAL EXEMPTION CERTIFICATE</h2>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Ordinance Section 14-B • Attendance Criteria Relaxation Record</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-slate-900">REF: {submittedCertificate.applicationRef}</div>
                  <div className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                    STATUS: PENDING INCHARGE VERIFICATION
                  </span>
                </div>
              </div>

              {/* STUDENT DEMOGRAPHICS */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Name</span>
                  <strong className="text-sm font-black text-slate-900">{submittedCertificate.studentName}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Roll Number</span>
                  <strong className="text-sm font-mono font-black text-slate-900">{submittedCertificate.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Class & Section</span>
                  <strong className="text-xs font-bold text-slate-800">{submittedCertificate.className}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Academic Department</span>
                  <strong className="text-xs font-bold text-slate-800">{submittedCertificate.department}</strong>
                </div>
              </div>

              {/* MEDICAL DETAILS */}
              <div className="space-y-3 text-xs font-sans">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b pb-1">I. Medical Condition & Attendance Exemption Record</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Primary Diagnosis:</span>
                    <strong className="text-xs text-slate-900">{submittedCertificate.illness}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Condition Classification:</span>
                    <strong className="text-xs text-slate-900">{submittedCertificate.conditionType}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Leave Period:</span>
                    <strong className="text-xs text-slate-900">{submittedCertificate.startDate} to {submittedCertificate.endDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Rest Duration:</span>
                    <strong className="text-xs text-emerald-700 font-mono font-black">{submittedCertificate.totalDays} Consecutive Days (Policy &ge; 10 Days Met)</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 block">Clinical Diagnosis Details:</span>
                    <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">{submittedCertificate.causeDetails}</p>
                  </div>
                </div>
              </div>

              {/* DOCTOR CREDENTIALS */}
              <div className="space-y-2 text-xs font-sans border-t border-slate-200 pt-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b pb-1">II. Attending Medical Officer Certification</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Certifying Doctor:</span>
                    <strong className="text-slate-900">{submittedCertificate.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Medical Reg No:</span>
                    <strong className="font-mono text-slate-900">{submittedCertificate.doctorRegNo}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 block">Hospital / Health Center:</span>
                    <strong className="text-slate-900">{submittedCertificate.hospitalName}</strong>
                  </div>
                </div>
              </div>

              {/* TARGET ATTENDANCE CRITERIA RELAXATION RULE */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-sans space-y-1">
                <strong className="block font-bold">Policy Note on Verification:</strong>
                <p className="text-[11px] leading-relaxed">
                  Upon digital verification and approval by the official Class Incharge of <strong>{submittedCertificate.className}</strong>, the student's mandatory attendance criteria will be formally relaxed from <strong>75.0% down to 65.0%</strong>. If rejected, the criteria remains 75.0%.
                </p>
              </div>

              {/* SIGNATURE & SEAL FOOTER */}
              <div className="pt-8 flex items-end justify-between text-xs font-sans border-t border-slate-300">
                <div>
                  <div className="font-mono text-[10px] text-slate-400 mb-1">DIGITAL BARCODE VERIFICATION</div>
                  <div className="p-2 bg-slate-100 rounded border text-mono text-[9px] text-slate-600">
                    ||||| ||| |||||| ||||| |||| |||||| |||| |||
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-36 border-b border-slate-900 mx-auto" />
                  <span className="font-bold text-slate-900 block text-[11px]">Official Class Incharge Seal</span>
                  <span className="text-[9px] text-slate-500">Nexus Smart Campus Academic Authority</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow hover:bg-slate-800"
              >
                Close Studio
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
