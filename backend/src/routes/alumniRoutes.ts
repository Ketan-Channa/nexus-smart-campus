import { Router } from 'express';
import { registerUser } from '../controllers/authController';
import {
  getAlumniDirectory,
  getAlumniProfile,
  getVerificationStatus,
  updateAlumniProfile,
  addExperience,
  deleteExperience,
  addAchievement,
  deleteAchievement,
  requestMentorship,
  getMentorshipRequests,
  respondMentorship,
  scheduleMentorshipSession,
  getMentorshipSessions,
  updateMentorshipSessionStatus,
  getJobs,
  postJob,
  updateJobStatus,
  requestReferral,
  getReferrals,
  respondReferral,
  getEvents,
  createEvent,
  rsvpEvent,
  getEventRsvps,
  proposeGuestLecture,
  getGuestLectures,
  updateGuestLectureStatus,
  submitContribution,
  getContributions,
  createCollaboration,
  getCollaborations,
  respondCollaboration,
  addDocument,
  getDocuments,
  deleteDocument,
  getAdminAlumniList,
  updateAlumniVerificationStatus,
  getAlumniAnalytics,
  generateAlumniAiAssistant,
} from '../controllers/alumniController';

const router = Router();

// Registration & Profile Routes
router.post('/register', (req, res) => {
  req.body.role = 'Alumni';
  registerUser(req, res);
});
router.get('/directory', getAlumniDirectory);
router.get('/profile/:emailOrId', getAlumniProfile);
router.get('/profile', getAlumniProfile);
router.get('/verification-status/:email', getVerificationStatus);
router.put('/profile', updateAlumniProfile);

// Experience & Achievements
router.post('/experiences', addExperience);
router.delete('/experiences/:id', deleteExperience);
router.post('/achievements', addAchievement);
router.delete('/achievements/:id', deleteAchievement);

// Mentorship
router.post('/mentorship/request', requestMentorship);
router.get('/mentorship/requests', getMentorshipRequests);
router.put('/mentorship/respond', respondMentorship);
router.post('/mentorship/respond', respondMentorship);
router.post('/mentorship/sessions', scheduleMentorshipSession);
router.post('/mentorship/sessions/schedule', scheduleMentorshipSession);
router.get('/mentorship/sessions', getMentorshipSessions);
router.put('/mentorship/sessions/:sessionId/status', updateMentorshipSessionStatus);

// Job Board & Referrals
router.get('/jobs', getJobs);
router.post('/jobs', postJob);
router.post('/jobs/create', postJob);
router.put('/jobs/:jobId', updateJobStatus);
router.post('/referrals/request', requestReferral);
router.get('/referrals', getReferrals);
router.put('/referrals/:referralId/respond', respondReferral);
router.post('/referrals/respond', respondReferral);

// Events & RSVPs
router.get('/events', getEvents);
router.post('/events', createEvent);
router.post('/events/create', createEvent);
router.post('/events/:eventId/rsvp', rsvpEvent);
router.post('/events/rsvp', rsvpEvent);
router.get('/events/:eventId/rsvps', getEventRsvps);

// Guest Lectures & Campus Engagement
router.post('/guest-lectures', proposeGuestLecture);
router.post('/guest-lectures/submit', proposeGuestLecture);
router.get('/guest-lectures', getGuestLectures);
router.put('/guest-lectures/:lectureId/status', updateGuestLectureStatus);

// Contributions & Volunteering
router.post('/contributions', submitContribution);
router.get('/contributions', getContributions);

// Collaborations & Research
router.post('/collaborations/invite', createCollaboration);
router.get('/collaborations', getCollaborations);
router.put('/collaborations/:collabId/respond', respondCollaboration);
router.post('/research/create', createCollaboration);
router.post('/research/request', (req, res) => {
  req.body.alumniEmail = req.body.applicantEmail || req.body.alumniEmail || 'faculty@nexus.campus.edu';
  createCollaboration(req, res);
});
router.get('/research/projects', getCollaborations);

// Documents & Certificates
router.post('/documents', addDocument);
router.post('/documents/upload', addDocument);
router.get('/documents', getDocuments);
router.delete('/documents/:id', deleteDocument);

// Admin Control Routes
router.get('/admin/list', getAdminAlumniList);
router.put('/admin/verify', updateAlumniVerificationStatus);
router.post('/admin/verify', updateAlumniVerificationStatus);
router.get('/admin/analytics', getAlumniAnalytics);
router.get('/analytics', getAlumniAnalytics);

// AI Assistant Route
router.post('/ai-assistant', generateAlumniAiAssistant);

export default router;
