import { Router } from 'express';
import {
  aiStudentAssistant,
  aiOrganizeNote,
  generateSelfTest,
  startSelfTest,
  logTestViolation,
  submitSelfTest,
  applyForDigitalCard,
  getStudentDigitalCards,
} from '../controllers/studentUtilitiesController';

const router = Router();

router.post('/ai/assistant', aiStudentAssistant);
router.post('/ai/organize-note', aiOrganizeNote);

router.post('/tests/generate', generateSelfTest);
router.post('/tests/:id/start', startSelfTest);
router.post('/tests/:id/violation', logTestViolation);
router.post('/tests/:id/submit', submitSelfTest);

// Digital Passes & Cards (Fest Cards, ID Cards, Outing/Visitor Passes)
router.post('/cards/apply', applyForDigitalCard);
router.get('/cards', getStudentDigitalCards);

export default router;

