import { Router } from 'express';
import {
  getParentChildren,
  requestLinkChild,
  getParentDashboard,
  getChildAcademics,
  getChildAttendance,
  getChildExamsAndResults,
  getChildAssignments,
  getParentMeetings,
  requestParentMeeting,
  respondParentMeeting,
  getChildApprovals,
  consentChildApproval,
  getChildSafetyAlerts,
  getChildFeesAndPayments,
  payChildFee,
  getChildHostelAndTransport,
  getParentFeedback,
  submitParentFeedback,
  getParentEvents,
  rsvpParentInvitation,
  getParentProfile,
  updateParentProfile,
  getParentAlumniCareer,
  getParentAnnouncements,
  getParentNotifications,
  getParentFacultyDirectory,
} from '../controllers/parentController';

const router = Router();

// Multi-Child & Profile Routes
router.get('/children', getParentChildren);
router.post('/children/link', requestLinkChild);
router.get('/profile', getParentProfile);
router.put('/profile', updateParentProfile);

// Dashboard
router.get('/dashboard', getParentDashboard);

// Academics, Attendance, Exams, Assignments
router.get('/academics/timetable', getChildAcademics);
router.get('/timetable', getChildAcademics);

router.get('/academics/attendance', getChildAttendance);
router.get('/attendance', getChildAttendance);

router.get('/academics/exams', getChildExamsAndResults);
router.get('/exams', getChildExamsAndResults);
router.get('/results', getChildExamsAndResults);

router.get('/academics/assignments', getChildAssignments);
router.get('/assignments', getChildAssignments);

// Parent-Faculty Meetings & Appointments
router.get('/meetings', getParentMeetings);
router.post('/meetings/request', requestParentMeeting);
router.put('/meetings/:meetingId/respond', respondParentMeeting);
router.post('/meetings/respond', respondParentMeeting);

// Approvals & Consents
router.get('/approvals', getChildApprovals);
router.post('/approvals/consent', consentChildApproval);
router.post('/approvals/endorse', consentChildApproval);

// Student Safety
router.get('/safety', getChildSafetyAlerts);

// Finance & Fee Payments
router.get('/finance/payments', getChildFeesAndPayments);
router.get('/payments', getChildFeesAndPayments);
router.post('/finance/pay', payChildFee);
router.post('/payments/pay', payChildFee);

// Services (Hostel & Transport)
router.get('/services/hostel-transport', getChildHostelAndTransport);
router.get('/hostel-transport', getChildHostelAndTransport);

// Feedback & Suggestions
router.get('/feedback', getParentFeedback);
router.post('/feedback', submitParentFeedback);

// Events & Invitations
router.get('/events', getParentEvents);
router.post('/events/:invitationId/rsvp', rsvpParentInvitation);
router.post('/events/rsvp', rsvpParentInvitation);

// Announcements & Campus Updates
router.get('/announcements', getParentAnnouncements);

// Notifications Feed
router.get('/notifications', getParentNotifications);

// Faculty Directory for active child
router.get('/faculty-directory', getParentFacultyDirectory);

// Alumni, Mentorship & Career Guidance for Parents/Students
router.get('/alumni-career', getParentAlumniCareer);

export default router;
