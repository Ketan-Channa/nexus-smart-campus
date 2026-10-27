import { Router } from 'express';
import {
  getAttendanceByClass,
  markAttendance,
  submitMedicalCertificate,
  getPendingMedicalCertificates,
  getFacultyMedicalCertificates,
  getMedicalCertificateDetail,
  verifyMedicalCertificate,
  reviewMedicalCertificate,
  getFacultyOptions,
  getAttendanceRegister,
  markBatchAttendance,
  correctAttendanceStatus,
  getAttendanceSummary,
} from '../controllers/attendanceController';

const router = Router();

// GET /api/attendance?className=...
router.get('/', getAttendanceByClass);

// POST /api/attendance/mark
router.post('/mark', markAttendance);

// Phase 3 — Faculty Attendance Register REST Endpoints
router.get('/faculty/options', getFacultyOptions);
router.get('/register', getAttendanceRegister);
router.post('/mark-batch', markBatchAttendance);
router.put('/correct', correctAttendanceStatus);
router.get('/summary', getAttendanceSummary);

// Medical Certificates & Student Requests REST APIs (Phase 6)
router.post('/medical/submit', submitMedicalCertificate);
router.get('/medical/pending', getPendingMedicalCertificates);
router.get('/medical/list', getFacultyMedicalCertificates);
router.get('/medical/detail/:ref', getMedicalCertificateDetail);
router.post('/medical/verify', verifyMedicalCertificate);
router.post('/medical/review', reviewMedicalCertificate);

export default router;
