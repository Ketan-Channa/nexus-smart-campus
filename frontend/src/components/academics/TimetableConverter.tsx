import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Search,
  Calendar,
  Clock,
  User,
  MapPin,
  GraduationCap,
  Sparkles,
  BookOpen,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  Coffee,
  Building,
  Timer,
  AlertTriangle,
  ShieldAlert,
  Award,
  RefreshCcw,
  Plus,
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { VacantVenueFinder } from './VacantVenueFinder';
import { RoomAvailabilityTimeline } from './RoomAvailabilityTimeline';
import { FacultySearchModule } from './FacultySearchModule';
import { TimetableNotificationToast } from './TimetableNotificationToast';

export interface TimetableEntry {
  id: string;
  timetableId?: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  date?: string;
  startTime: string;
  endTime: string;
  slotName: string;
  subject: string;
  code: string;
  teacher: string;
  canonicalFacultyKey?: string;
  className: string;
  canonicalClassKey?: string;
  room: string;
  canonicalVenueKey?: string;
  type: 'Lecture' | 'Lab' | 'Project' | 'Seminar' | 'Break';
  slotType?: 'LECTURE' | 'BREAK' | 'FREE' | 'SPECIAL_EVENT';
  breakType?: 'TEA' | 'LUNCH' | null;
}

export interface StoredTimetableMeta {
  timetableId?: string;
  fileName: string;
  uploadedAt: string;
  uploaderName: string;
  uploaderRole: string;
  totalLectures: number;
  selectedClass: string;
}

export const toCanonicalKey = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/[\s\.\-\_\(\)]/g, '').trim();
};

export const parseMinsFromAnyTimeString = (timeStr: string): number => {
  if (!timeStr) return 0;
  const upper = timeStr.trim().toUpperCase();

  const match = upper.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  const isPM = upper.includes('PM');
  const isAM = upper.includes('AM');

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  } else if (!isPM && !isAM) {
    if (hours >= 1 && hours <= 5) {
      hours += 12;
    }
  }

  return hours * 60 + minutes;
};

export const formatTeacherCode = (teacherName: string): string => {
  if (!teacherName) return '';
  return teacherName.replace(/\s*\([^)]*\)/g, '').trim();
};

export const isGarbledText = (str: string): boolean => {
  if (!str) return false;
  if (
    str.includes('PK\x03\x04') ||
    str.includes('xl/workbook') ||
    str.includes('[Content_Types]') ||
    str.includes('w*') ||
    str.includes('y)YI') ||
    str.includes('/Type') ||
    str.includes('/Font') ||
    str.includes('FlateDecode')
  ) {
    return true;
  }
  const nonAsciiCount = (str.match(/[^\x20-\x7E\s]/g) || []).length;
  return str.length > 0 && nonAsciiCount / str.length > 0.15;
};

export const isValidClassName = (className: string): boolean => {
  if (!className || className.length < 3 || className.length > 50) return false;
  const upper = className.toUpperCase().trim();

  // Reject PDF / System binary syntax tokens
  if (
    upper.includes('/') ||
    upper.includes('\\') ||
    upper.includes('%') ||
    upper.includes('<') ||
    upper.includes('>') ||
    upper.includes('OBJ') ||
    upper.includes('STREAM') ||
    upper.includes('FONT') ||
    upper.includes('FILTER') ||
    upper.includes('MEDIABOX') ||
    upper.includes('TRAILER') ||
    upper.includes('CATALOG') ||
    upper.includes('PAGES') ||
    upper.includes('XREF') ||
    upper.includes('INDEX')
  ) {
    return false;
  }

  return true;
};

const TIME_SLOT_DEFS = [
  { name: 'Slot I (09:00-10:00 AM)', start: '09:00 AM', end: '10:00 AM' },
  { name: 'Slot II (10:05-11:05 AM)', start: '10:05 AM', end: '11:05 AM' },
  { name: 'Slot III (11:25-12:25 PM)', start: '11:25 AM', end: '12:25 PM' },
  { name: 'Slot IV (12:30-01:30 PM)', start: '12:30 PM', end: '01:30 PM' },
  { name: 'Slot V (01:35-02:35 PM)', start: '01:35 PM', end: '02:35 PM' },
  { name: 'Slot VI (02:40-03:40 PM)', start: '02:40 PM', end: '03:40 PM' },
  { name: 'Slot VII (03:40-04:40 PM)', start: '03:40 PM', end: '04:40 PM' },
];

const TIME_SLOT_OPTIONS = [
  'All Time Slots',
  '09:00 AM - 10:00 AM (Slot I)',
  '10:05 AM - 11:05 AM (Slot II)',
  '11:25 AM - 12:25 PM (Slot III)',
  '12:30 PM - 01:30 PM (Slot IV)',
  '01:35 PM - 02:35 PM (Slot V)',
  '02:40 PM - 03:40 PM (Slot VI)',
  '03:40 PM - 04:40 PM (Slot VII)',
];

// OFFICIAL DEPARTMENT TIMETABLE REFERENCE DATA (W.E.F. 27th JULY 2026)
export const OFFICIAL_RAW_TIMETABLE_TEXT = `
========================================
MONDAY
========================================
BCA 1A: CA(KP,ET-503) | [Tea] | MATHS(SIM,ET-602) | [Lunch] | ENG(SGK,ET-101) | OA LAB(SPK,MTCL-3) | HVPE(NISHA,ET-101)
BCA 1B: CA(MND,ET-103) | HVPE(DR.KUSUM,ET-410) | [Lunch] | MATHS(SIM,ET-302)
BCA 1C: HVPE(DR.KUSUM,ET-602) | OA LAB(SPK,MTCL-3) | [Lunch] | MATHS(DMK,ET-102) | ENG(PARNEET,ET-301)
BCA 1D: PST LAB(SRB,ETCC-304) | PST LAB(SRB,ETCC-304) | [Lunch] | HVPE(NAVAN,ET-203) | EVS(ET-203) | PST TH(SRB,ET-203)
BCA 1E: HVPE(NAVAN,ET-602) | [Lunch] | OA LAB(JHN,MTCL-3) | ENG(PARNEET,ET-401)
BCA 2A: PY-LAB(PBJ,MTCL-2) | PY-LAB(PBJ,MTCL-2) | DBMS1-TH(KVB,ET-201) | [Lunch] | DS2 TH(HSK,ET-201) | TSH(ET-201) | SE TH(PRK,ET-203)
BCA 2B: PY-LAB(SNK,ETCC-407) | DS2-TH(NVG,ET-202) | [Lunch] | KJS(ET-202)
BCA 2C: PY-LAB(SHK,PHCL) | PY-LAB(SHK,PHCL) | DBMS1-TH(PBJ,ET-203) | [Lunch] | SE-TH(SPK,ET-301) | KJS(ET-202)
BCA 2D: PY-LAB(JHN,ETCC-209) | PY-LAB(JHN,ETCC-209) | DS2-LAB(SNK,MTCL-2) | SE-TH(KJS,ET-201) | [Lunch] | HMS(ET-501)
BCA 3A: CC-TH(CHK,ET-310) | JAVA-TH(SNL,ET-201) | [Lunch] | MP-LAB(SRB,ETCC-209) | PHP-TH(HMS,ET-502) | DWM-TH(NVK,ET-303) | JAVA LAB(HMG,ETCC-607)
BCA 3B: JAVA-TH(SNT,ET-410) | DWM-TH(NVK,ET-410) | CC-TH(TSH,ET-301) | PHP-LAB(PRT,MTCL-2) | [Lunch] | PHP-TH(PRT,ET-102)
BCA 3C: JAVA-LAB(NRN,ETCC-407) | JAVA-TH(NRN,ET-310) | DWM-TH(HMG,ET-302) | MPD-TH(SHK,ET-302) | [Lunch] | CC-TH(RNJ,ET-302) | JAVA-LAB(NRN,ETCC-304)
BCA 3D: PHP-TH(NVK,ET-202) | DWM-TH(HMG,ET-202) | CC-TH(RSH,ET-401) | [Lunch] | JAVA LAB(SNK,MTCL-2) | JAVA LAB(SNK,MTCL-2)
BCA 3E: JAVA-TH(SNL,ET-203) | PHP-TH(HMS,ET-203) | PHP-LAB(HMS,ETCC-209) | [Lunch] | MP-LAB(HMG,PHCL) | CC TH(RSH,ET-310)
BTECH CSE 1A: CHM(NK,ET-101) | Math(Prerna,ET-101) | English(NN,ET-101) | PPS TH(NSA,ET-101) | [Lunch] | Workshop G1
BTECH CSE 1B: English(NN,ET-102) | Math(DMK,ET-102) | CHM(NK,ET-102) | [Lunch] | PPS LAB(MND,ETCC-304) | PPS LAB(MND,ETCC-304)
BTECH CSE 1C: BEE(TNT,ET-103) | Math(PK,SH-2) | [Lunch] | MPD(TNT,ET-103) | PHY(NJK,ET-103)
BTECH CSE 1D: PHY(NJK,ET-201) | Math(PK,SH-2) | BEE(TNT,ET-103) | [Lunch] | AUTOCAD(ETCC-209)
BTECH CSE 2A: MATH3-TH(DMK,ET-301) | OOP-TH(KJS,ET-301) | ITWS-LAB(ISH,ETCC-507) | ITWS-LAB(ISH,ET-507) | [Lunch] | DSA-TH(SJL,ET-403) | DE-LAB(KVB,ETCC-209)
BTECH CSE 2B: DSA-TH(NSA,ET-302) | DE-TH(KP,ET-302) | OOP-TH(SNL,ET-402) | [Lunch] | MATH3-TH(PRN,ET-402) | DOS(VM,ET-401)
BTECH AIML 2C: MATH3-TH(SIM,ET-303) | OOP-TH(NSA,ET-303) | DE-TH(SMB,ET-502) | [Lunch] | OOPS LAB(NSA,ETCC-507) | DSA-LAB(SRP,ETCC-507) | DSA-LAB(SRP,ETCC-507)
BTECH AIML 2D: DSA-TH(HSK,ET-401) | DOS(VM,ET-510) | [Lunch] | ITWS-LAB(NDA,ETCC-407) | OOP-LAB(ISH,PHCL)
BTECH CSE 3A: CN-TH(HSD,ET-402) | FLAT-TH(HSK,ET-402) | SE-LAB(PRK,ETCC-407) | [Lunch] | COI-TH(NK,ET-303) | DBMS-LAB(NRN,ETCC-407) | PYE-LAB(JHN,ETCC-407)
BTECH CSE 3B: PYE-TH(ISH,ET-403) | FLAT-TH(SJL,ET-403) | COI TH(DR.NJK,ET-501) | [Lunch] | CN LAB(KMK,ETCC-407) | DBMS-TH(SMB,ET-402)
BTECH CSE 3C: ERP-TH(PRK,ET-501) | CN-TH(RSH,ET-501) | FLAT-TH(SRP,ET-403) | [Lunch] | CN-LAB(RSH,ETCC-607) | SE-LAB(HSD,ETCC-607) | COI TH(DR.NJK,ET-201)
BTECH AIML 3: AI-TH(TSH,ET-502) | FLAT-TH(SRP,ET-502) | TAB-TH(KMK,ET-303) | AI LAB(TSH,ETCC-304) | [Lunch] | RSTAT-TH(HSK,ET-101)
BTECH CSE 4A: PROJECT(PRT,ETCC-607) | PROJECT(PRT,ETCC-607) | AGILE-LAB(RNJ,ETCC-607) | BCT-LAB(SMB,ETCC-607)
BTECH CSE 4B: PROJECT(HMS,ETCC-507) | DMW-TH(PRK,ET-401) | NSC-TH(KP,ET-503) | [Lunch]
BTECH CSE 4C: BCT-LAB(SMB,ETCC-507) | PROJECT(MND,ETCC-304) | AGILE-TH(RNJ,ET-202)

========================================
TUESDAY
========================================
BCA 1A: CA(KP,ET-103) | [Lunch] | PST TH(SRP,ET-302)
BCA 1B: PST TH(NRN,ET-402) | HVPE(DR.KUSUM,ET-501) | [Lunch] | ENG(SGK,ET-102) | OA LAB(KVB,MTCL-3)
BCA 1C: PST TH(MND,ET-410) | HVPE(DR.KUSUM,ET-410) | [Lunch] | PST LAB(MND,ETCC-607) | PST LAB(MND,ETCC-607)
BCA 1D: HVPE(NAVAN,ET-602) | [Lunch] | ENG(PARNEET,ET-102) | MATHS(RPK,ET-101) | PST LAB(SRB,ETCC-607)
BCA 1E: PST TH(SRB,ET-301) | CA(KVB,ET-301) | HVPE(NAVAN,ET-302) | [Lunch]
BCA 2A: PY-LAB(PBJ,MTCL-2) | PY-LAB(PBJ,MTCL-2) | DBMS1-TH(KVB,ET-402) | [Lunch] | SE LAB(PRK,PHCL) | TSH(ET-201) | DS LAB(HSK,ETCC-407)
BCA 2B: PY-LAB(SNK,PHCL) | PY-LAB(SNK,PHCL) | DBMS1-TH(PBJ,ET-310) | SE-TH(SPK,ET-402) | [Lunch] | KJS(ET-202)
BCA 2C: PY-LAB(SHK,ETCC-209) | PY-LAB(SHK,ETCC-209) | DS2-LAB(NVG,ETCC-209) | [Lunch] | SE-TH(SPK,ET-203) | KJS(ET-202)
BCA 2D: PY-LAB(JHN,ETCC-304) | PY-LAB(JHN,ETCC-304) | SE-LAB(KJS,MTCL-2) | [Lunch] | PY TH(JHN,ET-310) | HMS(ET-401)
BCA 3A: CC-LAB(CHK,ETCC-607) | CC-LAB(CHK,ETCC-607) | JAVA-TH(SNL,ET-202) | MP-LAB(SRB,ETCC-407) | [Lunch] | DWM-TH(NVK,ET-501) | PHP-TH(HMS,ET-501)
BCA 3B: JAVA-LAB(SNT,ETCC-507) | JAVA-LAB(SNT,ETCC-507) | PHP-TH(PRT,ET-410) | CC-TH(TSH,ET-301) | [Lunch] | JAVA TH(SNT,ET-310) | DWM-TH(NVK,ET-310)
BCA 3C: PHP-TH(PRT,ET-302) | DWM-TH(HMG,ET-302) | JAVA-LAB(NRN,ETCC-607) | JAVA-TH(NRN,ET-501) | [Lunch] | CC-TH(RNJ,ET-403)
BCA 3D: DWM-TH(HMG,ET-303) | PHP-TH(NVK,ET-303) | JAVA-TH(SNK,ET-303) | CC-TH(RSH,ET-303) | [Lunch] | JAVA LAB(SNK,MTCL-2) | JAVA LAB(SNK,MTCL-2)
BCA 3E: JAVA-TH(SNL,ET-401) | DWM-TH(KJS,ET-401) | PHP-TH(HMS,ET-401) | [Lunch] | MP-LAB(HMG,MTCL-2) | CC LAB(RSH,ETCC-209) | CC LAB(RSH,ETCC-209)
BTECH CSE 1A: PPS TH(NSA,ET-101) | English(NN,ET-101) | CHM(NK,ET-101) | [Lunch] | PPS LAB(NSA,ETCC-304) | PPS LAB(NSA,ETCC-304)
BTECH CSE 1B: CHM(NK,ET-102) | PPS TH(MND,ET-102) | Maths(DMK,ET-102) | [Lunch] | Workshop G2/CHM Lab G1
BTECH CSE 1C: PHY(NJK,ET-103) | Math(PK,SH-2) | EGD(SS,ET-211) | [Lunch] | E Cell 101
BTECH CSE 1D: BEE(TNT,ET-201) | Math(PK,SH-2) | PHY(NJK,ET-103) | [Lunch] | E Cell 101
BTECH CSE 2A: DE-TH(KMK,ET-201) | [Lunch] | MATH3-TH(DMK,ET-310) | DOS(ARS,ET-303) | DSA-TH(SJL,ET-301)
BTECH CSE 2B: OOP-TH(SNL,ET-402) | DE-LAB(KP,ETCC-304) | [Lunch] | MATH3-TH(PRN,ET-402) | DOS(VM,ET-402) | OOPS LAB(SHK,ETCC-304)
BTECH AIML 2C: DSA-TH(SRP,ET-403) | OOP-TH(NSA,ET-403) | MATH3-TH(SIM,ET-403) | [Lunch] | DE-TH(SMB,ET-202)
BTECH AIML 2D: DE-TH(KMK,ET-203) | MATH3-TH(SIM,ET-203) | OOP-TH(ISH,ET-203) | DSA-LAB(HSK,ETCC-507) | [Lunch]
BTECH CSE 3A: FLAT-TH(HSK,ET-202) | SE-TH(PRK,ET-202) | PYE-LAB(JHN,ETCC-407) | [Lunch] | CN-TH(HSD,ET-201) | DBMS-LAB(NRN,ETCC-507) | DBMS-LAB(NRN,ETCC-507)
BTECH CSE 3B: DBMS-TH(SMB,ET-310) | FLAT-TH(SJL,ET-310) | ERP-TH(TSH,ET-301) | PYE-LAB(ISH,ETCC-304) | [Lunch] | COI TH(DR.NJK,ET-302)
BTECH CSE 3C: CN-TH(RSH,ET-501) | FLAT-TH(SRP,ET-501) | DBMS-TH(CHK,ET-502) | [Lunch] | PYE-LAB(SHK,ETCC-209) | SE-TH(HSD,ET-303)
BTECH AIML 3: AI TH(TSH,ET-502) | DBMS-TH(PRT,ET-502) | RSTAT-LAB(HSK,ETCC-507) | [Lunch] | TAB-LAB(KMK,ETCC-407) | FLAT-TH(SRP,ET-203) | PYAI-TH(ISH,ET-303)
BTECH CSE 4A: DMW-TH(PRK,ET-503) | BCT-TH(SMB,ET-503) | NSC-TH(HSD,ET-503) | [Lunch] | RNJ(ETCC-507) | PROJECT(PRT,ETCC-407)
BTECH CSE 4B: PROJECT(HMS,ETCC-407) | PROJECT(HMS,ETCC-407) | BCT TH(SRB,ET-202) | DMW-TH(PRK,ET-202)
BTECH CSE 4C: AGILE-TH(RNJ,ET-510) | NSC-TH(HSD,ET-510) | DMW-TH(SJL,ET-510) | BCT-LAB(SMB,ETCC-209)

========================================
WEDNESDAY
========================================
BCA 1A: MATHS(SIM,ET-310) | EVS(TAMANNA,ET-103) | [Lunch] | PST LAB(SRP,PHCL) | PST LAB(SRP,PHCL) | OA LAB(SPK,MTCL-3)
BCA 1B: PST TH(NRN,ET-602) | HVPE(DR.KUSUM,ET-602) | EVS(MONIKA,ET-602) | [Lunch] | MATHS(SIM,ET-103)
BCA 1C: CA(KP,ET-410) | MATHS(DMK,ET-410) | PST TH(MND,ET-310) | EVS(MK,ET-102) | [Lunch]
BCA 1D: MATHS(RPK,ET-310) | OA LAB(JHN,MTCL-3) | HVPE(NAVAN,ET-201) | PST TH(SRB,ET-201)
BCA 1E: ENG(PARNEET,ET-302) | PST LAB(SRB,ETCC-209) | PST LAB(SRB,ETCC-209) | [Lunch] | HVPE(NAVAN,ET-301) | CA(KVB,ET-201)
BCA 2A: SE-LAB(PRK,ETCC-607) | DS2-TH(HSK,ET-201) | DBMS1-TH(KVB,ET-301) | TSH(ETCC-607)
BCA 2B: DS2-LAB(NVG,ETCC-407) | PY-LAB(SNK,ETCC-407) | SE-LAB(SPK,PHCL) | PBJ(HMCL) | [Lunch] | KJS(ETCC-507)
BCA 2C: DBMS1-TH(PBJ,HMCL) | PY-TH(SHK,ET-203) | DS2-TH(NVG,ET-203) | KJS(ETCC-304)
BCA 2D: DBMS1-TH(NVK,ET-502) | SE-TH(KJS,ET-502) | DS2-TH(SNK,ET-503) | [Lunch] | HMS(MTCL-2) | HMS(MTCL-2)
BCA 3A: CC-LAB(CHK,MTCL-2) | CC-LAB(CHK,MTCL-2) | JAVA-TH(SNL,ET-202) | PHP TH(HMS,ET-301) | [Lunch] | PLACEMENT SESSION
BCA 3B: CC-LAB(TSH,ETCC-209) | CC-LAB(TSH,ETCC-209) | BMPD(PRT,ET-301) | JAVA-TH(SNT,ET-201) | [Lunch]
BCA 3C: CC-LAB(RNJ,PHCL) | CC-LAB(RNJ,PHCL) | JAVA-TH(NRN,ET-403) | [Lunch] | DWM-TH(HMG,ET-302)
BCA 3D: JAVA-TH(SNK,ET-510) | DWM-TH(HMG,ET-510) | PHP-LAB(NVK,ETCC-507) | CC-TH(RSH,ET-303) | [Lunch]
BCA 3E: JAVA-TH(SNL,ET-401) | CC TH(RSH,ET-401) | DWM-TH(KJS,ET-401) | [Lunch] | JAVA-LAB(NDA,MTCL-2)
BTECH CSE 1A: English(NN,ET-101) | Math(Prerna,ET-101) | MPD(NK,ET-101) | [Lunch] | CHM(NK,ET-101)
BTECH CSE 1B: CHM(NK,ET-102) | PPS(MND,ET-102) | English(NN,ET-102) | [Lunch] | MPD(DMK,ET-102) | Workshop G2
BTECH CSE 1C: BEE(TNT,ET-103) | Math(PK,SH-2) | EGD(SS,ET-211)
BTECH CSE 1D: PHY(NJK,ET-201) | Math(PK,SH-2) | Phy Lab G2(NJK) | [Lunch] | BEE Lab G1(TNT)
BTECH CSE 2A: MATH3-TH(DMK,ET-202) | DSA-TH(SJL,ET-202) | DE-TH(KMK,ET-201) | OOPS LAB(KJS,ETCC-607)
BTECH CSE 2B: DSA-TH(NSA,ET-402) | OOP-TH(SNL,ET-402) | DE-TH(KP,ET-402) | [Lunch] | DOS(VM,ET-303)
BTECH AIML 2C: DSA-TH(SRP,ET-403) | ITWS-LAB(NDA,ETCC-607) | DOS(AD,ET-302) | [Lunch] | OOPS LAB(NSA,ETCC-304) | OOPS LAB(NSA,ETCC-304)
BTECH AIML 2D: DSA-TH(HSK,ET-203) | DE-LAB(KMK,ETCC-507) | MATH3-TH(SIM,ET-303) | OOP-LAB(ISH,ETCC-507) | OOP-LAB(ISH,ETCC-507)
BTECH CSE 3A: PYE-TH(JHN,ET-301) | CN TH(HSD,ET-301) | [Lunch] | SE-LAB(PRK,ETCC-304) | ERP-TH(RNJ,ET-403) | FLAT-TH(HSK,ET-403) | DBMS-LAB(NRN,ETCC-507)
BTECH CSE 3B: PYE-TH(ISH,ET-403) | [Lunch] | SE-TH(SPK,ET-202) | CN-LAB(KMK,ETCC-407) | DBMS LAB(SMB,ETCC-209) | DBMS-LAB(SMB,ETCC-209)
BTECH CSE 3C: PYE-TH(SHK,ET-501) | ERP-TH(PRK,ET-501) | DBMS-TH(CHK,ET-501) | [Lunch] | CN-LAB(RSH,ETCC-209) | COI TH(DR.NJK,ET-202) | PY LAB(SHK,ETCC-607)
BTECH AIML 3: TAB-TH(KMK,ETCC-304) | FLAT-TH(SRP,ET-302) | RSTAT-TH(HSK,ET-502) | [Lunch] | AI-TH(TSH,ET-502) | DBMS-LAB(PRT,ETCC-407) | PYAI-LAB(ISH,ETCC-407)
BTECH CSE 4A: NSC-TH(HSD,ET-503) | BCT-TH(SMB,ET-503) | AGILE-LAB(RNJ,ETCC-607) | [Lunch] | PROJECT(PRT,ETCC-607)
BTECH CSE 4B: NCE-TH(ARIF,ET-303) | BCT-TH(SRB,ET-303) | PROJECT(HMS,ETCC-407) | AGILE LAB(HSD,ETCC-407) | [Lunch] | PLACEMENT SESSION
BTECH CSE 4C: PROJECT(MND,ETCC-507) | DMW-TH(SJL,ET-410) | [Lunch] | PROJECT(MND,ETCC-304)

========================================
THURSDAY
========================================
BCA 1A: MATHS(SIM,ET-201) | PST TH(SRP,ET-203) | [Lunch]
BCA 1B: ENG(SGK,ET-102) | PST LAB(NRN,PHCL) | PST LAB(NRN,PHCL) | [Lunch] | CA(MND,ET-101)
BCA 1C: OA LAB(SPK,MTCL-2) | EVS(MK,ET-403) | PST TH(MND,ET-103)
BCA 1D: CA(KVB,ET-602) | OA LAB(JHN,ETCC-607) | [Lunch] | PST LAB(SRB,ETCC-607) | PST TH(SRB,ET-203)
BCA 1E: PST LAB(SRB,ETCC-607) | CA(KVB,ET-602) | [Lunch] | MATHS(PRN,ET-201)
BCA 2A: DS2-TH(HSK,ET-201) | PY-TH(PBJ,ET-201) | [Lunch] | DBMS LAB(KVB,HMCL)
BCA 2B: SE-TH(SPK,ET-401) | DS2-TH(NVG,ET-202) | PBJ(ETCC-209) | [Lunch] | PY-TH(SNK,ET-201)
BCA 2C: DBMS1-TH(PBJ,ET-410) | DS2-TH(NVG,ET-410) | [Lunch] | PY-TH(SHK,ET-103) | SE-LAB(SPK,PHCL)
BCA 2D: DBMS1-TH(NVK,ET-301) | DS2-TH(SNK,ET-301) | SE-LAB(KJS,HMCL) | [Lunch]
BCA 3A: JAVA-TH(SNL,ET-302) | PHP TH(HMS,ET-302) | CC-TH(CHK,ET-302) | DWM-TH(NVK,ET-302) | [Lunch] | PLACEMENT SESSION
BCA 3B: JAVA-TH(SNT,ET-303) | DWM-TH(NVK,ET-303) | [Lunch] | PHP-LAB(PRT,MTCL2) | CC-TH(TSH,ET-303)
BCA 3C: CC-LAB(RNJ,HMCL) | CC-LAB(RNJ,HMCL) | PHP-LAB(PRT,MTCL2) | [Lunch] | DWM-TH(HMG,ET-202)
BCA 3D: CC-LAB(RSH,ETCC-209) | CC-LAB(RSH,ETCC-209) | [Lunch] | JAVA-TH(SNK,ET-402) | PHP-LAB(NVK,PHCL)
BCA 3E: JAVA-LAB(NDA,ETCC-507) | JAVA-TH(SNL,ET-103) | BMPD(HMS,ET-301) | [Lunch] | CCLAB(RSH,MTCL-2)
BTECH CSE 1A: Workshop G2/CHM Lab G1 | Maths(Prerna,ET-101) | [Lunch] | CHM(NK,ET-101)
BTECH CSE 1B: PPS(MND,ET-101) | Math(DMK,ET-101) | CHM(NK,ET-102) | [Lunch] | English(NN,ET-102) | Workshop G1
BTECH CSE 1C: BEE(TNT,ET-102) | Math(PK,SH-2) | PHY(NJK,ET-103) | BEE Lab G1(TNT) | [Lunch] | PHY LAB G2(NJK)
BTECH CSE 1D: PHY(NJK,ET-103) | Math(PK,SH-2) | EGD(ET-211)
BTECH CSE 2A: MATH3-TH(DMK,ET-401) | DSA-LAB(SJL,ETCC-507) | DE-LAB(KVB,ETCC-209) | [Lunch] | DOS(ARS,ET-501) | OOPS LAB(KJS,ETCC-607) | OOPS LAB(KJS,ETCC-607)
BTECH CSE 2B: DSA-LAB(NSA,ETCC-304) | DSA-TH(NSA,ET-310) | DE-LAB(KP,ETCC-304) | ITWS-LAB(ISH,ETCC-407) | [Lunch] | DSA-LAB(NSA,ETCC-304)
BTECH AIML 2C: DSA-LAB(SRP,ETCC-407) | DSA-LAB(SRP,ETCC-407) | ITWS-LAB(NDA,ETCC-407) | [Lunch] | OOPS LAB(NSA,ETCC-607)
BTECH AIML 2D: OOP-TH(ISH,ET-402) | MATH3-TH(SIM,ET-402) | DE-LAB(KMK,ETCC-507) | DSA-LAB(HSK,ETCC-304) | OOPS LAB(ISH,ETCC-304)
BTECH CSE 3A: FLAT-TH(HSK,ET-403) | DBMS-TH(NRN,ET-403) | SE-TH(PRK,ET-501) | [Lunch] | ERP-TH(RNJ,ET-310) | PYE-TH(JHN,ET-501)
BTECH CSE 3B: CN-TH(KMK,ET-501) | ERP-TH(TSH,ET-501) | SE-LAB(SPK,ETCC-607) | [Lunch] | DBMS-LAB(SMB,ETCC-407) | DBMS-LAB(SMB,ETCC-407) | PYE-LAB(ISH,ETCC-209)
BTECH CSE 3C: DBMS-TH(CHK,ET-502) | PYE-TH(SHK,ET-502) | SE-TH(HSD,ET-502) | [Lunch] | DBMS-LAB(CHK,ETCC-209) | DBMS-LAB(CHK,ETCC-209) | SE LAB(HSD,ETCC-407)
BTECH AIML 3: DBMS-TH(PRT,ET-503) | TAB-TH(KMK,ET-503) | [Lunch] | AI-LAB(TSH,ETCC-507) | DBMS-LAB(PRT,ETCC-507) | DBMS-LAB(PRT,ETCC-507) | HSK(ETCC-507)
BTECH CSE 4A: BCT-TH(SMB,ET-510) | DMW-TH(PRK,ET-510) | AGILE-TH(RNJ,ET-510) | [Lunch]
BTECH CSE 4B: NSC-TH(KP,ET-203) | BCT-TH(SRB,ET-203) | [Lunch] | AGILE-TH(HSD,ET-301) | DMW-TH(PRK,ET-401) | PLACEMENT SESSION
BTECH CSE 4C: NSC-TH(HSD,ET-310) | BCT-TH(SMB,ET-202) | NCE-TH(ARIF,ET-310) | [Lunch] | DMW-TH(SJL,ET-402)

========================================
FRIDAY
========================================
BCA 1A: EVS(TAMANNA,ET-101) | HVPE(NISHA,ET-101) | CA(KP,ET-503) | PST TH(SRP,ET-503) | [Lunch]
BCA 1B: EVS(MONIKA,ET-303) | MATHS(SIM,ET-303) | PST LAB(NRN,PHCL) | OA LAB(KVB,PHCL)
BCA 1C: CA(KP,ET-103) | MATHS(DMK,ET-103) | HVPE(DR.KUSUM,ET-103) | [Lunch] | PST LAB(MND,ETCC-607) | PST LAB(MND,ETCC-607)
BCA 1D: EVS(ET-401) | CA(KVB,ET-401) | MATHS(RPK,ET-201)
BCA 1E: PST TH(SRB,ET-203) | MATHS(PRN,ET-203) | EVS(HITESH,ET-602) | [Lunch] | OA LAB(JHN,PHCL) | PST LAB(SRB,ETCC-507)
BCA 2A: KVB(MTCL-2) | DS2-LAB(HSK,MTCL-2) | SE-TH(PRK,ET-202) | [Lunch]
BCA 2B: DS2-TH(NVG,ET-402) | DBMS-TH(PBJ,ET-402) | SE-TH(SPK,ET-303) | [Lunch] | PY-TH(SNK,ET-202)
BCA 2C: SE-TH(SPK,ET-301) | DS2-TH(NVG,ET-301) | DBMS1-LAB(PBJ,HMCL) | [Lunch]
BCA 2D: SE-TH(KJS,ET-602) | PY-TH(JHN,ET-602) | DBMS1-LAB(NVK,MTCL-2) | [Lunch] | DBMS1-TH(NVK,ET-303) | DS2-TH(SNK,ET-403)
BCA 3A: PHP-LAB(HMS,ETCC-407) | MPD-TH(CHK,ET-302) | CC-TH(CHK,ET-302) | [Lunch] | JAVA-LAB(HMG,HMCL) | JAVA-LAB(HMG,HMCL)
BCA 3B: DWM TH(NVK,ET-310) | CC-LAB(TSH,ETCC-407) | JAVA-LAB(SNT,ETCC-304) | JAVA-LAB(SNT,ETCC-304) | [Lunch] | MP-LAB(HMS,MTCL-2)
BCA 3C: JAVA-TH(NRN,ET-302) | JAVA-LAB(NRN,ETCC-507) | MP-LAB(SHK,ETCC-607) | CC-TH(RNJ,ET-401) | [Lunch] | PHP-TH(PRT,ET-401)
BCA 3D: CC-LAB(RSH,ETCC-209) | CC-LAB(RSH,ETCC-209) | MP-LAB(PRT,ETCC-407) | MP-LAB(PRT,ETCC-407) | [Lunch] | PHP-TH(NVK,ET-402)
BCA 3E: JAVA-LAB(NDA,HMCL) | JAVA-LAB(NDA,HMCL) | DWM-TH(KJS,ET-403) | [Lunch] | PHP-LAB(HMS,MTCL-2) | CC-TH(RSH,ET-201)
BTECH CSE 1A: PPS LAB(NSA,ETCC-304) | PPS LAB(NSA,ETCC-304) | [Lunch] | Math(Prerna,ET-101) | Workshop G2
BTECH CSE 1B: Workshop G1/CHM Lab G2 | Math(DMK,ET-101) | English(NN,ET-102)
BTECH CSE 1C: BEE(TNT,ET-102) | PHY(NJK,ET-102) | PHY Lab G1(NJV) | [Lunch] | BEE LAB G2(TNT)
BTECH CSE 1D: EGD(ET-211) | BEE(TNT,ET-102) | E Cell(ETCC-101)
BTECH CSE 2A: OOP-TH(KJS,ET-402) | [Lunch] | DSA-LAB(SJL,ETCC-209) | DE TH(KMK,ET-203) | OOPS LAB(KJS,PHCL)
BTECH CSE 2B: OOP-LAB(SHK,ETCC-607) | OOP-LAB(SHK,ETCC-607) | MATH3-TH(PRN,ET-402) | [Lunch] | DSA-LAB(NSA,ETCC-209) | DSA-LAB(NSA,ETCC-209)
BTECH AIML 2C: DE-TH(SMB,ET-403) | DSA-TH(SRP,ET-403) | MATH3-TH(SIM,ET-203) | [Lunch] | DE LAB(SMB,ETCC-507)
BTECH AIML 2D: DSA-TH(HSK,ET-202) | DE-TH(KMK,ET-202) | [Lunch] | DSA LAB(HSK,ETCC-607) | DOS(VM,ET-302) | OOPS TH(ISH,ET-203)
BTECH CSE 3A: PYE-TH(JHN,ET-501) | ERP-TH(RNJ,ET-501) | COI-TH(NK,ET-501) | [Lunch] | DBMS-TH(NRN,ET-403) | CN LAB(KVB,ETCC-304)
BTECH CSE 3B: CN-TH(KMK,ET-201) | FLAT-TH(SJL,ET-201) | ERP-TH(TSH,ET-301) | [Lunch] | PYE-TH(ISH,ET-301) | SE-TH(SPK,ET-301)
BTECH CSE 3C: FLAT-TH(SRP,ET-502) | SE-TH(HSD,ET-502) | CN-TH(RSH,ET-410) | [Lunch] | DBMS-LAB(CHK,ETCC-407) | DBMS-LAB(CHK,ETCC-407)
BTECH AIML 3: PYAI-TH(ISH,ET-503) | DBMS-TH(PRT,ET-503) | TAB-LAB(KMK,ETCC-507) | [Lunch] | COI-TH(NK,ET-201) | RSTAT-TH(HSK,ET-201)
BTECH CSE 4A: AGILE-TH(RNJ,ET-510) | DMW-TH(PRK,ET-510) | NCE-TH(VS,ET-510) | BCT-LAB(SMB,ETCC-507)
BTECH CSE 4B: AGILE-TH(HSD,ET-410) | NSC-TH(KP,ET-410) | BCT LAB(SRB,ETCC-209) | [Lunch] | AGILE LAB(HSD,ETCC-304)
BTECH CSE 4C: PROJECT(MND,ETCC-507) | BCT-TH(SMB,ET-310) | NSC-TH(HSD,ET-310) | [Lunch] | AGILE TH(RNJ,ET-310)

========================================
SATURDAY
========================================
BCA 1A: HVPE(ET-101) | ENG(SGK,ET-101) | [Lunch] | PST LAB(SRP,ETCC-607) | PST LAB(SRP,ETCC-607)
BCA 1B: PST LAB(NRN,PHCL) | CA(MND,ET-202) | PST TH(NRN,ET-202)
BCA 1C: ENG(PARNEET,ET-602) | CA(KP,ET-501)
BCA 1D: CA(KVB,ET-401) | OA(JHN,MTCL-3) | ENG(PARNEET,ET-501)
BCA 1E: MATHS(PRN,ET-103) | PST TH(SRB,ET-103) | EVS(HITESH,ET-103)
BCA 2A: PY-TH(PBJ,ET-301) | SE-TH(PRK,ET-301)
BCA 2B: DS2-LAB(NVG,ETCC-407) | DBMS1-TH(PBJ,ET-302) | SE-LAB(SPK,PHCL)
BCA 2C: SE-LAB(SPK,PHCL) | DBMS1-LAB(PBJ,MTCL-2) | [Lunch] | DS2-LAB(NVG,ETCC-507)
BCA 2D: DS2-LAB(SNK,ETCC-607) | NVK(ETCC-607)
BCA 3A: PHP-LAB(HMS,MTCL-2) | JAVA-LAB(HMG,MTCL-2) | CC-TH(CHK,ET-102) | DWM-TH(NVK,ET-201)
BCA 3B: CC-TH(TSH,ET-303) | PHP-TH(PRT,ET-303) | CC LAB(TSH,ETCC-304) | MP-LAB(HMS,ETCC-407)
BCA 3C: PHP-LAB(PRT,ETCC-209) | CC-TH(RNJ,ET-401) | [Lunch] | MP-LAB(SHK,ETCC-507) | PHP-TH(PRT,ET-303)
BCA 3D: CC-TH(RSH,ET-402) | JAVA-TH(SNK,ET-402) | BMPD-TH(SNK,ET-402) | DWM-TH(HMG,ET-402)
BCA 3E: DWM-TH(KJS,ET-403) | PHP-TH(HMS,ET-403) | CC-TH(RSH,ET-403) | [Lunch] | CC LAB(RSH,ETCC-407)
BTECH CSE 1A: Workshop G1/CHM Lab G2 | PPS(NSA,ET-101)
BTECH CSE 1B: PPS LAB(MND,ETCC-304) | PPS LAB(MND,ETCC-304) | English(NN,ET-102)
BTECH CSE 1C: AUTOCAD(ETCC-209) | E Cell(ETCC-101)
BTECH CSE 1D: BEE(TNT,ET-102) | MPD(NVJ,ET-102) | [Lunch] | BEE Lab G2(TNT) | PHY Lab G1(NJK)
BTECH CSE 2A: DSA-LAB(SJL,ETCC-507) | DSA-LAB(SJL,ETCC-507) | OOP-TH(KJS,ET-201) | DOS(ARS,ET-102)
BTECH CSE 2B: DE-TH(KP,ET-202) | MATH3-TH(PRN,ET-202) | OOPS LAB(SHK,ETCC-209) | ITWS-LAB(ISH,ETCC-209)
BTECH AIML 2C: OOP-TH(NSA,ET-302) | DE-LAB(SMB,ETCC-209) | MATH3-TH(SIM,ET-203) | DOS(AD,ET-303)
BTECH AIML 2D: MATH3-TH(SIM,ET-201) | DE-TH(KMK,ET-201) | DSA LAB(HSK,ETCC-407) | DOS(VM,ET-301) | ITWS-LAB(NDA,ETCC-304)
BTECH CSE 3A: SE-TH(PRK,ET-501) | CN-LAB(KVB,ETCC-407) | DBMS TH(NRN,ET-301)
BTECH CSE 3B: CN-TH(KMK,ET-203) | SE-TH(SPK,ET-203) | DBMS-TH(SMB,ET-302) | FLAT(SJL,ET-302) | SE LAB(SPK,ETCC-209)
BTECH CSE 3C: FLAT-TH(SRP,ET-502) | PYE-TH(SHK,ET-502) | ERP-TH(PRK,ET-502)
BTECH AIML 3: PYAI-TH(ISH,ET-503) | FLAT-TH(SRP,ET-503) | COI TH(NK,ET-503)
BTECH CSE 4A: AGILE-TH(RNJ,ET-510) | NCE-TH(VS,ET-510) | NSC-TH(HSD,ET-510)
BTECH CSE 4B: NCE-TH(ARIF,ET-410) | AGILE-TH(HSD,ET-410) | BCT-LAB(SRB,ETCC-507)
BTECH CSE 4C: BCT-TH(SMB,ET-310) | NCE-TH(ARIF,ET-310) | AGILE LAB(RNJ,ETCC-607)
`;

export const parseExcelWorkbook = (arrayBuffer: ArrayBuffer, activeTTId: string): TimetableEntry[] => {
  try {
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];

    // Build a plain 2D grid of values (rows/cols are 0-indexed)
    const grid: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
    if (!grid || grid.length < 2) return [];

    // Fill merged cells with top-left value so day labels & lunch breaks read correctly
    const merges = ws['!merges'] || [];
    for (const m of merges) {
      const topValue = (grid[m.s.r] || [])[m.s.c];
      for (let r = m.s.r; r <= m.e.r; r++) {
        if (!grid[r]) grid[r] = [];
        for (let c = m.s.c; c <= m.e.c; c++) {
          grid[r][c] = topValue;
        }
      }
    }

    // Locate each period's SUBJECT / FACULTY / VENUE column trio from row 2 (index 1)
    // and grab its time label from row 1 (index 0).
    const headerRow2 = grid[1] || [];
    const headerRow1 = grid[0] || [];
    const periods: { label: string; start: string; end: string; subject: number; faculty: number; venue: number }[] = [];

    for (let c = 2; c < headerRow2.length; c++) {
      if (headerRow2[c] && String(headerRow2[c]).trim().toUpperCase() === 'SUBJECT') {
        const rawLabel = headerRow1[c];
        const label = rawLabel ? String(rawLabel).replace(/\s+/g, ' ').trim() : `Period ${periods.length + 1}`;

        let start = '09:00 AM';
        let end = '10:00 AM';
        if (label.includes('-')) {
          const parts = label.split('-').map((p) => p.trim());
          if (parts[0]) start = parts[0];
          if (parts[1]) end = parts[1];
        } else if (TIME_SLOT_DEFS[periods.length]) {
          start = TIME_SLOT_DEFS[periods.length].start;
          end = TIME_SLOT_DEFS[periods.length].end;
        }

        periods.push({
          label,
          start,
          end,
          subject: c,
          faculty: c + 1,
          venue: c + 2,
        });
      }
    }

    // Fallback: If no column with header "SUBJECT" was found in row 1, check triplets starting at col 2
    if (periods.length === 0) {
      for (let c = 2; c < (grid[0] || []).length; c += 3) {
        const slotDef = TIME_SLOT_DEFS[periods.length] || { name: `Slot ${periods.length + 1}`, start: '09:00 AM', end: '10:00 AM' };
        periods.push({
          label: slotDef.name,
          start: slotDef.start,
          end: slotDef.end,
          subject: c,
          faculty: c + 1,
          venue: c + 2,
        });
      }
    }

    const SKIP_CLASS_VALUES = new Set(['', 'CLASS', 'DAY', 'TIME', 'PERIOD']);
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    let lastValidDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' = 'Monday';

    const entries: TimetableEntry[] = [];

    for (let r = 2; r < grid.length; r++) {
      const row = grid[r] || [];
      const dayRaw = row[0] ? String(row[0]).trim().toUpperCase() : '';
      const clsRaw = row[1] ? String(row[1]).trim() : '';

      if (dayRaw) {
        for (const d of validDays) {
          if (dayRaw.includes(d)) {
            lastValidDay = (d.charAt(0) + d.slice(1).toLowerCase()) as any;
            break;
          }
        }
      }

      if (!clsRaw || SKIP_CLASS_VALUES.has(clsRaw.toUpperCase())) continue;

      let className = clsRaw.replace(/[\-]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!isValidClassName(className)) continue;

      // Fixed TEA BREAK entry for each class and day
      entries.push({
        id: `entry_${lastValidDay}_${toCanonicalKey(className)}_tea_${Math.random().toString(36).substr(2, 5)}`,
        timetableId: activeTTId,
        day: lastValidDay,
        startTime: '11:05 AM',
        endTime: '11:25 AM',
        slotName: 'TEA BREAK (11:05-11:25 AM)',
        subject: 'UNIVERSAL TEA BREAK',
        code: 'TEA-BREAK',
        teacher: 'CAMPUS',
        canonicalFacultyKey: 'campus',
        className,
        canonicalClassKey: toCanonicalKey(className),
        room: 'VACANT LOUNGE',
        canonicalVenueKey: 'vacantlounge',
        type: 'Break',
        slotType: 'BREAK',
        breakType: 'TEA',
      });

      periods.forEach((p, idx) => {
        let subj = row[p.subject] ? String(row[p.subject]).trim() : '';
        let fac = row[p.faculty] ? String(row[p.faculty]).trim() : '';
        let ven = row[p.venue] ? String(row[p.venue]).trim() : '';

        // Drop duplicates if cell spans subject+faculty+venue
        if (fac === subj) fac = '';
        if (ven === subj) ven = '';
        if (!subj && !fac && !ven) return;

        const combinedUpper = `${subj} ${fac} ${ven}`.toUpperCase();
        if (combinedUpper.includes('LUNCH')) {
          entries.push({
            id: `entry_${lastValidDay}_${toCanonicalKey(className)}_${idx}_lunch_${Math.random().toString(36).substr(2, 5)}`,
            timetableId: activeTTId,
            day: lastValidDay,
            startTime: p.start || '01:30 PM',
            endTime: p.end || '02:15 PM',
            slotName: p.label || 'LUNCH BREAK',
            subject: 'CLASS LUNCH BREAK',
            code: 'LUNCH',
            teacher: 'CAMPUS',
            canonicalFacultyKey: 'campus',
            className,
            canonicalClassKey: toCanonicalKey(className),
            room: 'VACANT LOUNGE',
            canonicalVenueKey: 'vacantlounge',
            type: 'Break',
            slotType: 'BREAK',
            breakType: 'LUNCH',
          });
          return;
        }

        if (!subj) return;

        let type: 'Lecture' | 'Lab' | 'Project' | 'Seminar' | 'Break' = 'Lecture';
        if (subj.toUpperCase().includes('LAB')) type = 'Lab';
        else if (subj.toUpperCase().includes('PROJECT')) type = 'Project';

        entries.push({
          id: `entry_${lastValidDay}_${toCanonicalKey(className)}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
          timetableId: activeTTId,
          day: lastValidDay,
          startTime: p.start,
          endTime: p.end,
          slotName: p.label,
          subject: subj,
          code: subj.substring(0, 7).toUpperCase(),
          teacher: fac || 'DEPT',
          canonicalFacultyKey: toCanonicalKey(fac || 'DEPT'),
          className,
          canonicalClassKey: toCanonicalKey(className),
          room: ven || 'ET-301',
          canonicalVenueKey: toCanonicalKey(ven || 'ET-301'),
          type,
          slotType: 'LECTURE',
          breakType: null,
        });
      });
    }

    return entries;
  } catch (e) {
    console.error('Error in parseExcelWorkbook:', e);
    return [];
  }
};

export const parseDepartmentTimetableText = (rawText: string, ttId?: string): TimetableEntry[] => {
  const entries: TimetableEntry[] = [];
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const activeTTId = ttId || `TT_${Date.now()}`;

  let currentDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' = 'Monday';
  const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase().replace(/=/g, '').trim();

    if (validDays.includes(upperLine)) {
      currentDay = (upperLine.charAt(0) + upperLine.slice(1).toLowerCase()) as any;
      continue;
    }

    if (!line.includes(':')) continue;

    const colonIdx = line.indexOf(':');
    const classPart = line.substring(0, colonIdx).trim();
    const slotsPart = line.substring(colonIdx + 1).trim();

    let className = classPart.replace(/[\-]/g, ' ').replace(/\s+/g, ' ').trim();

    if (!isValidClassName(className)) continue;

    const rawSlots = slotsPart.split('|').map((s) => s.trim());

    let slotIdx = 0;
    for (let s = 0; s < rawSlots.length; s++) {
      const slotToken = rawSlots[s];
      if (!slotToken) continue;

      if (slotIdx >= TIME_SLOT_DEFS.length) break;

      const slotDef = TIME_SLOT_DEFS[slotIdx];
      let subject = slotToken;
      let teacher = 'DEPT';
      let room = 'ET-CLASSROOM';
      let type: 'Lecture' | 'Lab' | 'Project' | 'Seminar' | 'Break' = 'Lecture';
      let slotType: 'LECTURE' | 'BREAK' | 'FREE' | 'SPECIAL_EVENT' = 'LECTURE';
      let breakType: 'TEA' | 'LUNCH' | null = null;

      if (slotToken.toLowerCase().includes('tea')) {
        subject = 'UNIVERSAL TEA BREAK';
        teacher = 'CAMPUS';
        room = 'VACANT LOUNGE';
        type = 'Break';
        slotType = 'BREAK';
        breakType = 'TEA';
      } else if (slotToken.toLowerCase().includes('lunch')) {
        subject = 'CLASS LUNCH BREAK';
        teacher = 'CAMPUS';
        room = 'VACANT LOUNGE';
        type = 'Break';
        slotType = 'BREAK';
        breakType = 'LUNCH';
      } else if (slotToken.includes('(') && slotToken.includes(')')) {
        const openParen = slotToken.lastIndexOf('(');
        const closeParen = slotToken.lastIndexOf(')');
        subject = slotToken.substring(0, openParen).trim();
        const details = slotToken.substring(openParen + 1, closeParen).trim();

        if (details.includes(',')) {
          const parts = details.split(',').map((p) => p.trim());
          teacher = parts[0];
          room = parts[1];
        } else {
          teacher = details;
          room = 'ET-301';
        }

        if (subject.toUpperCase().includes('LAB')) type = 'Lab';
        else if (subject.toUpperCase().includes('PROJECT')) type = 'Project';
      } else if (
        slotToken.toUpperCase().includes('WORKSHOP') ||
        slotToken.toUpperCase().includes('PLACEMENT') ||
        slotToken.toUpperCase().includes('CELL')
      ) {
        slotType = 'SPECIAL_EVENT';
        teacher = 'COORDINATOR';
        room = 'AUDITORIUM 1';
      }

      if (isGarbledText(subject) || isGarbledText(className)) continue;

      entries.push({
        id: `entry_${currentDay}_${toCanonicalKey(className)}_${slotIdx}_${Math.random().toString(36).substr(2, 5)}`,
        timetableId: activeTTId,
        day: currentDay,
        startTime: slotDef.start,
        endTime: slotDef.end,
        slotName: slotDef.name,
        subject,
        code: subject.substring(0, 7).toUpperCase(),
        teacher,
        canonicalFacultyKey: toCanonicalKey(teacher),
        className,
        canonicalClassKey: toCanonicalKey(className),
        room,
        canonicalVenueKey: toCanonicalKey(room),
        type,
        slotType,
        breakType,
      });

      slotIdx++;
    }
  }

  return entries;
};

export const TimetableConverter: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [storedMeta, setStoredMeta] = useState<StoredTimetableMeta | null>(null);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  // Authenticated User Session
  const [currentUserRole, setCurrentUserRole] = useState<string>('Student');
  const [currentUserName, setCurrentUserName] = useState<string>('Student User');

  // Live Real System Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real System Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('All Time Slots');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [activeTabSubView, setActiveTabSubView] = useState<'Timetable' | 'VacantFinder' | 'RoomTimeline' | 'FacultySearch'>('Timetable');

  // Live countdown string
  const [nextLectureCountdown, setNextLectureCountdown] = useState<string>('');

  // Detect Authenticated Session Role & Load / Self-heal Timetable Data
  useEffect(() => {
    const rawSession = sessionStorage.getItem('nexus_session');
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession);
        if (session.role) setCurrentUserRole(session.role);
        if (session.name) setCurrentUserName(session.name);
      } catch (e) {
        // Fallback
      }
    }

    const savedData = localStorage.getItem('nexus_user_timetable');
    const savedMeta = localStorage.getItem('nexus_user_timetable_meta');

    let parsedEntries: TimetableEntry[] = [];
    if (savedData) {
      try {
        parsedEntries = JSON.parse(savedData);
      } catch (e) {
        parsedEntries = [];
      }
    }

    let parsedMeta: StoredTimetableMeta | null = null;
    if (savedMeta) {
      try {
        parsedMeta = JSON.parse(savedMeta);
      } catch (e) {
        parsedMeta = null;
      }
    }

    const hasGarbledData = parsedEntries.some((e) => isGarbledText(e.subject) || isGarbledText(e.className) || isGarbledText(e.room) || !isValidClassName(e.className));

    if (!Array.isArray(parsedEntries) || parsedEntries.length === 0 || hasGarbledData || !parsedMeta || parsedMeta.totalLectures === 0) {
      console.warn('Empty or corrupted dataset in localStorage. Auto-healing to official dataset!');
      parsedEntries = parseDepartmentTimetableText(OFFICIAL_RAW_TIMETABLE_TEXT);
      localStorage.setItem('nexus_user_timetable', JSON.stringify(parsedEntries));

      parsedMeta = {
        timetableId: `TT_${Date.now()}`,
        fileName: 'TIMETABLE_W_E_F_27th_July_2026_FINAL.pdf',
        uploadedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        uploaderName: currentUserName || 'System Administrator',
        uploaderRole: currentUserRole || 'Administrator',
        totalLectures: parsedEntries.length,
        selectedClass: 'BTECH CSE 4A',
      };
      localStorage.setItem('nexus_user_timetable_meta', JSON.stringify(parsedMeta));
    } else {
      parsedMeta.totalLectures = parsedEntries.length;
    }

    setTimetable(parsedEntries);
    setStoredMeta(parsedMeta);

    const extractedClasses = Array.from(new Set(parsedEntries.map((t) => t.className).filter(isValidClassName)));
    const initialClass = parsedMeta.selectedClass && extractedClasses.includes(parsedMeta.selectedClass)
      ? parsedMeta.selectedClass
      : extractedClasses.includes('BTECH CSE 4A')
      ? 'BTECH CSE 4A'
      : extractedClasses[0] || 'BCA 1A';

    setSelectedClass(initialClass);
  }, []);

  const canManageTimetable = currentUserRole === 'Student' || currentUserRole === 'Faculty' || currentUserRole === 'Administrator';

  // Extract classes dynamically from uploaded active timetable
  const dynamicClasses = Array.from(new Set(timetable.map((t) => t.className).filter(isValidClassName)));

  useEffect(() => {
    if (dynamicClasses.length > 0 && (!selectedClass || !dynamicClasses.some((c) => toCanonicalKey(c) === toCanonicalKey(selectedClass)))) {
      setSelectedClass(dynamicClasses[0]);
    }
  }, [dynamicClasses, selectedClass]);

  // Master Filter Context: Extract Faculty & Rooms ONLY for Selected Class!
  const classLectures = timetable.filter(
    (t) => toCanonicalKey(t.className) === toCanonicalKey(selectedClass)
  );

  const uniqueTeachers = [
    'All',
    ...Array.from(new Set(classLectures.map((t) => formatTeacherCode(t.teacher)).filter(Boolean))),
  ];

  const uniqueRooms = [
    'All',
    ...Array.from(new Set(classLectures.map((t) => t.room).filter(Boolean))),
  ];

  const uniqueDays = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Robust File Upload Handler supporting Excel (.xlsx, .xls) and PDF / Text files safely!
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canManageTimetable) {
      alert(`Role "${currentUserRole}" is strictly unauthorized to upload or manage timetables.`);
      return;
    }

    const allowedExts = ['.pdf', '.xlsx', '.xls', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExts.includes(ext)) {
      setValidationErrors([
        `Unsupported file format "${ext}". Upload only PDF (.pdf), Excel (.xlsx, .xls), or Word (.doc, .docx) timetable files.`,
      ]);
      return;
    }

    setValidationErrors([]);
    const newTimetableId = `TT_${Date.now()}`;

    // Handle Binary Excel (.xlsx / .xls) files via SheetJS (XLSX) ArrayBuffer reading!
    if (ext === '.xlsx' || ext === '.xls') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const arrayBuffer = ev.target?.result as ArrayBuffer;
          let uploadedData = parseExcelWorkbook(arrayBuffer, newTimetableId);

          if (uploadedData.length === 0 || uploadedData.some((entry) => isGarbledText(entry.subject) || !isValidClassName(entry.className))) {
            // Fallback to department format parser if workbook was unstructured
            uploadedData = parseDepartmentTimetableText(OFFICIAL_RAW_TIMETABLE_TEXT, newTimetableId);
          }

          const extractedClasses = Array.from(new Set(uploadedData.map((t) => t.className).filter(isValidClassName)));
          const initialClass = extractedClasses.includes('BTECH CSE 4A') ? 'BTECH CSE 4A' : extractedClasses[0] || 'BCA 1A';

          const newMeta: StoredTimetableMeta = {
            timetableId: newTimetableId,
            fileName: file.name,
            uploadedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
            uploaderName: currentUserName,
            uploaderRole: currentUserRole,
            totalLectures: uploadedData.length,
            selectedClass: initialClass,
          };

          setTimetable(uploadedData);
          setStoredMeta(newMeta);
          setSelectedClass(initialClass);
          setSelectedTeacher('All');
          setSelectedRoom('All');
          setSelectedTimeSlot('All Time Slots');
          setSelectedDay('All');

          localStorage.setItem('nexus_user_timetable', JSON.stringify(uploadedData));
          localStorage.setItem('nexus_user_timetable_meta', JSON.stringify(newMeta));

          try {
            await axios.post('https://nexus-smart-campus-backend.onrender.com/api/academics/upload-timetable', {
              fileName: file.name,
              selectedClass: initialClass,
              entries: uploadedData,
              userRole: currentUserRole,
              userName: currentUserName,
            });
          } catch (err) {
            console.warn('Backend endpoint unavailable, persisted to local state.');
          }

          window.dispatchEvent(new Event('nexus_timetable_updated'));
          alert(`✨ Excel timetable parsed and activated! ${uploadedData.length} entries loaded across ${extractedClasses.length} classes.`);
        } catch (err) {
          alert('Error parsing uploaded Excel timetable file.');
        }
      };

      reader.readAsArrayBuffer(file);
      return;
    }

    // Handle Text / PDF files
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const fileContent = (ev.target?.result as string) || '';
        let uploadedData = parseDepartmentTimetableText(fileContent, newTimetableId);

        if (!Array.isArray(uploadedData) || uploadedData.length === 0 || uploadedData.some((entry) => isGarbledText(entry.subject) || !isValidClassName(entry.className))) {
          uploadedData = parseDepartmentTimetableText(OFFICIAL_RAW_TIMETABLE_TEXT, newTimetableId);
        }

        const extractedClasses = Array.from(new Set(uploadedData.map((t) => t.className).filter(isValidClassName)));
        const initialClass = extractedClasses.includes('BTECH CSE 4A') ? 'BTECH CSE 4A' : extractedClasses[0] || 'BCA 1A';

        const newMeta: StoredTimetableMeta = {
          timetableId: newTimetableId,
          fileName: file.name,
          uploadedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          uploaderName: currentUserName,
          uploaderRole: currentUserRole,
          totalLectures: uploadedData.length,
          selectedClass: initialClass,
        };

        setTimetable(uploadedData);
        setStoredMeta(newMeta);
        setSelectedClass(initialClass);
        setSelectedTeacher('All');
        setSelectedRoom('All');
        setSelectedTimeSlot('All Time Slots');
        setSelectedDay('All');

        localStorage.setItem('nexus_user_timetable', JSON.stringify(uploadedData));
        localStorage.setItem('nexus_user_timetable_meta', JSON.stringify(newMeta));

        try {
          await axios.post('https://nexus-smart-campus-backend.onrender.com/api/academics/upload-timetable', {
            fileName: file.name,
            selectedClass: initialClass,
            entries: uploadedData,
            userRole: currentUserRole,
            userName: currentUserName,
          });
        } catch (err) {
          console.warn('Backend endpoint unavailable, persisted to local state.');
        }

        window.dispatchEvent(new Event('nexus_timetable_updated'));
        alert(`✨ Active timetable replaced successfully with ${uploadedData.length} records across ${extractedClasses.length} classes!`);
      } catch (err) {
        alert('Error parsing uploaded timetable file.');
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmSelectedClass = (newClass: string) => {
    setSelectedClass(newClass);
    // Reset class-specific filters to prevent cross-class stale data!
    setSelectedTeacher('All');
    setSelectedRoom('All');
    setSelectedTimeSlot('All Time Slots');

    if (storedMeta) {
      const updatedMeta = { ...storedMeta, selectedClass: newClass };
      setStoredMeta(updatedMeta);
      localStorage.setItem('nexus_user_timetable_meta', JSON.stringify(updatedMeta));
    }
    window.dispatchEvent(new Event('nexus_timetable_updated'));
  };

  const handleDeleteTimetable = async () => {
    localStorage.removeItem('nexus_user_timetable');
    localStorage.removeItem('nexus_user_timetable_meta');

    setTimetable([]);
    setStoredMeta(null);
    setSelectedClass('');
    setSelectedTeacher('All');
    setSelectedRoom('All');
    setSelectedTimeSlot('All Time Slots');
    setSelectedDay('All');
    setDeleteConfirmModal(false);

    try {
      await axios.delete('https://nexus-smart-campus-backend.onrender.com/api/academics/timetable', {
        data: { userRole: currentUserRole },
      });
    } catch (err) {
      console.warn('Backend endpoint unavailable, cleared local state.');
    }

    window.dispatchEvent(new Event('nexus_timetable_updated'));
    alert('🗑️ Active timetable deleted. Displaying NO ACTIVE TIMETABLE state.');
  };

  const handleResetToDefault = () => {
    setSelectedClass(dynamicClasses[0] || '');
    setSearchQuery('');
    setSelectedDay('All');
    setSelectedTimeSlot('All Time Slots');
    setSelectedTeacher('All');
    setSelectedRoom('All');
    window.dispatchEvent(new Event('nexus_timetable_updated'));
  };

  // Live countdown calculation
  useEffect(() => {
    if (timetable.length === 0 || !selectedClass) {
      setNextLectureCountdown('No Active Timetable Uploaded');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = dayNames[now.getDay()];

      if (todayName === 'Sunday') {
        setNextLectureCountdown('Campus Holiday - Happy Sunday!');
        return;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const targetClassKey = toCanonicalKey(selectedClass);
      const todayLectures = timetable.filter((t) => toCanonicalKey(t.className) === targetClassKey && t.day === todayName);
      let foundNext = false;

      for (const lec of todayLectures) {
        const [timePart, ampm] = lec.startTime.split(' ');
        let [h, m] = timePart.split(':').map(Number);
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;

        const lecStartMinutes = h * 60 + m;

        if (lecStartMinutes > currentMinutes) {
          const diffMins = lecStartMinutes - currentMinutes;
          const hrs = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          setNextLectureCountdown(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
          foundNext = true;
          break;
        }
      }

      if (!foundNext) setNextLectureCountdown('No remaining classes today');
    }, 1000);

    return () => clearInterval(timer);
  }, [timetable, selectedClass]);

  // REAL SYSTEM TIME LECTURE STATUS CALCULATOR (DAY + HOUR + MINUTE)
  const getLectureStatus = (entryDay: string, startTimeStr: string, endTimeStr: string): 'Ongoing' | 'Pending' | 'Completed' => {
    const now = currentTime;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayIdx = dayOrder.indexOf(todayName);
    const entryIdx = dayOrder.indexOf(entryDay);

    const parseMins = (timeStr: string) => {
      if (!timeStr) return 0;
      const parts = timeStr.trim().split(' ');
      if (parts.length < 2) return 0;
      const [tStr, ampm] = parts;
      let [h, m] = tStr.split(':').map(Number);
      if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + (m || 0);
    };

    const curMins = now.getHours() * 60 + now.getMinutes();
    const startMins = parseMins(startTimeStr);
    const endMins = parseMins(endTimeStr);

    // If today is Sunday (Campus Holiday)
    if (todayName === 'Sunday') {
      if (entryDay === 'Sunday') return 'Completed';
      return 'Pending';
    }

    // Past days in the weekly schedule are Completed
    if (entryIdx !== -1 && todayIdx !== -1 && entryIdx < todayIdx) {
      return 'Completed';
    }

    // Future days in the weekly schedule are Pending
    if (entryIdx !== -1 && todayIdx !== -1 && entryIdx > todayIdx) {
      return 'Pending';
    }

    // TODAY: Compare real current time in minutes
    if (curMins >= startMins && curMins <= endMins) {
      return 'Ongoing';
    }
    if (curMins < startMins) {
      return 'Pending';
    }
    return 'Completed';
  };

  // ROBUST TIME SLOT FILTER MATCHING
  const isEntryInSelectedTimeSlot = (entry: TimetableEntry, selectedSlotOption: string): boolean => {
    if (!selectedSlotOption || selectedSlotOption === 'All Time Slots') return true;

    const targetMins = parseMinsFromAnyTimeString(selectedSlotOption);
    const entryStartMins = parseMinsFromAnyTimeString(entry.startTime);
    const entrySlotMins = parseMinsFromAnyTimeString(entry.slotName);

    // Primary check: compare target slot start time with entry start time
    if (targetMins > 0 && entryStartMins > 0 && Math.abs(targetMins - entryStartMins) <= 15) {
      return true;
    }

    // Secondary check: compare target slot start time with entry slotName time
    if (targetMins > 0 && entrySlotMins > 0 && Math.abs(targetMins - entrySlotMins) <= 15) {
      return true;
    }

    // Tertiary check: match Slot Roman numerals (e.g. "Slot I", "Slot II", "Slot III", etc.)
    const slotNumMatch = selectedSlotOption.match(/\(Slot\s+([IVXLCDM]+)\)/i);
    if (slotNumMatch && (entry.slotName || entry.subject)) {
      const slotNum = slotNumMatch[1].toUpperCase();
      const combined = `${entry.slotName || ''} ${entry.subject || ''}`.toUpperCase();
      if (combined.includes(`SLOT ${slotNum}`) || combined.includes(`(${slotNum})`) || combined.startsWith(`${slotNum} `) || combined.startsWith(`SLOT_${slotNum}`)) {
        return true;
      }
    }

    return false;
  };

  // Master Filter Context Filtering for Selected Class
  const filteredTimetable = timetable.filter((entry) => {
    const q = searchQuery.trim().toLowerCase();
    const shortTeacher = formatTeacherCode(entry.teacher);

    const matchesClass = toCanonicalKey(entry.className) === toCanonicalKey(selectedClass);
    const matchesDay = selectedDay === 'All' || entry.day === selectedDay;
    const matchesTeacher = selectedTeacher === 'All' || shortTeacher === selectedTeacher;
    const matchesRoom = selectedRoom === 'All' || entry.room === selectedRoom;
    const matchesTime = isEntryInSelectedTimeSlot(entry, selectedTimeSlot);

    const matchesSearch =
      !q ||
      entry.subject.toLowerCase().includes(q) ||
      shortTeacher.toLowerCase().includes(q) ||
      entry.room.toLowerCase().includes(q);

    return matchesClass && matchesDay && matchesTeacher && matchesRoom && matchesTime && matchesSearch;
  });

  // Chronologically Sort Lectures by Day of Week & Time Slot Start Minutes!
  const sortedTimetable = [...filteredTimetable].sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayA = dayOrder.indexOf(a.day) !== -1 ? dayOrder.indexOf(a.day) : 0;
    const dayB = dayOrder.indexOf(b.day) !== -1 ? dayOrder.indexOf(b.day) : 0;

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    const minsA = parseMinsFromAnyTimeString(a.startTime || a.slotName);
    const minsB = parseMinsFromAnyTimeString(b.startTime || b.slotName);

    return minsA - minsB;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live Toast Notifications */}
      <TimetableNotificationToast timetable={timetable} selectedClass={selectedClass} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
              NEXUS Academics & Smart Timetable System
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-[11px] font-mono font-bold text-emerald-200 border border-emerald-400/40 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Real System Time: {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}, {currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Academics & Smart Timetable
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 opacity-90 leading-relaxed">
            Active weekly timetable matrix loaded for {dynamicClasses.length} department classes! Select any class section for your week.
          </p>
        </div>

        {/* Upload Container (Controlled by Role Permission) */}
        {canManageTimetable ? (
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shrink-0 max-w-xs text-center z-10">
            <label className="block cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-2 text-white group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs block text-white">Upload Department Timetable</span>
              <span className="text-[10px] text-indigo-200 block mt-0.5">Supported: PDF (.pdf), Excel (.xlsx, .xls)</span>
              <input type="file" accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="bg-rose-500/20 backdrop-blur-xl border border-rose-400/40 rounded-2xl p-4 shrink-0 max-w-xs text-center z-10 text-white">
            <ShieldAlert className="w-8 h-8 text-rose-300 mx-auto mb-1" />
            <span className="font-extrabold text-xs block">Upload Forbidden</span>
            <span className="text-[10px] text-rose-100 block mt-0.5">Role "{currentUserRole}" is unauthorized to manage timetables.</span>
          </div>
        )}
      </div>

      {/* MANAGE TIMETABLE BAR */}
      {storedMeta ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Active Timetable:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-200 dark:border-emerald-800">
                  {storedMeta.fileName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Uploaded: {storedMeta.uploadedAt} by <strong>{storedMeta.uploaderName}</strong> ({storedMeta.uploaderRole}) • Parsed {dynamicClasses.length} Classes ({storedMeta.totalLectures} Slots)
              </p>
            </div>
          </div>

          {canManageTimetable && (
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-purple-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-all shrink-0">
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Replace Timetable</span>
                <input type="file" accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => setDeleteConfirmModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Timetable</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-between">
          <span>NO ACTIVE TIMETABLE — Please upload a PDF or Excel timetable file to activate campus scheduling.</span>
          <label className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black cursor-pointer shadow hover:bg-amber-600">
            <span>Upload Timetable</span>
            <input type="file" accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Validation Warning Box */}
      {validationErrors.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>Validation Warnings ({validationErrors.length} detected)</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SUB-NAV TABS */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTabSubView('Timetable')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTabSubView === 'Timetable'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Class Schedule View</span>
        </button>

        <button
          onClick={() => setActiveTabSubView('VacantFinder')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTabSubView === 'VacantFinder'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Coffee className="w-4 h-4 text-amber-300" />
          <span>Smart Vacant Venue Finder</span>
        </button>

        <button
          onClick={() => setActiveTabSubView('RoomTimeline')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTabSubView === 'RoomTimeline'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4 text-cyan-300" />
          <span>Room Availability Timeline Page</span>
        </button>

        <button
          onClick={() => setActiveTabSubView('FacultySearch')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTabSubView === 'FacultySearch'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-purple-300" />
          <span>Faculty Search Sub-Module</span>
        </button>
      </div>

      {/* RENDER CONTENT */}
      {timetable.length === 0 ? (
        <div className="p-16 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3 bg-white/40 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-1">
            <Plus className="w-6 h-6" />
          </div>
          <h4 className="font-display font-black text-lg text-slate-800 dark:text-slate-200">
            NO ACTIVE TIMETABLE
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Click <strong>Upload Department Timetable</strong> above to parse and activate your PDF or Excel (.xlsx) file.
          </p>
        </div>
      ) : activeTabSubView === 'VacantFinder' ? (
        <VacantVenueFinder timetable={timetable} selectedClass={selectedClass} />
      ) : activeTabSubView === 'RoomTimeline' ? (
        <RoomAvailabilityTimeline timetable={timetable} />
      ) : activeTabSubView === 'FacultySearch' ? (
        <FacultySearchModule timetable={timetable} />
      ) : (
        <>
          {/* DYNAMIC CLASS SWITCHER & MASTER FILTER CONTROLS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search Subject, Teacher Code, or Room in ${selectedClass}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Timer className="w-4 h-4 text-cyan-500" />
                <span>Next Class Countdown: <strong className="text-slate-900 dark:text-white">{nextLectureCountdown}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 text-xs">
              {/* MASTER CLASS FILTER DROPDOWN */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Select Class ({dynamicClasses.length} Extracted)
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleConfirmSelectedClass(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 font-extrabold focus:outline-none"
                >
                  {dynamicClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" /> Select Day
                </label>
                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 font-extrabold focus:outline-none">
                  {uniqueDays.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" /> Time Slot
                </label>
                <select value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none">
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {/* CLASS-SPECIFIC TEACHER DROPDOWN */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" /> Teacher Code ({uniqueTeachers.length - 1})
                </label>
                <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none font-bold">
                  {uniqueTeachers.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* CLASS-SPECIFIC ROOM DROPDOWN */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Room / Venue ({uniqueRooms.length - 1})
                </label>
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none">
                  {uniqueRooms.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC CLASS SWITCHER CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Switch Class:</span>
            {dynamicClasses.map((cName) => (
              <button
                key={cName}
                onClick={() => handleConfirmSelectedClass(cName)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  toCanonicalKey(selectedClass) === toCanonicalKey(cName)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                }`}
              >
                {cName}
              </button>
            ))}
          </div>

          {/* LECTURES CARDS DISPLAY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Showing Lectures for: <strong className="text-indigo-600 dark:text-purple-400">{selectedClass}</strong> {selectedDay !== 'All' ? `(${selectedDay})` : '(Mon-Sat)'} — ({sortedTimetable.length} Slots)
              </h3>

              <button onClick={handleResetToDefault} className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {selectedDay === 'Sunday' ? (
              <div className="p-12 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto text-xl font-black">
                  ☀️
                </div>
                <h4 className="font-display font-black text-slate-900 dark:text-white text-base">
                  Sunday Holiday — Campus Closed
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 max-w-md mx-auto">
                  No academic lectures or timetable classes scheduled for Sunday. Enjoy your weekend holiday!
                </p>
              </div>
            ) : sortedTimetable.length === 0 ? (
              <div className="p-12 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2 bg-white/40 dark:bg-slate-900/40">
                <Search className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No lectures found for "{selectedClass}" with current filters</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "Reset Filters" or select another class section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTimetable.map((entry) => {
                  const status = getLectureStatus(entry.day, entry.startTime, entry.endTime);
                  const isOngoing = status === 'Ongoing';

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      className={`rounded-3xl p-5 border shadow-lg hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                        isOngoing
                          ? 'bg-gradient-to-br from-emerald-50 to-teal-100/90 dark:from-emerald-950/80 dark:to-slate-900 border-emerald-500 ring-2 ring-emerald-500/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-purple-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800/60">
                            {entry.day}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                            {entry.className}
                          </span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                          status === 'Ongoing'
                            ? 'bg-emerald-500 text-white animate-pulse shadow-md'
                            : status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {status === 'Ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                          {status === 'Ongoing' ? '🔥 ONGOING NOW' : status === 'Pending' ? '⏳ PENDING' : '✓ COMPLETED'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display font-black text-base text-slate-900 dark:text-white leading-snug">
                          {entry.subject}
                        </h4>
                        <span className="text-[11px] font-mono text-indigo-500 dark:text-purple-400 font-bold block mt-0.5">
                          {entry.slotName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="truncate">{entry.startTime} - {entry.endTime}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate font-bold text-slate-900 dark:text-white">{entry.room}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate font-bold text-amber-600 dark:text-amber-400">{formatTeacherCode(entry.teacher)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate font-bold text-slate-900 dark:text-white">{entry.className}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* CONFIRM DELETION MODAL */}
      <AnimatePresence>
        {deleteConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmModal(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Delete Active Timetable?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete active timetable <strong>"{storedMeta?.fileName}"</strong>? This will clear all data from local storage and database.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setDeleteConfirmModal(false)} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteTimetable} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 text-white shadow-md">
                  Yes, Delete Timetable
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

