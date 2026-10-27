import { Router } from 'express';
import {
  createReport,
  getStudentReports,
  getReportById,
  updateReport,
  submitFeedback,
  triggerEmergency,
  aiDraftReport,
  aiDraftEmail,
  aiImproveReport,
} from '../controllers/studentSafetyController';

const router = Router();

// Student Safety Reports CRUD
router.post('/reports', createReport);
router.get('/reports', getStudentReports);
router.get('/reports/:id', getReportById);
router.put('/reports/:id', updateReport);

// Feedback & Suggestions
router.post('/feedback', submitFeedback);

// Emergency SOS Alert
router.post('/emergency', triggerEmergency);

// AI Safety Assistant Services
router.post('/ai/draft-report', aiDraftReport);
router.post('/ai/draft-email', aiDraftEmail);
router.post('/ai/improve-report', aiImproveReport);

export default router;
