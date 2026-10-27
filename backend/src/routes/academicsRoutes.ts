import { Router } from 'express';
import {
  getTimetable,
  getTimetableMeta,
  uploadTimetable,
  deleteTimetable,
  getFacultySchedule,
  getRoomTimeline,
  getVacantVenues,
} from '../controllers/academicsController';

const router = Router();

router.get('/timetable', getTimetable);
router.get('/timetable-meta', getTimetableMeta);
router.post('/upload-timetable', uploadTimetable);
router.delete('/timetable', deleteTimetable);
router.get('/faculty-schedule', getFacultySchedule);
router.get('/room-timeline', getRoomTimeline);
router.get('/vacant-venues', getVacantVenues);

export default router;
